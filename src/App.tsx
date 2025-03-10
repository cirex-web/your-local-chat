import { useEffect, useMemo, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { io } from "socket.io-client";
function App() {
  const socket = useMemo(() => io("ws://localhost:8080"), []);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const onEvent = (text: string) =>
      setMessages((messages) => [...messages, text]);
    // socket.on("connect", onConnect);
    // socket.on("disconnect", onDisconnect);
    socket.on("message", onEvent);

    return () => {
      // socket.off("connect", onConnect);
      // socket.off("disconnect", onDisconnect);
      socket.off("message", onEvent);
    };
  }, [socket]);

  return (
    <>
      <div className="outer-container">
        <div className="message-container">
          {messages.map((message) => (
            <div className="message">{message}</div>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            const message = (event.target as HTMLInputElement).message.value;
            (event.target as HTMLFormElement).reset();
            console.log(message);

            socket.emit("message", message);
            event.preventDefault();
          }}
        >
          <input type="text" name="message" />
        </form>
      </div>
    </>
  );
}

export default App;
