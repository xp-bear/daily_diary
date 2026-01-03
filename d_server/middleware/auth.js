const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT 认证中间件
async function authMiddleware(ctx, next) {
  try {
    // 从请求头获取 token
    const token = ctx.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '未提供认证令牌',
        data: null
      };
      return;
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到 ctx.state
    ctx.state.user = {
      id: decoded.id,
      username: decoded.username
    };
    
    await next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '认证令牌已过期',
        data: null
      };
    } else if (error.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '无效的认证令牌',
        data: null
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '认证失败',
        data: null
      };
    }
  }
}

module.exports = authMiddleware;
