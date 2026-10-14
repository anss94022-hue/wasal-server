"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getMessages = getMessages;
exports.getMessageById = getMessageById;
const messages_repository_js_1 = require("./messages.repository.js");
const conversations_service_js_1 = require("../conversations/conversations.service.js");
async function sendMessage(userId, conversationId, type, content, replyToId = null) {
    const isMember = await (0, conversations_service_js_1.checkConversationMember)(conversationId, userId);
    if (!isMember) {
        throw new Error("NOT_CONVERSATION_MEMBER");
    }
    return (0, messages_repository_js_1.createMessage)(conversationId, userId, type, content, replyToId);
}
async function getMessages(userId, conversationId, limit = 50) {
    const isMember = await (0, conversations_service_js_1.checkConversationMember)(conversationId, userId);
    if (!isMember) {
        throw new Error("NOT_CONVERSATION_MEMBER");
    }
    return (0, messages_repository_js_1.listMessages)(conversationId, limit);
}
async function getMessageById(userId, messageId) {
    const message = await (0, messages_repository_js_1.findMessageById)(messageId);
    if (!message) {
        throw new Error("MESSAGE_NOT_FOUND");
    }
    const isMember = await (0, conversations_service_js_1.checkConversationMember)(message.conversationId, userId);
    if (!isMember) {
        throw new Error("NOT_CONVERSATION_MEMBER");
    }
    return message;
}
