<script setup lang="ts">
import { ref, onMounted } from 'vue'
import icon from './assets/icons/icon.svg'
import DownloadList from './components/DownloadList.vue'
import AddTaskDialog from './components/AddTaskDialog.vue'
import Settings from './components/Settings.vue'
import { useI18n } from 'vue-i18n'
import { useconfigstore } from './store/store'
import { AddTaskOptions } from '../types'

const { t } = useI18n()
const version = ref('1.0.0')

// 当前激活的视图
const activeView = ref<'welcome' | 'tasks' | 'settings'>('welcome')
const showAddDialog = ref(false)


// 切换视图
const setActiveView = (view: 'welcome' | 'tasks' | 'settings') => {
  activeView.value = view
}

// 显示添加任务对话框
const showAddTaskDialog = () => {
  showAddDialog.value = true
}

// 添加任务处理函数
const handleAddTask = (task: AddTaskOptions) => {
  window.electronAPI.downloadAdd(task)
  showAddDialog.value = false
}

// 处理来自DownloadList的添加任务事件
const handleAddTaskFromList = () => {
  showAddTaskDialog()
}


const handAbout = () => {
  window.electronAPI.showAbout()
}
// 初始化主题
onMounted(async () => {
  await useconfigstore().loadconfig();
  version.value = useconfigstore().config.version;
})
</script>

<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- Logo区域 -->
      <div class="sidebar-logo">
        <div class="logo-icon"><img :src="icon" alt="Logo" width="32px" height="32px" /></div>
        <div class="logo-text">
          <h1 class="logo-title">OmniDownloader</h1>
          <span class="logo-subtitle">下载管理器</span>
        </div>
      </div>

      <!-- 导航按钮 -->
      <nav class="sidebar-nav">
        <button class="nav-button" :class="{ active: activeView === 'tasks' }" @click="setActiveView('tasks')"
          :title="t('download.nav.title2')">
          <span class="nav-icon">📋</span>
          <span class="nav-label">{{ $t('download.nav.title1') }}</span>
        </button>

        <button class="nav-button add-button" @click="showAddTaskDialog" :title="t('download.nav.title4')">
          <span class="nav-icon">➕</span>
          <span class="nav-label">{{ $t('download.nav.title3') }}</span>
        </button>

        <button class="nav-button" :class="{ active: activeView === 'settings' }" @click="setActiveView('settings')"
          :title="t('download.nav.title5')">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">{{ $t('download.nav.title5') }}</span>
        </button>
      </nav>

      <!-- 底部区域 -->
      <div class="sidebar-footer">
        <button class="nav-button" @click="handAbout" :title="t('download.nav.title7')">
          {{ $t('download.nav.title7') }}
        </button>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <div class="main-wrapper">
      <main class="app-main">
        <div class="main-content">
          <!-- 欢迎屏幕 -->
          <div v-if="activeView === 'welcome'" class="welcome-screen">
            <div class="welcome-content">
              <div class="welcome-icon"><img :src="icon" alt="Logo" width="32px" height="32px" /></div>
              <h2 class="welcome-title">{{ $t('download.welcome.title') }}</h2>
              <p class="welcome-subtitle">{{ $t('download.welcome.subtitle') }}</p>
              <div class="welcome-actions">
                <button class="btn-primary" @click="setActiveView('tasks')">
                  <span class="btn-icon">📋</span>
                  {{ $t('download.welcome.primary') }}
                </button>
                <button class="btn-secondary" @click="showAddTaskDialog">
                  <span class="btn-icon">➕</span>
                  {{ $t('download.welcome.secondary') }}
                </button>
              </div>
            </div>
          </div>

          <!-- 任务列表视图 -->
          <div v-if="activeView === 'tasks'" class="view-content tasks-view">
            <div class="view-header">
              <h2 class="view-title">
                <span class="view-icon">📋</span>
                {{ $t('download.nav.title2') }}
              </h2>
            </div>
            <DownloadList @add-task="handleAddTaskFromList" />
          </div>

          <!-- 设置视图 -->
          <div v-if="activeView === 'settings'" class="view-content settings-view">
            <div class="view-header">
              <h2 class="view-title">
                <span class="view-icon">⚙️</span>
                {{ $t('download.nav.title5') }}
              </h2>
            </div>
            <Settings :visible="activeView === 'settings'" />
          </div>
        </div>
      </main>

      <!-- 底部状态栏 -->
      <footer class="app-footer">
        <div class="footer-content">
          <span class="status-text">{{ $t('download.footer.status') }}</span>
          <div class="footer-info">
            <span>OmniDownloader v{{ version }}</span>
          </div>
        </div>
      </footer>
    </div>

    <!-- 添加任务对话框 -->
    <AddTaskDialog v-if="showAddDialog" @add="handleAddTask" @close="showAddDialog = false" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  position: relative;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}


