import type { Message } from '../../types/type';
import { useChatStore } from '../store/usechatstore';

interface MessageProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageProps) => {
  const removeReaction = useChatStore((s) => s.removeReaction);

  return (
    <div
      className={`${message.sender === 'user'
          ? 'bg-amber-700 text-amber-300 rounded-br-none'
          : 'bg-white text-amber-700 rounded-bl-none'
        } rounded-xl flex flex-col justify-center p-2 w-fit`}
    >
      {message.replyTo && (
        <div
          className="mb-1 pl-2 border-l-4 border-amber-600 bg-black/10 rounded-sm py-1 pr-2 cursor-pointer"
          onClick={() => {
            document
              .getElementById(`msg-${message.replyTo!.id}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          <div className="text-xs font-bold opacity-80">
            {message.replyTo.sender === 'user' ? 'You' : 'Stranger'}
          </div>
          <div className="text-sm opacity-90 truncate">
            {message.replyTo.content}
          </div>
        </div>
      )}

      
        <p className="text-sm sm:text-base whitespace-pre-wrap break-words ">
          {message.content}
        </p>
    

      {(message.reactions?.user || message.reactions?.stranger) && (
        <div className="relative animate-emoji-pop h-7 w-7 bg-amber-400 rounded-full flex -bottom-3 items-center">
          {message.reactions?.user && (
            <button
              type="button"
              onClick={() => removeReaction(message.id)}
              className="inline-flex items-center bg-amber-800 border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full"
            >
              <span className="leading-none text-sm">
                {message.reactions.user}
              </span>
            </button>
          )}
          {message.reactions?.stranger && (
            <button
              type="button"
              className="inline-flex items-center bg-white border-amber-400 border-2 justify-center h-8 min-w-8 px-1.5 gap-1 rounded-full"
            >
              <span className="leading-none text-sm">
                {message.reactions.stranger}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};