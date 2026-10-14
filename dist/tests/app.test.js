"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_http_1 = __importDefault(require("node:http"));
const app_js_1 = require("../src/app.js");
(0, vitest_1.describe)("Wasal server", () => {
    (0, vitest_1.it)("returns healthy status", async () => {
        const app = (0, app_js_1.createApp)();
        const server = node_http_1.default.createServer(app);
        await new Promise((resolve) => {
            server.listen(0, resolve);
        });
        const address = server.address();
        if (!address || typeof address === "string") {
            server.close();
            throw new Error("SERVER_ADDRESS_UNAVAILABLE");
        }
        try {
            const response = await fetch(`http://127.0.0.1:${address.port}/health`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(await response.json()).toEqual({
                status: "ok",
                service: "wasal-server"
            });
        }
        finally {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        }
    });
});
