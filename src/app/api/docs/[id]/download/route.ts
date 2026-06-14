import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { getFileBuffer } from '@/lib/storage';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const db = await readDb();
    const doc = db.documents.find((d) => d.id === id);

    if (!doc) {
      return new Response('Document not found', { status: 404 });
    }

    if (doc.userId !== session.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const buffer = await getFileBuffer(doc.url);
    
    // Parse query params for content-disposition type (inline vs attachment)
    const { searchParams } = new URL(request.url);
    const disposition = searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';

    // Map content type from extension
    const ext = path.extname(doc.name).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.txt') {
      contentType = 'text/plain; charset=utf-8';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    }

    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(doc.name)}"`
    );

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('File download endpoint error:', error);
    return new Response('An internal error occurred', { status: 500 });
  }
}
