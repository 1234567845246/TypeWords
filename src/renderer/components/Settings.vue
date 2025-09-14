<template>
    <div class="settings-container">
        <div class="settings-content">
            <!-- 下载设置 -->
            <div class="setting-group">
                <h3 class="setting-title">
                    <span class="setting-icon">📁</span>
                    {{ $t('settings.download.title') }}
                </h3>

                <div class="setting-item">
                    <label class="setting-label">{{ $t('settings.download.path') }}</label>
                    <div class="setting-input-group">
                        <input v-model="settings.downloadPath" type="text" class="setting-input"
                            :placeholder="$t('settings.download.path.placeholder')" readonly>
                        <button class="btn-browse" @click="browseDownloadPath">
                            <span class="btn-icon">📂</span>
                            {{ $t('settings.download.path.placeholder') }}
                        </button>
                    </div>
                    <p class="setting-description">{{ $t('settings.download.path.desc') }}</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ $t('settings.download.concurrent') }}</label>
                    <div class="setting-input-group">
                        <input v-model.number="settings.maxConcurrent" type="number" class="setting-input" min="1"
                            max="10">
                    </div>
                    <p class="setting-description">{{ $t('settings.download.concurrent.desc') }}</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ $t('settings.download.speed') }}</label>
                    <div class="setting-input-group">
                        <input v-model.number="settings.speedLimit" type="number" class="setting-input" min="0"
                            :placeholder="$t('settings.download.speed.desc')">
                        <select v-model="settings.speedUnit" class="setting-select">
                            <option value="KB/s">KB/s</option>
                            <option value="MB/s">MB/s</option>
                        </select>
                    </div>
                    <p class="setting-description">{{ $t('settings.download.speed.desc') }}</p>
                </div>
            </div>

            <!-- 界面设置 -->
            <div class="setting-group">
                <h3 class="setting-title">
                    <span class="setting-icon">🎨</span>
                    {{ $t('settings.interface.title') }}
                </h3>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.autoOpenTasks" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        {{ $t('settings.interface.autoOpen') }}
                    </label>
                    <p class="setting-description">{{ $t('settings.interface.autoOpen.desc') }}</p>
                </div>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.minimizeToTray" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        {{ $t('settings.interface.tray') }}
                    </label>
                    <p class="setting-description">{{ $t('settings.interface.tray.desc') }}</p>
                </div>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.showNotifications" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        {{ $t('settings.interface.notify') }}
                    </label>
                    <p class="setting-description">{{ $t('settings.interface.notify.desc') }}</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ $t('settings.interface.theme') }}</label>
                    <select v-model="settings.theme" class="setting-select" @change="applyTheme">
                        <option value="dark"> {{ $t('settings.interface.theme.dark') }}</option>
                        <option value="light"> {{ $t('settings.interface.theme.light') }}</option>
                        <option value="system"> {{ $t('settings.interface.theme.system') }}</option>
                    </select>
                    <p class="setting-description">{{ $t('settings.interface.theme.desc') }}</p>
                </div>
                <div class="setting-item">
                    <label class="setting-label">{{ $t('settings.interface.language') }}</label>
                    <select v-model="settings.language" class="setting-select">
                        <option value="zh">中文</option>
                        <option value="en">English</option>
                    </select>
                    <p class="setting-description">{{ $t('settings.interface.language.desc') }}</p>
                </div>
            </div>

            <!-- 网络设置 -->
            <div class="setting-group">
                <h3 class="setting-title">
                    <span class="setting-icon">🌐</span>
                    {{ $t('settings.network.title') }}
                </h3>

                <div class="setting-item">
                    <label class="setting-label">{{ $t('settings.network.timeout') }}</label>
                    <input v-model.number="settings.timeout" type="number" class="setting-input" min="5" max="300">
                    <p class="setting-description">{{ $t('settings.network.timeout.desc') }}</p>
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ $t('settings.network.retry') }}</label>
                    <input v-model.number="settings.retryCount" type="number" class="setting-input" min="0" max="10">
                    <p class="setting-description">{{ $t('settings.network.retry.desc') }}</p>
                </div>

                <div class="setting-item">
                    <label class="checkbox-label">
                        <input v-model="settings.useProxy" type="checkbox" class="checkbox-input">
                        <span class="checkbox-custom"></span>
                        {{ $t('settings.network.proxy') }}
                    </label>

                    <div v-if="settings.useProxy" class="proxy-settings">
                        <div class="proxy-row">
                            <input v-model="settings.proxyHost" type="text" class="setting-input"
                                :placeholder="$t('settings.network.proxy.host')">
                            <input v-model.number="settings.proxyPort" type="number" class="setting-input proxy-port"
                                :placeholder="$t('settings.network.proxy.port')">
                        </div>
                    </div>
                    <p class="setting-description">{{ $t('settings.network.proxy.desc') }}</p>
                </div>
            </div>
        </div>

        <!-- 设置操作 -->
        <div class="settings-actions">
            <button class="btn-secondary" @click="resetSettings">
                <span class="btn-icon"><img src="../assets/icons/reset.svg" width="20" height="20" /></span>
                {{ $t('settings.actions.reset') }}
            </button>
            <button class="btn-primary" @click="saveSettings">
                <span class="btn-icon"><img src="../assets/icons/save.svg" width="20" height="20" /></span>
                {{ $t('settings.actions.save') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, toRaw } from 'vue'
import { useconfigstore } from '../store/store';
import { SettingData } from '../../types';
import { useI18n } from 'vue-i18n';
import { setTheme } from '../theme/theme';


const { t } = useI18n()
const configStore = useconfigstore()
const settings = ref<SettingData>({ ...configStore.config })

watch(() => configStore.config, (newConfig) => {
    if (JSON.stringify(settings.value) !== JSON.stringify(newConfig)) {
        settings.value = { ...newConfig }
    }
}, { deep: true })

onMounted(() => {
    settings.value = { ...configStore.config }
})

// 定义组件props
const props = defineProps<{
    visible?: boolean
}>()

watch(() => props.visible, (newVisible) => {
    if (newVisible) {
        syncConfigFromStore()
    }
})

// 同步配置的方法
const syncConfigFromStore = () => {
    settings.value = { ...configStore.config }
}

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

    // 强制转换数值类型
    settings.value.maxConcurrent = Number(settings.value.maxConcurrent)
    settings.value.speedLimit = Number(settings.value.speedLimit)
    settings.value.timeout = Number(settings.value.timeout)
    settings.value.retryCount = Number(settings.value.retryCount)
    settings.value.proxyPort = Number(settings.value.proxyPort)

    await window.electronAPI.setConfig(toRaw(settings.value))
    setTheme(settings.value.theme);
    configStore.config = { ...settings.value }

}

// 重置设置
const resetSettings = async () => {
    if (confirm(t('settings.actions.reset.confirm'))) {

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

/* 设置组 - 毛玻璃效果 */
.setting-group {
    background: var(--bg-glass);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.08),
        0 4px 12px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.setting-group:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(25px) saturate(200%);
    -webkit-backdrop-filter: blur(25px) saturate(200%);
    box-shadow:
        0 12px 35px rgba(0, 0, 0, 0.12),
        0 6px 18px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        0 0 0 1px rgba(255, 255, 255, 0.08);
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

/* 代理设置 - 毛玻璃效果 */
.proxy-settings {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-glass-medium);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md);
    transform: translateZ(0);
    will-change: transform;
    position: relative;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        0 2px 8px rgba(0, 0, 0, 0.05);
}

.proxy-row {
    display: flex;
    gap: var(--spacing-sm);
}

/* 设置操作区域 - 毛玻璃效果 */
.settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: var(--bg-glass);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow:
        0 -4px 20px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
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