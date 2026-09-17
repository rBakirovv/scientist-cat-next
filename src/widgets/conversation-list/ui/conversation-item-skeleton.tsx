import { Skeleton } from '@/shared/components/ui/skeleton';

export function ConversationItemSkeleton() {
  return (
    <div className="-mx-2 my-[1px] flex items-center gap-3 px-2 py-2">
      <Skeleton className="size-9 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-3 w-[220px]" />
      </div>
    </div>
  );
}
