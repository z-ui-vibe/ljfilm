# 在线摄影作品集网站 - 部署指南

## 项目概述

这是一个基于 Vercel + Cloudinary + Vercel Blob 的在线摄影作品集网站，支持：
- 在线展示照片画廊
- 浏览器内直接上传照片
- 创建/管理分类
- 照片点赞收藏功能
- 响应式设计（苹果风格）

---

## 快速开始

### 1. 注册必要账号

#### Cloudinary（图片存储）
1. 访问 https://cloudinary.com
2. 点击 "Sign up for free" 注册
3. 注册后进入 Dashboard
4. 记录以下信息：
   - **Cloud name**（如云: `myphotos`）
   - **API Key**（如: `123456789012345`）
   - **API Secret**（点击齿轮图标查看）

#### Vercel（网站托管）
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 授权 Vercel 访问你的 GitHub 仓库
4. 在 Vercel 项目里启用 **Storage > Blob**

#### GitHub（代码托管）
确保你已有 GitHub 账号

---

### 2. 准备项目代码

#### 2.1 初始化 Git 仓库

```bash
cd "/Volumes/T7 Shield/ai课代表"
git init
git add .
git commit -m "Initial commit"
```

#### 2.2 创建 GitHub 仓库

1. 访问 https://github.com/new
2. Repository name: `photo-portfolio`
3. 选择 Public（免费）或 Private
4. 不要勾选 "Initialize this repository with a README"
5. 点击 "Create repository"
6. 复制推送命令，如：
   ```bash
   git remote add origin https://github.com/你的用户名/photo-portfolio.git
   git branch -M main
   git push -u origin main
   ```

---

### 3. 部署到 Vercel

#### 3.1 导入项目

1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你的 `photo-portfolio` 仓库
4. 点击 "Import"

#### 3.2 配置项目

- **Project Name**: `photo-portfolio`（或自定义）
- **Framework Preset**: `Other`
- **Root Directory**: `./`（保持不变）

#### 3.3 设置环境变量

展开 "Environment Variables" 区域，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ADMIN_PASSWORD` | 你设置的管理密码 | 后台登录密码，建议复杂一些 |
| `CLOUDINARY_CLOUD_NAME` | 你的 Cloud name | 从 Cloudinary Dashboard 获取 |
| `CLOUDINARY_API_KEY` | 你的 API Key | 从 Cloudinary Dashboard 获取 |
| `CLOUDINARY_API_SECRET` | 你的 API Secret | 从 Cloudinary Dashboard 获取 |
| `BLOB_READ_WRITE_TOKEN` | 你的 Blob Token | 从 Vercel Storage > Blob 获取，用于持久化保存分类、照片元数据和喜欢状态 |

重要：
- `ADMIN_PASSWORD` 现在只从 **Vercel Dashboard > Settings > Environment Variables** 读取
- 不要再把密码写在代码文件里
- 如果你修改了后台密码，保存后需要等待 Vercel 重新部署完成

#### 3.3.1 启用 Vercel Blob

1. 打开你的 Vercel 项目
2. 点击顶部或侧边的 **Storage**
3. 选择 **Blob**
4. 点击 **Create Database / Create Store**
5. 创建完成后，进入该 Blob 存储页
6. 找到并复制 `BLOB_READ_WRITE_TOKEN`
7. 回到 **Settings > Environment Variables**，把它添加进去

#### 3.4 部署

点击 "Deploy" 按钮，等待约 1-2 分钟完成部署。

---

### 4. 配置完成

部署成功后，Vercel 会提供：
- **Production URL**: `https://photo-portfolio-xxx.vercel.app`（示例）
- **管理后台**: `https://photo-portfolio-xxx.vercel.app/admin.html`

记下这些地址！

---

### 5. 上传现有照片

#### 方法一：通过管理后台上传（推荐）

1. 访问管理后台：`https://你的域名/admin.html`
2. 输入密码登录（即你设置的 `ADMIN_PASSWORD`）
3. 创建分类（如：HP5 400、人像、风景等）
4. 点击分类，上传照片
5. 上传后，分类、照片列表和“喜欢/收藏”状态都会持久化保存在 Blob 中

#### 方法二：通过 Cloudinary 批量上传

1. 登录 Cloudinary
2. 进入 Media Library
3. 创建文件夹：`photo-portfolio/你的分类名/`
4. 拖拽上传所有照片
5. 记录每个照片的 URL，手动更新 `gallery-data.json`

---

## 日常使用

### 管理作品

1. 打开管理后台
2. 创建新分类或选择现有分类
3. 拖拽或点击上传照片
4. 支持批量上传（一次可选多张）
5. 点击照片右上角的 × 删除照片

### 分享网站

- 主站地址：`https://你的域名/` - 给访客访问
- 管理后台：`https://你的域名/admin.html` - 仅你自己使用

---

## 自定义域名（可选）

如果你想用自己的域名（如 `myphotos.com`）：

1. 购买域名（阿里云、腾讯云、GoDaddy 等）
2. 在 Vercel 项目设置中点击 "Domains"
3. 输入你的域名
4. 按照 Vercel 提供的 DNS 记录，在域名服务商处添加解析
5. 等待 DNS 生效（通常几分钟到几小时）

---

## 费用说明

| 服务 | 免费额度 | 超出后费用 |
|------|---------|-----------|
| **Vercel** | 每月 100GB 带宽、无限项目 | 按使用量计费 |
| **Cloudinary** | 25GB 存储、25GB 月流量 | 从 $25/月起 |
| **域名** | - | 约 70元/年 |

**个人使用免费额度完全够用！**

---

## 故障排除

### 照片上传失败

1. 检查 Cloudinary 环境变量是否设置正确
2. 检查 Cloudinary 免费额度是否用完
3. 查看 Vercel Functions 日志（Vercel Dashboard > 你的项目 > Functions）

### 网站打不开

1. 检查 Vercel 部署状态
2. 检查域名 DNS 解析是否正确
3. 尝试访问 Vercel 提供的默认域名（`.vercel.app`）

### 忘记管理密码

1. 登录 Vercel
2. 进入项目设置 > Environment Variables
3. 修改 `ADMIN_PASSWORD`
4. 重新部署项目（或等待自动重新部署）

---

## 更新网站

### 更新代码后重新部署

```bash
cd "/Volumes/T7 Shield/ai课代表"
git add .
git commit -m "更新内容"
git push
```

Vercel 会自动检测并重新部署。

### 本地开发

```bash
# 安装依赖
npm install

# 本地运行（需要设置 .env 文件）
npm run dev

# 或直接本地打开 index.html（部分功能受限）
```

---

## 备份数据

定期备份 `gallery-data.json` 文件：

1. 登录 Vercel
2. 进入项目 > Storage（或使用 Vercel CLI 下载）
3. 或者通过 API 获取：`https://你的域名/api/get-gallery`

---

## 技术支持

- Vercel 文档：https://vercel.com/docs
- Cloudinary 文档：https://cloudinary.com/documentation
- 项目问题：查看浏览器控制台日志或 Vercel Functions 日志

---

## 下一步升级（可选）

1. **添加评论功能**：集成 Disqus 或 Giscus
2. **访问统计**：添加 Google Analytics
3. **SEO 优化**：添加 meta 标签、站点地图
4. **更多主题**：支持深色/浅色模式切换
5. **多用户**：添加访客登录和互动功能

祝你的摄影网站顺利上线！