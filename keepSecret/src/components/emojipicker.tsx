

export const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '😮', '😢', '🎉', '💡', '💯', '💀', '🚀', '✨'];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  positionClass?: string; // Positioning adjustments (e.g., above or below)
}


export const EmojiPickerPopover = ({ onSelect, onClose, positionClass = "bottom-10 left-0" }: EmojiPickerProps) => {
  return (
    <>
      {/* Click outside backdrop */}
      <div className="fixed inset-0 " onClick={onClose} />

      <div className={`absolute z-50 animate-emoji-picker-in p-2 bg-amber-800   rounded-2xl shadow-xl grid grid-cols-6 gap-1 w-52 backdrop-blur-md ${positionClass}`}>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="p-1.5 rounded-md text-xl transition-transform hover:scale-125 active:scale-95 text-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};