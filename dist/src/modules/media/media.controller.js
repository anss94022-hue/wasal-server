"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = uploadMedia;
exports.downloadMedia = downloadMedia;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const uploadDir = node_path_1.default.resolve("uploads");
function uploadMedia(req, res) {
    if (!req.file) {
        res.status(400).json({
            success: false,
            error: "FILE_REQUIRED",
        });
        return;
    }
    res.status(201).json({
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/api/media/${encodeURIComponent(req.file.filename)}`,
    });
}
function downloadMedia(req, res) {
    const rawFilename = req.params.filename;
    if (typeof rawFilename !== "string" ||
        rawFilename.length === 0) {
        res.status(400).json({
            success: false,
            error: "INVALID_FILENAME",
        });
        return;
    }
    const filename = node_path_1.default.basename(rawFilename);
    if (filename !== rawFilename ||
        filename.includes("..") ||
        filename.includes("/") ||
        filename.includes("\\")) {
        res.status(400).json({
            success: false,
            error: "INVALID_FILENAME",
        });
        return;
    }
    const filePath = node_path_1.default.join(uploadDir, filename);
    if (!node_fs_1.default.existsSync(filePath)) {
        res.status(404).json({
            success: false,
            error: "FILE_NOT_FOUND",
        });
        return;
    }
    const stat = node_fs_1.default.statSync(filePath);
    if (!stat.isFile()) {
        res.status(404).json({
            success: false,
            error: "FILE_NOT_FOUND",
        });
        return;
    }
    res.sendFile(filePath);
}
