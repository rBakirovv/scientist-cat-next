import 'server-only';
import { logger } from '@/shared/lib/logger';
import prisma from '@/shared/lib/prisma';
import {
  REALTIME_CHANNEL,
  type RealtimeEvent,
} from '@/shared/lib/realtime-events';

export async function createMessage(
  conversationId: string,
  senderId: string,
  body: string,
) {
  // Одним запросом и проверка доступа, и получатели для уведомления.
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { id: senderId } } },
    select: { participants: { select: { id: true } } },
  });
  if (!conversation) throw new Error('FORBIDDEN');

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

  // Строго после коммита: внутри транзакции слушатель получил бы событие
  // раньше, чем сообщение станет видимым, и нарисовал бы то, чего ещё нет.
  const event: RealtimeEvent = {
    type: 'message:new',
    conversationId,
    recipientIds: conversation.participants.map(({ id }) => id),
    message: {
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      createdAt: message.createdAt.toISOString(),
      readAt: message.readAt?.toISOString() ?? null,
    },
  };

  // Сбой уведомления не должен ронять отправку: сообщение уже в базе,
  // а не доехавший push подберёт опрос.
  try {
    await prisma.$executeRaw`SELECT pg_notify(${REALTIME_CHANNEL}, ${JSON.stringify(event)})`;
  } catch (error) {
    logger.error(
      { err: error, conversationId, messageId: message.id },
      'Не удалось опубликовать событие о новом сообщении',
    );
  }

  return message;
}
