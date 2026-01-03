/**
 * 文件上传工具
 */
import { API_BASE_URL } from './config.js'

/**
 * 上传单个文件到OSS
 * @param {String} filePath - 本地文件路径
 * @returns {Promise} - 返回上传后的文件信息 { url, name }
 */
export function uploadFile(filePath) {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('userToken');
		
		if (!token) {
			reject(new Error('请先登录'));
			return;
		}
		
		uni.showLoading({
			title: '上传中...',
			mask: true
		});
		
		uni.uploadFile({
			url: API_BASE_URL + '/upload/single',
			filePath: filePath,
			name: 'file',
			header: {
				'Authorization': `Bearer ${token}`
			},
			success: (res) => {
				try {
					const data = JSON.parse(res.data);
					if (data.code === 200) {
						resolve(data.data);
					} else {
						reject(new Error(data.message || '上传失败'));
					}
				} catch (error) {
					reject(new Error('解析响应失败'));
				}
			},
			fail: (error) => {
				reject(error);
			},
			complete: () => {
				uni.hideLoading();
			}
		});
	});
}

/**
 * 上传图片（压缩后上传）
 * @param {Object} options - 选择图片选项
 * @returns {Promise} - 返回上传后的图片URL
 */
export function uploadImage(options = {}) {
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count: options.count || 1,
			sizeType: options.sizeType || ['compressed'],
			sourceType: options.sourceType || ['album', 'camera'],
			success: async (res) => {
				try {
					const filePath = res.tempFilePaths[0];
					const result = await uploadFile(filePath);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			},
			fail: (error) => {
				reject(error);
			}
		});
	});
}

/**
 * 批量上传文件
 * @param {Array} filePaths - 文件路径数组
 * @returns {Promise} - 返回上传结果数组
 */
export async function uploadMultipleFiles(filePaths) {
	const results = [];
	
	for (let i = 0; i < filePaths.length; i++) {
		try {
			uni.showLoading({
				title: `上传中 ${i + 1}/${filePaths.length}`,
				mask: true
			});
			
			const result = await uploadFile(filePaths[i]);
			results.push(result);
		} catch (error) {
			console.error(`文件 ${i + 1} 上传失败:`, error);
			throw error;
		}
	}
	
	uni.hideLoading();
	return results;
}
