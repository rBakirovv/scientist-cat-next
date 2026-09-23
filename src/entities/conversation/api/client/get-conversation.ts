import type { ConversationDetails } from '../../model/types';

export async function fetchConversation(
  conversationId: string,
): Promise<ConversationDetails> {
  const res = await fetch(`/api/conversations/${conversationId}`);
  if (!res.ok) throw new Error('Не удалось загрузить чат');
  return res.json();
}

export const conversationQuery = (conversationId: string) => ({
  queryKey: ['conversation', conversationId] as const,
  queryFn: () => fetchConversation(conversationId),
});
