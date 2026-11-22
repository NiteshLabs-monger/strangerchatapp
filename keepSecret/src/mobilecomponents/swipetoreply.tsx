import React, { useState, useEffect, useRef } from 'react';
import { type Message } from '../../types/type.ts';
import { Reply } from 'lucide-react';

interface WhatsAppMessageWrapperProps {
  children: React.ReactNode;
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onSwipeLeft?: (message: Message) => void; // Optional separate handler if left swipe does something different
}

export default function WhatsAppMessageWrapper({
  children,
  message,
  onReply,
  onSwipeLeft,
  onReact,
}: WhatsAppMessageWrapperProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const longPressTimer = useRef<number | undefined>(undefined);
  const isLongPressActive = useRef(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const TRIGGER_THRESHOLD = 70;
  const MAX_SWIPE = 100;

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchDevice) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    isLongPressActive.current = false;
    setIsSwiping(false);

    longPressTimer.current = window.setTimeout(() => {
      isLongPressActive.current = true;
      setShowEmojiBar(true);
      if (navigator.vibrate) navigator.vibrate(40);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchDevice || isLongPressActive.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }

    // 1. Removed `&& diffX > 0` so both left (negative) and right (positive) register
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalSwipe.current = true;
        setIsSwiping(true);
      } else {
        isHorizontalSwipe.current = false;
      }
    }

    // 2. Clamp between -100px (left) and +100px (right)
    if (isHorizontalSwipe.current && Math.abs(diffX) > 0) {
      const dampedX = diffX * 0.65;
      const clampedX = Math.max(-MAX_SWIPE, Math.min(dampedX, MAX_SWIPE));
      setTranslateX(clampedX);
    }
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice) return;

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (isLongPressActive.current) return;

    if (isSwiping) {
      setIsSwiping(false);

      // Swiped Right
      if (translateX >= TRIGGER_THRESHOLD && onReply) {
        onReply(message);
      }
      // Swiped Left (uses onSwipeLeft if provided, otherwise falls back to onReply)
      else if (translateX <= -TRIGGER_THRESHOLD) {
        if (onSwipeLeft) {
          onSwipeLeft(message);
        } else if (onReply) {
          onReply(message);
        }
      }

      setTranslateX(0);
    }
  };

  const touchHandlers = isTouchDevice
    ? {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
    : {};

  return (
    <div className="relative w-full max-w-sm my-0.5 select-none">
      {/* 1. Emoji Reaction Menu */}
      {showEmojiBar && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowEmojiBar(false)} />
          <div className="absolute -top-14 left-0 z-20 flex gap-2 bg-amber-800 px-3 py-1.5 rounded-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {['👍', '❤️', '😂', '😮', '😢', '🔥'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(message.id, emoji);
                  setShowEmojiBar(false);
                }}
                className="text-2xl hover:scale-125 active:scale-95 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 2A. Right-Swipe Reply Indicator Icon (Appears on the Left) */}
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-emerald-400 transition-opacity z-0"
        style={{ opacity: translateX > 10 ? 1 : 0 }}
      >
        <Reply className="w-4 h-4" />
      </div>

      {/* 2B. Left-Swipe Reply Indicator Icon (Appears on the Right) */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-emerald-400 transition-opacity z-0"
        style={{ opacity: translateX < -10 ? 1 : 0 }}
      >
        <Reply className="w-4 h-4 -scale-x-100" />
      </div>

      {/* 3. Outer Swappable Container holding the Child element */}
      <div
        {...touchHandlers}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        className={`relative z-10 ${isTouchDevice ? 'cursor-grab active:cursor-grabbing touch-pan-y' : ''
          }`}
      >
        {children}
      </div>
    </div>
  );
}