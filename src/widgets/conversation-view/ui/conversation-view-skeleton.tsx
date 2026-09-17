import { MessageRowSkeleton } from '@/entities/message';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const ROWS = [
  { isOwn: false, width: 'w-56' },
  { isOwn: true, width: 'w-40' },
  { isOwn: true, width: 'w-64' },
  { isOwn: false, width: 'w-48' },
];

export function ConversationViewSkeleton() {
  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-40 rounded-sm" />
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {ROWS.map((row, index) => (
          <MessageRowSkeleton key={index} {...row} />
        ))}
      </CardContent>

      <CardFooter>
        <div className="border-input bg-input/30 flex w-full items-center gap-2 rounded-xl border px-3 py-2">
          <Skeleton className="h-4 flex-1 rounded-sm" />
          <Skeleton className="size-8 shrink-0 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}
