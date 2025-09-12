<template>
    <div class="settings-container">
        <div class="settings-content">
            <!-- 下载设置 -->
            <div class="setting-group">
                <h3 class="setting-title">
                    <span class="setting-icon">📁</span>
                    下载设置
                </h3>

                <div class="setting-item">
                    <label class="setting-label">默认下载路径</label>
                    <div class="setting-input-group">
                        <input v-model="settings.downloadPath" type="text" class="setting-input" placeholder="选择下载目录"
                            readonly>
                        <button class="btn-browse" @click="browseDownloadPath">
                            <span class="btn-icon">📂</span>
                            浏览
                        </button>
                    </div>
                    <p class="setting-description">选择文件的默认保存位置</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">并发下载数</label>
                    <div class="setting-input-group">
                        <input v-model.number="settings.maxConcurrent" type="number" class="setting-input" min="1"
                            max="10">
                        <span class="input-suffix">个</span>
                    </div>
                    <p class="setting-description">同时进行的最大下载任务数量</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">下载速度限制</label>
                    <div class="setting-input-group">
                        <input v-model.number="settings.speedLimit" type="number" class="setting-input" min="0"
                            placeholder="0 = 无限制">
                        <select v-model="settings.speedUnit" class="setting-select">
                            <option value="KB/s">KB/s</option>
                            <option value="MB/s">MB/s</option>
                        </select>
                    </div>
                    <p class="setting-description">限制单个任务的最大下载速度</p>
                </div>
            </div>

            <!-- 界面设置 -->
            <div class="setting-group">
                <h3 class="setting-title">
                    <span class="setting-icon">🎨</span>
                    界面设置
                </h3>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.autoOpenTasks" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        启动时自动打开任务面板
                    </label>
                    <p class="setting-description">应用启动时自动显示下载任务列表</p>
                </div>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.minimizeToTray" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        最小化到系统托盘
                    </label>
                    <p class="setting-description">关闭窗口时最小化到系统托盘而不退出</p>
                </div>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.showNotifications" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        显示下载通知
                    </label>
                    <p class="setting-description">下载完成或出错时显示系统通知</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">主题设置</label>
                    <select v-model="settings.theme" class="setting-select" @change="applyTheme">
                        <option value="dark">🌙 暗色主题</option>
                        <option value="light">☀️ 亮色主题</option>
                        <option value="auto">🔄 跟随系统</option>
                    </select>
                    <p class="setting-description">选择应用的外观主题</p>
                </div>
                <div class="setting-item">
                    <label class="setting-label">语言设置</label>
                    <select v-model="settings.language" class="setting-select">
                        <option value="zh">中文</option>
                        <option value="en">English</option>
                    </select>
                    <p class="setting-description">选择应用的语言</p>
                </div>
            </div>

            <!-- 网络设置 -->
            <div class="setting-group">
                <h3 class="setting-title">
                    <span class="setting-icon">🌐</span>
                    网络设置
                </h3>

                <div class="setting-item">
                    <label class="setting-label">连接超时 (秒)</label>
                    <input v-model.number="settings.timeout" type="number" class="setting-input" min="5" max="300">
                    <p class="setting-description">网络连接的超时时间</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">重试次数</label>
                    <input v-model.number="settings.retryCount" type="number" class="setting-input" min="0" max="10">
                    <p class="setting-description">下载失败时的自动重试次数</p>
                </div>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.useProxy" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        使用代理服务器
                    </label>

                    <div v-if="settings.useProxy" class="proxy-settings">
                        <div class="proxy-row">
                            <input v-model="settings.proxyHost" type="text" class="setting-input" placeholder="代理服务器地址">
                            <input v-model.number="settings.proxyPort" type="number" class="setting-input proxy-port"
                                placeholder="端口">
                        </div>
                    </div>
                    <p class="setting-description">通过代理服务器进行下载</p>
                </div>
            </div>
        </div>

        <!-- 设置操作 -->
        <div class="settings-actions">
            <button class="btn-secondary" @click="resetSettings">
                <span class="btn-icon">🔄</span>
                重置设置
            </button>
            <button class="btn-primary" @click="saveSettings">
                <span class="btn-icon">💾</span>
                保存设置
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useconfigstore } from '../store/store';
import { SettingData } from '../../types';



