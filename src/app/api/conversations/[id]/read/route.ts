import { NextResponse } from 'next/server';
import { markConversationRead } from '@/entities/message/server';
import { getApiSession } from '@/shared/lib/api-guard';
import { logger } from '@/shared/lib/logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await getApiSession();
  if (response) return response;

  const { id } = await params;

  try {
    const count = await markConversationRead(id, session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    logger.error(
      { err: error, conversationId: id, userId: session.user.id },
      'Не удалось отметить сообщения прочитанными',
    );

    return NextResponse.json(
      { error: 'Не удалось отметить сообщения прочитанными' },
      { status: 500 },
    );
  }
}
