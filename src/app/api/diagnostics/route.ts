import { NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const jwtSecret = process.env.JWT_SECRET;
  const nodeEnv = process.env.NODE_ENV;

  const diagnostics: any = {
    env: {
      nodeEnv,
      hasBlobToken: !!token,
      blobTokenLength: token ? token.length : 0,
      hasJwtSecret: !!jwtSecret,
    },
    blobTest: {
      success: false,
      error: null,
      writeReadDelete: null,
    }
  };

  if (token) {
    try {
      // Test writing to Blob
      const testFilename = `diagnostics-test-${Date.now()}.json`;
      const testContent = JSON.stringify({ test: true });
      const testBlob = await put(testFilename, testContent, {
        access: 'public',
        token,
      });

      // Test reading
      const fetchRes = await fetch(testBlob.url, { cache: 'no-store' });
      const fetchContent = await fetchRes.json();
      const readMatches = fetchContent.test === true;

      // Test deleting
      await del(testBlob.url, { token });

      diagnostics.blobTest = {
        success: true,
        error: null,
        writeReadDelete: readMatches ? 'Success' : 'Read content mismatch',
      };
    } catch (e: any) {
      diagnostics.blobTest = {
        success: false,
        error: e.message || String(e),
        writeReadDelete: 'Failed',
      };
    }
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
