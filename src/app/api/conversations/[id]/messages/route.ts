import { NextResponse } from 'next/server';
import { createMessageSchema } from '@/entities/message';
import { createMessage, getMessages } from '@/entities/message/server';
import { getApiSession } from '@/shared/lib/api-guard';
import { logger } from '@/shared/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await getApiSession();
  if (response) return response;

  const { id } = await params;
  const cursor = new URL(request.url).searchParams.get('cursor') ?? undefined;

  try {
    return NextResponse.json(await getMessages(id, session.user.id, cursor));
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    logger.error(
      { err: error, conversationId: id, userId: session.user.id, cursor },
      'Не удалось загрузить сообщения',
    );

    return NextResponse.json(
      { error: 'Не удалось загрузить сообщения' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await getApiSession();
  if (response) return response;

  const { id } = await params;

  const json = await request.json().catch(() => null);
  const parsed = createMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const message = await createMessage(id, session.user.id, parsed.data.body);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }
    console.error('POST messages', error);
    return NextResponse.json(
      { error: 'Не удалось отправить' },
      { status: 500 },
    );
  }
}
