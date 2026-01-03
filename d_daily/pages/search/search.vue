<template>
	<view class="page-container">
		<!-- 搜索框 -->
		<view class="search-section card">
			<view class="search-box">
				<input 
					class="search-input" 
					v-model="keyword"
					placeholder="搜索日记内容..."
					confirm-type="search"
					@confirm="handleSearch"
				/>
				<button class="search-btn" @click="handleSearch">
					<text class="search-icon">🔍</text>
				</button>
			</view>
			<view class="search-tip">
				<text class="tip-text">输入关键词搜索日记内容</text>
			</view>
		</view>

		<!-- 搜索结果 -->
		<view class="result-section">
			<!-- 空状态 -->
			<view v-if="!searched" class="empty-state">
				<text class="empty-icon">🔍</text>
				<text class="empty-text">输入关键词开始搜索</text>
			</view>

			<!-- 无结果 -->
			<view v-else-if="searchResults.length === 0" class="empty-state">
				<text class="empty-icon">📭</text>
				<text class="empty-text">未找到相关日记</text>
				<text class="empty-tip">换个关键词试试～</text>
			</view>

			<!-- 结果列表 -->
			<view v-else class="diary-list">
				<view class="result-count">
					<text class="count-text">找到 {{ searchResults.length }} 条结果</text>
				</view>
				<view 
					class="diary-item card" 
					v-for="diary in searchResults" 
					:key="diary.id"
					@click="viewDiary(diary)"
				>
					<view class="diary-header">
						<view class="date-info">
							<text class="date-text">{{ formatDateText(diary.diary_date) }}</text>
							<text class="week-text">{{ getWeekDay(diary.diary_date) }}</text>
						</view>
						<view class="mood-weather">
							<text class="mood-icon">{{ diary.mood }}</text>
							<text class="weather-icon">{{ diary.weather }}</text>
						</view>
					</view>
					<text class="diary-content" v-html="highlightKeyword(diary.content)"></text>
					<view class="media-preview" v-if="diary.images && diary.images.length > 0">
						<image 
							v-for="(img, index) in diary.images.slice(0, 3)" 
							:key="'img' + index"
							:src="getCompressedUrl(img)" 
							class="media-thumb"
							mode="aspectFill"
						/>
						<view v-if="diary.images.length > 3" class="more-media">
							<text>+{{ diary.images.length - 3 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { searchDiaries } from '@/api/diary.js'

export default {
	data() {
		return {
			keyword: '',
			searchResults: [],
			searched: false
		}
	},
	methods: {
		async handleSearch() {
			if (!this.keyword.trim()) {
				uni.showToast({
					title: '请输入搜索关键词',
					icon: 'none'
				});
				return;
			}

			try {
				const results = await searchDiaries(this.keyword.trim());
				this.searchResults = results;
				this.searched = true;
			} catch (error) {
				console.error('搜索失败:', error);
				this.searchResults = [];
				this.searched = true;
			}
		},

		viewDiary(diary) {
			uni.navigateTo({
				url: `/pages/detail/detail?date=${diary.diary_date}`
			});
		},

		// 高亮关键词
		highlightKeyword(content) {
			if (!this.keyword.trim() || !content) return content;
			const regex = new RegExp(`(${this.keyword})`, 'gi');
			return content.replace(regex, '<span style="color: #6366F1; font-weight: bold; background: #EEF2FF; padding: 2rpx 4rpx; border-radius: 4rpx;">$1</span>');
		},

		// 格式化日期文本
		formatDateText(dateStr) {
			const date = new Date(dateStr);
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const day = date.getDate();
			return `${year}年${month}月${day}日`;
		},

		// 获取星期
		getWeekDay(dateStr) {
			const date = new Date(dateStr);
			const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
			return weekDays[date.getDay()];
		},

		// 获取压缩URL
		getCompressedUrl(url) {
			if (!url) return '';
			if (url.includes('aliyuncs.com')) {
				return url + '?x-oss-process=image/resize,w_200/quality,q_80/format,webp';
			}
			return url;
		}
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	padding: 20rpx;
	padding-bottom: 40rpx;
	background: #F5F5F9;
}

.card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

/* 搜索区域 */
.search-section {
	position: sticky;
	top: 0;
	z-index: 100;
}

.search-box {
	display: flex;
	gap: 16rpx;
	align-items: center;
}

.search-input {
	flex: 1;
	height: 80rpx;
	padding: 0 24rpx;
	background: #F8F9FA;
	border-radius: 50rpx;
	font-size: 28rpx;
	color: #333333;
}

.search-btn {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	padding: 0;
}

.search-btn::after {
	border: none;
}

.search-icon {
	font-size: 36rpx;
}

.search-tip {
	margin-top: 16rpx;
	text-align: center;
}

.tip-text {
	font-size: 24rpx;
	color: #999999;
}

/* 结果区域 */
.result-section {
	margin-top: 20rpx;
}

.empty-state {
	text-align: center;
	padding: 120rpx 40rpx;
}

.empty-icon {
	display: block;
	font-size: 120rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	display: block;
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 12rpx;
}

.empty-tip {
	display: block;
	font-size: 28rpx;
	color: #999999;
}

/* 结果统计 */
.result-count {
	padding: 0 12rpx 20rpx;
}

.count-text {
	font-size: 28rpx;
	color: #666666;
}

/* 日记列表 */
.diary-list {
	margin-top: 20rpx;
}

.diary-item {
	margin-bottom: 20rpx;
	transition: transform 0.2s;
}

.diary-item:active {
	transform: scale(0.98);
}

.diary-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.date-info {
	display: flex;
	align-items: baseline;
	gap: 12rpx;
}

.date-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.week-text {
	font-size: 24rpx;
	color: #999999;
}

.mood-weather {
	display: flex;
	gap: 12rpx;
	font-size: 32rpx;
}

.diary-content {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.8;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 4;
	overflow: hidden;
	margin-bottom: 16rpx;
	word-break: break-all;
}

.media-preview {
	display: flex;
	gap: 12rpx;
	margin-top: 16rpx;
}

.media-thumb {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
	background: #F5F5F9;
}

.more-media {
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
	background: #F5F5F9;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #999999;
}
</style>
