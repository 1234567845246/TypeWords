import { Config } from "../../types";
import { ref } from "vue";
import { defineStore } from "pinia";


export const useconfigstore = defineStore('config',()=>{
    const config = ref<Config>({
        theme: 'light',
        language: 'zh',
        version: '1.0.0',
        downSavePath: ''
    })
    async function loadconfig() {
        config.value = await window.electronAPI.getConfig() as Config;
    }

    return {
        config,
        loadconfig
    }
})