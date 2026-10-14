"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const call_events_js_1 = require("../../src/calls/call.events.js");
(0, vitest_1.describe)("CALL_EVENTS", () => {
    (0, vitest_1.it)("defines the incoming call event", () => {
        (0, vitest_1.expect)(call_events_js_1.CALL_EVENTS.INCOMING).toBe("call:incoming");
    });
    (0, vitest_1.it)("defines the accept event", () => {
        (0, vitest_1.expect)(call_events_js_1.CALL_EVENTS.ACCEPT).toBe("call:accept");
    });
    (0, vitest_1.it)("defines the reject event", () => {
        (0, vitest_1.expect)(call_events_js_1.CALL_EVENTS.REJECT).toBe("call:reject");
    });
    (0, vitest_1.it)("defines the end event", () => {
        (0, vitest_1.expect)(call_events_js_1.CALL_EVENTS.END).toBe("call:end");
    });
    (0, vitest_1.it)("defines the WebRTC offer event", () => {
        (0, vitest_1.expect)(call_events_js_1.CALL_EVENTS.OFFER).toBe("call:offer");
    });
    (0, vitest_1.it)("defines the WebRTC answer event", () => {
        (0, vitest_1.expect)(call_events_js_1.CALL_EVENTS.ANSWER).toBe("call:answer");
    });
    (0, vitest_1.it)("defines the ICE candidate event", () => {
        (0, vitest_1.expect)(call_events_js_1.CALL_EVENTS.ICE_CANDIDATE).toBe("call:ice-candidate");
    });
});
