"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const vitest_1 = require("vitest");
const socket_io_1 = require("socket.io");
const socket_io_client_1 = require("socket.io-client");
vitest_1.vi.mock("../../src/modules/auth/tokens.js", () => ({
    verifyToken: vitest_1.vi.fn((token) => ({
        userId: token,
    })),
}));
const socket_js_1 = require("../../src/realtime/socket.js");
(0, vitest_1.describe)("Socket call signaling", () => {
    let httpServer;
    let ioServer;
    let caller;
    let receiver;
    let attacker;
    (0, vitest_1.afterEach)(async () => {
        vitest_1.vi.useRealTimers();
        caller?.disconnect();
        receiver?.disconnect();
        attacker?.disconnect();
        ioServer?.close();
        await new Promise((resolve) => {
            if (!httpServer?.listening) {
                resolve();
                return;
            }
            httpServer.close(() => resolve());
        });
        caller = undefined;
        receiver = undefined;
        attacker = undefined;
        ioServer = undefined;
        httpServer = undefined;
    });
    async function createConnectedClients() {
        httpServer = (0, node_http_1.createServer)();
        ioServer = new socket_io_1.Server(httpServer, {
            transports: ["websocket"],
        });
        (0, socket_js_1.setupSocket)(ioServer);
        await new Promise((resolve) => {
            httpServer.listen(0, "127.0.0.1", () => resolve());
        });
        const address = httpServer.address();
        if (!address || typeof address === "string") {
            throw new Error("SERVER_ADDRESS_UNAVAILABLE");
        }
        const port = address.port;
        caller = (0, socket_io_client_1.io)(`http://127.0.0.1:${port}`, {
            auth: {
                token: "caller-1",
            },
            transports: ["websocket"],
        });
        receiver = (0, socket_io_client_1.io)(`http://127.0.0.1:${port}`, {
            auth: {
                token: "receiver-1",
            },
            transports: ["websocket"],
        });
        await Promise.all([
            new Promise((resolve, reject) => {
                caller.once("connect", () => resolve());
                caller.once("connect_error", reject);
            }),
            new Promise((resolve, reject) => {
                receiver.once("connect", () => resolve());
                receiver.once("connect_error", reject);
            }),
        ]);
        return {
            caller,
            receiver,
        };
    }
    async function createAttacker() {
        if (!httpServer) {
            throw new Error("SERVER_NOT_STARTED");
        }
        const address = httpServer.address();
        if (!address || typeof address === "string") {
            throw new Error("SERVER_ADDRESS_UNAVAILABLE");
        }
        attacker = (0, socket_io_client_1.io)(`http://127.0.0.1:${address.port}`, {
            auth: {
                token: "attacker-1",
            },
            transports: ["websocket"],
        });
        await new Promise((resolve, reject) => {
            attacker.once("connect", () => resolve());
            attacker.once("connect_error", reject);
        });
        return attacker;
    }
    async function startAudioCall() {
        const incomingCall = new Promise((resolve) => {
            receiver.once("call:incoming", resolve);
        });
        caller.emit("call:start", {
            receiverId: "receiver-1",
            type: "audio",
        });
        const call = await incomingCall;
        (0, vitest_1.expect)(call.callId).toBeTruthy();
        (0, vitest_1.expect)(call.callerId).toBe("caller-1");
        (0, vitest_1.expect)(call.receiverId).toBe("receiver-1");
        (0, vitest_1.expect)(call.type).toBe("audio");
        (0, vitest_1.expect)(call.status).toBe("ringing");
        return call.callId;
    }
    function expectNoEvent(socket, eventName, trigger) {
        return new Promise((resolve, reject) => {
            let received = false;
            const handler = () => {
                received = true;
            };
            socket.once(eventName, handler);
            trigger();
            setTimeout(() => {
                socket.off(eventName, handler);
                if (received) {
                    reject(new Error(`UNAUTHORIZED_EVENT_RECEIVED:${eventName}`));
                    return;
                }
                resolve();
            }, 150);
        });
    }
    (0, vitest_1.it)("sends an incoming call to the receiver", async () => {
        await createConnectedClients();
        await startAudioCall();
    });
    (0, vitest_1.it)("sends an incoming video call to the receiver", async () => {
        await createConnectedClients();
        const incomingCall = new Promise((resolve) => {
            receiver.once("call:incoming", resolve);
        });
        caller.emit("call:start", {
            receiverId: "receiver-1",
            type: "video",
        });
        const call = await incomingCall;
        (0, vitest_1.expect)(call.callId).toBeTruthy();
        (0, vitest_1.expect)(call.callerId).toBe("caller-1");
        (0, vitest_1.expect)(call.receiverId).toBe("receiver-1");
        (0, vitest_1.expect)(call.type).toBe("video");
        (0, vitest_1.expect)(call.status).toBe("ringing");
    });
    (0, vitest_1.it)("notifies the caller when the receiver accepts", async () => {
        await createConnectedClients();
        const callId = await startAudioCall();
        const accepted = new Promise((resolve) => {
            caller.once("call:accept", resolve);
        });
        receiver.emit("call:accept", callId);
        const event = await accepted;
        (0, vitest_1.expect)(event.callId).toBe(callId);
        (0, vitest_1.expect)(event.userId).toBe("receiver-1");
    });
    (0, vitest_1.it)("notifies the caller when the receiver rejects", async () => {
        await createConnectedClients();
        const callId = await startAudioCall();
        const rejected = new Promise((resolve) => {
            caller.once("call:reject", resolve);
        });
        receiver.emit("call:reject", callId);
        const event = await rejected;
        (0, vitest_1.expect)(event.callId).toBe(callId);
        (0, vitest_1.expect)(event.userId).toBe("receiver-1");
    });
    (0, vitest_1.it)("notifies the receiver when the caller ends the call", async () => {
        await createConnectedClients();
        const callId = await startAudioCall();
        const ended = new Promise((resolve) => {
            receiver.once("call:end", resolve);
        });
        caller.emit("call:end", callId);
        const event = await ended;
        (0, vitest_1.expect)(event.callId).toBe(callId);
        (0, vitest_1.expect)(event.userId).toBe("caller-1");
    });
    (0, vitest_1.it)("forwards a WebRTC offer from the caller to the receiver", async () => {
        await createConnectedClients();
        const callId = await startAudioCall();
        receiver.emit("call:accept", callId);
        await new Promise((resolve) => setTimeout(resolve, 20));
        const offerReceived = new Promise((resolve) => {
            receiver.once("call:offer", resolve);
        });
        caller.emit("call:offer", {
            callId,
            callerId: "caller-1",
            receiverId: "receiver-1",
            type: "audio",
            offer: {
                type: "offer",
                sdp: "test-offer-sdp",
            },
        });
        const event = await offerReceived;
        (0, vitest_1.expect)(event.callId).toBe(callId);
        (0, vitest_1.expect)(event.callerId).toBe("caller-1");
        (0, vitest_1.expect)(event.receiverId).toBe("receiver-1");
        (0, vitest_1.expect)(event.type).toBe("audio");
        (0, vitest_1.expect)(event.offer.type).toBe("offer");
        (0, vitest_1.expect)(event.offer.sdp).toBe("test-offer-sdp");
    });
    (0, vitest_1.it)("forwards a WebRTC video offer from the caller to the receiver", async () => {
        await createConnectedClients();
        const incomingCall = new Promise((resolve) => {
            receiver.once("call:incoming", resolve);
        });
        caller.emit("call:start", {
            receiverId: "receiver-1",
            type: "video",
        });
        const call = await incomingCall;
        receiver.emit("call:accept", call.callId);
        await new Promise((resolve) => setTimeout(resolve, 20));
        const offerReceived = new Promise((resolve) => {
            receiver.once("call:offer", resolve);
        });
        caller.emit("call:offer", {
            callId: call.callId,
            callerId: "caller-1",
            receiverId: "receiver-1",
            type: "video",
            offer: {
                type: "offer",
                sdp: "test-video-offer-sdp",
            },
        });
        const event = await offerReceived;
        (0, vitest_1.expect)(event.callId).toBe(call.callId);
        (0, vitest_1.expect)(event.callerId).toBe("caller-1");
        (0, vitest_1.expect)(event.receiverId).toBe("receiver-1");
        (0, vitest_1.expect)(event.type).toBe("video");
        (0, vitest_1.expect)(event.offer.type).toBe("offer");
        (0, vitest_1.expect)(event.offer.sdp).toBe("test-video-offer-sdp");
    });
    (0, vitest_1.it)("forwards a WebRTC answer from the receiver to the caller", async () => {
        await createConnectedClients();
        const callId = await startAudioCall();
        receiver.emit("call:accept", callId);
        await new Promise((resolve) => setTimeout(resolve, 20));
        const answerReceived = new Promise((resolve) => {
            caller.once("call:answer", resolve);
        });
        receiver.emit("call:answer", {
            callId,
            answer: {
                type: "answer",
                sdp: "test-answer-sdp",
            },
        });
        const event = await answerReceived;
        (0, vitest_1.expect)(event.callId).toBe(callId);
        (0, vitest_1.expect)(event.answer.type).toBe("answer");
        (0, vitest_1.expect)(event.answer.sdp).toBe("test-answer-sdp");
    });
    (0, vitest_1.it)("forwards an ICE candidate to the other participant", async () => {
        await createConnectedClients();
        const callId = await startAudioCall();
        receiver.emit("call:accept", callId);
        await new Promise((resolve) => setTimeout(resolve, 20));
        const candidateReceived = new Promise((resolve) => {
            receiver.once("call:ice-candidate", resolve);
        });
        caller.emit("call:ice-candidate", {
            callId,
            candidate: {
                candidate: "candidate:test",
                sdpMid: "0",
                sdpMLineIndex: 0,
            },
        });
        const event = await candidateReceived;
        (0, vitest_1.expect)(event.callId).toBe(callId);
        (0, vitest_1.expect)(event.candidate.candidate).toBe("candidate:test");
        (0, vitest_1.expect)(event.candidate.sdpMid).toBe("0");
        (0, vitest_1.expect)(event.candidate.sdpMLineIndex).toBe(0);
    });
    (0, vitest_1.it)("does not allow a different user to accept the call", async () => {
        await createConnectedClients();
        await createAttacker();
        const callId = await startAudioCall();
        await expectNoEvent(caller, "call:accept", () => {
            attacker.emit("call:accept", callId);
        });
    });
    (0, vitest_1.it)("does not allow a different user to reject the call", async () => {
        await createConnectedClients();
        await createAttacker();
        const callId = await startAudioCall();
        await expectNoEvent(caller, "call:reject", () => {
            attacker.emit("call:reject", callId);
        });
    });
    (0, vitest_1.it)("does not allow a different user to end the call", async () => {
        await createConnectedClients();
        await createAttacker();
        const callId = await startAudioCall();
        await expectNoEvent(receiver, "call:end", () => {
            attacker.emit("call:end", callId);
        });
    });
    (0, vitest_1.it)("does not allow a different user to send a WebRTC offer", async () => {
        await createConnectedClients();
        await createAttacker();
        const callId = await startAudioCall();
        await expectNoEvent(receiver, "call:offer", () => {
            attacker.emit("call:offer", {
                callId,
                callerId: "attacker-1",
                receiverId: "receiver-1",
                type: "audio",
                offer: {
                    type: "offer",
                    sdp: "unauthorized-offer",
                },
            });
        });
    });
    (0, vitest_1.it)("does not allow the caller to send a WebRTC answer", async () => {
        await createConnectedClients();
        const callId = await startAudioCall();
        await expectNoEvent(caller, "call:answer", () => {
            caller.emit("call:answer", {
                callId,
                answer: {
                    type: "answer",
                    sdp: "unauthorized-answer",
                },
            });
        });
    });
    (0, vitest_1.it)("does not allow a different user to send an ICE candidate", async () => {
        await createConnectedClients();
        await createAttacker();
        const callId = await startAudioCall();
        await expectNoEvent(receiver, "call:ice-candidate", () => {
            attacker.emit("call:ice-candidate", {
                callId,
                candidate: {
                    candidate: "unauthorized-candidate",
                    sdpMid: "0",
                    sdpMLineIndex: 0,
                },
            });
        });
    });
    (0, vitest_1.it)("marks an unanswered call as missed after the ringing timeout", async () => {
        await createConnectedClients();
        const incomingCall = new Promise((resolve) => {
            receiver.once("call:incoming", resolve);
        });
        const missedCall = new Promise((resolve) => {
            caller.once("call:end", resolve);
        });
        caller.emit("call:start", {
            receiverId: "receiver-1",
            type: "audio",
        });
        const call = await incomingCall;
        (0, vitest_1.expect)(call.callId).toBeTruthy();
        (0, vitest_1.expect)(call.status).toBe("ringing");
        const missed = await missedCall;
        (0, vitest_1.expect)(missed.callId).toBe(call.callId);
        (0, vitest_1.expect)(missed.userId).toBe("system");
    }, 35000);
});
