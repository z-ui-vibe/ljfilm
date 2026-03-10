const fs = require('fs');
const path = require('path');
const { put, list } = require('@vercel/blob');

const DATA_FILE = path.join(process.cwd(), 'gallery-data.json');
const BLOB_PATHNAME = 'gallery-data.json';

function createDefaultData() {
  return {
    categories: [],
    lastUpdated: new Date().toISOString()
  };
}

function normalizeData(data) {
  const safeData = data && typeof data === 'object' ? data : createDefaultData();
  safeData.categories = Array.isArray(safeData.categories) ? safeData.categories : [];

  safeData.categories.forEach((category) => {
    category.id = category.id || '';
    category.name = category.name || '';
    category.cover = category.cover || '';
    category.photos = Array.isArray(category.photos) ? category.photos : [];

    category.photos.forEach((photo) => {
      photo.src = photo.src || '';
      photo.caption = photo.caption || '';
      photo.publicId = photo.publicId || '';
      photo.liked = Boolean(photo.liked);
      photo.uploadedAt = photo.uploadedAt || null;
    });

    if (!category.cover && category.photos[0]) {
      category.cover = category.photos[0].src;
    }
  });

  safeData.lastUpdated = safeData.lastUpdated || new Date().toISOString();
  return safeData;
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFromBlob() {
  const result = await list({
    prefix: BLOB_PATHNAME,
    limit: 10,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  const blob = result.blobs.find((item) => item.pathname === BLOB_PATHNAME) || result.blobs[0];
  if (!blob) {
    return createDefaultData();
  }

  const response = await fetch(blob.url);
  if (!response.ok) {
    throw new Error('读取 Blob 数据失败');
  }

  return normalizeData(await response.json());
}

function readFromLocalFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const data = createDefaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return data;
  }

  return normalizeData(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
}

async function readGalleryData() {
  if (hasBlobToken()) {
    try {
      return await readFromBlob();
    } catch (error) {
      console.error('读取 Blob 失败，回退本地文件:', error);
    }
  }

  return readFromLocalFile();
}

async function writeToBlob(data) {
  const normalized = normalizeData(data);
  normalized.lastUpdated = new Date().toISOString();

  await put(BLOB_PATHNAME, JSON.stringify(normalized, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return normalized;
}

function writeToLocalFile(data) {
  const normalized = normalizeData(data);
  normalized.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

async function writeGalleryData(data) {
  if (hasBlobToken()) {
    try {
      return await writeToBlob(data);
    } catch (error) {
      console.error('写入 Blob 失败，回退本地文件:', error);
    }
  }

  return writeToLocalFile(data);
}

module.exports = {
  createDefaultData,
  normalizeData,
  readGalleryData,
  writeGalleryData,
  hasBlobToken
};
