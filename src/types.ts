
export interface SettingData {
  downloadPath: string
  maxConcurrent: number
  speedLimit: number
  speedUnit: 'KB/s' | 'MB/s'
  autoOpenTasks: boolean
  minimizeToTray: boolean
  showNotifications: boolean
  theme: Theme,
  language: Language,
  timeout: number
  retryCount: number
  useProxy: boolean
  proxyHost: string
  proxyPort: number
  
  version: string
}

export type Theme = "light" | "dark" | "system"
export type Language = "zh"  | "en"



export type DownloadProtocol = 'http' | 'https' | 'ftp' | 'bt' | 'magnet';

export interface DownloadTask {
  id: string;
  url: string;
  protocol: DownloadProtocol;
  status: 'waiting' | 'downloading' | 'paused' | 'completed' | 'error';
  progress: number; // 0-100
  speed: number;    // bytes/sec
  fileName: string;
  error?: string;
  startByte?: number; // 用于断点续传
  totalSize?: number; // 文件总大小
}