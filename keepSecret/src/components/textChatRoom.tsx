import { useEffect, useState, useRef } from "react";
import { TypingIndicator } from "./typingBox.tsx";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { ChatInput } from "./chatinput.tsx";
import { MessageBubble } from "./messagearr.tsx";

interface Message {
  id: string;
  content: string;
  sender: "user" | "stranger";
  
  reactions?: Record<string, number>;
}

export default function ChatRoom() {
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<string>("Searching for a stranger...");
  const [activeUsers, setActiveUsers] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageArray, isTyping]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/text");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      if (event.data === "typing") {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return;
      }
      try {
        const data = JSON.parse(event.data);
        if (data.type === "online_count") {
          setActiveUsers(data.count);
          return;
        }
      } catch (err) {
        // Handle plain string events
      }

      if (
        event.data.includes("disconnected") ||
        event.data.includes("left") ||
        event.data.includes("Searching")
      ) {
        setConnStatus(event.data);
        return;
      }

      if (event.data === "Connected to a random stranger! Say hi!") {
        setConnStatus(event.data);
        return;
      }

      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      const incomingMsg: Message = {
        id: Date.now().toString() + Math.random(),
        content: event.data,
        sender: "stranger",
        reactions: {},
      };

      setMessageArray((prev) => [...prev, incomingMsg]);
    };

    return () => {
      ws.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleInputChange = (_text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("typing");
    }
  };

  const handleSkip = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("/skip");
      setMessageArray([]);
      setIsTyping(false);
      setConnStatus("Searching for a stranger...");
    }
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(textToSend);

      const userMessage: Message = {
        id: Date.now().toString() + Math.random(),
        content: textToSend,
        sender: "user",
        reactions: {},
      };

      setMessageArray((prev) => [...prev, userMessage]);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessageArray((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const updatedReactions = { ...(msg.reactions || {}) };
        updatedReactions[emoji] = (updatedReactions[emoji] || 0) + 1;
        return { ...msg, reactions: updatedReactions };
      })
    );
  };

  return (
    <div className="h-screen w-5/6 bg-amber-400 p-3 rounded-lg shadow-md relative flex flex-col justify-between m-auto">
      <header className="w-full h-1/12 flex p-3 items-center justify-between bg-amber-800 rounded-lg">
        <div className="status flex gap-1 text-[#FFE66D] font-bold">
          {connStatus}
          {connStatus.includes("Searching") || connStatus.includes("disconnected") ? (
            <Loader className="animate-spin" />
          ) : (
            ""
          )}
        </div>
        <div className="text-white font-bold">online : {activeUsers}</div>
      </header>

      {/* Message Feed */}
      <div className="messages flex-1 flex flex-col gap-1 p-1 mb-1 overflow-hidden">
  {messageArray.map((msg) => {
    const isUser = msg.sender === "user";

    return (
      <div
        key={msg.id}
        className={`group relative my-0.5 p-2 w-fit max-w-md rounded-2xl animate-[slideUp_0.25s_ease-out] ${
          isUser
            ? "ms-auto bg-amber-700 text-white rounded-br-none"
            : "me-auto bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        <MessageBubble message={msg} onReact={handleReact} />
      </div>
    );
  })}


        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>


      <div className="message flex items-center gap-2">
        <button
          type="button"
          onClick={handleSkip}
          className="h-10 px-4 rounded-md bg-red-600 flex items-center text-white text-center"
        >
          Skip
        </button>
        <button
          type="button"
          className="bg-[#CBF3F0] h-10 px-4 rounded-md flex items-center text-gray-800 text-center"
          onClick={() => setActiveUsers(activeUsers - 1)}
        >
          <Link to="/home">Leave</Link>
        </button>

        <ChatInput onSend={handleSendMessage} onChange={handleInputChange} />
      </div>
    </div>
  );
}