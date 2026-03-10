/**
 * 获取画廊数据 API
 * 读取 gallery-data.json 文件并返回
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'gallery-data.json');

// 默认数据结构
const defaultData = {
  categories: [],
  lastUpdated: new Date().toISOString()
};

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    let data;
    
    // 检查数据文件是否存在
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(content);
    } else {
      // 文件不存在则创建默认文件
      data = defaultData;
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    }
    
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
