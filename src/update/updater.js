const progressBar    = document.getElementById('progress-bar');
const progressPct    = document.getElementById('progress-percent');
const progressSpeed  = document.getElementById('progress-speed');
const updaterStatus  = document.getElementById('updater-status');
const updaterVersion = document.getElementById('updater-version');
const updaterEta     = document.getElementById('updater-eta');

function formatBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B/s`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
}

function formatEta(transferred, total, bps) {
  if (!bps || bps <= 0) return '';
  const remaining = total - transferred;
  const secs = Math.round(remaining / bps);
  if (secs < 5)  return 'Almost done…';
  if (secs < 60) return `~${secs}s remaining`;
  return `~${Math.ceil(secs / 60)}m remaining`;
}

// Full progress object: { percent, bytesPerSecond, transferred, total }
window.electronUpdater.onDownloadProgress((data) => {
  const pct = Math.round(data.percent ?? 0);

  if (progressBar)   progressBar.style.width = `${pct}%`;
  if (progressPct)   progressPct.textContent = `${pct}%`;
  if (progressSpeed) progressSpeed.textContent = formatBytes(data.bytesPerSecond ?? 0);
  if (updaterEta)    updaterEta.textContent = formatEta(
    data.transferred ?? 0, data.total ?? 0, data.bytesPerSecond ?? 0
  );

  progressBar?.classList.remove('complete');
});

// { version }
window.electronUpdater.onUpdateDownloaded((info) => {
  if (updaterStatus)  updaterStatus.textContent  = 'Restarting…';
  if (updaterVersion) updaterVersion.textContent = info?.version ? `v${info.version} ready` : 'Ready';
  if (progressBar) {
    progressBar.classList.add('complete');
    progressBar.style.width = '100%';
  }
  if (progressSpeed) progressSpeed.textContent = '';
  if (updaterEta)    updaterEta.textContent = 'Saving your progress and restarting…';
  // main.js handles quitAndInstall — don't race it with window.close()
});

// Prevent image drag
document.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));