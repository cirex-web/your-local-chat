import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import React from "react";

const hostname = import.meta.env.VITE_HOST || window.location.hostname;
const WS_PORT = 8080;
const WS_ADDRESS = `ws://${hostname}:${WS_PORT}`;

function App() {
  const socket = useMemo(() => io(WS_ADDRESS), []);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<
    { username: string; message: string }[]
  >([]);

  const [username, setUsername] = useState("");

  const bottomOfMessages = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onEvent = (payload: { username: string; message: string }) => {
      setMessages((messages) => [...messages, payload]);
    };
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onEvent);
    };
  }, [socket]);
  useEffect(() => {
    bottomOfMessages.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="outer-container">
        <div className="status">
          {isConnected ? "Connected" : "Not connected"} to {WS_ADDRESS}
        </div>
        <div className="message-container">
          <div className="messages">
            {messages.map((message, i) => (
              <div className="message" key={i}>
                <b>{message.username}</b>: {message.message}
              </div>
            ))}
            <div
              className="placeholder-for-bottom"
              ref={bottomOfMessages}
            ></div>
          </div>
          <div className="input-container">
            <input
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              className="input-container__username"
              placeholder="username"
            />
            <form
              onSubmit={(event) => {
                event.preventDefault();

                const formData = new FormData(event.target as HTMLFormElement);
                const message = formData.get("message");
                if (message === null || message === "") return;
                (event.target as HTMLFormElement).reset();

                socket.emit("message", {
                  message,
                  username: username === "" ? "Anon" : username,
                });
              }}
              className="input-container__message"
            >
              <input type="text" name="message" placeholder="message" />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
