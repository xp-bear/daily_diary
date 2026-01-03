<template>
	<view class="page-container">
		<!-- 日期头部 -->
		<view class="header-section">
			<view class="date-box">
				<text class="date-text">{{ dateText }}</text>
				<text class="week-text">{{ weekText }}</text>
			</view>
			<view class="meta-info">
				<view class="meta-item">
					<text class="meta-emoji">{{ diary.mood }}</text>
					<text class="meta-label">心情</text>
				</view>
				<view class="meta-item">
					<text class="meta-emoji">{{ diary.weather }}</text>
					<text class="meta-label">天气</text>
				</view>
			</view>
		</view>
		
		<!-- 日记内容 -->
		<view class="content-section card">
			<text class="content-text">{{ diary.content }}</text>
			
			<!-- 图片展示（压缩） -->
			<view class="media-section" v-if="diary.images && diary.images.length > 0">
				<view class="image-grid">
					<image 
						class="diary-image" 
						v-for="(img, index) in diary.images" 
						:key="'img-' + index"
						:src="getFullUrl(img, true)" 
						mode="aspectFill"
						@click="previewImage(index)"
					></image>
				</view>
			</view>
			
			<!-- 视频展示（带封面） -->
			<view class="media-section" v-if="diary.videos && diary.videos.length > 0">
				<view class="video-list">
					<view class="video-wrapper" v-for="(video, index) in diary.videos" :key="'video-' + index">
						<video 
							class="diary-video" 
							:src="getFullUrl(video, false)"
							:poster="getVideoThumbnail(video)"
							:controls="true"
							:show-center-play-btn="true"
							:enable-progress-gesture="true"
						></video>
					</view>
				</view>
			</view>
			
			<view class="update-time">
				<text class="time-text">最后编辑于 {{ updateTimeText }}</text>
			</view>
		</view>
		
		<!-- 底部操作按钮 -->
		<view class="bottom-actions">
			<button class="action-btn delete-btn" @click="deleteDiary">
				🗑️ 删除
			</button>
			<button class="action-btn edit-btn btn-primary" @click="editDiary">
				✏️ 编辑
			</button>
		</view>
	</view>
</template>

