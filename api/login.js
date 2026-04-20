import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;
  const raw = await redis.get(`user:${username}`);
  if (!raw) return res.status(401).json({ error: '用户名不存在' });
  const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (user.password !== password) return res.status(401).json({ error: '密码错误' });
  return res.status(200).json({ success: true, username });
}
