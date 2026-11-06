import 'server-only';
import { headers } from 'next/headers';
import { auth } from '@/shared/lib/auth';

export function getCurrentUserId() {
  return headers()
    .then((requestHeaders) => auth.api.getSession({ headers: requestHeaders }))
    .then((session) => session?.user.id ?? null)
    .catch(() => null);
}
