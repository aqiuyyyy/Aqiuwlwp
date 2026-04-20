import { handleUpload } from '@vercel/blob/client';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const jsonResponse = await handleUpload({
      req,
      onBeforeGenerateToken: async (pathname /* , clientPayload */) => {
        // 这里可以加权限检查（目前允许所有人上传，适合个人网盘）
        return {
          allowedContentTypes: ['image/*', 'audio/*', 'video/*', 'application/*'],
          access: 'public',           // 公开直链，音乐外链可用
          addRandomSuffix: true,      // 防止同名覆盖
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('✅ Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload token error:', error);
    return res.status(400).json({ error: error.message });
  }
}
