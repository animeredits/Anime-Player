const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // App Controls
  minimize: () => ipcRenderer.send('Minimize'),
  maximize: () => ipcRenderer.send('Maximize'),
  close: () => ipcRenderer.send('appClose'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  onWindowStateChange: (callback) => ipcRenderer.on("window-state-changed", (_, isFullScreen) => callback(isFullScreen)),
  onFullscreenStateChanged: (callback) => ipcRenderer.on('fullscreen-state-changed', (_, isFullscreen) => callback(isFullscreen)),
  onInitialWindowState: (callback) => ipcRenderer.on("initial-window-state", (_, isFullScreen) => callback(isFullScreen)),

  // Update Control
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, percent) => callback(percent)),
  showProgressBar: () => ipcRenderer.send('show-progress-bar'),
  hideProgressBar: () => ipcRenderer.send('hide-progress-bar'),
  restartApp: () => ipcRenderer.send('restart_app'),

  // Media Controls
  onPlayPause: (callback) => ipcRenderer.on('play-pause', callback),
  sendPlayPauseStateForTray: (state) => ipcRenderer.send('play-pause-state-tray', state),
  sendPlayPauseStateForThumbar: (state) => ipcRenderer.send('play-pause-state-thumbar', state),
  requestInitialPlayState: () => ipcRenderer.send('request-initial-play-state'),
  onInitialPlayState: (callback) => ipcRenderer.on('initial-play-state', (_, state) => callback(state)),
  onNext: (callback) => ipcRenderer.on('next', callback),
  onPrevious: (callback) => ipcRenderer.on('previous', callback),
  onMute: (callback) => ipcRenderer.on('mute', callback),
  onIncreaseVolume: (callback) => ipcRenderer.on('increase-volume', callback),
  onDecreaseVolume: (callback) => ipcRenderer.on('decrease-volume', callback),
  onShuffleState: (callback) => ipcRenderer.on('shuffle', callback),
  sendShuffleState: (state) => ipcRenderer.send('shuffle-state', state),
  onRepeatState: (callback) => ipcRenderer.on('repeat', callback),
  sendRepeatState: (state) => ipcRenderer.send('repeat-state', state),

  // Custom Logo Handling
  saveCustomLogo: (fileBuffer, fileName) => ipcRenderer.invoke('saveCustomLogo', fileBuffer, fileName),
  deleteLogo: (fileName) => ipcRenderer.invoke('delete-logo', fileName), 

  // Playback State Management
  savePlaybackTime: (playbackTime, videoId) => ipcRenderer.invoke('save-playback-time', playbackTime, videoId),

  send: (channel, ...args) => {
    const validChannels = ["save-playback-time", "delete-playback-entry", "appClose"];
    if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
    }
  },

  invoke: (channel, ...args) => {
    const validChannels = ["load-playback-time", "get-audio-thumbnail"]; // Add here
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },

  onAppClosing: (callback) => ipcRenderer.on("app-closing", callback),

  loadPlaybackTime: (callback) => ipcRenderer.on('load-playback-time', (event, playbackData) => callback(playbackData)),

  // File Open Handling
  onFileOpen: (callback) => ipcRenderer.on("open-file", (event, filePath) => callback(filePath)),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
});
