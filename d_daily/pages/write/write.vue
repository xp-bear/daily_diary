<template>
	<view class="page-container">
		<!-- 日期显示 -->
		<view class="date-header card">
			<text class="date-text">{{ dateText }}</text>
			<text class="week-text">{{ weekText }}</text>
		</view>
		
		<!-- 心情选择 -->
		<view class="mood-section card">
			<text class="section-title">今天心情</text>
			<view class="mood-list">
				<view 
					class="mood-item" 
					v-for="(item, index) in moods" 
					:key="index"
					:class="{ 'active': selectedMood === item.emoji }"
					@click="selectMood(item.emoji)"
				>
					<text class="mood-emoji">{{ item.emoji }}</text>
					<text class="mood-label">{{ item.label }}</text>
				</view>
			</view>
		</view>
		
		<!-- 日记内容 -->
		<view class="content-section card">
			<text class="section-title">记录此刻</text>
			<textarea 
				class="diary-textarea"
				v-model="content"
				placeholder="写下今天发生的事情..."
				placeholder-style="color: #CCCCCC;"
				:maxlength="5000"
				:auto-height="true"
				:cursor-spacing="50"
			></textarea>
			<view class="word-count">
				<text class="count-text">{{ content.length }}/5000</text>
			</view>
		</view>
		
		<!-- 图片视频上传 -->
		<view class="media-section card">
			<text class="section-title">添加图片/视频</text>
			
			<!-- 媒体预览列表 -->
			<view class="media-grid">
				<!-- 图片预览 -->
				<view class="media-item" v-for="(img, index) in images" :key="'img-' + index">
					<image class="media-preview" :src="getFullUrl(img)" mode="aspectFill"></image>
					<view class="media-delete" @click="deleteImage(index)">
						<text class="delete-icon">×</text>
					</view>
				</view>
				
				<!-- 视频预览 -->
				<view class="media-item" v-for="(video, index) in videos" :key="'video-' + index">
					<video class="media-preview" :src="getFullUrl(video)" :show-center-play-btn="true"></video>
					<view class="media-delete" @click="deleteVideo(index)">
						<text class="delete-icon">×</text>
					</view>
					<view class="video-badge">
						<text class="badge-text">📹</text>
					</view>
				</view>
				
				<!-- 上传按钮 -->
				<view class="upload-btn" @click="showMediaPicker" v-if="images.length + videos.length < 9">
					<text class="upload-icon">+</text>
					<text class="upload-text">添加</text>
				</view>
			</view>
			
			<view class="media-tip">
				<text class="tip-text">最多可上传9张图片或视频</text>
			</view>
		</view>
		
		<!-- 天气标签 -->
		<view class="weather-section card">
			<text class="section-title">今日天气</text>
			<view class="weather-list">
				<view 
					class="weather-item" 
					v-for="(item, index) in weathers" 
					:key="index"
					:class="{ 'active': selectedWeather === item.emoji }"
					@click="selectWeather(item.emoji)"
				>
					<text class="weather-emoji">{{ item.emoji }}</text>
					<text class="weather-label">{{ item.label }}</text>
				</view>
			</view>
		</view>
		
		<!-- 底部操作按钮 -->
		<view class="bottom-actions">
			<button class="cancel-btn" @click="cancel">取消</button>
			<button class="save-btn btn-primary" @click="save" :disabled="uploading">
				{{ uploading ? '上传中...' : '保存' }}
			</button>
		</view>
	</view>
</template>

