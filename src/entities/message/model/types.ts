import type { getMessages } from '../api/server/get-messages';

export type MessagesPage = Awaited<ReturnType<typeof getMessages>>;

export type MessageItem = MessagesPage['items'][number];
