import { Router } from "express";

import {
  getUserByIdController,
  getUserByPhoneController,
  getUserByUsernameController,
  getUserByWasalCodeController,
} from "./users.controller.js";

const router = Router();

router.get(
  "/search/phone",
  getUserByPhoneController
);

router.get(
  "/search/username",
  getUserByUsernameController
);

router.get(
  "/search/wasal-code",
  getUserByWasalCodeController
);

router.get(
  "/:id",
  getUserByIdController
);

export default router;
