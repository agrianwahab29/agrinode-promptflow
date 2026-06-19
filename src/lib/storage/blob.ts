import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const USE_VERCEL_BLOB = process.env.USE_VERCEL_BLOB === 'true';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export interface UploadResult {
  url: string;
  filename: string;
}

async function uploadToVercelBlob(file: File, filename: string): Promise<UploadResult> {
  if (!BLOB_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN not set');
  const { put } = await import('@vercel/blob');
  const blob = await put(`references/${filename}`, file, { access: 'public', token: BLOB_TOKEN });
  return { url: blob.url, filename };
}

async function uploadToLocalFS(file: File, filename: string): Promise<UploadResult> {
  const dir = path.join(process.cwd(), 'public', 'references');
  await fs.mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buf);
  return { url: `/references/${filename}`, filename };
}

export async function uploadReference(file: File, originalName: string): Promise<UploadResult> {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ext && /^\.(png|jpg|jpeg|gif|webp|svg)$/.test(ext) ? ext : '';
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60) || 'ref';
  const filename = `${baseName}-${randomUUID().slice(0, 8)}${safeExt}`;
  if (USE_VERCEL_BLOB) return uploadToVercelBlob(file, filename);
  return uploadToLocalFS(file, filename);
}

export async function deleteReference(url: string, filename: string): Promise<void> {
  if (USE_VERCEL_BLOB && url.startsWith('https://')) {
    try {
      const { del } = await import('@vercel/blob');
      await del(url, { token: BLOB_TOKEN });
    } catch {
      // ignore: file may not exist
    }
    return;
  }
  // Local FS: delete from public/references/
  const filepath = path.join(process.cwd(), 'public', 'references', filename);
  try {
    await fs.unlink(filepath);
  } catch {
    // ignore
  }
}
