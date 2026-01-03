const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

// 用户注册
async function register(ctx) {
  const { username, password, nickname, email, phone } = ctx.request.body;

  // 验证必填字段
  if (!username || !password || !nickname) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '用户名、密码和昵称不能为空',
      data: null
    };
    return;
  }

  // 验证用户名格式
  if (!/^[a-zA-Z0-9]{6,20}$/.test(username)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '用户名必须是6-20位字母或数字',
      data: null
    };
    return;
  }

  // 验证密码长度
  if (password.length < 6) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '密码长度不能少于6位',
      data: null
    };
    return;
  }

  try {
    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '用户名已存在',
        data: null
      };
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入用户数据
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname, email, phone) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nickname, email || null, phone || null]
    );

    // 生成 JWT token
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    ctx.body = {
      code: 200,
      message: '注册成功',
      data: {
        token,
        userInfo: {
          id: result.insertId,
          username,
          nickname,
          email: email || '',
          phone: phone || '',
          avatar: '😊'
        }
      }
    };
  } catch (error) {
    console.error('注册失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '注册失败，请稍后重试',
      data: null
    };
  }
}

// 用户登录
async function login(ctx) {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '用户名和密码不能为空',
      data: null
    };
    return;
  }

  try {
    // 查询用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '账号不存在',
        data: null
      };
      return;
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '密码错误',
        data: null
      };
      return;
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    ctx.body = {
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar
        }
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '登录失败，请稍后重试',
      data: null
    };
  }
}

// 获取当前用户信息
async function getUserInfo(ctx) {
  const userId = ctx.state.user.id;

  try {
    const [users] = await pool.query(
      'SELECT id, username, nickname, email, phone, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '用户不存在',
        data: null
      };
      return;
    }

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: users[0]
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '获取用户信息失败',
      data: null
    };
  }
}

// 更新用户信息
async function updateUserInfo(ctx) {
  const userId = ctx.state.user.id;
  const { nickname, email, phone, avatar } = ctx.request.body;

  try {
    const updates = [];
    const values = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email || null);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone || null);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '没有要更新的字段',
        data: null
      };
      return;
    }

    values.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 获取更新后的用户信息
    const [users] = await pool.query(
      'SELECT id, username, nickname, email, phone, avatar FROM users WHERE id = ?',
      [userId]
    );

    ctx.body = {
      code: 200,
      message: '更新成功',
      data: users[0]
    };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '更新失败',
      data: null
    };
  }
}

// 修改密码
async function changePassword(ctx) {
  const userId = ctx.state.user.id;
  const { oldPassword, newPassword } = ctx.request.body;

  if (!oldPassword || !newPassword) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '旧密码和新密码不能为空',
      data: null
    };
    return;
  }

  if (newPassword.length < 6) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '新密码长度不能少于6位',
      data: null
    };
    return;
  }

  try {
    // 获取用户当前密码
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '用户不存在',
        data: null
      };
      return;
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, users[0].password);

    if (!isPasswordValid) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '原密码错误',
        data: null
      };
      return;
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    ctx.body = {
      code: 200,
      message: '密码修改成功',
      data: null
    };
  } catch (error) {
    console.error('修改密码失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '修改密码失败',
      data: null
    };
  }
}

module.exports = {
  register,
  login,
  getUserInfo,
  updateUserInfo,
  changePassword
};
