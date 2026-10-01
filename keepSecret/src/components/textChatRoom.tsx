import { useEffect, useState, useRef } from "react";
import { TypingIndicator } from "./typingBox.tsx";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "stranger";
}

export default function ChatRoom() {
  const [message, setMessage] = useState("");
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<string>(
    "searching for a stranger",
  );
  const [activeUsers, setActiveUsers] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll down whenever messages arrive OR typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messageArray, isTyping]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/text");
    wsRef.current = ws;

    setActiveUsers((prev) => prev + 1);

    ws.onmessage = (event) => {
      // 1. Check if the message is a typing signal
      if (event.data === "typing") {
        setIsTyping(true);

        
        // Clear existing timer and reset typing state after 2 seconds of silence
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return;
      }
      if (event.data == "Connected to a random stranger! Say hi!") {
  
          setConnStatus("connected");
          return;
        }

        if (event.data == "Searching for a stranger...") {
  
          setConnStatus("searching for a stranger...");
          return;
        }

        if (
          event.data.includes("Stranger has disconnected") ||
          event.data.includes("left")
        ) {
          setConnStatus("disconnected");
          return;
        }


      // 2. Hide typing indicator once an actual message arrives
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // 3. Parse incoming text message into a structured Message object
      const incomingMsg: Message = {
        id: Date.now().toString() + Math.random(),
        text: event.data,
        sender: "stranger",
      };

      setMessageArray((prev) => [...prev, incomingMsg]);
    };

    return () => {
      ws.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Optional: Emit typing status to backend when user types
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("typing");
    }
  };
  const handleSkip = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // 1. Send the skip command to the Go backend
      wsRef.current.send("/skip");

      // 2. Clear previous chat history from the screen

      setMessageArray([]);
      // 3. Clear typing indicator and set status back to searching
      setIsTyping(false);
      setConnStatus("searching");
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);

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
    <div className="h-screen w-5/6 bg-amber-400 p-3 rounded-lg shadow-md relative flex flex-col justify-between m-auto">
      <header className="w-full h-1/12 flex p-3 items-center justify-between bg-amber-800 rounded-lg">
        <div className="status flex gap-1 text-[#FFE66D] font-bold">{connStatus} 
          {connStatus =="searching for a stranger"? <Loader className="animate-spin"/>:""}
        </div>
        <div className="text-white font-bold">online : {activeUsers}</div>
       
      </header>
      <div className="messages overflow-y-auto flex-1 flex flex-col gap-2 p-1 pr-2 mb-2">
        {messageArray.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } animate-[slideUp_0.25s_ease-out]`}
          >
            <div
              className={`max-w-[75%] px-3 py-1.5 rounded-lg text-sm break-words shadow-sm 
           ${
             msg.sender === "user"
               ? "bg-amber-700 text-white rounded-br-none"
               : "bg-white text-gray-800 rounded-bl-none"
           }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="message flex items-center gap-2">
        <button
          type="button"
          onClick={handleSkip}
          className="h-4/5 p-4  rounded-md bg-red-600 flex items-center text-white text-center "
        >
          Skip
        </button>
        <button type="button" 
        className="bg-[#CBF3F0] h-4/5 p-4  rounded-md flex items-center  text-center"
        onClick={() => setActiveUsers(activeUsers-1)}>
          <Link to="/home">Leave</Link>
          </button>
        <input
          type="text"
          value={message}
          placeholder="Type your message..."
          onChange={handleInputChange}
          className="p-2 rounded-full border-none bg-white outline-none flex-1 text-sm"
        />
        <button
          type="submit"
          className="bg-[#DE1A1A] hover:bg-amber-800 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
