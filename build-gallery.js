/**
 * 根据本地文件夹结构生成画廊数据
 *
 * 用法：
 * 1. 在 index.html 同目录下建一个 photos 文件夹
 * 2. 在 photos 下为每个画廊建一个子文件夹，文件夹名 = 画廊名（如：街头、山景）
 * 3. 把该分类的图片放进对应子文件夹
 * 4. 在终端执行：node build-gallery.js
 * 5. 会更新 index.html 里的画廊数据，刷新网页即可看到
 *
 * 示例结构：
 *   photos/
 *     街头/
 *       1.jpg
 *       2.jpg
 *     山景/
 *       a.png
 *       b.png
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = __dirname;
const PHOTOS_DIR = path.join(PROJECT_DIR, 'photos');
const INDEX_HTML = path.join(PROJECT_DIR, 'index.html');

const IMG_EXT = /\.(jpg|jpeg|png|gif|webp)$/i;

function toWebPath(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function buildGalleryData() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.log('未找到 photos 文件夹，已在当前目录创建，请放入子文件夹和图片后重新运行。');
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    return [];
  }

  const entries = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true });
  const galleries = [];

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const folderName = ent.name;
    const folderPath = path.join(PHOTOS_DIR, folderName);
    const files = fs.readdirSync(folderPath)
      .filter((f) => IMG_EXT.test(f))
      .sort();

    if (files.length === 0) continue;

    const photos = files.map((f) => {
      const relPath = toWebPath(path.join('photos', folderName, f));
      const caption = path.basename(f, path.extname(f));
      return { src: relPath, caption };
    });

    const cover = toWebPath(path.join('photos', folderName, files[0]));
    const id = folderName.replace(/\s+/g, '_').replace(/[^\w\u4e00-\u9fa5_-]/g, '') || 'gallery';

    galleries.push({
      id,
      name: folderName,
      cover,
      photos,
    });
  }

  return galleries;
}

function updateIndexHtml(data) {
  let html = fs.readFileSync(INDEX_HTML, 'utf8');
  const marker = 'BUILD_GALLERY_DATA';
  const dataStr = JSON.stringify(data, null, 2);
  if (!html.includes(marker)) {
    console.log('index.html 中未找到 BUILD_GALLERY_DATA 占位符，请保持脚本与 index.html 在同一目录。');
    process.exit(1);
  }
  html = html.replace(marker, dataStr);
  fs.writeFileSync(INDEX_HTML, html, 'utf8');
}

const galleryData = buildGalleryData();
console.log('已扫描到 ' + galleryData.length + ' 个画廊：', galleryData.length ? galleryData.map((g) => g.name).join('、') : '无');
updateIndexHtml(galleryData);
console.log('已更新 index.html，刷新网页即可。');
