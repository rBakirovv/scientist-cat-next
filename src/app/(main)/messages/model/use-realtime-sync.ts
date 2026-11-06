'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  appendMessage,
  markMessagesRead,
  type MessageItem,
} from '@/entities/message';
import { useRealtimeEvents } from '@/shared/lib/realtime';

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useRealtimeEvents((event) => {
    if (event.type === 'message:read') {
      markMessagesRead(
        queryClient,
        event.conversationId,
        event.readerId,
        event.readAt,
      );
      return;
    }

    // По проводу даты приезжают строками, а MessageItem объявлен через Date.
    // Расхождение в проекте уже есть: res.json() возвращает ровно то же самое,
    // а все потребители дат зовут new Date() и переживают обе формы.
    appendMessage(
      queryClient,
      event.conversationId,
      event.message as unknown as MessageItem,
    );

    // Список чатов активен, поэтому перезапросится сразу. Пикер неактивен,
    // пока закрыт, — он просто пометится устаревшим, без запроса.
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  });
}
