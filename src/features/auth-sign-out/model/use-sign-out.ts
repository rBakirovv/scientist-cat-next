'use client';

import { useRouter } from 'next/navigation';
import { useSignOutRequest } from '../api/client/use-sign-out-request';

export function useSignOut() {
  const router = useRouter();
  const { pending, signOut } = useSignOutRequest();

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
    router.refresh();
  }

  return { pending, handleSignOut };
}
