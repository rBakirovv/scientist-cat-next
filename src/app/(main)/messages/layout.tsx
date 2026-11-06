import { Suspense } from 'react';
import { headers } from 'next/headers';
import { ConversationListSection } from './conversation-list-section';
import { RealtimeSync } from './realtime-sync';
import { ConversationListSkeleton } from '@/widgets/conversation-list';
import { auth } from '@/shared/lib/auth';
import { CurrentUserProvider } from '@/shared/lib/current-user';
import { RealtimeProvider } from '@/shared/lib/realtime';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = headers()
    .then((requestHeaders) => auth.api.getSession({ headers: requestHeaders }))
    .then((session) => session?.user.id ?? null)
    .catch(() => null);

  return (
    // Провайдер снаружи сетки: список чатов тоже спрашивает у него,
    // нужно ли опрашивать сервер.
    <RealtimeProvider>
      <RealtimeSync />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <Suspense fallback={<ConversationListSkeleton />}>
          <ConversationListSection />
        </Suspense>

        <CurrentUserProvider userId={userId}>{children}</CurrentUserProvider>
      </div>
    </RealtimeProvider>
  );
}
