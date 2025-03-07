const { app, BrowserWindow, Tray, Menu, screen, Notification,dialog, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const { net } = require('electron');

let win;
let tray = null;
let fileToOpen = process.argv.find(arg => /\.(mp4|mkv|mp3)$/i.test(arg)) || null;
const gotTheLock = app.requestSingleInstanceLock(); 
let playbackState = 'paused'; 
let isPlayingForTray = false;   
let isPlayingForThumbar = false; 
let isQuitting = false;
const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

// Set user data path to avoid permission issues and create the logos folder
const animePlayerPath = path.join(app.getPath('appData'), 'Anime Player');
// Check if the "Anime Player" folder exists (case insensitive)
const folderExists = fs.existsSync(animePlayerPath);

// If the folder does not exist, create it
if (!folderExists) {
  fs.mkdirSync(animePlayerPath, { recursive: true });
}

app.setPath('userData', animePlayerPath);

const visualizationPath = path.join(animePlayerPath, 'Visualization');

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
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
      experimentalFeatures: true,
      webSecurity: true, 
      enableHardwareAcceleration: true,
      backgroundThrottling: true,
      // devTools:true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // Disable default keyboard shortcuts for reload, dev tools, fullscreen, etc.
  win.webContents.on('before-input-event', (event, input) => {
    const disabledShortcuts = [
      (input.control && input.key.toLowerCase() === 'r'), // Ctrl+R
      (input.key === 'F5'),                              // F5
      (input.key === 'F11'),                             // F11
      (input.key === 'F12'),                             // F12
      (input.control && input.shift && input.key.toLowerCase() === 'i') // Ctrl+Shift+I
    ];
    if (disabledShortcuts.some(Boolean)) {
      event.preventDefault();
    }
  });

  win.once("ready-to-show", () => {
    if (fileToOpen) {
      win.webContents.send('open-file', fileToOpen);
    }
    win.maximize();
    createTray();
    setThumbarButtons();
    // win.webContents.openDevTools();
  });

  win.on("show", setThumbarButtons);
  win.on("minimize", (event) => {
    event.preventDefault();
    win.minimize();
  });

  win.on("closed", () => {
    win = null;
  });

  autoUpdater.checkForUpdatesAndNotify(); // Check for updates
}

function setThumbarButtons() {
  updateThumbarButtons();
}

function updateThumbarButtons() {
  win.setThumbarButtons([
    {
      tooltip: 'Previous',
      icon: path.join(__dirname, '../assets/icons/back.png'),
      click() {
        win.webContents.send('previous');
      },
    },
    {
      tooltip: isPlayingForThumbar ? 'Pause' : 'Play',
      icon: path.join(__dirname, isPlayingForThumbar ? '../assets/icons/pause.png' : '../assets/icons/play.png'),
      click() {
        win.webContents.send('play-pause');
      },
    },
    {
      tooltip: 'Next',
      icon: path.join(__dirname, '../assets/icons/next.png'),
      click() {
        win.webContents.send('next');
      },
    },
  ]);
}

function createTray() {

  tray = new Tray(path.join(__dirname, "../assets/icons/icon.ico"));
  tray.setToolTip('Anime Player');

  const updateContextMenu = (shuffleState = 'off', repeatState = 'off') => {
    
      const playPauseLabel = playbackState === 'playing' ? 'Pause' : 'Play';
      const shuffleLabel = shuffleState === 'off' ? 'Shuffle Off' : 'Shuffle On';
      const repeatLabel = repeatState === 'off' ? 'Repeat Off' : 'Repeat On';

      const contextMenu = Menu.buildFromTemplate([
          { label: win.isVisible() ? 'Hide Anime Player' : 'Show Anime Player', click: () => win.isVisible() ? win.hide() : win.show() },
          { type: "separator" },
          { label: playPauseLabel, click: () => win.webContents.send('play-pause') },
          { label: "Next", click: () => win.webContents.send('next') },
          { label: "Previous", click: () => win.webContents.send('previous') },
          { type: "separator" },
          { label: "Increase Volume", click: () => win.webContents.send('increase-volume') },
          { label: "Decrease Volume", click: () => win.webContents.send('decrease-volume') },
          { label: "Mute", click: () => win.webContents.send('mute') },
          { type: "separator" },
          { label: shuffleLabel, click: () => win.webContents.send('shuffle') },
          { label: repeatLabel, click: () => win.webContents.send('repeat') },
          { type: "separator" },
          { label: "Quit Anime Player", click: () => app.quit() }
      ]);
      tray.setContextMenu(contextMenu);
  };

  updateContextMenu();

  tray.on("click", () => {
      win.isVisible() ? win.hide() : win.show();
      updateContextMenu();
  });

  win.on('hide', updateContextMenu);
  win.on('show', updateContextMenu);

// Handle play-pause state updates separately
ipcMain.on('play-pause-state-tray', (event, state) => {
  playbackState  = state;
  updateContextMenu();
});

ipcMain.on('play-pause-state-thumbar', (event, state) => {
  isPlayingForThumbar = state === 'playing'; 
  updateThumbarButtons();
});
  
  ipcMain.on('shuffle-state', (event, state) => {
    const playbackState = 'paused'; 
    updateContextMenu(playbackState, state);
  });

  ipcMain.on('repeat-state', (event, state) => {
    const playbackState = 'paused';
    const shuffleState = 'off'; // Keep shuffleState unchanged
    updateContextMenu(playbackState, shuffleState, state);
  });

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
            win.webContents.once("did-finish-load", () => {
                win.webContents.send("open-folder-from-context", openedPath);
            });
        }
    }
}

