import { useMutation, useQueryClient } from '@tanstack/react-query';

export async function markRead(
  conversationId: string,
): Promise<{ count: number }> {
  const res = await fetch(`/api/conversations/${conversationId}/read`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Не удалось отметить сообщения прочитанными');
  return res.json();
}

export function useMarkRead(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markRead(conversationId),
    onSuccess: ({ count }) => {
      if (count > 0)
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
