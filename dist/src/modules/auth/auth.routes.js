"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_js_1.registerController);
router.post("/login", auth_controller_js_1.loginController);
router.post("/refresh", auth_controller_js_1.refreshController);
exports.default = router;
