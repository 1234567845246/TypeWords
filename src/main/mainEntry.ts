import { app, BrowserWindow, nativeImage } from "electron"
import {join} from 'path'
app.setPath('userData',join(app.getPath('appData'),'PeerShare'));
let mainWindows: BrowserWindow;

function createWindow(){
       mainWindows = new BrowserWindow({
        width: 1200,
        height: 800,
        title:'Peer Share',
        icon:nativeImage.createFromPath(join(__dirname,'../public/icon.png')),
        webPreferences: {
            preload:join(__dirname,'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity:true,
            spellcheck: false,
        }
    });
    mainWindows.loadURL(process.argv[2]);
}

app.whenReady().then(() => {
    createWindow();

})