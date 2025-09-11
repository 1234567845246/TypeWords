import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import { Config } from '../types'
import { messages } from './i18n/i18n'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'


let config = window.electronAPI.getConfig() as Config;
const i18n = createI18n({
    legacy:false,
    locale: config.language,
    fallbackLocale: 'en',
    messages
})

createApp(App).use(i18n).use(createPinia()).mount('#app')
