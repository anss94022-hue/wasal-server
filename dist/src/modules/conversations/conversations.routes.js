"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversations_controller_js_1 = require("./conversations.controller.js");
const router = (0, express_1.Router)();
// جلب قائمة محادثات المستخدم الحالي
router.get("/", conversations_controller_js_1.listConversationsController);
// إنشاء محادثة خاصة باستخدام رمز وصال
router.post("/", conversations_controller_js_1.createPrivateConversationController);
// جلب محادثة بواسطة المعرّف
router.get("/:id", conversations_controller_js_1.getConversationController);
exports.default = router;
