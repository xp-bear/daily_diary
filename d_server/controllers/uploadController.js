const path = require('path');

/**
 * 上传文件
 */
async function uploadFile(ctx) {
  try {
    const file = ctx.request.file;
    
    if (!file) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '没有上传文件',
        data: null
      };
      return;
    }
    
    // 返回文件信息
    const fileInfo = {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    };
    
    ctx.body = {
      code: 200,
      message: '上传成功',
      data: fileInfo
    };
  } catch (error) {
    console.error('上传文件失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '上传失败',
      data: null
    };
  }
}

/**
 * 批量上传文件
 */
async function uploadFiles(ctx) {
  try {
    const files = ctx.request.files;
    
    if (!files || files.length === 0) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '没有上传文件',
        data: null
      };
      return;
    }
    
    // 返回文件信息列表
    const fileList = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));
    
    ctx.body = {
      code: 200,
      message: '上传成功',
      data: fileList
    };
  } catch (error) {
    console.error('批量上传文件失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '上传失败',
      data: null
    };
  }
}

module.exports = {
  uploadFile,
  uploadFiles
};
