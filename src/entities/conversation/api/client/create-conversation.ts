import { useMutation } from '@tanstack/react-query';

export async function createConversation(
  peerId: string,
): Promise<{ id: string }> {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peerId }),
  });

  if (!res.ok) throw new Error('Не удалось создать чат');
  return res.json();
}

export function useCreateConversation() {
  return useMutation({ mutationFn: createConversation });
}
