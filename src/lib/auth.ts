import crypto from 'crypto';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'opendoc-secret-key-12345-very-long-and-secure';

export interface SessionData {
  userId: string;
  username: string;
}

export function signSession(data: SessionData): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = JSON.stringify({ ...data, exp: expiresAt });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifySession(token: string): SessionData | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [base64Payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('base64url');
  
  if (signature !== expectedSignature) return null;

  try {
    const payloadJson = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    if (Date.now() > payload.exp) return null; // expired
    return { userId: payload.userId, username: payload.username };
  } catch (e) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}
