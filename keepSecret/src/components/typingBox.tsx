import React from 'react';


export const TypingIndicator: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2 my-2" aria-label="Typing indicator">

      <div className="inline-flex items-center gap-1.5 px-4 py-3 bg-white animate-[slideUp_0.25s_ease-out] rounded-sm w-fit">
        <span className="w-2 h-2 bg-amber-950 rounded-full animate-bounce [animation-delay:-0.32s]" />
        <span className="w-2 h-2 bg-amber-950 rounded-full animate-bounce [animation-delay:-0.16s]" />
        <span className="w-2 h-2 bg-amber-950 rounded-full animate-bounce" />
      </div>

    </div>
  );
};