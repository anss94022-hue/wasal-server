import { Router } from "express";
import {
  getUserByIdController,
  getUserByPhoneController,
  getUserByUsernameController
} from "./users.controller.js";

const router = Router();

router.get("/:id", getUserByIdController);
router.get("/search/phone", getUserByPhoneController);
router.get("/search/username", getUserByUsernameController);

export default router;
