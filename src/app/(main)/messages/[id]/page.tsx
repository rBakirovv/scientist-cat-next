'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import {
  ConversationView,
  ConversationViewSkeleton,
} from '@/widgets/conversation-view';

export default function MessagePage() {
  return (
    <div className="min-h-0 lg:col-span-2">
      <Suspense fallback={<ConversationViewSkeleton />}>
        <ConversationScreen />
      </Suspense>
    </div>
  );
}

function ConversationScreen() {
  const { id } = useParams<{ id: string }>();

  return <ConversationView conversationId={id} />;
}
