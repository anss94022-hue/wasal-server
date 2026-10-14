"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const node_crypto_1 = require("node:crypto");
function hashPassword(password) {
    return (0, node_crypto_1.createHash)("sha256").update(password, "utf8").digest("hex");
}
function verifyPassword(password, passwordHash) {
    const actual = Buffer.from(hashPassword(password), "utf8");
    const expected = Buffer.from(passwordHash, "utf8");
    if (actual.length !== expected.length) {
        return false;
    }
    return (0, node_crypto_1.timingSafeEqual)(actual, expected);
}
