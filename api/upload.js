import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,   // 必须关闭，否则大文件上传会失败
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel Blob 推荐写法
    const formData = await req.formData ? req.formData() : new FormData();
    const file = formData.get('file');

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // 上传到 Vercel Blob（公开访问）
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return res.status(200).json({
      url: blob.url,
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
}
