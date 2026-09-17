import { Suspense } from 'react';
import { ConversationSection } from './conversation-section';
import { ConversationViewSkeleton } from '@/widgets/conversation-view';

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-0 lg:col-span-2">
      <Suspense fallback={<ConversationViewSkeleton />}>
        <ConversationSection params={params} />
      </Suspense>
    </div>
  );
}
