<template>
	<view class="page-container">
		<!-- 筛选区域 -->
		<view class="filter-section card">
			<view class="filter-row">
				<view class="filter-item" @click="showYearPicker = true">
					<text class="filter-label">年份</text>
					<view class="filter-value">
						<text>{{ selectedYear || '全部' }}</text>
						<text class="arrow">▼</text>
					</view>
				</view>
				<view class="filter-item" @click="showMonthPicker = true">
					<text class="filter-label">月份</text>
					<view class="filter-value">
						<text>{{ selectedMonth ? selectedMonth + '月' : '全部' }}</text>
						<text class="arrow">▼</text>
					</view>
				</view>
				<view class="filter-item" @click="showMoodPicker = true">
					<text class="filter-label">心情</text>
					<view class="filter-value">
						<text>{{ selectedMood || '全部' }}</text>
						<text class="arrow">▼</text>
					</view>
				</view>
			</view>
			<view class="filter-actions">
				<button class="reset-btn" @click="resetFilters">重置</button>
				<button class="search-btn" @click="applyFilters">筛选</button>
			</view>
		</view>

		<!-- 统计信息 -->
		<view class="stats-section card">
			<view class="stat-item">
				<text class="stat-number">{{ stats.totalDays }}</text>
				<text class="stat-label">记录天数</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-number">{{ formatWords(stats.totalWords) }}</text>
				<text class="stat-label">总字数</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-number">{{ stats.continuousDays }}</text>
				<text class="stat-label">连续天数</text>
			</view>
		</view>

		<!-- 日记列表 -->
		<view class="diary-list">
			<view v-if="diaryList.length === 0" class="empty-state">
				<text class="empty-icon">📖</text>
				<text class="empty-text">暂无日记</text>
				<text class="empty-tip">快去写一篇吧～</text>
			</view>
			<view v-else class="diary-item card" v-for="diary in diaryList" :key="diary.id" @click="viewDiary(diary)">
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
				<text class="diary-content">{{ diary.content }}</text>
				<view class="media-preview" v-if="diary.images.length > 0 || diary.videos.length > 0">
					<image 
						v-for="(img, index) in diary.images.slice(0, 3)" 
						:key="'img' + index"
						:src="getCompressedUrl(img)" 
						class="media-thumb"
						mode="aspectFill"
					/>
					<view v-if="diary.images.length + diary.videos.length > 3" class="more-media">
						<text>+{{ diary.images.length + diary.videos.length - 3 }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 年份选择器 -->
		<picker-view 
			v-if="showYearPicker" 
			class="picker-modal" 
			:value="[yearPickerIndex]" 
			@change="onYearChange"
		>
			<picker-view-column>
				<view v-for="year in yearList" :key="year" class="picker-item">
					{{ year }}年
				</view>
			</picker-view-column>
		</picker-view>

		<!-- 月份选择器 -->
		<picker-view 
			v-if="showMonthPicker" 
			class="picker-modal" 
			:value="[monthPickerIndex]" 
			@change="onMonthChange"
		>
			<picker-view-column>
				<view v-for="month in monthList" :key="month.value" class="picker-item">
					{{ month.label }}
				</view>
			</picker-view-column>
		</picker-view>

		<!-- 心情选择器 -->
		<picker-view 
			v-if="showMoodPicker" 
			class="picker-modal" 
			:value="[moodPickerIndex]" 
			@change="onMoodChange"
		>
			<picker-view-column>
				<view v-for="mood in moodList" :key="mood.value" class="picker-item">
					{{ mood.label }}
				</view>
			</picker-view-column>
		</picker-view>

		<!-- 遮罩层 -->
		<view 
			v-if="showYearPicker || showMonthPicker || showMoodPicker" 
			class="picker-mask" 
			@click="closeAllPickers"
		></view>
	</view>
</template>

<script>
import { getAllDiaries, getDiaryStats } from '@/api/diary.js'

export default {
	data() {
		return {
			diaryList: [],
			stats: {
				totalDays: 0,
				totalWords: 0,
				continuousDays: 0
			},
			// 筛选条件
			selectedYear: null,
			selectedMonth: null,
			selectedMood: null,
			// 选择器显示状态
			showYearPicker: false,
			showMonthPicker: false,
			showMoodPicker: false,
			// 选择器索引
			yearPickerIndex: 0,
			monthPickerIndex: 0,
			moodPickerIndex: 0,
			// 选择器数据
			yearList: [],
			monthList: [
				{ label: '全部', value: null },
				{ label: '1月', value: 1 },
				{ label: '2月', value: 2 },
				{ label: '3月', value: 3 },
				{ label: '4月', value: 4 },
				{ label: '5月', value: 5 },
				{ label: '6月', value: 6 },
				{ label: '7月', value: 7 },
				{ label: '8月', value: 8 },
				{ label: '9月', value: 9 },
				{ label: '10月', value: 10 },
				{ label: '11月', value: 11 },
				{ label: '12月', value: 12 }
			],
			moodList: [
				{ label: '全部', value: null },
				{ label: '😊 开心', value: '😊' },
				{ label: '😢 难过', value: '😢' },
				{ label: '😤 生气', value: '😤' },
				{ label: '😴 疲惫', value: '😴' },
				{ label: '😍 兴奋', value: '😍' },
				{ label: '😌 平静', value: '😌' },
				{ label: '😰 焦虑', value: '😰' },
				{ label: '🤔 思考', value: '🤔' }
			]
		}
	},
	onLoad() {
		this.initYearList();
		this.loadData();
	},
	onShow() {
		// 页面显示时刷新数据
		this.loadData();
	},
	methods: {
		// 初始化年份列表
		initYearList() {
			const currentYear = new Date().getFullYear();
			this.yearList = ['全部'];
			for (let i = currentYear; i >= currentYear - 10; i--) {
				this.yearList.push(i);
			}
		},

		// 加载数据
		async loadData() {
			await Promise.all([
				this.loadDiaryList(),
				this.loadStats()
			]);
		},

		// 加载日记列表
		async loadDiaryList() {
			try {
				const params = {};
				if (this.selectedYear && this.selectedYear !== '全部') {
					params.year = this.selectedYear;
				}
				if (this.selectedMonth) {
					params.month = this.selectedMonth;
				}

				let diaries = await getAllDiaries(params);

				// 客户端筛选心情
				if (this.selectedMood) {
					diaries = diaries.filter(diary => diary.mood === this.selectedMood);
				}

				this.diaryList = diaries;
			} catch (error) {
				console.error('加载日记列表失败:', error);
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
			}
		},

		// 加载统计信息
		async loadStats() {
			try {
				this.stats = await getDiaryStats();
			} catch (error) {
				console.error('加载统计信息失败:', error);
			}
		},

		// 年份选择
		onYearChange(e) {
			this.yearPickerIndex = e.detail.value[0];
			const year = this.yearList[this.yearPickerIndex];
			this.selectedYear = year === '全部' ? null : year;
			this.showYearPicker = false;
		},

		// 月份选择
		onMonthChange(e) {
			this.monthPickerIndex = e.detail.value[0];
			this.selectedMonth = this.monthList[this.monthPickerIndex].value;
			this.showMonthPicker = false;
		},

		// 心情选择
		onMoodChange(e) {
			this.moodPickerIndex = e.detail.value[0];
			this.selectedMood = this.moodList[this.moodPickerIndex].value;
			this.showMoodPicker = false;
		},

		// 关闭所有选择器
		closeAllPickers() {
			this.showYearPicker = false;
			this.showMonthPicker = false;
			this.showMoodPicker = false;
		},

		// 应用筛选
		applyFilters() {
			this.loadDiaryList();
		},

		// 重置筛选
		resetFilters() {
			this.selectedYear = null;
			this.selectedMonth = null;
			this.selectedMood = null;
			this.yearPickerIndex = 0;
			this.monthPickerIndex = 0;
			this.moodPickerIndex = 0;
			this.loadDiaryList();
		},

		// 查看日记详情
		viewDiary(diary) {
			uni.navigateTo({
				url: `/pages/detail/detail?date=${diary.diary_date}`
			});
		},

		// 格式化日期文本
		formatDateText(dateStr) {
			const date = new Date(dateStr);
			const month = date.getMonth() + 1;
			const day = date.getDate();
			return `${month}月${day}日`;
		},

		// 获取星期
		getWeekDay(dateStr) {
			const date = new Date(dateStr);
			const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
			return weekDays[date.getDay()];
		},

		// 格式化字数
		formatWords(words) {
			if (words >= 10000) {
				return (words / 10000).toFixed(1) + '万';
			}
			return words;
		},

		// 获取压缩URL
		getCompressedUrl(url) {
			if (!url) return '';
			// 如果是OSS链接，添加压缩参数
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

/* 筛选区域 */
.filter-section {
	margin-bottom: 20rpx;
}

.filter-row {
	display: flex;
	gap: 20rpx;
	margin-bottom: 24rpx;
}

.filter-item {
	flex: 1;
	background: #F8F9FA;
	border-radius: 12rpx;
	padding: 20rpx;
}

.filter-label {
	display: block;
	font-size: 24rpx;
	color: #999999;
	margin-bottom: 8rpx;
}

.filter-value {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.arrow {
	font-size: 20rpx;
	color: #999999;
}

.filter-actions {
	display: flex;
	gap: 20rpx;
}

.reset-btn,
.search-btn {
	flex: 1;
	padding: 20rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	border: none;
}

.reset-btn {
	background: #F3F4F6;
	color: #666666;
}

.reset-btn::after,
.search-btn::after {
	border: none;
}

.search-btn {
	background: #6366F1;
	color: #FFFFFF;
}

/* 统计信息 */
.stats-section {
	display: flex;
	justify-content: space-around;
	align-items: center;
}

.stat-item {
	flex: 1;
	text-align: center;
}

.stat-number {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #6366F1;
	margin-bottom: 8rpx;
}

.stat-label {
	display: block;
	font-size: 24rpx;
	color: #999999;
}

.stat-divider {
	width: 1rpx;
	height: 60rpx;
	background: #E5E7EB;
}

/* 日记列表 */
.diary-list {
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
	line-height: 1.6;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
	margin-bottom: 16rpx;
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

/* 选择器样式 */
.picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 998;
}

.picker-modal {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 500rpx;
	background: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	z-index: 999;
	animation: slideUp 0.3s;
}

.picker-item {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #333333;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}
</style>
