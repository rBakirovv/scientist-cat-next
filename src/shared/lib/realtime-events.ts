// Контракт между Next и процессом realtime: канал LISTEN/NOTIFY типов не
// проверяет, поэтому форму события держим в одном месте на обоих.
export const REALTIME_CHANNEL = 'realtime_events';

// Сообщение в том виде, в каком летит по проводу: JSON дат не знает.
export type RealtimeMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  readAt: string | null;
};

type Addressed = {
  conversationId: string;
  recipientIds: string[];
};

// Отправитель тоже в получателях: у него бывают другие вкладки.
export type NewMessageEvent = Addressed & {
  type: 'message:new';
  message: RealtimeMessage;
};

// А вот читателя в получателях быть не должно — см. mark-read.ts.
export type MessagesReadEvent = Addressed & {
  type: 'message:read';
  readerId: string;
  readAt: string;
};

export type RealtimeEvent = NewMessageEvent | MessagesReadEvent;

export function isRealtimeEvent(value: unknown): value is RealtimeEvent {
  if (typeof value !== 'object' || value === null) return false;

  const event = value as Record<string, unknown>;

  if (typeof event.conversationId !== 'string') return false;
  if (!Array.isArray(event.recipientIds)) return false;
  if (!event.recipientIds.every((id) => typeof id === 'string')) return false;

  if (event.type === 'message:new') {
    const message = event.message as Record<string, unknown> | null;
    return (
      typeof message === 'object' &&
      message !== null &&
      typeof message.id === 'string'
    );
  }

  if (event.type === 'message:read') {
    return (
      typeof event.readerId === 'string' && typeof event.readAt === 'string'
    );
  }

  return false;
}
