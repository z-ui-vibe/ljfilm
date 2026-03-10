/**
 * 测试 API - 用于排查问题
 */

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  res.status(200).json({
    message: 'API 正常工作',
    adminPasswordExists: !!adminPassword,
    adminPasswordLength: adminPassword ? adminPassword.length : 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
};
