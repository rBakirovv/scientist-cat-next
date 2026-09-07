import { NextResponse } from 'next/server';
import { getUsers } from '@/entities/user/server';
import { getApiSession } from '@/shared/lib/api-guard';

export async function GET() {
  const { session, response } = await getApiSession();
  if (response) return response;

  const users = await getUsers(session.user.id);
  return NextResponse.json(users);
}
