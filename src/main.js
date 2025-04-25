const { app, BrowserWindow, Tray, Menu, screen, Notification, dialog, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const { net } = require('electron');

// Constants
const MEDIA_EXTENSIONS = ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.mp3', '.wav', '.aac', '.ogg', '.flac'];
const TWO_DAYS_IN_MILLIS = 2 * 24 * 60 * 60 * 1000;

// App paths
const animePlayerPath = path.join(app.getPath('appData'), 'Anime Player');
const visualizationPath = path.join(animePlayerPath, 'Visualization');
const savePath = path.join(animePlayerPath, 'playback-time.json');

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(animePlayerPath)) {
    fs.mkdirSync(animePlayerPath, { recursive: true });
  }
  if (!fs.existsSync(visualizationPath)) {
    fs.mkdirSync(visualizationPath, { recursive: true });
  }
}

// Centralized state
const appState = {
  win: null,
  tray: null,
  isQuitting: false,
  gotTheLock: app.requestSingleInstanceLock(),
  playback: {
    status: 'paused', // 'playing' or 'paused'
    shuffle: 'off',   // 'on' or 'off'
    repeat: 'off',    // 'on' or 'off'
    volume: 100,
    muted: false,
    currentFile: null
  }
};

// Initialize app
function initApp() {
  ensureDirectories();
  app.setPath('userData', animePlayerPath);
  
  // Command line switches for performance
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-oop-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch("use-gl", "desktop");
  app.commandLine.appendSwitch("use-angle", "d3d11");
  app.commandLine.appendSwitch('enable-media-playback-hinting');
  app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling,MediaPlaybackHinting,HardwareVideoDecode');
}

// Window management
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  appState.win = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    frame: false,
    fullscreen: true,
    resizable: true,
    icon: path.join(__dirname, '../assets/icons/icon.ico'),
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webSecurity: true,
      experimentalFeatures: true,
      enableHardwareAcceleration: true,
      backgroundThrottling: true,
      webgl: true
    }
  });

  appState.win.webContents.on('did-finish-load', () => {
    // Handle any files passed at startup
    handleFileOpenFromArg();
  });

  appState.win.loadFile(path.join(__dirname, 'index.html'));

// Disable default keyboard shortcuts
appState.win.webContents.on('before-input-event', (event, input) => {
  const disabledShortcuts = [
    (input.control && input.key.toLowerCase() === 'r'), // Ctrl+R
    (input.key === 'F5'),                              // F5
    (input.key === 'F11'),                             // F11
    (input.key === 'F12'),                             // F12
    (input.control && input.shift && input.key.toLowerCase() === 'i'), // Ctrl+Shift+I
    (input.control && input.key.toLowerCase() === 'w') // Ctrl+W
  ];
  if (disabledShortcuts.some(Boolean)) {
    event.preventDefault();
  }
});

  appState.win.once("ready-to-show", () => {
    handleFileOpenFromArg();
    appState.win.maximize();
    // appState.win.webContents.openDevTools(); // Only for development
    setTimeout(() => {
      createTray();
      updateThumbarButtons();
    }, 500);
  });

  setupWindowEvents();

// Handle file/folder open from context menu
  ipcMain.handle("open-folder", async (event, folderPath) => {
  if (!fs.existsSync(folderPath)) return [];
  const mediaExtensions = [".mp4", ".webm", ".mkv", ".avi", ".mov", ".mp3", ".wav", ".aac", ".ogg", ".flac"];
  // Get all media files from the folder
  const mediaFiles = fs
      .readdirSync(folderPath)
      .filter(file => mediaExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => path.join(folderPath, file));
  return mediaFiles; // Return file list to the renderer
});

// Handle file open when launched via context menu
if (process.argv.length > 1) {
  const openedPath = process.argv[1];
    if (fs.lstatSync(openedPath).isDirectory()) {
      appState.win.webContents.once("did-finish-load", () => {
        appState.win.webContents.send("open-folder-from-context", openedPath);
        });
    }
}
}

