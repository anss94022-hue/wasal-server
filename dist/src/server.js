"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const socket_io_1 = require("socket.io");
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const socket_js_1 = require("./realtime/socket.js");
const app = (0, app_js_1.createApp)();
const httpServer = node_http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_js_1.env.corsOrigin === "*"
            ? true
            : env_js_1.env.corsOrigin,
    },
});
(0, socket_js_1.setupSocket)(io);
httpServer.listen(env_js_1.env.port, () => {
    console.log(`Wasal server running on port ${env_js_1.env.port}`);
});
