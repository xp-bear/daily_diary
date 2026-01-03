# 每日日记 📝 Daily Diary

> 一个功能完整的跨平台日记应用，记录生活，留住美好时光

基于 **uni-app + Koa2 + MySQL** 开发，支持H5、微信小程序、APP等多端运行。

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![uni-app](https://img.shields.io/badge/uni--app-3.0-brightgreen.svg)](https://uniapp.dcloud.net.cn/)

---

## ✨ 功能特点

### 📝 核心功能
- ✅ **用户系统** - 注册/登录、JWT认证、个人资料管理
- ✅ **日记编辑** - 富文本编辑、图片/视频上传、心情/天气记录
- ✅ **日历视图** - 月份切换、日期标记、快速跳转
- ✅ **日记管理** - 列表浏览、多维度筛选、关键词搜索
- ✅ **数据统计** - 记录天数、连续天数、心情分布、月度图表
- ✅ **智能提醒** - 自定义时间、星期重复、多种提醒方式
- ✅ **备份恢复** - 数据导出、恢复、自动备份

### 🎨 界面设计
- 🎯 现代化渐变色设计（紫蓝主题）
- 📱 响应式卡片布局
- 💫 流畅的过渡动画
- 🌈 直观的用户体验
- 📊 数据可视化图表

---

## 📸 应用截图

<div align="center">
  <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/typora/Screenshot_2026-01-03-17-10-59-513_uni.app.UNI5D0C0E5.jpg" alt="日历视图" width="30%" />
  <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/typora/Screenshot_2026-01-03-17-11-03-507_uni.app.UNI5D0C0E5.jpg" alt="日记列表" width="30%" />
  <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/typora/Screenshot_2026-01-03-17-11-14-072_uni.app.UNI5D0C0E5.jpg" alt="统计页面" width="30%" />
</div>

---

## 🚀 快速开始

### 📋 环境要求
- Node.js >= 14.0.0
- MySQL >= 5.7
- HBuilderX（推荐）或 uni-app CLI

### ⚡ 一键启动

#### 1️⃣ 启动后端服务
```bash
cd d_server
npm install
# 配置 .env 文件（设置数据库密码）
npm start
```

#### 2️⃣ 启动前端应用
```bash
cd d_daily
npm install
# 配置 utils/config.js（设置API地址）
npm run dev:h5  # H5端
# npm run dev:mp-weixin  # 微信小程序
# npm run dev:app  # APP
```

#### 3️⃣ 开始使用
- 访问 `http://localhost:8080`
- 注册账号并登录
- 开始记录你的第一篇日记 ✍️

> 💡 详细配置说明请查看：
> - [📘 前端快速启动指南](d_daily/快速启动.md)
> - [📕 后端API文档](d_server/README.md)

---

## 🛠️ 技术栈

### 前端技术
| 技术 | 说明 | 版本 |
|-----|------|-----|
| uni-app | 跨平台框架 | 3.0+ |
| Vue.js | 前端框架 | 2.x |
| uni-ui | UI组件库 | - |
| 阿里云OSS | 文件存储 | SDK 6.23.0 |

### 后端技术
| 技术 | 说明 | 版本 |
|-----|------|-----|
| Koa2 | Web框架 | 2.14.2 |
| MySQL | 数据库 | 5.7+ |
| JWT | 身份认证 | 9.0.2 |
| Bcrypt | 密码加密 | 2.4.3 |
| 阿里云OSS | 文件存储 | SDK 6.23.0 |

---

## 📁 项目结构

```
6.uniapp每日日记/
├── d_daily/                     # 前端应用
│   ├── pages/                   # 页面目录
│   │   ├── login/               # 登录页
│   │   ├── register/            # 注册页
│   │   ├── index/               # 首页（日历）
│   │   ├── write/               # 写日记
│   │   ├── detail/              # 日记详情
│   │   ├── list/                # 日记列表
│   │   ├── search/              # 搜索页
│   │   ├── stats/               # 统计页
│   │   ├── mine/                # 个人中心
│   │   ├── profile/             # 编辑资料
│   │   ├── reminder/            # 写日记提醒
│   │   └── backup/              # 备份与恢复
│   ├── api/                     # API接口封装
│   ├── utils/                   # 工具类
│   ├── static/                  # 静态资源
│   ├── App.vue                  # 应用根组件
│   ├── main.js                  # 入口文件
│   ├── pages.json               # 页面配置
│   └── manifest.json            # 应用配置
│
├── d_server/                    # 后端服务
│   ├── config/                  # 配置文件
│   │   ├── database.js          # 数据库配置
│   │   └── oss.js               # OSS配置
│   ├── controllers/             # 控制器
│   │   ├── authController.js    # 认证控制器
│   │   ├── diaryController.js   # 日记控制器
│   │   └── uploadController.js  # 上传控制器
│   ├── middleware/              # 中间件
│   │   └── auth.js              # JWT认证
│   ├── routes/                  # 路由
│   │   ├── auth.js              # 认证路由
│   │   ├── diary.js             # 日记路由
│   │   └── upload.js            # 上传路由
│   ├── app.js                   # 应用入口
│   ├── .env                     # 环境变量
│   └── package.json             # 依赖配置
│
└── README.md                    # 项目说明
```

---

## 📖 详细文档

| 文档 | 说明 |
|------|------|
| [📘 前端README](d_daily/README.md) | 前端应用详细说明 |
| [📗 快速启动指南](d_daily/快速启动.md) | 5分钟快速上手 |
| [📙 使用说明](d_daily/使用说明.md) | 功能使用教程 |
| [📕 功能清单](d_daily/FEATURES.md) | 完整功能列表 |
| [📔 开发总结](d_daily/开发完成总结.md) | 技术实现详情 |
| [📓 后端API文档](d_server/README.md) | API接口文档 |
| [📒 OSS集成说明](d_daily/OSS集成说明.md) | 文件上传配置 |

---

## 🔌 核心API接口

### 认证接口
```
POST   /api/auth/register        # 用户注册
POST   /api/auth/login           # 用户登录
GET    /api/auth/userinfo        # 获取用户信息
PUT    /api/auth/userinfo        # 更新用户信息
POST   /api/auth/change-password # 修改密码
```

### 日记接口
```
POST   /api/diary/save           # 保存日记
GET    /api/diary/:date          # 获取单篇日记
GET    /api/diary                # 获取所有日记
GET    /api/diary/stats/all      # 获取统计信息
DELETE /api/diary/:date          # 删除日记
GET    /api/diary/search/keyword # 搜索日记
```

### 上传接口
```
POST   /api/upload/single        # 单文件上传
POST   /api/upload/batch         # 批量上传
DELETE /api/upload/delete        # 删除文件
```

---

## 💾 数据库设计

### users 表（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 密码（加密） |
| nickname | VARCHAR(50) | 昵称 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(20) | 手机号 |
| avatar | VARCHAR(255) | 头像 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### diaries 表（日记表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID（外键） |
| diary_date | DATE | 日记日期（唯一） |
| content | TEXT | 日记内容 |
| mood | VARCHAR(10) | 心情emoji |
| weather | VARCHAR(10) | 天气emoji |
| images | TEXT | 图片URL（JSON） |
| videos | TEXT | 视频URL（JSON） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

## 🔒 安全特性

- ✅ **密码加密** - bcrypt加密存储，不保存明文
- ✅ **JWT认证** - Token机制，安全可靠
- ✅ **Token过期** - 自动检测并跳转登录
- ✅ **参数验证** - 严格的输入验证
- ✅ **SQL防注入** - 参数化查询
- ✅ **XSS防护** - 内容过滤和转义
- ✅ **数据隔离** - 用户数据完全隔离

---

## 📱 支持平台

- ✅ **H5** - 浏览器访问
- ✅ **微信小程序** - 微信生态
- ✅ **支付宝小程序** - 支付宝生态
- ✅ **Android APP** - 安卓应用
- ✅ **iOS APP** - 苹果应用
- ✅ **其他小程序** - 百度、字节跳动等

---

## 🎯 核心功能详解

### 📅 日历视图
- 月份自由切换浏览
- 智能标记有日记的日期
- 一键快速跳转到今天
- 点击日期查看/编辑日记

### ✍️ 日记编辑
- 8种心情emoji选择
- 8种天气emoji选择
- 富文本内容编辑（最多5000字）
- 图片上传（最多9张，支持压缩）
- 视频上传（最多9个，自动生成封面）
- 实时字数统计

### 📊 数据统计
- **基础统计**: 记录天数、总字数、连续天数、日均字数
- **心情分布**: 进度条可视化，显示各心情占比
- **天气统计**: 网格展示，统计各天气次数
- **月度图表**: 柱状图展示每月日记数量

### 🔍 搜索功能
- 关键词模糊搜索
- 搜索结果高亮显示
- 显示匹配结果数量
- 快速跳转到日记详情

---

## 📊 技术亮点

| 特点 | 说明 |
|------|------|
| 🌐 跨平台支持 | 一套代码，多端运行 |
| 🎨 现代化UI | 渐变色设计，流畅动画 |
| 📈 数据可视化 | 图表展示，直观清晰 |
| ⚡ 性能优化 | 图片压缩、懒加载、缓存 |
| 🔐 安全可靠 | JWT认证、密码加密、数据隔离 |
| 🎯 功能完整 | 从注册到统计，闭环体验 |
| 💾 智能备份 | 自动备份、恢复、历史记录 |
| 🔔 贴心提醒 | 自定义时间、重复、多种方式 |

---

## 📝 待优化功能

### 近期计划
- [ ] 完整的修改密码流程
- [ ] 日记导出（PDF/图片）
- [ ] 主题切换（深色模式）
- [ ] 更多心情和天气选项
- [ ] TabBar图标优化

### 长期规划
- [ ] 标签系统
- [ ] 日记分类管理
- [ ] 天气自动获取（基于定位）
- [ ] 位置记录（地图标记）
- [ ] 分享功能（生成精美卡片）
- [ ] 语音转文字记录
- [ ] 手写输入支持
- [ ] 云同步优化

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

### 贡献步骤
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范
- 代码风格：遵循 ESLint 规则
- 提交信息：使用语义化提交规范
- 分支管理：功能分支独立开发

---

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源，你可以自由使用、修改和分发。

---

## 👨‍💻 项目信息

- **开发时间**: 2025年12月 - 2026年1月
- **当前版本**: v1.0.0
- **开发状态**: ✅ 核心功能已完成，可正常使用
- **技术栈**: uni-app + Vue.js + Koa2 + MySQL

---

## 🙏 致谢

感谢以下优秀的开源项目：

- [uni-app](https://uniapp.dcloud.net.cn/) - 跨平台应用框架
- [Vue.js](https://cn.vuejs.org/) - 渐进式JavaScript框架
- [Koa.js](https://koajs.com/) - 现代化Node.js框架
- [MySQL](https://www.mysql.com/) - 开源关系型数据库
- [阿里云OSS](https://www.aliyun.com/product/oss) - 对象存储服务

---

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 📧 提交 [Issue](https://github.com/your-repo/issues)
- 💬 发起 [Discussion](https://github.com/your-repo/discussions)

---

<div align="center">

### 💡 快速链接

[🚀 5分钟快速启动](d_daily/快速启动.md) | [📖 详细使用说明](d_daily/使用说明.md) | [🔧 后端API文档](d_server/README.md) | [✨ 功能完整清单](d_daily/FEATURES.md)

---

**⭐ 如果这个项目对你有帮助，请给一个Star支持一下！**