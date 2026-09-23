import type { User } from '../../model/types';

export async function fetchUsersWithoutChat(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Не удалось загрузить пользователей');
  return res.json();
}

export const usersWithoutChatQuery = {
  queryKey: ['users', 'without-chat'] as const,
  queryFn: fetchUsersWithoutChat,
};