function setupWindowEvents() {
  appState.win.on("show", updateThumbarButtons);
  
  appState.win.on("minimize", (event) => {
    event.preventDefault();
    appState.win.minimize();
  });

  appState.win.on("closed", () => {
    cleanupWindow();
  });

  appState.win.on('enter-full-screen', () => {
    updateWindowState(true);
  });

  appState.win.on('leave-full-screen', () => {
    updateWindowState(false);
  });
}

function cleanupWindow() {
  if (appState.tray) {
    appState.tray.destroy();
    appState.tray = null;
  }
  appState.win = null;
}

function updateWindowState(isFullscreen) {
  appState.win.webContents.send("fullscreen-state-changed", isFullscreen);
}

// Tray management
function createTray() {
  appState.tray = new Tray(path.join(__dirname, "../assets/icons/icon.ico"));
  appState.tray.setToolTip('Anime Player');
  updateTrayMenu();

  appState.tray.on("click", () => {
    toggleWindowVisibility();
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: appState.win.isVisible() ? 'Hide Anime Player' : 'Show Anime Player', 
      click: toggleWindowVisibility 
    },
    { type: "separator" },
    { 
      label: appState.playback.status === 'playing' ? 'Pause' : 'Play', 
      click: () => sendPlaybackCommand('play-pause') 
    },
    { label: "Next", click: () => sendPlaybackCommand('next') },
    { label: "Previous", click: () => sendPlaybackCommand('previous') },
    { type: "separator" },
    { label: "Increase Volume", click: () => sendPlaybackCommand('increase-volume') },
    { label: "Decrease Volume", click: () => sendPlaybackCommand('decrease-volume') },
    { label: "Mute", click: () => sendPlaybackCommand('mute') },
    { type: "separator" },
    { 
      label: appState.playback.shuffle === 'off' ? 'Shuffle Off' : 'Shuffle On', 
      click: () => sendPlaybackCommand('shuffle') 
    },
    { 
      label: appState.playback.repeat === 'off' ? 'Repeat Off' : 'Repeat On', 
      click: () => sendPlaybackCommand('repeat') 
    },
    { type: "separator" },
    { label: "Quit Anime Player", click: () => app.quit() }
  ]);
  
  appState.tray.setContextMenu(contextMenu);
}

function toggleWindowVisibility() {
  if (appState.win.isVisible()) {
    appState.win.hide();
  } else {
    appState.win.show();
    appState.win.focus();
  }
  updateTrayMenu();
}

// Thumbar buttons
function updateThumbarButtons() {
  if (!appState.win) return;

  appState.win.setThumbarButtons([
    {
      tooltip: 'Previous',
      icon: path.join(__dirname, '../assets/icons/back.png'),
      click: () => sendPlaybackCommand('previous'),
    },
    {
      tooltip: appState.playback.status === 'playing' ? 'Pause' : 'Play',
      icon: path.join(__dirname, appState.playback.status === 'playing' ? '../assets/icons/pause.png' : '../assets/icons/play.png'),
      click: () => sendPlaybackCommand('play-pause'),
    },
    {
      tooltip: 'Next',
      icon: path.join(__dirname, '../assets/icons/next.png'),
      click: () => sendPlaybackCommand('next'),
    },
  ]);
}

function sendPlaybackCommand(command) {
  if (appState.win) {
    appState.win.webContents.send(command);
  }
}

// File handling
function handleFileOpenFromArg() {
  const fileArgs = process.argv.filter(arg => {
    try {
      return typeof arg === 'string' && MEDIA_EXTENSIONS.includes(path.extname(arg).toLowerCase());
    } catch {
      return false;
    }
  });

  if (fileArgs.length > 0 && appState.win) {
    // Send all valid media files found in arguments
    fileArgs.forEach(fileArg => {
      appState.win.webContents.send('open-file', path.normalize(fileArg));
    });
  }
}

