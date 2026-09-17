import 'server-only';
import prisma from '@/shared/lib/prisma';

export async function getConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { id: userId } },
      messages: { some: {} },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      updatedAt: true,
      participants: {
        where: { id: { not: userId } },
        select: { id: true, name: true, image: true, role: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, createdAt: true, senderId: true, readAt: true },
      },
      _count: {
        select: {
          messages: { where: { senderId: { not: userId }, readAt: null } },
        },
      },
    },
  });

  return conversations.map(({ participants, messages, _count, ...rest }) => ({
    ...rest,
    peer: participants[0] ?? null,
    lastMessage: messages[0] ?? null,
    unreadCount: _count.messages,
  }));
}
