import {
  createPrivateConversation,
  findConversationById,
  isConversationMember,
} from "./conversations.repository.js";

import { findUserByWasalCode } from "../users/users.repository.js";

export async function getConversationById(
  id: string,
) {
  return findConversationById(id);
}

export async function createPrivateChat(
  userId: string,
  wasalCode: string,
) {
  const normalizedCode =
    wasalCode.trim();

  if (!/^\d{5}$/.test(normalizedCode)) {
    throw new Error(
      "INVALID_WASAL_CODE",
    );
  }

  const otherUser =
    await findUserByWasalCode(
      normalizedCode,
    );

  if (!otherUser) {
    throw new Error(
      "USER_NOT_FOUND",
    );
  }

  if (userId === otherUser.id) {
    throw new Error(
      "CANNOT_CHAT_WITH_SELF",
    );
  }

  return createPrivateConversation(
    userId,
    otherUser.id,
  );
}

export async function checkConversationMember(
  conversationId: string,
  userId: string,
) {
  return isConversationMember(
    conversationId,
    userId,
  );
}
