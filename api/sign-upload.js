const cloudinary = require('cloudinary').v2;
const { requireAuthorizedRequest } = require('./_lib/auth');
const { readGalleryData } = require('./_lib/gallery-store');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: '只允许 POST 请求' });
    return;
  }

  if (!requireAuthorizedRequest(req, res)) {
    return;
  }

  try {
    const { categoryId } = req.body || {};
    if (!categoryId) {
      res.status(400).json({ success: false, error: '缺少分类 ID' });
      return;
    }

    const galleryData = await readGalleryData();
    const category = galleryData.categories.find((item) => item.id === categoryId);
    if (!category) {
      res.status(404).json({ success: false, error: '分类不存在' });
      return;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      res.status(500).json({ success: false, error: 'Cloudinary 环境变量未配置完整' });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `photo-portfolio/${categoryId}`;
    const eager = 'c_limit,w_1920,h_1080,q_auto:good';
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, eager },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
        folder,
        eager
      }
    });
  } catch (error) {
    console.error('生成上传签名失败:', error);
    res.status(500).json({ success: false, error: '生成上传签名失败: ' + error.message });
  }
};