// Playback time management
function loadPlaybackTime() {
  try {
    if (fs.existsSync(savePath)) {
      let playbackData = JSON.parse(fs.readFileSync(savePath, 'utf8'));
      const now = Date.now();
      let updated = false;

      for (const videoId in playbackData) {
        if (now - playbackData[videoId].timestamp > TWO_DAYS_IN_MILLIS) {
          delete playbackData[videoId];
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
      }

      return playbackData;
    }
  } catch (error) {
    console.error("Error loading playback time:", error);
  }
  return {};
}

// IPC Handlers
function setupIPCHandlers() {
  // Window control
  ipcMain.on("Minimize", () => appState.win?.minimize());
  ipcMain.on("Maximize", () => appState.win?.setFullScreen(!appState.win.isFullScreen()));
  ipcMain.on("toggle-fullscreen", (event) => {
    const isFullscreen = !appState.win.isFullScreen();
    appState.win.setFullScreen(isFullscreen);
    event.sender.send("fullscreen-state-changed", isFullscreen);
  });

  // Playback state updates
  ipcMain.on('playback-state-update', (event, newState) => {
    Object.assign(appState.playback, newState);
    updateTrayMenu();
    updateThumbarButtons();
  });

  // File dialogs
  ipcMain.handle("open-file-dialog", handleOpenFileDialog);
  ipcMain.handle("open-folder-dialog", handleOpenFolderDialog);
  ipcMain.handle("delete-file", handleDeleteFile);

  // Playback time
  ipcMain.on('save-playback-time', handleSavePlaybackTime);
  ipcMain.handle('load-playback-time', handleLoadPlaybackTime);
  ipcMain.on("delete-playback-entry", handleDeletePlaybackEntry);

  // App lifecycle
  ipcMain.on("appClose", handleAppClose);
}

async function handleOpenFileDialog() {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Media Files", extensions: MEDIA_EXTENSIONS.map(ext => ext.substring(1)) }]
    });

    if (result.canceled) return null;
    return result.filePaths.map(filePath => path.normalize(filePath)); 
  } catch (error) {
    console.error("Error opening file dialog:", error);
    return null;
  }
}

