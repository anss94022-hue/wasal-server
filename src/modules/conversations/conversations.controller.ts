import { Request, Response } from "express";
import {
  createPrivateChat,
  getConversationById
} from "./conversations.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export async function createPrivateConversationController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        error: "AUTH_REQUIRED"
      });
      return;
    }

    const { otherUserId } = req.body;

    if (!otherUserId) {
      res.status(400).json({
        error: "OTHER_USER_ID_REQUIRED"
      });
      return;
    }

    const conversation = await createPrivateChat(
      req.userId,
      String(otherUserId)
    );

    res.status(201).json({
      conversation
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "CANNOT_CHAT_WITH_SELF") {
      res.status(400).json({
        error: message
      });
      return;
    }

    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR"
    });
  }
}

export async function getConversationController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const conversation = await getConversationById(
      req.params.id
    );

    if (!conversation) {
      res.status(404).json({
        error: "CONVERSATION_NOT_FOUND"
      });
      return;
    }

    res.status(200).json({
      conversation
    });
  } catch {
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR"
    });
  }
}
