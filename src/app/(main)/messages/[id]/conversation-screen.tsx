'use client';

import { useParams } from 'next/navigation';
import { ConversationView } from '@/widgets/conversation-view';

export function ConversationScreen() {
  const { id } = useParams<{ id: string }>();

  return <ConversationView conversationId={id} />;
}
