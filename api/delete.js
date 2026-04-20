import { kv } from '@vercel/kv';
import { del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { id, url } = req.body;
    const raw = await kv.lrange('files', 0, -1);
    for (const item of raw) {
      const record = typeof item === 'string' ? JSON.parse(item) : item;
      if (record.id === id) {
        await kv.lrem('files', 1, item);
        break;
      }
    }
    if (url) await del(url);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
