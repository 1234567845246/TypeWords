import { Config } from "../../types";
import { ref } from "vue";
import { defineStore } from "pinia";


export const useconfigstore = defineStore('config',()=>{
    const config = ref<Config>({
          downloadPath: '',
          maxConcurrent: 3,
          speedLimit: 0,
          speedUnit: 'MB/s',
          autoOpenTasks: true,
          minimizeToTray: false,
          showNotifications: true,
          theme: 'dark',
          language: 'en',
          timeout: 30,
          retryCount: 3,
          useProxy: false,
          proxyHost: '',
          proxyPort: 8080,
          version: '1.0.0'
    })
    async function loadconfig() {
        config.value = await window.electronAPI.getConfig() as Config;
    }

    return {
        config,
        loadconfig
    }
})