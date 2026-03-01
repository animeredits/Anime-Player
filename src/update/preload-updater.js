const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronUpdater', {
  // Full progress object: { percent, bytesPerSecond, transferred, total }
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, data) => callback(data)),
  // { version }
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_, info) => callback(info)),
  // Window controls for frameless updater
  minimize: () => ipcRenderer.send('updater-minimize'),
});