export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.body || {};
    // Vercel Blob 会自动处理 token
    const uploadUrl = `https://blob.vercel-storage.com/${filename || 'file'}`; // 实际由 put 生成，但这里简化

    res.status(200).json({ url: uploadUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
