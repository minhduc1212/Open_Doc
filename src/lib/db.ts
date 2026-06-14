import fs from 'fs/promises';
import path from 'path';

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

async function ensureDb() {
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

export async function readDb(): Promise<Database> {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return { users: [], documents: [] };
  }
}

export async function writeDb(data: Database): Promise<void> {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}
