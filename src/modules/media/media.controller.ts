import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";

const uploadDir = path.resolve("uploads");

export function uploadMedia(
  req: Request,
  res: Response
): void {
  if (!req.file) {
    res.status(400).json({
      error: "FILE_REQUIRED"
    });
    return;
  }

  res.status(201).json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    url: `/api/media/${req.file.filename}`
  });
}

export function downloadMedia(
  req: Request,
  res: Response
): void {
  const filename = path.basename(
    req.params.filename
  );

  const filePath = path.join(
    uploadDir,
    filename
  );

  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      error: "FILE_NOT_FOUND"
    });
    return;
  }

  res.sendFile(filePath);
}
