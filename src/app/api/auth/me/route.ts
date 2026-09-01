import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (err: unknown) {
    return NextResponse.json({ user: null, error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
