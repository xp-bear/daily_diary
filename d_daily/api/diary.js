/**
 * 日记相关 API
 */
import { post, get, del } from '@/utils/request.js';

/**
 * 保存日记（创建或更新）
 * @param {Object} data { date, content, mood, weather }
 */
export function saveDiary(data) {
	return post('/diary/save', data);
}

/**
 * 获取单篇日记
 * @param {String} date 日期 YYYY-MM-DD
 */
export function getDiary(date) {
	return get(`/diary/${date}`);
}

/**
 * 获取所有日记
 * @param {Object} params { year, month }
 */
export function getAllDiaries(params) {
	return get('/diary', params);
}

/**
 * 获取统计信息
 */
export function getDiaryStats() {
	return get('/diary/stats/all');
}

/**
 * 删除日记
 * @param {String} date 日期 YYYY-MM-DD
 */
export function deleteDiary(date) {
	return del(`/diary/${date}`);
}

/**
 * 搜索日记
 * @param {String} keyword 搜索关键词
 */
export function searchDiaries(keyword) {
	return get('/diary/search/keyword', { keyword });
}
