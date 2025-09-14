import { contextBridge, ipcRenderer } from "electron";
import { AddTaskOptions, SettingData, Theme } from "../types";

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
    setTheme: (theme:Theme) => Promise<any>;

    showAbout:()=>void;
    openPath:(path:string)=>void;
    selectDirectory:()=>Promise<string>;

    downloadAdd: (task:AddTaskOptions) => Promise<any>;
    downloadList: () => Promise<any>;
    downloadStart: (taskId: string) => Promise<any>;
    downloadPause: (taskId: string) => Promise<any>;
    downloadResume: (taskId: string) => Promise<any>;
    downloadRemove: (taskId: string) => Promise<any>;
    onDownloadUpdate: (cb: (tasks: any) => void) => void;
}

contextBridge.exposeInMainWorld('electronAPI', {
    getConfig: () => parseArgv('window-config'),
    getdefaultConfig: () => ipcRenderer.invoke('get-default-config'),
    setConfig: (config: SettingData) => ipcRenderer.invoke('set-config', config),
    setTheme: (theme:Theme) => ipcRenderer.invoke('set-theme', theme),
    showAbout:()=>ipcRenderer.send('show-about'),
    openPath:(path:string)=>ipcRenderer.send('open-path', path),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    downloadList: () => ipcRenderer.invoke('download-list'),
    downloadStart: (taskId: string) => ipcRenderer.invoke('download-start', taskId),
    downloadAdd: (task:AddTaskOptions) => ipcRenderer.invoke('download-add', task),
    downloadPause: (taskId: string) => ipcRenderer.invoke('download-pause', taskId),
    downloadResume: (taskId: string) => ipcRenderer.invoke('download-resume', taskId),
    downloadRemove: (taskId: string) => ipcRenderer.invoke('download-remove', taskId),
    onDownloadUpdate: (cb: (tasks: any) => void) => ipcRenderer.on('download-update', (_, tasks) => cb(tasks)),
} as ElectronAPI)