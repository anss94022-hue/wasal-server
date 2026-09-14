import { Server, Socket } from "socket.io";
import { verifyToken } from "../modules/auth/tokens.js";
import { CALL_EVENTS } from "../calls/call.events.js";
import { callStore } from "../calls/call.store.js";
import type {
  CallAnswer,
  CallOffer,
  CallType,
  IceCandidate,
} from "../calls/call.types.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const CALL_RING_TIMEOUT_MS = 30_000;

const callTimers = new Map<
  string,
  ReturnType<typeof setTimeout>
>();

function clearCallTimer(callId: string): void {
  const timer = callTimers.get(callId);

  if (!timer) {
    return;
  }

  clearTimeout(timer);
  callTimers.delete(callId);
}

function scheduleMissedCall(
  io: Server,
  callId: string,
): void {
  clearCallTimer(callId);

  const timer = setTimeout(() => {
    const call = callStore.get(callId);

    if (!call) {
      callTimers.delete(callId);
      return;
    }

    if (call.status !== "ringing") {
      callTimers.delete(callId);
      return;
    }

    const missedCall = callStore.updateStatus(
      callId,
      "missed",
    );

    if (!missedCall) {
      callTimers.delete(callId);
      return;
    }

    io.to(`user:${missedCall.callerId}`).emit(
      CALL_EVENTS.END,
      {
        callId: missedCall.callId,
        userId: "system",
        reason: "missed",
      },
    );

    io.to(`user:${missedCall.receiverId}`).emit(
      CALL_EVENTS.END,
      {
        callId: missedCall.callId,
        userId: "system",
        reason: "missed",
      },
    );

    callStore.delete(callId);
    callTimers.delete(callId);
  }, CALL_RING_TIMEOUT_MS);

  callTimers.set(callId, timer);
}

