import fs from 'fs/promises';
import path from 'path';
import { put, list, get } from '@vercel/blob';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  url: string;
  type: string; // 'txt' | 'docx' | 'pdf'
  size: number;
  createdAt: string;
}

interface Database {
  users: User[];
  documents: Document[];
}

// Local File Helper
async function ensureLocalDb() {
  const dir = path.dirname(DB_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {}

  try {
    await fs.access(DB_PATH);
  } catch (e) {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [], documents: [] }, null, 2));
  }
}

// Global variable to cache the Blob URL to avoid listing too often
let dbBlobUrl: string | null = null;

async function getDbBlobUrl(token: string): Promise<string | null> {
  if (dbBlobUrl) return dbBlobUrl;

  try {
    const { blobs } = await list({ token });
    const dbBlob = blobs.find((b) => b.pathname === 'db.json');
    if (dbBlob) {
      dbBlobUrl = dbBlob.url;
      return dbBlobUrl;
    }
  } catch (e) {
    console.error('Error listing blobs for db:', e);
  }
  return null;
}

export async function readDb(): Promise<Database> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (token) {
    // Cloud database (Vercel Blob)
    try {
      const url = await getDbBlobUrl(token);
      if (url) {
        // Retrieve private database blob using Vercel Blob get method
        const result = await get(url, {
          access: 'private',
          token,
        });
        if (result) {
          const jsonText = await new Response(result.stream).text();
          return JSON.parse(jsonText);
        }
      }
    } catch (e) {
      console.error('Error reading DB from Vercel Blob:', e);
    }
    // Return empty DB if not found or error
    return { users: [], documents: [] };
  } else {
    // Local database
    await ensureLocalDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    try {
      return JSON.parse(data);
    } catch (e) {
      return { users: [], documents: [] };
    }
  }
}

export async function writeDb(data: Database): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (token) {
    // Cloud database (Vercel Blob)
    try {
      const blob = await put('db.json', JSON.stringify(data, null, 2), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
      dbBlobUrl = blob.url; // Cache the url
    } catch (e) {
      console.error('Error writing DB to Vercel Blob:', e);
    }
  } else {
    // Local database
    await ensureLocalDb();
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }
}
