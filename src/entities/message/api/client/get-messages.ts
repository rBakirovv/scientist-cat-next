import type { MessagesPage } from '../../model/types';

export async function fetchMessages(
  conversationId: string,
  cursor?: string,
): Promise<MessagesPage> {
  const url = new URL(
    `/api/conversations/${conversationId}/messages`,
    window.location.origin,
  );
  if (cursor) url.searchParams.set('cursor', cursor);

  const res = await fetch(url);
  if (!res.ok) throw new Error('Не удалось загрузить сообщения');
  return res.json();
}

export const messagesQuery = (conversationId: string) => ({
  queryKey: ['messages', conversationId] as const,
  queryFn: ({ pageParam }: { pageParam?: string }) =>
    fetchMessages(conversationId, pageParam),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (last: MessagesPage) => last.nextCursor ?? undefined,
});
