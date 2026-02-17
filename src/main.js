const { app, BrowserWindow, Tray, Menu, screen, Notification, dialog, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const { net } = require('electron');

// Constants
const MEDIA_EXTENSIONS = ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.mp3', '.wav', '.aac', '.ogg', '.flac'];
const TWO_DAYS_IN_MILLIS = 2 * 24 * 60 * 60 * 1000;
let updaterWindow = null;
let isUpdating = false;

// App paths
app.setName('Anime Player');
const animePlayerPath = path.join(app.getPath('appData'), 'Anime Player');
app.setPath('userData', animePlayerPath);
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
  },
    windowState: {
    isMaximized: false,
    isFullscreen: false
  }
};

// Initialize app
function initApp() {
  ensureDirectories();
  app.setPath('userData', animePlayerPath);
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  app.commandLine.appendSwitch('enable-media-playback-hinting');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('--enable-features', 'PlatformHEVCDecoderSupport');
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
      backgroundThrottling: false,
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
  	  // Initialize window states
      appState.windowState.isMaximized = appState.win.isMaximized();
      appState.windowState.isFullscreen = appState.win.isFullScreen();
      appState.win.webContents.send('initial-window-states', {
      isMaximized: appState.windowState.isMaximized,
      isFullscreen: appState.windowState.isFullscreen
      });
      appState.win.webContents.send('initial-play-state', appState.playback.status);
      // appState.win.webContents.openDevTools(); // Only for development
      setTimeout(() => {
      createTray();
      updateThumbarButtons();
      }, 500);
  });

  setupWindowEvents();


  if (!app.isPackaged) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    console.log('electron-reload not available');
  }
}

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
  
appState.win.on('maximize', () => {
    appState.windowState.isMaximized = true;
  appState.win.webContents.send('window-maximize-state', true);
});

appState.win.on('unmaximize', () => {
    appState.windowState.isMaximized = false;
  appState.win.webContents.send('window-maximize-state', false);
});

  appState.win.on("closed", () => {
    cleanupWindow();
  });

appState.win.on('enter-full-screen', () => {
    appState.windowState.isFullscreen = true;
  appState.win.webContents.send('fullscreen-state-changed', true);
});

appState.win.on('leave-full-screen', () => {
    appState.windowState.isFullscreen = false;
  appState.win.webContents.send('fullscreen-state-changed', false);
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
  // Create tray if it doesn't exist or was destroyed
  if (!appState.tray || appState.tray.isDestroyed()) {
    appState.tray = new Tray(path.join(__dirname, "../assets/icons/icon.ico"));
    appState.tray.setToolTip('Anime Player');
    appState.tray.on("click", toggleWindowVisibility);
  }
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!appState.tray || appState.tray.isDestroyed()) return;

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
      label: `Shuffle: ${appState.playback.shuffle === 'on' ? 'On' : 'Off'}`,
      click: () => sendPlaybackCommand('shuffle')
    },
    { 
      label: `Repeat: ${formatRepeatState(appState.playback.repeat)}`,
      click: () => sendPlaybackCommand('repeat')
    },
    { type: "separator" },
    { 
      label: "Quit Anime Player", 
      click: () => {
        appState.isQuitting = true;
        app.quit();
      },
      enabled: !isUpdating
    }
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

function formatRepeatState(state) {
  switch (state) {
      case 'off': return 'Off';
      case 'one': return 'One';
      case 'all': return 'All';
      default: return 'Off';
  }
}

