"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.getUserByPhone = getUserByPhone;
exports.getUserByUsername = getUserByUsername;
exports.getUserByWasalCode = getUserByWasalCode;
exports.updateMyDisplayName = updateMyDisplayName;
const users_repository_js_1 = require("./users.repository.js");
async function getUserById(id) {
    return (0, users_repository_js_1.findUserById)(id);
}
async function getUserByPhone(phone) {
    return (0, users_repository_js_1.findUserByPhone)(phone);
}
async function getUserByUsername(username) {
    return (0, users_repository_js_1.findUserByUsername)(username);
}
async function getUserByWasalCode(wasalCode) {
    return (0, users_repository_js_1.findUserByWasalCode)(wasalCode);
}
async function updateMyDisplayName(userId, displayName) {
    const cleanName = displayName.trim();
    if (!cleanName) {
        throw new Error("DISPLAY_NAME_REQUIRED");
    }
    if (cleanName.length > 40) {
        throw new Error("DISPLAY_NAME_TOO_LONG");
    }
    return (0, users_repository_js_1.updateUserDisplayName)(userId, cleanName);
}
