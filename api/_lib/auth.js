function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

function requireAdminPassword(res) {
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    res.status(500).json({
      success: false,
      error: '后台密码未配置，请在 Vercel 的 Environment Variables 中设置 ADMIN_PASSWORD'
    });
    return null;
  }

  return adminPassword;
}

function requireAuthorizedRequest(req, res) {
  const adminPassword = requireAdminPassword(res);
  if (!adminPassword) {
    return null;
  }

  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${adminPassword}`) {
    res.status(401).json({
      success: false,
      error: '未授权，请重新登录后台'
    });
    return null;
  }

  return adminPassword;
}

module.exports = {
  getAdminPassword,
  requireAdminPassword,
  requireAuthorizedRequest
};
