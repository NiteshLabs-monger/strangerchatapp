import { useEffect, useState, useRef } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "stranger";
}

export default function ChatRoom() {
  const [message, setMessage] = useState("");
  const [messageArray, setMessageArray] = useState<Message[]>([]);

  // Ref to persist the WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  
  // Ref to the end of the message container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom whenever new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageArray]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/text");
    wsRef.current = ws;

    // 2. Listen for incoming messages from strangers/server
    ws.onmessage = (event) => {
      const incomingMessage: Message = {
        id: Date.now().toString() + Math.random(),
        text: event.data,
        sender: "stranger",
      };
      setMessageArray((prev) => [...prev, incomingMessage]);
    };

    // 3. Clean up the connection on unmount
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Ensure connection is open before sending
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);

      // Add user message locally
      const userMessage: Message = {
        id: Date.now().toString() + Math.random(),
        text: message,
        sender: "user",
      };

      setMessageArray((prev) => [...prev, userMessage]);
      setMessage("");
    }
  };

  return (
    <div className="h-4/5 w-5/6  bg-amber-400 p-3 rounded-lg shadow-md relative flex flex-col justify-between m-auto">

      <div className="messages overflow-y-auto flex-1 flex flex-col gap-2 p-1 pr-2 mb-2">
        {messageArray.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-3 py-1.5 rounded-lg text-sm break-words shadow-sm ${
                msg.sender === "user"
                  ? "bg-amber-700 text-white rounded-br-none" // Your message (Right side)
                  : "bg-white text-gray-800 rounded-bl-none"  // Stranger message (Left side)
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {/* Invisible element at the bottom to scroll into view */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="message flex items-center gap-2">
        <input
          type="text"
          value={message}
          placeholder="Type your message..."
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 rounded-full border border-gray-300 flex-1 outline-none focus:ring-2 focus:ring-amber-600 text-sm"
        />
        <button
          type="submit"
          className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-full text-sm font-medium transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}