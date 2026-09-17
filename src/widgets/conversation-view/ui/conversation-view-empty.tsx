import { MessagesSquare } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';

export function ConversationViewEmpty() {
  return (
    <Card className="flex h-full w-full flex-col items-center justify-center gap-3">
      <MessagesSquare
        className="text-muted-foreground size-10 opacity-40"
        strokeWidth={1.5}
      />
      <p className="text-muted-foreground text-sm">
        Выберите, кому хотели бы написать
      </p>
    </Card>
  );
}
