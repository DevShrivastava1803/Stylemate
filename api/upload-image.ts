import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'stream';
import { GridFSBucket } from 'mongodb';
import { getDb } from './_db';
import { getUserFromAuthHeader } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { base64, mimeType, filename } = req.body || {};
    if (!base64 || !mimeType) {
      return res.status(400).json({ error: 'base64 and mimeType are required' });
    }

    const buffer = Buffer.from(base64, 'base64');
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    const uploadStream = bucket.openUploadStream(filename || `image-${Date.now()}`, {
      contentType: mimeType,
      metadata: { userId: user.userId },
    });

    await new Promise<void>((resolve, reject) => {
      Readable.from(buffer)
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => resolve());
    });

    const fileId = uploadStream.id?.toString();
    return res.status(201).json({ fileId, mimeType });
  } catch (e: any) {
    console.error('GridFS upload error:', e);
    return res.status(500).json({ error: 'Upload failed' });
  }
}