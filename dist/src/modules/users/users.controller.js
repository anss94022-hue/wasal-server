"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdController = getUserByIdController;
exports.getUserByPhoneController = getUserByPhoneController;
exports.getUserByUsernameController = getUserByUsernameController;
exports.getUserByWasalCodeController = getUserByWasalCodeController;
exports.updateMyDisplayNameController = updateMyDisplayNameController;
const users_service_js_1 = require("./users.service.js");
const WASAL_CODE_REGEX = /^[A-Za-z0-9]{15}$/;
function toPublicUser(user) {
    return {
        id: user.id,
        wasalCode: user.wasalCode,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
async function getUserByIdController(req, res) {
    try {
        const id = String(req.params.id ?? "").trim();
        if (!id) {
            res.status(400).json({ error: "USER_ID_REQUIRED" });
            return;
        }
        const user = await (0, users_service_js_1.getUserById)(id);
        if (!user) {
            res.status(404).json({ error: "USER_NOT_FOUND" });
            return;
        }
        res.status(200).json({ user: toPublicUser(user) });
    }
    catch (error) {
        console.error("Get user by ID failed:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
async function getUserByPhoneController(req, res) {
    try {
        const phone = String(req.query.phone ?? "").trim();
        if (!phone) {
            res.status(400).json({ error: "PHONE_REQUIRED" });
            return;
        }
        const user = await (0, users_service_js_1.getUserByPhone)(phone);
        if (!user) {
            res.status(404).json({ error: "USER_NOT_FOUND" });
            return;
        }
        res.status(200).json({ user: toPublicUser(user) });
    }
    catch (error) {
        console.error("Search user by phone failed:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
async function getUserByUsernameController(req, res) {
    try {
        const username = String(req.query.username ?? "").trim();
        if (!username) {
            res.status(400).json({ error: "USERNAME_REQUIRED" });
            return;
        }
        const user = await (0, users_service_js_1.getUserByUsername)(username);
        if (!user) {
            res.status(404).json({ error: "USER_NOT_FOUND" });
            return;
        }
        res.status(200).json({ user: toPublicUser(user) });
    }
    catch (error) {
        console.error("Search user by username failed:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
async function getUserByWasalCodeController(req, res) {
    try {
        const wasalCode = String(req.query.wasalCode ?? "").trim();
        if (!wasalCode) {
            res.status(400).json({ error: "WASAL_CODE_REQUIRED" });
            return;
        }
        if (!WASAL_CODE_REGEX.test(wasalCode)) {
            res.status(400).json({ error: "INVALID_WASAL_CODE" });
            return;
        }
        const user = await (0, users_service_js_1.getUserByWasalCode)(wasalCode);
        if (!user) {
            res.status(404).json({ error: "USER_NOT_FOUND" });
            return;
        }
        res.status(200).json({ user: toPublicUser(user) });
    }
    catch (error) {
        console.error("Search user by Wasal code failed:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
}
async function updateMyDisplayNameController(req, res) {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({
            success: false,
            error: "AUTH_REQUIRED",
        });
        return;
    }
    const rawName = req.body?.displayName;
    if (typeof rawName !== "string" || !rawName.trim()) {
        res.status(400).json({
            success: false,
            error: "DISPLAY_NAME_REQUIRED",
        });
        return;
    }
    const displayName = rawName.trim();
    if (displayName.length > 40) {
        res.status(400).json({
            success: false,
            error: "DISPLAY_NAME_TOO_LONG",
        });
        return;
    }
    try {
        const user = await (0, users_service_js_1.updateMyDisplayName)(userId, displayName);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "USER_NOT_FOUND",
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: toPublicUser(user),
        });
    }
    catch (error) {
        console.error("Update display name failed:", error);
        res.status(500).json({
            success: false,
            error: "DISPLAY_NAME_UPDATE_FAILED",
        });
    }
}
