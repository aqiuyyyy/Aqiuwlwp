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
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/*', 'audio/*', 'video/*', 'application/*'],
        access: 'public',
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('上传完成:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
