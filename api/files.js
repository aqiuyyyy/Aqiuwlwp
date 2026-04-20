import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const username = req.headers['x-username'];

  try {
    if (username) {
      // 登录用户：只返回自己的文件
      const raw = await redis.lrange(`files:${username}`, 0, -1);
      const files = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item);
      return res.status(200).json(files);
    } else {
      // 未登录：返回所有用户的文件
      const keys = await redis.keys('files:*');
      if (!keys || keys.length === 0) return res.status(200).json([]);
      let allFiles = [];
      for (const key of keys) {
        const raw = await redis.lrange(key, 0, -1);
        const files = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item);
        allFiles = allFiles.concat(files);
      }
      allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      return res.status(200).json(allFiles);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
