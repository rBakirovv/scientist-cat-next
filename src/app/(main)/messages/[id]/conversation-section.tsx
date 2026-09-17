import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ConversationView } from '@/widgets/conversation-view';
import { getConversation } from '@/entities/conversation/server';
import { messagesQuery, type MessagesPage } from '@/entities/message';
import { getMessages } from '@/entities/message/server';
import { auth } from '@/shared/lib/auth';
import { getQueryClient } from '@/shared/lib/query-client';

export async function ConversationSection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const conversation = await getConversation(id, session.user.id);
  if (!conversation) notFound();

  const queryClient = getQueryClient();

  await queryClient
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    .infiniteQuery({
      queryKey: messagesQuery(id).queryKey,
      queryFn: () => getMessages(id, session.user.id),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage: MessagesPage) =>
        lastPage.nextCursor ?? undefined,
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConversationView
        conversationId={id}
        currentUserId={session.user.id}
        peer={conversation.peer}
      />
    </HydrationBoundary>
  );
}
