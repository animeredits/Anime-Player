const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window Controls
  minimize: () => ipcRenderer.send('Minimize'),
  maximize: () => ipcRenderer.send('Maximize'),
  close: () => ipcRenderer.send('appClose'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),

  // Media Controls
  onPlayPause: (callback) => ipcRenderer.on('play-pause', callback),
  onNext: (callback) => ipcRenderer.on('next', callback),
  onPrevious: (callback) => ipcRenderer.on('previous', callback),
  onMute: (callback) => ipcRenderer.on('mute', callback),
  onIncreaseVolume: (callback) => ipcRenderer.on('increase-volume', callback),
  onDecreaseVolume: (callback) => ipcRenderer.on('decrease-volume', callback),

  // Update Controls
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  restartApp: () => ipcRenderer.send('restart_app'),

  // Send Play/Pause State to Main Process
  sendPlayPauseState: (state) => ipcRenderer.send('play-pause-state', state),

  // Custom Logo Handling
  saveCustomLogo: (filePath, fileName) => {return ipcRenderer.invoke('save-gif', filePath, fileName);},
  deleteLogo: (fileName) => ipcRenderer.invoke('delete-logo', fileName), // New delete logo function

  // Playback State Management
  savePlaybackTime: (playbackTime, videoId) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('save-playback-time', playbackTime, videoId); // Send playback time to main process
      ipcRenderer.once('playback-time-saved', (event, success) => {
        if (success) resolve();
        else reject(new Error('Failed to save playback time'));
      });
    });
  },
  onAppClosing: (callback) => {
    ipcRenderer.on('app-closing', () => {
      callback(); // Notify renderer to save playback time
    });
  },
  loadPlaybackTime: (callback) => {
    ipcRenderer.on('load-playback-time', (event, playbackData) => {
      callback(playbackData); // Load saved playback time
    });
  },
});
