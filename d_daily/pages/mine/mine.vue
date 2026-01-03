<template>
	<view class="page-container">
	<!-- 用户信息卡片 -->
	<view class="user-card">
		<view class="user-header">
			<view class="avatar-box" @click="editProfile">
				<image 
					v-if="userInfo.avatar && (userInfo.avatar.startsWith('http') || userInfo.avatar.startsWith('blob:') || userInfo.avatar.startsWith('/') || userInfo.avatar.startsWith('data:'))" 
					:src="userInfo.avatar" 
					class="avatar-image"
					mode="aspectFill"
				/>
				<text v-else class="avatar-emoji">{{ userInfo.avatar || '📝' }}</text>
				<view class="edit-badge">
					<text class="edit-icon">✏️</text>
				</view>
			</view>
			<view class="user-info">
				<view class="user-name-row">
					<text class="user-name">{{ userInfo.nickname || '日记用户' }}</text>
					<text class="vip-badge" v-if="isVip">VIP</text>
				</view>
				<text class="user-desc">@{{ userInfo.username || 'user' }}</text>
				<view class="user-detail" v-if="userInfo.email || userInfo.phone">
					<text class="detail-item" v-if="userInfo.email">📧 {{ userInfo.email }}</text>
					<text class="detail-item" v-if="userInfo.phone">📱 {{ formatPhone(userInfo.phone) }}</text>
				</view>
			</view>
		</view>
	</view>
		
		<!-- 统计信息 -->
		<view class="stats-section">
			<view class="stat-item">
				<text class="stat-number">{{ totalDays }}</text>
				<text class="stat-label">总天数</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-number">{{ continuousDays }}</text>
				<text class="stat-label">连续天数</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-number">{{ totalWords }}</text>
				<text class="stat-label">总字数</text>
			</view>
		</view>
		
		<!-- 功能列表 -->
		<view class="menu-section card">
			<view class="menu-item" @click="viewAllDiaries">
				<view class="menu-left">
					<text class="menu-icon">📚</text>
					<text class="menu-text">全部日记</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			
			<view class="menu-item" @click="searchDiary">
				<view class="menu-left">
					<text class="menu-icon">🔍</text>
					<text class="menu-text">搜索日记</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			
			<view class="menu-item" @click="showMoodStats">
				<view class="menu-left">
					<text class="menu-icon">📊</text>
					<text class="menu-text">心情统计</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>
		
		<!-- 设置列表 -->
		<view class="menu-section card">
			<view class="menu-item" @click="editProfile">
				<view class="menu-left">
					<text class="menu-icon">👤</text>
					<text class="menu-text">编辑资料</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			
			<view class="menu-item" @click="changePassword">
				<view class="menu-left">
					<text class="menu-icon">🔑</text>
					<text class="menu-text">修改密码</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			
			<view class="menu-item" @click="setReminder">
				<view class="menu-left">
					<text class="menu-icon">⏰</text>
					<text class="menu-text">写日记提醒</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			
			<view class="menu-item" @click="backup">
				<view class="menu-left">
					<text class="menu-icon">☁️</text>
					<text class="menu-text">备份与恢复</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			
			<view class="menu-item" @click="about">
				<view class="menu-left">
					<text class="menu-icon">ℹ️</text>
					<text class="menu-text">关于应用</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>
		
		<!-- 退出登录 -->
		<view class="logout-section">
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
		
		<!-- 版本信息 -->
		<view class="version-info">
			<text class="version-text">版本 1.0.0</text>
		</view>
	</view>
</template>

