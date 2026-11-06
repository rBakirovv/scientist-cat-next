'use client';

import { LogOut } from 'lucide-react';
import { useSignOut } from '../model/use-sign-out';

import { Button } from '@/shared/components/ui/button';

export function SignOutButton() {
  const { pending, handleSignOut } = useSignOut();

  return (
    <Button
      variant="outline"
      size="icon"
      title="Выйти"
      onClick={handleSignOut}
      disabled={pending}
    >
      <LogOut className="text-destructive" />
      <span className="sr-only">Выйти</span>
    </Button>
  );
}
