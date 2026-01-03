# 阿里云OSS集成说明

## ✅ 已完成的功能

### 1. 文件上传到OSS
- ✅ 文件自动上传到阿里云OSS存储
- ✅ 文件路径：`diary/{用户ID}/{文件名}`
- ✅ 上传后删除本地临时文件
- ✅ 返回OSS文件URL

### 2. 删除日记时同步删除OSS文件
- ✅ 删除日记时自动提取图片和视频的OSS对象名
- ✅ 批量删除OSS中的文件
- ✅ 异步删除，不阻塞响应

### 3. 图片压缩显示
- ✅ 日记详情页图片以压缩格式显示（宽度400px，质量80%，webp格式）
- ✅ 点击图片预览原图（完整分辨率）
- ✅ 使用阿里云OSS图片处理参数

### 4. 视频缩略图
- ✅ 视频自动生成封面（截取第1秒的画面）
- ✅ 点击播放完整视频
- ✅ 使用阿里云OSS视频截帧功能

## 📝 OSS配置

在 `.env` 文件中已配置：

```env
# 阿里云OSS配置
OSS_REGION=oss-cn-wuhan-lr
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=xp-cdn-oss
```

## 🎯 使用说明

### 上传流程
1. 用户选择图片/视频
2. 文件先上传到服务器临时目录
3. 服务器将文件上传到阿里云OSS
4. 删除本地临时文件
5. 返回OSS文件URL给前端

### 查看流程
1. **列表/详情页**：显示压缩后的图片（加载更快）
   - 图片：宽度400px，质量80%，webp格式
   - 视频：显示第1秒截图作为封面
   
2. **点击预览**：
   - 图片：使用原图URL进行预览
   - 视频：点击播放完整视频

### 删除流程
1. 用户删除日记
2. 从数据库获取图片和视频URL
3. 提取OSS对象名（路径）
4. 删除数据库记录
5. 异步批量删除OSS文件

## 🔧 技术实现

### 后端关键文件
- `server/config/oss.js` - OSS配置和工具函数
- `server/routes/upload.js` - 文件上传路由（上传到OSS）
- `server/controllers/diaryController.js` - 日记控制器（删除时清理OSS）

### 前端关键修改
- `pages/detail/detail.vue` - 详情页（压缩图片显示、原图预览、视频封面）
- `pages/write/write.vue` - 写日记页（兼容OSS URL）

## 📊 阿里云OSS图片处理参数

### 压缩显示
```
?x-oss-process=image/resize,w_400/quality,q_80/format,webp
```
- `resize,w_400` - 宽度调整为400px
- `quality,q_80` - 质量80%
- `format,webp` - 转换为webp格式

### 视频截帧
```
?x-oss-process=video/snapshot,t_1000,f_jpg,w_400,h_300,m_fast
```
- `t_1000` - 第1秒（1000毫秒）
- `f_jpg` - JPG格式
- `w_400,h_300` - 宽400px，高300px
- `m_fast` - 快速模式

## 🚀 启动步骤

1. **确认依赖已安装**：
```bash
cd server
npm install ali-oss
```

2. **检查.env配置**：
确保OSS配置正确

3. **重启后端服务**：
```bash
npm run dev
```

4. **前端运行**：
在HBuilderX中重新运行项目

## ⚠️ 注意事项

1. **OSS权限**：确保AccessKey有权限上传和删除文件
2. **跨域配置**：在阿里云OSS控制台配置跨域规则（CORS）
3. **费用**：OSS存储和流量会产生费用，请关注阿里云账单
4. **文件命名**：使用时间戳+随机数避免文件名冲突
5. **本地测试**：确保网络可以访问阿里云OSS

## 🎨 优化建议

1. **CDN加速**：可以为OSS Bucket配置CDN加速访问
2. **图片格式**：已自动转换为webp格式，节省流量
3. **懒加载**：可以为图片列表添加懒加载优化
4. **水印**：可以通过OSS参数添加水印
5. **视频转码**：可以使用阿里云媒体处理服务转码视频

## 📖 相关文档

- [阿里云OSS Node.js SDK](https://help.aliyun.com/document_detail/32068.html)
- [OSS图片处理](https://help.aliyun.com/document_detail/44688.html)
- [OSS视频截帧](https://help.aliyun.com/document_detail/64555.html)