<script>
	import { getCurrentUser, logout } from '@/utils/auth.js'
	import { getDiaryStats } from '@/api/diary.js'
	import { getUserInfo } from '@/api/auth.js'
	
	export default {
	data() {
		return {
			userInfo: {},
			totalDays: 0,
			continuousDays: 0,
			totalWords: 0,
			isVip: false // VIP 状态，后续可扩展
		}
	},
		onShow() {
			this.loadUserInfo();
			this.loadStats();
		},
	methods: {
		async loadUserInfo() {
			try {
				// 从服务器获取最新的用户信息
				const userInfo = await getUserInfo();
				this.userInfo = userInfo;
				
				// 更新本地缓存
				uni.setStorageSync('userInfo', userInfo);
			} catch (error) {
				console.error('加载用户信息失败:', error);
				// 如果获取失败，使用本地缓存
				this.userInfo = getCurrentUser() || {};
			}
		},
		
		// 格式化手机号（隐藏中间4位）
		formatPhone(phone) {
			if (!phone || phone.length !== 11) return phone;
			return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
		},
		
	async loadStats() {
			try {
				const stats = await getDiaryStats({
					showLoading: false,
					showError: false
				});
				
				this.totalDays = stats.totalDays || 0;
				this.totalWords = stats.totalWords || 0;
				this.continuousDays = stats.continuousDays || 0;
			} catch (error) {
				console.error('加载统计数据失败:', error);
				this.totalDays = 0;
				this.totalWords = 0;
				this.continuousDays = 0;
			}
		},
		
		viewAllDiaries() {
			uni.navigateTo({
				url: '/pages/list/list'
			});
		},
		
		searchDiary() {
			uni.navigateTo({
				url: '/pages/search/search'
			});
		},
		
		showMoodStats() {
			uni.navigateTo({
				url: '/pages/stats/stats'
			});
		},
		
	editProfile() {
			uni.navigateTo({
				url: '/pages/profile/profile'
			});
		},
			
			changePassword() {
				// 修改密码弹窗
				uni.showModal({
					title: '修改密码',
					editable: true,
					placeholderText: '请输入新密码（至少6位）',
					success: (res) => {
						if (res.confirm && res.content) {
							if (res.content.length < 6) {
								uni.showToast({
									title: '密码长度不能少于6位',
									icon: 'none'
								});
								return;
							}
							
							// 这里简化处理，实际应该先验证旧密码
							uni.showToast({
								title: '功能开发中，请到设置页面修改',
								icon: 'none'
							});
						}
					}
				});
			},
			
		setReminder() {
			uni.navigateTo({
				url: '/pages/reminder/reminder'
			});
		},
			
		backup() {
			uni.navigateTo({
				url: '/pages/backup/backup'
			});
		},
			
			about() {
				uni.showModal({
					title: '关于应用',
					content: '每日日记 v1.0.0\n记录生活，留住美好时光',
					showCancel: false
				});
			},
			
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							logout();
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.page-container {
		min-height: 100vh;
		padding: 20rpx;
		padding-bottom: 40rpx;
	}
	
/* 用户信息卡片 */
.user-card {
	background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
	border-radius: 24rpx;
	padding: 40rpx 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.3);
}

.user-header {
	display: flex;
	align-items: flex-start;
	gap: 24rpx;
}

.avatar-box {
	position: relative;
	width: 140rpx;
	height: 140rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(10rpx);
	border: 4rpx solid rgba(255, 255, 255, 0.3);
	flex-shrink: 0;
	overflow: hidden;
}

.avatar-image {
	width: 100%;
	height: 100%;
}

.avatar-emoji {
	font-size: 72rpx;
}

.edit-badge {
	position: absolute;
	right: -4rpx;
	bottom: 4rpx;
	width: 48rpx;
	height: 48rpx;
	background: #FFFFFF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.edit-icon {
	font-size: 24rpx;
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	padding-top: 8rpx;
}

.user-name-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.user-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFFFFF;
	line-height: 1.2;
}

.vip-badge {
	padding: 4rpx 12rpx;
	background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
	color: #FFFFFF;
	font-size: 20rpx;
	font-weight: bold;
	border-radius: 8rpx;
	line-height: 1;
}

.user-desc {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.85);
	line-height: 1.2;
}

.user-detail {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin-top: 4rpx;
}

.detail-item {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.75);
	line-height: 1.4;
}
	
	/* 统计信息 */
	.stats-section {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 40rpx 20rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}
	
	.stat-number {
		font-size: 48rpx;
		font-weight: bold;
		color: #6366F1;
	}
	
	.stat-label {
		font-size: 26rpx;
		color: #999999;
	}
	
	.stat-divider {
		width: 1rpx;
		height: 60rpx;
		background: #E5E7EB;
	}
	
	/* 菜单列表 */
	.menu-section {
		margin-bottom: 20rpx;
		padding: 0;
		overflow: hidden;
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 24rpx;
		border-bottom: 1rpx solid #F5F5F9;
	}
	
	.menu-item:last-child {
		border-bottom: none;
	}
	
	.menu-left {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}
	
	.menu-icon {
		font-size: 44rpx;
	}
	
	.menu-text {
		font-size: 32rpx;
		color: #333333;
	}
	
	.menu-arrow {
		font-size: 48rpx;
		color: #CCCCCC;
		font-weight: 300;
	}
	
	/* 退出登录 */
	.logout-section {
		padding: 0 20rpx 40rpx;
	}
	
	.logout-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: #FFFFFF;
		color: #E53E3E;
		border-radius: 16rpx;
		font-size: 32rpx;
		border: none;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.logout-btn::after {
		border: none;
	}
	
	/* 版本信息 */
	.version-info {
		text-align: center;
		padding: 40rpx 0;
	}
	
	.version-text {
		font-size: 24rpx;
		color: #CCCCCC;
	}
</style>
