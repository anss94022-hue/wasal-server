"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshAccessToken = refreshAccessToken;
const node_crypto_1 = require("node:crypto");
const auth_repository_js_1 = require("./auth.repository.js");
const tokens_js_1 = require("./tokens.js");
const users_repository_js_1 = require("../users/users.repository.js");
const password_js_1 = require("./password.js");
const WASAL_CODE_LENGTH = 15;
const WASAL_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
/**
 * إنشاء رمز وصال عشوائي من 15 حرفًا أو رقمًا.
 */
function generateWasalCode() {
    let code = "";
    for (let index = 0; index < WASAL_CODE_LENGTH; index++) {
        code += WASAL_CODE_ALPHABET[(0, node_crypto_1.randomInt)(0, WASAL_CODE_ALPHABET.length)];
    }
    return code;
}
/**
 * البحث عن رمز غير مستخدم.
 * قيد UNIQUE في قاعدة البيانات يظل ضروريًا لمنع التكرار.
 */
async function createUniqueWasalCode() {
    for (let attempt = 0; attempt < 100; attempt++) {
        const wasalCode = generateWasalCode();
        const existingUser = await (0, users_repository_js_1.findUserByWasalCode)(wasalCode);
        if (!existingUser) {
            return wasalCode;
        }
    }
    throw new Error("WASAL_CODE_GENERATION_FAILED");
}
async function register(input) {
    const displayName = input.displayName?.trim();
    if (!displayName) {
        throw new Error("DISPLAY_NAME_REQUIRED");
    }
    if (displayName.length > 80) {
        throw new Error("DISPLAY_NAME_TOO_LONG");
    }
    const wasalCode = await createUniqueWasalCode();
    const user = await (0, auth_repository_js_1.createAuthUser)(displayName, wasalCode);
    const tokens = (0, tokens_js_1.createTokens)(user.id);
    return {
        user: {
            id: user.id,
            phone: user.phone,
            username: user.username,
            wasalCode: user.wasalCode,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        },
        tokens,
    };
}
/**
 * تسجيل الدخول للحسابات التي تستخدم الهاتف وكلمة المرور.
 */
async function login(input) {
    if (!input.phone || !input.password) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const user = await (0, users_repository_js_1.findUserByPhone)(input.phone);
    if (!user || !user.passwordHash) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const validPassword = (0, password_js_1.verifyPassword)(input.password, user.passwordHash);
    if (!validPassword) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const tokens = (0, tokens_js_1.createTokens)(user.id);
    return {
        user: {
            id: user.id,
            phone: user.phone,
            username: user.username,
            wasalCode: user.wasalCode,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        },
        tokens,
    };
}
/**
 * تجديد accessToken وrefreshToken.
 */
async function refreshAccessToken(refreshToken) {
    const payload = (0, tokens_js_1.verifyRefreshToken)(refreshToken);
    const tokens = (0, tokens_js_1.createTokens)(payload.userId);
    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    };
}
