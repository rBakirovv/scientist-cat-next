import 'server-only';
import prisma from '@/shared/lib/prisma';

export async function getConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { id: userId } } },
    select: {
      id: true,
      participants: {
        where: { id: { not: userId } },
        select: { id: true, name: true, image: true },
      },
    },
  });

  if (!conversation) return null;

  return { id: conversation.id, peer: conversation.participants[0] ?? null };
}
