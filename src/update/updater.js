// ── Element refs ─────────────────────────────────────────────────────────────
const pctNumber    = document.getElementById('pctNumber');
const pctLabel     = document.getElementById('pctLabel');
const segTrack     = document.getElementById('segTrack');
const statSpd      = document.getElementById('statSpd');
const statEta      = document.getElementById('statEta');
const statBytes    = document.getElementById('statBytes');
const updaterTitle = document.getElementById('updaterTitle');
const updaterVersion = document.getElementById('updaterVersion');
const versionText  = document.getElementById('versionText');
const heroRing     = document.getElementById('heroRing');
const doneBanner   = document.getElementById('doneBanner');
const doneText     = document.getElementById('doneText');
const minimizeBtn  = document.getElementById('minimizeBtn');

// ── Constants ─────────────────────────────────────────────────────────────────
const TOTAL_SEGS = 20;

// ── Build segments ────────────────────────────────────────────────────────────
const segs = [];
for (let i = 0; i < TOTAL_SEGS; i++) {
  const el = document.createElement('div');
  el.className = 'seg';
  segTrack.appendChild(el);
  segs.push(el);
}

// ── Minimize ─────────────────────────────────────────────────────────────────
if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => {
    if (window.electronUpdater?.minimize) window.electronUpdater.minimize();
  });
}

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtSpeed(bps) {
  if (!bps || bps <= 0) return '—';
  if (bps < 1024)         return `${bps.toFixed(0)} B/s`;
  if (bps < 1024 * 1024)  return `${(bps / 1024).toFixed(1)} KB/s`;
  return `${(bps / (1024 * 1024)).toFixed(2)} MB/s`;
}

function fmtBytes(bytes) {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtEta(transferred, total, bps) {
  if (!bps || bps <= 0 || !total) return '—';
  const secs = Math.round((total - transferred) / bps);
  if (secs < 4)   return 'Almost done';
  if (secs < 60)  return `~${secs}s`;
  const mins = Math.ceil(secs / 60);
  return `~${mins}m ${Math.round(secs % 60)}s`;
}

function fmtPctLabel(pct, isDone) {
  if (isDone) return 'Complete';
  if (pct === 0) return 'Fetching…';
  if (pct < 15)  return 'Starting…';
  if (pct < 50)  return 'Downloading…';
  if (pct < 80)  return 'Almost there…';
  if (pct < 95)  return 'Finishing up…';
  return 'Nearly done…';
}

// ── Segment updater ───────────────────────────────────────────────────────────
let _lastFilledSeg = -1;

function updateSegs(displayPct, isDone) {
  const filled = isDone ? TOTAL_SEGS : Math.floor((displayPct / 100) * TOTAL_SEGS);
  for (let i = 0; i < TOTAL_SEGS; i++) {
    const seg = segs[i];
    if (isDone) {
      seg.className = 'seg done';
    } else if (i < filled) {
      seg.className = 'seg filled';
    } else if (i === filled && i > _lastFilledSeg) {
      seg.className = 'seg active';
      // After animation resolves, mark as filled
      const capturedI = i;
      setTimeout(() => {
        if (segs[capturedI].className === 'seg active') {
          segs[capturedI].className = 'seg filled';
        }
      }, 420);
    } else {
      seg.className = 'seg';
    }
  }
  _lastFilledSeg = filled;
}

// ── Psychological speed curve ─────────────────────────────────────────────────
//
//  The trick: show a "display progress" that races ahead of real progress
//  in the 0–80% zone to feel fast, then syncs up from 80–100% where it
//  reveals the genuine remaining bytes. Users perceive the download as quick.
//
//  displayPct = real progress mapped through easeOutCurve, always >= real

let _realPct    = 0;  // actual download percent from main process
let _displayPct = 0;  // what the UI shows (psychological curve)
let _targetDisp = 0;  // lerp target for smooth animation
let _rafId      = null;

function realToDisplay(real) {
  // Phase 1 (0–80 real): map to 0–92 display (front-loaded, feels fast)
  if (real <= 80) {
    return real * (92 / 80);
  }
  // Phase 2 (80–100 real): map 92–100 display (slow finale, honest)
  return 92 + (real - 80) * (8 / 20);
}

function lerpTick() {
  const diff = _targetDisp - _displayPct;
  if (Math.abs(diff) < 0.08) {
    _displayPct = _targetDisp;
    applyDisplay(_displayPct);
    _rafId = null;
    return;
  }
  // Faster lerp in early stage, slower near the end
  const speed = _displayPct < 70 ? 0.06 : 0.04;
  _displayPct += diff * speed;
  applyDisplay(_displayPct);
  _rafId = requestAnimationFrame(lerpTick);
}

function applyDisplay(pct) {
  const rounded = Math.round(Math.min(100, pct));
  if (pctNumber) pctNumber.textContent = rounded;
  if (pctLabel)  pctLabel.textContent = fmtPctLabel(rounded, false);
  updateSegs(pct, false);
}

function setRealProgress(real) {
  _realPct   = Math.min(100, real);
  _targetDisp = realToDisplay(_realPct);
  if (!_rafId) _rafId = requestAnimationFrame(lerpTick);
}

// ── State handlers ────────────────────────────────────────────────────────────
function setDownloading(version) {
  if (version) {
    versionText.textContent = `v${version}`;
    updaterVersion.classList.add('visible');
  }
  if (updaterTitle) {
    updaterTitle.textContent = 'Downloading update';
    updaterTitle.classList.add('downloading');
  }
}

function setComplete(version) {
  // Stop spinner title
  if (updaterTitle) {
    updaterTitle.textContent = 'Update ready';
    updaterTitle.classList.remove('downloading');
  }

  // Snap to 100%
  _displayPct = 100;
  _targetDisp = 100;
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  if (pctNumber) { pctNumber.textContent = '100'; pctNumber.classList.add('done'); }
  if (pctLabel)  pctLabel.textContent = 'Complete';

  // Green segments
  updateSegs(100, true);

  // Green ring
  if (heroRing) heroRing.classList.add('done');

  // Clear stats
  if (statEta) { statEta.textContent = '0s'; statEta.className = 'stat-card-value green'; }
  if (statSpd) { statSpd.textContent = '—'; }

  // Version pill update
  if (version) {
    versionText.textContent = `v${version} ready`;
    updaterVersion.classList.add('visible');
  }

  // Done banner
  if (version) doneText.textContent = `v${version} installed — restarting…`;
  requestAnimationFrame(() => doneBanner.classList.add('visible'));
}

// ── IPC events ────────────────────────────────────────────────────────────────
window.electronUpdater.onDownloadProgress((data) => {
  const real = Math.min(100, data.percent ?? 0);
  setRealProgress(real);

  // Stats
  if (statSpd) statSpd.textContent = fmtSpeed(data.bytesPerSecond ?? 0);
  if (statEta) statEta.textContent = fmtEta(data.transferred ?? 0, data.total ?? 0, data.bytesPerSecond ?? 0);
  if (statBytes) {
    const t = data.transferred ?? 0;
    const total = data.total ?? 0;
    statBytes.textContent = total > 0
      ? `${fmtBytes(t)} / ${fmtBytes(total)}`
      : fmtBytes(t);
  }

  // Ensure we're in downloading state
  setDownloading(null);
});

window.electronUpdater.onUpdateDownloaded((info) => {
  setComplete(info?.version);
});

// ── Prevent image drag ────────────────────────────────────────────────────────
document.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));