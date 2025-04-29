// Update your JavaScript to this:
window.electronUpdater.onDownloadProgress((percent) => {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.classList.remove('complete');
  }
  if (progressText) progressText.textContent = `${Math.round(percent)}%`;
});

window.electronUpdater.onUpdateDownloaded(() => {
  const status = document.querySelector('.updater-status');
  const progressBar = document.getElementById('progress-bar');
  
  if (status) status.textContent = 'Update ready! Restarting...';
  if (progressBar) {
    progressBar.classList.add('complete');
    progressBar.style.width = '100%';
  }
  
  setTimeout(() => window.close(), 2000);
});

// Disabling the dragging behavior
document.querySelectorAll("img").forEach((img) => {
  img.setAttribute("draggable", "false");
});

// Add smooth transition when window loads
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.updater-container');
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    container.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 100);
  }
});