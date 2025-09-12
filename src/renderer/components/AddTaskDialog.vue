<template>
  <div class="dialog-overlay" @click="onOverlayClick">
    <div class="dialog-container" @click.stop>
      <div class="dialog-header">
        <h3 class="dialog-title">
          <span class="title-icon">➕</span>
          {{ $t('download.add.title') }}
        </h3>
        <button class="close-btn" @click="$emit('close')" :title="t('download.close')">
          ✕
        </button>
      </div>
      
      <div class="dialog-body">
        <form @submit.prevent="onAdd" class="task-form">
          <!-- URL 输入 -->
          <div class="form-group">
            <label for="url-input" class="form-label">
              <span class="label-icon">🔗</span>
              {{ $t('download.add.url') }}
            </label>
            <input 
              id="url-input"
              v-model="url" 
              type="url"
              class="form-input"
              :placeholder="t('download.add.urlinput')"
              required
              :class="{ 'input-error': urlError }"
              @input="validateUrl"
            />
            <div v-if="urlError" class="error-message">
              <span class="error-icon">⚠</span>
              {{ urlError }}
            </div>
            <div v-if="detectedProtocol" class="detected-info">
              <span class="info-icon">ℹ️</span>
              {{ $t('download.add.protocoltype') }} :{{ getProtocolName(detectedProtocol) }}
            </div>
          </div>

          <!-- 协议选择 -->
          <div class="form-group">
            <label for="protocol-select" class="form-label">
              <span class="label-icon">⚙️</span>
              {{ $t('download.add.protocol') }}
            </label>
            <select 
              id="protocol-select"
              v-model="protocol" 
              class="form-select"
            >
              <option value="http">🌐 HTTP/HTTPS</option>
              <option value="ftp">📁 FTP</option>
              <option value="bt">🌍 BitTorrent (.torrent)</option>
              <option value="magnet">🧠 磁力链接 (magnet:)</option>
            </select>
          </div>

          <!-- 高级设置 -->
          <div class="form-group">
            <button 
              type="button" 
              class="toggle-advanced" 
              @click="showAdvanced = !showAdvanced"
            >
              <span class="toggle-icon" :class="{ 'rotated': showAdvanced }">▶</span>
              {{ $t('download.add.advanced') }} 
            </button>
            
            <div v-if="showAdvanced" class="advanced-options">
              <div class="option-group">
                <label for="save-path" class="option-label">{{ $t('download.add.savepath') }}</label>
                <input 
                  id="save-path"
                  v-model="savePath" 
                  type="text"
                  class="form-input"
                  :placeholder="t('download.add.savepath.default')"
                />
              </div>
              
              <div class="option-group">
                <label class="checkbox-label">
                  <input 
                    v-model="autoStart" 
                    type="checkbox" 
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  {{ $t('download.add.autostart') }}
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div class="dialog-footer">
        <button 
          type="button" 
          class="btn-secondary" 
          @click="$emit('close')"
        >
          {{ $t('download.cancelbutton') }}
        </button>
        <button 
          type="button" 
          class="btn-primary" 
          @click="onAdd"
          :disabled="!isValidUrl"
        >
          <span class="btn-icon">➕</span>
          添加任务
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const url = ref('')
const protocol = ref('http')
const savePath = ref('')
const autoStart = ref(true)
const showAdvanced = ref(false)
const urlError = ref('')

const emit = defineEmits<{
  (e: 'add', task: { 
    url: string
    protocol: string
    savePath?: string
    autoStart: boolean
  }): void
  (e: 'close'): void
}>()

// 检测协议类型
const detectedProtocol = computed(() => {
  if (!url.value) return null
  
  if (url.value.startsWith('magnet:')) return 'magnet'
  if (url.value.startsWith('ftp:')) return 'ftp'
  if (url.value.startsWith('http:') || url.value.startsWith('https:')) return 'http'
  if (url.value.endsWith('.torrent')) return 'bt'
  
  return null
})

// 验证 URL
const isValidUrl = computed(() => {
  return url.value.trim() !== '' && !urlError.value
})

// 获取协议名称
function getProtocolName(proto: string): string {
  const names = {
    'http': 'HTTP/HTTPS',
    'ftp': 'FTP',
    'bt': 'BitTorrent',
    'magnet': '磁力链接'
  }
  return names[proto as keyof typeof names] || proto
}

// 验证 URL 格式
function validateUrl() {
  urlError.value = ''
  
  if (!url.value.trim()) {
    return
  }
  
  // 简单的 URL 验证
  const urlPattern = /^(https?:\/\/|ftp:\/\/|magnet:).+/i
  const torrentPattern = /\.(torrent)$/i
  
  if (!urlPattern.test(url.value) && !torrentPattern.test(url.value)) {
    urlError.value = '请输入有效的链接格式'
  }
}

// 自动设置协议
watch(detectedProtocol, (newProtocol) => {
  if (newProtocol) {
    protocol.value = newProtocol
  }
})

// 添加任务
function onAdd() {
  if (!isValidUrl.value) return
  
  // 最终协议检测
  let finalProtocol = protocol.value
  if (detectedProtocol.value) {
    finalProtocol = detectedProtocol.value
  }
  
  emit('add', {
    url: url.value.trim(),
    protocol: finalProtocol,
    savePath: savePath.value.trim() || undefined,
    autoStart: autoStart.value
  })
}

// 点击遮罩层关闭
function onOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<style scoped>
/* 对话框遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

/* 对话框容器 */
.dialog-container {
  background: linear-gradient(135deg, var(--bg-card), var(--bg-hover));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl), 0 0 40px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  position: relative;
}

.dialog-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent);
  opacity: 0.8;
}

.dialog-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05), transparent 50%);
  pointer-events: none;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  font-size: 1rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg-hover);
  color: var(--text-muted);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--error);
  color: white;
  transform: scale(1.1);
}

/* 对话框主体 */
.dialog-body {
  padding: var(--spacing-xl);
  max-height: 60vh;
  overflow-y: auto;
}

/* 表单样式 */
.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.label-icon {
  font-size: 0.875rem;
}

.form-input, .form-select {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.form-input.input-error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input::placeholder {
  color: var(--text-muted);
}

/* 错误和信息提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--error);
}

.detected-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--accent-primary);
}

.error-icon, .info-icon {
  font-size: 0.875rem;
}

/* 高级设置 */
.toggle-advanced {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) 0;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.toggle-advanced:hover {
  color: var(--accent-primary);
}

.toggle-icon {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.toggle-icon.rotated {
  transform: rotate(90deg);
}

.advanced-options {
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  animation: fadeIn 0.3s ease;
}

.option-group {
  margin-bottom: var(--spacing-md);
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 复选框样式 */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.checkbox-label:hover .checkbox-custom {
  border-color: var(--accent-primary);
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
  border: none;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-icon {
  font-size: 0.75rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-container {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .dialog-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .dialog-body {
    padding: var(--spacing-lg);
  }
  
  .dialog-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .dialog-footer button {
    width: 100%;
  }
  
  .advanced-options {
    padding: var(--spacing-md);
  }
}

/* 滚动条优化 */
.dialog-body::-webkit-scrollbar {
  width: 6px;
}

.dialog-body::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.dialog-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-sm);
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}
</style>