import { describe, expect, it } from "vitest";
import { CallStore } from "../../src/calls/call.store.js";

describe("CallStore", () => {
  it("creates a ringing call", () => {
    const store = new CallStore();

    const call = store.create(
      "caller-1",
      "receiver-1",
      "audio",
    );

    expect(call.callId).toBeTruthy();
    expect(call.callerId).toBe("caller-1");
    expect(call.receiverId).toBe("receiver-1");
    expect(call.type).toBe("audio");
    expect(call.status).toBe("ringing");
    expect(call.createdAt).toBeInstanceOf(Date);
  });

  it("does not allow calling yourself", () => {
    const store = new CallStore();

    expect(() =>
      store.create(
        "user-1",
        "user-1",
        "video",
      ),
    ).toThrow("CALL_SELF_NOT_ALLOWED");
  });

  it("updates a call to accepted", () => {
    const store = new CallStore();

    const call = store.create(
      "caller-1",
      "receiver-1",
      "video",
    );

    const updated = store.updateStatus(
      call.callId,
      "accepted",
    );

    expect(updated?.status).toBe("accepted");
    expect(updated?.answeredAt).toBeInstanceOf(Date);
  });

  it("updates a call to ended", () => {
    const store = new CallStore();

    const call = store.create(
      "caller-1",
      "receiver-1",
      "audio",
    );

    const updated = store.updateStatus(
      call.callId,
      "ended",
    );

    expect(updated?.status).toBe("ended");
    expect(updated?.endedAt).toBeInstanceOf(Date);
  });

  it("returns undefined for an unknown call", () => {
    const store = new CallStore();

    expect(
      store.get("unknown-call"),
    ).toBeUndefined();
  });

  it("deletes a call", () => {
    const store = new CallStore();

    const call = store.create(
      "caller-1",
      "receiver-1",
      "audio",
    );

    expect(store.delete(call.callId)).toBe(true);
    expect(store.get(call.callId)).toBeUndefined();
  });
});
