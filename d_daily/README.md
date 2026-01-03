# 每日日记 - Daily Diary App

一个功能完整的日记应用，支持用户注册登录、日记撰写、日历查看、数据统计等功能。基于 uni-app + Koa2 + MySQL 开发，支持多端运行。

> 📝 记录生活，留住美好时光

## 🌟 功能特点

### 📝 核心功能
- ✅ 用户注册/登录系统（JWT认证）
- ✅ 日记撰写与编辑（支持图片、视频）
- ✅ 日历视图展示（标记有日记的日期）
- ✅ 心情与天气记录（8种心情、8种天气）
- ✅ 日记列表（支持年月筛选、心情筛选）
- ✅ 日记搜索（关键词搜索、结果高亮）
- ✅ 数据统计（心情分布、天气统计、月度图表）
- ✅ 文件上传（阿里云OSS）
- ✅ 用户中心（个人信息、统计数据）

### 🎨 界面设计
- 🎯 现代化渐变色设计（紫蓝色主题）
- 📱 响应式卡片式布局
- 💫 流畅的动画效果
- 🌈 直观的用户体验
- 📊 数据可视化图表

## 🛠️ 技术栈

### 前端
- **框架**: uni-app (Vue 2.x)
- **UI**: 自定义组件 + Emoji
- **状态管理**: 本地存储 + API
- **跨平台**: H5、微信小程序、APP等
- **文件上传**: 阿里云OSS

### 后端
- **框架**: Koa2
- **数据库**: MySQL
- **认证**: JWT
- **加密**: Bcryptjs
- **文件存储**: 阿里云OSS

## 🚀 快速开始

### 📋 环境要求
- Node.js >= 14.0.0
- MySQL >= 5.7
- HBuilderX（推荐） 或 uni-app CLI

### ⚡ 5分钟快速启动

详见 [快速启动.md](./快速启动.md)

**简要步骤**：

1. **启动后端**
   ```bash
   cd server
   npm install
   # 配置 .env 文件（设置数据库密码）
   npm start
   ```

2. **启动前端**
   ```bash
   npm install
   # 配置 utils/config.js（设置API地址）
   npm run dev:h5
   ```

3. **开始使用**
   - 注册账号
   - 写第一篇日记
   - 探索所有功能

## 📖 文档导航

- 📘 [快速启动指南](./快速启动.md) - 5分钟上手
- 📗 [使用说明](./使用说明.md) - 详细功能说明
- 📙 [功能清单](./FEATURES.md) - 完整功能列表
- 📕 [开发总结](./开发完成总结.md) - 技术详情
- 📔 [后端API文档](./server/README.md) - API接口详情
- 📓 [OSS集成说明](./OSS集成说明.md) - 文件上传配置
- 🎨 [TabBar图标说明](./static/图标说明.md) - 图标制作指南

## 📁 项目结构

```
daily/
├── pages/                      # 页面目录
│   ├── login/                  # 登录页
│   ├── register/               # 注册页
│   ├── index/                  # 首页（日历）
│   ├── write/                  # 写日记页
│   ├── detail/                 # 日记详情页
│   ├── list/                   # 日记列表页
│   ├── search/                 # 搜索页
│   ├── stats/                  # 统计页
│   └── mine/                   # 我的页面
├── api/                        # API接口封装
│   ├── auth.js                 # 认证接口
│   └── diary.js                # 日记接口
├── utils/                      # 工具类
│   ├── config.js               # 配置文件
│   ├── request.js              # 请求封装
│   └── auth.js                 # 认证工具
├── static/                     # 静态资源
├── server/                     # 后端服务
│   ├── app.js                  # 应用入口
│   ├── config/                 # 配置文件
│   ├── controllers/            # 控制器
│   ├── middleware/             # 中间件
│   └── routes/                 # 路由
├── App.vue                     # 应用根组件
├── main.js                     # 应用入口
├── pages.json                  # 页面配置
├── manifest.json               # 应用配置
└── package.json                # 依赖配置
```

## 📱 页面展示

