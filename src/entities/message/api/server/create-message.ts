import 'server-only';
import prisma from '@/shared/lib/prisma';

export async function createMessage(
  conversationId: string,
  senderId: string,
  body: string,
) {
  const isParticipant = await prisma.conversation.count({
    where: { id: conversationId, participants: { some: { id: senderId } } },
  });
  if (!isParticipant) throw new Error('FORBIDDEN');

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, body },
      select: {
        id: true,
        body: true,
        createdAt: true,
        senderId: true,
        readAt: true,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}
