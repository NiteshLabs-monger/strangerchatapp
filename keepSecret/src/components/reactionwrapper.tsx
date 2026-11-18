import type { Message } from '../../types/type';
import Reaction from './reaction';
import SwipeToReply from '../mobilecomponents/swipetoreply';

interface ReactionWrapperProps {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (msg: Message) => void; 
  children: React.ReactNode;
}

const ReactionWrapper = ({ message, onReact, onReply, children }: ReactionWrapperProps) => {
  const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  if (isTouchScreen) {
    return (
      <SwipeToReply message={message} onReply={onReply} onReact={onReact}>
        {children}
      </SwipeToReply>
    );
  }

  return (
    <Reaction message={message} onReact={onReact} onReply={onReply}>
      {children}
    </Reaction>
  );
};

export default ReactionWrapper;