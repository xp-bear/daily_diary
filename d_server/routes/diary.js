const Router = require('koa-router');
const diaryController = require('../controllers/diaryController');
const authMiddleware = require('../middleware/auth');

const router = new Router({
  prefix: '/api/diary'
});

// 所有日记接口都需要认证
router.use(authMiddleware);

// 保存日记（创建或更新）
router.post('/save', diaryController.saveDiary);

// 获取单篇日记
router.get('/:date', diaryController.getDiary);

// 获取所有日记
router.get('/', diaryController.getAllDiaries);

// 获取统计信息
router.get('/stats/all', diaryController.getDiaryStats);

// 删除日记
router.delete('/:date', diaryController.deleteDiary);

// 搜索日记
router.get('/search/keyword', diaryController.searchDiaries);

module.exports = router;
