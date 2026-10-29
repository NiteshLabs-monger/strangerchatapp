
import { useEffect, useState, useRef } from "react";
import { TypingIndicator } from "./typingBox.tsx";
import { Link } from "react-router-dom";
import { Loader, Circle } from "lucide-react";
import { ChatInput } from "./chatinput.tsx";
import { MessageBubble } from "./messagearr.tsx";
import { type Message} from "../../types/type.ts"

export default function ChatRoom() {
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<string>("Searching for a stranger...");
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [sendDisable,setSendDisable] = useState<boolean>(true);

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
    const ws = new WebSocket("https://strangerchatapp.vercel.app/text");
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
    event.data.includes("Searching") 
  ) {
    setConnStatus(event.data);
    return;
  }

  if(event.data ==="Connected to a random stranger! Say hi!"){
    setConnStatus(event.data)
    setSendDisable(false)
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
                stranger:data.emoji
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

      case "remove-reaction" :
         setMessageArray((prev) =>
          prev.map((msg) => {
          
            if (msg.id !== data.messageId) return msg;
          
           const current = msg.reactions ?? {};
            return {
              ...msg,
              reactions: {
                ...current,
                stranger:undefined
              },
            };
          })
        );
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
        reactions: {...current, user : emoji},
      };
    })
  );

  wsRef.current.send(JSON.stringify({ type: "reaction", messageId, emoji }));

};

 const removeReaction = (messageId: string) => {
  if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

   setMessageArray(prev =>
    prev.map(m => {
      if (m.id !== messageId) return m;
      const current = m.reactions ?? {};
      return {
        ...m,
        reactions: { ...current, user: ""},
      };
    })
  );


  wsRef.current.send(JSON.stringify({ type: "remove-reaction", messageId }));

};

  return(
    <div className="h-[100dvh] w-full sm:max-w-6xl bg-amber-400 sm:p-3 rounded-none sm:rounded-lg shadow-md flex flex-col mx-auto overflow-y-auto">

      {/* ───── Header ───── */}
      <header className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-amber-800 rounded-none sm:rounded-lg shrink-0">
        {/* status — truncated on small screens so it doesn't push the online count off */}
        <div className="status flex items-center gap-2 text-[#FFE66D] font-bold min-w-0">
          <span className="truncate text-sm sm:text-base">{connStatus}</span>
          {(connStatus.includes("Searching") || connStatus.includes("disconnected")) && (
            <Loader className="animate-spin shrink-0" size={24} />
          )}
        </div>

        {/* online count — always visible, never shrinks */}
        <div className="text-white font-bold flex gap-1 items-center shrink-0">
          <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500 animate-pulse" />
          <span className="text-sm sm:text-base tabular-nums">{activeUsers}</span>
        </div>
      </header>

      {/* ───── Message feed ───── */}
      <div className="messages flex-1 flex flex-col gap-1 px-2 sm:px-4 py-2 mb-1 overflow-y-auto overflow-x-hidden min-h-0">
        {messageArray.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`group relative flex my-0.5 mb-2 gap-1 animate-[slideUp_0.25s_ease-out] max-w-[85%] sm:max-w-md lg:max-w-lg ${
                isUser
                  ? "self-end"
                  : "self-start"
              }`}
            >
              <MessageBubble
                message={msg}
                onReact={handleReact}
                onReply={(n) => setReplyingTo(n)}
                removeReaction={removeReaction}
              />
            </div>
          );
        })}

        {isTyping && (
          <div className="self-start px-2 bg-white rounded-2xl rounded-bl-none shadow-sm">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ───── Reply preview ───── */}
      {replyingTo && (
        <div className="flex items-center animate-quote-in gap-2 mx-2 sm:mx-4 mb-1 px-3 py-2 bg-amber-200/70 rounded-md border-l-4 border-amber-700 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-amber-900">
              {replyingTo.sender === "user" ? "You" : "Stranger"}
            </div>
            <div className="text-sm text-gray-800 truncate">{replyingTo.content}</div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-amber-900 font-bold text-lg px-2 shrink-0"
            title="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {/* ───── Composer ───── */}
      {/* Mobile: buttons on top row, input below full-width.
          Desktop (sm+): buttons left, input fills remaining space. */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-3 border-t border-amber-500/40 shrink-0">
        <div className="flex gap-2 sm:gap-2">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 sm:flex-none h-10 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Skip
          </button>
           <button
            type="button"
            className="flex-1 sm:flex-none h-10 px-4 rounded-md bg-[#CBF3F0] hover:bg-[#b8e6e2] text-gray-800 text-sm font-medium transition-colors"
            onClick={() => setActiveUsers(activeUsers - 1)}
          >
            <Link to="/">Leave</Link>
          </button>
        </div>
          




        <div className="flex-1 min-w-0">
          <ChatInput onSend={handleSendMessage} onChange={handleInputChange}  sendDisable={sendDisable}/>
        </div>
      </div>
    </div>

  
  );
}