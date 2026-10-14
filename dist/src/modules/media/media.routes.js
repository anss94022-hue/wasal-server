"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = require("node:crypto");
const media_controller_js_1 = require("./media.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
const uploadDir = node_path_1.default.resolve("uploads");
if (!node_fs_1.default.existsSync(uploadDir)) {
    node_fs_1.default.mkdirSync(uploadDir, {
        recursive: true,
    });
}
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "application/pdf",
    "application/zip",
    "application/octet-stream",
    "text/plain",
]);
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const extension = node_path_1.default
            .extname(file.originalname)
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, "");
        const filename = `${Date.now()}-${(0, node_crypto_1.randomUUID)()}` +
            extension;
        cb(null, filename);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new Error("UNSUPPORTED_FILE_TYPE"));
            return;
        }
        cb(null, true);
    },
});
router.post("/upload", auth_js_1.requireAuth, upload.single("file"), media_controller_js_1.uploadMedia);
router.get("/:filename", auth_js_1.requireAuth, media_controller_js_1.downloadMedia);
exports.default = router;
