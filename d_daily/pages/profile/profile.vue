<template>
	<view class="page-container">
		<view class="avatar-section card">
			<view class="section-title">头像</view>
			<view class="avatar-wrapper" @click="chooseAvatar">
				<image 
					v-if="formData.avatar && (formData.avatar.startsWith('http') || formData.avatar.startsWith('blob:') || formData.avatar.startsWith('/') || formData.avatar.startsWith('data:'))"
					:src="formData.avatar" 
					class="avatar-image"
					mode="aspectFill"
				/>
				<view v-else class="avatar-placeholder">
					<text class="placeholder-icon">📷</text>
				</view>
				<view class="avatar-mask">
					<text class="camera-icon">📷</text>
					<text class="change-text">更换头像</text>
				</view>
			</view>
		</view>

		<!-- 基本信息 -->
		<view class="form-section card">
			<view class="form-item">
				<view class="form-label">用户名</view>
				<view class="form-value disabled">{{ userInfo.username }}</view>
			</view>
			
			<view class="form-item">
				<view class="form-label">昵称</view>
				<input 
					class="form-input" 
					v-model="formData.nickname" 
					placeholder="请输入昵称"
					maxlength="20"
				/>
			</view>
			
			<view class="form-item">
				<view class="form-label">邮箱</view>
				<input 
					class="form-input" 
					v-model="formData.email" 
					placeholder="请输入邮箱"
					type="text"
				/>
			</view>
			
			<view class="form-item">
				<view class="form-label">手机号</view>
				<input 
					class="form-input" 
					v-model="formData.phone" 
					placeholder="请输入手机号"
					type="number"
					maxlength="11"
				/>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="button-group">
			<button class="btn-cancel" @click="goBack">取消</button>
			<button class="btn-save" @click="saveProfile">保存</button>
		</view>
	</view>
</template>

<script>
import { getUserInfo, updateUserInfo } from '@/api/auth.js'
import { getToken } from '@/utils/auth.js'
import { uploadImage } from '@/utils/upload.js'

export default {
	data() {
		return {
			userInfo: {},
			formData: {
				nickname: '',
				email: '',
				phone: '',
				avatar: ''
			}
		}
	},
	onLoad() {
		this.loadUserInfo();
	},
	methods: {
		async loadUserInfo() {
			try {
				const token = getToken();
				if (!token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/login/login'
						});
					}, 1500);
					return;
				}

				this.userInfo = await getUserInfo();
				
				// 填充表单数据
				this.formData = {
					nickname: this.userInfo.nickname || '',
					email: this.userInfo.email || '',
					phone: this.userInfo.phone || '',
					avatar: this.userInfo.avatar || ''
				};
			} catch (error) {
				console.error('加载用户信息失败:', error);
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
			}
		},

		async chooseAvatar() {
			try {
				// 选择并上传图片到OSS
				const result = await uploadImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera']
				});
				
				// 更新头像URL
				this.formData.avatar = result.url;
				
				uni.showToast({
					title: '头像上传成功',
					icon: 'success'
				});
			} catch (error) {
				console.error('上传头像失败:', error);
				uni.showToast({
					title: error.message || '上传失败',
					icon: 'none'
				});
			}
		},

		async saveProfile() {
			// 验证邮箱格式
			if (this.formData.email && !this.isValidEmail(this.formData.email)) {
				uni.showToast({
					title: '邮箱格式不正确',
					icon: 'none'
				});
				return;
			}

			// 验证手机号格式
			if (this.formData.phone && !this.isValidPhone(this.formData.phone)) {
				uni.showToast({
					title: '手机号格式不正确',
					icon: 'none'
				});
				return;
			}

			try {
				uni.showLoading({
					title: '保存中...'
				});

				await updateUserInfo(this.formData);

				uni.hideLoading();
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});

				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} catch (error) {
				uni.hideLoading();
				console.error('保存失败:', error);
				uni.showToast({
					title: error.message || '保存失败',
					icon: 'none'
				});
			}
		},

		isValidEmail(email) {
			const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return reg.test(email);
		},

		isValidPhone(phone) {
			const reg = /^1[3-9]\d{9}$/;
			return reg.test(phone);
		},

		goBack() {
			uni.navigateBack();
		}
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	padding: 20rpx;
	background: #F5F5F9;
	padding-bottom: 140rpx;
}

.card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

/* 头像区域 */
.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.section-title {
	font-size: 28rpx;
	color: #999999;
	margin-bottom: 24rpx;
	align-self: flex-start;
}

.avatar-wrapper {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
}

.avatar-image {
	width: 100%;
	height: 100%;
	background: #F5F5F9;
}

.avatar-placeholder {
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.placeholder-icon {
	font-size: 80rpx;
	opacity: 0.5;
}

.avatar-mask {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 16rpx 0;
}

.camera-icon {
	font-size: 32rpx;
	margin-bottom: 4rpx;
}

.change-text {
	font-size: 20rpx;
	color: #FFFFFF;
}

/* 表单区域 */
.form-section {
	padding: 0;
}

.form-item {
	display: flex;
	align-items: center;
	padding: 32rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	width: 140rpx;
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.form-value {
	flex: 1;
	font-size: 28rpx;
	color: #666666;
}

.form-value.disabled {
	color: #999999;
}

.form-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
}

/* 底部按钮组 */
.button-group {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 20rpx;
	padding: 20rpx;
	background: #FFFFFF;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.btn-cancel,
.btn-save {
	flex: 1;
	height: 88rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}

.btn-cancel::after,
.btn-save::after {
	border: none;
}

.btn-cancel {
	background: #F3F4F6;
	color: #666666;
}

.btn-save {
	background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
	color: #FFFFFF;
}

.btn-save:active {
	opacity: 0.8;
}
</style>
