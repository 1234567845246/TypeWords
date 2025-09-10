import { DownloadTask } from "../../types"
import { createWriteStream, existsSync, statSync, unlinkSync } from 'node:fs'
import { parse } from 'url'
import { request as httpRequest } from "node:http"
import { request as httpsRequest } from "node:https"


interface HttpDownloadRequest {
  abort: () => void;
  pause: () => void;
  resume: () => void;
}

export function downloadHttp(
  task: DownloadTask,
  onProgress?: (progress: number, speed: number) => void
): Promise<void> & HttpDownloadRequest {
  let aborted = false
  let paused = false
  let currentRequest: any = null
  let currentResponse: any = null
  let writeStream: any = null
  let received = 0
  let total = 0
  let lastTime = Date.now()
  let lastReceived = 0

  const urlObj = parse(task.url)
  const isHttps = urlObj.protocol === 'https:'
  const requestModule = isHttps ? httpsRequest : httpRequest

  // 获取临时文件名和最终文件名
  const fileName = urlObj.pathname?.split('/').pop() || 'download'
  const tempFileName = fileName + '.tmp'
  task.fileName = fileName

  // 检查是否有已存在的临时文件（用于断点续传）
  let startByte = 0
  if (existsSync(tempFileName)) {
    const stats = statSync(tempFileName)
    startByte = stats.size
    received = startByte
  }

  const startDownload = () => {
    if (aborted) return Promise.reject(new Error('Download cancelled'))

    return new Promise<void>((resolve, reject) => {
      const options = {
        ...urlObj,
        headers: startByte > 0 ? { 'Range': `bytes=${startByte}-` } : {}
      }

      currentRequest = requestModule(options, (res: any) => {
        if (aborted) return

        // 检查状态码
        if (startByte > 0 && res.statusCode !== 206) {
          // 服务器不支持断点续传，从头开始
          if (existsSync(tempFileName)) {
            unlinkSync(tempFileName)
          }
          startByte = 0
          received = 0
          // 重新发起请求
          setTimeout(() => startDownload().then(resolve).catch(reject), 0)
          return
        } else if (startByte === 0 && res.statusCode !== 200) {
          return reject(new Error(`下载失败: HTTP ${res.statusCode}`))
        }

        currentResponse = res

        // 获取文件总大小
        if (res.headers['content-range']) {
          // 断点续传响应格式: "bytes 0-1023/1024"
          const match = res.headers['content-range'].match(/bytes \d+-\d+\/(\d+)/)
          if (match) {
            total = parseInt(match[1])
            task.totalSize = total
          }
        } else if (res.headers['content-length']) {
          total = startByte + parseInt(res.headers['content-length'])
          if (startByte === 0) {
            task.totalSize = total
          }
        }

        // 创建写入流（追加模式用于断点续传）
        writeStream = createWriteStream(tempFileName, { flags: startByte > 0 ? 'a' : 'w' })

        res.on('data', (chunk: Buffer) => {
          if (aborted || paused) return

          received += chunk.length
          task.startByte = received // 更新当前位置
          const progress = total ? Math.floor(received / total * 100) : 0

          // 计算下载速度（每100ms最多更新一次，遵循项目规范）
          const currentTime = Date.now()
          const timeDiff = currentTime - lastTime
          if (timeDiff >= 100) {
            const speed = Math.floor((received - lastReceived) / (timeDiff / 1000))
            task.progress = progress
            task.speed = speed

            if (onProgress) {
              onProgress(progress, speed)
            }

            lastTime = currentTime
            lastReceived = received
          }
        })

        res.pipe(writeStream)

        writeStream.on('finish', () => {
          if (!aborted && !paused) {
            writeStream.close(() => {
              // 下载完成，重命名临时文件
              if (existsSync(tempFileName)) {
                if (existsSync(fileName)) {
                  unlinkSync(fileName)
                }
                require('fs').renameSync(tempFileName, fileName)
              }
              task.progress = 100
              resolve()
            })
          }
        })

        writeStream.on('error', (err: any) => {
          if (!aborted) {
            reject(err)
          }
        })
      })

      currentRequest.on('error', (err: any) => {
        if (!aborted) {
          reject(err)
        }
      })

      currentRequest.end()
    })
  }

  const downloadPromise = startDownload()

  // 添加控制方法
  const control: HttpDownloadRequest = {
    abort: () => {
      aborted = true
      if (currentRequest) {
        currentRequest.destroy()
      }
      if (currentResponse) {
        currentResponse.destroy()
      }
      if (writeStream) {
        writeStream.destroy()
      }
      // 删除临时文件
      if (existsSync(tempFileName)) {
        unlinkSync(tempFileName)
      }
    },

    pause: () => {
      if (!paused && !aborted) {
        paused = true
        task.status = 'paused'
        if (currentRequest) {
          currentRequest.destroy()
        }
        if (currentResponse) {
          currentResponse.destroy()
        }
        if (writeStream) {
          writeStream.end()
        }
      }
    },

    resume: () => {
      if (paused && !aborted) {
        paused = false
        task.status = 'downloading'
        // 从当前位置继续下载
        if (existsSync(tempFileName)) {
          const stats = statSync(tempFileName)
          startByte = stats.size
          received = startByte
        }
        // 重新开始下载流程
        setTimeout(() => {
          startDownload().then(() => {
            task.progress = 100
          }).catch(err => {
            if (err.message !== 'Download cancelled') {
              task.status = 'error'
              task.error = String(err)
            }
          })
        }, 0)
      }
    }
  }

  // 将控制方法添加到Promise上
  Object.assign(downloadPromise, control)

  return downloadPromise as Promise<void> & HttpDownloadRequest
}