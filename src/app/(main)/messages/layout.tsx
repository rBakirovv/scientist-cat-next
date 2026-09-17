import { Suspense } from 'react';
import { ConversationListSection } from './conversation-list-section';
import { ConversationListSkeleton } from '@/widgets/conversation-list';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
      <Suspense fallback={<ConversationListSkeleton />}>
        <ConversationListSection />
      </Suspense>
      {children}
    </div>
  );
}
