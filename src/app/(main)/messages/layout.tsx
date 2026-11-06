import { Suspense } from 'react';
import { getCurrentUserId } from './api/server/get-current-user-id';
import { ConversationListSection } from './conversation-list-section';
import { RealtimeSync } from './realtime-sync';
import { ConversationListSkeleton } from '@/widgets/conversation-list';
import { CurrentUserProvider } from '@/shared/lib/current-user';
import { RealtimeProvider } from '@/shared/lib/realtime';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = getCurrentUserId();

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
