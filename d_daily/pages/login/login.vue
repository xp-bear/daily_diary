<template>
	<view class="page-container">
		<!-- Logo区域 -->
		<view class="logo-section">
			<text class="logo-icon">📝</text>
			<text class="app-name">每日日记</text>
			<text class="app-slogan">记录生活，留住美好</text>
		</view>
		
		<!-- 登录表单 -->
		<view class="form-section card">
			<view class="form-item">
				<view class="input-label">
					<text class="label-icon">👤</text>
					<text class="label-text">账号</text>
				</view>
				<input 
					class="form-input" 
					v-model="username" 
					placeholder="请输入用户名/手机号/邮箱"
					placeholder-style="color: #CCCCCC;"
				/>
			</view>
			
			<view class="form-item">
				<view class="input-label">
					<text class="label-icon">🔒</text>
					<text class="label-text">密码</text>
				</view>
				<input 
					class="form-input" 
					v-model="password" 
					:password="!showPassword"
					placeholder="请输入密码"
					placeholder-style="color: #CCCCCC;"
				/>
				<text class="password-toggle" @click="togglePassword">
					{{ showPassword ? '👁️' : '👁️‍🗨️' }}
				</text>
			</view>
			
			<view class="form-options">
				<view class="remember-box" @click="toggleRemember">
					<text class="checkbox" :class="{ 'checked': rememberMe }">
						{{ rememberMe ? '☑️' : '⬜' }}
					</text>
					<text class="option-text">记住密码</text>
				</view>
				<text class="forget-text" @click="forgetPassword">忘记密码？</text>
			</view>
			
			<button class="login-btn btn-primary" @click="handleLogin">登录</button>
			
			<view class="register-tip">
				<text class="tip-text">还没有账号？</text>
				<text class="register-link" @click="goRegister">立即注册</text>
			</view>
		</view>
		
		<!-- 第三方登录 -->
		<view class="social-login">
			<view class="divider-box">
				<view class="divider-line"></view>
				<text class="divider-text">其他登录方式</text>
				<view class="divider-line"></view>
			</view>
			
			<view class="social-icons">
				<view class="social-item" @click="wechatLogin">
					<text class="social-icon">💬</text>
					<text class="social-name">微信</text>
				</view>
				<view class="social-item" @click="qqLogin">
					<text class="social-icon">🐧</text>
					<text class="social-name">QQ</text>
				</view>
				<view class="social-item" @click="phoneLogin">
					<text class="social-icon">📱</text>
					<text class="social-name">手机</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { login as loginApi } from '@/api/auth.js'
	import { TOKEN_KEY, USER_INFO_KEY } from '@/utils/config.js'
	
	export default {
		data() {
			return {
				username: '',
				password: '',
				showPassword: false,
				rememberMe: false
			}
		},
		onLoad() {
			// 检查是否已登录
			const token = uni.getStorageSync('userToken');
			if (token) {
				this.checkAutoLogin();
			}
			
			// 加载记住的账号密码
			this.loadRememberedAccount();
		},
		methods: {
			loadRememberedAccount() {
				const remembered = uni.getStorageSync('rememberedAccount');
				if (remembered) {
					try {
						const account = JSON.parse(remembered);
						this.username = account.username || '';
						this.password = account.password || '';
						this.rememberMe = true;
					} catch (e) {
						console.error('加载记住的账号失败', e);
					}
				}
			},
			
			checkAutoLogin() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					// 已登录，跳转到首页
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			},
			
			togglePassword() {
				this.showPassword = !this.showPassword;
			},
			
			toggleRemember() {
				this.rememberMe = !this.rememberMe;
			},
			
			handleLogin() {
				// 验证输入
				if (!this.username.trim()) {
					uni.showToast({
						title: '请输入账号',
						icon: 'none'
					});
					return;
				}
				
				if (!this.password.trim()) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					});
					return;
				}
				
				if (this.password.length < 6) {
					uni.showToast({
						title: '密码长度不能少于6位',
						icon: 'none'
					});
					return;
				}
				
				// 调用后端登录 API
				this.doLogin();
			},
			
			async doLogin() {
				try {
					const result = await loginApi({
						username: this.username,
						password: this.password
					});
					
					// 保存登录信息
					uni.setStorageSync(TOKEN_KEY, result.token);
					uni.setStorageSync(USER_INFO_KEY, JSON.stringify(result.userInfo));
					uni.setStorageSync('currentUser', result.userInfo.username);
					
					// 记住密码
					if (this.rememberMe) {
						uni.setStorageSync('rememberedAccount', JSON.stringify({
							username: this.username,
							password: this.password
						}));
					} else {
						uni.removeStorageSync('rememberedAccount');
					}
					
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 1500
					});
					
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}, 1500);
				} catch (error) {
					console.error('登录失败:', error);
					// 错误提示已在 request.js 中处理
				}
			},
			
			goRegister() {
				uni.navigateTo({
					url: '/pages/register/register'
				});
			},
			
			forgetPassword() {
				uni.showModal({
					title: '找回密码',
					content: '请联系管理员重置密码\n或通过邮箱/手机验证找回',
					showCancel: false
				});
			},
			
			wechatLogin() {
				uni.showToast({
					title: '微信登录开发中',
					icon: 'none'
				});
			},
			
			qqLogin() {
				uni.showToast({
					title: 'QQ登录开发中',
					icon: 'none'
				});
			},
			
			phoneLogin() {
				uni.showToast({
					title: '手机验证码登录开发中',
					icon: 'none'
				});
			}
		}
	}
