const { app, BrowserWindow, Tray, Menu, screen, Notification, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('ignore-gpu-blacklist');

let win;
let tray = null;
let maximizeToggle = false;

// Set user data path to avoid permission issues and create the logos folder
const animePlayerPath = path.join(app.getPath('appData'), 'Anime Player');
app.setPath('userData', animePlayerPath); // Set user data path

const logosPath = path.join(animePlayerPath, 'Visualization');

// Create the logos folder if it doesn't exist
if (!fs.existsSync(logosPath)) {
  fs.mkdirSync(logosPath, { recursive: true }); // Create logos folder
}

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
      // devTools:true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // Disable default keyboard shortcuts for reload, dev tools, fullscreen, etc.
  win.webContents.on('before-input-event', (event, input) => {
    if (
      (input.control && input.key.toLowerCase() === 'r') ||    // Disable Ctrl+R (reload)
      (input.key === 'F5') ||                                  // Disable F5 (reload)
      (input.key === 'F11') ||                                 // Disable F11 (fullscreen)
      (input.key === 'F12') ||                                 // Disable F12 (dev tools)
      (input.control && input.shift && input.key.toLowerCase() === 'i') // Disable Ctrl+Shift+I (dev tools)
    ) {
      event.preventDefault();
    }
  });

  win.once("ready-to-show", () => {
    win.maximize();
    createTray();
    // win.webContents.openDevTools();

  });

  win.on("minimize", (event) => {
    event.preventDefault();
    win.minimize();
  });

  win.on("closed", () => {
    win = null;
  });

  autoUpdater.checkForUpdatesAndNotify(); // Check for updates
}

function createTray() {
  tray = new Tray(path.join(__dirname, "../assets/icons/icon.ico"));

  const updateContextMenu = (playbackState = 'playing') => {
    const playPauseLabel = (playbackState === 'playing') ? 'Pause' : 'Play';

    const contextMenu = Menu.buildFromTemplate([
      {
        label: win.isVisible() ? 'Hide Anime Media Player in Taskbar' : 'Show Anime Media Player',
        click: () => {
          if (win.isVisible()) {
            win.hide();
          } else {
            win.show();
            win.maximize();
          }
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
          tray.popUpContextMenu(); 
        }
      },
      {
        label: "Previous",
        click: () => {
          win.webContents.send('previous');
          tray.popUpContextMenu(); 
        }
      },
      {
        label: "Mute",
        click: () => {
          win.webContents.send('mute');
          tray.popUpContextMenu();
        }
      },
      {
        label: "Increase Volume",
        click: () => {
          win.webContents.send('increase-volume');
          tray.popUpContextMenu();
        }
      },
      {
        label: "Decrease Volume",
        click: () => {
          win.webContents.send('decrease-volume');
          tray.popUpContextMenu();
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

  updateContextMenu(); // Initialize with 'paused' state

  tray.on("click", () => {
    if (win.isVisible()) {
      win.hide(); 
    } else {
      win.show(); 
      win.maximize(); 
    }
    updateContextMenu(); // Update the context menu based on visibility
  });

  win.on('hide', updateContextMenu);
  win.on('show', updateContextMenu);

  // Listen for play/pause state from the renderer process
  ipcMain.on('play-pause-state', (event, state) => {
    updateContextMenu(state);
  });
}

// Prevent all global shortcuts and register new shortcut
app.on('ready', () => {
  createWindow();

  // Unregister any global shortcuts
  globalShortcut.unregisterAll();

  // Register a global shortcut (Ctrl+Shift+A)
  const ret = globalShortcut.register('Ctrl+Shift+A', () => {
    if (win.isMinimized()) {
      win.restore();
    }
    win.show();
    win.focus();
  });

  if (!ret) {
    console.log('Registration failed');
  }

  // Remove default menu to prevent any built-in Electron shortcuts
  Menu.setApplicationMenu(null); // Disable application menu globally
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// Handle IPC messages for window control
ipcMain.on("Minimize", () => {
  win.minimize();
});

ipcMain.on("Maximize", () => {
  if (maximizeToggle) {
    win.unmaximize();
  } else {
    win.maximize();
  }
  maximizeToggle = !maximizeToggle;
});

ipcMain.on("appClose", () => {
  app.quit();
});

// Handle toggle full-screen event
ipcMain.on('toggle-fullscreen', () => {
  const isFullScreen = win.isFullScreen();
  win.setFullScreen(!isFullScreen);
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

// Save custom logo to a user directory
ipcMain.handle('save-gif', async (event, filePath, fileName) => {
  try {
    const savePath = path.join(app.getPath('userData'), fileName);
    fs.copyFileSync(filePath, savePath);
    return { success: true, path: savePath };
  } catch (error) {
    console.error('Failed to save GIF:', error);
    return { success: false };
  }
});


