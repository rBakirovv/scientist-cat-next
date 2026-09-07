import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { MessageItem, MessagesPage } from '../../model/types';
import { messagesQuery } from './get-messages';

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
      queryClient.setQueryData(
        messagesQuery(conversationId).queryKey,
        (old: InfiniteData<MessagesPage> | undefined) => {
          if (!old) return old;
          const pages = [...old.pages];
          pages[0] = { ...pages[0], items: [...pages[0].items, message] };

          return { ...old, pages };
        },
      );

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
