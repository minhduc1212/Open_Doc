import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { deleteFile } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await readDb();
    const doc = db.documents.find((d) => d.id === id);

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ document: doc }, { status: 200 });
  } catch (error) {
    console.error('Fetch document error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the document metadata' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await readDb();
    const docIndex = db.documents.findIndex((d) => d.id === id);

    if (docIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const doc = db.documents[docIndex];

    if (doc.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete file from Vercel Blob or local uploads
    await deleteFile(doc.url);

    // Remove from database
    db.documents.splice(docIndex, 1);
    await writeDb(db);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the document' },
      { status: 500 }
    );
  }
}
