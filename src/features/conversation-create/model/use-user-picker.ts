'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPickerData } from '../api/client/use-user-picker-data';
import type { User } from '@/entities/user';

export function useUserPicker() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { usersQuery, creation, prefetchUsers } = useUserPickerData(open);

  const { data: users, isPending, error } = usersQuery;

  const {
    mutateAsync: createConversation,
    isPending: isCreating,
    error: createError,
  } = creation;

  const openChatWith = async (user: User) => {
    const { id } = await createConversation(user.id);
    setOpen(false);
    router.push(`/messages/${id}`);
  };

  const onValueChange = (user: User | null) => {
    if (user) void openChatWith(user);
  };
  return {
    open,
    onOpenChange: setOpen,
    users: users ?? [],
    isPending,
    isCreating,
    error,
    createError,
    prefetchUsers,
    onValueChange,
  };
}
