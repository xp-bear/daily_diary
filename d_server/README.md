# 每日日记后端服务

基于 Node.js + Koa2 + MySQL 的日记应用后端 API 服务。

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Koa2** - Web 框架
- **MySQL** - 关系型数据库
- **JWT** - 用户认证
- **Bcrypt** - 密码加密

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

修改 `.env` 文件中的数据库配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password  # 修改为你的 MySQL 密码
DB_NAME=daily_diary

# JWT 密钥（生产环境请修改）
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务启动后会自动：
- 创建数据库 `daily_diary`
- 创建 `users` 和 `diaries` 表
- 监听端口 3000

访问 http://localhost:3000/health 检查服务状态。

## API 接口文档

### 认证相关

#### 注册
- **POST** `/api/auth/register`
- **请求体**:
  ```json
  {
    "username": "user123",
    "password": "123456",
    "nickname": "小明",
    "email": "user@example.com",  // 可选
    "phone": "13800138000"         // 可选
  }
  ```

#### 登录
- **POST** `/api/auth/login`
- **请求体**:
  ```json
  {
    "username": "user123",
    "password": "123456"
  }
  ```

#### 获取用户信息（需认证）
- **GET** `/api/auth/userinfo`
- **请求头**: `Authorization: Bearer {token}`

#### 更新用户信息（需认证）
- **PUT** `/api/auth/userinfo`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "nickname": "新昵称",
    "email": "new@example.com",
    "phone": "13900139000",
    "avatar": "😊"
  }
  ```

#### 修改密码（需认证）
- **POST** `/api/auth/change-password`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "oldPassword": "123456",
    "newPassword": "654321"
  }
  ```

### 日记相关（所有接口需认证）

#### 保存日记（创建或更新）
- **POST** `/api/diary/save`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "date": "2025-12-30",
    "content": "今天的日记内容...",
    "mood": "😊",
    "weather": "☀️"
  }
  ```

#### 获取单篇日记
- **GET** `/api/diary/:date`
- **请求头**: `Authorization: Bearer {token}`
- **示例**: `/api/diary/2025-12-30`

#### 获取所有日记
- **GET** `/api/diary`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `year` - 年份（可选）
  - `month` - 月份（可选）
- **示例**: `/api/diary?year=2025&month=12`

#### 获取统计信息
- **GET** `/api/diary/stats/all`
- **请求头**: `Authorization: Bearer {token}`
- **返回**:
  ```json
  {
    "totalDays": 30,
    "totalWords": 15000,
    "continuousDays": 7
  }
  ```

#### 删除日记
- **DELETE** `/api/diary/:date`
- **请求头**: `Authorization: Bearer {token}`
- **示例**: `/api/diary/2025-12-30`

#### 搜索日记
- **GET** `/api/diary/search/keyword`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**: `keyword` - 搜索关键词
- **示例**: `/api/diary/search/keyword?keyword=开心`

## 数据库结构

### users 表
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  avatar VARCHAR(255) DEFAULT '😊',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### diaries 表
```sql
CREATE TABLE diaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  diary_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(10) DEFAULT '😊',
  weather VARCHAR(10) DEFAULT '☀️',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, diary_date)
);
```

## 项目结构

```
server/
├── app.js                 # 应用入口
├── package.json           # 依赖配置
├── .env                   # 环境变量
├── config/
│   └── database.js        # 数据库配置
├── controllers/
│   ├── authController.js  # 认证控制器
│   └── diaryController.js # 日记控制器
├── middleware/
│   └── auth.js            # JWT 认证中间件
└── routes/
    ├── auth.js            # 认证路由
    └── diary.js           # 日记路由
```

## 注意事项

1. **数据库连接**: 确保 MySQL 服务已启动，并且配置的用户有创建数据库的权限
2. **端口占用**: 默认使用 3000 端口，可通过修改 `.env` 中的 `PORT` 配置
3. **JWT 密钥**: 生产环境务必修改 `JWT_SECRET` 为复杂的随机字符串
4. **密码安全**: 密码使用 bcrypt 加密存储，不会明文保存
5. **CORS**: 已配置允许跨域，可根据需要调整 `app.js` 中的 CORS 配置

## 常见问题

### 数据库连接失败
检查 MySQL 服务是否启动，以及 `.env` 中的数据库配置是否正确。

### 端口被占用
修改 `.env` 文件中的 `PORT` 配置为其他端口。

### Token 失效
JWT token 默认有效期为 7 天，过期后需要重新登录。
