import { create } from 'zustand';
import type { Message } from '../../types/type.ts';

// Safe ID generator for both HTTPS/localhost and local Wi-Fi HTTP on mobile
const generateId = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

interface ChatState {
    ws: WebSocket | null;
    messages: Message[];
    connStatus: string;
    activeUsers: number;
    sendDisable: boolean;
    isTyping: boolean;
    replyingTo: Message | null;

    // Actions
    connect: (url: string) => void;
    disconnect: () => void;
    sendMessage: (textToSend: string) => void;
    sendTyping: () => void;
    skip: () => void;
    setReplyingTo: (msg: Message | null) => void;
    reactToMessage: (messageId: string, emoji: string) => void;
    removeReaction: (messageId: string) => void;
}

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
    ws: null,
    messages: [],
    connStatus: 'Searching for a stranger...',
    activeUsers: 0,
    sendDisable: true,
    isTyping: false,
    replyingTo: null,

    connect: (url: string) => {
        // Prevent duplicate connections in React StrictMode
        const existingWs = get().ws;
        if (existingWs && existingWs.readyState === WebSocket.OPEN) {
            return;
        }

        const ws = new WebSocket(url);

        ws.onopen = () => {
            set({ connStatus: 'Searching for a stranger...' });
        };

        ws.onmessage = (event) => {
            if (typeof event.data === 'string') {
                // 1. Typing indicator ping
                if (event.data === 'typing') {
                    set({ isTyping: true });
                    if (typingTimeout) clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => set({ isTyping: false }), 2000);
                    return;
                }

                // 2. Disconnected / Searching states
                if (
                    event.data.includes('disconnected') ||
                    event.data.includes('left') ||
                    event.data.includes('Searching')
                ) {
                    set({
                        connStatus: event.data,
                        sendDisable: true,
                        isTyping: false,
                        replyingTo: null,
                    });
                    return;
                }

                // 3. Connected to stranger
                if (event.data.includes('Connected to a random stranger')) {
                    set({
                        connStatus: event.data,
                        sendDisable: false,
                    });
                    return;
                }
            }

            // 4. JSON events
            let data: any = null;
            try {
                data = JSON.parse(event.data);
            } catch {
                // Fallback if plain text message is ever sent
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: generateId(),
                            content: event.data,
                            sender: 'stranger',
                            reactions: {},
                        },
                    ],
                }));
                return;
            }

            if (!data) return;

            switch (data.type) {
                case 'online_count':
                    set({ activeUsers: data.count });
                    break;

                case 'message':
                    set((state) => ({
                        isTyping: false,
                        messages: [
                            ...state.messages,
                            {
                                id: data.id || generateId(),
                                content: data.content,
                                sender: 'stranger',
                                reactions: {},
                                replyTo: data.replyTo,
                            },
                        ],
                    }));
                    break;

                case 'reaction':
                    set((state) => ({
                        messages: state.messages.map((msg) =>
                            msg.id === data.messageId
                                ? {
                                    ...msg,
                                    reactions: { ...(msg.reactions ?? {}), stranger: data.emoji },
                                }
                                : msg
                        ),
                    }));
                    break;

                case 'remove-reaction':
                    set((state) => ({
                        messages: state.messages.map((msg) =>
                            msg.id === data.messageId
                                ? {
                                    ...msg,
                                    reactions: { ...(msg.reactions ?? {}), stranger: undefined },
                                }
                                : msg
                        ),
                    }));
                    break;

                default:
                    console.log('Unknown JSON event:', data);
            }
        };

        ws.onclose = () => {
            set({
                ws: null,
                sendDisable: true,
                connStatus: 'Disconnected from server.',
            });
        };

        set({ ws });
    },

    disconnect: () => {
        const { ws } = get();
        if (typingTimeout) clearTimeout(typingTimeout);
        if (ws) {
            ws.close();
        }
        set({
            ws: null,
            messages: [],
            isTyping: false,
            replyingTo: null,
            sendDisable: true,
        });
    },

    sendMessage: (textToSend: string) => {
        const { ws, replyingTo } = get();
        if (!textToSend.trim()) return;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const id = generateId();
        const replyTo = replyingTo
            ? {
                id: replyingTo.id,
                content: replyingTo.content,
                sender: replyingTo.sender,
            }
            : undefined;

        ws.send(
            JSON.stringify({
                type: 'message',
                id,
                content: textToSend,
                replyTo,
            })
        );

        set((state) => ({
            messages: [
                ...state.messages,
                {
                    id,
                    content: textToSend,
                    sender: 'user',
                    reactions: {},
                    replyTo,
                },
            ],
            replyingTo: null,
        }));
    },

    sendTyping: () => {
        const { ws } = get();
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send('typing');
        }
    },

    skip: () => {
        const { ws } = get();
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send('/skip');
            set({
                messages: [],
                isTyping: false,
                replyingTo: null,
                sendDisable: true,
                connStatus: 'Searching for a stranger...',
            });
        }
    },

    setReplyingTo: (msg) => set({ replyingTo: msg }),

    reactToMessage: (messageId, emoji) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId
                    ? { ...m, reactions: { ...(m.reactions ?? {}), user: emoji } }
                    : m
            ),
        }));

        ws.send(JSON.stringify({ type: 'reaction', messageId, emoji }));
    },

    removeReaction: (messageId) => {
        const { ws } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId
                    ? { ...m, reactions: { ...(m.reactions ?? {}), user: undefined } }
                    : m
            ),
        }));

        ws.send(JSON.stringify({ type: 'remove-reaction', messageId }));
    },
}));