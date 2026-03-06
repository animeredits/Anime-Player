const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // App Controls
  minimize: () => ipcRenderer.send('Minimize'),
  maximize: () => ipcRenderer.send('Maximize'),
  close: () => ipcRenderer.send('appClose'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  
  // Window state events
  onWindowMaximizeState: (callback) => ipcRenderer.on('window-maximize-state', (_, state) => callback(state)),
  onFullscreenStateChanged: (callback) => ipcRenderer.on('fullscreen-state-changed', (_, state) => callback(state)),
  onInitialWindowStates: (callback) => ipcRenderer.on('initial-window-states', (_, states) => callback(states)),
  
  // Update Control
  onUpdateAvailable:    (callback) => ipcRenderer.on('update-available',     callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onUpdateError:        (callback) => ipcRenderer.on('update-error',         callback),
  startUpdateDownload:  () => ipcRenderer.send('start-update-download'),
  checkForUpdates:      () => ipcRenderer.send('check-for-updates'),

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
    const validChannels = ["load-playback-time", "get-audio-thumbnail", "get-fullscreen-state","open-folder", "read-file-buffer","set-stream-file", "get-audio-tracks", "get-subtitle-tracks", "get-file-dates", "open-subtitle-dialog", "get-gpu-info"]; // Add here
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },

  // GPU info
  onGpuInfo: (callback) => ipcRenderer.on('gpu-info', (_, info) => callback(info)),

  // App info (version, platform, runtime details)
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  onAppClosing: (callback) => ipcRenderer.on("app-closing", callback),

  loadPlaybackTime: (callback) => ipcRenderer.on('load-playback-time', (event, playbackData) => callback(playbackData)),

  // Chapter Management
  loadChapters: (filePath) => ipcRenderer.invoke('load-chapters', filePath),
  onChaptersLoaded: (callback) => ipcRenderer.on('chapters-loaded', (_, chapters) => callback(chapters)),

  // File Open Handling
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
  onFileOpenWithName: (callback) => ipcRenderer.on("open-file-with-name", (event, data) => callback(data)),
  onFileOpen: (callback) => ipcRenderer.on("open-file", (event, filePath) => callback(filePath)),
  openFolderFromContext: (callback) => ipcRenderer.on("open-folder-from-context", (_, folderPath) => callback(folderPath)),
  openFolder: (folderPath) => ipcRenderer.invoke("open-folder", folderPath),

  // Shutdown Controls
  sendShutdownRequest: () => ipcRenderer.send('shutdown-pc'),
  setShutdownTimer: (minutes) => ipcRenderer.send('shutdown-after-time', minutes),

  // Hot-reload (development only)
  reloadRenderer: () => ipcRenderer.invoke('reload-renderer'),
  getDevMode: () => ipcRenderer.invoke('get-dev-mode'),
});