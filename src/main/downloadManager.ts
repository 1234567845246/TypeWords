import { DownloadTask, AddTaskOptions } from '../types'
import { EventEmitter } from 'events'
import { downloadHttp } from './download/http'
// import { downloadBt } from './download/bt'
// 你可以类似实现 ftp/magnet

export class DownloadManager extends EventEmitter {
  private tasks: DownloadTask[] = []
  private maxConcurrent = 10
  private activeCount = 0
  private activeRequests: Map<string, any> = new Map() // 存储活跃的请求对象
  private progressIntervals: Map<string, NodeJS.Timeout> = new Map() // 存储进度更新定时器

  addTask({ url, protocol, savePath, autoStart }: AddTaskOptions) {
    const id = Date.now() + Math.random().toString(36).slice(2)
    const task: DownloadTask = {
      id, url, protocol, savePath,
      status: 'waiting',
      progress: 0,
      speed: 0,
      fileName: '', // 可通过url或协议解析
    }
    this.tasks.push(task)
    this.emit('update', this.tasks)
    if (autoStart !== false) {
      this.tryStartNext()
    }
  }
  // 主动启动某个 waiting 任务
  startTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId)
    if (task && task.status === 'waiting') {
      this.tryStartNext()
    }
  }

  private tryStartNext() {
    if (this.activeCount >= this.maxConcurrent) return
    const next = this.tasks.find(t => t.status === 'waiting')
    if (!next) return
    next.status = 'downloading'
    this.activeCount++
    this.emit('update', this.tasks)

    // 根据协议调用不同下载实现
    let downloadPromise: Promise<void>
    switch (next.protocol) {
      case 'http':
      case 'https':
        const request = downloadHttp(next, this.createProgressCallback(next.id))
        this.activeRequests.set(next.id, request) // 存储请求对象
        downloadPromise = request
        break
      case 'bt' : case 'magnet':
        // const btRequest = downloadBt(next, this.createProgressCallback(next.id))
        // this.activeRequests.set(next.id, btRequest) // 存储请求对象
        // downloadPromise = btRequest
        // break
      // case 'ftp': ...
      // case 'magnet': ...
      default:
        downloadPromise = Promise.reject('协议不支持')
    }

    downloadPromise.then(() => {
      next.status = 'completed'
      next.progress = 100
    }).catch(err => {
      if (err.message !== 'Download cancelled') { // 不是人工取消
        next.status = 'error'
        next.error = String(err)
      }
    }).finally(() => {
      this.activeCount--
      this.activeRequests.delete(next.id)
      this.clearProgressInterval(next.id)
      this.emit('update', this.tasks)
      this.tryStartNext()
    })
  }

  private createProgressCallback(taskId: string) {
    return (progress: number, speed: number) => {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.progress = progress
        task.speed = speed
        // 不需要每次都发送更新，使用节流
        this.throttleUpdate()
      }
    }
  }

  private throttleUpdate() {
    if (!this._throttleTimer) {
      this._throttleTimer = setTimeout(() => {
        this.emit('update', this.tasks)
        this._throttleTimer = null
      }, 100) // 每100ms最多更新一次
    }
  }
  private _throttleTimer: NodeJS.Timeout | null = null

  private clearProgressInterval(taskId: string) {
    const interval = this.progressIntervals.get(taskId)
    if (interval) {
      clearInterval(interval)
      this.progressIntervals.delete(taskId)
    }
  }

  getTasks() {
    return this.tasks
  }

  pauseTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId)
    if (task && task.status === 'downloading') {
      // 调用下载对象的pause方法
      const request = this.activeRequests.get(taskId)
      if (request && request.pause) {
        request.pause()
      }
      // 状态已在下载函数内部设置为paused
      this.activeRequests.delete(taskId)
      this.clearProgressInterval(taskId)
      this.activeCount--
      this.emit('update', this.tasks)
      this.tryStartNext() // 尝试启动下一个任务
    }
  }

  resumeTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId)
    if (task && task.status === 'paused') {
      task.status = 'waiting'
      this.emit('update', this.tasks)
      this.tryStartNext()
    }
  }

  removeTask(taskId: string) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.tasks[taskIndex]
      if (task.status === 'downloading') {
        // 如果正在下载，先取消
        const request = this.activeRequests.get(taskId)
        if (request && request.abort) {
          request.abort()
        }
        this.activeRequests.delete(taskId)
        this.clearProgressInterval(taskId)
        this.activeCount--
      }
      this.tasks.splice(taskIndex, 1)
      this.emit('update', this.tasks)
      this.tryStartNext() // 尝试启动下一个任务
    }
  }
}

export const downloadManager = new DownloadManager()