// Thumbar buttons
function updateThumbarButtons() {
  if (!appState.win || process.platform !== 'win32') return;

  appState.win.setThumbarButtons([
      {
          tooltip: 'Previous',
          icon: path.join(__dirname, '../assets/icons/back.png'),
          click: () => sendPlaybackCommand('previous'),
      },
      {
          tooltip: appState.playback.status === 'playing' ? 'Pause' : 'Play',
          icon: path.join(__dirname, 
              appState.playback.status === 'playing' 
                  ? '../assets/icons/pause.png' 
                  : '../assets/icons/play.png'),
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
  ipcMain.on("Maximize", () => {
	if (appState.win.isFullScreen()) {
		appState.win.setFullScreen(false);
		appState.windowState.isFullscreen = false;
		// Wait for fullscreen to exit before maximizing
		setTimeout(() => {
			appState.win.maximize();
			appState.windowState.isMaximized = true;
		}, 100);
	} else {
		if (appState.win.isMaximized()) {
			appState.win.unmaximize();
			appState.windowState.isMaximized = false;
		} else {
			appState.win.maximize();
			appState.windowState.isMaximized = true;
		}
	}
  });

  // Playback state updates
  ipcMain.on('play-pause-state-tray', (event, state) => {
    appState.playback.status = state;
    if (appState.tray && !appState.tray.isDestroyed()) {
      updateTrayMenu();
    }
  });
  
  ipcMain.on('play-pause-state-thumbar', (event, state) => {
    appState.playback.status = state;
    updateThumbarButtons();
  });

  ipcMain.on('shuffle-state', (event, state) => {
    appState.playback.shuffle = state;
    updateTrayMenu();
  });

  // Handle repeat state changes
  ipcMain.on('repeat-state', (event, state) => {
    appState.playback.repeat = state;
    updateTrayMenu();
  });

  // File dialogs
  ipcMain.handle("open-file-dialog", handleOpenFileDialog);
  ipcMain.handle("open-folder-dialog", handleOpenFolderDialog);
  ipcMain.handle("delete-file", handleDeleteFile);

  // Playback time
  ipcMain.on('save-playback-time', handleSavePlaybackTime);
  ipcMain.handle('load-playback-time', handleLoadPlaybackTime);
  ipcMain.on("delete-playback-entry", handleDeletePlaybackEntry);

  // App Update
  ipcMain.on('start-update-download', () => {
    autoUpdater.downloadUpdate();
  });

  // App Update
  ipcMain.on('start-update-download', () => {
    autoUpdater.downloadUpdate();
  });

  // App lifecycle
  ipcMain.on("appClose", handleAppClose);
}

ipcMain.on("toggle-fullscreen", () => {
	const willBeFullscreen = !appState.win.isFullScreen();
	appState.win.setFullScreen(willBeFullscreen);
	appState.windowState.isFullscreen = willBeFullscreen;

	// If exiting fullscreen and window was maximized before, restore that state
	if (!willBeFullscreen && appState.windowState.isMaximized) {
		setTimeout(() => {
			appState.win.maximize();
		}, 100);
	}
});

// Save custom logo to a user directory "Visualization" in this folder
ipcMain.handle('saveCustomLogo', async (event, fileBuffer, fileName) => {
  try {
      const savePath = path.join(visualizationPath, fileName);

      if (!fs.existsSync(visualizationPath)) {
          fs.mkdirSync(visualizationPath, { recursive: true });
      }

      fs.writeFileSync(savePath, Buffer.from(fileBuffer));

      return { success: true, path: `file://${savePath}` };  // Return absolute path
  } catch (error) {
      console.error('Failed to save logo:', error);
      return { success: false, error: error.message };
  }
});

// Modify your delete logo handler to use dynamic import
ipcMain.handle('delete-logo', async (event, fileName) => {
  try {
    const trash = await import('trash');  // Use dynamic import for ESM
    const logoPath = path.join(visualizationPath, fileName);

    // Check if the file exists before attempting to delete
    if (fs.existsSync(logoPath)) {
      // Send the file to the trash (recycle bin/trash folder)
      await trash.default(logoPath);  // Call trash.default since it's an ES module
      return { success: true, message: 'File moved to trash successfully' };
    } else {
      return { success: false, message: 'File not found' };
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
    return { success: false, message: 'Failed to delete file' };
  }
});

// Open file dialog to select media files or folders
async function handleOpenFileDialog() {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Media Files", extensions: MEDIA_EXTENSIONS.map(ext => ext.substring(1)) }]
    });

    if (result.canceled) return null;
    
    const filePaths = result.filePaths.map(filePath => path.normalize(filePath));
    
    // If only one file was selected, check its folder for siblings and sort them
    if (filePaths.length === 1) {
      const folderPath = path.dirname(filePaths[0]);
      const files = await fs.promises.readdir(folderPath, { withFileTypes: true });
      
      const siblingFiles = files
        .filter(file => file.isFile() && MEDIA_EXTENSIONS.includes(path.extname(file.name).toLowerCase()))
        .map(file => path.join(folderPath, file.name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      
      return {
        singleFile: true,
        currentFile: filePaths[0],
        siblingFiles
      };
    }
    
    // For multiple selected files, return them in the original selection order
    return {
      singleFile: false,
      files: filePaths // Maintain original order
    };
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
  // Save playback time if needed
  if (playbackTime && videoId) {
    let playbackData = loadPlaybackTime();
    playbackData[videoId] = { time: playbackTime, timestamp: Date.now() };
    try {
      fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
    } catch (error) {
      console.error("Error writing playback data:", error);
    }
  }

  // Don't quit if update is in progress
  if (isUpdating) {
    if (appState.win) {
      appState.win.hide();
    }
    return;
  }

  // Normal quit procedure
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
    appState.win?.webContents.send('show-offline-message');
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates();

  autoUpdater.on('update-available', () => {
    appState.win?.webContents.send('update-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    isUpdating = true;
    if (!updaterWindow) createUpdaterWindow();
    updaterWindow.webContents.send('download-progress', progress.percent);
  });

  autoUpdater.on('update-downloaded', () => {
    isUpdating = false;
    updaterWindow?.webContents.send('update-downloaded');
      appState.isQuitting = true;
      autoUpdater.quitAndInstall();
  
  });

  autoUpdater.on('error', (error) => {
    console.error('Update error:', error);
    isUpdating = false;
    if (updaterWindow) updaterWindow.close();
    appState.win?.webContents.send('update-error', error.message);
    
    // Show the main window if it was hidden due to update
    if (appState.win && !appState.win.isVisible()) {
      appState.win.show();
    }
  });
}

function createUpdaterWindow() {
  updaterWindow = new BrowserWindow({
    width: 350,
    height: 200,
    resizable: false,
    maximizable: false,
    closable: false,
    minimizable: true,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, './update/preload-updater.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  updaterWindow.loadFile(path.join(__dirname, './update/updater.html'));
  updaterWindow.on('ready-to-show', () => updaterWindow.show());
  updaterWindow.on('closed', () => updaterWindow = null);
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('before-quit', (event) => {
  if (!appState.isQuitting && !isUpdating) {
    event.preventDefault();
    appState.isQuitting = true;
    if (appState.win) {
      appState.win.webContents.send('app-closing');
    }
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
  app.quit();
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

