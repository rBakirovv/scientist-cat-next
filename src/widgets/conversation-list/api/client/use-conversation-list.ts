'use client';

import { useQuery } from '@tanstack/react-query';
import { conversationsQuery } from '@/entities/conversation';
import { usePollingInterval } from '@/shared/lib/realtime';

export function useConversationList() {
  // Пока сокет жив, опроса нет. Оборвался — поллинг подхватывает.
  const refetchInterval = usePollingInterval(10 * 1000);

  const {
    data: conversations,
    isPending,
    error,
  } = useQuery({ ...conversationsQuery, refetchInterval });

  return { conversations, isPending, error };
}
