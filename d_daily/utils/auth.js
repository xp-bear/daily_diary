/**
 * 用户认证工具类
 */

// 获取 Token
export function getToken() {
	return uni.getStorageSync('userToken');
}

// 设置 Token
export function setToken(token) {
	uni.setStorageSync('userToken', token);
}

// 检查是否已登录
export function isLoggedIn() {
	const token = uni.getStorageSync('userToken');
	const userInfo = uni.getStorageSync('userInfo');
	return !!(token && userInfo);
}

// 获取当前用户信息
export function getCurrentUser() {
	const userInfo = uni.getStorageSync('userInfo');
	if (userInfo) {
		try {
			return JSON.parse(userInfo);
		} catch (e) {
			console.error('解析用户信息失败', e);
			return null;
		}
	}
	return null;
}

// 获取当前用户名
export function getCurrentUsername() {
	return uni.getStorageSync('currentUser') || '';
}

// 退出登录
export function logout() {
	removeToken();
	uni.removeStorageSync('userInfo');
	uni.removeStorageSync('currentUser');
	
	uni.showToast({
		title: '已退出登录',
		icon: 'success',
		duration: 1500
	});
	
	setTimeout(() => {
		uni.reLaunch({
			url: '/pages/login/login'
		});
	}, 1500);
}

// 移除 Token
export function removeToken() {
	uni.removeStorageSync('userToken');
}

// 更新用户信息
export function updateUserInfo(userInfo) {
	const currentUsername = getCurrentUsername();
	if (!currentUsername) return false;
	
	// 更新本地存储的用户信息
	uni.setStorageSync('userInfo', JSON.stringify(userInfo));
	
	// 更新用户数据库
	const usersData = uni.getStorageSync('usersData') || '{}';
	const users = JSON.parse(usersData);
	
	if (users[currentUsername]) {
		users[currentUsername] = {
			...users[currentUsername],
			...userInfo,
			updateTime: new Date().getTime()
		};
		uni.setStorageSync('usersData', JSON.stringify(users));
		return true;
	}
	
	return false;
}

// 修改密码
export function changePassword(oldPassword, newPassword) {
	const currentUsername = getCurrentUsername();
	if (!currentUsername) {
		return {
			success: false,
			message: '未登录'
		};
	}
	
	const usersData = uni.getStorageSync('usersData') || '{}';
	const users = JSON.parse(usersData);
	const user = users[currentUsername];
	
	if (!user) {
		return {
			success: false,
			message: '用户不存在'
		};
	}
	
	if (user.password !== oldPassword) {
		return {
			success: false,
			message: '原密码错误'
		};
	}
	
	// 更新密码
	users[currentUsername].password = newPassword;
	users[currentUsername].updateTime = new Date().getTime();
	uni.setStorageSync('usersData', JSON.stringify(users));
	
	return {
		success: true,
		message: '密码修改成功'
	};
}

// 获取用户的日记数据
export function getUserDiaryData() {
	const currentUsername = getCurrentUsername();
	if (!currentUsername) return {};
	
	// 每个用户的日记数据独立存储
	const key = `diaryData_${currentUsername}`;
	const data = uni.getStorageSync(key);
	
	if (data) {
		try {
			return JSON.parse(data);
		} catch (e) {
			console.error('解析日记数据失败', e);
			return {};
		}
	}
	
	return {};
}

// 保存用户的日记数据
export function saveUserDiaryData(diaryData) {
	const currentUsername = getCurrentUsername();
	if (!currentUsername) return false;
	
	const key = `diaryData_${currentUsername}`;
	uni.setStorageSync(key, JSON.stringify(diaryData));
	return true;
}

// 需要登录的页面路径
const authRequiredPages = [
	'/pages/index/index',
	'/pages/write/write',
	'/pages/detail/detail',
	'/pages/mine/mine'
];

// 检查页面是否需要登录
export function checkPageAuth(url) {
	// 提取路径（去除参数）
	const path = url.split('?')[0];
	return authRequiredPages.some(page => path.includes(page));
}
