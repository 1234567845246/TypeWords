import { contextBridge, ipcRenderer } from "electron";
import { SettingData } from "../types";

 function parseArgv(key: string): SettingData | undefined {
    for (const arg of process.argv) {
        if (arg.indexOf(`--${key}=`) === 0) {
            return JSON.parse(arg.split('=')[1]);
        }
    }
    return undefined;
}
export declare interface ElectronAPI {
    getConfig: () => SettingData | undefined;
    getdefaultConfig: () => Promise<SettingData>;
    setConfig: (config: SettingData) => Promise<any>;
    setTheme: (isDark: boolean) => Promise<any>;

    selectDirectory:()=>Promise<string>;

    downloadAdd: (url: string, protocol: string) => Promise<any>;
    downloadList: () => Promise<any>;
    downloadPause: (taskId: string) => Promise<any>;
    downloadResume: (taskId: string) => Promise<any>;
    downloadRemove: (taskId: string) => Promise<any>;
    onDownloadUpdate: (cb: (tasks: any) => void) => void;
}

contextBridge.exposeInMainWorld('electronAPI', {
    getConfig: () => parseArgv('window-config'),
    getdefaultConfig: () => ipcRenderer.invoke('get-default-config'),
    setConfig: (config: SettingData) => ipcRenderer.invoke('set-config', config),

    setTheme: (isDark: boolean) => ipcRenderer.invoke('set-theme', isDark),

    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    downloadList: () => ipcRenderer.invoke('download-list'),
    downloadAdd: (url: string, protocol: string) => ipcRenderer.invoke('download-add', url, protocol),
    downloadPause: (taskId: string) => ipcRenderer.invoke('download-pause', taskId),
    downloadResume: (taskId: string) => ipcRenderer.invoke('download-resume', taskId),
    downloadRemove: (taskId: string) => ipcRenderer.invoke('download-remove', taskId),
    onDownloadUpdate: (cb: (tasks: any) => void) => ipcRenderer.on('download-update', (_, tasks) => cb(tasks)),
} as ElectronAPI)