</script>

<style scoped>
	.page-container {
		min-height: 100vh;
		padding: 40rpx;
		background: linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 50%);
	}
	
	/* Logo区域 */
	.logo-section {
		text-align: center;
		padding: 80rpx 0 60rpx;
	}
	
	.logo-icon {
		font-size: 120rpx;
		display: block;
		margin-bottom: 24rpx;
	}
	
	.app-name {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 12rpx;
	}
	
	.app-slogan {
		display: block;
		font-size: 28rpx;
		color: #999999;
	}
	
	/* 表单区域 */
	.form-section {
		padding: 40rpx 32rpx;
		margin-bottom: 40rpx;
	}
	
	.form-item {
		margin-bottom: 32rpx;
		position: relative;
	}
	
	.input-label {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}
	
	.label-icon {
		font-size: 32rpx;
	}
	
	.label-text {
		font-size: 28rpx;
		color: #666666;
		font-weight: 500;
	}
	
	.form-input {
		width: 91%;
		height: 88rpx;
		padding: 0 24rpx;
		background: #F9FAFB;
		border-radius: 12rpx;
		font-size: 30rpx;
		border: 2rpx solid transparent;
		transition: all 0.3s;
	}
	
	.form-input:focus {
		background: #FFFFFF;
		border-color: #6366F1;
	}
	
	.password-toggle {
		position: absolute;
		right: 24rpx;
		bottom: 24rpx;
		font-size: 40rpx;
	}
	
	.form-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}
	
	.remember-box {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}
	
	.checkbox {
		font-size: 32rpx;
	}
	
	.option-text {
		font-size: 26rpx;
		color: #666666;
	}
	
	.forget-text {
		font-size: 26rpx;
		color: #6366F1;
	}
	
	.login-btn {
		width: 100%;
		margin-bottom: 24rpx;
	}
	
	.register-tip {
		text-align: center;
	}
	
	.tip-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.register-link {
		font-size: 28rpx;
		color: #6366F1;
		font-weight: bold;
		margin-left: 8rpx;
	}
	
	/* 第三方登录 */
	.social-login {
		padding: 0 20rpx;
	}
	
	.divider-box {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 40rpx;
	}
	
	.divider-line {
		flex: 1;
		height: 1rpx;
		background: #E5E7EB;
	}
	
	.divider-text {
		font-size: 24rpx;
		color: #999999;
	}
	
	.social-icons {
		display: flex;
		justify-content: center;
		gap: 60rpx;
	}
	
	.social-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}
	
	.social-icon {
		width: 96rpx;
		height: 96rpx;
		background: #F9FAFB;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 52rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}
	
	.social-name {
		font-size: 24rpx;
		color: #666666;
	}
</style>
