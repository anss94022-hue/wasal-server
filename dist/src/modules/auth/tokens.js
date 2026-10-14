"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokens = createTokens;
exports.verifyToken = verifyToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../../config/env.js");
function createTokens(userId) {
    const accessToken = jsonwebtoken_1.default.sign({
        userId,
        type: "access",
    }, env_js_1.env.jwtSecret, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({
        userId,
        type: "refresh",
    }, env_js_1.env.jwtSecret, {
        expiresIn: "30d",
    });
    return {
        accessToken,
        refreshToken,
    };
}
function parseTokenPayload(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.jwtSecret);
    if (typeof decoded !== "object" ||
        decoded === null) {
        throw new Error("INVALID_TOKEN");
    }
    const payload = decoded;
    /*
     * يدعم رموز خادم وصال الحالي:
     * sub: "123"
     *
     * ويدعم الرموز التي يستخدم فيها الخادم:
     * userId: "123"
     */
    const rawUserId = payload.userId ?? payload.sub;
    const userId = typeof rawUserId === "string"
        ? rawUserId
        : "";
    if (!userId) {
        throw new Error("INVALID_TOKEN");
    }
    /*
     * نسمح فقط بنوعي الرموز المعروفين.
     * الرموز القديمة التي لا تحتوي type
     * تظل مقبولة للتوافق مع الجلسات السابقة.
     */
    let type;
    if (payload.type === "access") {
        type = "access";
    }
    else if (payload.type === "refresh") {
        type = "refresh";
    }
    else if (payload.type === undefined) {
        type = undefined;
    }
    else {
        throw new Error("INVALID_TOKEN_TYPE");
    }
    return {
        userId,
        type,
    };
}
/**
 * يتحقق من رموز الدخول المستخدمة في الطلبات
 * المحمية واتصالات Socket.IO.
 *
 * يدعم userId وsub.
 * لا يقبل رمز التجديد بوصفه رمز دخول.
 */
function verifyToken(token) {
    const payload = parseTokenPayload(token);
    if (payload.type === "refresh") {
        throw new Error("INVALID_ACCESS_TOKEN");
    }
    return {
        userId: payload.userId,
    };
}
/**
 * يتحقق من رموز التجديد فقط.
 */
function verifyRefreshToken(token) {
    const payload = parseTokenPayload(token);
    if (payload.type === "access") {
        throw new Error("INVALID_REFRESH_TOKEN");
    }
    return {
        userId: payload.userId,
    };
}
