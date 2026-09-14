import { Server, Socket } from "socket.io";
import { verifyToken } from "../modules/auth/tokens.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
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

    socket.join(`user:${socket.userId}`);

    console.log(
      `User ${socket.userId} connected via socket`
    );

    socket.on("join_conversation", (conversationId: string) => {
      if (!conversationId) {
        return;
      }

      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      if (!conversationId) {
        return;
      }

      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("typing", (conversationId: string) => {
      if (!conversationId) {
        return;
      }

      socket.to(`conversation:${conversationId}`).emit(
        "typing",
        {
          conversationId,
          userId: socket.userId
        }
      );
    });

    socket.on("stop_typing", (conversationId: string) => {
      if (!conversationId) {
        return;
      }

      socket.to(`conversation:${conversationId}`).emit(
        "stop_typing",
        {
          conversationId,
          userId: socket.userId
        }
      );
    });

    socket.on("disconnect", () => {
      console.log(
        `User ${socket.userId} disconnected`
      );
    });
  });
}
