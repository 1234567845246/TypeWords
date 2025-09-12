<template>
  <div class="download-manager">
    <!-- 任务统计 -->
    <div class="stats-section" v-if="tasks.length">
      <div class="stat-card">
        <div class="stat-icon downloading">📫</div>
        <div class="stat-info">
          <div class="stat-number">{{ downloadingCount }}</div>
          <div class="stat-label">{{ $t('download.stat.downloading') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon completed">✓</div>
        <div class="stat-info">
          <div class="stat-number">{{ completedCount }}</div>
          <div class="stat-label">{{ $t('download.stat.completed') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon waiting">⏸</div>
        <div class="stat-info">
          <div class="stat-number">{{ waitingCount }}</div>
          <div class="stat-label">{{ $t('download.stat.waiting') }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon paused">⏸</div>
        <div class="stat-info">
          <div class="stat-number">{{ pausedCount }}</div>
          <div class="stat-label">{{ $t('download.stat.paused') }}</div>
        </div>
      </div>

      <div class="stat-card" v-if="errorCount > 0">
        <div class="stat-icon error">⚠</div>
        <div class="stat-info">
          <div class="stat-number">{{ errorCount }}</div>
          <div class="stat-label">{{ $t('download.stat.error') }}</div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <!-- 空状态 -->
      <div v-if="!tasks.length && !isLoading" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3 class="empty-title">{{ $t('download.task.empty.title') }}</h3>
        <p class="empty-description">{{ $t('download.task.empty.desc') }}</p>
        <button class="btn-primary" @click="$emit('add-task')">
          <span class="btn-icon">➕</span>
          {{ $t('download.task.empty.button') }}
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading && !tasks.length" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 任务列表 -->
      <div v-if="tasks.length" class="task-list">
        <div v-for="task in tasks" :key="task.id" class="task-item" :class="{
          'task-downloading': task.status === 'downloading',
          'task-completed': task.status === 'completed',
          'task-error': task.status === 'error',
          'task-paused': task.status === 'paused'
        }">
          <!-- 任务状态图标 -->
          <div class="task-status-icon">
            <span v-if="task.status === 'downloading'" class="status-icon downloading">📫</span>
            <span v-else-if="task.status === 'completed'" class="status-icon completed">✓</span>
            <span v-else-if="task.status === 'error'" class="status-icon error">⚠</span>
            <span v-else-if="task.status === 'paused'" class="status-icon paused">⏸</span>
            <span v-else class="status-icon waiting">🕰</span>
          </div>

          <!-- 任务信息 -->
          <div class="task-info">
            <div class="task-header">
              <h4 class="task-name" :title="task.fileName || task.url">
                {{ task.fileName || extractFileName(task.url) }}
              </h4>
              <div class="task-protocol">
                {{ task.protocol.toUpperCase() }}
              </div>
            </div>

            <div class="task-url" :title="task.url">
              {{ task.url }}
            </div>

            <!-- 进度信息 -->
            <div class="task-progress-section" v-if="task.status !== 'waiting'">
              <div class="progress-info">
                <span class="progress-text">{{ task.progress }}%</span>
                <span class="speed-text" v-if="task.status === 'downloading' && task.speed">
                  {{ formatSpeed(task.speed) }}
                </span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar" :style="{ width: task.progress + '%' }"></div>
              </div>
            </div>

            <!-- 错误信息 -->
            <div v-if="task.status === 'error' && task.error" class="task-error">
              <span class="error-icon">⚠</span>
              {{ task.error }}
            </div>
          </div>

          <!-- 任务操作 -->
          <div class="task-actions">
            <button v-if="task.status === 'downloading'" class="btn-action btn-pause" @click="pauseTask(task.id)"
              title="暂停">
              ⏸
            </button>

            <button v-if="task.status === 'paused' || task.status === 'error'" class="btn-action btn-resume"
              @click="resumeTask(task.id)" title="继续">
              ▶
            </button>

            <button class="btn-action btn-remove" @click="removeTask(task.id)" title="删除">
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 刷新按钮 -->
    <div class="refresh-section" v-if="tasks.length">
      <button class="btn-secondary refresh-btn" @click="fetchTasks" :disabled="isLoading">
        <span class="btn-icon">🔄</span>
        {{ isLoading ? '刷新中...' : '刷新' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref, computed } from 'vue'
import { DownloadTask } from '../../types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const tasks: Ref<DownloadTask[]> = ref([])
const isLoading = ref(false)

defineEmits<{
  (e: 'add-task'): void
}>()

// 主题管理
const currentTheme = ref<'light' | 'dark'>('dark')

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'

  currentTheme.value = savedTheme || systemTheme
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}


// 计算属性
const downloadingCount = computed(() =>
  tasks.value.filter(task => task.status === 'downloading').length
)

const completedCount = computed(() =>
  tasks.value.filter(task => task.status === 'completed').length
)

const waitingCount = computed(() =>
  tasks.value.filter(task => task.status === 'waiting').length
)

const pausedCount = computed(() =>
  tasks.value.filter(task => task.status === 'paused').length
)

const errorCount = computed(() =>
  tasks.value.filter(task => task.status === 'error').length
)


// 获取任务列表
async function fetchTasks() {
  isLoading.value = true
  try {
    const result = await window.electronAPI.downloadList()
    if (result) {
      tasks.value = result
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  } finally {
    isLoading.value = false
  }
}


// 暂停任务
function pauseTask(taskId: string) {
  window.electronAPI?.downloadPause?.(taskId)
}

// 继续任务
function resumeTask(taskId: string) {
  window.electronAPI.downloadResume(taskId)
}

// 删除任务
function removeTask(taskId: string) {
  if (confirm(t('download.delete.confirm'))) {
    window.electronAPI.downloadRemove(taskId)
  }
}

// 提取文件名
function extractFileName(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const fileName = pathname.split('/').pop() || url
    return fileName
  } catch {
    return url
  }
}

// 格式化速度
function formatSpeed(speed: number): string {
  if (speed < 1024) return `${speed} B/s`
  if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`
  if (speed < 1024 * 1024 * 1024) return `${(speed / (1024 * 1024)).toFixed(1)} MB/s`
  return `${(speed / (1024 * 1024 * 1024)).toFixed(1)} GB/s`
}

onMounted(() => {
  initTheme()
  fetchTasks()
  
  // 下载更新监听
  window.electronAPI.onDownloadUpdate((newTasks: any) => {
    tasks.value = newTasks
  })
})
</script>

<style scoped>
.download-manager {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 刷新按钮区域 */
.refresh-section {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
}

.refresh-btn {
  min-width: 120px;
}

/* 任务统计 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--bg-card), var(--bg-hover));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm), var(--shadow-inner);
}

.stat-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--border-hover);
  border-color: var(--border-hover);
}

.stat-card:hover:before {
  opacity: 0.8;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.stat-icon.downloading {
  background: rgba(79, 70, 229, 0.1);
  color: var(--accent-primary);
}

.stat-icon.completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.stat-icon.waiting {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.stat-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--spacing-xs);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-title {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-description {
  margin: 0 0 var(--spacing-xl) 0;
  color: var(--text-muted);
  font-size: 0.875rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--bg-card), var(--bg-hover));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm), var(--shadow-inner);
}

.task-item:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--border-color);
  transition: all var(--transition-normal);
}

.task-item:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md), 0 0 0 1px var(--border-hover);
  transform: translateY(-2px);
}

.task-item.task-downloading:before {
  background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

.task-item.task-completed:before {
  background: linear-gradient(180deg, var(--success), #16a34a);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.task-item.task-error:before {
  background: linear-gradient(180deg, var(--error), #dc2626);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.task-item.task-paused:before {
  background: linear-gradient(180deg, var(--warning), #d97706);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}

/* 任务状态图标 */
.task-status-icon {
  flex-shrink: 0;
  margin-top: var(--spacing-xs);
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-icon.downloading {
  background: rgba(79, 70, 229, 0.1);
  color: var(--accent-primary);
  animation: pulse 2s infinite;
}

.status-icon.completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.status-icon.paused {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.status-icon.waiting {
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

/* 任务信息 */
.task-info {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.task-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.task-protocol {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.task-url {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--spacing-sm);
}

/* 进度区域 */
.task-progress-section {
  margin-top: var(--spacing-sm);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.speed-text {
  font-size: 0.75rem;
  color: var(--accent-primary);
  font-weight: 500;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, var(--bg-tertiary), var(--bg-secondary));
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-inner);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-hover));
  border-radius: var(--radius-sm);
  transition: width 0.5s ease;
  position: relative;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent);
  animation: shimmer-progress 2s infinite;
}

@keyframes shimmer-progress {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* 错误信息 */
.task-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--error);
}

.error-icon {
  font-size: 0.875rem;
}

/* 任务操作 */
.task-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.btn-action:hover {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  transform: scale(1.1);
}

.btn-pause:hover {
  background: var(--warning);
  border-color: var(--warning);
}

.btn-resume:hover {
  background: var(--success);
  border-color: var(--success);
}

.btn-remove:hover {
  background: var(--error);
  border-color: var(--error);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .manager-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions button {
    flex: 1;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .task-actions {
    justify-content: center;
    margin-top: var(--spacing-sm);
  }

  .task-name {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .task-url {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .task-count {
    display: none;
  }
}
</style>