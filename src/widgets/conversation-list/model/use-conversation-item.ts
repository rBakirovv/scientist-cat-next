'use client';

import { usePathname } from 'next/navigation';
import { usePrefetchMessages } from '../api/client/use-prefetch-messages';
import type { ConversationListItem } from '@/entities/conversation';
import { formatListDate } from '@/shared/lib/format-date';

export function useConversationItem(conversation: ConversationListItem) {
  const pathname = usePathname();
  const href = `/messages/${conversation.id}`;
  const isActive = pathname === href;
  const hasUnread = conversation.unreadCount > 0;

  const prefetchMessages = usePrefetchMessages(conversation.id);

  const lastMessageDate = conversation.lastMessage
    ? formatListDate(conversation.lastMessage.createdAt)
    : '';
  return { href, isActive, hasUnread, prefetchMessages, lastMessageDate };
}
