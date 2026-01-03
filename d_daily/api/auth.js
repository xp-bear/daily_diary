/**
 * 用户认证相关 API
 */
import { post, get, put } from '@/utils/request.js';

/**
 * 用户注册
 * @param {Object} data { username, password, nickname, email, phone }
 */
export function register(data) {
	return post('/auth/register', data);
}

/**
 * 用户登录
 * @param {Object} data { username, password }
 */
export function login(data) {
	return post('/auth/login', data);
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
	return get('/auth/userinfo');
}

/**
 * 更新用户信息
 * @param {Object} data { nickname, email, phone, avatar }
 */
export function updateUserInfo(data) {
	return put('/auth/userinfo', data);
}

/**
 * 修改密码
 * @param {Object} data { oldPassword, newPassword }
 */
export function changePassword(data) {
	return post('/auth/change-password', data);
}
