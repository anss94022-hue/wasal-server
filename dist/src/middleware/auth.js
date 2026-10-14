"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const tokens_js_1 = require("../modules/auth/tokens.js");
function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization ||
        !authorization.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            error: "AUTH_REQUIRED",
        });
        return;
    }
    const token = authorization
        .slice("Bearer ".length)
        .trim();
    if (!token) {
        res.status(401).json({
            success: false,
            error: "AUTH_REQUIRED",
        });
        return;
    }
    try {
        const payload = (0, tokens_js_1.verifyToken)(token);
        if (!payload ||
            typeof payload.userId !== "string" ||
            payload.userId.length === 0) {
            res.status(401).json({
                success: false,
                error: "INVALID_OR_EXPIRED_TOKEN",
            });
            return;
        }
        req.userId = payload.userId;
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            error: "INVALID_OR_EXPIRED_TOKEN",
        });
    }
}
