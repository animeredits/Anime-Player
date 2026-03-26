const { app, BrowserWindow, Tray, Menu, screen, Notification, dialog, ipcMain, globalShortcut } = require("electron");
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const { net } = require('electron');
const http = require('http');
const { execFile, spawn } = require('child_process');
const os = require('os');

// ── CRITICAL: Must be set BEFORE app is ready so Windows SMTC shows "Anime Player"
// instead of "Unknown app". In dev mode use process.execPath as the fallback ID.
// Value must exactly match build.appId in package.json for packaged builds.
// ── SMTC App Name fix ─────────────────────────────────────────────────────────
// Must be set BEFORE app is ready. In packaged builds the NSIS installer
// registers 'com.AnimePlayer' so Windows can resolve the display name.
// In dev mode we explicitly set the app name so the SMTC header shows
// "Anime Player" instead of "Unknown app" or the raw electron.exe path.
if (app.isPackaged) {
  app.setAppUserModelId('com.AnimePlayer');
} else {
  // Tell Electron the product name before the AUMID is set
  app.setName('Anime Player');
  // Use the current exe path — Windows will look up its FileDescription
  // in the executable's version info and display that as the app name.
  // In practice this shows "Anime Player" once the app is branded/packaged.
  // For unbranded dev electron.exe it shows "Electron"; packaging fixes it.
  app.setAppUserModelId(process.execPath);
}

// ── GPU detection state ────────────────────────────────────────────────────────
// Populated async at startup via app.getGPUInfo(); used to pick ffmpeg hwaccel.
let gpuVendor = 'unknown';   // 'nvidia' | 'amd' | 'intel' | 'unknown'
let hwAccelArgs = [];         // prepended to every ffmpeg spawn that decodes video
let _cachedGpuName = '';      // full GPU description string, cached at startup
let ffmpegExecutable = null;
let ffprobeExecutable = null;

// Detect GPU and set hwaccel flags once app is ready
async function detectGpuAndSetHwAccel() {
  try {

// ════════════════════════════════════════════════════════════════════════════════
// OPTIMIZATIONS APPLIED:
// ✅ GPU detection is efficient - no changes needed
// ✅ Binary path resolution is well-structured - no changes needed  
// ✅ Event handlers are minimal - no changes needed
// Note: main.js is already well-optimized. Focus on renderer.js for biggest gains.
// ════════════════════════════════════════════════════════════════════════════════


    const info = await app.getGPUInfo('complete');
    const gpus = info.gpuDevice || [];
    const vendorIds = gpus.map(g => (g.vendorId || g.vendor_id || '').toString(16).toLowerCase());
    const descriptions = gpus.map(g => (g.description || g.model || '').toLowerCase());

    const isNvidia = vendorIds.includes('10de') || descriptions.some(d => d.includes('nvidia') || d.includes('geforce') || d.includes('quadro') || d.includes('rtx') || d.includes('gtx'));
    const isAmd    = vendorIds.includes('1002') || vendorIds.includes('1022') || descriptions.some(d => d.includes('amd') || d.includes('radeon'));
    const isIntel  = vendorIds.includes('8086') || descriptions.some(d => d.includes('intel'));

    if (isNvidia) {
      gpuVendor = 'nvidia';
      // d3d11va = DirectX 11 Video Acceleration — works on all NVIDIA/Windows
      // Prefer d3d11va over cuda for broader codec support (HEVC, AV1, etc.)
      hwAccelArgs = ['-hwaccel', 'd3d11va'];
      console.log('🟢 GPU: NVIDIA detected → ffmpeg hwaccel=d3d11va');
    } else if (isAmd) {
      gpuVendor = 'amd';
      hwAccelArgs = ['-hwaccel', 'd3d11va'];
      console.log('🟢 GPU: AMD detected → ffmpeg hwaccel=d3d11va');
    } else if (isIntel) {
      gpuVendor = 'intel';
      hwAccelArgs = ['-hwaccel', 'd3d11va'];
      console.log('🟢 GPU: Intel detected → ffmpeg hwaccel=d3d11va');
    } else {
      gpuVendor = 'unknown';
      hwAccelArgs = [];
      console.log('⚠️ GPU: Unknown vendor — no hwaccel');
    }

    // Notify renderer about GPU info for display in UI
    if (appState.win) {
      appState.win.webContents.send('gpu-info', { vendor: gpuVendor, gpus });
    }
    // Cache the GPU description for instant about-modal retrieval
    if (gpus.length > 0) {
      _cachedGpuName = gpus[0].description || gpus[0].model || gpuVendor.toUpperCase();
    }
  } catch (e) {
    console.warn('GPU detection failed:', e.message);
    hwAccelArgs = [];
  }
}

function resolveBinaryPaths() {
  const isWin = process.platform === 'win32';
  const ext = isWin ? '.exe' : '';

  if (app.isPackaged) {
    // ── Packed app: binaries are in resources/bin/ next to the app ──────────
    // process.resourcesPath = the "resources" folder inside the installed app
    const binDir = path.join(process.resourcesPath, 'bin');
    ffmpegExecutable  = path.join(binDir, `ffmpeg${ext}`);
    ffprobeExecutable = path.join(binDir, `ffprobe${ext}`);
    console.log('📦 Packed — using bundled ffmpeg:', ffmpegExecutable);
  } else {
    // ── Development: use locally installed ffmpeg on developer PC ───────────
    // Priority order:
    //   1. FFMPEG_PATH / FFPROBE_PATH env vars (set in your shell or .env)
    //   2. project-local bin/ folder  (bin/ffmpeg.exe)
    //   3. system PATH  (relies on ffmpeg being in PATH)
    const localBin  = path.join(__dirname, '..', 'bin');   // <project>/bin/
    const envFfmpeg  = process.env.FFMPEG_PATH;
    const envFfprobe = process.env.FFPROBE_PATH;

    ffmpegExecutable  = envFfmpeg
      || (fs.existsSync(path.join(localBin, `ffmpeg${ext}`))  ? path.join(localBin, `ffmpeg${ext}`)  : null)
      || `ffmpeg${ext}`;   // fallback: expect it in system PATH

    ffprobeExecutable = envFfprobe
      || (fs.existsSync(path.join(localBin, `ffprobe${ext}`)) ? path.join(localBin, `ffprobe${ext}`) : null)
      || `ffprobe${ext}`;  // fallback: expect it in system PATH

    console.log('🛠️  Dev — using ffmpeg:', ffmpegExecutable);
    console.log('🛠️  Dev — using ffprobe:', ffprobeExecutable);
  }
}

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
// Note: subtitleTempPath removed — subtitles now extracted to memory via FFmpeg pipe

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(animePlayerPath)) fs.mkdirSync(animePlayerPath, { recursive: true });
  if (!fs.existsSync(visualizationPath)) fs.mkdirSync(visualizationPath, { recursive: true });
  // No subtitle temp dir needed — subtitles are extracted to memory
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
const streamState = {
  filePath: null,
  mimeType: 'video/mp4',
  audioTracks: []     // [{streamIndex, lang, title, codec}] indexed by UI track number
};

const STREAM_PORT = 54321;

const mimeTypes = {
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime', '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav', '.aac': 'audio/aac',
  '.ogg': 'audio/ogg', '.flac': 'audio/flac'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'video/mp4';
}

