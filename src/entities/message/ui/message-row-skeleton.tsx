import {
  Message,
  MessageAvatar,
  MessageContent,
} from '@/shared/components/ui/message';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function MessageRowSkeleton({
  isOwn = false,
  width = 'w-48',
}: {
  isOwn?: boolean;
  width?: string;
}) {
  return (
    <Message align={isOwn ? 'end' : 'start'} className="items-center">
      {!isOwn && (
        <MessageAvatar className="self-center">
          <Skeleton className="size-8 rounded-full" />
        </MessageAvatar>
      )}
      <MessageContent>
        <Skeleton className={`h-10 rounded-3xl ${width}`} />
      </MessageContent>
    </Message>
  );
}
