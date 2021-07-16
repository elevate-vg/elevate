/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow } = require('electron')
const path = require('path')
const { request } = require('http')

function createWindow() {
   const win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      // backgroundColor: '#000000',
      // color: '#ffffff',
      webPreferences: {
         preload: path.join(__dirname, 'preload.js'),
      },
   })

   win.on('ready-to-show', function () {
      win.show()
      win.focus()
      win.webContents.openDevTools()
   })

   win.loadFile('index.html')

   return tryLoad(win)
}

app.whenReady().then(() => {
   createWindow()

   app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
   })
})

app.on('window-all-closed', function () {
   if (process.platform !== 'darwin') app.quit()
})

/* UTILS */

// TODO: Refactor tryLoad() with less side effects
const tryLoad = (win) => {
   const DELAY = 250
   const TIMEOUT = 30 * (1000 / DELAY)
   // TODO: Show timeout message in electron if max tries reached
   let tries = 0
   // TODO: Don't assume host and port
   const url = 'http://localhost:31348/~/@simonwjackson/hello/catalog/steam'

   const fetch = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tryAgain = () => (tries <= TIMEOUT ? setTimeout(fetch, DELAY) : '')

      request(url, { method: 'HEAD' }, (res) => {
         console.info(res.statusCode)
         // TODO: is 200 the only status code to respond to?
         if (res.statusCode === 200) {
            // win.setBackgroundColor('#FFF')
            win.loadURL(url)
         } else {
            tries++
            tryAgain()
         }
      })
         .on('error', tryAgain)
         .end()
   }

   fetch()
   return win
}
