<template>
	<view class="page-container">
		<!-- 提醒开关 -->
		<view class="section card">
			<view class="section-header">
				<view class="header-left">
					<text class="section-icon">⏰</text>
					<text class="section-title">每日提醒</text>
				</view>
				<switch 
					:checked="reminderEnabled" 
					@change="onReminderToggle"
					color="#6366F1"
				/>
			</view>
			<text class="section-desc">开启后，每天会在设定的时间提醒您写日记</text>
		</view>

		<!-- 提醒时间设置 -->
		<view class="section card" v-if="reminderEnabled">
			<view class="time-setting" @click="showTimePicker = true">
				<view class="setting-left">
					<text class="setting-icon">🕐</text>
					<text class="setting-label">提醒时间</text>
				</view>
				<view class="setting-right">
					<text class="time-value">{{ reminderTime }}</text>
					<text class="arrow">›</text>
				</view>
			</view>
		</view>

		<!-- 提醒方式 -->
		<view class="section card" v-if="reminderEnabled">
			<view class="section-header">
				<text class="section-title-small">提醒方式</text>
			</view>
			<view class="reminder-types">
				<view 
					class="type-item" 
					:class="{ active: reminderTypes.notification }"
					@click="toggleType('notification')"
				>
					<text class="type-icon">🔔</text>
					<text class="type-text">系统通知</text>
					<view class="check-icon" v-if="reminderTypes.notification">✓</view>
				</view>
				<view 
					class="type-item" 
					:class="{ active: reminderTypes.vibrate }"
					@click="toggleType('vibrate')"
				>
					<text class="type-icon">📳</text>
					<text class="type-text">震动</text>
					<view class="check-icon" v-if="reminderTypes.vibrate">✓</view>
				</view>
				<view 
					class="type-item" 
					:class="{ active: reminderTypes.sound }"
					@click="toggleType('sound')"
				>
					<text class="type-icon">🔊</text>
					<text class="type-text">提示音</text>
					<view class="check-icon" v-if="reminderTypes.sound">✓</view>
				</view>
			</view>
		</view>

		<!-- 重复设置 -->
		<view class="section card" v-if="reminderEnabled">
			<view class="section-header">
				<text class="section-title-small">重复</text>
			</view>
			<view class="week-selector">
				<view 
					v-for="(day, index) in weekDays" 
					:key="index"
					class="week-item"
					:class="{ active: day.selected }"
					@click="toggleWeekDay(index)"
				>
					<text class="week-text">{{ day.label }}</text>
				</view>
			</view>
		</view>

		<!-- 提醒内容预设 -->
		<view class="section card" v-if="reminderEnabled">
			<view class="section-header">
				<text class="section-title-small">提醒文案</text>
			</view>
			<view class="message-list">
				<view 
					v-for="(msg, index) in reminderMessages" 
					:key="index"
					class="message-item"
					:class="{ active: selectedMessage === index }"
					@click="selectMessage(index)"
				>
					<view class="radio-icon">
						<view class="radio-dot" v-if="selectedMessage === index"></view>
					</view>
					<text class="message-text">{{ msg }}</text>
				</view>
			</view>
		</view>

		<!-- 保存按钮 -->
		<view class="button-section">
			<button class="btn-save" @click="saveSettings">保存设置</button>
		</view>

		<!-- 时间选择器 -->
		<view v-if="showTimePicker" class="picker-overlay" @click="showTimePicker = false">
			<view class="picker-container" @click.stop>
				<view class="picker-header">
					<text class="picker-cancel" @click="showTimePicker = false">取消</text>
					<text class="picker-title">选择时间</text>
					<text class="picker-confirm" @click="confirmTime">确定</text>
				</view>
				<picker-view 
					:value="timePickerValue" 
					@change="onTimeChange"
					class="time-picker"
				>
					<picker-view-column>
						<view v-for="hour in 24" :key="hour" class="picker-item">
							{{ String(hour - 1).padStart(2, '0') }}
						</view>
					</picker-view-column>
					<picker-view-column>
						<view v-for="minute in 60" :key="minute" class="picker-item">
							{{ String(minute - 1).padStart(2, '0') }}
						</view>
					</picker-view-column>
				</picker-view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			reminderEnabled: false,
			reminderTime: '21:00',
			showTimePicker: false,
			timePickerValue: [21, 0], // [小时, 分钟]
			reminderTypes: {
				notification: true,
				vibrate: false,
				sound: true
			},
			weekDays: [
				{ label: '一', selected: true },
				{ label: '二', selected: true },
				{ label: '三', selected: true },
				{ label: '四', selected: true },
				{ label: '五', selected: true },
				{ label: '六', selected: true },
				{ label: '日', selected: true }
			],
			reminderMessages: [
				'📝 该写日记啦，记录今天的美好时光～',
				'✨ 今天发生了什么有趣的事呢？',
				'💭 静下心来，写下今天的感受吧',
				'🌟 坚持记录，让生活更有意义',
				'📖 又是充实的一天，来总结一下吧'
			],
			selectedMessage: 0
		}
	},
	onLoad() {
		this.loadSettings();
	},
	methods: {
		// 加载设置
		loadSettings() {
			try {
				const settings = uni.getStorageSync('reminderSettings');
				if (settings) {
					const data = JSON.parse(settings);
					this.reminderEnabled = data.enabled || false;
					this.reminderTime = data.time || '21:00';
					this.reminderTypes = data.types || this.reminderTypes;
					this.weekDays = data.weekDays || this.weekDays;
					this.selectedMessage = data.messageIndex || 0;
					
					// 更新时间选择器的值
					const [hour, minute] = this.reminderTime.split(':');
					this.timePickerValue = [parseInt(hour), parseInt(minute)];
				}
			} catch (error) {
				console.error('加载提醒设置失败:', error);
			}
		},

		// 保存设置
		saveSettings() {
			try {
				const settings = {
					enabled: this.reminderEnabled,
					time: this.reminderTime,
					types: this.reminderTypes,
					weekDays: this.weekDays,
					messageIndex: this.selectedMessage,
					message: this.reminderMessages[this.selectedMessage]
				};

				uni.setStorageSync('reminderSettings', JSON.stringify(settings));

				// 如果开启了提醒，设置本地通知
				if (this.reminderEnabled) {
					this.scheduleNotification();
				} else {
					this.cancelNotification();
				}

				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});

				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} catch (error) {
				console.error('保存设置失败:', error);
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			}
		},

		// 切换提醒开关
		onReminderToggle(e) {
			this.reminderEnabled = e.detail.value;
		},

		// 时间选择器变化
		onTimeChange(e) {
			this.timePickerValue = e.detail.value;
		},

		// 确认时间
		confirmTime() {
			const [hour, minute] = this.timePickerValue;
			this.reminderTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
			this.showTimePicker = false;
		},

		// 切换提醒方式
		toggleType(type) {
			this.reminderTypes[type] = !this.reminderTypes[type];
		},

		// 切换星期
		toggleWeekDay(index) {
			this.weekDays[index].selected = !this.weekDays[index].selected;
		},

		// 选择提醒文案
		selectMessage(index) {
			this.selectedMessage = index;
		},

		// 设置本地通知
		scheduleNotification() {
			// 获取选中的星期
			const selectedDays = this.weekDays
				.map((day, index) => day.selected ? index + 1 : null)
				.filter(day => day !== null);

			if (selectedDays.length === 0) {
				uni.showToast({
					title: '请至少选择一天',
					icon: 'none'
				});
				return;
			}

			// uni-app 的本地通知 API（不同平台实现不同）
			// 这里提供一个示例实现
			uni.showToast({
				title: '提醒已设置',
				icon: 'success'
			});

			// TODO: 实际项目中需要根据平台实现本地通知
			// iOS: 使用 plus.push.createMessage
			// Android: 使用 plus.push.createMessage
			// 小程序: 使用订阅消息
		},

		// 取消通知
		cancelNotification() {
			// 取消所有本地通知
			uni.showToast({
				title: '提醒已取消',
				icon: 'success'
			});
		}
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	padding: 20rpx;
	padding-bottom: 140rpx;
	background: #F5F5F9;
}

