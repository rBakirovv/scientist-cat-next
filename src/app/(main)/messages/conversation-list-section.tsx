import { HydrationBoundary } from '@tanstack/react-query';
import { loadConversationList } from './api/server/load-conversation-list';
import { ConversationList } from '@/widgets/conversation-list';

export async function ConversationListSection() {
  const state = await loadConversationList();
  if (!state) return null;

  return (
    <HydrationBoundary state={state}>
      <ConversationList />
    </HydrationBoundary>
  );
}
