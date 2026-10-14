"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callStore = exports.CallStore = void 0;
const node_crypto_1 = require("node:crypto");
class CallStore {
    sessions = new Map();
    create(callerId, receiverId, type) {
        if (callerId === receiverId) {
            throw new Error("CALL_SELF_NOT_ALLOWED");
        }
        const session = {
            callId: (0, node_crypto_1.randomUUID)(),
            callerId,
            receiverId,
            type,
            status: "ringing",
            createdAt: new Date(),
        };
        this.sessions.set(session.callId, session);
        return session;
    }
    get(callId) {
        return this.sessions.get(callId);
    }
    getActiveForUser(userId) {
        return [
            ...this.sessions.values(),
        ].filter((call) => (call.status === "ringing" ||
            call.status === "accepted") &&
            (call.callerId === userId ||
                call.receiverId === userId));
    }
    updateStatus(callId, status) {
        const session = this.sessions.get(callId);
        if (!session) {
            return undefined;
        }
        session.status = status;
        if (status === "accepted") {
            session.answeredAt =
                new Date();
        }
        if (status === "rejected" ||
            status === "ended" ||
            status === "missed") {
            session.endedAt =
                new Date();
        }
        return session;
    }
    delete(callId) {
        return this.sessions.delete(callId);
    }
}
exports.CallStore = CallStore;
exports.callStore = new CallStore();
