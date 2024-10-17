const { app, BrowserWindow, Tray, Menu, screen, Notification, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('ignore-gpu-blacklist');

let win;
let tray = null;
let isPlaying = false;
let maximizeToggle = false;

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
      devTools:true
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
     win.webContents.openDevTools();
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
      icon: path.join(__dirname, '../assets/icons/backward.png'),
      click() {
        win.webContents.send('previous');
      },
    },
    {
      tooltip: isPlaying ? 'Pause' : 'Play', 
      icon: path.join(__dirname, '../assets/icons/icon.ico'),
      click() {
        isPlaying = !isPlaying; 
        win.webContents.send('play-pause');
        updateThumbarButtons();
      },
    },
    {
      tooltip: 'Next',
      icon: path.join(__dirname, '../assets/icons/forward.png'),
      click() {
        win.webContents.send('next');
      },
    },
  ]);
}

function createTray() {
  tray = new Tray(path.join(__dirname, "../assets/icons/icon.ico"));
  tray.setToolTip('Anime Player');

  const updateContextMenu = (playbackState = 'paused') => {
    const playPauseLabel = (playbackState === 'playing') ? 'Pause' : 'Play';

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

  updateContextMenu(); // Initialize with 'paused' state

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
}

// Prevent all global shortcuts and register new shortcut
app.on('ready', () => {
  createWindow();

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
  maximizeToggle = !maximizeToggle;
  maximizeToggle ? win.maximize() : win.unmaximize();
});

ipcMain.on("appClose", () => {
  app.quit();
});

// Handle toggle full-screen event
ipcMain.on('toggle-fullscreen', () => {
  win.setFullScreen(!win.isFullScreen());
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

// Save custom logo to a user directory "Visualization" in this folder
ipcMain.handle('save-gif', async (event, filePath, fileName) => {
  try {
    const savePath = path.join(visualizationPath, fileName);

    // Ensure the Visualization directory exists
    if (!fs.existsSync(visualizationPath)) {
      fs.mkdirSync(visualizationPath, { recursive: true });
    }

    // Copy the file to the Visualization directory
    fs.copyFileSync(filePath, savePath);
    return { success: true, path: savePath };
  } catch (error) {
    console.error('Failed to save GIF:', error);
    return { success: false };
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