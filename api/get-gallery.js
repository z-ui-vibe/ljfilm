/**
 * 获取画廊数据 API
 * 读取 gallery-data.json 文件并返回
 */

const { readGalleryData } = require('./_lib/gallery-store');

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const data = await readGalleryData();
    
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('获取画廊数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取数据失败'
    });
  }
};
