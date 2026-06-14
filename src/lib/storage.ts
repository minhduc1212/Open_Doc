import { put, del } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (e) {}
}

export async function uploadFile(buffer: Buffer, filename: string, mimeType?: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (token) {
    // Use Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimeType,
      token,
    });
    return blob.url;
  } else {
    // Fallback: Local storage
    await ensureUploadsDir();
    
    // Generate a unique filename to prevent overwrite
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const uniqueName = `${base}-${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    
    await fs.writeFile(filePath, buffer);
    return `/uploads/${uniqueName}`;
  }
}

export async function deleteFile(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (token && url.startsWith('http')) {
    // Delete from Vercel Blob
    await del(url, { token });
  } else if (url.startsWith('/uploads/')) {
    // Delete local file
    const filename = url.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, filename);
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.error('Error deleting local file:', e);
    }
  }
}

export async function getFileBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('/uploads/')) {
    const filename = url.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, filename);
    return await fs.readFile(filePath);
  } else {
    // Remote Vercel Blob URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from Vercel Blob: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
