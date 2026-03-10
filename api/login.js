/**
 * 登录验证 API
 * 验证管理员密码是否正确
 */

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
    // 优先使用环境变量，如果没有设置则使用硬编码密码
    const adminPassword = process.env.ADMIN_PASSWORD || 'ljfilm123';
    
    console.log('登录请求收到');
    console.log('请求体:', req.body);
    console.log('环境变量ADMIN_PASSWORD是否存在:', !!adminPassword);
    
    if (!password) {
      console.log('错误: 密码为空');
      res.status(400).json({ error: '请输入密码' });
      return;
    }
    
    if (!adminPassword) {
      console.log('错误: 服务器未配置ADMIN_PASSWORD环境变量');
      res.status(500).json({ error: '服务器未配置密码' });
      return;
    }
    
    // 验证密码
    if (password === adminPassword) {
      console.log('密码验证成功');
      res.status(200).json({
        success: true,
        message: '登录成功'
      });
    } else {
      console.log('密码验证失败: 密码不匹配');
      res.status(401).json({
        success: false,
        error: '密码错误'
      });
    }
    
  } catch (error) {
    console.error('登录验证失败:', error);
    res.status(500).json({
      error: '验证失败: ' + error.message
    });
  }
};
