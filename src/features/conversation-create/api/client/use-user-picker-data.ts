'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCreateConversation } from '@/entities/conversation';
import { usersWithoutChatQuery } from '@/entities/user';

export function useUserPickerData(open: boolean) {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ ...usersWithoutChatQuery, enabled: open });
  const creation = useCreateConversation();
  const prefetchUsers = () => {
    void queryClient.query(usersWithoutChatQuery).catch(() => {});
  };
  return { usersQuery, creation, prefetchUsers };
}
