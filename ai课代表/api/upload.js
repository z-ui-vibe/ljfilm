/**
 * 上传照片 API
 * 接收 base64 图片数据，上传到 Cloudinary，更新画廊数据
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'gallery-data.json');

// 初始化 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    res.status(405).json({ error: '只允许 POST 请求' });
    return;
  }
  
  // 验证管理密码
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    res.status(401).json({ error: '未授权' });
    return;
  }
  
  try {
    const { image, categoryId, caption } = req.body;
    
    if (!image || !categoryId) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    
    // 读取现有数据
    let galleryData = { categories: [] };
    if (fs.existsSync(DATA_FILE)) {
      galleryData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    
    // 查找分类
    const category = galleryData.categories.find(c => c.id === categoryId);
    if (!category) {
      res.status(404).json({ error: '分类不存在' });
      return;
    }
    
    // 上传到 Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: `photo-portfolio/${categoryId}`,
      resource_type: 'image',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto:good' }
      ]
    });
    
    // 添加照片到分类
    const newPhoto = {
      src: uploadResult.secure_url,
      caption: caption || `照片 ${category.photos.length + 1}`,
      publicId: uploadResult.public_id,
      uploadedAt: new Date().toISOString()
    };
    
    category.photos.push(newPhoto);
    
    // 如果是分类的第一张照片，设为封面
    if (category.photos.length === 1) {
      category.cover = uploadResult.secure_url;
    }
    
    // 更新最后更新时间
    galleryData.lastUpdated = new Date().toISOString();
    
    // 保存数据
    fs.writeFileSync(DATA_FILE, JSON.stringify(galleryData, null, 2), 'utf8');
    
    res.status(200).json({
      success: true,
      photo: newPhoto,
      category: category
    });
    
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({
      error: '上传失败: ' + error.message
    });
  }
};
