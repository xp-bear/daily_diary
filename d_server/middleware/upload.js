const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名: 时间戳-随机数-原文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的图片格式
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // 允许的视频格式
  const videoTypes = /mp4|mov|avi|mkv/;
  
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;
  
  if (imageTypes.test(ext) || videoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('只支持图片（jpg、png、gif、webp）和视频（mp4、mov、avi、mkv）格式'));
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制50MB
  }
});

module.exports = upload;
