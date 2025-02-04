const { app, BrowserWindow, Tray, Menu, screen, Notification,dialog, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const mime = require("mime-types");
const { readFileSync } = require("fs");
const { net } = require('electron');

let win;
let tray = null;
let fileToOpen = process.argv.find(arg => /\.(mp4|mkv|mp3)$/i.test(arg)) || null;
let isPlaying = false;
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      experimentalFeatures: true,
      webSecurity: true, 
      enableHardwareAcceleration: true,
      backgroundThrottling: false,
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
      tooltip: isPlaying ? 'Pause' : 'Play',
      icon: path.join(__dirname, isPlaying ? '../assets/icons/pause.png' : '../assets/icons/play.png'), // Update icon based on isPlaying
      click() {
        isPlaying = !isPlaying;
        win.webContents.send('play-pause');
        updateThumbarButtons(); 
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

  const updateContextMenu = (playbackState = 'paused', shuffleState = 'off', repeatState = 'off') => {
    const playPauseLabel = (playbackState === 'playing') ? 'Pause' : 'Play';
    const shuffleLabel = (shuffleState === 'off') ? 'Shuffle Off' : 'Shuffle On';
    const repeatLabel = (repeatState === 'off') ? 'Repeat Off' : 'Repeat On';

    const contextMenu = Menu.buildFromTemplate([
      {
        label: win.isVisible() ? 'Hide Anime Media Player in Taskbar' : 'Show Anime Media Player',
        click: () => {
          win.isVisible() ? win.hide() : (win.show(), win.maximize());
        }
      },
      {
        label: playPauseLabel,
        click: () => {
          win.webContents.send('play-pause');
        }
      },
      {
        label: "Next",
        click: () => {
          win.webContents.send('next');
        }
      },
      {
        label: "Previous",
        click: () => {
          win.webContents.send('previous');
        }
      },
      {
        label: shuffleLabel,
        click: () => {
          win.webContents.send('shuffle');
        }
      },
      {
        label: repeatLabel,
        click: () => {
          win.webContents.send('repeat');
        }
      },
      {
        label: "Mute",
        click: () => {
          win.webContents.send('mute');
        }
      },
      {
        label: "Increase Volume",
        click: () => {
          win.webContents.send('increase-volume');
        }
      },
      {
        label: "Decrease Volume",
        click: () => {
          win.webContents.send('decrease-volume');
        }
      },
      {
        label: "Quit",
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
  };

  updateContextMenu(); // Initialize with 'paused' state and 'off' for shuffle and repeat

  tray.on("click", () => {
    win.isVisible() ? win.hide() : (win.show(), win.maximize());
    updateContextMenu(); // Update context menu based on visibility
  });

  win.on('hide', updateContextMenu);
  win.on('show', updateContextMenu);

  // Listen for play/pause state from the renderer process
  ipcMain.on('play-pause-state', (event, state) => {
    updateContextMenu(state);
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
}

// Prevent all global shortcuts and register new shortcut
app.on('ready', () => {
  const animePlayerPath = app.getPath('userData');
  const savePath = path.join(animePlayerPath, 'playback-time.json');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-oop-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('enable-media-playback-hinting');
  app.commandLine.appendSwitch('enable-hardware-media-decode')
  
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

  // Notify the renderer process about the window state change
  win.webContents.send("window-state-changed", isFullScreen);
});

// Handle toggle full-screen event
ipcMain.on('toggle-fullscreen', (event) => {
  const isFullscreen = !win.isFullScreen();
  win.setFullScreen(isFullscreen);

  // Notify renderer about the updated fullscreen state
  event.sender.send('fullscreen-state-changed', isFullscreen);
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

// Check for updates when online
autoUpdater.on('update-available', () => {
  dialog
    .showMessageBox(win, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version of Anime Player is available. Would you like to update now?',
      buttons: ['Update Now', 'Later'],
    })
    .then((result) => {
      if (result.response === 0) {
        // User chose 'Update Now', start downloading the update
        autoUpdater.downloadUpdate();
      }
    });
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
        // Ensure all windows are closed before updating
        if (tray) {
          tray.destroy(); // Remove tray icon
        }
        if (win) {
          win.removeAllListeners('close'); // Prevent any other close event logic
          win.close();
        }

        app.quit(); // Quit the application completely

        // Restart with the update
        autoUpdater.quitAndInstall();
      }
    });
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
ipcMain.handle('save-gif', async (event, fileBuffer, fileName) => {
  try {
    const savePath = path.join(visualizationPath, fileName);

    // Ensure the Visualization directory exists
    if (!fs.existsSync(visualizationPath)) {
      fs.mkdirSync(visualizationPath, { recursive: true });
    }

    // Write the file buffer to the target path
    fs.writeFileSync(savePath, Buffer.from(fileBuffer)); // Save the buffer
    return { success: true, path: savePath };
  } catch (error) {
    console.error('Failed to save GIF:', error);
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

ipcMain.on("appClose", (event, playbackTime, videoId) => {
  const animePlayerPath = app.getPath("userData");
  const savePath = path.join(animePlayerPath, "playback-time.json");

  // Read existing playback data if available
  let playbackData = {};
  if (fs.existsSync(savePath)) {
    try {
      playbackData = JSON.parse(fs.readFileSync(savePath, "utf-8"));
    } catch (error) {
      console.error("Error reading playback data:", error);
      playbackData = {};
    }
  }

  // Save playback time for the video
  playbackData[videoId] = {
    time: playbackTime,
    timestamp: Date.now(),
  };

  // Write updated playback data to file
  try {
    fs.writeFileSync(savePath, JSON.stringify(playbackData, null, 2)); // Pretty print for readability
  } catch (error) {
    console.error("Error writing playback data:", error);
  }

  // Destroy tray if exists
  if (global.tray) {
    global.tray.destroy();
  }

  // Close the window safely
  if (global.win) {
    global.win.destroy();
  }

  // Ensure app exits cleanly
  setTimeout(() => {
    app.quit();
    process.exit(0);
  }, 100);
});

ipcMain.on('save-playback-time', (event, playbackTime, videoId) => {
  const animePlayerPath = app.getPath('userData');
  const savePath = path.join(animePlayerPath, 'playback-time.json');

  // Save the playback time data synchronously
  try {
    const playbackData = { videoId, time: playbackTime };
    fs.writeFileSync(savePath, JSON.stringify(playbackData)); // Sync write
    // console.log('Playback time saved successfully.');
    event.reply('playback-time-saved', true); // Send success response
  } catch (err) {
    console.error('Failed to save playback time:', err);
    event.reply('playback-time-saved', false); // Send failure response
  }
});

// Ensure playback time is saved before the app quits
app.on('before-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault(); // Prevent immediate quitting
    isQuitting = true; // Mark that the quit has been requested

    // Send a signal to the renderer to save the playback time before quitting
    if (win && win.webContents) {
      win.webContents.send('app-closing');
    }
  }
});

app.on('activate', () => {
  if (win === 0) {
      createWindow();
  }
});

if (process.platform === 'darwin') {
  app.on('open-file', (event, filePath) => {
      event.preventDefault();
      fileToOpen = filePath;
      if (win) {
          win.webContents.send('open-file', filePath);
      } else {
        win.show(filePath);
      }
  });
} else {
  // Handle file path for Windows
  fileToOpen = process.argv.length > 1 ? process.argv[1] : null;
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    fileToOpen = filePath;
  
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      win.webContents.send('open-file', filePath); // Send file to existing window
    } else {
      createWindow();
      win.once('ready-to-show', () => {
        win.webContents.send('open-file', filePath);
      });
    }
  });
  
  app.on('second-instance', (event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
  
      // Check if a file was passed when the app was opened again
      const newFile = commandLine.find(arg => /\.(mp4|mkv|mp3)$/i.test(arg));
      if (newFile) {
        win.webContents.send('open-file', newFile);
      }
    }
  });
  

  // Ensure Windows handles files correctly when launched
  app.whenReady().then(() => {
    const newFile = process.argv.find(arg => /\.(mp4|mkv|mp3)$/i.test(arg));
    if (newFile) fileToOpen = newFile;
    win.show();
  });
}

ipcMain.on('request-open-file', (event) => {
  if (fileToOpen) {
      event.reply('open-file', fileToOpen);
  }
});

// Handle file open event from renderer
ipcMain.handle("get-file-data", (event, filePath) => {
  try {
      const buffer = readFileSync(filePath);
      const mimeType = mime.lookup(filePath) || "application/octet-stream";
      const fileName = path.basename(filePath);
      return { buffer, mimeType, fileName };
  } catch (error) {
      console.error("Error reading file:", error);
      return null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      app.quit();
  }    
});  

