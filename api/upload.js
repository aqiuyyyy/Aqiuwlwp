import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const form = await req.formData ? req.formData() : new FormData(); // Vercel 处理
    const file = req.body.file || (await req.formData()).get('file'); // 适配

    if (!file) return res.status(400).json({ error: 'No file' });

    const blob = await put(file.name, file, {
      access: 'public',   // 公开可访问
    });

    res.json({ url: blob.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
