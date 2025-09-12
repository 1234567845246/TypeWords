import { existsSync, readFileSync, writeFileSync } from 'fs'
import { SettingData } from '../types'
import { app } from 'electron'
import { join } from 'path'


const DefaultSettings: SettingData = {
  downloadPath: app.getPath('downloads'),
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
}
app.setPath('userData', join(app.getPath('appData'), 'OmniDownloader'));

class SettingsManager {
  private configPath: string = join(app.getPath('userData'), 'config.json');
  private config: SettingData

  constructor() {
    this.config = this.readConfigFromFile()
  }

  private readConfigFromFile(): SettingData {
    try {
      if (existsSync(this.configPath)) {
        const raw = readFileSync(this.configPath, 'utf-8')
        return { ...DefaultSettings, ...JSON.parse(raw) }
      }
    } catch (e) {
      console.error('读取配置失败:', e)
    }
    return { ...DefaultSettings }
  }

  public getDefaultSettings(): SettingData {
    return DefaultSettings
  }

  public getConfig(): SettingData {
    return this.config
  }

  public setConfig(newConfig: Partial<SettingData>) {
    this.config = { ...this.config, ...newConfig }
    this.saveConfigToFile()
  }

  public saveConfigToFile() {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8')
    } catch (e) {
      console.error('保存配置失败:', e)
    }
  }

  public reload() {
    this.config = this.readConfigFromFile()
  }
}


export const settings = new SettingsManager()