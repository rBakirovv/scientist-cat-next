'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/shared/lib/auth-client';

export function useSignOutRequest() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    queryClient.clear();
  }

  return { pending, signOut };
}
