import 'server-only';
import { logger } from '@/shared/lib/logger';
import prisma from '@/shared/lib/prisma';
import {
  REALTIME_CHANNEL,
  type RealtimeEvent,
} from '@/shared/lib/realtime-events';

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  const readAt = new Date();

  const { count } = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
      conversation: { participants: { some: { id: userId } } },
    },
    data: { readAt },
  });

  if (count === 0) return 0;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participants: { select: { id: true } } },
  });

  const event: RealtimeEvent = {
    type: 'message:read',
    conversationId,
    // Себе не шлём: у читателя обновился бы readAt входящих, firstUnreadId
    // стал бы undefined и лента прыгнула бы вниз от разделителя. Ровно то,
    // из-за чего мы не инвалидируем ['messages'] после mark-read.
    recipientIds: (conversation?.participants ?? [])
      .map(({ id }) => id)
      .filter((id) => id !== userId),
    readerId: userId,
    readAt: readAt.toISOString(),
  };

  if (event.recipientIds.length > 0) {
    try {
      await prisma.$executeRaw`SELECT pg_notify(${REALTIME_CHANNEL}, ${JSON.stringify(event)})`;
    } catch (error) {
      logger.error(
        { err: error, conversationId, userId },
        'Не удалось опубликовать событие о прочтении',
      );
    }
  }

  return count;
}
