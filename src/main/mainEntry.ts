import { app, BrowserWindow, ipcMain, nativeImage, nativeTheme, dialog, shell } from "electron"
import { downloadManager } from './downloadManager'
import { AddTaskOptions, SettingData, Theme } from "../types"
import { settings } from './settings'
import { join } from 'path'
import { i18n } from "./i18n";
import { access, constants } from "fs"


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
        minHeight: 800,
        minWidth: 1200,
        width: 1200,
        height: 800,
        title: i18n.t('title'),
        icon: nativeImage.createFromPath(join(__dirname, './icon.png')),
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

    nativeTheme.themeSource = settings.getConfig().theme;

    ipcMain.handle('set-config', async (_, cfg: SettingData) => {

        nativeTheme.themeSource = cfg.theme;

        if (cfg.language !== settings.getConfig().language) {
            let { response } = await dialog.showMessageBox(mainWindow,
                {
                    type: 'info',
                    noLink: true,
                    title: i18n.t('title'),
                    message: i18n.t('Restart'),
                    buttons: [i18n.t('restart'), i18n.t('about.close')],
                }
            );
            if (response === 0) {
                app.relaunch();
                app.exit(0);
            }
        }
        settings.setConfig(cfg)
    });
    ipcMain.handle('get-default-config', () => { return settings.getDefaultSettings() })

    ipcMain.handle('set-theme', (_, theme: Theme) => {
        if (theme !== settings.getConfig().theme) {
            nativeTheme.themeSource = theme;
        }
    })

    ipcMain.handle('select-directory', async () => {
        let res = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'], defaultPath: settings.getConfig().downloadPath });
        if (!res.canceled && res.filePaths.length !== 0) {
            settings.setConfig({ downloadPath: res.filePaths[0] })
            return res.filePaths[0]
        }
        return null;
    });

    ipcMain.on('show-about', () => {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            noLink: true,
            title: i18n.t('title'),
            message: i18n.t('about.title'),
            detail: i18n.t('about.message', { version: settings.getConfig().version }),
            buttons: [i18n.t('about.close')]
        })
    });

    ipcMain.on('open-path', (_, path: string) => {
        access(path, constants.F_OK, err => {
            if (!err) {
                shell.showItemInFolder(path);
            }
        })
    });

    // 获取任务列表
    ipcMain.handle('download-list', () => downloadManager.getTasks())

    // 添加任务
    ipcMain.handle('download-add', (_, task: AddTaskOptions) => {
        downloadManager.addTask(task)
    })
    //启动任务
    ipcMain.handle('download-start', (_, taskId: string) => {
        downloadManager.startTask(taskId)
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