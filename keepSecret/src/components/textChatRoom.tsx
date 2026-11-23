import { useEffect, useRef } from 'react';
import { TypingIndicator } from './typingBox.tsx';
import { Link } from 'react-router-dom';
import { Loader, Circle } from 'lucide-react';
import { ChatInput } from './chatinput.tsx';
import { MessageBubble } from './messagearr.tsx';
import ReactionWrapper from './reactionwrapper.tsx';
import { useChatStore, useTouchDeviceStore } from '../store/usechatstore.ts';
import ConnStatusBar from '../mobilecomponents/connstatusbar.tsx';
import { SmoothCountUp } from '../mobilecomponents/numberanimation.tsx';

export default function ChatRoom() {
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const connStatus = useChatStore((s) => s.connStatus);
  const activeUsers = useChatStore((s) => s.activeUsers);
  const replyingTo = useChatStore((s) => s.replyingTo);
  const sendDisable = useChatStore((s) => s.sendDisable);
  const isTouchDevice = useTouchDeviceStore((s) => s.isTouchDevice);

  const connect = useChatStore((s) => s.connect);
  const disconnect = useChatStore((s) => s.disconnect);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendTyping = useChatStore((s) => s.sendTyping);
  const skip = useChatStore((s) => s.skip);
  const setReplyingTo = useChatStore((s) => s.setReplyingTo);
  const reactToMessage = useChatStore((s) => s.reactToMessage);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Use VITE_WS_URL from .env or fallback to your backend WebSocket URL
    const wsUrl =
      import.meta.env.VITE_WS_URL ;
    connect(wsUrl);
    

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className=" h-[100dvh] font-cascadia w-full sm:max-w-6xl bg-amber-400 sm:p-3 rounded-none sm:rounded-lg shadow-md flex flex-col mx-auto overflow-y-auto">
      {/* ───── Header ───── */}
      
      {isTouchDevice ? 
        (<ConnStatusBar />
      ) : (
          <header className=" sticky  w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-amber-800 rounded-full  shrink-0">
            <div className="status flex items-center gap-2 text-[#FFE66D] font-bold min-w-0">
              <span className="truncate text-sm sm:text-base">{connStatus}</span>
              {(connStatus.includes('Searching') ||
                connStatus.includes('disconnected')) && (
                  <Loader className="animate-spin shrink-0" size={24} />
                )}
            </div>

            <div className="bg-white h-10 w-25 rounded-full  text-amber-700 flex gap-1 justify-evenly items-center shrink-0">
              <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500 animate-pulse" />
              <span className="text-sm sm:text-base tabular-nums">
               <SmoothCountUp value={activeUsers} duration={0.5} />
              </span>
            </div>
          </header>)}

      {/* ───── Message feed ───── */}
      <div className="messages flex-1 flex flex-col gap-1 px-2 sm:px-4 py-2  overflow-y-auto scrollbar-none overflow-x-hidden min-h-0">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`group relative flex mb-0.5 gap-1 animate-slideUp scrollbar-none max-w-[85%] sm:max-w-md lg:max-w-lg ${isUser ? 'self-end' : 'self-start'
                }`}
            >
              <ReactionWrapper
                message={msg}
                onReact={reactToMessage}
                onReply={setReplyingTo}
              >
                <MessageBubble message={msg} />
              </ReactionWrapper>
            </div>
          );
        })}

        {isTyping && (
          <div className="self-start px-2 bg-amber-700 rounded-2xl rounded-bl-none shadow-sm">
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
              {replyingTo.sender === 'user' ? 'You' : 'Stranger'}
            </div>
            <div className="text-sm text-gray-800 truncate">
              {replyingTo.content}
            </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-3 border-t border-amber-500/40 shrink-0">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={skip}
            disabled={sendDisable}
            className="flex-1 sm:flex-none h-10 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Skip
          </button>
          <Link
            to="/"
            onClick={disconnect}
            className="flex-1 sm:flex-none h-10 px-4 rounded-md bg-[#CBF3F0] hover:bg-[#b8e6e2] text-gray-800 text-sm font-medium transition-colors flex items-center justify-center"
          >
            Leave
          </Link>
        </div>

        <div className="flex-1 min-w-0">
          <ChatInput
            onSend={sendMessage}
            onChange={() => sendTyping()}
            sendDisable={sendDisable}
          />
        </div>
      </div>
    </div>
  );
}