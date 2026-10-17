import  { useState } from 'react';
import { EmojiPickerPopover } from './emojipicker';
import { FaceSlightlySmiling } from 'lucide-react';

interface MessageProps {
  message: {
    id: string;
    content: string;
    reactions?: Record<string, number>;
  };
  onReact: (messageId: string, emoji: string) => void;
}

export const MessageBubble = ({ message, onReact }: MessageProps) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      {/* Message Text */}
      <p>{message.content}</p>

      {/* Render Active Reactions Below Message */}
     {message.reactions && Object.keys(message.reactions).length > 0 && (
  <div className="flex flex-wrap gap-1 mt-1">
    {Object.entries(message.reactions).map(([emoji]) => (
      <button
        key={emoji}
        onClick={() => onReact(message.id, emoji)}
        className="flex items-center bg-amber-300 hover:bg-amber-500 border border-slate-600 px-2 py-0.5 rounded-full text-xs transition-colors"
      >
        <span>{emoji}</span>
      </button>
    ))}
  </div>
)}

      {/* Action Button: Shows on Hover */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="absolute -right-9 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1  rounded-full text-xs text-amber-700"
        title="Add reaction"
      >
        <FaceSlightlySmiling/>
      </button>

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