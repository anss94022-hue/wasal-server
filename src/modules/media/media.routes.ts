import { Router } from "express";
import multer from "multer";
import {
  uploadMedia,
  downloadMedia
} from "./media.controller.js";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

router.post(
  "/upload",
  upload.single("file"),
  uploadMedia
);

router.get(
  "/:filename",
  downloadMedia
);

export default router;
