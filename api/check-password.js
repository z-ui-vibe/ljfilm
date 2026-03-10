/**
 * 检查密码配置 API - 用于调试
 * 这个 API 会显示密码的前几位，帮助你确认配置是否正确
 */

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: '只允许 POST' });
    return;
  }
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  const inputPassword = req.body.password;
  
  if (!adminPassword) {
    res.status(500).json({
      error: '服务器未配置 ADMIN_PASSWORD 环境变量',
      solution: '请在 Vercel Settings > Environment Variables 中添加 ADMIN_PASSWORD'
    });
    return;
  }
  
  // 安全地显示密码提示（只显示前2位）
  const passwordHint = adminPassword.substring(0, 2) + '***';
  
  res.status(200).json({
    serverPasswordHint: passwordHint,
    serverPasswordLength: adminPassword.length,
    inputPasswordLength: inputPassword ? inputPassword.length : 0,
    match: inputPassword === adminPassword,
    message: inputPassword === adminPassword ? '密码匹配' : '密码不匹配'
  });
};
