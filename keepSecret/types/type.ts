// types.ts
export type SenderType = 'user' | 'stranger' | 'system';

export interface Message {
  id: string;
  sender: SenderType;
  text: string;
  timestamp: string;
}

export type ChatState = 'idle' | 'searching' | 'chatting';