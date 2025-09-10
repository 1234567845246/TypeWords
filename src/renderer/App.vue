<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DownloadList from './components/DownloadList.vue'

// 添加主题切换功能
const isDark = ref(true)

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value;
  window.electronAPI.setTheme(isDark.value);
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

// 初始化主题
onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
})
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">📥</div>
          <h1 class="app-title">OmniDownloader</h1>
          <span class="app-subtitle">下载管理器</span>
        </div>
        
        <div class="header-actions">
          <button 
            class="theme-toggle" 
            @click="toggleTheme"
            :title="isDark ? '切换到亮色主题' : '切换到暗色主题'"
          >
            {{ isDark ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <main class="app-main">
      <div class="main-content">
        <DownloadList />
      </div>
    </main>
    
    <!-- 底部状态栏 -->
    <footer class="app-footer">
      <div class="footer-content">
        <span class="status-text">准备就绪</span>
        <div class="footer-info">
          <span>PeerShare v1.0.0</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: radial-gradient(ellipse at top left, var(--bg-secondary) 0%, var(--bg-primary) 50%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.app-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.03), transparent, rgba(139, 92, 246, 0.03), transparent);
  animation: rotate 60s linear infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 顶部导航栏 - 增强暗黑主题版本 */
.app-header {
  background: linear-gradient(135deg, var(--bg-glass), var(--bg-card));
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md), 0 1px 0 rgba(99, 102, 241, 0.1);
  z-index: 100;
  position: relative;
}

.app-header:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  opacity: 0.5;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-hover));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  animation: shimmer 3s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.app-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bg-hover), var(--bg-card));
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm), var(--shadow-inner);
}

.theme-toggle:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.theme-toggle:hover {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  transform: rotate(180deg) scale(1.1);
  box-shadow: var(--shadow-md), var(--shadow-glow);
  border-color: var(--border-accent);
}

.theme-toggle:hover:before {
  opacity: 1;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

/* 底部状态栏 - 增强暗黑主题版本 */
.app-footer {
  background: linear-gradient(135deg, var(--bg-glass), var(--bg-card));
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-xl);
  backdrop-filter: blur(20px);
  box-shadow: 0 -1px 0 rgba(99, 102, 241, 0.1), var(--shadow-sm);
  position: relative;
}

.app-footer:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  opacity: 0.3;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
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
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .logo-section {
    gap: var(--spacing-sm);
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .app-subtitle {
    display: none;
  }
  
  .app-main {
    padding: var(--spacing-md);
  }
  
  .footer-content {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
