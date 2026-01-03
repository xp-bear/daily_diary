const Router = require('koa-router');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = new Router({
  prefix: '/api/auth'
});

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 获取当前用户信息（需要认证）
router.get('/userinfo', authMiddleware, authController.getUserInfo);

// 更新用户信息（需要认证）
router.put('/userinfo', authMiddleware, authController.updateUserInfo);

// 修改密码（需要认证）
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
