import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Define message type
interface Message {
  text: string;
  sender: string;
}

const socket = io(
  import.meta.env.MODE === "development"
    ? "/" // will use proxy (to port 5000)
    : import.meta.env.VITE_BACKEND_URL || window.location.origin
);

const Maintenance = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    // When connected
    socket.on("connect", () => {
      console.log("✅ Connected to backend socket:", socket.id);
    });

    // Listen for new chat messages
    socket.on("chat:message", (msg: Message) => {
      console.log("📩 New message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup listeners when component unmounts
    return () => {
      socket.off("chat:message");
      socket.off("connect");
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg: Message = { text, sender: "Pix" };
    socket.emit("chat:message", msg);
    setText("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧠 Maintenance (Socket Test)</h2>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: 10,
          height: 200,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.length === 0 ? (
          <div>No messages yet...</div>
        ) : (
          messages.map((m, i) => (
            <div key={i}>
              <b>{m.sender}</b>: {m.text}
            </div>
          ))
        )}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        style={{ padding: 8, width: "70%" }}
      />
      <button onClick={sendMessage} style={{ padding: 8, marginLeft: 10 }}>
        Send
      </button>
    </div>
  );
};

export default Maintenance;