// Prevent all global shortcuts and register new shortcut
app.on('ready', () => {
  const animePlayerPath = app.getPath('userData');
  const savePath = path.join(animePlayerPath, 'playback-time.json');
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-oop-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch("use-angle", "d3d11");
  app.commandLine.appendSwitch('enable-media-playback-hinting');
  app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling,MediaPlaybackHinting,HardwareVideoDecode');
  
  createWindow();

  // Load playback data and remove outdated entries
  if (fs.existsSync(savePath)) {
    let playbackData = JSON.parse(fs.readFileSync(savePath));
    const currentTime = Date.now();
    
    // Remove entries older than 2 days
    Object.keys(playbackData).forEach(videoId => {
      if (currentTime - playbackData[videoId].timestamp > twoDaysInMillis) {
        delete playbackData[videoId];
      }
    });

    // Save the updated data back to file
    fs.writeFileSync(savePath, JSON.stringify(playbackData));

    // Send the updated data to the renderer if the same video file is opened again
    win.webContents.once('did-finish-load', () => {
      win.webContents.send('load-playback-time', playbackData);
      win.webContents.send("fullscreen-state-changed", win.isFullScreen());
      win.webContents.send("initial-window-state", win.isFullScreen());
      win.webContents.send("request-initial-play-state", playbackState); 
    });
  }

  // Unregister any global shortcuts
  globalShortcut.unregisterAll();

  // Register a global shortcut (Ctrl+Shift+A)
  const ret = globalShortcut.register('Ctrl+Shift+A', () => {
    win.isMinimized() ? win.restore() : win.show();
    win.focus();
  });

  if (!ret) {
    console.log('Registration failed');
  }

  // Remove default menu to prevent any built-in Electron shortcuts
  Menu.setApplicationMenu(null); // Disable application menu globally
});


app.on('will-quit', () => {
  globalShortcut.unregisterAll(); // Unregister all shortcuts
});

// Handle IPC messages for window control
ipcMain.on("Minimize", () => {
  win.minimize();
});

ipcMain.on("Maximize", () => {
  const isFullScreen = !win.isFullScreen();
  win.setFullScreen(isFullScreen);
  win.webContents.send("window-state-changed", isFullScreen);
});

// Handle toggle full-screen event
ipcMain.on("toggle-fullscreen", (event) => {
  const isFullscreen = !win.isFullScreen();
  win.setFullScreen(isFullscreen);
  event.sender.send("fullscreen-state-changed", isFullscreen);
});

autoUpdater.on('download-progress', (progressObj) => {
  const { percent } = progressObj;

  // Send progress to renderer through preload.js
  if (win) {
    win.webContents.send('download-progress', percent);
  }
});

function isOnline() {
  return net.isOnline();
}

// Handle update events
if (isOnline()) {
  autoUpdater.checkForUpdates();
} else {
  dialog.showMessageBox(win, {
    type: 'warning',
    title: 'No Internet Connection',
    message: 'Could not check for updates. Please check your internet connection and try again later.',
  });
}

autoUpdater.on('update-available', () => {
  dialog
    .showMessageBox(win, {
      type: 'info',
      title: 'Update Available',
      message: 'Good news! A new version of Anime Player is available.',
      buttons: ['Update', 'Later'],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
        win.webContents.send('show-progress-bar'); // Show progress bar
      }
    });
});


autoUpdater.on('download-progress', (progress) => {
  if (win) {
    win.webContents.send('download-progress', progress.percent);
  }
});


autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox(win, {
      type: 'info',
      title: 'Update Ready',
      message: 'The update has been downloaded. Restart the app to apply it now?',
      buttons: ['Restart', 'Later'],
    })
    .then((result) => {
      if (result.response === 0) {
        app.quit();
        autoUpdater.quitAndInstall(false, true);
      }
    });

  win.webContents.send('hide-progress-bar'); // Hide progress bar after completion
});

  // autoUpdater.on('error', (error) => {
  //   dialog.showErrorBox('Update Error', error == null ? 'unknown' : (error.stack || error).toString());
  // });

