const { pool } = require('../config/database');
const { batchDeleteFromOSS, extractObjectName } = require('../config/oss');

// 创建或更新日记
async function saveDiary(ctx) {
  const userId = ctx.state.user.id;
  const { date, content, mood, weather, images, videos } = ctx.request.body;

  // 验证必填字段
  if (!date || !content) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '日期和内容不能为空',
      data: null
    };
    return;
  }

  try {
    // 处理图片和视频数组（转为JSON字符串存储）
    const imagesJson = images && images.length > 0 ? JSON.stringify(images) : null;
    const videosJson = videos && videos.length > 0 ? JSON.stringify(videos) : null;

    // 检查该日期是否已有日记
    const [existing] = await pool.query(
      'SELECT id FROM diaries WHERE user_id = ? AND diary_date = ?',
      [userId, date]
    );

    if (existing.length > 0) {
      // 更新现有日记
      await pool.query(
        'UPDATE diaries SET content = ?, mood = ?, weather = ?, images = ?, videos = ? WHERE id = ?',
        [content, mood || '😊', weather || '☀️', imagesJson, videosJson, existing[0].id]
      );

      // 获取更新后的日记
      const [updated] = await pool.query(
        'SELECT * FROM diaries WHERE id = ?',
        [existing[0].id]
      );
      
      const diary = formatDiaryResponse(updated[0]);

      ctx.body = {
        code: 200,
        message: '日记更新成功',
        data: diary
      };
    } else {
      // 创建新日记
      const [result] = await pool.query(
        'INSERT INTO diaries (user_id, diary_date, content, mood, weather, images, videos) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, date, content, mood || '😊', weather || '☀️', imagesJson, videosJson]
      );

      // 获取新创建的日记
      const [newDiary] = await pool.query(
        'SELECT * FROM diaries WHERE id = ?',
        [result.insertId]
      );
      
      const diary = formatDiaryResponse(newDiary[0]);

      ctx.body = {
        code: 200,
        message: '日记保存成功',
        data: diary
      };
    }
  } catch (error) {
    console.error('保存日记失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '保存日记失败',
      data: null
    };
  }
}

// 获取单篇日记
async function getDiary(ctx) {
  const userId = ctx.state.user.id;
  const { date } = ctx.params;

  try {
    const [diaries] = await pool.query(
      'SELECT * FROM diaries WHERE user_id = ? AND diary_date = ?',
      [userId, date]
    );

    if (diaries.length === 0) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '日记不存在',
        data: null
      };
      return;
    }
    
    const diary = formatDiaryResponse(diaries[0]);

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: diary
    };
  } catch (error) {
    console.error('获取日记失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '获取日记失败',
      data: null
    };
  }
}

// 获取用户所有日记
async function getAllDiaries(ctx) {
  const userId = ctx.state.user.id;
  const { year, month } = ctx.query;

  try {
    let query = 'SELECT * FROM diaries WHERE user_id = ?';
    const params = [userId];

    // 如果指定了年月，则筛选
    if (year && month) {
      query += ' AND YEAR(diary_date) = ? AND MONTH(diary_date) = ?';
      params.push(year, month);
    }

    query += ' ORDER BY diary_date DESC';

    const [diaries] = await pool.query(query, params);
    
    // 格式化日记数据
    const formattedDiaries = diaries.map(diary => formatDiaryResponse(diary));

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: formattedDiaries
    };
  } catch (error) {
    console.error('获取日记列表失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '获取日记列表失败',
      data: null
    };
  }
}

// 格式化日记响应数据
function formatDiaryResponse(diary) {
  return {
    ...diary,
    diary_date: formatDate(diary.diary_date),
    images: diary.images ? JSON.parse(diary.images) : [],
    videos: diary.videos ? JSON.parse(diary.videos) : []
  };
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取日记统计信息
async function getDiaryStats(ctx) {
  const userId = ctx.state.user.id;

  try {
    // 总天数
    const [totalResult] = await pool.query(
      'SELECT COUNT(*) as total FROM diaries WHERE user_id = ?',
      [userId]
    );

    // 总字数
    const [wordsResult] = await pool.query(
      'SELECT SUM(CHAR_LENGTH(content)) as totalWords FROM diaries WHERE user_id = ?',
      [userId]
    );

    // 获取所有日记日期用于计算连续天数
    const [dates] = await pool.query(
      'SELECT diary_date FROM diaries WHERE user_id = ? ORDER BY diary_date DESC',
      [userId]
    );

    // 计算连续天数
    let continuousDays = 0;
    if (dates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const latestDate = new Date(dates[0].diary_date);
      latestDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        continuousDays = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1].diary_date);
          const currentDate = new Date(dates[i].diary_date);
          const diff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
          
          if (diff === 1) {
            continuousDays++;
          } else {
            break;
          }
        }
      }
    }

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: {
        totalDays: totalResult[0].total,
        totalWords: wordsResult[0].totalWords || 0,
        continuousDays
      }
    };
  } catch (error) {
    console.error('获取统计信息失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '获取统计信息失败',
      data: null
    };
  }
}

// 删除日记
async function deleteDiary(ctx) {
  const userId = ctx.state.user.id;
  const { date } = ctx.params;

  try {
    // 检查日记是否存在且属于当前用户
    const [existing] = await pool.query(
      'SELECT id, images, videos FROM diaries WHERE user_id = ? AND diary_date = ?',
      [userId, date]
    );

    if (existing.length === 0) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '日记不存在',
        data: null
      };
      return;
    }

    const diary = existing[0];
    
    // 收集需要删除的OSS文件
    const ossObjects = [];
    
    if (diary.images) {
      try {
        const images = JSON.parse(diary.images);
        images.forEach(url => {
          const objectName = extractObjectName(url);
          if (objectName) ossObjects.push(objectName);
        });
      } catch (e) {
        console.error('解析图片URL失败:', e);
      }
    }
    
    if (diary.videos) {
      try {
        const videos = JSON.parse(diary.videos);
        videos.forEach(url => {
          const objectName = extractObjectName(url);
          if (objectName) ossObjects.push(objectName);
        });
      } catch (e) {
        console.error('解析视频URL失败:', e);
      }
    }

    // 删除数据库记录
    await pool.query(
      'DELETE FROM diaries WHERE id = ?',
      [diary.id]
    );
    
    // 异步删除OSS文件（不阻塞响应）
    if (ossObjects.length > 0) {
      batchDeleteFromOSS(ossObjects).catch(err => {
        console.error('删除OSS文件失败:', err);
      });
    }

    ctx.body = {
      code: 200,
      message: '删除成功',
      data: null
    };
  } catch (error) {
    console.error('删除日记失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '删除日记失败',
      data: null
    };
  }
}

// 搜索日记
async function searchDiaries(ctx) {
  const userId = ctx.state.user.id;
  const { keyword } = ctx.query;

  if (!keyword) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '搜索关键词不能为空',
      data: null
    };
    return;
  }

  try {
    const [diaries] = await pool.query(
      'SELECT * FROM diaries WHERE user_id = ? AND content LIKE ? ORDER BY diary_date DESC',
      [userId, `%${keyword}%`]
    );

    // 格式化返回数据
    const formattedDiaries = diaries.map(diary => formatDiaryResponse(diary));

    ctx.body = {
      code: 200,
      message: '搜索成功',
      data: formattedDiaries
    };
  } catch (error) {
    console.error('搜索日记失败:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '搜索失败',
      data: null
    };
  }
}

module.exports = {
  saveDiary,
  getDiary,
  getAllDiaries,
  getDiaryStats,
  deleteDiary,
  searchDiaries
};