async function handleOpenFolderDialog() {
  try {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (result.canceled) return null;
    
    const folderPath = path.normalize(result.filePaths[0]); 
    const files = await fs.promises.readdir(folderPath, { withFileTypes: true });

    const mediaFiles = files
      .filter(file => file.isFile() && MEDIA_EXTENSIONS.includes(path.extname(file.name).toLowerCase()))
      .map(file => path.join(folderPath, file.name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return mediaFiles.length > 0 ? mediaFiles : null;
  } catch (error) {
    console.error("Error reading folder:", error);
    return null;
  }
}

async function handleDeleteFile(event, filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path');
  }

  try {
    const trash = await import('trash');
    await trash.default(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

function handleSavePlaybackTime(event, playbackTime, videoId) {
  if (!videoId) {
    console.error("Error: videoId is undefined.");
    return;
  }

  let playbackData = loadPlaybackTime();
  playbackData[videoId] = { time: playbackTime, timestamp: Date.now() };

  try {
    fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
    event.reply('playback-time-saved', true);
  } catch (err) {
    console.error("Failed to save playback time:", err);
    event.reply('playback-time-saved', false);
  }
}

async function handleLoadPlaybackTime(event, videoId) {
  try {
    if (!fs.existsSync(savePath)) return { time: 0 };

    let playbackData = JSON.parse(fs.readFileSync(savePath, 'utf8'));
    const now = Date.now();

    if (playbackData[videoId]) {
      let { time, timestamp } = playbackData[videoId];

      if (now - timestamp > TWO_DAYS_IN_MILLIS) {
        delete playbackData[videoId];
        fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
        return { time: 0 };
      }

      return { time: Math.max(0, time - 2) }; // Load 2 seconds earlier
    }

    return { time: 0 };
  } catch (error) {
    console.error('Error loading playback time:', error);
    return { time: 0 };
  }
}

function handleDeletePlaybackEntry(event, videoId) {
  if (!videoId) {
    console.error("Error: videoId is undefined.");
    return;
  }

  try {
    if (fs.existsSync(savePath)) {
      let playbackData = JSON.parse(fs.readFileSync(savePath, "utf8"));
      if (playbackData[videoId]) {
        delete playbackData[videoId];
        fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
      }
    }
  } catch (error) {
    console.error("Error deleting playback entry:", error);
  }
}

function handleAppClose(event, playbackTime, videoId) {
  let playbackData = loadPlaybackTime();
  playbackData[videoId] = { time: playbackTime, timestamp: Date.now() };

  try {
    fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
  } catch (error) {
    console.error("Error writing playback data:", error);
  }

  if (appState.tray) appState.tray.destroy();
  if (appState.win) appState.win.destroy();

  setTimeout(() => {
    app.quit();
    process.exit(0);
  }, 100);
}

// Auto-updater
function setupAutoUpdater() {
  if (!net.isOnline()) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'No Internet Connection',
      message: 'Could not check for updates. Please check your internet connection.',
    });
    return;
  }

  autoUpdater.checkForUpdates();

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. Would you like to update now?',
      buttons: ['Update Now', 'Later'],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
        appState.win?.webContents.send('show-progress-bar');
      }
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    appState.win?.webContents.send('download-progress', progress.percent);
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart to apply?',
      buttons: ['Restart', 'Later'],
    }).then((result) => {
      if (result.response === 0) {
        appState.isQuitting = true;
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// App lifecycle
app.on('ready', () => {
  initApp();
  setupIPCHandlers();
  setupAutoUpdater();
  setupGlobalShortcut();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('before-quit', (event) => {
  if (!appState.isQuitting) {
    event.preventDefault();
    appState.isQuitting = true;
    appState.win?.webContents.send('app-closing');
    setTimeout(app.quit, 500);
  }
});

app.on('activate', () => {
  if (appState.win === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Single instance lock
if (!appState.gotTheLock) {
  app.quit(); // Exit immediately if not the first instance
} else {
  app.whenReady().then(() => {
    initApp();
    createWindow();
    setupIPCHandlers();
    setupAutoUpdater();
    setupGlobalShortcut();
    setTimeout(() => setupAutoUpdater(), 3000);
  });

  app.on("second-instance", (event, commandLine) => {
    // Focus existing window
    if (appState.win) {
      if (appState.win.isMinimized()) appState.win.restore();
      appState.win.focus();
  
      // Open file passed to second instance
      const filePath = commandLine.find(arg =>
        typeof arg === 'string' && MEDIA_EXTENSIONS.includes(path.extname(arg).toLowerCase())
      );
      if (filePath) {
        // Wait for window to be ready before sending
        if (appState.win.webContents.isLoading()) {
          appState.win.webContents.once('did-finish-load', () => {
            appState.win.webContents.send("open-file", path.normalize(filePath));
          });
        } else {
          appState.win.webContents.send("open-file", path.normalize(filePath));
        }
      }
    }
  });
  
  // Modify the open-file handler
  app.on("open-file", (event, filePath) => {
    event.preventDefault();
    if (appState.win) {
      // Window already exists
      if (appState.win.webContents.isLoading()) {
        appState.win.webContents.once('did-finish-load', () => {
          appState.win.webContents.send("open-file", path.normalize(filePath));
        });
      } else {
        appState.win.webContents.send("open-file", path.normalize(filePath));
      }
    } else {
      // Window doesn't exist yet, store the file path
      process.argv.push(filePath);
    }
  });
}  

// Global shortcut
function setupGlobalShortcut() {
  globalShortcut.unregisterAll();
}

// Shutdown functions
function shutdownPC() {
  const command = process.platform === 'win32' ? 'shutdown /s /t 0' : 'shutdown -h now';
  exec(command, (error) => {
    if (error) {
      console.error('Failed to shut down PC:', error);
      dialog.showErrorBox('Shutdown Error', 'Failed to shut down the PC.');
    }
  });
}

ipcMain.on('shutdown-pc', shutdownPC);

ipcMain.on('shutdown-after-time', (event, timeInMinutes) => {
  const timeInMillis = timeInMinutes * 60 * 1000;
  setTimeout(shutdownPC, timeInMillis);
});