import { MessageCircle } from 'lucide-react';
import { ConversationItemSkeleton } from './conversation-item-skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function ConversationListSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>
            <div className="flex items-center gap-2">
              Чаты
              <MessageCircle size={16} />
            </div>
          </CardTitle>

          <Skeleton className="size-8 shrink-0 rounded-4xl" />
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {Array.from({ length: 3 }, (_, index) => (
            <ConversationItemSkeleton key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
