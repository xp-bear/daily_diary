<template>
	<view class="page-container">
		<!-- 顶部月份切换 -->
		<view class="header">
			<view class="month-selector">
				<text class="icon-btn" @click="prevMonth">◀</text>
				<text class="month-text">{{ currentYear }}年{{ currentMonth }}月</text>
				<text class="icon-btn" @click="nextMonth">▶</text>
			</view>
			<view class="today-btn" @click="goToday">今天</view>
		</view>

		<!-- 日历主体 -->
		<view class="calendar-container card">
			<!-- 星期标题 -->
			<view class="week-header">
				<text class="week-day" v-for="day in weekDays" :key="day">{{ day }}</text>
			</view>

			<!-- 日期网格 -->
			<view class="calendar-grid">
				<view class="date-item" v-for="(date, index) in calendarDates" :key="index" @click="onDateClick(date)">
					<view class="date-content" :class="{
						'other-month': !date.isCurrentMonth,
						'today': date.isToday,
						'selected': date.isSelected,
						'has-diary': date.hasDiary
					}">
						<text class="date-num">{{ date.day }}</text>
						<view class="diary-dot" v-if="date.hasDiary"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 当天日记预览 -->
		<view class="diary-preview card" v-if="selectedDiary">
			<view class="diary-header">
				<text class="diary-date">{{ selectedDateText }}</text>
				<text class="diary-mood">{{ selectedDiary.mood }}</text>
			</view>
			<text class="diary-content">{{ selectedDiary.content }}</text>
			<view class="diary-actions">
				<button class="action-btn" @click="viewDiary">查看详情</button>
				<button class="action-btn edit-btn" @click="editDiary">编辑</button>
			</view>
		</view>

		<view class="empty-preview card" v-else>
			<text class="empty-text">{{ selectedDateText }}</text>
			<text class="empty-tip">还没有写日记</text>
			<button class="btn-primary write-btn" @click="writeDiary">
				✏️ 写日记
			</button>
		</view>

		<!-- 悬浮写日记按钮 -->
		<view class="float-btn" @click="writeDiary">
			<text class="float-icon">✏️</text>
		</view>
	</view>
</template>

