import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { getFileBuffer } from '@/lib/storage';
import mammoth from 'mammoth';

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

    if (doc.type === 'pdf') {
      return NextResponse.json({
        type: 'pdf',
        url: doc.url,
        name: doc.name,
      });
    }

    const buffer = await getFileBuffer(doc.url);

    if (doc.type === 'txt') {
      const text = buffer.toString('utf-8');
      return NextResponse.json({
        type: 'txt',
        content: text,
        name: doc.name,
      });
    }

    if (doc.type === 'docx') {
      try {
        const result = await mammoth.convertToHtml({ buffer });
        return NextResponse.json({
          type: 'docx',
          content: result.value,
          name: doc.name,
          messages: result.messages,
        });
      } catch (err: any) {
        console.error('Mammoth parsing error:', err);
        return NextResponse.json({
          type: 'error',
          content: 'Failed to parse Word document. It might be corrupted or in an unsupported format.',
          name: doc.name,
        }, { status: 422 });
      }
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Fetch document content error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the document content' },
      { status: 500 }
    );
  }
}
