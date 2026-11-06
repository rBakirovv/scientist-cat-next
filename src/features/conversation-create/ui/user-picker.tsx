'use client';

import { AlertCircleIcon, Loader2, Plus } from 'lucide-react';
import { UserPickerSkeleton } from './user-picker-skeleton';
import { useUserPicker } from '../model/use-user-picker';
import type { User } from '@/entities/user';
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
  const {
    open,
    onOpenChange,
    users,
    isPending,
    isCreating,
    error,
    createError,
    prefetchUsers,
    onValueChange,
  } = useUserPicker();

  return (
    <Combobox
      open={open}
      onOpenChange={onOpenChange}
      items={users}
      itemToStringLabel={(user: User) => user.name}
      onValueChange={onValueChange}
    >
      <ComboboxTrigger
        className="[&>svg:last-of-type]:hidden"
        onMouseEnter={prefetchUsers}
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
