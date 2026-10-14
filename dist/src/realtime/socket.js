"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const tokens_js_1 = require("../modules/auth/tokens.js");
const conversations_repository_js_1 = require("../modules/conversations/conversations.repository.js");
const call_events_js_1 = require("../calls/call.events.js");
const call_store_js_1 = require("../calls/call.store.js");
const CALL_RING_TIMEOUT_MS = 30_000;
const callTimers = new Map();
function clearCallTimer(callId) {
    const timer = callTimers.get(callId);
    if (!timer) {
        return;
    }
    clearTimeout(timer);
    callTimers.delete(callId);
}
function scheduleMissedCall(io, callId) {
    clearCallTimer(callId);
    const timer = setTimeout(() => {
        const call = call_store_js_1.callStore.get(callId);
        if (!call) {
            callTimers.delete(callId);
            return;
        }
        if (call.status !== "ringing") {
            callTimers.delete(callId);
            return;
        }
        const missedCall = call_store_js_1.callStore.updateStatus(callId, "missed");
        if (!missedCall) {
            callTimers.delete(callId);
            return;
        }
        const payload = {
            callId: missedCall.callId,
            userId: "system",
            reason: "missed",
        };
        io.to(`user:${missedCall.callerId}`).emit(call_events_js_1.CALL_EVENTS.END, payload);
        io.to(`user:${missedCall.receiverId}`).emit(call_events_js_1.CALL_EVENTS.END, payload);
        call_store_js_1.callStore.delete(callId);
        callTimers.delete(callId);
    }, CALL_RING_TIMEOUT_MS);
    callTimers.set(callId, timer);
}
function getUserId(socket) {
    return socket.data.userId;
}
function isCallParticipant(callId, userId) {
    const call = call_store_js_1.callStore.get(callId);
    if (!call) {
        return false;
    }
    return (call.callerId === userId ||
        call.receiverId === userId);
}
function setupSocket(io) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (typeof token !== "string" ||
                token.length === 0) {
                next(new Error("AUTH_REQUIRED"));
                return;
            }
            const payload = (0, tokens_js_1.verifyToken)(token);
            if (!payload?.userId) {
                next(new Error("INVALID_TOKEN"));
                return;
            }
            socket.data.userId = payload.userId;
            next();
        }
        catch {
            next(new Error("INVALID_TOKEN"));
        }
    });
    io.on("connection", (socket) => {
        const userId = getUserId(socket);
        if (!userId) {
            socket.disconnect();
            return;
        }
        socket.join(`user:${userId}`);
        socket.on("conversation:join", async (conversationId) => {
            if (typeof conversationId !== "string" ||
                conversationId.length === 0) {
                return;
            }
            try {
                const member = await (0, conversations_repository_js_1.isConversationMember)(conversationId, userId);
                if (!member) {
                    return;
                }
                socket.join(`conversation:${conversationId}`);
            }
            catch {
                return;
            }
        });
        socket.on("conversation:leave", (conversationId) => {
            if (typeof conversationId !== "string" ||
                conversationId.length === 0) {
                return;
            }
            socket.leave(`conversation:${conversationId}`);
        });
        socket.on("message:send", async (payload) => {
            if (!payload ||
                typeof payload.conversationId !==
                    "string") {
                return;
            }
            try {
                const member = await (0, conversations_repository_js_1.isConversationMember)(payload.conversationId, userId);
                if (!member) {
                    return;
                }
                io
                    .to(`conversation:${payload.conversationId}`)
                    .emit("message:new", payload.message);
            }
            catch {
                return;
            }
        });
        socket.on("typing:start", async (conversationId) => {
            if (typeof conversationId !== "string" ||
                conversationId.length === 0) {
                return;
            }
            try {
                const member = await (0, conversations_repository_js_1.isConversationMember)(conversationId, userId);
                if (!member) {
                    return;
                }
                socket
                    .to(`conversation:${conversationId}`)
                    .emit("typing:start", {
                    userId,
                    conversationId,
                });
            }
            catch {
                return;
            }
        });
        socket.on("typing:stop", async (conversationId) => {
            if (typeof conversationId !== "string" ||
                conversationId.length === 0) {
                return;
            }
            try {
                const member = await (0, conversations_repository_js_1.isConversationMember)(conversationId, userId);
                if (!member) {
                    return;
                }
                socket
                    .to(`conversation:${conversationId}`)
                    .emit("typing:stop", {
                    userId,
                    conversationId,
                });
            }
            catch {
                return;
            }
        });
        socket.on("call:start", (payload) => {
            if (!payload ||
                typeof payload.receiverId !== "string" ||
                (payload.type !== "audio" &&
                    payload.type !== "video")) {
                return;
            }
            if (payload.receiverId === userId) {
                return;
            }
            const call = call_store_js_1.callStore.create(userId, payload.receiverId, payload.type);
            const callPayload = {
                callId: call.callId,
                callerId: call.callerId,
                receiverId: call.receiverId,
                type: call.type,
                status: call.status,
            };
            io.to(`user:${call.callerId}`).emit(call_events_js_1.CALL_EVENTS.STARTED, callPayload);
            io.to(`user:${call.receiverId}`).emit(call_events_js_1.CALL_EVENTS.INCOMING, callPayload);
            scheduleMissedCall(io, call.callId);
        });
        socket.on(call_events_js_1.CALL_EVENTS.ACCEPT, (callId) => {
            if (typeof callId !== "string") {
                return;
            }
            const call = call_store_js_1.callStore.get(callId);
            if (!call ||
                call.receiverId !== userId ||
                call.status !== "ringing") {
                return;
            }
            clearCallTimer(callId);
            const acceptedCall = call_store_js_1.callStore.updateStatus(callId, "accepted");
            if (!acceptedCall) {
                return;
            }
            io.to(`user:${acceptedCall.callerId}`).emit(call_events_js_1.CALL_EVENTS.ACCEPT, {
                callId: acceptedCall.callId,
                userId,
            });
        });
        socket.on(call_events_js_1.CALL_EVENTS.REJECT, (callId) => {
            if (typeof callId !== "string") {
                return;
            }
            const call = call_store_js_1.callStore.get(callId);
            if (!call ||
                call.receiverId !== userId ||
                call.status !== "ringing") {
                return;
            }
            clearCallTimer(callId);
            const rejectedCall = call_store_js_1.callStore.updateStatus(callId, "rejected");
            if (!rejectedCall) {
                return;
            }
            io.to(`user:${rejectedCall.callerId}`).emit(call_events_js_1.CALL_EVENTS.REJECT, {
                callId: rejectedCall.callId,
                userId,
            });
            call_store_js_1.callStore.delete(callId);
        });
        socket.on(call_events_js_1.CALL_EVENTS.END, (callId) => {
            if (typeof callId !== "string") {
                return;
            }
            const call = call_store_js_1.callStore.get(callId);
            if (!call ||
                !isCallParticipant(callId, userId)) {
                return;
            }
            clearCallTimer(callId);
            const endedCall = call_store_js_1.callStore.updateStatus(callId, "ended");
            if (!endedCall) {
                return;
            }
            const otherUserId = endedCall.callerId === userId
                ? endedCall.receiverId
                : endedCall.callerId;
            io.to(`user:${otherUserId}`).emit(call_events_js_1.CALL_EVENTS.END, {
                callId: endedCall.callId,
                userId,
                reason: "ended",
            });
            call_store_js_1.callStore.delete(callId);
        });
        socket.on(call_events_js_1.CALL_EVENTS.OFFER, (payload) => {
            if (!payload ||
                typeof payload.callId !== "string" ||
                typeof payload.callerId !== "string" ||
                typeof payload.receiverId !== "string" ||
                (payload.type !== "audio" &&
                    payload.type !== "video") ||
                !payload.offer) {
                return;
            }
            const call = call_store_js_1.callStore.get(payload.callId);
            if (!call ||
                call.status !== "accepted" ||
                call.callerId !== userId ||
                call.callerId !== payload.callerId ||
                call.receiverId !== payload.receiverId ||
                call.type !== payload.type) {
                return;
            }
            io.to(`user:${call.receiverId}`).emit(call_events_js_1.CALL_EVENTS.OFFER, payload);
        });
        socket.on(call_events_js_1.CALL_EVENTS.ANSWER, (payload) => {
            if (!payload ||
                typeof payload.callId !== "string" ||
                !payload.answer) {
                return;
            }
            const call = call_store_js_1.callStore.get(payload.callId);
            if (!call ||
                call.status !== "accepted" ||
                call.receiverId !== userId) {
                return;
            }
            io.to(`user:${call.callerId}`).emit(call_events_js_1.CALL_EVENTS.ANSWER, payload);
        });
        socket.on(call_events_js_1.CALL_EVENTS.ICE_CANDIDATE, (payload) => {
            if (!payload ||
                typeof payload.callId !== "string" ||
                !payload.candidate) {
                return;
            }
            const call = call_store_js_1.callStore.get(payload.callId);
            if (!call ||
                call.status !== "accepted" ||
                !isCallParticipant(payload.callId, userId)) {
                return;
            }
            const otherUserId = call.callerId === userId
                ? call.receiverId
                : call.callerId;
            io.to(`user:${otherUserId}`).emit(call_events_js_1.CALL_EVENTS.ICE_CANDIDATE, payload);
        });
        socket.on("disconnect", () => {
            const activeCalls = call_store_js_1.callStore.getActiveForUser(userId);
            for (const call of activeCalls) {
                clearCallTimer(call.callId);
                const endedCall = call_store_js_1.callStore.updateStatus(call.callId, "ended");
                if (!endedCall) {
                    continue;
                }
                const otherUserId = endedCall.callerId === userId
                    ? endedCall.receiverId
                    : endedCall.callerId;
                io.to(`user:${otherUserId}`).emit(call_events_js_1.CALL_EVENTS.END, {
                    callId: endedCall.callId,
                    userId,
                    reason: "disconnect",
                });
                call_store_js_1.callStore.delete(call.callId);
            }
        });
    });
}