<script>
	import {
		getAllDiaries
	} from '@/api/diary.js'

	export default {
		data() {
			return {
				currentYear: 2025,
				currentMonth: 12,
				selectedDate: null,
				weekDays: ['日', '一', '二', '三', '四', '五', '六'],
				calendarDates: [],
				diaryData: {}, // 存储日记数据，格式: { '2025-12-30': { content: '', mood: '' } }
			}
		},
		computed: {
			selectedDateText() {
				if (!this.selectedDate) return '';
				return `${this.selectedDate.year}年${this.selectedDate.month}月${this.selectedDate.day}日`;
			},
			selectedDiary() {
				if (!this.selectedDate) return null;
				// 格式化日期为 YYYY-MM-DD
				const dateStr =
					`${this.selectedDate.year}-${String(this.selectedDate.month).padStart(2, '0')}-${String(this.selectedDate.day).padStart(2, '0')}`;
				return this.diaryData[dateStr] || null;
			}
		},
		onLoad() {
			this.initCalendar();
		},
		onShow() {
			// 从写日记页面返回时重新加载数据
			this.loadDiaryData();
		},
		methods: {
			initCalendar() {
				const today = new Date();
				this.currentYear = today.getFullYear();
				this.currentMonth = today.getMonth() + 1;
				this.selectedDate = {
					year: this.currentYear,
					month: this.currentMonth,
					day: today.getDate()
				};
				// 加载数据后再生成日历
				this.loadDiaryData();
			},

			generateCalendar() {
				const dates = [];
				const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
				const lastDay = new Date(this.currentYear, this.currentMonth, 0);
				const firstDayWeek = firstDay.getDay();
				const daysInMonth = lastDay.getDate();

				// 上个月的日期
				const prevMonthLastDay = new Date(this.currentYear, this.currentMonth - 1, 0).getDate();
				for (let i = firstDayWeek - 1; i >= 0; i--) {
					const day = prevMonthLastDay - i;
					const month = this.currentMonth === 1 ? 12 : this.currentMonth - 1;
					const year = this.currentMonth === 1 ? this.currentYear - 1 : this.currentYear;
					dates.push({
						day,
						month,
						year,
						isCurrentMonth: false,
						isToday: false,
						isSelected: false,
						hasDiary: this.checkHasDiary(year, month, day)
					});
				}

				// 当月日期
				const today = new Date();
				for (let i = 1; i <= daysInMonth; i++) {
					const isToday = i === today.getDate() &&
						this.currentMonth === today.getMonth() + 1 &&
						this.currentYear === today.getFullYear();
					const isSelected = this.selectedDate &&
						i === this.selectedDate.day &&
						this.currentMonth === this.selectedDate.month &&
						this.currentYear === this.selectedDate.year;
					dates.push({
						day: i,
						month: this.currentMonth,
						year: this.currentYear,
						isCurrentMonth: true,
						isToday,
						isSelected,
						hasDiary: this.checkHasDiary(this.currentYear, this.currentMonth, i)
					});
				}

				// 下个月的日期
				const remainingDays = 42 - dates.length;
				for (let i = 1; i <= remainingDays; i++) {
					const month = this.currentMonth === 12 ? 1 : this.currentMonth + 1;
					const year = this.currentMonth === 12 ? this.currentYear + 1 : this.currentYear;
					dates.push({
						day: i,
						month,
						year,
						isCurrentMonth: false,
						isToday: false,
						isSelected: false,
						hasDiary: this.checkHasDiary(year, month, i)
					});
				}

				this.calendarDates = dates;
			},

			checkHasDiary(year, month, day) {
				// 格式化日期为 YYYY-MM-DD
				const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
				return !!this.diaryData[dateStr];
			},

			onDateClick(date) {
				this.selectedDate = {
					year: date.year,
					month: date.month,
					day: date.day
				};

				// 如果选择的是其他月份的日期，切换月份
				if (!date.isCurrentMonth) {
					this.currentYear = date.year;
					this.currentMonth = date.month;
				}

				this.generateCalendar();
			},

			prevMonth() {
				if (this.currentMonth === 1) {
					this.currentMonth = 12;
					this.currentYear--;
				} else {
					this.currentMonth--;
				}
				this.generateCalendar();
			},

			nextMonth() {
				if (this.currentMonth === 12) {
					this.currentMonth = 1;
					this.currentYear++;
				} else {
					this.currentMonth++;
				}
				this.generateCalendar();
			},

			goToday() {
				const today = new Date();
				this.currentYear = today.getFullYear();
				this.currentMonth = today.getMonth() + 1;
				this.selectedDate = {
					year: this.currentYear,
					month: this.currentMonth,
					day: today.getDate()
				};
				this.generateCalendar();
			},

			async loadDiaryData() {
				try {
					// 从后端加载当前用户的日记数据
					const diaries = await getAllDiaries({
						showLoading: false,
						showError: false
					});

					console.log('加载的日记数据:', diaries);

					// 转换为原来的数据格式
					this.diaryData = {};
					diaries.forEach(diary => {
						const date = diary.diary_date; // 日期格式: YYYY-MM-DD
						console.log('处理日记日期:', date);
						this.diaryData[date] = {
							content: diary.content,
							mood: diary.mood,
							weather: diary.weather,
							updateTime: new Date(diary.updated_at).getTime()
						};
					});

					console.log('处理后的日记数据:', this.diaryData);

					// 数据加载完成后重新生成日历
					this.generateCalendar();
				} catch (error) {
					console.error('加载日记数据失败:', error);
					this.diaryData = {};
					// 即使加载失败也要生成日历
					this.generateCalendar();
				}
			},

			writeDiary() {
				// 格式化日期为 YYYY-MM-DD
				const dateStr =
					`${this.selectedDate.year}-${String(this.selectedDate.month).padStart(2, '0')}-${String(this.selectedDate.day).padStart(2, '0')}`;
				uni.navigateTo({
					url: `/pages/write/write?date=${dateStr}`
				});
			},

			editDiary() {
				// 格式化日期为 YYYY-MM-DD
				const dateStr =
					`${this.selectedDate.year}-${String(this.selectedDate.month).padStart(2, '0')}-${String(this.selectedDate.day).padStart(2, '0')}`;
				uni.navigateTo({
					url: `/pages/write/write?date=${dateStr}&mode=edit`
				});
			},

			viewDiary() {
				// 格式化日期为 YYYY-MM-DD
				const dateStr =
					`${this.selectedDate.year}-${String(this.selectedDate.month).padStart(2, '0')}-${String(this.selectedDate.day).padStart(2, '0')}`;
				uni.navigateTo({
					url: `/pages/detail/detail?date=${dateStr}`
				});
			}
		}
	}
