import { NextResponse } from 'next/server';
import { getConversation } from '@/entities/conversation/server';
import { getApiSession } from '@/shared/lib/api-guard';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await getApiSession();
  if (response) return response;

  const { id } = await params;
  const conversation = await getConversation(id, session.user.id);
  if (!conversation) {
    return NextResponse.json({ error: 'Чат не найден' }, { status: 404 });
  }

  return NextResponse.json(conversation);
}
