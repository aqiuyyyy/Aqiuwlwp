import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  if (username.length < 2 || username.length > 20) return res.status(400).json({ error: '用户名长度2-20位' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少6位' });

  const exists = await redis.get(`user:${username}`);
  if (exists) return res.status(400).json({ error: '用户名已存在' });

  await redis.set(`user:${username}`, JSON.stringify({ username, password }));
  return res.status(200).json({ success: true });
}
