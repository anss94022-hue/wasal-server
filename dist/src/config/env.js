"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function getEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.env = {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: getEnv("JWT_SECRET"),
    corsOrigin: process.env.CORS_ORIGIN ?? "*",
    databaseUrl: getEnv("DATABASE_URL")
};
