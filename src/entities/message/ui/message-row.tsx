import { Suspense } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { MessageItem } from '../model/types';
import { MessageTime } from './message-time';
import { Bubble, BubbleContent } from '@/shared/components/ui/bubble';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from '@/shared/components/ui/message';

export function MessageRow({
  message,
  isOwn,
  avatar,
}: {
  message: MessageItem;
  isOwn: boolean;
  avatar?: React.ReactNode;
}) {
  return (
    <Message align={isOwn ? 'end' : 'start'} data-message-id={message.id}>
      {avatar && <MessageAvatar>{avatar}</MessageAvatar>}
      <MessageContent>
        <Bubble variant={isOwn ? 'default' : 'muted'}>
          <BubbleContent>{message.body}</BubbleContent>
        </Bubble>
        <MessageFooter>
          <div className="flex items-center gap-1">
            <Suspense fallback={<Skeleton className="h-4 w-16 rounded-sm" />}>
              <MessageTime createdAt={message.createdAt} />
            </Suspense>
            {isOwn &&
              (message.readAt ? (
                <CheckCheck
                  color="lab(76 -45.65 72.89)"
                  aria-label="Прочитано"
                  className="text-muted-foreground size-3"
                />
              ) : (
                <Check
                  aria-label="Отправлено"
                  className="text-muted-foreground size-3"
                />
              ))}
          </div>
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}
