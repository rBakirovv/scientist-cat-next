import { NextResponse } from 'next/server';
import z from 'zod';
import {
  getConversations,
  findOrCreateConversation,
} from '@/entities/conversation/server';
import { getApiSession } from '@/shared/lib/api-guard';
import { logger } from '@/shared/lib/logger';

export async function GET() {
  const { session, response } = await getApiSession();
  if (response) return response;

  return NextResponse.json(await getConversations(session.user.id));
}

export async function POST(request: Request) {
  const { session, response } = await getApiSession();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = z.object({ peerId: z.string().min(1) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (parsed.data.peerId === session.user.id) {
    return NextResponse.json(
      { error: 'Нельзя создать чат с самим собой' },
      { status: 400 },
    );
  }

  try {
    const conversation = await findOrCreateConversation(
      session.user.id,
      parsed.data.peerId,
    );
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id, peerId: parsed.data.peerId },
      'Не удалось создать чат',
    );

    return NextResponse.json(
      { error: 'Не удалось создать чат' },
      { status: 500 },
    );
  }
}
