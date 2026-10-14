"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messages_controller_js_1 = require("./messages.controller.js");
const router = (0, express_1.Router)();
router.post("/", messages_controller_js_1.sendMessageController);
router.get("/conversation/:conversationId", messages_controller_js_1.getMessagesController);
router.get("/:id", messages_controller_js_1.getMessageByIdController);
exports.default = router;
