export interface Config {
    theme: Theme;               //主题
    language: Language;            //语言
    version: string;
    downSavePath: string;
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