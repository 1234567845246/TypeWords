export interface Config {

    udpPort: number,            //UDP广播端口
    websocketPort: number,      //WebSocket备用端口
    broadcastInterval: number,  //广播间隔(ms)

    
    theme: Theme,               //主题
    language: string            //语言
}


export type Theme = "light" | "dark" | "system"


export const DefaultConfig: Config = {
    udpPort: 8080,
    websocketPort: 8081,
    broadcastInterval: 500,
    theme: 'light',
    language: 'en'
}


export interface DeviceInfo {
    deviceId: string,
    deviceNmae: string,
    ip: string,
    port: number,
    inviteCode: number,
    lastSeen: number
}

export type UDPMessage = {
    type: 'DISCOVERY',
    deviceId: string,
}   //设备发现
    | {
        type: 'RESPONSE',
        deviceId: string,
        name: string,
        inviteCode: string,
        port: number,
    }  //响应
    | {
        type: 'INVITE',
        formDeviceId: string,
        toDeviceId: string,
        code: string
    } //邀请