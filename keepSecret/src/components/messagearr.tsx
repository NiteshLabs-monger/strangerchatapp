import { useState } from "react";
import { EmojiPickerPopover } from "./emojipicker";
import { FaceSlightlySmiling,Reply } from "lucide-react";

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: "user" | "stranger";
    reactions? : {user?:string,stranger?:string}
    replyTo?: {                                    // ← add this
      id: string;
      content: string;
      sender: "user" | "stranger";
    };
  };
  onReact: (messageId: string, emoji: string) => void;
  onReply: (msg: MessageProps["message"]) => void; 
  removeReaction : (messageId:string) => void
// ← if you added the reply button
}

export const MessageBubble = ({ message, onReact,onReply ,removeReaction }: MessageProps) => {
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
   

   {message.sender==="user"? (
     <div className="absolute -left-16 top-1 flex  gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  <button onClick={() => onReply(message)} title="Reply" className="p-1 rounded-full ">
    <Reply size={20} className="text-amber-800" />
  </button>
  <button onClick={() => setShowPicker((v) => !v)} title="React" className="p-1 rounded-full ">
    <FaceSlightlySmiling size={24}  className="text-amber-800"/>
  </button>
</div>
   ):""}


      <p>{message.content}</p>

      {/* Render Active Reactions Below Message */}
     { (message.reactions?.user || message.reactions?.stranger) && (
        <div className=" relative h-7 w-7  bg-amber-400 rounded-full flex -bottom-3 items-center">
          {message.reactions?.user && (
            <button
              
              type="button"
              onClick={message.reactions.user ? (() => removeReaction(message.id)):undefined}
              
              className={`inline-flex items-center ${message.sender === "user" ? "bg-amber-800 " : "bg-white "} border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full`}
            >
              <span className="leading-none text-sm">{message.reactions?.user}</span>
            </button>)}
            {message.reactions?.stranger && (
            <button
              
              type="button"
            
              
              className={`inline-flex items-center ${message.sender === "user" ? "bg-amber-800 " : "bg-white "} border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full`}
            >
              <span className="leading-none text-sm">{message.reactions?.stranger}</span>
            </button>
          )}
        </div>)}
      

    
      {message.sender === "stranger" && (
        <div className="absolute -right-17 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onReply(message)}
            title="Reply"
            className="rounded-full p-1"
          >
            <Reply size={20} className="text-amber-800" />
          </button>
          <button
            onClick={() => setShowPicker((visible) => !visible)}
            title="React"
            className="rounded-full p-1"
          >
            <FaceSlightlySmiling size={24} className="text-amber-800" />
          </button>
        </div>
      )}

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
