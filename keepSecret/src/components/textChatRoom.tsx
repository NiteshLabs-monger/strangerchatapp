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
  replyTo?: {                         // ← new
    id: string;
    content: string;
    sender: "user" | "stranger";
  };
}

export default function ChatRoom() {
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<string>("Searching for a stranger...");
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

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
  // Plain-string "typing" ping
  if (event.data === "typing") {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    return;
  }

  // Status messages from the server
  if (
    event.data.includes("disconnected") ||
    event.data.includes("left") ||
    event.data.includes("Searching") ||
    event.data === "Connected to a random stranger! Say hi!"
  ) {
    setConnStatus(event.data);
    return;
  }

  // Try JSON first
  let data: any = null;
  try {
    data = JSON.parse(event.data);
  } catch {
    // Not JSON → it's a plain text message from the stranger
  }

  if (data) {
    switch (data.type) {
      case "online_count":
        setActiveUsers(data.count);
        return;

      case "reaction": {
        setMessageArray((prev) =>
          prev.map((msg) => {
          
            if (msg.id !== data.messageId) return msg;
          
            const current = msg.reactions ?? {};
            return {
              ...msg,
              reactions: {
                ...current,
                [data.emoji]: (current[data.emoji] ?? 0) + 1,
              },
            };
          })
        );
      
        return;
      }

      case "message":
        // If you ever switch to JSON messages, handle them here
        setMessageArray((prev) => [
          ...prev,
          {
            id: data.id,
            content: data.content,
            sender: "stranger",
            reactions: {},
            replyTo :data.replyTo
          },
        ]);
        return;

      default:
        console.log("unknown JSON event:", data);
        return;
    }
  }

  // Fallback: plain text message from the stranger
  
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
  if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

  const id = crypto.randomUUID();
  const replyTo = replyingTo
    ? { id: replyingTo.id, content: replyingTo.content, sender: replyingTo.sender }
    : undefined;

  wsRef.current.send(
    JSON.stringify({ type: "message", id, content: textToSend, replyTo })
  );

  setMessageArray((prev) => [
    ...prev,
    { id, content: textToSend, sender: "user", reactions: {}, replyTo },
  ]);

  setReplyingTo(null);   // clear after sending
};
  const handleReact = (messageId: string, emoji: string) => {
  if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

  setMessageArray(prev =>
    prev.map(m => {
      if (m.id !== messageId) return m;
      const current = m.reactions ?? {};
      return {
        ...m,
        reactions: { ...current, [emoji]: (current[emoji] ?? 0) + 1 },
      };
    })
  );

  wsRef.current.send(JSON.stringify({ type: "reaction", messageId, emoji }));
  console.log("messsage sent")
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
        id={`msg-${msg.id}`}
        className={`group relative my-0.5 mb-2 p-2 w-fit max-w-md rounded-2xl animate-[slideUp_0.25s_ease-out] ${
          isUser
            ? "ms-auto bg-amber-700 text-white rounded-br-none"
            : "me-auto bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        <MessageBubble
         key={msg.id} 
         message={msg}
         onReact={handleReact}
         onReply={(n) =>{setReplyingTo(n)}}  />
      </div>
    );
  })}


        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      {replyingTo && (
  <div className="flex items-center gap-2 px-3 py-2 mb-1 bg-amber-200/70 rounded-md border-l-4 border-amber-700">
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold text-amber-900">
        {replyingTo.sender === "user" ? "You" : "Stranger"}
      </div>
      <div className="text-sm text-gray-800 truncate">
        {replyingTo.content}
      </div>
    </div>
    <button
      type="button"
      onClick={() => setReplyingTo(null)}
      className="text-amber-900 font-bold text-lg px-2"
      title="Cancel reply"
    >
      ✕
    </button>
  </div>
)}


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