export function setupSocket(io: Server): void {
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("AUTH_REQUIRED"));
      }

      const payload = verifyToken(String(token));

      socket.userId = payload.userId;

      next();
    } catch {
      next(new Error("INVALID_OR_EXPIRED_TOKEN"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.userId) {
      socket.disconnect();
      return;
    }

    const userId = socket.userId;

    socket.join(`user:${userId}`);

    console.log(
      `User ${userId} connected via socket`,
    );

    // =========================
    // Conversation
    // =========================

    socket.on(
      "join_conversation",
      (conversationId: string) => {
        if (!conversationId) {
          return;
        }

        socket.join(
          `conversation:${conversationId}`,
        );
      },
    );

    socket.on(
      "leave_conversation",
      (conversationId: string) => {
        if (!conversationId) {
          return;
        }

        socket.leave(
          `conversation:${conversationId}`,
        );
      },
    );

    socket.on(
      "typing",
      (conversationId: string) => {
        if (!conversationId) {
          return;
        }

        socket
          .to(`conversation:${conversationId}`)
          .emit("typing", {
            conversationId,
            userId,
          });
      },
    );

    socket.on(
      "stop_typing",
      (conversationId: string) => {
        if (!conversationId) {
          return;
        }

        socket
          .to(`conversation:${conversationId}`)
          .emit("stop_typing", {
            conversationId,
            userId,
          });
      },
    );

    // =========================
    // Start Call
    // =========================

    socket.on(
      "call:start",
      (data: {
        receiverId: string;
        type: CallType;
      }) => {
        if (!data?.receiverId || !data?.type) {
          return;
        }

        if (
          data.type !== "audio" &&
          data.type !== "video"
        ) {
          return;
        }

        try {
          const call = callStore.create(
            userId,
            data.receiverId,
            data.type,
          );

          io.to(`user:${data.receiverId}`).emit(
            CALL_EVENTS.INCOMING,
            {
              callId: call.callId,
              callerId: call.callerId,
              receiverId: call.receiverId,
              type: call.type,
              status: call.status,
              createdAt: call.createdAt,
            },
          );

          scheduleMissedCall(
            io,
            call.callId,
          );
        } catch {
          socket.emit("call:error", {
            code: "CALL_START_FAILED",
          });
        }
      },
    );

    // =========================
    // Accept Call
    // =========================

    socket.on(
      CALL_EVENTS.ACCEPT,
      (callId: string) => {
        const call = callStore.get(callId);

        if (
          !call ||
          call.receiverId !== userId
        ) {
          return;
        }

        clearCallTimer(callId);

        const updatedCall =
          callStore.updateStatus(
            callId,
            "accepted",
          );

        if (!updatedCall) {
          return;
        }

        io.to(
          `user:${updatedCall.callerId}`,
        ).emit(
          CALL_EVENTS.ACCEPT,
          {
            callId: updatedCall.callId,
            userId,
          },
        );
      },
    );

    // =========================
    // Reject Call
    // =========================

    socket.on(
      CALL_EVENTS.REJECT,
      (callId: string) => {
        const call = callStore.get(callId);

        if (
          !call ||
          call.receiverId !== userId
        ) {
          return;
        }

        clearCallTimer(callId);

        const updatedCall =
          callStore.updateStatus(
            callId,
            "rejected",
          );

        if (!updatedCall) {
          return;
        }

        io.to(
          `user:${updatedCall.callerId}`,
        ).emit(
          CALL_EVENTS.REJECT,
          {
            callId: updatedCall.callId,
            userId,
          },
        );

        callStore.delete(callId);
      },
    );

    // =========================
    // End Call
    // =========================

    socket.on(
      CALL_EVENTS.END,
      (callId: string) => {
        const call = callStore.get(callId);

        if (!call) {
          return;
        }

        if (
          call.callerId !== userId &&
          call.receiverId !== userId
        ) {
          return;
        }

        clearCallTimer(callId);

        const updatedCall =
          callStore.updateStatus(
            callId,
            "ended",
          );

        if (!updatedCall) {
          return;
        }

        const otherUserId =
          updatedCall.callerId === userId
            ? updatedCall.receiverId
            : updatedCall.callerId;

        io.to(
          `user:${otherUserId}`,
        ).emit(
          CALL_EVENTS.END,
          {
            callId: updatedCall.callId,
            userId,
            reason: "ended",
          },
        );

        callStore.delete(callId);
      },
    );

    // =========================
    // WebRTC Offer
    // =========================

    socket.on(
      CALL_EVENTS.OFFER,
      (data: CallOffer) => {
        const call = callStore.get(
          data.callId,
        );

        if (!call) {
          return;
        }

        if (
          call.callerId !== userId ||
          call.receiverId !== data.receiverId
        ) {
          return;
        }

        io.to(
          `user:${call.receiverId}`,
        ).emit(
          CALL_EVENTS.OFFER,
          {
            callId: call.callId,
            callerId: call.callerId,
            receiverId: call.receiverId,
            type: call.type,
            offer: data.offer,
          },
        );
      },
    );

    // =========================
    // WebRTC Answer
    // =========================

    socket.on(
      CALL_EVENTS.ANSWER,
      (data: CallAnswer) => {
        const call = callStore.get(
          data.callId,
        );

        if (
          !call ||
          call.receiverId !== userId
        ) {
          return;
        }

        io.to(
          `user:${call.callerId}`,
        ).emit(
          CALL_EVENTS.ANSWER,
          {
            callId: call.callId,
            answer: data.answer,
          },
        );
      },
    );

    // =========================
    // WebRTC ICE Candidate
    // =========================

    socket.on(
      CALL_EVENTS.ICE_CANDIDATE,
      (data: IceCandidate) => {
        const call = callStore.get(
          data.callId,
        );

        if (!call) {
          return;
        }

        const isParticipant =
          call.callerId === userId ||
          call.receiverId === userId;

        if (!isParticipant) {
          return;
        }

        const otherUserId =
          call.callerId === userId
            ? call.receiverId
            : call.callerId;

        io.to(
          `user:${otherUserId}`,
        ).emit(
          CALL_EVENTS.ICE_CANDIDATE,
          {
            callId: call.callId,
            candidate: data.candidate,
          },
        );
      },
    );

    // =========================
    // Disconnect
    // =========================

    socket.on("disconnect", () => {
      console.log(
        `User ${userId} disconnected`,
      );
    });
  });
}
