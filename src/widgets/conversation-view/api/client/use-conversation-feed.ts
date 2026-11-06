'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { conversationQuery, conversationsQuery } from '@/entities/conversation';
import { messagesQuery } from '@/entities/message';
import { usePollingInterval } from '@/shared/lib/realtime';

export function useConversationFeed(conversationId: string) {
  // Пока сокет жив, опроса нет. Оборвался — поллинг подхватывает.
  const refetchInterval = usePollingInterval(5 * 1000);

  const { data: conversations } = useQuery(conversationsQuery);
  const listedPeer = conversations?.find(
    ({ id }) => id === conversationId,
  )?.peer;

  // В списке лежат только чаты с сообщениями, поэтому свежесозданного там нет.
  // Дотягиваем собеседника точечно — иначе шапка застрянет на скелетоне.
  const { data: conversation } = useQuery({
    ...conversationQuery(conversationId),
    enabled: conversations !== undefined && listedPeer === undefined,
  });

  const peer = listedPeer ?? conversation?.peer;

  const {
    data,
    error,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...messagesQuery(conversationId),
    refetchInterval,
  });

  return {
    peer,
    data,
    error,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
}
