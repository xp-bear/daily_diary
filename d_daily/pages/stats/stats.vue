<template>
	<view class="page-container">
		<!-- 总体统计卡片 -->
		<view class="stats-overview card">
			<view class="overview-title">
				<text class="title-text">📊 数据总览</text>
			</view>
			<view class="stats-grid">
				<view class="stat-cell">
					<text class="stat-value">{{ stats.totalDays }}</text>
					<text class="stat-label">记录天数</text>
				</view>
				<view class="stat-cell">
					<text class="stat-value">{{ formatWords(stats.totalWords) }}</text>
					<text class="stat-label">总字数</text>
				</view>
				<view class="stat-cell">
					<text class="stat-value">{{ stats.continuousDays }}</text>
					<text class="stat-label">连续天数</text>
				</view>
				<view class="stat-cell">
					<text class="stat-value">{{ stats.avgWordsPerDay }}</text>
					<text class="stat-label">日均字数</text>
				</view>
			</view>
		</view>

		<!-- 心情统计 -->
		<view class="mood-stats card">
			<view class="section-title">
				<text class="title-text">😊 心情分布</text>
			</view>
			<view v-if="moodStats.length === 0" class="empty-tip">
				<text>暂无心情数据</text>
			</view>
			<view v-else class="mood-list">
				<view 
					class="mood-item" 
					v-for="(item, index) in moodStats" 
					:key="index"
				>
					<view class="mood-info">
						<text class="mood-emoji">{{ item.mood }}</text>
						<text class="mood-name">{{ getMoodName(item.mood) }}</text>
					</view>
					<view class="mood-progress">
						<view class="progress-bar">
							<view 
								class="progress-fill" 
								:style="{ width: item.percentage + '%' }"
							></view>
						</view>
						<text class="mood-count">{{ item.count }}次 ({{ item.percentage }}%)</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 天气统计 -->
		<view class="weather-stats card">
			<view class="section-title">
				<text class="title-text">🌤️ 天气分布</text>
			</view>
			<view v-if="weatherStats.length === 0" class="empty-tip">
				<text>暂无天气数据</text>
			</view>
			<view v-else class="weather-grid">
				<view 
					class="weather-item" 
					v-for="(item, index) in weatherStats" 
					:key="index"
				>
					<text class="weather-emoji">{{ item.weather }}</text>
					<text class="weather-name">{{ getWeatherName(item.weather) }}</text>
					<text class="weather-count">{{ item.count }}次</text>
				</view>
			</view>
		</view>

		<!-- 每月日记数量统计 -->
		<view class="month-stats card">
			<view class="section-title">
				<text class="title-text">📅 月度统计</text>
			</view>
			<view v-if="monthStats.length === 0" class="empty-tip">
				<text>暂无月度数据</text>
			</view>
			<view v-else class="month-chart">
				<view 
					class="month-bar" 
					v-for="(item, index) in monthStats" 
					:key="index"
				>
					<view class="bar-container">
						<view 
							class="bar-fill" 
							:style="{ height: (item.count / maxMonthCount * 100) + '%' }"
						></view>
					</view>
					<text class="bar-label">{{ item.month }}月</text>
					<text class="bar-value">{{ item.count }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getAllDiaries, getDiaryStats } from '@/api/diary.js'

