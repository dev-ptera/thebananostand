const { app, BrowserWindow } = require('electron');

function createWindow() {
    win = new BrowserWindow({width: 800, height: 800});
    console.log('hello');
    win.loadFile('dist/thebananostand/index.html');
}

app.whenReady().then(() => {
    createWindow()
})
