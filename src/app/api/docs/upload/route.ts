import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';
import { readDb, writeDb, Document } from '@/lib/db';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const ext = path.extname(filename).toLowerCase();
    
    // Validate file type
    const allowedExtensions = ['.txt', '.docx', '.doc', '.pdf'];
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only txt, doc, docx, pdf are supported.' },
        { status: 400 }
      );
    }

    // Determine type for reader
    let docType = 'txt';
    if (ext === '.pdf') docType = 'pdf';
    else if (ext === '.docx' || ext === '.doc') docType = 'docx';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload using unified storage
    const url = await uploadFile(buffer, filename, file.type);

    // Save to database
    const db = await readDb();
    const newDoc: Document = {
      id: crypto.randomUUID(),
      userId: session.userId,
      name: filename,
      url,
      type: docType,
      size: file.size,
      createdAt: new Date().toISOString(),
    };

    db.documents.push(newDoc);
    await writeDb(db);

    return NextResponse.json({ document: newDoc }, { status: 201 });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during file upload' },
      { status: 500 }
    );
  }
}