<script>
	import { getDiary, deleteDiary as deleteDiaryApi } from '@/api/diary.js'
	import { API_BASE_URL } from '@/utils/config.js'
	
	export default {
		data() {
			return {
				dateStr: '',
				dateText: '',
				weekText: '',
				updateTimeText: '',
				diary: {
					content: '',
					mood: '😊',
					weather: '☀️',
					images: [],
					videos: [],
					updateTime: 0
				}
			}
		},
		onLoad(options) {
			if (options.date) {
				this.dateStr = options.date;
				this.formatDate();
				this.loadDiary();
			}
		},
		methods: {
			formatDate() {
				const [year, month, day] = this.dateStr.split('-');
				const date = new Date(year, month - 1, day);
				const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
				
				this.dateText = `${year}年${month}月${day}日`;
				this.weekText = weekDays[date.getDay()];
			},
			
			async loadDiary() {
				try {
					const diary = await getDiary(this.dateStr);
					
					this.diary = {
						content: diary.content,
						mood: diary.mood,
						weather: diary.weather,
						images: diary.images || [],
						videos: diary.videos || [],
						updateTime: new Date(diary.updated_at).getTime()
					};
					this.formatUpdateTime();
				} catch (error) {
					console.error('加载日记失败:', error);
					uni.showToast({
						title: '日记不存在',
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}
			},
			
			formatUpdateTime() {
				if (!this.diary.updateTime) {
					this.updateTimeText = '未知';
					return;
				}
				
				const date = new Date(this.diary.updateTime);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				
				this.updateTimeText = `${year}-${month}-${day} ${hours}:${minutes}`;
			},
			
			// 获取完整URL（压缩版）
			getFullUrl(url, compress = true) {
				if (!url) return '';
				
				// OSS URL - 添加压缩参数
				if (url.startsWith('http') && url.includes('aliyuncs.com')) {
					if (compress) {
						// 移除已有的处理参数
						const baseUrl = url.split('?')[0];
						// 添加阿里云OSS图片处理参数：缩放到宽度400，质量80%，格式webp
						return `${baseUrl}?x-oss-process=image/resize,w_400/quality,q_80/format,webp`;
					}
					return url;
				}
				
				// 其他URL直接返回
				if (url.startsWith('http')) {
					return url;
				}
				
				// 兼容旧的本地路径
				return API_BASE_URL.replace('/api', '') + url;
			},
			
			// 获取原图URL
			getOriginalUrl(url) {
				return this.getFullUrl(url, false);
			},
			
			// 获取视频缩略图URL
			getVideoThumbnail(url) {
				if (!url) return '';
				
				// OSS视频 - 获取第1秒的截图
				if (url.startsWith('http') && url.includes('aliyuncs.com')) {
					const baseUrl = url.split('?')[0];
					// 阿里云OSS视频截帧参数
					return `${baseUrl}?x-oss-process=video/snapshot,t_1000,f_jpg,w_400,h_300,m_fast`;
				}
				
				return url;
			},
			
			// 预览图片（原图）
			previewImage(index) {
				const urls = this.diary.images.map(img => this.getOriginalUrl(img));
				uni.previewImage({
					current: index,
					urls: urls
				});
			},
			
			editDiary() {
				uni.navigateTo({
					url: `/pages/write/write?date=${this.dateStr}&mode=edit`
				});
			},
			
			deleteDiary() {
				uni.showModal({
					title: '提示',
					content: '确定要删除这篇日记吗？',
					confirmColor: '#E53E3E',
					success: async (res) => {
						if (res.confirm) {
							try {
								await deleteDiaryApi(this.dateStr);
								
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
								
								setTimeout(() => {
									uni.navigateBack();
								}, 1500);
							} catch (error) {
								console.error('删除日记失败:', error);
								// 错误提示已在 request.js 中处理
							}
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
		padding-bottom: 160rpx;
	}
	
	/* 头部区域 */
	.header-section {
		background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
		border-radius: 24rpx;
		padding: 48rpx 32rpx;
		margin-bottom: 20rpx;
		color: #FFFFFF;
	}
	
	.date-box {
		text-align: center;
		margin-bottom: 32rpx;
	}
	
	.date-text {
		display: block;
		font-size: 44rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
	}
	
	.week-text {
		font-size: 28rpx;
		opacity: 0.9;
	}
	
	.meta-info {
		display: flex;
		justify-content: center;
		gap: 60rpx;
	}
	
	.meta-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}
	
	.meta-emoji {
		font-size: 56rpx;
	}
	
	.meta-label {
		font-size: 24rpx;
		opacity: 0.9;
	}
	
	/* 内容区域 */
	.content-section {
		min-height: 400rpx;
		padding: 40rpx 32rpx;
	}
	
	.content-text {
		font-size: 32rpx;
		line-height: 2;
		color: #333333;
		word-break: break-all;
		white-space: pre-wrap;
		display: block;
		margin-bottom: 32rpx;
	}
	
	/* 媒体展示区域 */
	.media-section {
		margin-top: 32rpx;
	}
	
	.image-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}
	
	.diary-image {
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
		object-fit: cover;
	}
	
	.video-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	
	.video-wrapper {
		width: 100%;
		position: relative;
		background: #000000;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.diary-video {
		width: 100%;
		height: 400rpx;
	}
	
	.update-time {
		margin-top: 40rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #F0F0F0;
		text-align: right;
	}
	
	.time-text {
		font-size: 24rpx;
		color: #999999;
	}
	
	/* 底部操作按钮 */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		gap: 20rpx;
		padding: 20rpx;
		background: #FFFFFF;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
		z-index: 999;
	}
	
	.action-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 50rpx;
		font-size: 32rpx;
		border: none;
	}
	
	.action-btn::after {
		border: none;
	}
	
	.delete-btn {
		background: #FEE2E2;
		color: #E53E3E;
	}
	
	.edit-btn {
		flex: 2;
	}
</style>
