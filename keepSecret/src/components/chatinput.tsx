import React, { useState, useRef } from 'react';
import { EmojiPickerPopover } from './emojipicker';

interface ChatInputProps {
  onSend: (text: string) => void;
  onChange: (text: string) => void;
  sendDisable:boolean;
}

export const ChatInput = ({ onSend, onChange ,sendDisable}: ChatInputProps) => {
  const MAXWORDS = 50;
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    onChange(val); // Triggers your WebSocket "typing" event
  };

  const handleEmojiSelect = (emoji: string) => {
    const newText = text + emoji;
    setText(newText);
    onChange(newText);
    inputRef.current?.focus();
  };

 
const handleSendAction = () => {
  const wordcount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  if (wordcount > MAXWORDS || !text.trim()) {
    if (wordcount > MAXWORDS) {
      alert("Message limit reached! You can only send 50 words at a time.");
    }
    return;
  }

  onSend(text);
  setText('');
};


  return (
    <div className="relative flex items-center gap-2 flex-1">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="p-2 hover:bg-amber-500 rounded-full text-lg transition-colors"
        >
          😊
        </button>

        {showPicker && (
          <EmojiPickerPopover
            onSelect={handleEmojiSelect}
            onClose={() => setShowPicker(false)}
            positionClass="bottom-12 left-0"
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleTextChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !sendDisable) {
            e.preventDefault();
            handleSendAction();
          }
        }}
        placeholder="Type a message..."
        className="flex-1 bg-white text-gray-800 rounded-lg px-4 py-2 border border-amber-600 focus:outline-none"
      />

      <button
        type="button"
        onClick={handleSendAction}
        disabled={sendDisable}
        className="bg-[#DE1A1A] hover:bg-amber-800 text-white px-4 py-2 rounded-md text-sm font-medium transition"
      >
        Send
      </button>
    </div>
  );
};