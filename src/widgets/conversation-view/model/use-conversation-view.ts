'use client';

import { useEffect } from 'react';
import { useConversationFeed } from '../api/client/use-conversation-feed';
import { useMessageFeedScroll } from './use-message-feed-scroll';
import { useMarkRead } from '@/entities/message';
import { useCurrentUserId } from '@/shared/lib/current-user';

export function useConversationView(conversationId: string) {
  const currentUserId = useCurrentUserId();

  const {
    peer,
    data,
    error,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useConversationFeed(conversationId);

  const messages = data
    ? [...data.pages].reverse().flatMap((page) => page.items)
    : [];

  const firstUnreadId = messages.find(
    (message) => message.senderId !== currentUserId && message.readAt === null,
  )?.id;

  const lastMessage = messages[messages.length - 1];

  const { containerRef, sentinelRef } = useMessageFeedScroll({
    conversationId,
    firstMessageId: messages[0]?.id,
    lastMessageId: lastMessage?.id,
    isLastMessageOwn: lastMessage?.senderId === currentUserId,
    firstUnreadId,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const { mutate: markRead } = useMarkRead(conversationId);

  // Пока сообщения приходили только при заходе, хватало одного вызова.
  // Теперь чужое может прилететь в уже открытый чат — помечаем и его.
  const lastIncomingId =
    lastMessage && lastMessage.senderId !== currentUserId
      ? lastMessage.id
      : undefined;

  useEffect(() => {
    markRead();
  }, [conversationId, lastIncomingId, markRead]);

  const rows = messages.map((message) => ({
    message,
    isOwn: message.senderId === currentUserId,
  }));
  return {
    peer,
    rows,
    error,
    isPending,
    isFetchingNextPage,
    containerRef,
    sentinelRef,
  };
}
