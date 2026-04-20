import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const username = req.headers['x-username'];
  if (!username) return res.status(200).json([]);

  try {
    const raw = await redis.lrange(`files:${username}`, 0, -1);
    const files = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item);
    return res.status(200).json(files);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
