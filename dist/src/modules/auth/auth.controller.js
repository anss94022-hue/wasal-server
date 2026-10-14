"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.refreshController = refreshController;
const auth_service_js_1 = require("./auth.service.js");
async function registerController(req, res) {
    try {
        const body = req.body ?? {};
        const rawDisplayName = body.displayName ??
            body.display_name ??
            body.name;
        const displayName = typeof rawDisplayName === "string" &&
            rawDisplayName.trim()
            ? rawDisplayName.trim()
            : "مستخدم وصال";
        const result = await (0, auth_service_js_1.register)({
            displayName,
        });
        res.status(201).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "";
        // يظهر السبب الحقيقي في سجلات الخادم فقط.
        console.error("Wasal account registration failed:", error);
        if (message === "DISPLAY_NAME_REQUIRED") {
            res.status(400).json({
                success: false,
                error: message,
            });
            return;
        }
        if (message === "DISPLAY_NAME_TOO_LONG") {
            res.status(400).json({
                success: false,
                error: message,
            });
            return;
        }
        if (message === "WASAL_CODE_GENERATION_FAILED") {
            res.status(503).json({
                success: false,
                error: message,
            });
            return;
        }
        if (message.includes("duplicate key") ||
            message.includes("unique constraint")) {
            res.status(409).json({
                success: false,
                error: "ACCOUNT_CONFLICT",
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "ACCOUNT_CREATION_FAILED",
        });
    }
}
async function loginController(req, res) {
    try {
        const { phone, password } = req.body ?? {};
        if (typeof phone !== "string" ||
            typeof password !== "string" ||
            !phone ||
            !password) {
            res.status(400).json({
                success: false,
                error: "PHONE_PASSWORD_REQUIRED",
            });
            return;
        }
        const result = await (0, auth_service_js_1.login)({
            phone,
            password,
        });
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "INVALID_CREDENTIALS") {
            res.status(401).json({
                success: false,
                error: "INVALID_CREDENTIALS",
            });
            return;
        }
        console.error("Wasal login failed:", error);
        res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR",
        });
    }
}
async function refreshController(req, res) {
    try {
        const { refreshToken } = req.body ?? {};
        if (typeof refreshToken !== "string" ||
            !refreshToken) {
            res.status(400).json({
                success: false,
                error: "REFRESH_TOKEN_REQUIRED",
            });
            return;
        }
        const result = await (0, auth_service_js_1.refreshAccessToken)(refreshToken);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("Wasal token refresh failed:", error);
        res.status(401).json({
            success: false,
            error: "INVALID_OR_EXPIRED_REFRESH_TOKEN",
        });
    }
}
