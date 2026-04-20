import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,   // 必须关闭，否则大文件/音乐上传失败
  },
};

export default async function handler(req, res) {
  // 处理 OPTIONS 预检请求（解决 CORS）
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

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
      access: 'public',           // 公开外链，音乐可直接播放
      addRandomSuffix: true,      // 防止重名覆盖
    });

    res.status(200).json({
      url: blob.url,
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Blob upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
