'use client';

import { useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AlertCircleIcon, Loader2 } from 'lucide-react';
import { useMessageFeedScroll } from '../lib/use-message-feed-scroll';
import { MessageComposer } from '@/features/message-send';
import { conversationQuery, conversationsQuery } from '@/entities/conversation';
import {
  MessageRow,
  MessageRowSkeleton,
  messagesQuery,
  useMarkRead,
} from '@/entities/message';
import { UserAvatar } from '@/entities/user';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useCurrentUserId } from '@/shared/lib/current-user';
import { Skeleton } from '@/shared/components/ui/skeleton';

const PENDING_ROWS = [
  { isOwn: false, width: 'w-56' },
  { isOwn: true, width: 'w-40' },
  { isOwn: true, width: 'w-64' },
  { isOwn: false, width: 'w-48' },
];

export function ConversationView({
  conversationId,
}: {
  conversationId: string;
}) {
  const currentUserId = useCurrentUserId();

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
  } = useInfiniteQuery(messagesQuery(conversationId));

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

  useEffect(() => {
    markRead();
  }, [conversationId, markRead]);

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          {peer ? (
            <>
              <UserAvatar user={peer} />
              <CardTitle>{peer.name}</CardTitle>
            </>
          ) : (
            <>
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-5 w-40 rounded-sm" />
            </>
          )}
        </div>
      </CardHeader>

      <CardContent
        ref={containerRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto [overflow-anchor:none]"
      >
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Не удалось загрузить сообщения</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div ref={sentinelRef} aria-hidden className="h-px shrink-0" />

        {isFetchingNextPage && (
          <Loader2 className="text-muted-foreground mx-auto size-4 shrink-0 animate-spin" />
        )}

        {isPending &&
          PENDING_ROWS.map((row, index) => (
            <MessageRowSkeleton key={index} {...row} />
          ))}

        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;

          return (
            <MessageRow
              key={message.id}
              message={message}
              isOwn={isOwn}
              avatar={!isOwn && peer ? <UserAvatar user={peer} /> : undefined}
            />
          );
        })}
      </CardContent>

      <CardFooter>
        <MessageComposer conversationId={conversationId} />
      </CardFooter>
    </Card>
  );
}
