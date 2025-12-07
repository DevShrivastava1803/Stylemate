import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_db';
import { getUserFromAuthHeader } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const db = await getDb();
  const col = db.collection('items');

  if (req.method === 'GET') {
    const items = await col.find({ userId: user.userId }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(items);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const doc = {
      userId: user.userId,
      fileUrl: body.fileUrl,
      fileId: body.fileId,
      mimeType: body.mimeType,
      category: body.category,
      description: body.description,
      tags: body.tags || [],
      createdAt: Date.now(),
    };
    if ((!doc.fileUrl && !doc.fileId) || !doc.category || !doc.description) {
      return res.status(400).json({ error: 'fileUrl or fileId, plus category and description are required' });
    }
    const result = await col.insertOne(doc as any);
    return res.status(201).json({ id: result.insertedId, ...doc });
  }

  if (req.method === 'DELETE') {
    const { id } = (req.query || {}) as any;
    if (!id) return res.status(400).json({ error: 'id required' });
    // If using ObjectId, convert here; for simplicity we accept string IDs.
    await col.deleteOne({ _id: id, userId: user.userId } as any);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}