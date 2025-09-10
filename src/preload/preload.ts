import { contextBridge, ipcRenderer } from "electron";
import { Config } from "../types";

 function parseArgv(key: string): Config | undefined {
    for (const arg of process.argv) {
        if (arg.indexOf(`--${key}=`) === 0) {
            return JSON.parse(arg.split('=')[1]);
        }
    }
    return undefined;
}
export declare interface ElectronAPI {
    getConfig: () => Config | undefined
    setTheme: (isDark: boolean) => Promise<any>

    downloadAdd: (url: string, protocol: string) => Promise<any>;
    downloadList: () => Promise<any>;
    downloadPause: (taskId: string) => Promise<any>;
    downloadResume: (taskId: string) => Promise<any>;
    downloadRemove: (taskId: string) => Promise<any>;
    onDownloadUpdate: (cb: (tasks: any) => void) => void;
}

contextBridge.exposeInMainWorld('electronAPI', {
    getConfig: () => parseArgv('window-config'),

    setTheme: (isDark: boolean) => ipcRenderer.invoke('set-theme', isDark),

    downloadList: () => ipcRenderer.invoke('download-list'),
    downloadAdd: (url: string, protocol: string) => ipcRenderer.invoke('download-add', url, protocol),
    downloadPause: (taskId: string) => ipcRenderer.invoke('download-pause', taskId),
    downloadResume: (taskId: string) => ipcRenderer.invoke('download-resume', taskId),
    downloadRemove: (taskId: string) => ipcRenderer.invoke('download-remove', taskId),
    onDownloadUpdate: (cb: (tasks: any) => void) => ipcRenderer.on('download-update', (_, tasks) => cb(tasks)),
} as ElectronAPI)