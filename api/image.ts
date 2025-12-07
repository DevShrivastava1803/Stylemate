import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GridFSBucket, ObjectId } from 'mongodb';
import { getDb } from './_db';
import { getUserFromAuthHeader } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await getDb();
  const bucket = new GridFSBucket(db, { bucketName: 'images' });

  const { id } = (req.query || {}) as any;
  if (!id) return res.status(400).json({ error: 'id required' });

  // GET: stream image bytes
  if (req.method === 'GET') {
    try {
      const _id = new ObjectId(id);
      const filesCol = db.collection('images.files');
      const fileDoc = await filesCol.findOne({ _id });
      if (!fileDoc) return res.status(404).json({ error: 'Not Found' });

      const contentType = (fileDoc as any).contentType || (fileDoc as any).metadata?.contentType || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      const download = bucket.openDownloadStream(_id);
      download.on('error', (err) => {
        console.error('GridFS download error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Download failed' });
      });
      download.pipe(res);
    } catch (e: any) {
      console.error('GridFS GET error:', e);
      return res.status(400).json({ error: 'Invalid id' });
    }
    return;
  }

  // DELETE: remove image (auth required)
  if (req.method === 'DELETE') {
    const user = getUserFromAuthHeader(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const _id = new ObjectId(id);
      // Optional: check ownership
      const filesCol = db.collection('images.files');
      const fileDoc = await filesCol.findOne({ _id });
      if (!fileDoc) return res.status(404).json({ error: 'Not Found' });
      const ownerId = (fileDoc as any).metadata?.userId;
      if (ownerId && ownerId !== user.userId) return res.status(403).json({ error: 'Forbidden' });

      await bucket.delete(_id);
      return res.status(204).end();
    } catch (e: any) {
      console.error('GridFS DELETE error:', e);
      return res.status(400).json({ error: 'Invalid id' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}