import { Skeleton } from '@/shared/components/ui/skeleton';

export function UserPickerSkeleton() {
  return (
    <div className="flex items-center px-3 py-2">
      <Skeleton className="h-5 w-full" />
    </div>
  );
}