// Update thumbnail buttons when state changes
ipcMain.on('play-pause-state', (event, state) => {
  isPlaying = (state === 'playing');
  updateThumbarButtons(); 
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

// Playback time save path
const savePath = path.join(animePlayerPath, 'playback-time.json');

// ✅ Save playback time on request from renderer process
ipcMain.on('save-playback-time', (event, playbackTime, videoId) => {
  if (!videoId) {
      console.error("❌ Error: videoId is undefined.");
      return;
  }

  let playbackData = loadPlaybackTime();
  playbackData[videoId] = { time: playbackTime, timestamp: Date.now() };

  try {
      fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
      event.reply('playback-time-saved', true);
  } catch (err) {
      console.error("❌ Failed to save playback time:", err);
      event.reply('playback-time-saved', false);
  }
});

// ✅ Function to load playback time and remove expired entries
function loadPlaybackTime() {
  try {
      if (fs.existsSync(savePath)) {
          let playbackData = JSON.parse(fs.readFileSync(savePath, 'utf8'));

          const now = Date.now();
          let updated = false;

          for (const videoId in playbackData) {
              if (now - playbackData[videoId].timestamp > twoDaysInMillis) {
                  delete playbackData[videoId]; // Remove outdated entry
                  updated = true;
              }
          }

          // Save the updated data if any entry was removed
          if (updated) {
              fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
              // console.log("🗑️ Deleted expired playback time entries");
          }

          return playbackData;
      }
  } catch (error) {
      console.error("❌ Error loading playback time:", error);
  }
  return {};
}


// ✅ Load playback time when requested
ipcMain.handle('load-playback-time', async (_, videoId) => {
  try {
      if (!fs.existsSync(savePath)) return { time: 0 };

      let playbackData = JSON.parse(fs.readFileSync(savePath, 'utf8'));
      const now = Date.now();
      const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000;

      if (playbackData[videoId]) {
          let { time, timestamp } = playbackData[videoId];

          if (now - timestamp > twoDaysInMillis) {
              delete playbackData[videoId]; // Remove expired entry
              fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
              return { time: 0 };
          }

          return { time: Math.max(0, time - 2) }; // Load 2 seconds earlier
      }

      return { time: 0 };
  } catch (error) {
      console.error('❌ Error loading playback time:', error);
      return { time: 0 };
  }
});


// ✅ Delete playback entry
ipcMain.on("delete-playback-entry", (event, videoId) => {
  if (!videoId) {
      console.error("❌ Error: videoId is undefined.");
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
      console.error("❌ Error deleting playback entry:", error);
  }
});

ipcMain.on("appClose", (event, playbackTime, videoId) => {
  let playbackData = loadPlaybackTime();
  playbackData[videoId] = { time: playbackTime, timestamp: Date.now() };

  try {
      fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2));
  } catch (error) {
      console.error("Error writing playback data:", error);
  }

  if (global.tray) global.tray.destroy();
  if (global.win) global.win.destroy();

  setTimeout(() => {
      app.quit();
      process.exit(0);
  }, 100);
});

// Ensure playback time is saved before the app quits
app.on('before-quit', (event) => {
  if (!isQuitting) {
      event.preventDefault();
      isQuitting = true;
      if (global.win) global.win.webContents.send('app-closing');
      setTimeout(app.quit, 500);
  }
});

app.on('activate', () => {
  if (win === 0) {
      createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      app.quit();
  }    
});  

if (!gotTheLock) {
  app.quit(); // Quit if another instance is running
} else {
  app.on("second-instance", (event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore(); // Restore if minimized
      win.focus(); // Bring the window to front

      // Extract the file path from command line arguments
      const filePath = commandLine.find(arg => /\.(mp4|mkv|mp3)$/i.test(arg));
      if (filePath) {
        win.webContents.send("open-file", filePath);
      }
    }
  });

  app.on("open-file", (event, path) => {  
    event.preventDefault();
    if (win) {
      win.webContents.send("open-file", path);
    } else {
      fileToOpen = path; 
    }
  });

  app.whenReady().then(() => {

    if (fileToOpen) {
      win.webContents.once("did-finish-load", () => {
        win.webContents.send("open-file", fileToOpen);
      });
    }
  });
}


// ✅ Open File Dialog (Multiple File Selection)
ipcMain.handle("open-file-dialog", async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Media Files", extensions: ["mp4", "mkv", "avi", "mp3", "flac", "wav"] }]
    });

    if (result.canceled) return null;
    return result.filePaths.map(filePath => path.normalize(filePath)); 
  } catch (error) {
    console.error("❌ Error opening file dialog:", error);
    return null;
  }
});

// ✅ Open Folder Dialog (Preserve File Order)
ipcMain.handle("open-folder-dialog", async () => {
  try {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });

    if (result.canceled) return null;
    
    const folderPath = path.normalize(result.filePaths[0]); 

    // ✅ Read directory safely & maintain original order
    const mediaFiles = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile() && file.name.match(/\.(mp4|mkv|avi|mp3|flac|wav)$/i))
      .map(file => path.join(folderPath, file.name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); 

    return mediaFiles.length > 0 ? mediaFiles : null;
  } catch (error) {
    console.error("❌ Error reading folder:", error);
    return null;
  }
});

ipcMain.handle("delete-file", async (event, filePath) => {
  if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
  }

  try {
      const trash = await import("trash"); 
      await trash.default(filePath); 
      // console.log("🗑️ File moved to Recycle Bin:", filePath);
  } catch (error) {
      console.error("❌ Error deleting file:", error);
  }
});