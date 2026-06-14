import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await readDb();
    const userDocs = db.documents
      .filter((doc) => doc.userId === session.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ documents: userDocs }, { status: 200 });
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching documents' },
      { status: 500 }
    );
  }
}
