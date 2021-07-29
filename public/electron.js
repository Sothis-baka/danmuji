const electron = require("electron");
const { shell } = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({ width: 320, height: 280, frame: false, transparent: true, icon: __dirname + '/favicon.ico' });
    mainWindow.setPosition( -7, 0);
    mainWindow.setAlwaysOnTop(true, 'screen');
    mainWindow.setResizable(true);
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });
    mainWindow.on("closed", () => (mainWindow = null));

}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});