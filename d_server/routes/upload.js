const Router = require('koa-router');
const { koaBody } = require('koa-body');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const { uploadToOSS, extractObjectName } = require('../config/oss');

const router = new Router({
  prefix: '/api/upload'
});

// 单文件上传到OSS
router.post('/single', authMiddleware, koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '../uploads'),
    keepExtensions: true,
    maxFieldsSize: 50 * 1024 * 1024,
    onFileBegin: (name, file) => {
      const dir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const ext = path.extname(file.originalFilename || file.name);
      const basename = path.basename(file.originalFilename || file.name, ext);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = basename + '-' + uniqueSuffix + ext;
      file.filepath = path.join(dir, filename);
    }
  }
}), async (ctx) => {
  try {
    const file = ctx.request.files?.file;
    
    if (!file) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '没有上传文件',
        data: null
      };
      return;
    }
    
    const filename = path.basename(file.filepath);
    const userId = ctx.state.user.id;
    
    // 上传到OSS，使用用户ID作为目录前缀
    const ossObjectName = `diary/${userId}/${filename}`;
    const ossResult = await uploadToOSS(file.filepath, ossObjectName);
    
    // 删除本地临时文件
    fs.unlinkSync(file.filepath);
    
    const fileInfo = {
      filename: filename,
      originalname: file.originalFilename || file.name,
      mimetype: file.mimetype,
      size: file.size,
      url: ossResult.url,
      ossName: ossResult.name
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
});

// 多文件上传到OSS
router.post('/multiple', authMiddleware, koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '../uploads'),
    keepExtensions: true,
    maxFieldsSize: 50 * 1024 * 1024,
    multiples: true,
    onFileBegin: (name, file) => {
      const dir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const ext = path.extname(file.originalFilename || file.name);
      const basename = path.basename(file.originalFilename || file.name, ext);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = basename + '-' + uniqueSuffix + ext;
      file.filepath = path.join(dir, filename);
    }
  }
}), async (ctx) => {
  try {
    const files = ctx.request.files?.files;
    
    if (!files) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '没有上传文件',
        data: null
      };
      return;
    }
    
    // 处理单个文件和多个文件的情况
    const fileArray = Array.isArray(files) ? files : [files];
    const userId = ctx.state.user.id;
    
    const fileList = [];
    
    for (const file of fileArray) {
      const filename = path.basename(file.filepath);
      
      // 上传到OSS
      const ossObjectName = `diary/${userId}/${filename}`;
      const ossResult = await uploadToOSS(file.filepath, ossObjectName);
      
      // 删除本地临时文件
      fs.unlinkSync(file.filepath);
      
      fileList.push({
        filename: filename,
        originalname: file.originalFilename || file.name,
        mimetype: file.mimetype,
        size: file.size,
        url: ossResult.url,
        ossName: ossResult.name
      });
    }
    
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
});

module.exports = router;
