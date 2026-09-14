import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.CORS_ORIGIN === "*"
        ? true
        : process.env.CORS_ORIGIN
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit("server:ready", {
    service: "wasal-server"
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Wasal server listening on port ${port}`);
});
