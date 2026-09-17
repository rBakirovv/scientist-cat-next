'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon, MessageCircle } from 'lucide-react';
import { ConversationItem } from './conversation-item';
import { ConversationItemSkeleton } from './conversation-item-skeleton';
import { UserPicker } from '@/features/conversation-create';
import { conversationsQuery } from '@/entities/conversation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';

export function ConversationList() {
  const {
    data: conversations,
    isPending,
    error,
  } = useQuery(conversationsQuery);

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

          <UserPicker />
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {isPending && (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 3 }, (_, index) => (
              <ConversationItemSkeleton key={index} />
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Произошла ошибка</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {conversations?.length === 0 && (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3">
            <MessageCircle className="size-10 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Пока нет чатов</p>
          </div>
        )}

        {conversations && conversations.length > 0 && (
          <ul className="-mx-2 flex flex-col gap-1">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
