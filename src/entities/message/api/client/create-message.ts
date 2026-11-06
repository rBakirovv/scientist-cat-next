import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MessageItem } from '../../model/types';
import { appendMessage } from './append-message';

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<MessageItem> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  if (!res.ok) throw new Error('Не удалось отправить сообщение');
  return res.json();
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, body),
    onSuccess: (message) => {
      appendMessage(queryClient, conversationId, message);

      // Первое сообщение переводит собеседника из пикера в список чатов,
      // поэтому оба списка устаревают одновременно.
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
