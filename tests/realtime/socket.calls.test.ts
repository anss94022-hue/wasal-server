import { createServer, type Server as HttpServer } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Server } from "socket.io";
import { io as createClient, type Socket } from "socket.io-client";

vi.mock("../../src/modules/auth/tokens.js", () => ({
  verifyToken: vi.fn((token: string) => ({
    userId: token,
  })),
}));

import { setupSocket } from "../../src/realtime/socket.js";

describe("Socket call signaling", () => {
  let httpServer: HttpServer | undefined;
  let ioServer: Server | undefined;
  let caller: Socket | undefined;
  let receiver: Socket | undefined;

  afterEach(async () => {
    caller?.disconnect();
    receiver?.disconnect();

    ioServer?.close();

    await new Promise<void>((resolve) => {
      if (!httpServer?.listening) {
        resolve();
        return;
      }

      httpServer.close(() => resolve());
    });

    caller = undefined;
    receiver = undefined;
    ioServer = undefined;
    httpServer = undefined;
  });

  async function createConnectedClients(): Promise<{
    caller: Socket;
    receiver: Socket;
  }> {
    httpServer = createServer();

    ioServer = new Server(httpServer, {
      transports: ["websocket"],
    });

    setupSocket(ioServer);

    await new Promise<void>((resolve) => {
      httpServer!.listen(0, "127.0.0.1", () => resolve());
    });

    const address = httpServer.address();

    if (!address || typeof address === "string") {
      throw new Error("SERVER_ADDRESS_UNAVAILABLE");
    }

    const port = address.port;

    caller = createClient(
      `http://127.0.0.1:${port}`,
      {
        auth: {
          token: "caller-1",
        },
        transports: ["websocket"],
      },
    );

    receiver = createClient(
      `http://127.0.0.1:${port}`,
      {
        auth: {
          token: "receiver-1",
        },
        transports: ["websocket"],
      },
    );

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        caller!.once("connect", () => resolve());
        caller!.once("connect_error", reject);
      }),
      new Promise<void>((resolve, reject) => {
        receiver!.once("connect", () => resolve());
        receiver!.once("connect_error", reject);
      }),
    ]);

    return {
      caller,
      receiver,
    };
  }

  async function startAudioCall(): Promise<string> {
    const incomingCall = new Promise<{
      callId: string;
      callerId: string;
      receiverId: string;
      type: string;
      status: string;
    }>((resolve) => {
      receiver!.once("call:incoming", resolve);
    });

    caller!.emit("call:start", {
      receiverId: "receiver-1",
      type: "audio",
    });

    const call = await incomingCall;

    expect(call.callId).toBeTruthy();
    expect(call.callerId).toBe("caller-1");
    expect(call.receiverId).toBe("receiver-1");
    expect(call.type).toBe("audio");
    expect(call.status).toBe("ringing");

    return call.callId;
  }

  it("sends an incoming call to the receiver", async () => {
    await createConnectedClients();

    await startAudioCall();
  });

  it("notifies the caller when the receiver accepts", async () => {
    await createConnectedClients();

    const callId = await startAudioCall();

    const accepted = new Promise<{
      callId: string;
      userId: string;
    }>((resolve) => {
      caller!.once("call:accept", resolve);
    });

    receiver!.emit("call:accept", callId);

    const event = await accepted;

    expect(event.callId).toBe(callId);
    expect(event.userId).toBe("receiver-1");
  });

  it("notifies the caller when the receiver rejects", async () => {
    await createConnectedClients();

    const callId = await startAudioCall();

    const rejected = new Promise<{
      callId: string;
      userId: string;
    }>((resolve) => {
      caller!.once("call:reject", resolve);
    });

    receiver!.emit("call:reject", callId);

    const event = await rejected;

    expect(event.callId).toBe(callId);
    expect(event.userId).toBe("receiver-1");
  });

  it("notifies the receiver when the caller ends the call", async () => {
    await createConnectedClients();

    const callId = await startAudioCall();

    const ended = new Promise<{
      callId: string;
      userId: string;
    }>((resolve) => {
      receiver!.once("call:end", resolve);
    });

    caller!.emit("call:end", callId);

    const event = await ended;

    expect(event.callId).toBe(callId);
    expect(event.userId).toBe("caller-1");
  });
});
