/**
 * HTTP 请求工具
 */
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY } from './config.js';

/**
 * 发起 HTTP 请求
 * @param {String} url 请求地址
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
export function request(url, options = {}) {
	return new Promise((resolve, reject) => {
		// 获取 token
		const token = uni.getStorageSync(TOKEN_KEY);
		
		// 请求配置
		const config = {
			url: API_BASE_URL + url,
			method: options.method || 'GET',
			data: options.data || {},
			timeout: options.timeout || REQUEST_TIMEOUT,
			header: {
				'Content-Type': 'application/json',
				...(token ? { 'Authorization': `Bearer ${token}` } : {}),
				...(options.header || {})
			}
		};
		
		// 显示加载提示
		if (options.showLoading !== false) {
			uni.showLoading({
				title: options.loadingText || '加载中...',
				mask: true
			});
		}
		
		// 发起请求
		uni.request({
			...config,
			success: (res) => {
				// 隐藏加载提示
				if (options.showLoading !== false) {
					uni.hideLoading();
				}
				
				// 处理响应
				if (res.statusCode === 200) {
					const data = res.data;
					
					if (data.code === 200) {
						resolve(data.data);
					} else {
						// 业务错误
						const errorMsg = data.message || '请求失败';
						if (options.showError !== false) {
							uni.showToast({
								title: errorMsg,
								icon: 'none',
								duration: 2000
							});
						}
						reject(new Error(errorMsg));
					}
				} else if (res.statusCode === 401) {
					// 未授权，清除 token 并跳转到登录页
					uni.removeStorageSync(TOKEN_KEY);
					uni.removeStorageSync('userInfo');
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none',
						duration: 2000
					});
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/login/login'
						});
					}, 2000);
					reject(new Error('未授权'));
				} else {
					// HTTP 错误
					const errorMsg = res.data?.message || '请求失败';
					if (options.showError !== false) {
						uni.showToast({
							title: errorMsg,
							icon: 'none',
							duration: 2000
						});
					}
					reject(new Error(errorMsg));
				}
			},
			fail: (error) => {
				// 隐藏加载提示
				if (options.showLoading !== false) {
					uni.hideLoading();
				}
				
				// 网络错误
				const errorMsg = '网络连接失败，请检查网络设置';
				if (options.showError !== false) {
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 2000
					});
				}
				reject(new Error(errorMsg));
			}
		});
	});
}

/**
 * GET 请求
 */
export function get(url, params, options = {}) {
	// 将参数拼接到 URL
	if (params) {
		const queryString = Object.keys(params)
			.map(key => `${key}=${encodeURIComponent(params[key])}`)
			.join('&');
		url = `${url}?${queryString}`;
	}
	
	return request(url, {
		method: 'GET',
		...options
	});
}

/**
 * POST 请求
 */
export function post(url, data, options = {}) {
	return request(url, {
		method: 'POST',
		data,
		...options
	});
}

/**
 * PUT 请求
 */
export function put(url, data, options = {}) {
	return request(url, {
		method: 'PUT',
		data,
		...options
	});
}

/**
 * DELETE 请求
 */
export function del(url, options = {}) {
	return request(url, {
		method: 'DELETE',
		...options
	});
}