</script>

<style scoped>
	.page-container {
		min-height: 100vh;
		padding: 20rpx;
		padding-bottom: 120rpx;
	}

	/* 顶部月份选择器 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 0 10rpx;
	}

	.month-selector {
		display: flex;
		align-items: center;
		gap: 30rpx;
	}

	.month-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	.icon-btn {
		font-size: 32rpx;
		color: #6366F1;
		padding: 10rpx 20rpx;
	}

	.today-btn {
		padding: 12rpx 28rpx;
		background: #6366F1;
		color: #FFFFFF;
		border-radius: 50rpx;
		font-size: 28rpx;
	}

	/* 日历容器 */
	.calendar-container {
		margin-bottom: 20rpx;
	}

	.week-header {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #F0F0F0;
	}

	.week-day {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: #999999;
		font-weight: 500;
	}

	.calendar-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.date-item {
		width: 14.28%;
		aspect-ratio: 1;
		padding: 8rpx;
		box-sizing: border-box;
	}

	.date-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		position: relative;
		transition: all 0.3s;
	}

	.date-num {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.other-month .date-num {
		color: #CCCCCC;
	}

	.today {
		background: #E0E7FF;
	}

	.today .date-num {
		color: #6366F1;
		font-weight: bold;
	}

	.selected {
		background: #6366F1 !important;
	}

	.selected .date-num {
		color: #FFFFFF !important;
	}

	.diary-dot {
		width: 8rpx;
		height: 8rpx;
		background: #10B981;
		border-radius: 50%;
		margin-top: 4rpx;
	}

	.selected .diary-dot {
		background: #FFFFFF;
	}

	/* 日记预览 */
	.diary-preview {
		animation: fadeIn 0.3s;
	}

	.diary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.diary-date {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}

	.diary-mood {
		font-size: 48rpx;
	}

	.diary-content {
		font-size: 30rpx;
		color: #666666;
		line-height: 1.8;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
		margin-bottom: 24rpx;
	}

	.diary-actions {
		display: flex;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		padding: 20rpx;
		background: #F3F4F6;
		color: #6366F1;
		border-radius: 12rpx;
		font-size: 28rpx;
		border: none;
	}

	.action-btn::after {
		border: none;
	}

	.edit-btn {
		background: #6366F1;
		color: #FFFFFF;
	}

	/* 空状态 */
	.empty-preview {
		text-align: center;
		padding: 60rpx 40rpx;
		animation: fadeIn 0.3s;
	}

	.empty-text {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 16rpx;
	}

	.empty-tip {
		display: block;
		font-size: 28rpx;
		color: #999999;
		margin-bottom: 40rpx;
	}

	.write-btn {
		width: 60%;
		margin: 0 auto;
	}

	/* 悬浮按钮 */
	.float-btn {
		position: fixed;
		right: 40rpx;
		bottom: 140rpx;
		width: 120rpx;
		height: 120rpx;
		background: linear-gradient(135deg, #66ea9f 0%, #9763f1 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(103, 99, 241, 0.4);
		z-index: 999;
	}

	.float-icon {
		font-size: 52rpx;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>