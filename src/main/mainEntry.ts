import { app, BrowserWindow, ipcMain, nativeImage, nativeTheme, dialog } from "electron"
import { downloadManager } from './downloadManager'
import { SettingData } from "../types"
import { settings } from './settings'
import { join } from 'path'
import { i18n } from "./i18n";


let mainWindow: BrowserWindow;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimizable()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    })
}

function createWindow() {
    mainWindow = new BrowserWindow({
        minHeight:800,
        minWidth: 1200,
        width: 1200,
        height: 800,
        title: i18n.t('title'),
        icon: nativeImage.createFromPath(join(__dirname, '../public/icon.png')),
        webPreferences: {
            additionalArguments: [`--window-config=${JSON.stringify(settings.getConfig())}`],
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true,
            spellcheck: false,
        }
    });
    mainWindow.loadURL(process.argv[2]);
    mainWindow.setMenuBarVisibility(false);

    nativeTheme.themeSource = 'dark'

    ipcMain.handle('set-config', (_, cfg: SettingData) => { settings.setConfig(cfg) });
    ipcMain.handle('get-default-config', () => { return settings.getDefaultSettings() })

    ipcMain.handle('set-theme', (_, isDark: boolean) => {
        nativeTheme.themeSource = isDark ? 'dark' : 'light'
    })

    ipcMain.handle('select-directory', async () => {
        let res = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'], defaultPath: settings.getConfig().downloadPath });
        if (!res.canceled && res.filePaths.length !== 0) {
            settings.setConfig({ downloadPath: res.filePaths[0] })
            return res.filePaths[0]
        }
        return null;
    });

    // 获取任务列表
    ipcMain.handle('download-list', () => downloadManager.getTasks())

    // 添加任务
    ipcMain.handle('download-add', (_, url: string, protocol: string) => {
        downloadManager.addTask(url, protocol as any)
    })

    // 暂停任务
    ipcMain.handle('download-pause', (_, taskId: string) => {
        downloadManager.pauseTask(taskId)
    })

    // 恢复任务
    ipcMain.handle('download-resume', (_, taskId: string) => {
        downloadManager.resumeTask(taskId)
    })

    // 删除任务
    ipcMain.handle('download-remove', (_, taskId: string) => {
        downloadManager.removeTask(taskId)
    })

    // 监听任务更新，推送到渲染进程
    downloadManager.on('update', tasks => {
        mainWindow.webContents.send('download-update', tasks)
    })
}

app.whenReady().then(() => {
    createWindow();

})