'use client';

import { AlertCircleIcon, Loader2 } from 'lucide-react';
import { useConversationView } from '../model/use-conversation-view';
import { MessageComposer } from '@/features/message-send';
import { MessageRow, MessageRowSkeleton } from '@/entities/message';
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
  const {
    peer,
    rows,
    error,
    isPending,
    isFetchingNextPage,
    containerRef,
    sentinelRef,
  } = useConversationView(conversationId);

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

        {rows.map(({ message, isOwn }) => (
          <MessageRow
            key={message.id}
            message={message}
            isOwn={isOwn}
            avatar={!isOwn && peer ? <UserAvatar user={peer} /> : undefined}
          />
        ))}
      </CardContent>

      <CardFooter>
        <MessageComposer conversationId={conversationId} />
      </CardFooter>
    </Card>
  );
}
