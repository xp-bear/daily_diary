<template>
	<view class="page-container">
		<!-- 标题 -->
		<view class="header-section">
			<text class="page-title">创建账号</text>
			<text class="page-subtitle">加入我们，开始记录你的生活</text>
		</view>
		
		<!-- 注册表单 -->
		<view class="form-section card">
			<view class="form-item">
				<view class="input-label">
					<text class="label-icon">👤</text>
					<text class="label-text">用户名</text>
				</view>
				<input 
					class="form-input" 
					v-model="username" 
					placeholder="设置用户名（6-20位字母数字）"
					placeholder-style="color: #CCCCCC;"
					maxlength="20"
				/>
			</view>
			
			<view class="form-item">
				<view class="input-label">
					<text class="label-icon">✨</text>
					<text class="label-text">昵称</text>
				</view>
				<input 
					class="form-input" 
					v-model="nickname" 
					placeholder="给自己起个好听的昵称"
					placeholder-style="color: #CCCCCC;"
					maxlength="20"
				/>
			</view>
			
			<view class="form-item">
				<view class="input-label">
					<text class="label-icon">📧</text>
					<text class="label-text">邮箱（可选）</text>
				</view>
				<input 
					class="form-input" 
					v-model="email" 
					placeholder="用于找回密码"
					placeholder-style="color: #CCCCCC;"
					type="email"
				/>
			</view>
			
			<view class="form-item">
				<view class="input-label">
					<text class="label-icon">📱</text>
					<text class="label-text">手机号（可选）</text>
				</view>
				<input 
					class="form-input" 
					v-model="phone" 
					placeholder="用于找回密码"
					placeholder-style="color: #CCCCCC;"
					type="number"
					maxlength="11"
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
					placeholder="设置密码（至少6位）"
					placeholder-style="color: #CCCCCC;"
				/>
				<text class="password-toggle" @click="togglePassword">
					{{ showPassword ? '👁️' : '👁️‍🗨️' }}
				</text>
			</view>
			
			<view class="form-item">
				<view class="input-label">
					<text class="label-icon">🔐</text>
					<text class="label-text">确认密码</text>
				</view>
				<input 
					class="form-input" 
					v-model="confirmPassword" 
					:password="!showConfirmPassword"
					placeholder="再次输入密码"
					placeholder-style="color: #CCCCCC;"
				/>
				<text class="password-toggle" @click="toggleConfirmPassword">
					{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
				</text>
			</view>
			
			<view class="agreement-box" @click="toggleAgreement">
				<text class="checkbox" :class="{ 'checked': agreedToTerms }">
					{{ agreedToTerms ? '☑️' : '⬜' }}
				</text>
				<text class="agreement-text">
					我已阅读并同意
					<text class="link-text" @click.stop="showTerms">《用户协议》</text>
					和
					<text class="link-text" @click.stop="showPrivacy">《隐私政策》</text>
				</text>
			</view>
			
			<button class="register-btn btn-primary" @click="handleRegister">注册</button>
			
			<view class="login-tip">
				<text class="tip-text">已有账号？</text>
				<text class="login-link" @click="goLogin">立即登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { register as registerApi } from '@/api/auth.js'
	import { TOKEN_KEY, USER_INFO_KEY } from '@/utils/config.js'
	
	export default {
		data() {
			return {
				username: '',
				nickname: '',
				email: '',
				phone: '',
				password: '',
				confirmPassword: '',
				showPassword: false,
				showConfirmPassword: false,
				agreedToTerms: false
			}
		},
		methods: {
			togglePassword() {
				this.showPassword = !this.showPassword;
			},
			
			toggleConfirmPassword() {
				this.showConfirmPassword = !this.showConfirmPassword;
			},
			
			toggleAgreement() {
				this.agreedToTerms = !this.agreedToTerms;
			},
			
			validateForm() {
				// 验证用户名
				if (!this.username.trim()) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					});
					return false;
				}
				
				if (this.username.length < 6 || this.username.length > 20) {
					uni.showToast({
						title: '用户名长度为6-20位',
						icon: 'none'
					});
					return false;
				}
				
				if (!/^[a-zA-Z0-9]+$/.test(this.username)) {
					uni.showToast({
						title: '用户名只能包含字母和数字',
						icon: 'none'
					});
					return false;
				}
				
				// 验证昵称
				if (!this.nickname.trim()) {
					uni.showToast({
						title: '请输入昵称',
						icon: 'none'
					});
					return false;
				}
				
				// 验证邮箱（如果填写了）
				if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
					uni.showToast({
						title: '邮箱格式不正确',
						icon: 'none'
					});
					return false;
				}
				
				// 验证手机号（如果填写了）
				if (this.phone && !/^1[3-9]\d{9}$/.test(this.phone)) {
					uni.showToast({
						title: '手机号格式不正确',
						icon: 'none'
					});
					return false;
				}
				
				// 验证密码
				if (!this.password) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					});
					return false;
				}
				
				if (this.password.length < 6) {
					uni.showToast({
						title: '密码长度不能少于6位',
						icon: 'none'
					});
					return false;
				}
				
				// 验证确认密码
				if (this.password !== this.confirmPassword) {
					uni.showToast({
						title: '两次密码输入不一致',
						icon: 'none'
					});
					return false;
				}
				
				// 验证协议
				if (!this.agreedToTerms) {
					uni.showToast({
						title: '请阅读并同意用户协议',
						icon: 'none'
					});
					return false;
				}
				
				return true;
			},
			
			handleRegister() {
				if (!this.validateForm()) {
					return;
				}
				
				// 调用后端注册 API
				this.doRegister();
			},
			
			async doRegister() {
				try {
					const result = await registerApi({
						username: this.username,
						password: this.password,
						nickname: this.nickname,
						email: this.email || undefined,
						phone: this.phone || undefined
					});
					
					// 注册成功后自动登录
					uni.setStorageSync(TOKEN_KEY, result.token);
					uni.setStorageSync(USER_INFO_KEY, JSON.stringify(result.userInfo));
					uni.setStorageSync('currentUser', result.userInfo.username);
					
					uni.showToast({
						title: '注册成功',
						icon: 'success',
						duration: 1500
					});
					
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}, 1500);
				} catch (error) {
					console.error('注册失败:', error);
					// 错误提示已在 request.js 中处理
				}
			},
			
			goLogin() {
				uni.navigateBack();
			},
			
			showTerms() {
				uni.showModal({
					title: '用户协议',
					content: '这里是用户协议的内容...\n\n1. 用户需遵守相关法律法规\n2. 保护个人隐私信息\n3. 文明使用应用功能',
					showCancel: false
				});
			},
			
			showPrivacy() {
				uni.showModal({
					title: '隐私政策',
					content: '这里是隐私政策的内容...\n\n1. 我们重视您的隐私\n2. 数据仅存储在本地\n3. 不会泄露您的个人信息',
					showCancel: false
				});
			}
		}
	}
</script>

<style scoped>
	.page-container {
		min-height: 100vh;
		padding: 40rpx;
		background: linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 30%);
	}
	
	/* 头部区域 */
	.header-section {
		padding: 40rpx 0 40rpx;
	}
	
	.page-title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 12rpx;
	}
	
	.page-subtitle {
		display: block;
		font-size: 28rpx;
		color: #999999;
	}
	
	/* 表单区域 */
	.form-section {
		padding: 40rpx 32rpx;
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
	
	.agreement-box {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
		margin-bottom: 40rpx;
		padding: 0 8rpx;
	}
	
	.checkbox {
		font-size: 32rpx;
		flex-shrink: 0;
	}
	
	.agreement-text {
		font-size: 26rpx;
		color: #666666;
		line-height: 1.6;
	}
	
	.link-text {
		color: #6366F1;
		font-weight: bold;
	}
	
	.register-btn {
		width: 100%;
		margin-bottom: 24rpx;
	}
	
	.login-tip {
		text-align: center;
	}
	
	.tip-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.login-link {
		font-size: 28rpx;
		color: #6366F1;
		font-weight: bold;
		margin-left: 8rpx;
	}
</style>
