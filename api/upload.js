import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const blob = await put(file.name, file, {
      access: 'public',        // 公开直链（音乐外链可用）
      addRandomSuffix: true,   // 防止同名覆盖
    });

    return res.status(200).json({
      url: blob.url,
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
