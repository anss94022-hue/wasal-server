import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import {
  uploadMedia,
  downloadMedia
} from "./media.controller.js";

const router = Router();

const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}` +
      extension;

    cb(null, filename);
  }
});

const upload = multer({
  storage,
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