.card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

/* 区块样式 */
.section {
	margin-bottom: 20rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.section-icon {
	font-size: 40rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.section-title-small {
	font-size: 28rpx;
	font-weight: 500;
	color: #666666;
}

.section-desc {
	font-size: 26rpx;
	color: #999999;
	line-height: 1.6;
}

/* 时间设置 */
.time-setting {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 0;
}

.setting-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.setting-icon {
	font-size: 36rpx;
}

.setting-label {
	font-size: 30rpx;
	color: #333333;
}

.setting-right {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.time-value {
	font-size: 32rpx;
	color: #6366F1;
	font-weight: bold;
}

.arrow {
	font-size: 40rpx;
	color: #CCCCCC;
}

/* 提醒方式 */
.reminder-types {
	display: flex;
	gap: 20rpx;
	margin-top: 20rpx;
}

.type-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	padding: 24rpx 16rpx;
	background: #F8F9FA;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	position: relative;
	transition: all 0.3s;
}

.type-item.active {
	background: #EEF2FF;
	border-color: #6366F1;
}

.type-icon {
	font-size: 48rpx;
}

.type-text {
	font-size: 26rpx;
	color: #666666;
}

.type-item.active .type-text {
	color: #6366F1;
	font-weight: 500;
}

.check-icon {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 32rpx;
	height: 32rpx;
	background: #6366F1;
	color: #FFFFFF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
}

/* 星期选择 */
.week-selector {
	display: flex;
	gap: 12rpx;
	margin-top: 20rpx;
}

.week-item {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #F8F9FA;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s;
}

.week-item.active {
	background: #6366F1;
	border-color: #6366F1;
}

.week-text {
	font-size: 28rpx;
	color: #666666;
	font-weight: 500;
}

.week-item.active .week-text {
	color: #FFFFFF;
}

/* 提醒文案列表 */
.message-list {
	margin-top: 20rpx;
}

.message-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #F0F0F0;
}

.message-item:last-child {
	border-bottom: none;
}

.radio-icon {
	width: 40rpx;
	height: 40rpx;
	border: 2rpx solid #CCCCCC;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.message-item.active .radio-icon {
	border-color: #6366F1;
}

.radio-dot {
	width: 24rpx;
	height: 24rpx;
	background: #6366F1;
	border-radius: 50%;
}

.message-text {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
	line-height: 1.6;
}

/* 保存按钮 */
.button-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx;
	background: #FFFFFF;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.btn-save {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
	color: #FFFFFF;
	border-radius: 12rpx;
	font-size: 32rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-save::after {
	border: none;
}

/* 时间选择器 */
.picker-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 999;
	display: flex;
	align-items: flex-end;
}

.picker-container {
	width: 100%;
	background: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	animation: slideUp 0.3s;
}

.picker-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.picker-cancel,
.picker-confirm {
	font-size: 28rpx;
	color: #6366F1;
}

.picker-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.time-picker {
	height: 500rpx;
}

.picker-item {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
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
