import { Redis } from '@upstash/redis';
import { del } from '@vercel/blob';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { id, url } = req.body;
    const raw = await redis.lrange('files', 0, -1);
    for (const item of raw) {
      const record = typeof item === 'string' ? JSON.parse(item) : item;
      if (record.id === id) {
        await redis.lrem('files', 1, item);
        break;
      }
    }
    if (url) await del(url);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
