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
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/*', 'audio/*', 'application/*', 'text/*'],
          tokenPayload: JSON.stringify({}), // 可放自定义数据
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
