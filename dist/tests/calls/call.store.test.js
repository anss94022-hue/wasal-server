"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const call_store_js_1 = require("../../src/calls/call.store.js");
(0, vitest_1.describe)("CallStore", () => {
    (0, vitest_1.it)("creates a ringing call", () => {
        const store = new call_store_js_1.CallStore();
        const call = store.create("caller-1", "receiver-1", "audio");
        (0, vitest_1.expect)(call.callId).toBeTruthy();
        (0, vitest_1.expect)(call.callerId).toBe("caller-1");
        (0, vitest_1.expect)(call.receiverId).toBe("receiver-1");
        (0, vitest_1.expect)(call.type).toBe("audio");
        (0, vitest_1.expect)(call.status).toBe("ringing");
        (0, vitest_1.expect)(call.createdAt).toBeInstanceOf(Date);
    });
    (0, vitest_1.it)("does not allow calling yourself", () => {
        const store = new call_store_js_1.CallStore();
        (0, vitest_1.expect)(() => store.create("user-1", "user-1", "video")).toThrow("CALL_SELF_NOT_ALLOWED");
    });
    (0, vitest_1.it)("updates a call to accepted", () => {
        const store = new call_store_js_1.CallStore();
        const call = store.create("caller-1", "receiver-1", "video");
        const updated = store.updateStatus(call.callId, "accepted");
        (0, vitest_1.expect)(updated?.status).toBe("accepted");
        (0, vitest_1.expect)(updated?.answeredAt).toBeInstanceOf(Date);
        (0, vitest_1.expect)(updated?.endedAt).toBeUndefined();
    });
    (0, vitest_1.it)("updates a call to rejected", () => {
        const store = new call_store_js_1.CallStore();
        const call = store.create("caller-1", "receiver-1", "audio");
        const updated = store.updateStatus(call.callId, "rejected");
        (0, vitest_1.expect)(updated?.status).toBe("rejected");
        (0, vitest_1.expect)(updated?.endedAt).toBeInstanceOf(Date);
    });
    (0, vitest_1.it)("updates a call to ended", () => {
        const store = new call_store_js_1.CallStore();
        const call = store.create("caller-1", "receiver-1", "audio");
        const updated = store.updateStatus(call.callId, "ended");
        (0, vitest_1.expect)(updated?.status).toBe("ended");
        (0, vitest_1.expect)(updated?.endedAt).toBeInstanceOf(Date);
    });
    (0, vitest_1.it)("updates a call to missed", () => {
        const store = new call_store_js_1.CallStore();
        const call = store.create("caller-1", "receiver-1", "video");
        const updated = store.updateStatus(call.callId, "missed");
        (0, vitest_1.expect)(updated?.status).toBe("missed");
        (0, vitest_1.expect)(updated?.endedAt).toBeInstanceOf(Date);
    });
    (0, vitest_1.it)("returns undefined for an unknown call", () => {
        const store = new call_store_js_1.CallStore();
        (0, vitest_1.expect)(store.get("unknown-call")).toBeUndefined();
    });
    (0, vitest_1.it)("returns undefined when updating an unknown call", () => {
        const store = new call_store_js_1.CallStore();
        (0, vitest_1.expect)(store.updateStatus("unknown-call", "accepted")).toBeUndefined();
    });
    (0, vitest_1.it)("deletes a call", () => {
        const store = new call_store_js_1.CallStore();
        const call = store.create("caller-1", "receiver-1", "audio");
        (0, vitest_1.expect)(store.delete(call.callId)).toBe(true);
        (0, vitest_1.expect)(store.get(call.callId)).toBeUndefined();
    });
    (0, vitest_1.it)("returns false when deleting an unknown call", () => {
        const store = new call_store_js_1.CallStore();
        (0, vitest_1.expect)(store.delete("unknown-call")).toBe(false);
    });
});
