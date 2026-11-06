'use client';

import { useQueryClient } from '@tanstack/react-query';
import { messagesQuery } from '@/entities/message';

export function usePrefetchMessages(conversationId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.infiniteQuery(messagesQuery(conversationId)).catch(() => {});
  };
}
