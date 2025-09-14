import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import { SettingData } from '../types'
import { messages } from './i18n/i18n'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import { setTheme } from './theme/theme'


let config = window.electronAPI.getConfig() as SettingData;
const i18n = createI18n({
    legacy:false,
    locale: config.language,
    fallbackLocale: 'en',
    messages
})
setTheme(config.theme);

createApp(App).use(i18n).use(createPinia()).mount('#app')
