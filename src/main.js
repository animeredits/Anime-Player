const { app, BrowserWindow, Tray, Menu, screen, Notification, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

let win;
let tray = null;
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

ipcMain.on("appClose", (event, playbackTime, videoId) => {
  const animePlayerPath = app.getPath('userData');
  const savePath = path.join(animePlayerPath, 'playback-time.json');

  // Read existing playback data
  let playbackData = {};
  if (fs.existsSync(savePath)) {
    playbackData = JSON.parse(fs.readFileSync(savePath));
  }

  // Save playback time for the video
  playbackData[videoId] = {
    time: playbackTime,
    timestamp: Date.now(), // Save the current time for expiration
  };

  // Write updated playback data to file
  fs.writeFileSync(savePath, JSON.stringify(playbackData));

  // Close the window, which will trigger the 'closed' event and cleanup
  if (win) {
    win.close();
  } else {
    app.quit(); 
  }
});

// Handle toggle full-screen event
ipcMain.on('toggle-fullscreen', (event) => {
  const isFullscreen = !win.isFullScreen();
  win.setFullScreen(isFullscreen);

  // Notify renderer about the updated fullscreen state
  event.sender.send('fullscreen-state-changed', isFullscreen);
});

// Logging for auto-updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Auto-updater events
autoUpdater.on('update-available', () => {
  new Notification({
    title: 'Update Available',
    body: 'A new update is available. Click to download and install.',
  }).show();
  win.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  new Notification({
    title: 'Update Ready',
    body: 'Update downloaded. Click to install now.',
  }).show();
  win.webContents.send('update_downloaded');
});

// Handle notification click to install the update
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

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
  // Save the playback time before quitting, specific to the videoId (file)
  const playbackData = { videoId, time: playbackTime };
  const animePlayerPath = app.getPath('userData');
  const savePath = path.join(animePlayerPath, 'playback-time.json');

  // Write the playback data to a JSON file
  fs.writeFileSync(savePath, JSON.stringify(playbackData));

  app.quit(); // Close the app
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});