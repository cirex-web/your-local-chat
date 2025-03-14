import http from "http";
import { Server } from "socket.io";
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on(
    "message",
    ({ message, username }: { message: string; username: string }) => {
      io.emit("message", { message, username });
    }
  );
});

httpServer.listen(8080, "0.0.0.0", () =>
  console.log("listening on " + JSON.stringify(httpServer.address()))
);
