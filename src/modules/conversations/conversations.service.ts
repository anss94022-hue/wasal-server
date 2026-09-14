import {
  createPrivateConversation,
  findConversationById,
  isConversationMember
} from "./conversations.repository.js";

export async function getConversationById(id: string) {
  return findConversationById(id);
}

export async function createPrivateChat(
  userId: string,
  otherUserId: string
) {
  if (userId === otherUserId) {
    throw new Error("CANNOT_CHAT_WITH_SELF");
  }

  return createPrivateConversation(userId, otherUserId);
}

export async function checkConversationMember(
  conversationId: string,
  userId: string
) {
  return isConversationMember(conversationId, userId);
}
