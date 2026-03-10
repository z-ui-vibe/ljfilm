/**
 * 更新画廊数据 API
 * 创建/删除分类，移动/删除照片
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'gallery-data.json');

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 验证管理密码（优先使用环境变量，如果没有则使用硬编码密码）
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'ljfilm123';
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    res.status(401).json({ error: '未授权' });
    return;
  }
  
  try {
    // 读取现有数据
    let galleryData = { categories: [] };
    if (fs.existsSync(DATA_FILE)) {
      galleryData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    
    const { action } = req.body;
    
    switch (action) {
      case 'createCategory': {
        const { name } = req.body;
        if (!name) {
          res.status(400).json({ error: '分类名称不能为空' });
          return;
        }
        
        const id = name.replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').toLowerCase();
        
        // 检查是否已存在
        if (galleryData.categories.find(c => c.id === id)) {
          res.status(400).json({ error: '分类已存在' });
          return;
        }
        
        const newCategory = {
          id: id,
          name: name,
          cover: '',
          photos: []
        };
        
        galleryData.categories.push(newCategory);
        break;
      }
      
      case 'deleteCategory': {
        const { categoryId } = req.body;
        const index = galleryData.categories.findIndex(c => c.id === categoryId);
        if (index === -1) {
          res.status(404).json({ error: '分类不存在' });
          return;
        }
        
        galleryData.categories.splice(index, 1);
        break;
      }
      
      case 'deletePhoto': {
        const { categoryId, photoIndex } = req.body;
        const category = galleryData.categories.find(c => c.id === categoryId);
        if (!category) {
          res.status(404).json({ error: '分类不存在' });
          return;
        }
        
        if (photoIndex < 0 || photoIndex >= category.photos.length) {
          res.status(400).json({ error: '照片索引无效' });
          return;
        }
        
        category.photos.splice(photoIndex, 1);
        
        // 更新封面
        if (category.photos.length > 0) {
          category.cover = category.photos[0].src;
        } else {
          category.cover = '';
        }
        break;
      }
      
      default:
        res.status(400).json({ error: '未知操作' });
        return;
    }
    
    // 更新最后更新时间
    galleryData.lastUpdated = new Date().toISOString();
    
    // 保存数据
    fs.writeFileSync(DATA_FILE, JSON.stringify(galleryData, null, 2), 'utf8');
    
    res.status(200).json({
      success: true,
      data: galleryData
    });
    
  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({
      error: '更新失败: ' + error.message
    });
  }
};
