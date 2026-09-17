import 'server-only';
import prisma from '@/shared/lib/prisma';

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  const { count } = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
      conversation: { participants: { some: { id: userId } } },
    },
    data: { readAt: new Date() },
  });

  return count;
}