export default {
	data() {
		return {
			stats: {
				totalDays: 0,
				totalWords: 0,
				continuousDays: 0,
				avgWordsPerDay: 0
			},
			moodStats: [],
			weatherStats: [],
			monthStats: [],
			maxMonthCount: 0,
			moodMap: {
				'😊': '开心',
				'😄': '快乐',
				'😌': '平静',
				'😔': '失落',
				'😢': '难过',
				'😡': '生气',
				'😴': '困倦',
				'🤔': '思考',
				'😍': '兴奋',
				'😰': '焦虑',
				'😤': '生气'
			},
			weatherMap: {
				'☀️': '晴天',
				'⛅': '多云',
				'☁️': '阴天',
				'🌧️': '雨天',
				'⛈️': '雷雨',
				'🌨️': '下雪',
				'🌫️': '雾霾',
				'🌪️': '大风'
			}
		}
	},
	onLoad() {
		this.loadData();
	},
	methods: {
		async loadData() {
			try {
				// 加载基础统计
				const stats = await getDiaryStats();
				this.stats = {
					...stats,
					avgWordsPerDay: stats.totalDays > 0 ? Math.round(stats.totalWords / stats.totalDays) : 0
				};

				// 加载所有日记用于详细统计
				const diaries = await getAllDiaries({ showLoading: false });
				this.calculateMoodStats(diaries);
				this.calculateWeatherStats(diaries);
				this.calculateMonthStats(diaries);
			} catch (error) {
				console.error('加载统计数据失败:', error);
			}
		},

		// 计算心情统计
		calculateMoodStats(diaries) {
			const moodCount = {};
			let total = 0;

			diaries.forEach(diary => {
				const mood = diary.mood || '😊';
				moodCount[mood] = (moodCount[mood] || 0) + 1;
				total++;
			});

			this.moodStats = Object.entries(moodCount)
				.map(([mood, count]) => ({
					mood,
					count,
					percentage: Math.round((count / total) * 100)
				}))
				.sort((a, b) => b.count - a.count);
		},

		// 计算天气统计
		calculateWeatherStats(diaries) {
			const weatherCount = {};

			diaries.forEach(diary => {
				const weather = diary.weather || '☀️';
				weatherCount[weather] = (weatherCount[weather] || 0) + 1;
			});

			this.weatherStats = Object.entries(weatherCount)
				.map(([weather, count]) => ({
					weather,
					count
				}))
				.sort((a, b) => b.count - a.count);
		},

		// 计算月度统计
		calculateMonthStats(diaries) {
			const monthCount = {};

			diaries.forEach(diary => {
				const date = new Date(diary.diary_date);
				const month = date.getMonth() + 1;
				monthCount[month] = (monthCount[month] || 0) + 1;
			});

			this.monthStats = Object.entries(monthCount)
				.map(([month, count]) => ({
					month: parseInt(month),
					count
				}))
				.sort((a, b) => a.month - b.month);

			this.maxMonthCount = Math.max(...this.monthStats.map(item => item.count), 1);
		},

		// 获取心情名称
		getMoodName(mood) {
			return this.moodMap[mood] || '未知';
		},

		// 获取天气名称
		getWeatherName(weather) {
			return this.weatherMap[weather] || '未知';
		},

		// 格式化字数
		formatWords(words) {
			if (words >= 10000) {
				return (words / 10000).toFixed(1) + '万';
			}
			return words;
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
	padding: 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

/* 标题 */
.overview-title,
.section-title {
	margin-bottom: 24rpx;
}

.title-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
}

/* 总览统计 */
.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
}

.stat-cell {
	background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
	border-radius: 12rpx;
	padding: 32rpx 24rpx;
	text-align: center;
}

.stat-value {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #6366F1;
	margin-bottom: 8rpx;
}

.stat-label {
	display: block;
	font-size: 26rpx;
	color: #666666;
}

/* 心情统计 */
.mood-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.mood-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.mood-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.mood-emoji {
	font-size: 40rpx;
}

.mood-name {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.mood-progress {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.progress-bar {
	flex: 1;
	height: 16rpx;
	background: #F3F4F6;
	border-radius: 8rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
	border-radius: 8rpx;
	transition: width 0.3s;
}

.mood-count {
	font-size: 24rpx;
	color: #666666;
	min-width: 120rpx;
	text-align: right;
}

/* 天气统计 */
.weather-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
}

.weather-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 20rpx;
	background: #F8F9FA;
	border-radius: 12rpx;
}

.weather-emoji {
	font-size: 48rpx;
}

.weather-name {
	font-size: 24rpx;
	color: #666666;
}

.weather-count {
	font-size: 28rpx;
	color: #6366F1;
	font-weight: bold;
}

/* 月度统计 */
.month-chart {
	display: flex;
	justify-content: space-around;
	align-items: flex-end;
	height: 400rpx;
	padding-top: 40rpx;
}

.month-bar {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.bar-container {
	width: 60rpx;
	height: 280rpx;
	background: #F3F4F6;
	border-radius: 8rpx 8rpx 0 0;
	display: flex;
	align-items: flex-end;
	overflow: hidden;
}

.bar-fill {
	width: 100%;
	background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
	border-radius: 8rpx 8rpx 0 0;
	transition: height 0.3s;
	min-height: 8rpx;
}

.bar-label {
	font-size: 22rpx;
	color: #999999;
}

.bar-value {
	font-size: 24rpx;
	color: #333333;
	font-weight: bold;
}

/* 空状态 */
.empty-tip {
	text-align: center;
	padding: 60rpx 0;
	font-size: 28rpx;
	color: #999999;
}
</style>
