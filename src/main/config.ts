import {existsSync,readFileSync,writeFileSync} from 'fs'

import {  Config } from '../types'
import { app } from 'electron'
import { join } from 'path'

 const DefaultConfig: Config = {
    version: '1.0.0',  
    theme: 'light',
    language:'en',
    downSavePath: app.getPath('downloads'),
}

class ConfigManager {
  private configPath:string =join(app.getPath('userData'), 'config.json');
  private config: Config

  constructor() {
    this.config = this.readConfigFromFile()
  }

  private readConfigFromFile(): Config {
    try {
      if (existsSync(this.configPath)) {
        const raw = readFileSync(this.configPath, 'utf-8')
        return { ...DefaultConfig, ...JSON.parse(raw) }
      }
    } catch (e) {
      console.error('读取配置失败:', e)
    }
    return { ...DefaultConfig }
  }

  public getConfig(): Config {
    return this.config
  }

  public setConfig(newConfig: Partial<Config>) {
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


export const config = new ConfigManager()