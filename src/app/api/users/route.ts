import { NextResponse } from 'next/server';
import { getUsersWithoutChat } from '@/entities/user/server';
import { getApiSession } from '@/shared/lib/api-guard';

export async function GET() {
  const { session, response } = await getApiSession();
  if (response) return response;

  const users = await getUsersWithoutChat(session.user.id);
  return NextResponse.json(users);
}
