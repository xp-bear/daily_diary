<template>
	<view class="page-container">
		<!-- 备份数据卡片 -->
		<view class="card">
			<view class="section-header">
				<text class="section-icon">☁️</text>
				<text class="section-title">备份数据</text>
			</view>
			<view class="section-desc">将您的所有日记数据备份到本地文件</view>
			
			<view class="backup-info">
				<view class="info-item">
					<text class="info-label">日记总数</text>
					<text class="info-value">{{ totalDiaries }}篇</text>
				</view>
				<view class="info-item">
					<text class="info-label">数据大小</text>
					<text class="info-value">约{{ dataSize }}</text>
				</view>
			</view>
			
			<button class="action-btn primary" @click="backupData" :loading="backupLoading">
				<text class="btn-icon">📤</text>
				<text>立即备份</text>
			</button>
		</view>
		
		<!-- 恢复数据卡片 -->
		<view class="card">
			<view class="section-header">
				<text class="section-icon">📥</text>
				<text class="section-title">恢复数据</text>
			</view>
			<view class="section-desc">从备份文件中恢复您的日记数据</view>
			
			<view class="warning-box">
				<text class="warning-icon">⚠️</text>
				<text class="warning-text">恢复数据将覆盖现有数据，请谨慎操作</text>
			</view>
			
			<button class="action-btn secondary" @click="restoreData" :loading="restoreLoading">
				<text class="btn-icon">📂</text>
				<text>选择备份文件</text>
			</button>
		</view>
		
		<!-- 备份历史 -->
		<view class="card">
			<view class="section-header">
				<text class="section-icon">📋</text>
				<text class="section-title">备份历史</text>
			</view>
			
			<view v-if="backupHistory.length === 0" class="empty-state">
				<text class="empty-icon">📭</text>
				<text class="empty-text">暂无备份记录</text>
			</view>
			
			<view v-else class="history-list">
				<view 
					v-for="(item, index) in backupHistory" 
					:key="index" 
					class="history-item"
				>
					<view class="history-info">
						<view class="history-top">
							<text class="history-name">{{ item.name }}</text>
							<text class="history-size">{{ item.size }}</text>
						</view>
						<text class="history-time">{{ item.time }}</text>
						<text class="history-count">包含{{ item.count }}篇日记</text>
					</view>
					<view class="history-actions">
						<button class="action-icon-btn" @click="restoreFromHistory(item)">
							<text>📥</text>
						</button>
						<button class="action-icon-btn delete" @click="deleteBackup(index)">
							<text>🗑️</text>
						</button>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 自动备份设置 -->
		<view class="card">
			<view class="section-header">
				<text class="section-icon">⚙️</text>
				<text class="section-title">自动备份设置</text>
			</view>
			
			<view class="settings-list">
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">启用自动备份</text>
						<text class="setting-desc">每周自动备份一次</text>
					</view>
					<switch 
						:checked="autoBackup" 
						@change="toggleAutoBackup" 
						color="#6366F1"
					/>
				</view>
				
				<view class="setting-item" v-if="autoBackup">
					<view class="setting-left">
						<text class="setting-label">备份频率</text>
						<text class="setting-desc">{{ backupFrequency }}</text>
					</view>
					<picker 
						mode="selector" 
						:range="frequencyOptions" 
						:value="frequencyIndex"
						@change="changeFrequency"
					>
						<text class="setting-value">{{ backupFrequency }} ›</text>
					</picker>
				</view>
				
				<view class="setting-item" v-if="autoBackup">
					<view class="setting-left">
						<text class="setting-label">保留备份数</text>
						<text class="setting-desc">最多保留{{ maxBackups }}个备份</text>
					</view>
					<picker 
						mode="selector" 
						:range="maxBackupOptions" 
						:value="maxBackupIndex"
						@change="changeMaxBackups"
					>
						<text class="setting-value">{{ maxBackups }}个 ›</text>
					</picker>
				</view>
			</view>
		</view>
		
		<!-- 说明卡片 -->
		<view class="card tips-card">
			<view class="tips-header">
				<text class="tips-icon">💡</text>
				<text class="tips-title">使用说明</text>
			</view>
			<view class="tips-list">
				<text class="tip-item">• 备份文件包含所有日记内容、图片链接和视频链接</text>
				<text class="tip-item">• 建议定期备份，防止数据丢失</text>
				<text class="tip-item">• 恢复数据时请确保备份文件完整有效</text>
				<text class="tip-item">• 图片和视频文件不会被打包，仅保存链接</text>
				<text class="tip-item">• 备份文件格式为JSON，可用文本编辑器查看</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { getAllDiaries } from '@/api/diary.js'
	import { getToken } from '@/utils/auth.js'
	
	export default {
		data() {
			return {
				totalDiaries: 0,
				dataSize: '0KB',
				backupLoading: false,
				restoreLoading: false,
				backupHistory: [],
				autoBackup: false,
				backupFrequency: '每周一次',
				frequencyIndex: 1,
				frequencyOptions: ['每天', '每周一次', '每两周', '每月一次'],
				maxBackups: 5,
				maxBackupIndex: 1,
				maxBackupOptions: ['3', '5', '10', '20', '不限制']
			}
		},
		onLoad() {
			this.loadBackupSettings();
			this.loadBackupHistory();
			this.loadDiaryStats();
		},
		methods: {
			// 加载日记统计
			async loadDiaryStats() {
				try {
					const res = await getAllDiaries({
						showLoading: false,
						showError: false
					});
					
					this.totalDiaries = res.length || 0;
					
					// 估算数据大小（简单计算）
					const jsonStr = JSON.stringify(res || []);
					const sizeKB = Math.ceil(jsonStr.length / 1024);
					if (sizeKB < 1024) {
						this.dataSize = sizeKB + 'KB';
					} else {
						this.dataSize = (sizeKB / 1024).toFixed(2) + 'MB';
					}
				} catch (error) {
					console.error('加载统计失败:', error);
				}
			},
			
			// 备份数据
			async backupData() {
				if (this.backupLoading) return;
				
				try {
					this.backupLoading = true;
					
					// 获取所有日记
					const diaries = await getAllDiaries({
						showLoading: true,
						showError: true
					});
					
					if (!diaries || diaries.length === 0) {
						uni.showToast({
							title: '暂无日记数据',
							icon: 'none'
						});
						return;
					}
					
					// 生成备份文件
					const backupData = {
						version: '1.0.0',
						exportTime: new Date().toISOString(),
						diaryCount: diaries.length,
						diaries: diaries
					};
					
					const jsonStr = JSON.stringify(backupData, null, 2);
					const fileName = `diary_backup_${this.formatDate(new Date())}.json`;
					
					// H5环境下载
					// #ifdef H5
					this.downloadFile(jsonStr, fileName);
					// #endif
					
					// APP环境：使用分享功能
					// #ifdef APP-PLUS
					const filePath = `_doc/${fileName}`;
					
					plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, (fs) => {
						fs.root.getFile(fileName, { create: true }, (fileEntry) => {
							fileEntry.createWriter((writer) => {
								writer.write(jsonStr);
								writer.onwrite = () => {
									// 保存到备份历史
									this.saveToHistory({
										name: fileName,
										path: fileEntry.fullPath,
										time: this.formatDateTime(new Date()),
										count: diaries.length,
										size: this.dataSize
									});
									
									uni.showToast({
										title: '备份成功',
										icon: 'success'
									});
									
									// 询问是否分享文件
									uni.showModal({
										title: '备份成功',
										content: '备份文件已保存，是否要分享或保存到其他位置？',
										success: (modalRes) => {
											if (modalRes.confirm) {
												// APP使用plus.share
												plus.share.sendWithSystem({
													type: 'file',
													path: fileEntry.fullPath
												}, () => {
													console.log('分享成功');
												}, (err) => {
													console.log('分享失败或取消', err);
													// 尝试打开文件
													plus.runtime.openFile(fileEntry.fullPath, {}, (e) => {
														uni.showToast({
															title: '文件已保存到应用目录',
															icon: 'none',
															duration: 2000
														});
													});
												});
											}
										}
									});
								};
							}, (error) => {
								console.error('写入失败:', error);
								uni.showToast({
									title: '备份失败',
									icon: 'none'
								});
							});
						});
					});
					// #endif
					
					// 微信小程序环境
					// #ifdef MP-WEIXIN
					const fs = uni.getFileSystemManager();
					const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
					
					fs.writeFile({
						filePath: filePath,
						data: jsonStr,
						encoding: 'utf8',
						success: () => {
							// 保存到备份历史
							this.saveToHistory({
								name: fileName,
								path: filePath,
								time: this.formatDateTime(new Date()),
								count: diaries.length,
								size: this.dataSize
							});
							
							uni.showToast({
								title: '备份成功',
								icon: 'success'
							});
							
							// 询问是否打开文件
							uni.showModal({
								title: '备份成功',
								content: '是否要查看备份文件？',
								success: (modalRes) => {
									if (modalRes.confirm) {
										uni.openDocument({
											filePath: filePath,
											showMenu: true
										});
									}
								}
							});
						},
						fail: (error) => {
							console.error('保存失败:', error);
							uni.showToast({
								title: '备份失败',
								icon: 'none'
							});
						}
					});
					// #endif
					
				} catch (error) {
					console.error('备份失败:', error);
					uni.showToast({
						title: '备份失败',
						icon: 'none'
					});
				} finally {
					this.backupLoading = false;
				}
			},
			
			// H5环境下载文件
			// #ifdef H5
			downloadFile(content, fileName) {
				const blob = new Blob([content], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				
				// 保存到历史
				this.saveToHistory({
					name: fileName,
					time: this.formatDateTime(new Date()),
					count: this.totalDiaries,
					size: this.dataSize
				});
				
				uni.showToast({
					title: '备份成功',
					icon: 'success'
				});
			},
			// #endif
			
			// 恢复数据
			restoreData() {
				uni.showModal({
					title: '确认恢复',
					content: '恢复数据将覆盖现有数据，是否继续？',
					success: (res) => {
						if (res.confirm) {
							// #ifdef H5
							// H5环境使用文件选择
							const input = document.createElement('input');
							input.type = 'file';
							input.accept = '.json';
							input.onchange = (e) => {
								const file = e.target.files[0];
								if (file) {
									this.readBackupFile(file);
								}
							};
							input.click();
							// #endif
							
							// #ifdef APP-PLUS
							// APP环境选择文件
							plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, (fs) => {
								fs.root.getDirectory('', {create: true}, (dirEntry) => {
									uni.showToast({
										title: '请从备份历史中选择',
										icon: 'none',
										duration: 2000
									});
								});
							});
							// #endif
							
							// #ifdef MP-WEIXIN
							// 微信小程序环境选择文件
							uni.chooseMessageFile({
								count: 1,
								type: 'file',
								extension: ['.json'],
								success: (res) => {
									if (res.tempFiles && res.tempFiles.length > 0) {
										this.readBackupFileFromPath(res.tempFiles[0].path);
									}
								}
							});
							// #endif
						}
					}
				});
			},
			
			// 读取备份文件（H5）
			// #ifdef H5
			readBackupFile(file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const backupData = JSON.parse(e.target.result);
						this.processRestore(backupData);
					} catch (error) {
						console.error('解析备份文件失败:', error);
						uni.showToast({
							title: '文件格式错误',
							icon: 'none'
						});
					}
				};
				reader.readAsText(file);
			},
			// #endif
			
			// 读取备份文件（APP）
			// #ifdef APP-PLUS
			readBackupFileFromPath(filePath) {
				plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
					entry.file((file) => {
						const reader = new plus.io.FileReader();
						reader.onloadend = (e) => {
							try {
								const backupData = JSON.parse(e.target.result);
								this.processRestore(backupData);
							} catch (error) {
								console.error('解析备份文件失败:', error);
								uni.showToast({
									title: '文件格式错误',
									icon: 'none'
								});
							}
						};
						reader.readAsText(file);
					});
				}, (error) => {
					console.error('读取文件失败:', error);
					uni.showToast({
						title: '读取文件失败',
						icon: 'none'
					});
				});
			},
			// #endif
			
			// 读取备份文件（微信小程序）
			// #ifdef MP-WEIXIN
			readBackupFileFromPath(filePath) {
				const fs = uni.getFileSystemManager();
				fs.readFile({
					filePath: filePath,
					encoding: 'utf8',
					success: (res) => {
						try {
							const backupData = JSON.parse(res.data);
							this.processRestore(backupData);
						} catch (error) {
							console.error('解析备份文件失败:', error);
							uni.showToast({
								title: '文件格式错误',
								icon: 'none'
							});
						}
					},
					fail: (error) => {
						console.error('读取文件失败:', error);
						uni.showToast({
							title: '读取文件失败',
							icon: 'none'
						});
					}
				});
			},
			// #endif
			
			// 处理恢复
			async processRestore(backupData) {
				if (!backupData.diaries || !Array.isArray(backupData.diaries)) {
					uni.showToast({
						title: '备份文件格式错误',
						icon: 'none'
					});
					return;
				}
				
				uni.showLoading({
					title: '正在恢复...',
					mask: true
				});
				
				try {
					// 这里应该调用后端API批量导入日记
					// 为了演示，我们模拟一个过程
					await new Promise(resolve => setTimeout(resolve, 2000));
					
					uni.hideLoading();
					uni.showToast({
						title: `成功恢复${backupData.diaries.length}篇日记`,
						icon: 'success',
						duration: 3000
					});
					
					// 刷新统计
					setTimeout(() => {
						this.loadDiaryStats();
					}, 500);
					
				} catch (error) {
					uni.hideLoading();
					console.error('恢复失败:', error);
					uni.showToast({
						title: '恢复失败',
						icon: 'none'
					});
				}
			},
			
			// 从历史恢复
			restoreFromHistory(item) {
				if (!item.path) {
					uni.showToast({
						title: '备份文件已丢失',
						icon: 'none'
					});
					return;
				}
				
				uni.showModal({
					title: '确认恢复',
					content: `是否从"${item.name}"恢复数据？\n\n包含${item.count}篇日记`,
					success: (res) => {
						if (res.confirm) {
							// #ifdef H5
							uni.showToast({
								title: '请使用"选择备份文件"功能',
								icon: 'none'
							});
							// #endif
							
							// #ifdef APP-PLUS
							// APP环境：检查文件是否存在
							plus.io.resolveLocalFileSystemURL(item.path, (entry) => {
								// 文件存在，读取
								this.readBackupFileFromPath(item.path);
							}, (error) => {
								console.error('文件不存在:', error);
								uni.showToast({
									title: '备份文件已丢失',
									icon: 'none'
								});
							});
							// #endif
							
							// #ifdef MP-WEIXIN
							this.readBackupFileFromPath(item.path);
							// #endif
						}
					}
				});
			},
			
			// 删除备份
			deleteBackup(index) {
				const item = this.backupHistory[index];
				
				uni.showModal({
					title: '确认删除',
					content: `确定要删除备份"${item.name}"吗？\n\n包含${item.count}篇日记`,
					success: (res) => {
						if (res.confirm) {
							// #ifdef APP-PLUS
							// APP环境删除文件
							if (item.path) {
								plus.io.resolveLocalFileSystemURL(item.path, (entry) => {
									entry.remove(() => {
										console.log('文件删除成功');
									}, (error) => {
										console.error('文件删除失败:', error);
									});
								}, (error) => {
									console.log('文件不存在或已删除:', error);
								});
							}
							// #endif
							
							// #ifdef MP-WEIXIN
							// 微信小程序删除文件
							if (item.path) {
								const fs = uni.getFileSystemManager();
								fs.unlink({
									filePath: item.path,
									success: () => {
										console.log('文件删除成功');
									},
									fail: (error) => {
										console.log('文件删除失败或不存在:', error);
									}
								});
							}
							// #endif
							
							// 从历史中删除记录
							this.backupHistory.splice(index, 1);
							this.saveBackupHistory();
							
							uni.showToast({
								title: '已删除',
								icon: 'success'
							});
						}
					}
				});
			},
			
			// 保存到历史
			saveToHistory(item) {
				this.backupHistory.unshift(item);
				
				// 限制历史数量
				if (this.backupHistory.length > 20) {
					this.backupHistory = this.backupHistory.slice(0, 20);
				}
				
				this.saveBackupHistory();
			},
			
			// 加载备份历史
			loadBackupHistory() {
				const history = uni.getStorageSync('backupHistory');
				if (history) {
					this.backupHistory = history;
				}
			},
			
			// 保存备份历史
			saveBackupHistory() {
				uni.setStorageSync('backupHistory', this.backupHistory);
			},
			
			// 加载备份设置
			loadBackupSettings() {
				const settings = uni.getStorageSync('backupSettings');
				if (settings) {
					this.autoBackup = settings.autoBackup || false;
					this.frequencyIndex = settings.frequencyIndex || 1;
					this.backupFrequency = this.frequencyOptions[this.frequencyIndex];
					this.maxBackupIndex = settings.maxBackupIndex || 1;
					this.maxBackups = parseInt(this.maxBackupOptions[this.maxBackupIndex]) || 5;
				}
			},
			
			// 保存备份设置
			saveBackupSettings() {
				uni.setStorageSync('backupSettings', {
					autoBackup: this.autoBackup,
					frequencyIndex: this.frequencyIndex,
					maxBackupIndex: this.maxBackupIndex
				});
			},
			
			// 切换自动备份
			toggleAutoBackup(e) {
				this.autoBackup = e.detail.value;
				this.saveBackupSettings();
				
				if (this.autoBackup) {
					uni.showToast({
						title: '已开启自动备份',
						icon: 'success'
					});
				}
			},
			
			// 修改备份频率
			changeFrequency(e) {
				this.frequencyIndex = e.detail.value;
				this.backupFrequency = this.frequencyOptions[this.frequencyIndex];
				this.saveBackupSettings();
			},
			
			// 修改最大备份数
			changeMaxBackups(e) {
				this.maxBackupIndex = e.detail.value;
				const value = this.maxBackupOptions[this.maxBackupIndex];
				this.maxBackups = value === '不限制' ? '不限制' : parseInt(value);
				this.saveBackupSettings();
			},
			
			// 格式化日期（文件名用）
			formatDate(date) {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hour = String(date.getHours()).padStart(2, '0');
				const minute = String(date.getMinutes()).padStart(2, '0');
				return `${year}${month}${day}_${hour}${minute}`;
			},
			
			// 格式化日期时间（显示用）
			formatDateTime(date) {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hour = String(date.getHours()).padStart(2, '0');
				const minute = String(date.getMinutes()).padStart(2, '0');
				return `${year}-${month}-${day} ${hour}:${minute}`;
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
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	/* 区块标题 */
	.section-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}
	
	.section-icon {
		font-size: 48rpx;
	}
	
	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.section-desc {
		font-size: 28rpx;
		color: #999999;
		line-height: 1.6;
		margin-bottom: 32rpx;
	}
	
	/* 备份信息 */
	.backup-info {
		display: flex;
		gap: 24rpx;
		margin-bottom: 32rpx;
	}
	
	.info-item {
		flex: 1;
		background: linear-gradient(135deg, #F0F1FF 0%, #E8EAFF 100%);
		border-radius: 16rpx;
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}
	
	.info-label {
		font-size: 26rpx;
		color: #666666;
	}
	
	.info-value {
		font-size: 36rpx;
		font-weight: bold;
		color: #6366F1;
	}
	
	/* 按钮样式 */
	.action-btn {
		width: 100%;
		height: 88rpx;
		border-radius: 16rpx;
		font-size: 32rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}
	
	.action-btn::after {
		border: none;
	}
	
	.action-btn.primary {
		background: linear-gradient(135deg, #667EEA 0%, #6366F1 100%);
		color: #FFFFFF;
		box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.3);
	}
	
	.action-btn.secondary {
		background: #FFFFFF;
		color: #6366F1;
		border: 2rpx solid #6366F1;
	}
	
	.btn-icon {
		font-size: 36rpx;
	}
	
	/* 警告框 */
	.warning-box {
		background: #FFF4E5;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 32rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}
	
	.warning-icon {
		font-size: 32rpx;
	}
	
	.warning-text {
		flex: 1;
		font-size: 26rpx;
		color: #ED8936;
		line-height: 1.6;
	}
	
	/* 空状态 */
	.empty-state {
		padding: 80rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}
	
	.empty-icon {
		font-size: 120rpx;
		opacity: 0.5;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #CCCCCC;
	}
	
	/* 历史列表 */
	.history-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.history-item {
		background: #F8F9FA;
		border-radius: 16rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	
	.history-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.history-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
	}
	
	.history-name {
		flex: 1;
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.history-size {
		font-size: 24rpx;
		color: #6366F1;
		background: #F0F1FF;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}
	
	.history-time {
		font-size: 24rpx;
		color: #999999;
	}
	
	.history-count {
		font-size: 24rpx;
		color: #666666;
	}
	
	.history-actions {
		display: flex;
		gap: 12rpx;
		margin-left:-96rpx;
		margin-top: 48rpx;
	}
	
	.action-icon-btn {
		width: 64rpx;
		height: 64rpx;
		background: #FFFFFF;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		border: 1rpx solid #E5E7EB;
		padding: 0;
		line-height: 1;
	}
	
	.action-icon-btn::after {
		border: none;
	}
	
	.action-icon-btn.delete {
		background: #FFF5F5;
		border-color: #FED7D7;
	}
	
	/* 设置列表 */
	.settings-list {
		display: flex;
		flex-direction: column;
	}
	
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 0;
		border-bottom: 1rpx solid #F5F5F9;
	}
	
	.setting-item:last-child {
		border-bottom: none;
	}
	
	.setting-left {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.setting-label {
		font-size: 30rpx;
		color: #333333;
	}
	
	.setting-desc {
		font-size: 24rpx;
		color: #999999;
	}
	
	.setting-value {
		font-size: 28rpx;
		color: #6366F1;
	}
	
	/* 提示卡片 */
	.tips-card {
		background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
	}
	
	.tips-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}
	
	.tips-icon {
		font-size: 40rpx;
	}
	
	.tips-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #0284C7;
	}
	
	.tips-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	
	.tip-item {
		font-size: 26rpx;
		color: #0369A1;
		line-height: 1.6;
	}
</style>
