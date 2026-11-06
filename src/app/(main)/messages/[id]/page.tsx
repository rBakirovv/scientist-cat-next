'use client';

import { Suspense } from 'react';
import { ConversationScreen } from './conversation-screen';
import { ConversationViewSkeleton } from '@/widgets/conversation-view';

export default function MessagePage() {
  return (
    <div className="min-h-0 lg:col-span-2">
      <Suspense fallback={<ConversationViewSkeleton />}>
        <ConversationScreen />
      </Suspense>
    </div>
  );
}
