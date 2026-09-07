import { headers } from 'next/headers';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ConversationList } from '@/widgets/conversation-list';
import { ConversationView } from '@/widgets/conversation-view';
import { conversationsQuery } from '@/entities/conversation';
import { getConversations } from '@/entities/conversation/server';
import { auth } from '@/shared/lib/auth';
import { getQueryClient } from '@/shared/lib/query-client';

export default async function MessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const queryClient = getQueryClient();

  await queryClient
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    .query({
      queryKey: conversationsQuery.queryKey,
      queryFn: () => getConversations(session.user.id),
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConversationList />
      <ConversationView />
    </HydrationBoundary>
  );
}