const settings = ref<SettingData>(useconfigstore().config)

// 定义组件emit
const emit = defineEmits<{
    (e: 'theme-change', theme: string): void
}>()

// 浏览下载路径
const browseDownloadPath = async () => {
    const result = await window.electronAPI.selectDirectory()
    if (result !== null) {
        settings.value.downloadPath = result
    }

}

// 应用主题
const applyTheme = () => {
    emit('theme-change', settings.value.theme)
}

// 保存设置
const saveSettings = async () => {
    try {
        // 这里应该调用 Electron API 来保存设置
        await window.electronAPI.setConfig(settings.value)

        console.log('设置已保存')
    } catch (error) {
        console.error('保存设置失败:', error)
    }
}

// 重置设置
const resetSettings = async () => {
    if (confirm('确定要重置所有设置到默认值吗？')) {

        const defaultSettings = await window.electronAPI.getdefaultConfig()
        settings.value = { ...defaultSettings }
    }
}

</script>

<style scoped>
.settings-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    position: relative;
}

.settings-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    padding: var(--spacing-lg);
}

/* 设置组 */
.setting-group {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
}

.setting-group:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-sm);
}

.setting-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin: 0 0 var(--spacing-lg) 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
}

.setting-icon {
    font-size: 1rem;
}

/* 设置项 */
.setting-item {
    margin-bottom: var(--spacing-lg);
}

.setting-item:last-child {
    margin-bottom: 0;
}

.setting-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.setting-description {
    margin: var(--spacing-xs) 0 0 0;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-style: italic;
}

/* 输入框样式 */
.setting-input,
.setting-select {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--text-primary);
    transition: all var(--transition-normal);
}

.setting-input:focus,
.setting-select:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px var(--accent-light);
}

.setting-input::placeholder {
    color: var(--text-muted);
}

/* 输入组样式 */
.setting-input-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.setting-input-group .setting-input {
    flex: 1;
}

.setting-input-group .setting-select {
    flex-shrink: 0;
    width: auto;
    min-width: 100px;
}

.proxy-port {
    width: 100px;
    flex-shrink: 0;
}

.input-suffix {
    font-size: 0.875rem;
    color: var(--text-muted);
    white-space: nowrap;
}

/* 浏览按钮 */
.btn-browse {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all var(--transition-normal);
    white-space: nowrap;
}

.btn-browse:hover {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
}

/* 复选框样式 */
.checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
    line-height: 1.5;
    will-change: transform;
    transform: translateZ(0);
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
    transition: all var(--transition-normal);
    position: relative;
    flex-shrink: 0;
    margin-top: 2px;
}

.checkbox-input:checked+.checkbox-custom {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
}

.checkbox-input:checked+.checkbox-custom::after {
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

/* 代理设置 */
.proxy-settings {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    transform: translateZ(0);
    will-change: transform;
    position: relative;
}

.proxy-row {
    display: flex;
    gap: var(--spacing-sm);
}

/* 设置操作区域 */
.settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    background: var(--bg-tertiary);
    /* 防止操作栏被压缩 */
}

.btn-primary,
.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
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

/* 滚动条优化 */
.settings-content::-webkit-scrollbar {
    width: 6px;
}

.settings-content::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
}

.settings-content::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--radius-sm);
}

.settings-content::-webkit-scrollbar-thumb:hover {
    background: var(--border-hover);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .settings-content {
        padding: var(--spacing-md);
    }

    .setting-group {
        padding: var(--spacing-md);
    }

    .settings-actions {
        flex-direction: column;
        padding: var(--spacing-md);
    }

    .setting-input-group {
        flex-direction: column;
        align-items: stretch;
    }

    .proxy-row {
        flex-direction: column;
    }

    .proxy-port {
        width: 100%;
    }
}
</style>