@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 侧边栏样式 - 毛玻璃效果 */
.sidebar {
  width: 80px;
  background: var(--bg-glass);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    4px 0 20px rgba(0, 0, 0, 0.1),
    inset -1px 0 0 rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg) 0;
  z-index: 100;
  position: relative;
  transition: all var(--transition-normal);
}

.sidebar:hover {
  width: 200px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border-right-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    6px 0 25px rgba(0, 0, 0, 0.15),
    inset -1px 0 0 rgba(255, 255, 255, 0.1);
}

.sidebar:hover .logo-text,
.sidebar:hover .nav-label {
  opacity: 1;
  transform: translateX(0);
}

/* Logo区域 */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  padding: 0 var(--spacing-md);
  width: 100%;
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  flex-shrink: 0;
}

.logo-text {
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition-normal);
  min-width: 0;
}

.logo-title {
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-hover));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  animation: shimmer 3s ease-in-out infinite;
  white-space: nowrap;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 400;
  white-space: nowrap;
}

@keyframes shimmer {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

/* 导航按钮 */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  padding: 0 var(--spacing-md);
}

.nav-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  min-height: 48px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-glass-light);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.nav-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  background: var(--accent-primary);
  transform: scaleY(0);
  transition: transform var(--transition-normal);
}

.nav-button:hover {
  background: rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  color: white;
  transform: translateX(4px) scale(1.02);
  box-shadow:
    0 8px 20px rgba(99, 102, 241, 0.2),
    0 4px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.nav-button.active {
  background: rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  color: white;
  box-shadow:
    0 8px 20px rgba(99, 102, 241, 0.25),
    0 4px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
}

.nav-button.active:before {
  transform: scaleY(1);
}

.nav-button.add-button {
  background: rgba(34, 197, 94, 0.15);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: white;
  box-shadow:
    0 6px 15px rgba(34, 197, 94, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-button.add-button:hover {
  background: rgba(34, 197, 94, 0.25);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  box-shadow:
    0 10px 25px rgba(34, 197, 94, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(34, 197, 94, 0.4);
}

.nav-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.nav-label {
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition-normal);
  white-space: nowrap;
  min-width: 0;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 0 var(--spacing-md);
  width: 100%;
}

.theme-toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-glass-medium);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.theme-toggle:hover {
  background: rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  transform: rotate(180deg) scale(1.1);
  box-shadow:
    0 8px 20px rgba(99, 102, 241, 0.2),
    0 4px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

/* 主内容区域 */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  padding: var(--spacing-xl);
  min-height: 0;
  /* 重要：允许flex子元素缩小 */
}

/* 视图内容样式 */
.view-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease;
}

.view-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  /* 防止标题区域被压缩 */
}

.view-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.view-icon {
  font-size: 1.25rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 欢迎屏幕 */
.welcome-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  padding: var(--spacing-2xl);
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  animation: float 3s ease-in-out infinite;
}

.welcome-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  margin: 0 0 var(--spacing-xl) 0;
  color: var(--text-muted);
  font-size: 1.125rem;
}

.welcome-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* 底部状态栏 - 毛玻璃效果 */
.app-footer {
  background: var(--bg-glass);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  padding: 0 var(--spacing-xl);
  box-shadow:
    0 -4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}



.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.status-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.status-text::before {
  content: '●';
  color: var(--success);
  animation: pulse 2s infinite;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* 按钮样式 */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--accent-hover), var(--accent-primary));
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-card);
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .sidebar:hover {
    width: 60px;
  }

  .logo-text,
  .nav-label {
    display: none;
  }

  .main-content {
    padding: var(--spacing-md);
  }

  .view-header {
    margin-bottom: var(--spacing-md);
  }

  .view-title {
    font-size: 1.25rem;
  }

  .welcome-actions {
    flex-direction: column;
  }

  .footer-content {
    padding: var(--spacing-sm) var(--spacing-md);
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 50px;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-content {
    padding: var(--spacing-lg);
  }

  .main-content {
    padding: var(--spacing-sm);
  }
}
</style>
