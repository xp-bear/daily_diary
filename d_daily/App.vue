<script>
	import {
		isLoggedIn,
		checkPageAuth
	} from '@/utils/auth.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.checkLoginStatus()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			checkLoginStatus() {
				// 检查是否已登录
				if (!isLoggedIn()) {
					// 未登录，跳转到登录页
					uni.reLaunch({
						url: '/pages/login/login'
					})
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #F5F5F9;
	}

	/* 全局通用样式 */
	.container {
		padding: 20rpx;
	}

	.card {
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
		color: #FFFFFF;
		border-radius: 50rpx;
		/* padding: 24rpx 48rpx; */
		font-size: 32rpx;
		border: none;
	}

	.btn-primary::after {
		border: none;
	}
</style>