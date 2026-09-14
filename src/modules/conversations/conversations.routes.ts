import { Router } from "express";
import {
  createPrivateConversationController,
  getConversationController
} from "./conversations.controller.js";

const router = Router();

router.post("/", createPrivateConversationController);
router.get("/:id", getConversationController);

export default router;