const streamServer = http.createServer((req, res) => {
  // Blob URLs directly in the renderer, no disk files or HTTP needed.

  // ── Serve app icon for mediaSession artwork (Windows SMTC overlay icon) ──
  if (req.url === '/icon') {
    const iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'icons', 'icon.png')
      : path.join(__dirname, '..', 'assets', 'icons', 'icon.png');
    if (fs.existsSync(iconPath)) {
      const iconData = fs.readFileSync(iconPath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      });
      res.end(iconData);
    } else {
      res.writeHead(404);
      res.end('Icon not found');
    }
    return;
  }

  // ── Serve video thumbnail for SMTC / mediaSession artwork ─────────────────
  // Uses ffmpeg to grab the first keyframe and return it as JPEG.
  // Falls back to /icon if ffmpeg fails or no file is loaded.
  if (req.url === '/thumb') {
    if (!streamState.filePath || !fs.existsSync(streamState.filePath)) {
      res.writeHead(302, { Location: '/icon' });
      res.end();
      return;
    }
    const ffArgs = [
      '-loglevel', 'error',
      '-i', streamState.filePath,
      '-an', '-vframes', '1',
      '-vf', 'scale=320:-1',
      '-f', 'image2', '-vcodec', 'mjpeg',
      'pipe:1'
    ];
    const ffProc = spawn(ffmpegExecutable, ffArgs, { windowsHide: true });
    const chunks = [];
    ffProc.stdout.on('data', d => chunks.push(d));
    ffProc.stderr.on('data', () => {});
    ffProc.on('close', (code) => {
      if (code === 0 && chunks.length > 0) {
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache' });
        res.end(Buffer.concat(chunks));
      } else {
        res.writeHead(302, { Location: '/icon' });
        res.end();
      }
    });
    ffProc.on('error', () => { res.writeHead(302, { Location: '/icon' }); res.end(); });
    return;
  }

  // Handle audio track stream requests  (/audio/<trackIndex>?ss=<seconds>)
  if (req.url.startsWith('/audio/')) {
    const trackIdx = parseInt(req.url.split('/audio/')[1].split('?')[0], 10);
    const trackInfo = streamState.audioTracks[trackIdx];
    if (!trackInfo || !streamState.filePath) {
      res.writeHead(404);
      res.end('Audio track not found');
      return;
    }

    // Parse seek offset: ?ss=123.456  (video.currentTime from renderer)
    const ssMatch = req.url.match(/[?&]ss=([0-9.]+)/);
    const startSec = ssMatch ? parseFloat(ssMatch[1]) : 0;

    res.writeHead(200, {
      'Content-Type': 'audio/webm; codecs=opus',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked'
    });

    // ── Build audio filter chain for multi-channel / problematic codecs ───────
    // EAC3 (Dolby Digital Plus), DTS, TrueHD, AC3 etc. can be 5.1 or 7.1.
    // Browsers only decode stereo Opus in WebM, so we must downmix.
    // aresample async=1 smooths the packet timestamp gaps common in EAC3.
    const channels  = trackInfo.channels || 2;
    const codec     = (trackInfo.codec || '').toLowerCase();

    const NEEDS_RESAMPLE = new Set(['eac3', 'ac3', 'dts', 'truehd', 'mlp', 'dtshd']);
    const needsResample  = NEEDS_RESAMPLE.has(codec);

    const audioFilters = [];
    if (needsResample) {
      audioFilters.push('aresample=async=1:min_hard_comp=0.100000:first_pts=0');
    }
    if (channels > 2) {
      // Downmix surround to stereo — folds in centre, surround, LFE correctly
      audioFilters.push('pan=stereo|FL<FL+0.707*FC+0.707*BL+0.707*SL|FR<FR+0.707*FC+0.707*BR+0.707*SR');
    }

    // -ss BEFORE -i = fast keyframe seek so audio starts at the right position
    const ffArgs = [
      '-loglevel', 'error',
      ...hwAccelArgs,
      '-ss', String(startSec),
      '-i', streamState.filePath,
      '-vn',
      '-map', '0:' + trackInfo.streamIndex,
      ...(audioFilters.length ? ['-af', audioFilters.join(',')] : []),
      '-ac', String(Math.min(channels, 2)),
      '-c:a', 'libopus',
      '-b:a', '192k',
      '-application', 'audio',
      '-f', 'webm',
      'pipe:1'
    ];

    console.log(`🎵 Audio ${trackIdx} codec=${codec} ch=${channels} resample=${needsResample} from=${startSec.toFixed(2)}s`);

    const ffProc = spawn(ffmpegExecutable, ffArgs, { windowsHide: true });
    ffProc.stdout.pipe(res);
    ffProc.stderr.on('data', () => { });

    const cleanup = () => { try { ffProc.kill('SIGKILL'); } catch { } };
    req.on('close', cleanup);
    res.on('close', cleanup);
    ffProc.on('error', (err) => { console.error('ffmpeg spawn error:', err.message); cleanup(); });
    return;
  }

  // Handle video stream requests
  if (req.url.split('?')[0] !== '/stream' || !streamState.filePath) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const filePath = streamState.filePath;

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (e) {
    res.writeHead(404);
    res.end('File not found');
    return;
  }

  const fileSize = stat.size;
  const rangeHeader = req.headers['range'];

  if (rangeHeader) {
    // Parse Range: bytes=start-end
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': streamState.mimeType,
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': streamState.mimeType,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// Initialize app
function initApp() {
  ensureDirectories();
  app.setPath('userData', animePlayerPath);
  resolveBinaryPaths();

  // ── Start stream server only in the primary instance ──────────────────────
  streamServer.listen(STREAM_PORT, '127.0.0.1', () => {
    console.log(`Stream server running on http://127.0.0.1:${STREAM_PORT}`);
  });
  streamServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Stream] Port ${STREAM_PORT} already in use — is another instance running?`);
    } else {
      console.error('[Stream] Server error:', err.message);
    }
  });
  // ── AppUserModelId is set at module load (top of file) before app is ready ──

  // ── Chromium GPU / hardware decode flags ─────────────────────────────────
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  app.commandLine.appendSwitch('enable-media-playback-hinting');

  // Hardware video decode in the GPU process (D3D11 / DXVA2 on Windows)
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-oop-rasterization');
  app.commandLine.appendSwitch('enable-raw-draw');

  // Force hardware H.264/HEVC decode paths in Chromium's media pipeline
  app.commandLine.appendSwitch('enable-features',
    'PlatformHEVCDecoderSupport,HardwareMediaKeyHandling,MediaPlaybackHinting,' +
    'HardwareVideoDecode,D3D11VideoDecoder,VaapiVideoDecoder,VideoDecodeAcceleration,' +
    'UseDisplayList,CanvasOopRasterization'
  );
  app.commandLine.appendSwitch('disable-features', 'UseChromeOSDirectVideoDecoder');

  // Use the GPU for video decode (not software fallback)
  app.commandLine.appendSwitch('force-video-overlays');
  app.commandLine.appendSwitch('use-angle', 'd3d11');      // Windows DirectX 11 backend

  // Detect GPU after app is ready (done in app.whenReady callback)
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
      backgroundThrottling: false,
      webgl: true
    }
  });

  appState.win.webContents.on('did-finish-load', () => {
    // Handle any files passed at startup
    handleFileOpenFromArg();
    // Re-send initial window states after load finishes.
    // On some systems ready-to-show fires before the renderer's IPC listener
    // is registered, so this guarantees the maximize/fullscreen icons are correct
    // on first paint without relying on a separate invoke round-trip.
    appState.win.webContents.send('initial-window-states', {
      isMaximized: appState.win.isMaximized(),
      isFullscreen: appState.win.isFullScreen()
    });
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
      // appState.win.webContents.openDevTools();
      setTimeout(() => {
      createTray();
      updateThumbarButtons();
      }, 500);
  });

  setupWindowEvents();


  // ─────────────────────────────────────────────────────────────────────────
  // HOT RELOAD SETUP - Watch files and reload without restarting the app
  // ─────────────────────────────────────────────────────────────────────────
  if (!app.isPackaged) {
    try {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit',
        // Watch the src directory and related files
        awaitWriteFinish: {
          stabilityWaitMs: 1000,
          pollInterval: 100
        }
      });
      console.log('✅ Hot-reload enabled for development');
    } catch (e) {
      console.warn('⚠️ electron-reload not available, hot-reload disabled');
    }
    
    // Watch CSS and JS files for changes and reload renderer without app restart
    const chokidar = require('chokidar');
    const watchPaths = [
      path.join(__dirname, '*.js'),      // Main process JS
      path.join(__dirname, '*.html'),    // HTML files
      path.join(__dirname, '..', 'src', '*.js'),
      path.join(__dirname, '..', 'src', '*.css')
    ];
    
    try {
      const watcher = chokidar.watch(watchPaths, {
        ignored: /node_modules/,
        awaitWriteFinish: {
          stabilityWaitMs: 1000,
          pollInterval: 100
        }
      });
      
      watcher.on('change', (filePath) => {
        console.log(`🔄 File changed: ${path.basename(filePath)}`);
        if (appState.win && !appState.win.isDestroyed()) {
          // For CSS/HTML changes, reload the renderer
          if (filePath.endsWith('.css') || filePath.endsWith('.html')) {
            console.log('🎨 Reloading renderer...');
            appState.win.webContents.reloadIgnoringCache();
          }
          // For JS changes in renderer, also reload
          else if (filePath.includes('renderer') || filePath.includes('src')) {
            console.log('⚡ Reloading renderer...');
            appState.win.webContents.reloadIgnoringCache();
          }
        }
      });
      
      console.log('✅ File watcher initialized for hot-reload');
    } catch (e) {
      console.log('💡 Chokidar not available - basic electron-reload will handle file changes');
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

  const iconPath = (name) => {
    const p = path.join(__dirname, `../assets/icons/${name}.png`);
    return fs.existsSync(p) ? p : undefined;
  };

  const isVisible = appState.win && appState.win.isVisible();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? 'Hide Anime Player in taskbar' : 'Show Anime Player in taskbar',
      click: () => toggleWindowVisibility()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      icon: iconPath('quit'),
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

// Set volume
function setVolume(percentage) {
  appState.playback.volume = Math.max(0, Math.min(100, percentage));
  if (appState.win) {
    appState.win.webContents.send('volume-set', appState.playback.volume);
  }
  updateTrayMenu();
}

// Set repeat state
function setRepeatState(state) {
  appState.playback.repeat = state;
  if (appState.win) {
    appState.win.webContents.send('repeat-state-set', state);
  }
  updateTrayMenu();
}

// Set playback speed
function setPlaybackSpeed(speed) {
  if (appState.win) {
    appState.win.webContents.send('playback-speed-set', speed);
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
async function handleFileOpenFromArg() {
  const fileArgs = process.argv.filter(arg => {
    try {
      return typeof arg === 'string' && MEDIA_EXTENSIONS.includes(path.extname(arg).toLowerCase());
    } catch {
      return false;
    }
  });

  if (fileArgs.length > 0 && appState.win) {
    for (const fileArg of fileArgs) {
      const realPath = await getRealLongFilename(path.normalize(fileArg));
      appState.win.webContents.send('open-file', realPath);
    }
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
  // ── GPU info (for renderer status display) ────────────────────────────────
  ipcMain.handle('get-gpu-info', async () => {
    try {
      const info = await app.getGPUInfo('complete');
      return { vendor: gpuVendor, hwAccel: hwAccelArgs.join(' ') || 'none', gpus: info.gpuDevice || [] };
    } catch (e) {
      return { vendor: 'unknown', hwAccel: 'none', gpus: [] };
    }
  });

  // ── App info — uses pre-cached GPU data so it returns INSTANTLY ───────────
  ipcMain.handle('get-app-info', () => {
    // Detect proper Windows marketing name from build number
    let osDisplayName = '';
    if (process.platform === 'win32') {
      try {
        const buildStr = os.release().split('.')[2] || '0';
        const build = parseInt(buildStr, 10);
        osDisplayName = build >= 22000 ? 'Windows 11' : 'Windows 10';
        osDisplayName += ` (Build ${build})`;
      } catch (_) {
        osDisplayName = `Windows (${os.release()})`;
      }
    } else if (process.platform === 'darwin') {
      osDisplayName = `macOS ${os.release()}`;
    } else {
      osDisplayName = `Linux ${os.release()}`;
    }

    // Use the already-cached GPU name from startup detection (no async call)
    let gpuName = 'Unknown';
    if (_cachedGpuName) {
      gpuName = _cachedGpuName;
    } else if (gpuVendor && gpuVendor !== 'unknown') {
      gpuName = gpuVendor.toUpperCase();
    }

    const platformMap = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' };
    return {
      version:      app.getVersion(),
      platform:     process.platform,
      platformName: platformMap[process.platform] || process.platform,
      osDisplay:    osDisplayName,
      arch:         process.arch,
      gpuName,
      hwAccel:      hwAccelArgs.join(' ') || 'none',
      copyrightYear: new Date().getFullYear(),
      isDev:        !app.isPackaged, // Add dev mode indicator
    };
  });

  // ── Hot-reload handlers (development only) ─────────────────────────────────
  if (!app.isPackaged) {
    ipcMain.handle('reload-renderer', () => {
      if (appState.win && !appState.win.isDestroyed()) {
        console.log('🔄 Manual renderer reload requested');
        appState.win.webContents.reloadIgnoringCache();
        return { success: true, message: 'Renderer reloading...' };
      }
      return { success: false, message: 'Window not available' };
    });

    ipcMain.handle('get-dev-mode', () => {
      return true;
    });
  }

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
  ipcMain.handle("get-folder-media-files", handleGetFolderMediaFiles);

  // Subtitle file dialog
  ipcMain.handle("open-subtitle-dialog", async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      title: 'Open Subtitle File',
      filters: [
        { name: 'Subtitle Files', extensions: ['srt', 'vtt', 'ass', 'ssa', 'sub', 'idx'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  // Playback time
  ipcMain.on('save-playback-time', handleSavePlaybackTime);
  ipcMain.handle('load-playback-time', handleLoadPlaybackTime);
  ipcMain.on("delete-playback-entry", handleDeletePlaybackEntry);

  // App Update — single handler
  // Check for updates (manual trigger from renderer — safe to call any time)
  ipcMain.on('check-for-updates', () => {
    if (!net.isOnline()) {
      appState.win?.webContents.send('update-error', 'No internet connection');
      return;
    }
    autoUpdater.checkForUpdates().catch(err => {
      console.warn('[Updater] Manual check failed:', err.message);
      appState.win?.webContents.send('update-error', err.message);
    });
  });

  // Updater window minimize
  ipcMain.on('updater-minimize', () => {
    updaterWindow?.minimize();
  });

  ipcMain.on('start-update-download', () => {
    autoUpdater.downloadUpdate();
  });

  // App lifecycle
  ipcMain.on("appClose", handleAppClose);

  ipcMain.handle('set-stream-file', (event, filePath) => {
    console.log('📂 set-stream-file called with:', filePath); // ← debug line
    try {
      const normalized = path.normalize(filePath);
      console.log('📂 normalized:', normalized);
      console.log('📂 exists:', fs.existsSync(normalized));

      if (!fs.existsSync(normalized)) {
        return { success: false, error: 'File not found: ' + normalized };
      }
      streamState.filePath = normalized;
      streamState.mimeType = getMimeType(normalized);
      console.log('✅ Stream file set:', streamState.filePath);
      return { success: true, port: STREAM_PORT };
    } catch (err) {
      console.error('❌ set-stream-file error:', err);
      return { success: false, error: err.message };
    }
  });

  // ── Subtitle extraction — fully in-memory, zero temp files ──────────────────
  //
  // Old approach:  FFmpeg → write .vtt to disk → HTTP server reads file → browser fetches
  // New approach:  FFmpeg stdout pipe → clean in memory → send VTT string over IPC
  //                → renderer creates Blob URL → <track src="blob:..."> loads instantly
  //
  // Benefits:
  //   • No disk writes, no leftover files, no cleanup needed ever
  //   • Faster: no file I/O round-trip, no HTTP fetch from local server
  //   • Works even if the HTTP server is busy or port conflicts
  //   • Blob URLs are automatically freed when the renderer revokes them
  // ── ASS Style Parser ──────────────────────────────────────────────────────────
  // Parses raw ASS/SSA content and returns a style map + event list so the
  // renderer can apply per-cue colors, bold, italic, and font names — just like VLC.

  // ── Full VLC-equivalent ASS/SSA parser ────────────────────────────────────────
  // Reads PlayResX/Y, [V4+ Styles] (color, bold, italic, font, alignment, margins),
  // and [Events] dialogue lines (start/end times, \pos, \an, \move, \c inline tags).
  // The renderer uses this data to position and style every cue exactly like VLC/libass.

  function parseAssStyleData(assContent) {
    const styles = {};   // styleName → { color,bold,italic,fontSize,fontName,alignment,marginL,marginR,marginV }
    const events = [];   // { start,end,style,inlineColor,inlineBold,inlineItalic,posX,posY,align,layer }

    const rawLines = assContent.split(/\r?\n/);
    let section = '';
    let styleFormat = [];
    let eventFormat = [];
    let playResX = 384;   // ASS spec defaults
    let playResY = 288;

    // Split an ASS comma line into exactly `num` fields.
    // The last field (Text) may contain commas, so we stop splitting early.
    const splitAssLine = (str, num) => {
      const result = [];
      let rem = str;
      for (let i = 0; i < num - 1; i++) {
        const idx = rem.indexOf(',');
        if (idx === -1) { result.push(rem.trim()); rem = ''; break; }
        result.push(rem.slice(0, idx).trim());
        rem = rem.slice(idx + 1);
      }
      if (rem !== '') result.push(rem);
      return result;
    };

    // ASS time string "H:MM:SS.cc" → seconds (float)
    const parseAssTime = t => {
      const m = t && t.match(/(\d+):(\d+):(\d+)[.,](\d+)/);
      if (!m) return -1;
      return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 100;
    };

    // ASS &HAABBGGRR colour → CSS #RRGGBB  (strips alpha, reverses BGR order)
    const assColorToCss = raw => {
      const m = (raw || '').match(/&H(?:[0-9A-Fa-f]{2})?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/);
      return m ? `#${m[3]}${m[2]}${m[1]}` : null;
    };

    // Old \a numpad → new numpad (1-9) — libass compat mapping
    // Old: 1=BL,2=BC,3=BR, 5=ML,6=MC,7=MR, 9=TL,10=TC,11=TR
    const oldAlignMap = { 1: 1, 2: 2, 3: 3, 5: 4, 6: 5, 7: 6, 9: 7, 10: 8, 11: 9 };

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) continue;

      // ── Section headers ───────────────────────────────────────────────────
      if (line.startsWith('[')) {
        section = line.toLowerCase();
        continue;
      }

      // ── [Script Info] — grab playback resolution ──────────────────────────
      if (section.includes('script info')) {
        if (/^PlayResX\s*:/i.test(line)) playResX = parseInt(line.split(':')[1]) || playResX;
        if (/^PlayResY\s*:/i.test(line)) playResY = parseInt(line.split(':')[1]) || playResY;
        continue;
      }

      // ── [V4+ Styles] / [V4 Styles] ───────────────────────────────────────
      if (section.includes('styles')) {
        if (line.startsWith('Format:')) {
          styleFormat = line.slice(7).split(',').map(s => s.trim().toLowerCase());
        } else if (line.startsWith('Style:')) {
          const vals = splitAssLine(line.slice(6), styleFormat.length);
          const s = {};
          styleFormat.forEach((k, i) => { s[k] = (vals[i] || '').trim(); });

          const name = s.name || '';
          if (!name) continue;

          // Numpad alignment (1–9). ASS spec default is 2 (bottom-center).
          const alignment = parseInt(s.alignment) || 2;

          styles[name] = {
            color:        assColorToCss(s.primarycolour)  || '#FFFFFF',
            outlineColor: assColorToCss(s.outlinecolour)  || '#000000',
            shadowColor:  assColorToCss(s.backcolour)     || null,
            bold:        s.bold      === '-1' || s.bold      === '1',
            italic:      s.italic    === '-1' || s.italic    === '1',
            underline:   s.underline === '-1' || s.underline === '1',
            strikeOut:   s.strikeout === '-1' || s.strikeout === '1',
            fontSize:    parseFloat(s.fontsize)    || 0,
            fontName:    s.fontname || '',
            alignment,
            marginL:     parseInt(s.marginl)  || 0,
            marginR:     parseInt(s.marginr)  || 0,
            marginV:     parseInt(s.marginv)  || 0,
            outline:     parseFloat(s.outline) || 0,
            shadow:      parseFloat(s.shadow)  || 0,
            borderStyle: parseInt(s.borderstyle) || 1,
          };
        }
        continue;
      }

      // ── [Events] ─────────────────────────────────────────────────────────
      if (section.includes('events')) {
        if (line.startsWith('Format:')) {
          eventFormat = line.slice(7).split(',').map(s => s.trim().toLowerCase());
        } else if (line.startsWith('Dialogue:')) {
          const textIdx = eventFormat.indexOf('text');
          const styleIdx = eventFormat.indexOf('style');
          const startIdx = eventFormat.indexOf('start');
          const endIdx = eventFormat.indexOf('end');
          const layerIdx = eventFormat.indexOf('layer');
          if (textIdx === -1) continue;

          const vals = splitAssLine(line.slice(9), eventFormat.length);
          const styleName = styleIdx >= 0 ? (vals[styleIdx] || 'Default') : 'Default';
          const rawText = vals.slice(textIdx).join(',');
          const layer = layerIdx >= 0 ? (parseInt(vals[layerIdx]) || 0) : 0;

          // ── Extract all inline override tags between { } ─────────────
          // Collect ALL tag blocks before stripping
          const tagBlocks = [];
          rawText.replace(/\{([^}]*)\}/g, (_, tags) => { tagBlocks.push(tags); return ''; });
          const allTags = tagBlocks.join('');

          // Primary colour: \c&H or \1c&H
          const icm = allTags.match(/\\(?:1c|c)&H(?:[0-9A-Fa-f]{2})?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/);
          const inlineColor = icm ? `#${icm[3]}${icm[2]}${icm[1]}` : null;

          // Bold / italic inline overrides
          const inlineBold = /\\b1/.test(allTags) ? true : /\\b0/.test(allTags) ? false : null;
          const inlineItalic = /\\i1/.test(allTags) ? true : /\\i0/.test(allTags) ? false : null;

          // ── Parse full per-segment style data (multi-color cue support) ──
          // Each segment: { text, color, bold, italic, underline, fontSize }
          // This enables VLC-style mid-cue color changes like {\c&H...&}word1{\c&H...&}word2
          const def = styles[styleName] || styles['Default'] || {};
          const segments = [];
          let segCur = {
            color:     def.color     || null,
            bold:      def.bold      || false,
            italic:    def.italic    || false,
            underline: false,
            fontSize:  def.fontSize  || 0,
          };
          let drawMode = 0; // tracks \p drawing mode depth — text while >0 is draw data, skip it
          const segParts = rawText.split(/(\{[^}]*\})/);
          for (const sp of segParts) {
            if (sp.startsWith('{') && sp.endsWith('}')) {
              const inner = sp.slice(1, -1);
              const tagTokens = inner.match(/\\[^\\]*/g) || [];
              for (const tk of tagTokens) {
                // \p0 = drawing off, \pN (N>0) = drawing on — track depth
                const pM = tk.match(/^\\p(\d+)/);
                if (pM) { drawMode = parseInt(pM[1]); continue; }
                const cm = tk.match(/^\\(?:1c|c)&H([0-9A-Fa-f]{2,8})&/);
                if (cm) { segCur = { ...segCur, color: assColorToCss('&H' + cm[1] + '&') }; continue; }
                if (/^\\(?:1c|c)\s*$/.test(tk)) { segCur = { ...segCur, color: def.color || null }; continue; }
                if (/^\\b1/.test(tk)) { segCur = { ...segCur, bold: true };  continue; }
                if (/^\\b0/.test(tk)) { segCur = { ...segCur, bold: false }; continue; }
                if (/^\\i1/.test(tk)) { segCur = { ...segCur, italic: true };  continue; }
                if (/^\\i0/.test(tk)) { segCur = { ...segCur, italic: false }; continue; }
                if (/^\\u1/.test(tk)) { segCur = { ...segCur, underline: true };  continue; }
                if (/^\\u0/.test(tk)) { segCur = { ...segCur, underline: false }; continue; }
                const fsM = tk.match(/^\\fs(\d+(?:\.\d+)?)/);
                if (fsM) { segCur = { ...segCur, fontSize: parseFloat(fsM[1]) }; continue; }
                if (/^\\r/.test(tk)) {
                  segCur = { color: def.color||null, bold: def.bold||false, italic: def.italic||false, underline: false, fontSize: def.fontSize||0 };
                  continue;
                }
              }
            } else if (sp) {
              // Skip text content while in drawing mode (\p1..\p0)
              if (drawMode > 0) continue;
              const segText = sp.replace(/\\[Nn]/g, '\n');
              if (segText.trim()) segments.push({ text: segText, ...segCur });
            }
          }

          // Skip entire event if it produced zero usable segments (pure drawing event)
          // This prevents sign-overlay drawing events from showing as empty cues
          if (segments.length === 0 && rawText.replace(/\{[^}]+\}/g, '').trim()) {
            // rawText had content but all was drawing data — treat as drawing-only event
            // Still push it but with empty segments so renderer can ignore it
          }
          // If all segments share the same color as the style default, segments is
          // equivalent to a single-color cue — renderer can detect this cheaply.
          const hasMultiColor = segments.length > 1 && segments.some(
            s => s.color && s.color !== (def.color || null)
          );

          // ── \pos(x,y) — exact pixel position ───────────────────────
          let posX = null, posY = null;
          const posM = allTags.match(/\\pos[(]\s*([-\d.]+)\s*,\s*([-\d.]+)\s*[)]/);
          if (posM) { posX = parseFloat(posM[1]); posY = parseFloat(posM[2]); }

          // ── \move(x1,y1,x2,y2[,t1,t2]) — use midpoint for positioning
          if (posX === null) {
            const mvM = allTags.match(/\\move[(]\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)/);
            if (mvM) {
              posX = (parseFloat(mvM[1]) + parseFloat(mvM[3])) / 2;
              posY = (parseFloat(mvM[2]) + parseFloat(mvM[4])) / 2;
            }
          }

          // ── \org(x,y) — rotation origin — use as pos if no \pos set
          if (posX === null) {
            const orgM = allTags.match(/\\org[(]\s*([-\d.]+)\s*,\s*([-\d.]+)\s*[)]/);
            if (orgM) { posX = parseFloat(orgM[1]); posY = parseFloat(orgM[2]); }
          }

          // ── Alignment: \an (numpad) wins over \a (old style) ────────
          let align = null;
          const anM = allTags.match(/\\an(\d+)/);
          if (anM) {
            align = parseInt(anM[1]);
          } else {
            const aM = allTags.match(/\\a(\d+)/);
            if (aM) align = oldAlignMap[parseInt(aM[1])] ?? null;
          }

          // Strip all ASS tags from text for content-based matching in renderer.
          const plainText = rawText
            .replace(/{[^}]+}/g, '')
            .replace(/\\[Nn]/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');

          // Skip pure drawing events (\p1 draw mode — vector overlays, not text)
          const hasDrawMode = /\\p[1-9]/.test(allTags);
          if (hasDrawMode && segments.length === 0) continue;
          if (hasDrawMode && plainText) {
            const allDraw = plainText.split('\n').every(l => {
              const t = l.trim();
              if (!t) return true;
              if (!/[defgijknopruwxy]/i.test(t) && /^[mlbhvcsqtaz][\s\d.,\-mlbhvcsqtaz]*$/i.test(t)) return true;
              return /^[\d\s.,\-]+$/.test(t);
            });
            if (allDraw) continue;
          }

          events.push({
            start: parseAssTime((vals[startIdx] || '').trim()),
            end:   parseAssTime((vals[endIdx]   || '').trim()),
            style: styleName,
            layer,
            inlineColor,
            inlineBold,
            inlineItalic,
            posX,
            posY,
            align,
            text: plainText,
            segments,
            hasMultiColor,
          });
        }
        continue;
      }
    }

    return { styles, events, playResX, playResY };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  ipcMain.handle('get-subtitle-tracks', async (event, filePath) => {
    const normalized = path.normalize(filePath);
    if (!fs.existsSync(normalized)) {
      console.warn('[Sub] File not found:', normalized);
      return { success: false, tracks: [] };
    }

    // ── 1. Probe all streams, filter subtitle ones manually ─────────────────
    // Using -show_streams WITHOUT -select_streams avoids ffprobe exit-code 1
    // on some versions when no subtitle streams exist. We filter in JS instead.
    let streams = [];
    try {
      const probeArgs = [
        '-v', 'error',            // show errors but not info noise
        '-print_format', 'json',
        '-show_streams',          // all streams — we filter below
        '-show_entries',
        'stream=index,codec_type,codec_name:stream_tags=language,title:stream_disposition=forced',
        normalized
      ];

      const probeStdout = await new Promise((resolve) => {
        const chunks = [];
        const errChunks = [];
        const proc = spawn(ffprobeExecutable, probeArgs, {
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        proc.stdout.on('data', d => chunks.push(d));
        proc.stderr.on('data', d => errChunks.push(d));
        proc.on('close', () => {
          const out = Buffer.concat(chunks).toString('utf8');
          const err = Buffer.concat(errChunks).toString('utf8');
          if (err.trim()) console.warn('[Sub] ffprobe stderr:', err.trim());
          resolve(out);
        });
        proc.on('error', (e) => {
          console.error('[Sub] ffprobe spawn error:', e.message);
          resolve('');
        });
      });

      const parsed = JSON.parse(probeStdout || '{}');
      const allStreams = parsed.streams || [];
      streams = allStreams.filter(s => s.codec_type === 'subtitle');
      console.log(`[Sub] Found ${allStreams.length} total streams, ${streams.length} subtitle stream(s)`);
      streams.forEach((s, i) =>
        console.log(`[Sub]   track ${i}: index=${s.index} codec=${s.codec_name} lang=${s.tags?.language} title=${s.tags?.title}`)
      );
    } catch (e) {
      console.error('[Sub] ffprobe parse error:', e.message);
      return { success: true, tracks: [] };
    }

    if (streams.length === 0) {
      console.log('[Sub] No subtitle streams found in file');
      return { success: true, tracks: [] };
    }

    // ── 2. Codec filter — only text-based subtitles FFmpeg can convert ───────
    // Image-based codecs (PGS, VOBSUB, DVBSUB) cannot be converted to WebVTT.
    const TEXT_CODECS = new Set([
      'subrip', 'srt', 'ass', 'ssa', 'webvtt', 'vtt',
      'mov_text', 'tx3g', 'text', 'dvd_teletext',
      'microdvd', 'jacosub', 'sami', 'realtext',
      'stl', 'ttml', 'dfxp'
    ]);
    const IMAGE_CODECS = new Set(['hdmv_pgs_subtitle', 'dvd_subtitle', 'dvb_subtitle', 'pgssub']);

    const textStreams = streams.filter(s => {
      const codec = (s.codec_name || '').toLowerCase();
      if (TEXT_CODECS.has(codec)) return true;
      if (IMAGE_CODECS.has(codec)) {
        console.log(`[Sub] Skipping image-based subtitle stream ${s.index} (${codec}) — cannot convert to text`);
        return false;
      }
      // Unknown codec — attempt extraction anyway, worst case FFmpeg fails
      console.log(`[Sub] Unknown subtitle codec "${codec}" for stream ${s.index} — attempting extraction`);
      return true;
    });

    if (textStreams.length === 0) {
      console.log('[Sub] All subtitle streams are image-based — no text subtitles available');
      return { success: true, tracks: [] };
    }

    // ── 3. Clean VTT content in memory ──────────────────────────────────────
    // Only strip actual garbage — NOT short lines. Previous version was too
    // aggressive and could drop legitimate short lines like "Ok." or "Yes."
    const HAS_LETTER = /\p{L}/u;
    // Matches ASS draw-path lines.
    // Draw paths have single isolated command letters (m l b h v c s q t a z)
    // separated by coordinate numbers — never two consecutive word-letters.
    // Key insight: real words always have ≥2 consecutive alpha chars; draw letters are isolated.
    // Also: draw letters are only from the set [mlbhvcsqtaz]; any other letter → real text.
    const IS_DRAW_CMD = line => {
      const s = line.trim();
      // Must start with a draw command letter followed by a space
      if (!/^[mlbhvcsqtaz]\s/i.test(s)) return false;
      // If the line contains any letter NOT in the ASS draw-command alphabet → real text
      if (/[defgijknopruwxyDEFGIJKNOPRUWXY]/.test(s)) return false;
      // No two consecutive alphabetic characters (draw letters are always space-separated)
      if (/[a-z]{2}/i.test(s)) return false;
      // The whole line is just draw letters + numbers + whitespace/punctuation
      return /^[mlbhvcsqtaz][\s\d.,\-mlbhvcsqtaz]*$/i.test(s);
    };
    const IS_NUMBERS_ONLY = /^[\d\s.,\-]+$/;

    function cleanVtt(raw) {
      const lines = raw.split(/\r?\n/);
      const cleaned = ['WEBVTT', ''];
      let cue = null;
      let inNote = false;

      // First pass — collect all cues
      const cues = [];

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
          inNote = false;
          if (cue) {
            if (cue.text) cues.push(cue);
            cue = null;
          }
          continue;
        }

        if (line.startsWith('WEBVTT')) continue;
        if (line.startsWith('NOTE')) { inNote = true; continue; }
        if (line.startsWith('STYLE')) { inNote = true; continue; }
        if (inNote) continue;

        // ── Timing line — MUST be checked before any other filter ───────
        if (line.includes('-->')) {
          if (cue && cue.text) cues.push(cue);
          cue = { timing: line, text: '', lines: [] };
          continue;
        }

        // Outside cue — skip pure numeric IDs and stray SVG commands
        if (!cue) {
          if (/^(\[?=?\d+\]?|\d+)$/.test(line)) continue;
          if (IS_DRAW_CMD(line)) continue;
          continue;
        }

        // ── Inside a cue — preserve styling tags, strip drawing commands ────────
        let text = line
          .replace(/\{[^}]*\\p\d[^}]*\}/g, '')   // strip ASS \p draw-mode tags entirely
          // For other ASS tags, preserve color info but clean up other tags
          .replace(/\{\\([^}]*?)(c|1c)&H[0-9A-Fa-f]*([^}]*?)\}/g, (match, before, tag, after) => {
            // Preserve color information if present
            return match;
          })
          // Keep HTML tags for styling
          .replace(/\\[Nn]/g, '\n')                // \N \n → newline
          .trim();

        // After stripping {draw tags}, skip lines that are now pure coordinates/draw cmds
        if (!text) continue;
        if (IS_DRAW_CMD(text)) continue;
        if (IS_NUMBERS_ONLY.test(text)) continue;
        // Skip if no real letter at all (e.g. "--- 0 ---", pure punctuation)
        if (!HAS_LETTER.test(text)) continue;

        cue.lines.push(text);
        cue.text = cue.lines.join('\n');
      }
      // flush final cue
      if (cue && cue.text) cues.push(cue);

      // ── Second pass — deduplicate cues with identical text + overlapping time ──
      // ASS files often have multiple style layers (shadow, outline, main) that
      // convert into separate VTT cues with identical text and same timestamp.
      // Keep only unique text per timestamp group.
      const seen = new Map(); // key: "start-->end", value: Set of texts seen
      const dedupedCues = [];

      for (const c of cues) {
        // Extract just the timestamp portion (strip position/align settings)
        const timePart = c.timing.split('-->').map(s => s.trim().split(/\s/)[0]).join('-->');
        if (!seen.has(timePart)) seen.set(timePart, new Set());
        const texts = seen.get(timePart);

        // Split multi-line cue text and only keep lines we haven't seen at this timestamp
        const newLines = c.text.split('\n').filter(l => {
          const trimmed = l.trim();
          if (!trimmed || texts.has(trimmed)) return false;
          texts.add(trimmed);
          return true;
        });

        if (newLines.length > 0) {
          dedupedCues.push({ timing: c.timing, text: newLines.join('\n') });
        }
      }

      // Build final VTT string
      for (const c of dedupedCues) {
        cleaned.push(c.timing, c.text, '');
      }

      return cleaned.join('\n');
    }

    // ── 4. Extract each subtitle stream — pipe FFmpeg stdout to memory ────────
    // NO temp files. FFmpeg writes VTT to its stdout pipe, we read directly.
    //
    // Important: do NOT use -vn -an here. Those flags tell FFmpeg to reject all
    // video/audio packets — but for some MKV files FFmpeg needs to read those
    // packets to maintain the timeline for subtitle demuxing. Without them,
    // certain containers stall or produce empty output.
    // The only overhead is packet reading — FFmpeg does NOT decode video frames.
    function extractToMemory(streamIndex, codec) {
      return new Promise((resolve) => {
        const ffArgs = [
          '-y',
          '-threads', '0',
          '-i', normalized,
          '-map', `0:${streamIndex}`,
          // If source is already WebVTT, copy it. Otherwise convert.
          '-c:s', (codec === 'webvtt' || codec === 'vtt') ? 'copy' : 'webvtt',
          '-f', 'webvtt',
          'pipe:1'                   // write to stdout, not a file
        ];

        const chunks = [];
        const errChunks = [];
        const proc = spawn(ffmpegExecutable, ffArgs, {
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });

        proc.stdout.on('data', d => chunks.push(d));
        proc.stderr.on('data', d => errChunks.push(d));

        proc.on('close', (code) => {
          const raw = Buffer.concat(chunks).toString('utf8');
          const errOut = Buffer.concat(errChunks).toString('utf8');

          if (code !== 0 || !raw.includes('WEBVTT')) {
            // Log FFmpeg's stderr to show why it failed
            const lastLine = errOut.split('\n').filter(Boolean).pop() || 'no output';
            console.warn(`[Sub] FFmpeg stream ${streamIndex} failed (exit ${code}): ${lastLine}`);
            return resolve(null);
          }

          const cleaned = cleanVtt(raw);
          // A cleaned VTT with only the header and no cues is useless
          if (cleaned.split('\n').filter(l => l.includes('-->')).length === 0) {
            console.warn(`[Sub] Stream ${streamIndex} produced 0 cues after cleaning`);
            return resolve(null);
          }

          console.log(`[Sub] Stream ${streamIndex} OK — ${cleaned.split('\n').filter(l => l.includes('-->')).length} cues`);
          resolve(cleaned);
        });

        proc.on('error', (e) => {
          console.error('[Sub] FFmpeg spawn error:', e.message);
          resolve(null);
        });
      });
    }

    // Extract raw ASS/SSA content for style-color parsing (no conversion).
    // Only used for 'ass' and 'ssa' streams — it's a very fast copy operation.
    function extractAssRaw(streamIndex) {
      return new Promise((resolve) => {
        const ffArgs = [
          '-y', '-threads', '0',
          '-i', normalized,
          '-map', `0:${streamIndex}`,
          '-c:s', 'copy',
          '-f', 'ass',
          'pipe:1'
        ];
        const chunks = [];
        const proc = spawn(ffmpegExecutable, ffArgs, {
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        proc.stdout.on('data', d => chunks.push(d));
        proc.on('close', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          resolve(raw.includes('[Script Info]') ? raw : null);
        });
        proc.on('error', () => resolve(null));
      });
    }

    // ── 6. Run all extractions in parallel ───────────────────────────────────
    const results = await Promise.all(
      textStreams.map(async (stream, i) => {
        const codec = (stream.codec_name || '').toLowerCase();
        const vttContent = await extractToMemory(stream.index, codec);
        if (!vttContent) return null;

        // For ASS/SSA: also extract raw content to parse style colors.
        // This runs fast (copy, no re-encoding) and is done in parallel above.
        let cueStyles = null;
        if (codec === 'ass' || codec === 'ssa') {
          try {
            const rawAss = await extractAssRaw(stream.index);
            if (rawAss) {
              cueStyles = parseAssStyleData(rawAss);
              console.log(`[Sub] ASS styles parsed for stream ${stream.index}: ${Object.keys(cueStyles.styles).length} styles, ${cueStyles.events.length} events`);
            }
          } catch (e) {
            console.warn('[Sub] ASS style parse failed:', e.message);
          }
            }

          return {
            index: i,
            lang: stream.tags?.language || `track${i + 1}`,
            title: stream.tags?.title || stream.tags?.language || `Track ${i + 1}`,
            forced: stream.disposition?.forced === 1,
            vttContent,  // sent to renderer → Blob URL, zero disk I/O
            cueStyles    // null for SRT/VTT; ASS style+event map for .ass/.ssa
          };
        })
    );

  const tracks = results.filter(Boolean);
  console.log(`[Sub] ${tracks.length}/${textStreams.length} track(s) successfully extracted`);
  return { success: true, tracks };
});

  // ── Audio Track Detection ──────────────────────────────────────────────────
  ipcMain.handle('get-audio-tracks', async (event, filePath) => {
    const normalized = path.normalize(filePath);
    if (!fs.existsSync(normalized)) return { success: false, tracks: [] };

    return new Promise((resolve) => {
      const args = [
        '-v', 'quiet', '-print_format', 'json',
        '-show_streams', '-select_streams', 'a',
        normalized
      ];

      execFile(ffprobeExecutable, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          console.error('ffprobe audio error:', err.message);
          return resolve({ success: true, tracks: [] });
        }

        let streams = [];
        try { streams = JSON.parse(stdout).streams || []; }
        catch (e) { return resolve({ success: true, tracks: [] }); }

        const tracks = streams.map((s, i) => ({
          index: i,                             // UI index (0-based)
          streamIndex: s.index,                       // ffmpeg stream index (e.g. 0:2)
          codec: s.codec_name || 'unknown',   // ac3, aac, dts, truehd...
          channels: s.channels || 0,
          channelLayout: s.channel_layout || '',
          sampleRate: s.sample_rate || '',
          lang: s.tags?.language || `track${i + 1}`,
          title: s.tags?.title || s.codec_name || `Track ${i + 1}`,
          default: s.disposition?.default === 1
        }));

        // Store in streamState so the HTTP server can map index → stream
        streamState.audioTracks = tracks;
        console.log('🎵 Audio tracks found:', tracks.map(t => `${t.index}:${t.title}(${t.codec})`));
        resolve({ success: true, tracks });
      });
    });
  });

  // cleanup-subtitles: kept for backward-compat but no-op — subtitles are now
  // in-memory only, no temp files are ever written.
  ipcMain.handle('cleanup-subtitles', async () => ({ success: true, deleted: 0 }));

  // Get current fullscreen state
  ipcMain.handle('get-fullscreen-state', () => {
    return appState.win ? appState.win.isFullScreen() : false;
  });

  // Toggle fullscreen handler
  ipcMain.on('toggle-fullscreen', () => {
    if (!appState.win) return;

    const willBeFullscreen = !appState.win.isFullScreen();
    appState.win.setFullScreen(willBeFullscreen);
    appState.windowState.isFullscreen = willBeFullscreen;

  // Notify renderer of the new state
  appState.win.webContents.send('fullscreen-state-changed', willBeFullscreen);

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
}
async function getRealLongFilename(filePath) {
  try {
    const dirPath = path.dirname(filePath);
    const fileName = path.basename(filePath);
    
    // Read directory to get actual file entries
    const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    // First try: exact case-insensitive match
    let fileEntry = files.find(file => 
      file.name.toLowerCase() === fileName.toLowerCase()
    );
    
    // If no match found and filename looks like Windows 8.3 short name (contains ~), use metadata matching
    if (!fileEntry && fileName.includes('~')) {
      try {
        // Get file stats for the given path (the short name being accessed)
        const inputStats = await fs.promises.stat(filePath);
        const ext = path.extname(fileName).toLowerCase();
        
        // ✅ IMPORTANT: Get ALL files with same extension
        const candidateFiles = files.filter(file => {
          if (!file.isFile()) return false;
          return path.extname(file.name).toLowerCase() === ext;
        });
        
        console.log(`📁 Found ${candidateFiles.length} file(s) with extension "${ext}" for matching`);
        console.log(`📊 Looking for file with size=${inputStats.size}, mtime=${inputStats.mtimeMs}`);
        
        // ✅ IMPROVED: Check EACH candidate file
        for (const candidate of candidateFiles) {
          try {
            const candidateFullPath = path.join(dirPath, candidate.name);
            const candidateStats = await fs.promises.stat(candidateFullPath);
            
            // ✅ STRICT: Size AND mtime must BOTH match exactly (or within 1 second tolerance)
            const sizesMatch = candidateStats.size === inputStats.size;
            const timesMatch = Math.abs(candidateStats.mtimeMs - inputStats.mtimeMs) <= 1000;  // 1 second tolerance
            
            console.log(`  ➜ "${candidate.name}": size=${candidateStats.size}, mtime=${candidateStats.mtimeMs}`);
            
            if (sizesMatch && timesMatch) {
              console.log(`✅ MATCHED! Resolved "${fileName}" → "${candidate.name}"`);
              return candidateFullPath;
            }
          } catch (e) {
            console.warn(`  ⚠️ Could not stat "${candidate.name}": ${e.message}`);
          }
        }
        
        // ✅ FALLBACK: If no exact match found, try size-only matching
        console.warn(`⚠️ No exact match found for "${fileName}", trying size-only matching...`);
        for (const candidate of candidateFiles) {
          try {
            const candidateFullPath = path.join(dirPath, candidate.name);
            const candidateStats = await fs.promises.stat(candidateFullPath);
            
            if (candidateStats.size === inputStats.size) {
              console.log(`✅ SIZE MATCH! Resolved "${fileName}" → "${candidate.name}"`);
              return candidateFullPath;
            }
          } catch (e) {
            // Continue to next candidate
          }
        }
        
        console.error(`❌ Could not resolve short name "${fileName}" - no matching file found!`);
        return filePath;  // Return original if no match found
        
      } catch (e) {
        console.error(`❌ Error in metadata matching for "${fileName}": ${e.message}`);
        return filePath;
      }
    }
    
    if (fileEntry && fileEntry.name !== fileName) {
      // We found a mismatch - use the real name from filesystem
      console.log(`✅ String match resolved: "${fileName}" → "${fileEntry.name}"`);
      return path.join(dirPath, fileEntry.name);
    }
    
    return filePath; // Return original if no difference found
  } catch (error) {
    console.error('Error getting real filename:', error);
    return filePath; // Fallback to original path
  }
}

// Open file dialog to select media files or folders
async function handleOpenFileDialog() {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Media Files", extensions: MEDIA_EXTENSIONS.map(ext => ext.substring(1)) }]
    });
 
    if (result.canceled) return null;
    
    // FIX: Get real long filenames, not 8.3 short names
    let filePaths = await Promise.all(
      result.filePaths.map(async (filePath) => {
        const normalized = path.normalize(filePath);
        return await getRealLongFilename(normalized);
      })
    );
    
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
      .map(file => path.join(folderPath, file.name))  // file.name is already the long filename
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
 
    return mediaFiles.length > 0 ? mediaFiles : null;
  } catch (error) {
    console.error("Error reading folder:", error);
    return null;
  }
}

