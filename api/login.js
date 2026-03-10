/**
 * 登录验证 API
 * 只认 Vercel 环境变量中的 ADMIN_PASSWORD
 */

const { requireAdminPassword } = require('./_lib/auth');

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
  
  try {
    const { password } = req.body;
    const adminPassword = requireAdminPassword(res);
    if (!adminPassword) {
      return;
    }
    
    if (!password) {
      res.status(400).json({ success: false, error: '请输入密码' });
      return;
    }

    if (password === adminPassword) {
      res.status(200).json({
        success: true,
        message: '登录成功'
      });
    } else {
      res.status(401).json({
        success: false,
        error: '密码错误'
      });
    }
    
  } catch (error) {
    console.error('登录验证失败:', error);
    res.status(500).json({
      success: false,
      error: '验证失败: ' + error.message
    });
  }
};
