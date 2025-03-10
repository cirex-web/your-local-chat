import http from "http";
import { Server } from "socket.io";
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", (message) => {
    console.log(message);
    io.emit("message", `${socket.id.substring(0, 2)} said ${message}`);
  });
});

httpServer.listen(8080, () =>
  console.log("listening on http://localhost:8080")
);
