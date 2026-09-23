'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircleIcon, Loader2, Plus } from 'lucide-react';
import { UserPickerSkeleton } from './user-picker-skeleton';
import { useCreateConversation } from '@/entities/conversation';
import { usersWithoutChatQuery, type User } from '@/entities/user';
import { Button } from '@/shared/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/shared/components/ui/combobox';

export function UserPicker() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: users,
    isPending,
    error,
  } = useQuery({ ...usersWithoutChatQuery, enabled: open });

  const {
    mutateAsync: createConversation,
    isPending: isCreating,
    error: createError,
  } = useCreateConversation();

  const openChatWith = async (user: User) => {
    const { id } = await createConversation(user.id);
    setOpen(false);
    router.push(`/messages/${id}`);
  };

  return (
    <Combobox
      open={open}
      onOpenChange={(next) => setOpen(next)}
      items={users ?? []}
      itemToStringLabel={(user: User) => user.name}
      onValueChange={(user: User | null) => {
        if (user) void openChatWith(user);
      }}
    >
      <ComboboxTrigger
        className="[&>svg:last-of-type]:hidden"
        onMouseEnter={() =>
          void queryClient.query(usersWithoutChatQuery).catch(() => {})
        }
        render={<Button variant="outline" size="icon-sm" title="Новый чат" />}
      >
        <Plus />
        <span className="sr-only">Новый чат</span>
      </ComboboxTrigger>

      <ComboboxContent className="w-72 min-w-72">
        <ComboboxInput placeholder="Поиск по имени" showTrigger={false} />

        {isPending && (
          <div className="p-1">
            {Array.from({ length: 4 }, (_, index) => (
              <UserPickerSkeleton key={index} />
            ))}
          </div>
        )}

        {(error || createError) && (
          <Alert variant="destructive" className="border-0">
            <AlertCircleIcon />
            <AlertTitle>
              {error
                ? 'Не удалось загрузить пользователей'
                : 'Не удалось создать чат'}
            </AlertTitle>
            <AlertDescription>
              {(error ?? createError)?.message}
            </AlertDescription>
          </Alert>
        )}

        {isCreating && (
          <div className="text-muted-foreground flex items-center gap-2 p-3 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Открываем чат
          </div>
        )}

        {!isPending && !error && !isCreating && (
          <>
            <ComboboxEmpty>Пользователи не найдены</ComboboxEmpty>
            <ComboboxList>
              {(user: User) => (
                <ComboboxItem key={user.id} value={user}>
                  {user.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
