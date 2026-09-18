'use client';

import { createContext, use, useContext } from 'react';

const CurrentUserContext = createContext<Promise<string | null> | null>(null);

export function CurrentUserProvider({
  userId,
  children,
}: {
  userId: Promise<string | null>;
  children: React.ReactNode;
}) {
  return <CurrentUserContext value={userId}>{children}</CurrentUserContext>;
}

export function useCurrentUserId() {
  const pending = useContext(CurrentUserContext);
  if (!pending)
    throw new Error('useCurrentUserId вызван вне CurrentUserProvider');

  const userId = use(pending);
  if (!userId) throw new Error('Нет сессии');

  return userId;
}
