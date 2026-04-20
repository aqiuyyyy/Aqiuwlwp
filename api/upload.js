import { put } from '@vercel/blob';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const filename = decodeURIComponent(req.headers['x-filename'] || 'upload');
    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    const record = {
      id: Date.now().toString(),
      name: filename,
      url: blob.url,
      size: buffer.length,
      type: req.headers['content-type'] || '',
      uploadedAt: new Date().toISOString(),
    };

    await redis.lpush('files', JSON.stringify(record));

    return res.status(200).json({ url: blob.url, record });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
