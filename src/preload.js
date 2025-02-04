const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window Controls
  minimize: () => ipcRenderer.send('Minimize'),
  maximize: () => ipcRenderer.send("Maximize"),
  close: () => ipcRenderer.send('appClose'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  onWindowStateChange: (callback) => {ipcRenderer.on("window-state-changed", (_, isFullScreen) => {callback(isFullScreen);}); }, 
  onFullscreenStateChanged: (callback) => {ipcRenderer.on('fullscreen-state-changed', (_, isFullscreen) => {callback(isFullscreen);});},

  // Media Controls
  onPlayPause: (callback) => ipcRenderer.on('play-pause', callback),
  sendPlayPauseState: (state) => ipcRenderer.send('play-pause-state', state),
  onNext: (callback) => ipcRenderer.on('next', callback),
  onPrevious: (callback) => ipcRenderer.on('previous', callback),
  onMute: (callback) => ipcRenderer.on('mute', callback),
  onIncreaseVolume: (callback) => ipcRenderer.on('increase-volume', callback),
  onDecreaseVolume: (callback) => ipcRenderer.on('decrease-volume', callback),
  onShuffleState: (callback) => ipcRenderer.on('shuffle', callback),
  sendShuffleState: (state) => ipcRenderer.send('shuffle-state', state),
  onRepeatState: (callback) => ipcRenderer.on('repeat', callback),
  sendRepeatState: (state) => ipcRenderer.send('repeat-state', state),

  // Update Controls
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  restartApp: () => ipcRenderer.send('restart_app'),


  // Custom Logo Handling
  saveCustomLogo: (fileBuffer, fileName) => { return ipcRenderer.invoke('save-gif', fileBuffer, fileName);},
  deleteLogo: (fileName) => ipcRenderer.invoke('delete-logo', fileName), 

  // Playback State Management
  savePlaybackTime: (playbackTime, videoId) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('save-playback-time', playbackTime, videoId);
      ipcRenderer.once('playback-time-saved', (event, success) => {
        if (success) resolve();
        else reject(new Error('Failed to save playback time'));
      });
    });
  },

  onAppClosing: (callback) => ipcRenderer.on('app-closing', callback),
  loadPlaybackTime: (callback) => {ipcRenderer.on('load-playback-time', (event, playbackData) => {callback(playbackData);});},

  send: (channel, data) => {ipcRenderer.send(channel, data);},
  on: (channel, func) => {ipcRenderer.on(channel, (event, ...args) => func(...args));},

   // File Open Handling
  onFileOpen: (callback) => {
    ipcRenderer.on('open-file', (event, filePath) => {
      callback(filePath);
    });
  },
  requestOpenFile: () => {
    ipcRenderer.send('request-open-file');
  },
  getFileData: (filePath) => ipcRenderer.invoke("get-file-data", filePath),

  // App update handling
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, percent) => callback(percent)),

});
