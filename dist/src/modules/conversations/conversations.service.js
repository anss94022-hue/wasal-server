"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationById = getConversationById;
exports.getUserConversations = getUserConversations;
exports.createPrivateChat = createPrivateChat;
exports.checkConversationMember = checkConversationMember;
const conversations_repository_js_1 = require("./conversations.repository.js");
const users_repository_js_1 = require("../users/users.repository.js");
const WASAL_CODE_REGEX = /^[A-Za-z0-9]{15}$/;
async function getConversationById(id, userId) {
    const isMember = await (0, conversations_repository_js_1.isConversationMember)(id, userId);
    if (!isMember) {
        return null;
    }
    return (0, conversations_repository_js_1.findConversationById)(id);
}
async function getUserConversations(userId) {
    return (0, conversations_repository_js_1.listUserConversations)(userId);
}
async function createPrivateChat(userId, wasalCode) {
    const normalizedCode = wasalCode.trim();
    if (!WASAL_CODE_REGEX.test(normalizedCode)) {
        throw new Error("INVALID_WASAL_CODE");
    }
    const otherUser = await (0, users_repository_js_1.findUserByWasalCode)(normalizedCode);
    if (!otherUser) {
        throw new Error("USER_NOT_FOUND");
    }
    if (userId === otherUser.id) {
        throw new Error("CANNOT_CHAT_WITH_SELF");
    }
    return (0, conversations_repository_js_1.createPrivateConversation)(userId, otherUser.id);
}
async function checkConversationMember(conversationId, userId) {
    return (0, conversations_repository_js_1.isConversationMember)(conversationId, userId);
}
