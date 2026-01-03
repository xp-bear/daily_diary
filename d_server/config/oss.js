const OSS = require('ali-oss');
require('dotenv').config();

// 创建OSS客户端
function createOSSClient() {
  return new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.OSS_ENDPOINT || `https://${process.env.OSS_REGION}.aliyuncs.com`,
    secure: true // 使用HTTPS
  });
}

/**
 * 上传文件到OSS
 * @param {String} filePath - 本地文件路径
 * @param {String} objectName - OSS中的对象名称
 */
async function uploadToOSS(filePath, objectName) {
  const client = createOSSClient();
  try {
    const result = await client.put(objectName, filePath);
    return {
      url: result.url,
      name: result.name
    };
  } catch (error) {
    console.error('OSS上传失败:', error);
    throw error;
  }
}

/**
 * 删除OSS中的文件
 * @param {String} objectName - OSS中的对象名称
 */
async function deleteFromOSS(objectName) {
  const client = createOSSClient();
  try {
    await client.delete(objectName);
    console.log(`OSS文件删除成功: ${objectName}`);
    return true;
  } catch (error) {
    console.error('OSS删除失败:', error);
    throw error;
  }
}

/**
 * 批量删除OSS中的文件
 * @param {Array} objectNames - OSS中的对象名称数组
 */
async function batchDeleteFromOSS(objectNames) {
  if (!objectNames || objectNames.length === 0) {
    return;
  }
  
  const client = createOSSClient();
  try {
    const result = await client.deleteMulti(objectNames, { quiet: true });
    console.log(`OSS批量删除成功，共删除 ${objectNames.length} 个文件`);
    return result;
  } catch (error) {
    console.error('OSS批量删除失败:', error);
    throw error;
  }
}

/**
 * 获取OSS文件的访问URL（带图片处理参数）
 * @param {String} objectName - OSS中的对象名称
 * @param {Object} options - 图片处理选项
 */
function getOSSUrl(objectName, options = {}) {
  const client = createOSSClient();
  const { compress = false, width, height, quality = 80 } = options;
  
  // 基础URL
  let url = `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com/${objectName}`;
  
  // 如果需要压缩处理
  if (compress) {
    const params = [];
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    params.push(`q_${quality}`);
    
    url += `?x-oss-process=image/resize,${params.join(',')}/format,webp`;
  }
  
  return url;
}

/**
 * 从URL中提取OSS对象名称
 * @param {String} url - OSS文件URL
 */
function extractObjectName(url) {
  try {
    // 移除查询参数
    const urlWithoutParams = url.split('?')[0];
    
    // 提取路径部分
    const urlObj = new URL(urlWithoutParams);
    // 移除开头的斜杠
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error('提取对象名称失败:', error);
    return null;
  }
}

module.exports = {
  createOSSClient,
  uploadToOSS,
  deleteFromOSS,
  batchDeleteFromOSS,
  getOSSUrl,
  extractObjectName
};
