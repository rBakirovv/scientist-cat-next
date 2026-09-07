'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircleIcon, Plus } from 'lucide-react';
import { UserPickerSkeleton } from './user-picker-skeleton';
import { usersQuery, type User } from '@/entities/user';
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

  const {
    data: users,
    isPending,
    error,
  } = useQuery({ ...usersQuery, enabled: open });

  return (
    <Combobox
      open={open}
      onOpenChange={(next) => setOpen(next)}
      items={users ?? []}
      itemToStringLabel={(user: User) => user.name}
    >
      <ComboboxTrigger
        className="[&>svg:last-of-type]:hidden"
        onMouseEnter={() => void queryClient.query(usersQuery).catch(() => {})}
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

        {error && (
          <Alert variant="destructive" className="border-0">
            <AlertCircleIcon />
            <AlertTitle>Не удалось загрузить пользователей</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {!isPending && !error && (
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
