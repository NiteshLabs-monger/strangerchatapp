import { useState } from "react";
import { EmojiPickerPopover } from "./emojipicker";
import { FaceSlightlySmiling,Reply } from "lucide-react";

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: "user" | "stranger";
    reactions?: Record<string, number>;
    replyTo?: {                                    // ← add this
      id: string;
      content: string;
      sender: "user" | "stranger";
    };
  };
  onReact: (messageId: string, emoji: string) => void;
  onReply: (msg: MessageProps["message"]) => void; // ← if you added the reply button
}

export const MessageBubble = ({ message, onReact,onReply }: MessageProps) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
    {message.replyTo && (
  <div
    className="mb-1 pl-2 border-l-4 border-amber-600 bg-black/10 rounded-sm py-1 pr-2 cursor-pointer"
    onClick={() => {
      document
        .getElementById(`msg-${message.replyTo!.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }}
  >
    <div className="text-xs font-bold opacity-80">
      {message.replyTo.sender === "user" ? "You" : "Stranger"}
    </div>
    <div className="text-sm opacity-90 truncate">
      {message.replyTo.content}
    </div>
  </div>
)}


      <p>{message.content}</p>

      {/* Render Active Reactions Below Message */}
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div className=" relative h-7 w-7  bg-amber-400 rounded-full flex -bottom-2 items-center">
          {Object.entries(message.reactions).map(([emoji]) => (
            <button
              key={`${emoji}`}
              type="button"
              onClick={() => onReact(message.id, emoji)}
              className="inline-flex items-center justify-center h-7 min-w-7 px-1.5 gap-1 rounded-full bg-amber-400 border-black"
            >
              <span
                className="flex items-center justify-center leading-none text-sm"
                style={{ lineHeight: 1 }}
              >
                {emoji}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Action Button: Shows on Hover */}
     <div className="absolute -right-17 top-2 flex  gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  <button onClick={() => onReply(message)} title="Reply" className="p-1 rounded-full ">
    <Reply size={20} className="text-amber-800" />
  </button>
  <button onClick={() => setShowPicker((v) => !v)} title="React" className="p-1 rounded-full ">
    <FaceSlightlySmiling size={24}  className="text-amber-800"/>
  </button>
</div>

      {/* Emoji Reaction Popover */}
      {showPicker && (
        <EmojiPickerPopover
          onSelect={(emoji) => onReact(message.id, emoji)}
          onClose={() => setShowPicker(false)}
          positionClass=""
        />
      )}
    </>
  );
};