### 核心页面
1. **登录/注册页** - 用户认证入口
2. **首页（日历）** - 日历视图，标记日记日期
3. **写日记页** - 记录心情、天气、内容、图片、视频
4. **日记详情页** - 完整内容展示，支持编辑删除
5. **日记列表页** - 多维度筛选，快速浏览
6. **搜索页** - 关键词搜索，结果高亮
7. **统计页** - 数据可视化，心情分析
8. **我的页面** - 个人中心，功能入口

## 🔌 API 接口

### 认证接口
```
POST   /api/auth/register        注册
POST   /api/auth/login           登录
GET    /api/auth/userinfo        获取用户信息
PUT    /api/auth/userinfo        更新用户信息
POST   /api/auth/change-password 修改密码
```

### 日记接口
```
POST   /api/diary/save           保存日记
GET    /api/diary/:date          获取单篇日记
GET    /api/diary                获取所有日记
GET    /api/diary/stats/all      获取统计信息
DELETE /api/diary/:date          删除日记
GET    /api/diary/search/keyword 搜索日记
```

### 上传接口
```
POST   /api/upload/single        单文件上传
POST   /api/upload/batch         批量上传
DELETE /api/upload/delete        删除文件
```

## 💾 数据库设计

### users 表
- id, username, password, nickname
- email, phone, avatar
- created_at, updated_at

### diaries 表
- id, user_id, diary_date, content
- mood, weather, images, videos
- created_at, updated_at
- UNIQUE(user_id, diary_date)

## 🔒 安全特性

- ✅ 密码 bcrypt 加密存储
- ✅ JWT Token 认证机制
- ✅ Token过期自动跳转
- ✅ 请求参数验证
- ✅ SQL 注入防护
- ✅ XSS 攻击防护
- ✅ 用户数据隔离

## 🎯 核心功能详解

### 日历视图
- 月份切换浏览
- 标记有日记的日期（小圆点）
- 点击日期查看/编辑日记
- 今天快速跳转

### 日记编辑
- 心情选择（8种emoji）
- 天气选择（8种emoji）
- 富文本内容（最多5000字）
- 图片上传（最多9张）
- 视频上传（最多9个）
- 字数实时统计

### 数据统计
- **基础统计**: 记录天数、总字数、连续天数、日均字数
- **心情分布**: 进度条可视化，显示占比
- **天气统计**: 网格展示，统计次数
- **月度图表**: 柱状图展示每月日记数量

### 搜索功能
- 关键词模糊搜索
- 搜索结果高亮显示
- 显示结果数量
- 快速跳转详情

## 📊 技术亮点

1. **跨平台支持** - 一套代码，多端运行
2. **现代化UI** - 渐变色设计，流畅动画
3. **数据可视化** - 图表展示，直观清晰
4. **性能优化** - 图片压缩、懒加载、缓存
5. **安全可靠** - JWT认证、密码加密、数据隔离
6. **完整功能** - 从注册到统计，闭环体验

## 📝 待优化功能

### 近期计划
- [ ] 编辑用户资料界面
- [ ] 完整的修改密码流程
- [ ] 写日记提醒通知
- [ ] 数据备份与恢复
- [ ] 日记导出（PDF/图片）
- [ ] 主题切换（深色模式）
- [ ] TabBar图标制作

### 长期规划
- [ ] 日记标签系统
- [ ] 日记分类管理
- [ ] 天气自动获取
- [ ] 位置记录
- [ ] 分享功能
- [ ] 语音记录
- [ ] 手写输入

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 代码风格：遵循 ESLint 规则
- 提交信息：使用语义化提交
- 分支管理：功能分支开发

## 📄 开源协议

MIT License

## 👨‍💻 作者信息

- 开发时间：2025年12月31日
- 版本：v1.0.0
- 状态：核心功能已完成，可正常使用

## 🙏 致谢

感谢以下开源项目：
- [uni-app](https://uniapp.dcloud.net.cn/)
- [Vue.js](https://cn.vuejs.org/)
- [Koa.js](https://koajs.com/)
- [阿里云OSS](https://www.aliyun.com/product/oss)

---

💡 **快速链接**
- 🚀 [5分钟快速启动](./快速启动.md)
- 📖 [详细使用说明](./使用说明.md)
- 🔧 [后端API文档](./server/README.md)
- ✨ [功能完整清单](./FEATURES.md)

**祝您使用愉快！** 📝✨
