"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_js_1 = require("./config/env.js");
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const users_routes_js_1 = __importDefault(require("./modules/users/users.routes.js"));
const conversations_routes_js_1 = __importDefault(require("./modules/conversations/conversations.routes.js"));
const messages_routes_js_1 = __importDefault(require("./modules/messages/messages.routes.js"));
const media_routes_js_1 = __importDefault(require("./modules/media/media.routes.js"));
const calls_history_js_1 = require("./modules/calls/calls.history.js");
const auth_js_1 = require("./middleware/auth.js");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: env_js_1.env.corsOrigin === "*"
            ? true
            : env_js_1.env.corsOrigin,
    }));
    app.use(express_1.default.json({
        limit: "1mb",
    }));
    app.get("/health", (_req, res) => {
        res.status(200).json({
            status: "ok",
            service: "wasal-server",
        });
    });
    app.use("/api/auth", auth_routes_js_1.default);
    app.use("/api/users", auth_js_1.requireAuth, users_routes_js_1.default);
    app.use("/api/conversations", auth_js_1.requireAuth, conversations_routes_js_1.default);
    app.use("/api/messages", auth_js_1.requireAuth, messages_routes_js_1.default);
    app.use("/api/calls", auth_js_1.requireAuth, async (req, res) => {
        // استجابة ثابتة كانت تُخفي سجل المكالمات الحقيقي.
        try {
            const calls = await (0, calls_history_js_1.listCallHistory)(String(req.userId));
            res.status(200).json({
                success: true,
                calls,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: "CALL_HISTORY_FAILED",
                message: error.message,
            });
        }
    });
    app.use("/api/media", media_routes_js_1.default);
    return app;
}
