const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const json = require('koa-json');
const logger = require('koa-logger');
require('dotenv').config();

const { initDatabase, testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');
const uploadRoutes = require('./routes/upload');

const app = new Koa();
const router = new Router();

// 中间件
app.use(logger());
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}));
app.use(json());

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('服务器错误:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      code: ctx.status,
      message: err.message || '服务器内部错误',
      data: null
    };
    ctx.app.emit('error', err, ctx);
  }
});

// 健康检查
router.get('/health', async (ctx) => {
  const isDbConnected = await testConnection();
  ctx.body = {
    code: 200,
    message: 'Server is running',
    data: {
      status: 'ok',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    }
  };
});

// 路由
app.use(router.routes()).use(router.allowedMethods());
app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(diaryRoutes.routes()).use(diaryRoutes.allowedMethods());
app.use(uploadRoutes.routes()).use(uploadRoutes.allowedMethods());

// 启动服务器
async function start() {
  try {
    // 初始化数据库
    console.log('🚀 正在初始化数据库...');
    await initDatabase();
    
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('════════════════════════════════════════');
      console.log('  📝 每日日记后端服务启动成功！');
      console.log('════════════════════════════════════════');
      console.log(`  🌐 本地访问: http://localhost:${PORT}`);
      console.log(`  📱 局域网访问: http://192.168.1.4:${PORT}`);
      console.log(`  🔍 健康检查: http://localhost:${PORT}/health`);
      console.log(`  📚 API 文档:`);
      console.log(`     - POST   /api/auth/register        注册`);
      console.log(`     - POST   /api/auth/login           登录`);
      console.log(`     - GET    /api/auth/userinfo        获取用户信息`);
      console.log(`     - PUT    /api/auth/userinfo        更新用户信息`);
      console.log(`     - POST   /api/auth/change-password 修改密码`);
      console.log(`     - POST   /api/diary/save           保存日记`);
      console.log(`     - GET    /api/diary/:date          获取日记`);
      console.log(`     - GET    /api/diary                获取所有日记`);
      console.log(`     - GET    /api/diary/stats/all      获取统计`);
      console.log(`     - DELETE /api/diary/:date          删除日记`);
      console.log(`     - GET    /api/diary/search/keyword 搜索日记`);
      console.log('════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 错误监听
app.on('error', (err, ctx) => {
  console.error('应用错误:', err);
});

start();

module.exports = app;