// ── NEW: Get all media files from the folder containing a specific file ──
// When a file is opened directly (e.g., from Windows), load all files in its folder
async function handleGetFolderMediaFiles(event, filePath) {
  try {
    if (!filePath || typeof filePath !== 'string') {
      return { files: [], currentFile: null };
    }

    // Get the directory containing the file
    const folderPath = path.normalize(path.dirname(filePath));
    
    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
      console.warn(`Folder does not exist: ${folderPath}`);
      return { files: [filePath], currentFile: filePath }; // Fall back to single file
    }

    // Read all files in the folder
    const files = await fs.promises.readdir(folderPath, { withFileTypes: true });
 
    // Filter media files and sort them numerically
    const mediaFiles = files
      .filter(file => file.isFile() && MEDIA_EXTENSIONS.includes(path.extname(file.name).toLowerCase()))
      .map(file => path.join(folderPath, file.name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
 
    return {
      files: mediaFiles.length > 0 ? mediaFiles : [filePath],
      currentFile: filePath
    };
  } catch (error) {
    console.error("Error reading folder media files:", error);
    // Fallback: return just the single file
    return { files: [filePath], currentFile: filePath };
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
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // re-check every 4 hours
let updateCheckTimer = null;

function setupAutoUpdater() {
  // Clear any existing listeners to prevent stacking if called again
  autoUpdater.removeAllListeners();

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-available', (info) => {
    console.log('[Updater] Update available:', info.version);
    appState.win?.webContents.send('update-available', { version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[Updater] App is up to date');
    appState.win?.webContents.send('update-not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    isUpdating = true;
    if (!updaterWindow) createUpdaterWindow();
    // Send full progress object: percent, bytesPerSecond, transferred, total
    updaterWindow?.webContents.send('download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    isUpdating = false;
    console.log('[Updater] Download complete, will install on quit');
    // Tell the updater UI to show "Ready, restarting..." then main handles quit
    updaterWindow?.webContents.send('update-downloaded', { version: info.version });
    // Delay quit to let the UI animate
    setTimeout(() => {
      appState.isQuitting = true;
      autoUpdater.quitAndInstall(false, true);
    }, 2500);
  });

  autoUpdater.on('error', (error) => {
    console.error('[Updater] Error:', error.message);
    isUpdating = false;
    // Destroy the updater window safely (closable may be false)
    if (updaterWindow) {
      updaterWindow.destroy();
      updaterWindow = null;
    }
    appState.win?.webContents.send('update-error', error.message);
    if (appState.win && !appState.win.isVisible()) {
      appState.win.show();
    }
  });

  // Check now (only in packaged build — skip in dev to avoid GitHub rate limits)
  if (app.isPackaged) {
    doUpdateCheck();
    // Schedule periodic re-checks
    if (updateCheckTimer) clearInterval(updateCheckTimer);
    updateCheckTimer = setInterval(doUpdateCheck, UPDATE_CHECK_INTERVAL);
  } else {
    console.log('[Updater] Skipping update check in dev mode');
  }
}

function doUpdateCheck() {
  if (!net.isOnline()) {
    console.log('[Updater] Offline — skipping check');
    return;
  }
  console.log('[Updater] Checking for updates...');
  autoUpdater.checkForUpdates().catch(err => {
    console.warn('[Updater] checkForUpdates failed:', err.message);
  });
}

function createUpdaterWindow() {
  updaterWindow = new BrowserWindow({
    width: 400,
    height: 280,
    resizable: false,
    maximizable: false,
    closable: false,
    minimizable: true,
    frame: false,
    transparent: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, './update/preload-updater.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  updaterWindow.loadFile(path.join(__dirname, './update/updater.html'));
  updaterWindow.on('ready-to-show', () => updaterWindow.show());
  updaterWindow.on('closed', () => { updaterWindow = null; });
}

app.on('will-quit', () => {
  if (app.isReady()) {
    globalShortcut.unregisterAll();
  }
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
    setupGlobalShortcut();
    // Single deferred start — gives the window time to finish loading
    setTimeout(() => setupAutoUpdater(), 2000);
    // Run GPU detection after window is ready (getGPUInfo needs app to be ready)
    detectGpuAndSetHwAccel();
  });

  app.on("second-instance", (event, commandLine) => {
    // Focus existing window
    if (appState.win) {
      if (appState.win.isMinimized()) appState.win.restore();
      appState.win.focus();

      // Collect ALL media files passed to the second instance (user may have
      // selected multiple files in Explorer and opened them at once).
      const filePaths = commandLine.filter(arg =>
        typeof arg === 'string' && MEDIA_EXTENSIONS.includes(path.extname(arg).toLowerCase())
      ).map(p => path.normalize(p));

      if (filePaths.length > 0) {
        const send = () => {
          // Send each file individually so the renderer can enqueue them all.
          filePaths.forEach(fp => appState.win.webContents.send("open-file", fp));
        };
        if (appState.win.webContents.isLoading()) {
          appState.win.webContents.once('did-finish-load', send);
        } else {
          send();
        }
      }
    }
  });
  
  // Modify the open-file handler
app.on("open-file", async (event, filePath) => {
  event.preventDefault();
  if (appState.win) {
    const realPath = await getRealLongFilename(path.normalize(filePath));
    if (appState.win.webContents.isLoading()) {
      appState.win.webContents.once('did-finish-load', () => {
        appState.win.webContents.send("open-file", realPath);
      });
    } else {
      appState.win.webContents.send("open-file", realPath);
    }
  } else {
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

// File date fetcher for sort-by-date
ipcMain.handle('get-file-dates', async (event, filePaths) => {
    const result = {};
    for (const filePath of filePaths) {
        try {
            const normalizedPath = path.normalize(filePath);
            const stat = fs.statSync(normalizedPath);
            result[filePath] = stat.mtimeMs; // key matches what renderer sent
        } catch {
            result[filePath] = 0;
        }
    }
    return result;
});

// ============================================
// CHAPTERS HANDLER - Extract chapters from video
// ============================================
ipcMain.handle('load-chapters', async (event, filePath) => {
  try {
    const { execSync } = require('child_process');
    
    if (!filePath || !fs.existsSync(filePath)) {
      console.log('[Chapters] File not found:', filePath);
      return [];
    }

    // Use ffprobe to extract chapters
    const command = `"${ffprobeExecutable}" -v quiet -print_format json -show_chapters "${filePath}"`;
    
    try {
      const output = execSync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const data = JSON.parse(output);

      if (!data.chapters || data.chapters.length === 0) {
        console.log('[Chapters] No chapters found in video');
        return [];
      }

      const chapters = data.chapters.map((ch, index) => {
        // Try to get chapter name from tags
        const name = ch.tags?.title || ch.tags?.NAME || `Chapter ${index + 1}`;
        const start = parseFloat(ch.start_time) || 0;
        const end = parseFloat(ch.end_time) || 0;

        return {
          index,
          name,
          start,
          end,
          duration: end - start
        };
      });

      console.log(`[Chapters] Extracted ${chapters.length} chapters from video`);
      return chapters;
    } catch (execError) {
      console.log('[Chapters] FFprobe error (ffprobe might not be installed):', execError.message);
      return [];
    }
  } catch (error) {
    console.error('[Chapters] Error loading chapters:', error);
    return [];
  }
});

// ============================================
// FILENAME RESOLUTION HANDLER - Fix Windows 8.3 short names
// ============================================
ipcMain.handle('get-real-filename', async (event, filePath) => {
  return await getRealLongFilename(filePath);
});