<script>
	import { getDiary, saveDiary } from '@/api/diary.js'
	import { API_BASE_URL } from '@/utils/config.js'
	import { request } from '@/utils/request.js'
	
	export default {
		data() {
			return {
				dateStr: '',
				dateText: '',
				weekText: '',
				selectedMood: '😊',
				selectedWeather: '☀️',
				content: '',
				images: [], // 图片URL数组
				videos: [], // 视频URL数组
				uploading: false,
				mode: 'new', // new 或 edit
				moods: [
					{ emoji: '😊', label: '开心' },
					{ emoji: '😄', label: '快乐' },
					{ emoji: '😌', label: '平静' },
					{ emoji: '😔', label: '失落' },
					{ emoji: '😢', label: '难过' },
					{ emoji: '😡', label: '生气' },
					{ emoji: '😴', label: '困倦' },
					{ emoji: '🤔', label: '思考' }
				],
				weathers: [
					{ emoji: '☀️', label: '晴天' },
					{ emoji: '⛅', label: '多云' },
					{ emoji: '☁️', label: '阴天' },
					{ emoji: '🌧️', label: '雨天' },
					{ emoji: '⛈️', label: '雷雨' },
					{ emoji: '🌨️', label: '下雪' },
					{ emoji: '🌫️', label: '雾霾' },
					{ emoji: '🌪️', label: '大风' }
				]
			}
		},
		onLoad(options) {
			if (options.date) {
				this.dateStr = options.date;
				this.mode = options.mode || 'new';
				this.formatDate();
				
				// 如果是编辑模式，加载已有数据
				if (this.mode === 'edit') {
					this.loadDiary();
				}
			} else {
				// 默认使用今天
				const today = new Date();
				const year = today.getFullYear();
				const month = today.getMonth() + 1;
				const day = today.getDate();
				this.dateStr = `${year}-${month}-${day}`;
				this.formatDate();
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
					const diary = await getDiary(this.dateStr, {
						showLoading: false,
						showError: false
					});
					
					this.content = diary.content || '';
					this.selectedMood = diary.mood || '😊';
					this.selectedWeather = diary.weather || '☀️';
					this.images = diary.images || [];
					this.videos = diary.videos || [];
				} catch (error) {
					// 日记不存在，使用默认值
					console.log('日记不存在，创建新日记');
				}
			},
			
			selectMood(emoji) {
				this.selectedMood = emoji;
			},
			
			selectWeather(emoji) {
				this.selectedWeather = emoji;
			},
			
			// 显示媒体选择器
			showMediaPicker() {
				uni.showActionSheet({
					itemList: ['选择图片', '选择视频'],
					success: (res) => {
						if (res.tapIndex === 0) {
							this.chooseImage();
						} else if (res.tapIndex === 1) {
							this.chooseVideo();
						}
					}
				});
			},
			
			// 选择图片
			chooseImage() {
				const maxCount = 9 - this.images.length - this.videos.length;
				if (maxCount <= 0) {
					uni.showToast({
						title: '最多上传9个文件',
						icon: 'none'
					});
					return;
				}
				
				uni.chooseImage({
					count: maxCount,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.uploadFiles(res.tempFilePaths, 'image');
					}
				});
			},
			
			// 选择视频
			chooseVideo() {
				const maxCount = 9 - this.images.length - this.videos.length;
				if (maxCount <= 0) {
					uni.showToast({
						title: '最多上传9个文件',
						icon: 'none'
					});
					return;
				}
				
				uni.chooseVideo({
					sourceType: ['album', 'camera'],
					maxDuration: 60,
					camera: 'back',
					success: (res) => {
						this.uploadFiles([res.tempFilePath], 'video');
					}
				});
			},
			
			// 上传文件
			async uploadFiles(filePaths, type) {
				this.uploading = true;
				
				try {
					for (let filePath of filePaths) {
						const result = await this.uploadSingleFile(filePath);
						if (type === 'image') {
							this.images.push(result.url);
						} else {
							this.videos.push(result.url);
						}
					}
					
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});
				} catch (error) {
					console.error('上传失败:', error);
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					});
				} finally {
					this.uploading = false;
				}
			},
			
			// 上传单个文件
			uploadSingleFile(filePath) {
				return new Promise((resolve, reject) => {
					const token = uni.getStorageSync('userToken');
					
					uni.uploadFile({
						url: API_BASE_URL + '/upload/single',
						filePath: filePath,
						name: 'file',
						header: {
							'Authorization': `Bearer ${token}`
						},
						success: (res) => {
							const data = JSON.parse(res.data);
							if (data.code === 200) {
								resolve(data.data);
							} else {
								reject(new Error(data.message));
							}
						},
						fail: (error) => {
							reject(error);
						}
					});
				});
			},
			
			// 删除图片
			deleteImage(index) {
				uni.showModal({
					title: '提示',
					content: '确定删除这张图片吗？',
					success: (res) => {
						if (res.confirm) {
							this.images.splice(index, 1);
						}
					}
				});
			},
			
			// 删除视频
			deleteVideo(index) {
				uni.showModal({
					title: '提示',
					content: '确定删除这个视频吗？',
					success: (res) => {
						if (res.confirm) {
							this.videos.splice(index, 1);
						}
					}
				});
			},
			
			// 获取完整URL
			getFullUrl(url) {
				if (!url) return '';
				// OSS URL直接返回
				if (url.startsWith('http')) {
					return url;
				}
				// 兼容旧的本地路径
				return API_BASE_URL.replace('/api', '') + url;
			},
			
			cancel() {
				uni.navigateBack();
			},
			
			async save() {
				if (!this.content.trim()) {
					uni.showToast({
						title: '请输入日记内容',
						icon: 'none'
					});
					return;
				}
				
				if (this.uploading) {
					uni.showToast({
						title: '文件上传中，请稍候',
						icon: 'none'
					});
					return;
				}
				
				try {
					await saveDiary({
						date: this.dateStr,
						content: this.content,
						mood: this.selectedMood,
						weather: this.selectedWeather,
						images: this.images,
						videos: this.videos
					});
					
					uni.showToast({
						title: '保存成功',
						icon: 'success',
						duration: 1500
					});
					
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} catch (error) {
					console.error('保存日记失败:', error);
					// 错误提示已在 request.js 中处理
				}
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
	
	/* 日期头部 */
	.date-header {
		text-align: center;
		padding: 40rpx 20rpx;
		margin-bottom: 20rpx;
	}
	
	.date-text {
		display: block;
		font-size: 40rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 10rpx;
	}
	
	.week-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	/* 心情选择 */
	.mood-section, .weather-section, .media-section {
		margin-bottom: 20rpx;
	}
	
	.section-title {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 24rpx;
	}
	
	.mood-list, .weather-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}
	
	.mood-item, .weather-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 24rpx;
		border-radius: 16rpx;
		background: #F9FAFB;
		border: 2rpx solid transparent;
		transition: all 0.3s;
		min-width: 120rpx;
	}
	
	.mood-item.active, .weather-item.active {
		background: #EEF2FF;
		border-color: #6366F1;
	}
	
	.mood-emoji, .weather-emoji {
		font-size: 48rpx;
		margin-bottom: 8rpx;
	}
	
	.mood-label, .weather-label {
		font-size: 24rpx;
		color: #666666;
	}
	
	.mood-item.active .mood-label,
	.weather-item.active .weather-label {
		color: #6366F1;
		font-weight: bold;
	}
	
	/* 内容区域 */
	.content-section {
		margin-bottom: 20rpx;
		min-height: 400rpx;
	}
	
	.diary-textarea {
		width: 100%;
		min-height: 400rpx;
		font-size: 32rpx;
		line-height: 1.8;
		color: #333333;
		padding: 20rpx 0;
	}
	
	.word-count {
		text-align: right;
		padding-top: 20rpx;
		border-top: 1rpx solid #F0F0F0;
	}
	
	.count-text {
		font-size: 24rpx;
		color: #999999;
	}
	
	/* 媒体上传区域 */
	.media-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}
	
	.media-item {
		width: 200rpx;
		height: 200rpx;
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.media-preview {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
	}
	
	.media-delete {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 48rpx;
		height: 48rpx;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.delete-icon {
		color: #FFFFFF;
		font-size: 36rpx;
		line-height: 1;
	}
	
	.video-badge {
		position: absolute;
		bottom: 8rpx;
		left: 8rpx;
		background: rgba(0, 0, 0, 0.6);
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}
	
	.badge-text {
		color: #FFFFFF;
		font-size: 24rpx;
	}
	
	.upload-btn {
		width: 200rpx;
		height: 200rpx;
		border: 2rpx dashed #D1D5DB;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #F9FAFB;
	}
	
	.upload-icon {
		font-size: 72rpx;
		color: #9CA3AF;
		line-height: 1;
		margin-bottom: 8rpx;
	}
	
	.upload-text {
		font-size: 24rpx;
		color: #9CA3AF;
	}
	
	.media-tip {
		margin-top: 16rpx;
		text-align: center;
	}
	
	.tip-text {
		font-size: 24rpx;
		color: #9CA3AF;
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
	
	.cancel-btn, .save-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 50rpx;
		font-size: 32rpx;
		border: none;
	}
	
	.cancel-btn {
		background: #F3F4F6;
		color: #666666;
	}
	
	.cancel-btn::after, .save-btn::after {
		border: none;
	}
</style>
