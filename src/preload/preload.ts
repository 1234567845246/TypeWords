import { contextBridge } from "electron";

function parseArgv(key: string) {
    for (const arg of process.argv) {
        if (arg.indexOf(`--${key}=`) === 0) {
            return JSON.parse(arg.split('=')[1]);
        }
    }
    return undefined;
}
export declare interface ElectronAPI{

}

contextBridge.exposeInMainWorld('electronAPI',{} as ElectronAPI)