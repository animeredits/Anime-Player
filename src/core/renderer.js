const video = document.getElementById("media");
const mediaPlayer = document.getElementById("mediaPlayer");
const minimizeBtn = document.querySelector("#minimize");
const maximizeBtn = document.querySelector("#maximize");
const videoEffectBtn = document.querySelector('.videoEffectBtn');
const saturationModal = null; 
const saturationSlider = null;
const saturationValue = null;  
const resetBtn = null;         
const openFileButton = document.getElementById("openFileButton");
const openFolderButton = document.getElementById("openFolderButton");
const shuffleButton = document.getElementById("shuffle-button");
const gifImageElement = document.getElementById("gifImage");
const rewind = document.getElementById("rewind-button");
const forward = document.getElementById("forward-button");
const nextButton = document.getElementById("nextVideo");
const prevButton = document.getElementById("prevVideo");
const continueButton = document.getElementById("continueOverlay");
const playbackSpeedLinks = document.querySelectorAll("#Playback-Speed a");
const speedOptions = {
	increase: [1.25, 1.5, 1.75, 2],
	decrease: [0.75, 0.5, 0.25],
};
const zoomTrackList = document.getElementById("zoom-track-list");
const zoomOptions = document.querySelectorAll("[data-zoom-level]");
const seekBarContainer = document.getElementById("seek-bar-container");
const seekBarWrapper = document.getElementById("seek-bar-wrapper");
const seekBar = document.getElementById("seek-bar");
const seekBarHandle = document.getElementById("seek-bar-handle");
const currentTimeDisplay = document.getElementById("current-time");
const durationDisplay = document.getElementById("video-duration");
const pipButton = document.getElementById("pip-button");
const volumeBtn = document.getElementById("volume-button");
const mute = document.querySelectorAll(".mute");
const loopBtn = document.getElementById("loop-button");
const iconContainer = loopBtn.parentElement;
const playPauseWrapper = document.getElementById("playPauseWrapper");
const playPauseBtn = document.getElementById("play-pause-button");
const videoTitleElement = document.getElementById("video-title");
const switchAudio = document.getElementById("switchAudioTrack");
const contextMenuItems = document.querySelectorAll(".context-menu li");
const audioImage = document.getElementById("audioImage");
const logoOptions = document.getElementById("logoOptions");
const audioLogoDropdown = document.getElementById("audioLogoDropdown");
const customLogoLink = document.getElementById("customLogoLink");
const customLogoInput = document.getElementById("customLogoInput");
const deleteLogoButton = document.getElementById("deleteLogoButton");
const logoPreviewContainers = document.querySelectorAll(".logo-preview-container");
const logoPreviewImages = document.querySelectorAll(".logo-preview-image");
// GIF search elements (navbar viz panel)
const gifSearchInput = document.getElementById("gifSearchInput");
const gifSearchClear = document.getElementById("gifSearchClear");
const gifResultsContainer = document.getElementById("gifResultsContainer");
const gifSearchContainer = document.getElementById("gifSearchContainer");
// GIF search elements (context menu viz panel)
const gifSearchInputCM = document.getElementById("gifSearchInputCM");
const gifResultsContainerCM = document.getElementById("gifResultsContainerCM");
const statusMessage = document.getElementById("statusMessage");
const subtitleDisplay = document.getElementById('subtitle-display');

let currentChapters = [];
let currentVideoPath = null;
let chaptersList, chapterTooltip, chaptersMarkersContainer;
let subtitleCueListener = null;
let ffprobeAudioTracks = [];
let audioTrackPlayer = null;
let currentMedia = video;
let isMaximized = false;
let isFullscreen = false;
let isRepeatMode = 0;
let mediaFiles = [];
let isFirstFileOpened = false;
let playedVideos = [];
let currentVideoIndex = 0;
let currentAudioIndex = 0;
let timeDisplayInterval = null;
let lastPlayedIndex = -1;
let lastPlayedStack = [];
let navigationHistory = [];
let shuffleBack = [];
let shuffleFwd  = [];
let currentWatchedFolder = null;                
let watchedFolderFiles = [];                  
let folderWatchInitialized = false;         
let notificationHideTimeout = null;        
let folderWatchState = {
	isWatching: false,
	errorCount: 0,
	lastChangeTime: null,
	changeHistory: []
};
let autoSwitchDone = false;
let isGifPlaying = false;
let DEFAULT_SATURATION = 120;
let STEP = 5;
let debounceTimeout;
let showRemainingTime = false;
let lastPlaybackTime = 0;
let isUserScrolling = false;
const tooltip = createTooltip();
let tooltipTimeout;
let scrollTimeout;
let currentSpeedIndex = 3;
let videoId;
let sortMethod = 'name';
let sortDirection = 'ascending';
let hideContinueButtonTimeout;
let hideHandleTimeout;
let isVideoPaused = false;
let totalTimeInSeconds = 0;
let countdownInterval = null;
let remainingTimeOnPause = 0;
const VOLUME_CONFIG = {
  maxVolume: 3.5,           // 350% - exceeds VLC's 200% for true loudness parity
  defaultVolume: 0.1,       // 10% startup
  amplificationFactor: 1.2, // Extra gain for clarity
  smoothingFactor: 0.05     // Smooth volume transitions
};
let isPaused = false;
let isContextMenuVisible = false;
let isSpeedAdjustmentHold = false;
let contextMenuClick = false;
let isShuffle = false;
let isLoadingFile = false; 
let isLooping = false;
let volumeStep = 0.05;
let minFontSize = 18;
let maxFontSize = 36;
let rotationInitiated = false;
let isAppClosing = false;
let defaultFontSize = 16;
let scale = 1;
let zoomLevels = [1.3, 1.5, 2, 2.5, 3, 1];
let currentZoomIndex = 0;
let aspectRatioLevels = ['original', 'fit', 'fill', '16-9', '4-3', '21-9', '1-1'];
let currentAspectRatioIndex = 0;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;
let minZoom = 0.25;
let maxZoom = 3;
const pinchZoomSensitivity = 0.9700; // smaller step for smoother pinch zoom
let currentAspectRatio = 'original'; // Track current aspect ratio
let recognitionActive = false;
let isMouseOver = false;
let isShutdownAtVideoEndEnabled = false;
let isShutdownAtPlaylistEndEnabled = false;


// ✅ Function to show the temporary status message
// Accepts an optional CSS class override (e.g. 'vol-high') for colour coding.
let _statusTimeout = null;
function showStatusMessage(text, cssClass) {
	// Suppress during startup restore operations (e.g. audio effect reload)
	if (window._suppressNextStatusMessage) {
		window._suppressNextStatusMessage = false;
		return;
	}
	if (!text) return;
	statusMessage.innerText = text;
	// Volume colour coding: green ≤100 %, yellow >100 %
	statusMessage.classList.remove('vol-normal', 'vol-high');
	if (cssClass) statusMessage.classList.add(cssClass);
	statusMessage.classList.add('visible');
	clearTimeout(_statusTimeout);
	_statusTimeout = setTimeout(() => {
		statusMessage.classList.remove('visible', 'vol-normal', 'vol-high');
	}, 1800);
}

// ── Dynamic list visibility ──────────────────────────────────────────────────
// Hides parent nav rows / context-menu items when a dynamic list has no items.
function refreshDynamicListVisibility() {
	// --- Playlist ---
	const hasPlaylist = mediaFiles.length > 0;
	document.querySelectorAll('.play-list').forEach(list => {
		// Navbar: use class toggle — CSS !important beats the :hover rule
		if (list.classList.contains('sub-dropdown-content')) {
			list.classList.toggle('nav-list-empty', !hasPlaylist);
		}
		// Context menu: hide only the .cm-submenu div, not the whole li
		const cmSubmenuDiv = list.closest('.cm-submenu');
		if (cmSubmenuDiv) cmSubmenuDiv.style.display = hasPlaylist ? '' : 'none';
	});

	// --- Audio Track ---
	const audioList = document.querySelector('.audio-track-list');
	const hasAudioTracks = !!(audioList && audioList.querySelector('.track-item'));
	document.querySelectorAll('.audio-track-list').forEach(list => {
		// Navbar: use class toggle — CSS !important beats the :hover rule
		if (list.classList.contains('sub-dropdown-content')) {
			list.classList.toggle('nav-list-empty', !hasAudioTracks);
		}
		// Context menu: hide only the .cm-submenu div, not the whole li
		const cmSubmenuDiv = list.closest('.cm-submenu');
		if (cmSubmenuDiv) cmSubmenuDiv.style.display = hasAudioTracks ? '' : 'none';
	});

	// --- Subtitle Track ---
	const subtitleList = document.querySelector('.subtitle-track-list');
	const hasSubtitleTracks = !!(subtitleList && subtitleList.querySelector('.subtitle-item'));
	document.querySelectorAll('.subtitle-track-list').forEach(list => {
		// Navbar: use class toggle — CSS !important beats the :hover rule
		if (list.classList.contains('sub-dropdown-content')) {
			list.classList.toggle('nav-list-empty', !hasSubtitleTracks);
		}
		// Context menu: hide only this div (not the whole Subtitle li)
		if (list.classList.contains('cm-dynamic-list')) {
			list.style.display = hasSubtitleTracks ? '' : 'none';
		}
		// Also hide/show the cm-divider inside the <ul> directly before this list
		const cmSubmenu = list.closest('.cm-submenu');
		if (cmSubmenu) {
			const ulEl = cmSubmenu.querySelector('ul');
			if (ulEl) {
				const lastLi = ulEl.lastElementChild;
				if (lastLi && lastLi.classList.contains('cm-divider')) {
					lastLi.style.display = hasSubtitleTracks ? '' : 'none';
				}
			}
		}
	});
}

// disabling the dragging behavior
document.querySelectorAll("a ,img").forEach((link) => {
	link.setAttribute("draggable", "false");
});

// ✅ Function to update logo if the audio doesn't have a thumbnail
function updateLogo(src) {
	audioImage.src = src; // Set the logo
	audioImage.style.display = "block"; // Show the logo
}

// ✅ Trigger file input when clicking the custom logo link
customLogoLink.addEventListener("click", function() {
	customLogoInput.click(); // Programmatically click the file input
});

// ✅ Function to show the preview
function showLogoPreview(logoSrc) {
	Array.from(logoPreviewImages).forEach((img) => {
		img.src = logoSrc;
		img.parentElement.style.display = "block"; // Show the preview container
	});
}

// ✅ Function to hide the preview
function hideLogoPreview() {
	Array.from(logoPreviewContainers).forEach((container) => {
		container.style.display = "none"; // Hide the preview container
	});
}

// ✅ Updated customLogoInput change event
customLogoInput.addEventListener("change", async function(event) {
	if (!event.target.files.length) {
		console.error("No file selected or invalid file");
		return;
	}

	const file = event.target.files[0];
	event.target.value = ""; // Reset input value to allow re-selecting the same file

	const fileName = file.name;
	const reader = new FileReader();

	reader.onload = async function(e) {
		const fileBuffer = e.target.result;
		const autoSaveLogo = JSON.parse(localStorage.getItem("autoSaveLogo")) || false;

		if (autoSaveLogo) {
			const response = await window.electron.saveCustomLogo(fileBuffer, fileName);
			if (response.success) {
				saveCustomLogo(response.path, fileName);
				loadCustomLogos(); // ✅ Refresh the list
			} else {
				console.error("Failed to save GIF:", response.error);
			}
		} else {
			const {
				confirmed,
				autoSave
			} = await showCustomConfirm();
			if (confirmed) {
				const response = await window.electron.saveCustomLogo(fileBuffer, fileName);
				if (response.success) {
					saveCustomLogo(response.path, fileName);
					loadCustomLogos(); // ✅ Refresh the list
					if (autoSave) {
						localStorage.setItem("autoSaveLogo", JSON.stringify(true));
					}
				} else {
					console.error("Failed to save GIF:", response.error);
				}
			}
		}
	};
	reader.onerror = function() {
		console.error("Failed to read the file");
	};
	reader.readAsArrayBuffer(file);
});


// ✅ Update the saveCustomLogo function to add to BOTH navbar and context menu panels
function saveCustomLogo(filePath, fileName) {
    // Helper to create a tile and add it to a container
    function _addToContainer(container) {
        if (!container) return;

        // Remove existing item for same file to avoid duplicates
        container.querySelectorAll(`.logo-item.custom[data-filename="${CSS.escape(fileName)}"]`)
            .forEach(el => el.remove());

        const item = document.createElement("div");
        item.classList.add("viz-preset-item", "logo-item", "custom");
        item.setAttribute("data-filename", fileName);
        item.setAttribute("data-src", filePath);
        item.setAttribute("data-label", fileName);

        // Thumb
        const thumb = document.createElement("div");
        thumb.className = "viz-thumb-wrap";
        const img = document.createElement("img");
        img.src = filePath;
        img.loading = "lazy";
        thumb.appendChild(img);

        // Label row with delete icon
        const labelRow = document.createElement("div");
        labelRow.style.cssText = "display:flex;align-items:center;gap:3px;width:100%;";

        const labelSpan = document.createElement("span");
        labelSpan.textContent = fileName.length > 10 ? fileName.substring(0,10)+'…' : fileName;

        const delIcon = document.createElement("img");
        delIcon.className = "svg-icon";
        delIcon.src = "../../assets/icons/fa/trash-can.svg";
        delIcon.alt = "";
        delIcon.style.cssText = "font-size:9px;color:rgba(255,80,80,0.7);cursor:pointer;margin-left:auto;";
        delIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(`.logo-item.custom[data-filename="${CSS.escape(fileName)}"]`)
                .forEach(el => el.remove());
            removeCustomLogoFromStorage(fileName);
            deleteCustomLogo(fileName);
        });
        labelRow.appendChild(labelSpan);
        labelRow.appendChild(delIcon);
        item.appendChild(thumb);
        item.appendChild(labelRow);

        // Click to select - UPDATED to work with setSelectedLogo
        item.addEventListener("click", (e) => {
            if (e.target === delIcon || delIcon.contains(e.target)) return;
            document.querySelectorAll(".viz-preset-item").forEach(i => i.classList.remove("active"));
            document.querySelectorAll(`.viz-preset-item[data-filename="${CSS.escape(fileName)}"]`)
                .forEach(i => i.classList.add("active"));
            setSelectedLogo(filePath); // Use setSelectedLogo instead of updateLogo
            showStatusMessage("Visualization: " + fileName);
            closeVizDropdown();
            
            // Close context menu if open
            const contextMenu = document.getElementById("contextMenu");
            if (contextMenu) contextMenu.style.display = "none";
        });
        
        // Insert before upload button or append
        const uploadBtn = container.querySelector('.viz-upload-btn, #customLogoLink, #customLogoLinkCM');
        if (uploadBtn) container.insertBefore(item, uploadBtn);
        else container.appendChild(item);
    }

    // Navbar panel
    const navContainer = document.getElementById("logoOptions");
    _addToContainer(navContainer);

    // Context menu panel
    const cmContainer = document.getElementById("vizPresetsCM");
    _addToContainer(cmContainer);

    saveCustomLogoToStorage(filePath, fileName);
    checkPlayAllButton();
    setSelectedLogo(filePath);
}


// ✅ Function to remove the logo from localStorage
function removeCustomLogoFromStorage(fileName) {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	delete logos[fileName];
	localStorage.setItem("customLogos", JSON.stringify(logos));
}

// ✅ Save the custom logo to localStorage with an absolute file path
function saveCustomLogoToStorage(filePath, fileName) {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	logos[fileName] = filePath; // Store absolute path
	localStorage.setItem("customLogos", JSON.stringify(logos));
}

//✅  Load custom logos from localStorage and add them to the dropdown list
function loadCustomLogos() {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};

	// Clear existing custom logo items from BOTH panels
	document.querySelectorAll(".logo-item.custom").forEach(el => el.remove());

	let lastLogoSrc = null;

	for (const [fileName, filePath] of Object.entries(logos)) {
		saveCustomLogo(filePath, fileName);
		lastLogoSrc = filePath; // Store the last logo path
	}

	const selectedLogo = localStorage.getItem("selectedLogo") || lastLogoSrc;
	if (selectedLogo) {
		setSelectedLogo(selectedLogo);
	}
}

// ✅ Show custom confirm dialog and return a promise
function showCustomConfirm() {
	return new Promise((resolve) => {
		const modal = document.getElementById("customConfirmDialog");
		const confirmButton = document.getElementById("confirmButton");
		const cancelButton = document.getElementById("cancelButton");
		const autoSaveCheckbox = document.getElementById("cbx-43");

		ModalAnimator.open(modal);

		confirmButton.onclick = () => {
			resolve({
				confirmed: true,
				autoSave: autoSaveCheckbox.checked,
			});
			ModalAnimator.close(modal);
		};

		cancelButton.onclick = () => {
			resolve({
				confirmed: false,
			});
			ModalAnimator.close(modal);
		};
	});
}

// ✅ Function to delete the custom logo
function deleteCustomLogo(fileName) {
	window.electron.deleteLogo(fileName)
		.then(response => {
			if (response.success) {
				// console.log(response.message); // Log success message

				// Stop Play All playback
				stopGifPlayback();

				// Optionally, update the UI or notify the user
				document.getElementById("audioLogo").style.display = "block";
				const audioImage = document.getElementById("audioImage");
				if (audioImage) {
					audioImage.style.display = "block";
					audioImage.src = ""; // Clear current image source
					audioImage.classList.remove("D-logo-rotate-animation");
				}
				loadCustomLogos(); // Refresh the list of logos
				checkPlayAllButton(); // Recheck Play All button visibility
			}
		})
		.catch(error => {
			console.error('Error deleting the logo:', error);
		});
}

// ✅ Function to check and show the "Play All" button
function checkPlayAllButton() {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	const playAllButtonContainer = document.getElementById("playAllButtonContainer");

	// Clear existing button if any
	playAllButtonContainer.innerHTML = "";

	// Create "Play All" button if two or more custom logos exist
	if (Object.keys(logos).length >= 2) {
		const playAllButton = document.createElement("button");
		playAllButton.textContent = "Play All";
		playAllButton.classList.add("play-all-button");
		playAllButton.addEventListener("click", playAllCustomLogos);
		playAllButtonContainer.appendChild(playAllButton);
	}
}

// ✅ Function to play all custom logos — setTimeout recursion (no busy loop / CPU waste)
function playAllCustomLogos() {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	const logoKeys = Object.keys(logos);
	if (!logoKeys.length) return;

	isGifPlaying = true;
	let _playAllIndex = 0;
	let _playAllTimer = null;

	function _showNextLogo() {
		if (!isGifPlaying || !logoKeys.length) return;

		const logoSrc = logos[logoKeys[_playAllIndex]];
		const audioImageEl = document.getElementById("audioImage");
		if (!audioImageEl) return;

		audioImageEl.classList.remove("D-logo-rotate-animation");
		audioImageEl.style.display = "block";

		// Advance index for next call
		_playAllIndex = (_playAllIndex + 1) % logoKeys.length;

		// Use onload for GIFs that need time to start; fallback timer for all others
		let _loaded = false;
		function _onLoaded() {
			if (_loaded) return;
			_loaded = true;
			audioImageEl.onload = null;
			audioImageEl.onerror = null;
			if (!isGifPlaying) return;
			_playAllTimer = setTimeout(_showNextLogo, 2000);
		}
		audioImageEl.onload  = _onLoaded;
		audioImageEl.onerror = _onLoaded;  // skip broken images gracefully
		audioImageEl.src = logoSrc;

		// Safety fallback: if onload never fires within 3 s, advance anyway
		setTimeout(() => { if (!_loaded) _onLoaded(); }, 3000);
	}

	// Expose cancel handle so stopGifPlayback() clears the pending timer
	playAllCustomLogos._cancelTimer = () => {
		if (_playAllTimer) { clearTimeout(_playAllTimer); _playAllTimer = null; }
	};

	_showNextLogo();
}

// ✅ Function to stop playback
function stopGifPlayback() {
	isGifPlaying = false;
	// Cancel any pending setTimeout from playAllCustomLogos
	if (typeof playAllCustomLogos._cancelTimer === 'function') {
		playAllCustomLogos._cancelTimer();
	}
}
// ✅ Function to set the selected logo and save the preference
function setSelectedLogo(logoSrc) {
    if (logoSrc) {
        audioImage.src = logoSrc;
        audioImage.style.display = 'block';
        localStorage.setItem('selectedLogo', logoSrc);
    } else {
        audioImage.src = '';
        audioImage.style.display = 'none';
        audioImage.classList.remove("D-logo-rotate-animation");
    }

    // Check for Default logo in BOTH panels
    let shouldAnimate = false;
    
    // Check navbar panel
    const navbarLogoLinks = document.querySelectorAll("#logoOptions .viz-preset-item[data-src]");
    navbarLogoLinks.forEach((link) => {
        const linkSrc = link.getAttribute("data-src");
        if (linkSrc === logoSrc && linkSrc === "../../assets/icons/icon.ico") {
            shouldAnimate = true;
        }
    });
    
    // Check context menu panel
    const cmLogoLinks = document.querySelectorAll("#vizPresetsCM .viz-preset-item[data-src]");
    cmLogoLinks.forEach((link) => {
        const linkSrc = link.getAttribute("data-src");
        if (linkSrc === logoSrc && linkSrc === "../../assets/icons/icon.ico") {
            shouldAnimate = true;
        }
    });
    
    // Apply or remove animation
    if (shouldAnimate && logoSrc) {
        audioImage.classList.add("D-logo-rotate-animation");
    } else {
        audioImage.classList.remove("D-logo-rotate-animation");
    }
}

// ✅ Event listeners for navbar panel
const navbarPresetItems = document.querySelectorAll("#logoOptions .viz-preset-item");
navbarPresetItems.forEach((item) => {
    // Remove existing listeners to avoid duplicates (optional but safer)
    item.removeEventListener("mouseenter", item._mouseEnterHandler);
    item.removeEventListener("mouseleave", item._mouseLeaveHandler);
    item.removeEventListener("click", item._clickHandler);
    
    // Hover preview
    item._mouseEnterHandler = function() {
        const logoSrc = this.getAttribute("data-src");
        if (logoSrc) showLogoPreview(logoSrc);
    };
    item.addEventListener("mouseenter", item._mouseEnterHandler);
    
    item._mouseLeaveHandler = function() {
        hideLogoPreview();
    };
    item.addEventListener("mouseleave", item._mouseLeaveHandler);
    
    // Click handler
    item._clickHandler = function() {
        const logoText = this.querySelector("span")?.textContent.trim() || "";
        const logoSrc = this.getAttribute("data-src");
        
        if (logoText === "None" || !logoSrc) {
            if (typeof logoPreviewImages !== 'undefined' && logoPreviewImages) {
                Array.from(logoPreviewImages).forEach((img) => {
                    img.src = '';
                    img.alt = 'No Logo Selected';
                });
            }
            setSelectedLogo('');
        } else if (logoSrc) {
            setSelectedLogo(logoSrc);
        }
    };
    item.addEventListener("click", item._clickHandler);
});

const cmPresetItems = document.querySelectorAll("#vizPresetsCM .viz-preset-item");
cmPresetItems.forEach((item) => {
    // Remove existing listeners to avoid duplicates
    item.removeEventListener("mouseenter", item._mouseEnterHandler);
    item.removeEventListener("mouseleave", item._mouseLeaveHandler);
    item.removeEventListener("click", item._clickHandler);
    
    // Hover preview
    item._mouseEnterHandler = function() {
        const logoSrc = this.getAttribute("data-src");
        if (logoSrc) showLogoPreview(logoSrc);
    };
    item.addEventListener("mouseenter", item._mouseEnterHandler);
    
    item._mouseLeaveHandler = function() {
        hideLogoPreview();
    };
    item.addEventListener("mouseleave", item._mouseLeaveHandler);
    
    // Click handler
    item._clickHandler = function() {
        const logoText = this.querySelector("span")?.textContent.trim() || "";
        const logoSrc = this.getAttribute("data-src");
        
        if (logoText === "None" || !logoSrc) {
            if (typeof logoPreviewImages !== 'undefined' && logoPreviewImages) {
                Array.from(logoPreviewImages).forEach((img) => {
                    img.src = '';
                    img.alt = 'No Logo Selected';
                });
            }
            setSelectedLogo('');
        } else if (logoSrc) {
            setSelectedLogo(logoSrc);
        }
        
        // Optional: Close context menu after selection
        const contextMenu = document.getElementById("contextMenu");
        if (contextMenu) contextMenu.style.display = "none";
    };
    item.addEventListener("click", item._clickHandler);
});

// ── GIF Search (shared logic for navbar + context menu panels) ──────────────

function _gifShowSkeletons(container, count = 9) {
	container.innerHTML = "";
	for (let i = 0; i < count; i++) {
		const sk = document.createElement("div");
		sk.className = "gif-skeleton";
		container.appendChild(sk);
	}
}

function _gifShowResults(container, gifs) {
	container.innerHTML = "";
	if (!gifs || gifs.length === 0) {
		const msg = document.createElement("div");
		msg.className = "viz-msg";
		msg.textContent = "No results found";
		container.appendChild(msg);
		return;
	}
	gifs.forEach(gif => {
		const url = gif.images.fixed_height_small
			? gif.images.fixed_height_small.url
			: gif.images.fixed_height.url;
		const origUrl = gif.images.original.url;
		const img = document.createElement("img");
		img.className = "gif-result-img";
		img.alt = gif.title || "GIF";
		img.loading = "lazy";
		// Show skeleton until loaded
		const skWrap = document.createElement("div");
		skWrap.className = "gif-skeleton";
		container.appendChild(skWrap);
		img.onload = () => skWrap.replaceWith(img);
		img.onerror = () => skWrap.remove();
		img.addEventListener("click", () => downloadAndSaveGif(origUrl, gif.title));
		img.src = url;
	});
}

function _gifShowError(container) {
	container.innerHTML = '<div class="viz-msg">Could not load GIFs. Check connection.</div>';
}

let _gifDebounceNav = null;
let _gifDebounceCM = null;

function searchGifsIn(inputEl, container, debounceRef, setRef) {
	clearTimeout(debounceRef);
	const ref = setTimeout(async () => {
		const term = inputEl.value.trim();
		if (!term) { container.innerHTML = ""; return; }
		_gifShowSkeletons(container, 9);
		try {
			const res = await fetch(
				`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(term)}&limit=30`
			);
			const data = await res.json();
			_gifShowResults(container, data.data);
		} catch(e) {
			console.error("GIF fetch error:", e);
			_gifShowError(container);
		}
	}, 400);
	setRef(ref);
}

// Wire up navbar panel
if (gifSearchInput) {
	gifSearchInput.addEventListener("input", () => {
		const hasVal = gifSearchInput.value.trim().length > 0;
		if (gifSearchClear) gifSearchClear.classList.toggle("visible", hasVal);
		searchGifsIn(gifSearchInput, gifResultsContainer,
			_gifDebounceNav, v => _gifDebounceNav = v);
	});
	gifSearchInput.addEventListener("keydown", e => {
		// Prevent global hotkeys from triggering while typing
		e.stopPropagation();
		if (e.key === "Escape") {
			gifSearchInput.value = "";
			if (gifSearchClear) gifSearchClear.classList.remove("visible");
			gifResultsContainer.innerHTML = "";
		}
	});
	// Prevent dropdown from closing when user clicks inside the search bar
	gifSearchInput.addEventListener("click", e => e.stopPropagation());
}
if (gifSearchClear) {
	gifSearchClear.addEventListener("click", e => {
		e.stopPropagation();
		gifSearchInput.value = "";
		gifSearchClear.classList.remove("visible");
		gifResultsContainer.innerHTML = "";
	});
}
// Search button — click focuses input and triggers search
const gifSearchBtn = document.getElementById("gifSearchBtn");
if (gifSearchBtn) {
	gifSearchBtn.addEventListener("click", e => {
		e.stopPropagation();
		if (gifSearchInput) {
			gifSearchInput.focus();
			gifSearchInput.dispatchEvent(new Event("input"));
		}
	});
}

// Wire up context menu panel
if (gifSearchInputCM) {
	gifSearchInputCM.addEventListener("input", () => {
		searchGifsIn(gifSearchInputCM, gifResultsContainerCM,
			_gifDebounceCM, v => _gifDebounceCM = v);
	});
	gifSearchInputCM.addEventListener("keydown", e => e.stopPropagation());
	gifSearchInputCM.addEventListener("click", e => e.stopPropagation());
}

// Helper to close the navbar viz dropdown panel
function closeVizDropdown() {
	if (audioLogoDropdown) {
		const panel = audioLogoDropdown.querySelector('.sub-dropdown-content');
		if (panel) panel.style.display = 'none';
	}
}

// Context menu custom logo link
const customLogoLinkCM = document.getElementById("customLogoLinkCM");
if (customLogoLinkCM) {
	customLogoLinkCM.addEventListener("click", () => {
		document.getElementById("customLogoInput").click();
	});
}

// Compatibility shims for old references
function searchGifs() {
	if (gifSearchInput) searchGifsIn(gifSearchInput, gifResultsContainer,
		_gifDebounceNav, v => _gifDebounceNav = v);
}
function clearGifResults() {
	if (gifResultsContainer) gifResultsContainer.innerHTML = "";
	if (gifResultsContainerCM) gifResultsContainerCM.innerHTML = "";
}

// Download and save the GIF
async function downloadAndSaveGif(gifUrl, gifName) {
	try {
		const response = await fetch(gifUrl);
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		// Trigger download
		const a = document.createElement("a");
		a.href = url;
		a.download = `${gifName || "download"}.gif`;
		a.style.display = "none";
		document.body.appendChild(a);
		a.click();
		a.remove();

		URL.revokeObjectURL(url); // Clean up
	} catch (error) {
		console.error("Error downloading GIF:", error);
	}
}

// ── Video Effects (combined CSS filter) ─────────────────────────────────────
const _vfx = {
	enabled:    true,  // master on/off
	hue:        0,     // degrees
	brightness: 100,   // %
	contrast:   100,   // %
	saturation: 100,   // %
	gamma:      1.0,   // (simulated via brightness for CSS)
	sharpen:    false,
	sharpenAmt: 0,
	blur:       false,
	blurAmt:    0,
	vignette:   false,
	vignetteAmt:0,
	warmth:     0,     // -100 to +100 (applied as sepia + hue twist)
};

// ── FIX 1: Sharpness kernel updater (SVG feConvolveMatrix) ─────────────
function _updateSharpenKernel(amt) {
	// amt: 0–100. Center weight scales with intensity; edges compensate.
	const normalized = Math.min(amt, 100) / 100;      // 0..1
	const center = 1 + normalized * 8;                // 1..9
	const edge   = -((center - 1) / 4);               // 0..-2 (sum stays 1)
	const e = edge.toFixed(4);
	const c = center.toFixed(4);
	const kernel = `0 ${e} 0  ${e} ${c} ${e}  0 ${e} 0`;
	const node = document.getElementById('vfx-sharpen-kernel');
	if (node) {
		node.setAttribute('kernelMatrix', kernel);
		node.setAttribute('divisor', '1');
	}
}

function _applyVideoFilter() {
	// Master toggle — clear all filters when disabled
	if (!_vfx.enabled) {
		video.style.filter = '';
		const wrapper = video.parentElement;
		if (wrapper) wrapper.style.boxShadow = '';
		localStorage.setItem('videoEffects', JSON.stringify(_vfx));
		return;
	}

	// ── FIX 1: Gamma via brightness compensation curve ─────────────────────
	// CSS brightness() is linear; gamma is a power curve. We approximate:
	// gamma < 1 = darker midtones, gamma > 1 = lighter midtones.
	const gamma = typeof _vfx.gamma === 'number' ? _vfx.gamma : 1.0;
	const gammaBrightness = Math.round(Math.pow(gamma, 0.45) * _vfx.brightness);

	let f = [
		`hue-rotate(${_vfx.hue}deg)`,
		`brightness(${gammaBrightness}%)`,
		`contrast(${_vfx.contrast}%)`,
		`saturate(${_vfx.saturation}%)`
	].join(' ');

	// ── Blur ───────────────────────────────────────────────────────────────
	if (_vfx.blur && _vfx.blurAmt > 0) f += ` blur(${_vfx.blurAmt}px)`;

	// ── Warmth: positive = warm (sepia tint), negative = cool ─────────────
	if (_vfx.warmth !== 0) {
		const warmPct = Math.abs(_vfx.warmth);
		if (_vfx.warmth > 0) {
			f += ` sepia(${warmPct * 0.6}%)`;
		} else {
			f += ` hue-rotate(${_vfx.warmth * 0.2}deg) saturate(${100 + warmPct * 0.3}%)`;
		}
	}

	// ── FIX 1: Sharpness via SVG feConvolveMatrix (url reference) ─────────
	// Must come LAST so it sharpens the already colour-corrected image.
	// The SVG filter element is injected into <body> in index.html.
	if (_vfx.sharpen && _vfx.sharpenAmt > 0) {
		_updateSharpenKernel(_vfx.sharpenAmt);
		f += ' url(#vfx-sharpen)';
	}

	video.style.filter = f;

	// ── Vignette: overlay box-shadow on video wrapper ──────────────────────
	const wrapper = video.parentElement;
	if (wrapper) {
		if (_vfx.vignette && _vfx.vignetteAmt > 0) {
			const spread = Math.round(_vfx.vignetteAmt * 1.2);
			wrapper.style.boxShadow = `inset 0 0 ${spread}px ${Math.round(spread * 0.5)}px rgba(0,0,0,0.85)`;
		} else {
			wrapper.style.boxShadow = '';
		}
	}
	localStorage.setItem('videoEffects', JSON.stringify(_vfx));
}

function _loadVideoEffects() {
	try {
		const saved = JSON.parse(localStorage.getItem('videoEffects'));
		if (saved) Object.assign(_vfx, saved);
	} catch(e) {}
	_applyVideoFilter();
	_syncVfxUI();
}

// Sync slider track fill gradient to thumb position
function _syncSliderFill(input) {
	if (!input) return;
	const min = parseFloat(input.min);
	const max = parseFloat(input.max);
	const pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
	input.style.background = `linear-gradient(to right, var(--m-accent) 0%, var(--m-accent) ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`;
}

function _syncVfxUI() {
	const set = (id, val, displayFn) => {
		const el = document.getElementById(id);
		if (el) { el.value = val; _syncSliderFill(el); }
		const vEl = document.getElementById(id.replace('Slider','Value'));
		if (vEl) vEl.textContent = displayFn(val);
	};
	set('hueSlider',        _vfx.hue,                v => `${v}°`);
	set('brightnessSlider', _vfx.brightness,          v => `${v}%`);
	set('contrastSlider',   _vfx.contrast,            v => `${v}%`);
	set('saturationSlider', _vfx.saturation,          v => `${v}%`);
	set('gammaSlider',      Math.round(_vfx.gamma*100), v => (v/100).toFixed(2));
	set('sharpenSlider',    _vfx.sharpenAmt,          v => `${v}`);
	set('blurSlider',       _vfx.blurAmt,             v => `${v}px`);
	set('vignetteSlider',   _vfx.vignetteAmt,         v => `${v}%`);
	set('warmthSlider',     _vfx.warmth,              v => `${v}`);
	const sharpenToggle  = document.getElementById('sharpenToggle');
	const blurToggle     = document.getElementById('blurToggle');
	const vignetteToggle = document.getElementById('vignetteToggle');
	if (sharpenToggle)  sharpenToggle.checked  = _vfx.sharpen;
	if (blurToggle)     blurToggle.checked     = _vfx.blur;
	if (vignetteToggle) vignetteToggle.checked = _vfx.vignette;
	// Sync master toggle
	const mt = document.getElementById('vfxMasterToggle');
	if (mt) mt.checked = _vfx.enabled !== false; // default true
	_updateDepRows();
}

function _updateDepRows() {
	const sharpenRow  = document.getElementById('sharpenRow');
	const blurRow     = document.getElementById('blurRow');
	const vignetteRow = document.getElementById('vignetteRow');
	// CSS sets pointer-events:none on .vfx-dep-row by default —
	// must restore 'auto' here or the slider stays unclickable even when enabled.
	if (sharpenRow)  { sharpenRow.style.opacity  = _vfx.sharpen  ? '1' : '0.4'; sharpenRow.style.pointerEvents  = _vfx.sharpen  ? 'auto' : 'none'; }
	if (blurRow)     { blurRow.style.opacity     = _vfx.blur     ? '1' : '0.4'; blurRow.style.pointerEvents     = _vfx.blur     ? 'auto' : 'none'; }
	if (vignetteRow) { vignetteRow.style.opacity = _vfx.vignette ? '1' : '0.4'; vignetteRow.style.pointerEvents = _vfx.vignette ? 'auto' : 'none'; }
}

// Legacy compat — called by old code
function applySaturationToVideo(value) { _vfx.saturation = value; _applyVideoFilter(); }
function updateSaturation(value) {
	const el = document.getElementById('saturationValue');
	if (el) el.textContent = value + '%';
	applySaturationToVideo(value);
}
function loadSaturationValue() { _loadVideoEffects(); }

// ── Update status helpers — module-scope so all DOMContentLoaded blocks can reach them ──
let _updateCheckTimer = null;
function _setUpdateStatus(cls, html) {
	const statusEl = document.getElementById('aboutUpdateStatus');
	const iconEl   = document.getElementById('aboutUpdateIcon');
	if (statusEl) { statusEl.className = `about-update-status ${cls}`; statusEl.innerHTML = html; }
	if (iconEl)   iconEl.classList.remove('fa-spin');
	if (_updateCheckTimer) { clearTimeout(_updateCheckTimer); _updateCheckTimer = null; }
}

// Slider input events
document.addEventListener('DOMContentLoaded', () => {
	const sliderMap = [
		{ id: 'hueSlider',        key: 'hue',        fmt: v => `${v}°`,           valId: 'hueValue' },
		{ id: 'brightnessSlider', key: 'brightness',  fmt: v => `${v}%`,           valId: 'brightnessValue' },
		{ id: 'contrastSlider',   key: 'contrast',    fmt: v => `${v}%`,           valId: 'contrastValue' },
		{ id: 'saturationSlider', key: 'saturation',  fmt: v => `${v}%`,           valId: 'saturationValue' },
		{ id: 'gammaSlider',      key: 'gamma',       fmt: v => (v/100).toFixed(2),valId: 'gammaValue', transform: v => v/100 },
		{ id: 'sharpenSlider',    key: 'sharpenAmt',  fmt: v => `${v}`,            valId: 'sharpenValue' },
		{ id: 'blurSlider',       key: 'blurAmt',     fmt: v => `${v}px`,          valId: 'blurValue' },
		{ id: 'vignetteSlider',   key: 'vignetteAmt', fmt: v => `${v}%`,           valId: 'vignetteValue' },
		{ id: 'warmthSlider',     key: 'warmth',      fmt: v => `${v}`,            valId: 'warmthValue' },
	];
	sliderMap.forEach(({ id, key, fmt, valId, transform }) => {
		const el = document.getElementById(id);
		if (!el) return;
		el.addEventListener('input', () => {
			const raw = parseFloat(el.value);
			_vfx[key] = transform ? transform(raw) : raw;
			const vEl = document.getElementById(valId);
			if (vEl) vEl.textContent = fmt(raw);
			_applyVideoFilter();
		});
		el.addEventListener('click', e => e.stopPropagation());
		el.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
	});

	// Toggle checkboxes
	const sharpenToggle  = document.getElementById('sharpenToggle');
	const blurToggle     = document.getElementById('blurToggle');
	const vignetteToggle = document.getElementById('vignetteToggle');
	if (sharpenToggle)  sharpenToggle.addEventListener('change', () => { _vfx.sharpen = sharpenToggle.checked; _updateDepRows(); _applyVideoFilter(); });
	if (blurToggle)     blurToggle.addEventListener('change', ()    => { _vfx.blur    = blurToggle.checked;    _updateDepRows(); _applyVideoFilter(); });
	if (vignetteToggle) vignetteToggle.addEventListener('change', () => { _vfx.vignette = vignetteToggle.checked; _updateDepRows(); _applyVideoFilter(); });

	// Reset individual sliders
	document.querySelectorAll('.tme-reset-btn, .vfx-reset').forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const targetId = btn.dataset.target;
			const def      = parseFloat(btn.dataset.default);
			const el = document.getElementById(targetId);
			if (el) { el.value = def; el.dispatchEvent(new Event('input')); }
		});
	});

	// Reset All button
	const resetAllBtn = document.getElementById('videoEffectsResetAll');
	if (resetAllBtn) resetAllBtn.addEventListener('click', () => {
		Object.assign(_vfx, { hue:0, brightness:100, contrast:100, saturation:100, gamma:1.0, sharpen:false, sharpenAmt:0, blur:false, blurAmt:0, vignette:false, vignetteAmt:0, warmth:0 });
		_applyVideoFilter();
		_syncVfxUI();
		// Reset rotation state
		Object.assign(_rotState, { rotate: 0, flipH: false, flipV: false, aspect: 'auto' });
		document.querySelectorAll('.vfx-rot-btn[data-rotate]').forEach(b => b.classList.toggle('active', b.dataset.rotate === '0'));
		if (document.getElementById('rot-flipH')) document.getElementById('rot-flipH').classList.remove('active');
		if (document.getElementById('rot-flipV')) document.getElementById('rot-flipV').classList.remove('active');
		document.querySelectorAll('.vfx-rot-btn[data-aspect]').forEach(b => b.classList.toggle('active', b.dataset.aspect === 'auto'));
		_applyRotation();
		// Reset presets — mark Default as active
		document.querySelectorAll('.vfx-preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === 'Default'));
		// Sync master toggle
		const mt = document.getElementById('vfxMasterToggle');
		if (mt && !mt.checked) { mt.checked = true; _vfx.enabled = true; }
		showStatusMessage('Effects reset');
	});

	// Open Video Effects Modal
	const openVeBtn = document.getElementById('openVideoEffectsBtn');
	if (openVeBtn) openVeBtn.addEventListener('click', () => toggleToolModal('videoEffectsModal'));

	// Close buttons
	['videoEffectsClose','videoEffectsClose2'].forEach(id => {
		const b = document.getElementById(id);
		if (b) b.addEventListener('click', () => { ModalAnimator.close(document.getElementById('videoEffectsModal')); });
	});

	// Load saved values
	_loadVideoEffects();
});

// ── Tool Modal helper ──────────────────────────────────────────────────
function toggleToolModal(id) {
	const m = document.getElementById(id);
	if (!m) return;

	const MODAL_IDS = ['videoEffectsModal', 'syncToolModal', 'aboutModal'];
	const isOpen = m.classList.contains('show') || ModalAnimator.isOpen(m);

	// Find any currently open sibling modal
	const currentlyOpen = MODAL_IDS
		.filter(mid => mid !== id)
		.map(mid => document.getElementById(mid))
		.find(mm => mm && (mm.classList.contains('show') || ModalAnimator.isOpen(mm)));

	if (currentlyOpen && !isOpen) {
		// ── Smooth switch: keep backdrop, cross-fade content only ──
		const oldInner = currentlyOpen.querySelector('.tool-modal-inner');
		const newInner = m.querySelector('.tool-modal-inner');

		// Show the new modal overlay (reuse backdrop from old one)
		// Step 1: Animate old inner out
		if (oldInner) {
			oldInner.classList.add('modal-switch-out');
		}

		// Step 2: After out animation, hide old modal, show new one
		setTimeout(() => {
			// Hide old
			currentlyOpen.classList.remove('show');
			currentlyOpen.style.display = 'none';
			currentlyOpen.style.pointerEvents = 'none';
			if (oldInner) oldInner.classList.remove('modal-switch-out', 'closing');
			ModalAnimator.activeModals.delete(currentlyOpen);

			// Show new modal
			m.classList.remove('hidden', 'closing');
			m.classList.add('show');
			m.style.display = 'flex';
			m.style.pointerEvents = 'auto';
			ModalAnimator.activeModals.set(m, { isOpen: true, clickPoint: { x: window.innerWidth / 2, y: window.innerHeight / 2 } });

			// Animate new inner in
			if (newInner) {
				newInner.classList.remove('closing', 'modal-switch-out');
				newInner.style.animation = 'none';
				void newInner.offsetWidth;
				newInner.style.animation = '';
				newInner.classList.add('modal-switch-in');
				setTimeout(() => newInner.classList.remove('modal-switch-in'), 300);
			}
		}, 160);

	} else {
		// Normal open/close (no sibling open)
		if (isOpen) {
			ModalAnimator.close(m);
		} else {
			// Close any others first (shouldn't normally be open, but safety net)
			MODAL_IDS.forEach(mid => {
				if (mid === id) return;
				const mm = document.getElementById(mid);
				if (mm && (mm.classList.contains('show') || ModalAnimator.isOpen(mm))) {
					ModalAnimator.close(mm);
				}
			});
			ModalAnimator.open(m);
		}
	}
}

// ── Sync Tool ─────────────────────────────────────────────────────────
let _audioDelay    = 0;   // seconds (applied to audio track delay)
let _subDelay      = 0;   // seconds (subtitle cue offset)
let _subSpeed      = 1.0; // subtitle speed factor
let _videoOffset   = 0;   // seconds (video offset, limited use in HTML5)

function adjustAudioDelay(delta) {
	_audioDelay = Math.round((_audioDelay + delta) * 1000) / 1000;
	const el = document.getElementById('audioDelayVal');
	if (el) el.textContent = _audioDelay.toFixed(3);
	// Apply to audioTrackPlayer if it exists
	const atp = document.getElementById('audioTrackPlayer');
	if (atp && video) {
		const targetTime = video.currentTime - _audioDelay;
		if (isFinite(targetTime) && targetTime >= 0) atp.currentTime = Math.max(0, targetTime);
	}
	showStatusMessage(`Audio delay: ${_audioDelay > 0 ? '+' : ''}${_audioDelay.toFixed(3)}s`);
}

// Replace adjustSubtitleDelay()
function adjustSubtitleDelay(delta) {
	_subDelay = Math.round((_subDelay + delta) * 1000) / 1000;
	const el = document.getElementById('subDelayVal');
	if (el) el.textContent = _subDelay.toFixed(3);

	// Apply offset to all active cues on the current track
	const track = Array.from(video.textTracks)[currentSubtitleIndex];
	if (track && track.cues) {
		for (let c = 0; c < track.cues.length; c++) {
			const cue = track.cues[c];
		  if (cue._origStart === undefined) { cue._origStart = cue.startTime; cue._origEnd = cue.endTime; }
		  cue.startTime = cue._origStart + _subDelay;
		  cue.endTime = cue._origEnd + _subDelay;
	  }
  }

	// Persist so it survives track switches for the same file
	const _subDelayKey = 'subDelay:' + (mediaFiles[currentVideoIndex] || '');
	try { localStorage.setItem(_subDelayKey, _subDelay); } catch { }

	showStatusMessage(`Subtitle delay: ${_subDelay > 0 ? '+' : ''}${_subDelay.toFixed(3)}s`);
}

// Replace switchSubtitleTrack() — add delay restore after activation
function switchSubtitleTrack(index) {
	currentSubtitleIndex = index;
	_subtitleTeardown();

	const _subKey = 'lastSub:' + (mediaFiles[currentVideoIndex] || '');
	try { localStorage.setItem(_subKey, index); } catch { }

	document.querySelectorAll('.subtitle-item').forEach(el =>
		el.classList.toggle('active', parseInt(el.dataset.index) === index)
	);

	if (index === -1) {
		showStatusMessage('Subtitles Off');
		return;
	}

	const track = Array.from(video.textTracks)[index];
	if (!track) {
		console.warn('[Sub] No textTrack at index', index);
		return;
	}

	track.mode = 'hidden';
	_subTrack = track;

	function _afterActivate() {
		// Restore saved subtitle delay for this file
		const _subDelayKey = 'subDelay:' + (mediaFiles[currentVideoIndex] || '');
		try {
			const saved = parseFloat(localStorage.getItem(_subDelayKey));
			if (!isNaN(saved) && saved !== 0) {
				_subDelay = 0; // start from 0 so adjustSubtitleDelay applies the full delta
				adjustSubtitleDelay(saved);
				const el = document.getElementById('subDelayVal');
				if (el) el.textContent = _subDelay.toFixed(3);
			}
		} catch { }
	}

	if (track.cues && track.cues.length > 0) {
		_attachSubtitleListeners(track);
		_afterActivate();
		showStatusMessage('Subtitle: ' + (track.label || `Track ${index + 1}`));
		return;
	}

	let waited = 0;
	_subReadyTimer = setInterval(() => {
		waited += 80;
		if (track.cues && track.cues.length > 0) {
			clearInterval(_subReadyTimer);
			_subReadyTimer = null;
			_attachSubtitleListeners(track);
			_afterActivate();
			showStatusMessage('Subtitle: ' + (track.label || `Track ${index + 1}`));
		} else if (waited >= 5000) {
			clearInterval(_subReadyTimer);
			_subReadyTimer = null;
			console.warn('[Sub] Cues never loaded for track', index);
			showStatusMessage('Subtitle: no cues found');
		}
	}, 80);
}

// Replace stopPlayback() — add _subDelay reset
function stopPlayback() {
	video.pause();
	stopExternalAudio();
	video.style.display = "none";
	updateVideoTitle(video.dataset.videoId);
	updatePlayPauseIcon(false);
	playedVideos = [];
	video.currentTime = 0;
	updateSeekBar();
	currentTimeDisplay.textContent = formatTime(0);
	seekBar.style.width = `0%`;
	seekBarHandle.style.left = `0%`;
	audioImage.style.display = "none";
	document.getElementById("audioLogo").style.display = "none";
	stopGifPlayback();
	updateNavigationButtons();

	// Reset subtitle delay state
	_subDelay = 0;
	const el = document.getElementById('subDelayVal');
	if (el) el.textContent = '0.000';

	const cleanupPromise = window.electron.invoke('cleanup-subtitles');
	if (cleanupPromise && typeof cleanupPromise.catch === 'function') {
		cleanupPromise.catch(e => console.warn('Subtitle cleanup:', e));
	}
}

document.addEventListener('DOMContentLoaded', () => {
	// Sync tool open
	const openSyncBtn = document.getElementById('openSyncToolBtn');
	if (openSyncBtn) openSyncBtn.addEventListener('click', () => toggleToolModal('syncToolModal'));

	// Sync tool close
	['syncToolClose','syncToolClose2'].forEach(id => {
		const b = document.getElementById(id);
		if (b) b.addEventListener('click', () => { ModalAnimator.close(document.getElementById('syncToolModal')); });
	});

	// Sync tabs
	document.querySelectorAll('.sync-tab').forEach(tab => {
		tab.addEventListener('click', () => {
			document.querySelectorAll('.sync-tab').forEach(t => t.classList.remove('active'));
			document.querySelectorAll('.sync-pane').forEach(p => p.classList.remove('active'));
			tab.classList.add('active');
			const pane = document.getElementById('syncPane-' + tab.dataset.tab);
			if (pane) pane.classList.add('active');
		});
	});

	// Unified sync button handler — covers ctrl-btn, chip, and legacy spin-btn
	function _applySyncDelta(targetId, delta) {
		const el = document.getElementById(targetId);
		if (!el) return;
		let val = parseFloat(el.textContent) + delta;
		val = Math.round(val * 1000) / 1000;
		if (targetId === 'audioDelayVal') { _audioDelay = val; adjustAudioDelay(0); el.textContent = _audioDelay.toFixed(3); }
		else if (targetId === 'subDelayVal')   { _subDelay = val - delta; adjustSubtitleDelay(delta); }
		else if (targetId === 'videoOffsetVal'){ _videoOffset = val; el.textContent = val.toFixed(3); }
		else if (targetId === 'subSpeedVal')   { _subSpeed = Math.max(0.1, val); el.textContent = _subSpeed.toFixed(3); }
		else { el.textContent = val.toFixed(3); }
	}

	// Handle "0" chip as a reset for that specific value
	document.querySelectorAll('.sync-chip--mid').forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			// Find the nearest card, reset all val displays
			const pane = btn.closest('.sync-pane');
			if (!pane) return;
			const valEls = pane.querySelectorAll('.sync-display-val');
			valEls.forEach(el => {
				const id = el.id;
				if (id === 'audioDelayVal')  { _audioDelay = 0; adjustAudioDelay(0); el.textContent = '0.000'; }
				else if (id === 'subDelayVal')    { _subDelay = 0; el.textContent = '0.000'; }
				else if (id === 'videoOffsetVal') { _videoOffset = 0; el.textContent = '0.000'; }
			});
		});
	});

	document.querySelectorAll('.sync-ctrl-btn, .sync-chip:not(.sync-chip--mid), .sync-spin-btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const targetId = btn.dataset.target;
			const delta    = parseFloat(btn.dataset.delta);
			if (!targetId || isNaN(delta)) return;
			_applySyncDelta(targetId, delta);
		});
	});

	// Sync reset all
	const syncResetBtn = document.getElementById('syncResetBtn');
	if (syncResetBtn) syncResetBtn.addEventListener('click', () => {
		_audioDelay = 0; _subDelay = 0; _videoOffset = 0; _subSpeed = 1.0;
		const ids = { audioDelayVal:'0.000', videoOffsetVal:'0.000', subDelayVal:'0.000', subSpeedVal:'1.000' };
		Object.entries(ids).forEach(([id, v]) => { const el=document.getElementById(id); if(el) el.textContent=v; });
		showStatusMessage('Sync reset');
	});

	// VFX tab switching
	document.querySelectorAll('.vfx-tab').forEach(tab => {
		tab.addEventListener('click', () => {
			document.querySelectorAll('.vfx-tab').forEach(t => t.classList.remove('active'));
			document.querySelectorAll('.vfx-pane').forEach(p => p.classList.remove('active'));
			tab.classList.add('active');
			const pane = document.getElementById('vfxPane-' + tab.dataset.vfxTab);
			if (pane) pane.classList.add('active');
		});
	});

	// ── VFX Master Toggle (enable / disable all effects) ──────────────────────
	const vfxMasterToggle = document.getElementById('vfxMasterToggle');
	if (vfxMasterToggle) {
		vfxMasterToggle.addEventListener('change', () => {
			_vfx.enabled = vfxMasterToggle.checked;
			_applyVideoFilter();
			console.log('[VFX] master enabled:', _vfx.enabled);
		});
	}

	// ── VFX Presets ────────────────────────────────────────────────────────────
	const VFX_PRESETS = {
		Default: { hue: 0,  brightness: 100, contrast: 100, saturation: 100, gamma: 1.00, warmth: 0 },
		Vivid:   { hue: 0,  brightness: 108, contrast: 115, saturation: 140, gamma: 1.00, warmth: 10 },
		Night:   { hue: 0,  brightness: 75,  contrast: 90,  saturation: 80,  gamma: 0.85, warmth: -20 },
		Warm:    { hue: 5,  brightness: 102, contrast: 100, saturation: 105, gamma: 1.00, warmth: 45 },
		Retro:   { hue: 15, brightness: 95,  contrast: 110, saturation: 70,  gamma: 0.90, warmth: 20 },
	};

	function _applyVfxPreset(name) {
		const p = VFX_PRESETS[name];
		if (!p) return;
		// Apply to state
		_vfx.hue        = p.hue;
		_vfx.brightness = p.brightness;
		_vfx.contrast   = p.contrast;
		_vfx.saturation = p.saturation;
		_vfx.gamma      = p.gamma;
		_vfx.warmth     = p.warmth;
		// Sync sliders
		function setSlider(id, val, fmtFn, valId) {
			const el = document.getElementById(id);
			if (el) { el.value = val; _syncSliderFill(el); }
			const vEl = document.getElementById(valId);
			if (vEl) vEl.textContent = fmtFn(val);
		}
		setSlider('hueSlider',        p.hue,                v => `${v}°`,            'hueValue');
		setSlider('brightnessSlider', p.brightness,          v => `${v}%`,            'brightnessValue');
		setSlider('contrastSlider',   p.contrast,            v => `${v}%`,            'contrastValue');
		setSlider('saturationSlider', p.saturation,          v => `${v}%`,            'saturationValue');
		setSlider('gammaSlider',      Math.round(p.gamma*100), v => (v/100).toFixed(2), 'gammaValue');
		setSlider('warmthSlider',     p.warmth,              v => `${v}`,             'warmthValue');
		_applyVideoFilter();
		// Update active preset button
		document.querySelectorAll('.vfx-preset-btn').forEach(b => {
			b.classList.toggle('active', b.dataset.preset === name);
		});
		console.log('[VFX] preset applied:', name, p);
	}

	document.querySelectorAll('.vfx-preset-btn').forEach(btn => {
		btn.addEventListener('click', () => _applyVfxPreset(btn.dataset.preset));
	});

	// Initialize fills for all vfx sliders on open
	document.querySelectorAll('.vfx-slider').forEach(s => _syncSliderFill(s));
	document.querySelectorAll('.vfx-slider').forEach(s => {
		s.addEventListener('input', () => {
			_syncSliderFill(s);
			// Mark preset as custom
			document.querySelectorAll('.vfx-preset-btn').forEach(b => b.classList.remove('active'));
		});
	});

	// ── Rotation Pane ──────────────────────────────────────────────────────────
	const _rotState = { rotate: 0, flipH: false, flipV: false, aspect: 'auto' };

	function _applyRotation() {
		const video = document.getElementById('video') || document.querySelector('video');
		if (!video) return;
		let transform = '';
		if (_rotState.flipH) transform += 'scaleX(-1) ';
		if (_rotState.flipV) transform += 'scaleY(-1) ';
		transform += `rotate(${_rotState.rotate}deg)`;
		// Merge with existing scale/pan if available
		const existingTransform = video.style.transform || '';
		const rotPattern = /rotate\([^)]*\)/g;
		const scaleXPattern = /scaleX\([^)]*\)/g;
		const scaleYPattern = /scaleY\([^)]*\)/g;
		// Build clean transform string keeping zoom/pan but replacing rotation+flip
		let cleanExisting = existingTransform
			.replace(rotPattern, '')
			.replace(scaleXPattern, '')
			.replace(scaleYPattern, '')
			.trim();
		video.style.transform = (transform + ' ' + cleanExisting).trim();
		console.log('[Rotation] rotate:', _rotState.rotate, 'flipH:', _rotState.flipH, 'flipV:', _rotState.flipV);
	}

	// Rotate buttons
	document.querySelectorAll('.vfx-rot-btn[data-rotate]').forEach(btn => {
		btn.addEventListener('click', () => {
			document.querySelectorAll('.vfx-rot-btn[data-rotate]').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			_rotState.rotate = parseInt(btn.dataset.rotate);
			_applyRotation();
		});
	});

	// Flip buttons
	const flipHBtn = document.getElementById('rot-flipH');
	const flipVBtn = document.getElementById('rot-flipV');
	if (flipHBtn) {
		flipHBtn.addEventListener('click', () => {
			_rotState.flipH = !_rotState.flipH;
			flipHBtn.classList.toggle('active', _rotState.flipH);
			_applyRotation();
		});
	}
	if (flipVBtn) {
		flipVBtn.addEventListener('click', () => {
			_rotState.flipV = !_rotState.flipV;
			flipVBtn.classList.toggle('active', _rotState.flipV);
			_applyRotation();
		});
	}

	// Aspect ratio buttons
	document.querySelectorAll('.vfx-rot-btn[data-aspect]').forEach(btn => {
		btn.addEventListener('click', () => {
			document.querySelectorAll('.vfx-rot-btn[data-aspect]').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			_rotState.aspect = btn.dataset.aspect;
			const video = document.getElementById('video') || document.querySelector('video');
			if (video) {
				const aspectMap = { '16-9': '16/9', '4-3': '4/3', '21-9': '21/9', 'auto': 'auto' };
				video.style.aspectRatio = aspectMap[_rotState.aspect] || 'auto';
			}
			console.log('[Aspect]', _rotState.aspect);
		});
	});

	// ── New Track Sync Card Logic ───────────────────────────────────────────────
	// Display value with color coding
	function _syncUpdateDisplay(id, val) {
		const el = document.getElementById(id);
		if (!el) return;
		el.textContent = val.toFixed(3);
		el.classList.remove('positive', 'negative');
		if (val > 0)  el.classList.add('positive');
		if (val < 0)  el.classList.add('negative');
	}

	const _syncVals = { audioDelayVal: 0, subDelayVal: 0 };

	// Nudge chip + ± ctrl buttons (new card design)
	document.querySelectorAll('.sync-track-card .sync-ctrl-btn, .sync-track-card .sync-chip[data-target]').forEach(btn => {
		btn.addEventListener('click', () => {
			const targetId = btn.dataset.target;
			if (!targetId || !(targetId in _syncVals)) return;
			const delta = parseFloat(btn.dataset.delta || 0);
			_syncVals[targetId] = parseFloat((_syncVals[targetId] + delta).toFixed(3));
			_syncUpdateDisplay(targetId, _syncVals[targetId]);
			console.log('[Sync]', targetId, '=', _syncVals[targetId], 's');
		});
	});

	// Reset individual track card
	document.querySelectorAll('.sync-reset-btn[data-reset]').forEach(btn => {
		btn.addEventListener('click', () => {
			const targetId = btn.dataset.reset;
			if (targetId in _syncVals) {
				_syncVals[targetId] = 0;
				_syncUpdateDisplay(targetId, 0);
				console.log('[Sync] reset:', targetId);
			}
		});
	});

	// Apply Changes button
	const syncApplyBtn = document.getElementById('syncApplyBtn');
	if (syncApplyBtn) {
		syncApplyBtn.addEventListener('click', () => {
			console.log('[Sync] Apply — audio:', _syncVals.audioDelayVal, 's, sub:', _syncVals.subDelayVal, 's');
			const orig = syncApplyBtn.textContent;
			syncApplyBtn.textContent = '✓ Applied!';
			syncApplyBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
			setTimeout(() => {
				syncApplyBtn.textContent = orig;
				syncApplyBtn.style.background = '';
			}, 1400);
			showStatusMessage('Sync applied');
		});
	}

	// Close handler for new sync modal (backward compat with old syncToolClose2 id gone)
	const syncClose = document.getElementById('syncToolClose');
	if (syncClose) {
		syncClose.addEventListener('click', () => { ModalAnimator.close(document.getElementById('syncToolModal')); });
	}

	// ── About modal ────────────────────────────────────────────────────────────
	const aboutBtn = document.getElementById('showAboutBtn');

	// Load app info into about modal — uses cached data so returns instantly
	async function loadAboutInfo() {
		if (!window.electron || !window.electron.getAppInfo) return;
		try {
			const info = await window.electron.getAppInfo();

			// Version badge
			const versionEl = document.getElementById('aboutVersionLabel');
			if (versionEl) versionEl.textContent = `v${info.version}`;

			// Platform badge
			const platformEl = document.getElementById('aboutPlatformBadge');
			if (platformEl) {
				const icons = { Windows: '🪟', macOS: '🍎', Linux: '🐧' };
				platformEl.textContent = `${icons[info.platformName] || '💻'} ${info.platformName}`;
			}

			// Architecture badge
			const archEl = document.getElementById('aboutArchBadge');
			if (archEl) archEl.textContent = info.arch;

			// OS — uses proper marketing name (Windows 11, not 10.x)
			const osEl = document.getElementById('aboutOsValue');
			if (osEl) osEl.textContent = info.osDisplay || `${info.platformName}`;

			// GPU
			const gpuEl = document.getElementById('aboutGpuValue');
			if (gpuEl) gpuEl.textContent = info.gpuName || 'Unknown';

			// HW Accel
			const hwEl = document.getElementById('aboutHwAccelValue');
			if (hwEl) hwEl.textContent = info.hwAccel !== 'none' ? info.hwAccel : 'None (software)';

			// Copyright year — always current
			const copyEl = document.getElementById('aboutCopyYear');
			if (copyEl) copyEl.textContent = `© ${info.copyrightYear || new Date().getFullYear()} animeredits — MIT License`;

		} catch (e) {
			console.warn('Could not load app info:', e);
		}
	}

	if (aboutBtn) aboutBtn.addEventListener('click', () => {
		// Clear any stale update status and cancel pending timer on open
		if (_updateCheckTimer) { clearTimeout(_updateCheckTimer); _updateCheckTimer = null; }
		const statusEl = document.getElementById('aboutUpdateStatus');
		if (statusEl && statusEl.classList.contains('about-update-status--checking')) {
			statusEl.className = 'about-update-status';
			statusEl.innerHTML = '';
		}
		const iconEl = document.getElementById('aboutUpdateIcon');
		if (iconEl) iconEl.classList.remove('fa-spin');
		toggleToolModal('aboutModal');
		loadAboutInfo();
	});

	['aboutClose','aboutClose2'].forEach(id => {
		const b = document.getElementById(id);
		if (b) b.addEventListener('click', () => { ModalAnimator.close(document.getElementById('aboutModal')); });
	});

	// Check for updates — real-time status in about modal
	// ── Update check with guaranteed timeout ─────────────────────────────────
	// Check for updates — NOTE: _updateCheckTimer and _setUpdateStatus are module-scoped above
	['checkUpdateBtn','aboutCheckUpdate'].forEach(id => {
		const b = document.getElementById(id);
		if (b) b.addEventListener('click', () => {
			const statusEl = document.getElementById('aboutUpdateStatus');
			const iconEl   = document.getElementById('aboutUpdateIcon');
			const aboutModal = document.getElementById('aboutModal');

			if (aboutModal && !aboutModal.classList.contains('show') && !ModalAnimator.isOpen(aboutModal)) {
				toggleToolModal('aboutModal');
			}

			if (statusEl) {
				statusEl.className = 'about-update-status about-update-status--checking';
				statusEl.innerHTML = '<img class="svg-icon fa-spin" src="../../assets/icons/fa/circle-notch.svg" alt=""> Checking for updates…';
			}
			if (iconEl) iconEl.classList.add('fa-spin');
			showStatusMessage('Checking for updates…');

			// Clear any previous pending timeout
			if (_updateCheckTimer) { clearTimeout(_updateCheckTimer); _updateCheckTimer = null; }

			// Safety net: if no IPC response within 8 s, show timeout status instead of "up to date"
			_updateCheckTimer = setTimeout(() => {
				const el = document.getElementById('aboutUpdateStatus');
				if (el && el.classList.contains('about-update-status--checking')) {
					_setUpdateStatus(
						'about-update-status--error',
						'<img class="svg-icon" src="../../assets/icons/fa/triangle-exclamation.svg" alt=""> Update check timed out — try again.'
					);
					showStatusMessage('Update check timed out. Please try again.', 5000);
				}
				_updateCheckTimer = null;
			}, 8000);

			if (window.electron && window.electron.checkForUpdates) {
				window.electron.checkForUpdates();
			}
		});
	});

	// Close tool modals when clicking backdrop
	['videoEffectsModal','syncToolModal','aboutModal'].forEach(id => {
		const m = document.getElementById(id);
		if (!m) return;
		m.addEventListener('click', (e) => {
			if (e.target === m) ModalAnimator.close(m);
		});
	});

	// Stop keydown propagation inside tool modals
	['videoEffectsModal','syncToolModal','aboutModal','renameFileModal'].forEach(id => {
		const m = document.getElementById(id);
		if (!m) return;
		m.addEventListener('keydown', e => e.stopPropagation());
	});

	// ── Rename File Modal ────────────────────────────────────────────────────
	const navRenameBtn     = document.getElementById('navRenameFileBtn');
	const contextRenameBtn = document.getElementById('contextRenameFile');
	const renameModalClose = document.getElementById('renameModalClose');
	const renameCancelBtn  = document.getElementById('renameCancelBtn');
	const renameConfirmBtn = document.getElementById('renameConfirmBtn');
	const renameInput      = document.getElementById('renameInput');
	const renameClearBtn   = document.getElementById('renameClearBtn');
	const renameCharCount  = document.getElementById('renameCharCount');
	const renameCurrentName= document.getElementById('renameCurrentName');

	function _updateRenameInputState() {
		if (!renameInput) return;
		const len  = renameInput.value.length;
		const wrap = renameInput.closest('.rename-input-wrap');
		// Toggle has-value class to show/hide clear button
		if (wrap) wrap.classList.toggle('has-value', len > 0);
		// Character counter — only show when something typed
		if (renameCharCount) {
			renameCharCount.textContent = len > 0 ? len : '';
			renameCharCount.className = 'rename-char-count' +
				(len > 180 ? ' over' : len > 140 ? ' warn' : '');
		}
	}

	if (renameInput) renameInput.addEventListener('input', _updateRenameInputState);

	// Clear button wipes the input and re-focuses
	if (renameClearBtn) {
		renameClearBtn.addEventListener('click', () => {
			if (!renameInput) return;
			renameInput.value = '';
			_updateRenameInputState();
			renameInput.focus();
		});
	}

	// ── Snapshot: path captured when modal opens — immune to track changes ─────
	let _renameSnapshotPath  = null;
	let _renameSnapshotIndex = -1;

	function _loadRenameThumbnail() {
		const thumbEl  = document.getElementById('renameThumbnail');
		const heroIcon = document.getElementById('renameHeroIcon');
		if (!thumbEl || !heroIcon) return;

		// Helper: apply a src and switch to thumbnail mode
		function _applyThumb(src) {
			if (!src) { _clearThumb(); return; }
			thumbEl.src = src;
			thumbEl.style.display = 'block';
			heroIcon.classList.add('has-thumbnail');
		}
		function _clearThumb() {
			thumbEl.src = '';
			thumbEl.style.display = 'none';
			heroIcon.classList.remove('has-thumbnail');
		}

		// 1) Video element has a visible frame → grab it from canvas
		if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
			try {
				const W  = 112;
				const H  = Math.round(video.videoHeight * (W / video.videoWidth)) || 112;
				const cv = document.createElement('canvas');
				cv.width = W; cv.height = H;
				cv.getContext('2d').drawImage(video, 0, 0, W, H);
				_applyThumb(cv.toDataURL('image/jpeg', 0.85));
				return;
			} catch (_) { /* fall through */ }
		}

		// 2) Audio-only file — use the audioImage logo/artwork if it has a real src
		const aiSrc = audioImage && audioImage.src &&
			!audioImage.src.endsWith('/') &&
			audioImage.style.display !== 'none'
				? audioImage.src : null;
		if (aiSrc) { _applyThumb(aiSrc); return; }

		// 3) No artwork available — show fallback icon
		_clearThumb();
	}

	function openRenameModal() {
		if (!mediaFiles[currentVideoIndex]) {
			showStatusMessage('No file loaded to rename');
			return;
		}

		// ── Snapshot the target file right now ──────────────────────────────
		_renameSnapshotPath  = mediaFiles[currentVideoIndex];
		_renameSnapshotIndex = currentVideoIndex;

		const currentName = _renameSnapshotPath.split(/[/\\]/).pop();
		const stem        = currentName.includes('.')
			? currentName.slice(0, currentName.lastIndexOf('.'))
			: currentName;

		if (renameCurrentName) renameCurrentName.textContent = currentName;

		if (renameInput) {
			renameInput.value = stem;
			_updateRenameInputState();
		}

		// Populate thumbnail from current playback frame / artwork
		_loadRenameThumbnail();

		toggleToolModal('renameFileModal');
		setTimeout(() => { if (renameInput) { renameInput.focus(); renameInput.select(); } }, 90);
	}

	async function executeRename() {
		if (!renameInput) return;
		const newName = renameInput.value.trim();
		if (!newName) { showStatusMessage('Name cannot be empty'); return; }

		// ── Always operate on the snapshot path, not the live index ─────────
		const oldPath      = _renameSnapshotPath;
		const snapshotIdx  = _renameSnapshotIndex;
		if (!oldPath) return;

		try {
			const result = await window.electron.renameFile(oldPath, newName);
			if (result.success) {
				const newPath   = result.newPath;
				const finalName = result.newName;

				// Update the playlist entry that was renamed (by snapshot index)
				if (mediaFiles[snapshotIdx] === oldPath) {
					mediaFiles[snapshotIdx] = newPath;
				} else {
					// File may have shifted in the array (e.g. auto-advance) — find it
					const idx = mediaFiles.indexOf(oldPath);
					if (idx !== -1) mediaFiles[idx] = newPath;
				}

				// Only update the title display if it's still the active video
				if (currentVideoPath === oldPath || mediaFiles[currentVideoIndex] === newPath) {
					video.dataset.videoId = finalName;
					updateVideoTitle(finalName);
				}

				updatePlaylistDropdown(mediaFiles);
				highlightCurrentVideo(mediaFiles[currentVideoIndex]);

				ModalAnimator.close(document.getElementById('renameFileModal'));
				showStatusMessage(`✓ Renamed → ${finalName}`);

				// Clear snapshot
				_renameSnapshotPath  = null;
				_renameSnapshotIndex = -1;
			}
		} catch (err) {
			showStatusMessage(`Rename failed: ${err.message || err}`);
		}
	}

	if (navRenameBtn)     navRenameBtn.addEventListener('click', openRenameModal);
	if (contextRenameBtn) contextRenameBtn.addEventListener('click', () => {
		const cm = document.getElementById('contextMenu');
		if (cm) cm.style.display = 'none';
		openRenameModal();
	});
	if (renameModalClose) renameModalClose.addEventListener('click', () => ModalAnimator.close(document.getElementById('renameFileModal')));
	if (renameCancelBtn)  renameCancelBtn.addEventListener('click',  () => ModalAnimator.close(document.getElementById('renameFileModal')));
	if (renameConfirmBtn) renameConfirmBtn.addEventListener('click',  executeRename);
	if (renameInput) {
		renameInput.addEventListener('keydown', e => {
			if (e.key === 'Enter') { e.preventDefault(); executeRename(); }
		});
		// ── FIX 3: Prevent double-click inside rename input from bubbling ──
		// to mediaPlayer dblclick → toggleFullScreen handler.
		renameInput.addEventListener('dblclick', e => { e.stopPropagation(); });
	}
	// ── FIX 3: Belt-and-suspenders: catch any dblclick inside the modal ──
	const _renameModal = document.getElementById('renameFileModal');
	if (_renameModal) {
		_renameModal.addEventListener('dblclick', e => { e.stopPropagation(); });
	}
});

 const ModalAnimator = {
        activeModals: new Map(),
        config: {
          openDuration: 280,   // ── FIX 4: match modalContentIn CSS duration
          closeDuration: 220,  // ── FIX 4: match modalContentOut CSS duration
          overlayDuration: 200
        },

        open(modalElement, options = {}) {
          if (!modalElement) return;
          this.activeModals.set(modalElement, {
            isOpen: true,
            clickPoint: options.clickPoint || { x: window.innerWidth / 2, y: window.innerHeight / 2 }
          });
          modalElement.classList.remove('hidden', 'closing');
          modalElement.classList.add('show');
          const content = this._getModalContent(modalElement);
          if (content) {
            content.classList.remove('closing');
            content.style.animation = 'none';
            void content.offsetWidth;
            content.style.animation = '';
          }
          modalElement.style.display = 'flex';
          modalElement.style.pointerEvents = 'auto';
          this._emitEvent(modalElement, 'modalOpened');
        },

        close(modalElement) {
          if (!modalElement) return;
          const content = this._getModalContent(modalElement);
          if (content) {
            content.classList.add('closing');
          }
          modalElement.classList.add('closing');
          setTimeout(() => {
            modalElement.classList.remove('show');
            modalElement.classList.add('hidden');
            modalElement.style.display = 'none';
            modalElement.style.pointerEvents = 'none';
            if (content) {
              content.classList.remove('closing');
            }
            this.activeModals.delete(modalElement);
            this._emitEvent(modalElement, 'modalClosed');
          }, this.config.closeDuration);
        },

        _getModalContent(modalElement) {
          if (modalElement.classList.contains('gif-modal')) {
            return modalElement.querySelector('.gif-modal-content');
          } else if (modalElement.classList.contains('tool-modal')) {
            return modalElement.querySelector('.tool-modal-inner');
          } else if (modalElement.classList.contains('modal')) {
            return modalElement.querySelector('.modal-content');
          }
          return null;
        },

        _emitEvent(element, eventName) {
          const event = new CustomEvent(eventName, {
            detail: { modal: element },
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(event);
        },

        isOpen(modalElement) {
          const state = this.activeModals.get(modalElement);
          return state ? state.isOpen : false;
        },

        closeAll() {
          const modals = Array.from(this.activeModals.keys());
          modals.forEach(modal => this.close(modal));
        },

        setupOverlayClose(modalElement, contentElement) {
          modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
              this.close(modalElement);
            }
          });
        },

        setupCloseButton(closeButtonElement, modalElement) {
          closeButtonElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.close(modalElement);
          });
        }
      };

      function initializeModalAnimations() {
        const gifModals = document.querySelectorAll('.gif-modal');
        gifModals.forEach(modal => {
          const closeBtn = modal.querySelector('.gif-modal-btn--cancel, .modalClose');
          if (closeBtn) {
            ModalAnimator.setupCloseButton(closeBtn, modal);
          }
          ModalAnimator.setupOverlayClose(modal, modal.querySelector('.gif-modal-content'));
        });

        const toolModals = document.querySelectorAll('.tool-modal');
        toolModals.forEach(modal => {
          const closeBtn = modal.querySelector('.tool-modal-close');
          if (closeBtn) {
            ModalAnimator.setupCloseButton(closeBtn, modal);
          }
          ModalAnimator.setupOverlayClose(modal, modal.querySelector('.tool-modal-inner'));
        });

		  const modals = document.querySelectorAll('.modal');
		  modals.forEach(modal => {
			  const closeBtn = modal.querySelector('.modalClose');
			  if (closeBtn) {
				  ModalAnimator.setupCloseButton(closeBtn, modal);
			  }
			  ModalAnimator.setupOverlayClose(modal, modal.querySelector('.modal-content'));
		  });
      }

// ✅ Function to load media file
async function loadMediaFile(filePath, fileName) {
	if (!filePath) {
		video.style.display = "none";
		document.getElementById("noMediaLogo").style.display = "block";
		audioImage.style.display = "none";
		document.getElementById("audioLogo").style.display = "none";
		return false; // ✅ Return false on empty path
	}

	try {
		// Stop current playback and clear the old source atomically
		video.pause();
		video.currentTime = 0;
		video.src = '';

		document.getElementById("noMediaLogo").style.display = "none";
		video.style.display = "block";

		// Normalize path separators
		let fixedPath = filePath.replace(/\\/g, "/");
		const fullPathParts = fixedPath.split("/");
		const realFilename = fullPathParts[fullPathParts.length - 1];

		video.dataset.videoId = realFilename;

		// Tell main process which file to serve, get back localhost URL 
		const result = await window.electron.invoke('set-stream-file', filePath);
		// console.log('🎬 set-stream-file result:', result); // ← debug line
		if (!result.success) {
			throw new Error(result.error);
		}
		// Reset subtitle population guard — new file needs fresh population
		_subtitlePopulatedForFile = null;
		// Cache-bust with timestamp so browser doesn't reuse previous stream
		video.src = `http://127.0.0.1:${result.port}/stream?t=${Date.now()}`;
		// Clear any stale freeze-frame from the previous file
		_releaseFreezeFrame && _releaseFreezeFrame();

		// Detect format for UI (audio vs video)
		const fileExtension = realFilename.split(".").pop().toLowerCase();
		const videoFormats = ["mp4", "webm", "mkv", "avi", "mov"];
		const audioFormats = ["mp3", "wav", "aac", "ogg", "flac"];

		if (videoFormats.includes(fileExtension)) {
			audioImage.style.display = "none";
			document.getElementById("audioLogo").style.display = "none";
			audioLogoDropdown.style.pointerEvents = "none";
			audioLogoDropdown.style.opacity = "0.5";
			// Force-close the viz panel if it was open (so the grid doesn't stay visible)
			const vizPanel = audioLogoDropdown.querySelector('.sub-dropdown-content');
			if (vizPanel) vizPanel.style.display = 'none';
			// Disable the navbar viz button text visually
			const vizBtn = audioLogoDropdown.querySelector('.sub-dropbtn');
			if (vizBtn) vizBtn.setAttribute('tabindex', '-1');
			// Disable visualization in context menu for video files (mirrors navbar opacity style)
			const cmVizItem = document.getElementById("cm-viz-item");
			if (cmVizItem) { cmVizItem.classList.add("cm-viz-disabled"); }
		} else if (audioFormats.includes(fileExtension)) {
			document.getElementById("audioLogo").style.display = "block";
			audioImage.style.display = "block";
			loadCustomLogos();
			audioLogoDropdown.style.pointerEvents = "auto";
			audioLogoDropdown.style.opacity = "1";
			// Restore viz button
			const vizBtn = audioLogoDropdown.querySelector('.sub-dropbtn');
			if (vizBtn) vizBtn.removeAttribute('tabindex');
			// Re-enable visualization in context menu for audio files
			const cmVizItem = document.getElementById("cm-viz-item");
			if (cmVizItem) { cmVizItem.classList.remove("cm-viz-disabled"); }
			const savedLogo = localStorage.getItem("selectedLogo");
			if (savedLogo) {
				setSelectedLogo(savedLogo);
			} else {
				const defaultLogoLinks = document.querySelectorAll(
					"#logoOptions .sub-dropdown-content a[data-src]"
				);
				if (defaultLogoLinks.length > 0) {
					setSelectedLogo(defaultLogoLinks[0].getAttribute("data-src"));
				}
			}
		} else {
			document.getElementById("audioLogo").style.display = "none";
			audioImage.style.display = "none";
		}

		updateVideoTitle(realFilename);
		gifImageElement.style.display = "none";

		const savedPlayback = await window.electron.invoke('load-playback-time', realFilename);
		lastPlaybackTime = savedPlayback?.time || 0;
		if (lastPlaybackTime > 0) {
			handleContinueButtonVisibility();
		} else {
			video.currentTime = 0;
		}

		video.dataset.rotation = "0";
		applyRotation();
		loadSavedAspectRatio(); // Apply saved aspect ratio when loading new video

	} catch (error) {
		console.error("❌ Error loading media file:", error);
		video.style.display = "none";
		document.getElementById("noMediaLogo").style.display = "block";
		
		// Clear the loading flag so user can try again
		isLoadingFile = false;
		
		// ✅ Show better error message with filename
		const fileName = filePath ? filePath.split(/[/\\]/).pop() : "Unknown file";
		if (error.message && error.message.includes('ERR_OUT_OF_RANGE')) {
			showStatusMessage(`Skipping: "${fileName}" (corrupted stream)`);
		} else {
			showStatusMessage(`Skipping: "${fileName}" (unable to load)`);
		}
		
		// ✅ Return false to indicate load failure
		return false;
	}
	
	// ✅ Return true to indicate load success
	return true;
}

// Ensure event listeners are only added once
currentMedia.addEventListener("loadedmetadata", async () => {
	updateSeekBar();
	updateNavigationButtons();
	updateDurationDisplay();
	resetZoom(showStatusMessage(''));
	updateVideoTitle(video.dataset.videoId);
	const filePathToHighlight = mediaFiles[currentVideoIndex] || video.dataset.videoId;
	highlightCurrentVideo(filePathToHighlight);
	video.currentTime = 0;

	// ── Play IMMEDIATELY — do NOT wait for track detection ────────────────────
	// Root cause of slow load: populateAudioTracks() + populateSubtitleTracks()
	// each spawn ffprobe processes. On large files (200GB MKV) this blocked
	// video.play() for 3-8 seconds even though the video was ready to render.
	// Fix: start playback first, detect tracks in the background in parallel.
	video.play().catch(function(err) {
		if (err.name !== 'AbortError') console.error('play() error:', err);
	});

	// Run all background work in parallel AFTER play() is started
	// Chapters and track detection do NOT need to block the first frame
	Promise.all([
		populateAudioTracks(),
		populateSubtitleTracks(),
		mediaFiles[currentVideoIndex]
			? loadChaptersFromFile(mediaFiles[currentVideoIndex])
			: Promise.resolve(),
	]).catch(() => {});
});

// ── REPLACE the existing startExternalAudio() function ──────────────────────
function startExternalAudio(index) {
  audioTrackPlayer = getAudioTrackPlayer();
  if (!audioTrackPlayer) {
    console.error('[Audio] Failed to get audioTrackPlayer element');
    return;
  }
  if (index < 0 || !ffprobeAudioTracks[index]) {
    console.warn('[Audio] startExternalAudio called with invalid index:', index);
    return;
  }

  _stopDriftTimer();

  // Cancel any in-progress canplay promise chain from the previous call
  if (audioTrackPlayer._abortController) {
    audioTrackPlayer._abortController.abort();
  }
  const controller = new AbortController();
  audioTrackPlayer._abortController = controller;

  // Pause + clear current source atomically
  audioTrackPlayer.pause();
  audioTrackPlayer.removeAttribute('src');
  try { audioTrackPlayer.load(); } catch {}

  _activeAudioIndex = index;
  _streamStartedAt  = isFinite(video.currentTime) ? video.currentTime : 0;

  const ss  = _streamStartedAt.toFixed(3);
  const url = `http://127.0.0.1:54321/audio/${index}?ss=${ss}&t=${Date.now()}`;

  audioTrackPlayer.src            = url;
  audioTrackPlayer.muted          = false;
  // Volume is controlled by gainNode via Web Audio API (supports 0–200%+).
  // Fall back to clamped HTML volume only if the Web Audio connection failed.
  audioTrackPlayer.volume         = audioTrackPlayer._webAudioConnected ? 1.0 : Math.min(1, gainNode ? gainNode.gain.value : 1);
  audioTrackPlayer.playbackRate   = isFinite(video.playbackRate) ? video.playbackRate : 1;
  audioTrackPlayer.load();

  // Ensure AudioContext is running (browser suspends it after tab switch)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  let _played = false;

  function _attemptPlay() {
    if (controller.signal.aborted) return;
    if (_played) return;
    _played = true;

    // ── Sync check: only play if main video is also playing ─────────────────
    if (video.paused) {
      // Video is paused — keep audio paused too, drift timer will handle sync
      _startDriftTimer();
      return;
    }

    audioTrackPlayer.play().then(() => {
      _startDriftTimer();
    }).catch((err) => {
      if (err.name === 'AbortError') return; // expected — src was changed
      if (err.name === 'NotAllowedError') {
        // Browser blocked autoplay — retry once on next user interaction
        const _retry = () => {
          document.removeEventListener('click', _retry);
          if (!controller.signal.aborted) {
            audioTrackPlayer.play().catch(() => {});
          }
        };
        document.addEventListener('click', _retry, { once: true });
        return;
      }
      console.warn('[Audio] play() failed:', err.name, err.message);
    });
  }

  // Prefer canplaythrough for full buffer; fall back to canplay after 2s
  let _fallbackTimer = null;

  function _onCanPlay() {
    if (controller.signal.aborted) return;
    clearTimeout(_fallbackTimer);
    audioTrackPlayer.removeEventListener('canplay',        _onCanPlay);
    audioTrackPlayer.removeEventListener('canplaythrough', _onCanPlay);
    _attemptPlay();
  }

  audioTrackPlayer.addEventListener('canplay',        _onCanPlay);
  audioTrackPlayer.addEventListener('canplaythrough', _onCanPlay);

  // Fallback: if canplay never fires (some codecs don't fire it), try anyway
  _fallbackTimer = setTimeout(() => {
    if (controller.signal.aborted || _played) return;
    audioTrackPlayer.removeEventListener('canplay',        _onCanPlay);
    audioTrackPlayer.removeEventListener('canplaythrough', _onCanPlay);
    if (audioTrackPlayer.readyState >= 2) {
      _attemptPlay();
    }
  }, 3000);

  // Stream error handler
  const _onError = () => {
    if (controller.signal.aborted) return;
    clearTimeout(_fallbackTimer);
    const code = audioTrackPlayer.error ? audioTrackPlayer.error.code : 0;
    if (code === MediaError.MEDIA_ERR_ABORTED || code === MediaError.MEDIA_ERR_SRC_NOT_FOUND) return;
    console.error('[Audio] Stream error code:', code);
    // Retry once after 500ms — transient network error on local stream server
    setTimeout(() => {
      if (!controller.signal.aborted && _activeAudioIndex === index) {
        startExternalAudio(index);
      }
    }, 500);
  };
  audioTrackPlayer.addEventListener('error', _onError, { once: true });
}
// ✅ Get unique video ID
function getVideoId() {
	return video?.dataset?.videoId || null;
}

// ✅ Modified playMediaFile to handle both initial play and playlist updates
async function playMediaFile(filePath) {
	if (!filePath) return;

	// Extract REAL filename (not 8.3 short name)
	const pathParts = filePath.split(/[/\\]/);
	const realFileName = pathParts[pathParts.length - 1];

	// If file not in playlist, add it
	if (!mediaFiles.includes(filePath)) {
		mediaFiles.push(filePath);
		updatePlaylistDropdown(mediaFiles);
		//  Highlight after playlist update
		highlightCurrentVideo(filePath);
		updateVideoTitle(realFileName);
	}

	currentVideoIndex = mediaFiles.indexOf(filePath);
	// ✅ Make loadMediaFile call async and handle result
	const loadSuccess = await loadMediaFile(filePath, realFileName);
	
	// ✅ If load failed, try next file
	if (!loadSuccess) {
		if (!window._fileSkipTracker) {
			window._fileSkipTracker = new Set();
		}
		window._fileSkipTracker.add(currentVideoIndex);
		const nextIndex = getNextIndex();
		if (nextIndex !== null && window._fileSkipTracker.size < mediaFiles.length) {
			await playVideoByIndex(nextIndex, true);
			return;
		}
	}
	
	highlightCurrentVideo(filePath);  // ✅ Pass full filePath, not just filename
	updateNavigationButtons();
}

// ✅ Function to play a video by its index (now with auto-skip for failed files)
async function playVideoByIndex(index, skipHistoryUpdate = false) {
	if (index < 0 || index >= mediaFiles.length) return;

	// ✅ NEW: Track skipped files to prevent infinite loops
	if (!window._fileSkipTracker) {
		window._fileSkipTracker = new Set();
	}

	// Track navigation history so Previous button works after manual playlist selections
	// (Only update if not called from playNext/playPrevious which manage history themselves)
	if (!skipHistoryUpdate &&
		currentVideoIndex !== null &&
		currentVideoIndex !== index &&
		navigationHistory[navigationHistory.length - 1] !== currentVideoIndex) {
		navigationHistory.push(currentVideoIndex);
	}
	// In shuffle mode also push to lastPlayedStack
	if (isShuffle && currentVideoIndex !== null && currentVideoIndex !== index) {
		if (lastPlayedStack[lastPlayedStack.length - 1] !== currentVideoIndex) {
			lastPlayedStack.push(currentVideoIndex);
		}
	}

	currentVideoIndex = index;
	lastPlayedIndex = index;

	const filePath = mediaFiles[index];

	// Extract REAL filename (not 8.3 short name)
	const pathParts = filePath.split(/[/\\]/);
	const realFileName = pathParts[pathParts.length - 1];

	// ✅ Try to load file and catch failures
	const loadSuccess = await loadMediaFile(filePath, realFileName);
	
	// ✅ If file failed to load, skip to next file
	if (!loadSuccess) {
		window._fileSkipTracker.add(index);
		const nextIndex = getNextIndex();
		
		// If we have a next file and haven't skipped too many, try next file
		if (nextIndex !== null && window._fileSkipTracker.size < mediaFiles.length) {
			await playVideoByIndex(nextIndex, skipHistoryUpdate);
			return;
		} else {
			// All files failed or no more files
			stopPlayback();
			showStatusMessage("⚠️ No playable files in playlist");
			return;
		}
	}
	
	// ✅ Reset skip tracker on successful load
	window._fileSkipTracker.clear();
	
	highlightCurrentVideo(filePath);
	updateNavigationButtons();
}

video.addEventListener("ended", async () => {
	if (typeof _releaseFreezeFrame === 'function') _releaseFreezeFrame();
	resetZoom();

	const nextIndex = getNextIndex();

	if (nextIndex !== null) {
	  const _mc = document.querySelector('.video-controls-container');
	  const _nav = document.querySelector('nav');
	  const _na = document.querySelector('.nav-arrows');
	  const _wb = document.querySelector('.win-buttons');
	  video.style.cursor = 'none';
	  [_nav, _mc].forEach(el => { if (el) { el.classList.add('hidden'); el.classList.remove('visible'); } });
	  [_na, _wb].forEach(el => { if (el) el.classList.add('hidden'); });

	  stopExternalAudio();
	  await playVideoByIndex(nextIndex);
  } else {
	  stopExternalAudio();
	  stopPlayback();
	  updateNavigationButtons();
	  updateSeekBar();
	  updateDurationDisplay();

	  if (isShutdownAtPlaylistEndEnabled) window.electron.sendShutdownRequest();
  }

	if (isShutdownAtVideoEndEnabled) window.electron.sendShutdownRequest();
});

// 🟢 Open file dialog - replaces playlist and plays instantly
openFileButton.addEventListener("click", async () => {
	try {
		const result = await window.electron.openFileDialog();
		if (!result) return;

		if (result.singleFile) {
			const resolvedCurrent = result.currentFile;

			const alreadyInPlaylist = mediaFiles.indexOf(resolvedCurrent);
			if (alreadyInPlaylist !== -1) {
				// File is already in current playlist — just switch to it, don't reload
				currentVideoIndex = alreadyInPlaylist;
				playMediaFile(mediaFiles[currentVideoIndex]);
				return;
			}

			mediaFiles = result.siblingFiles;
			currentVideoIndex = mediaFiles.indexOf(resolvedCurrent);
			if (currentVideoIndex === -1) {
				mediaFiles = [resolvedCurrent];
				currentVideoIndex = 0;
			}
		} else {
			mediaFiles = result.files;
			currentVideoIndex = 0;
		}

		playMediaFile(mediaFiles[currentVideoIndex]);
		updatePlaylistDropdown(mediaFiles);
		// ✅  Highlight after playlist update
		highlightCurrentVideo(mediaFiles[currentVideoIndex]);
		showStatusMessage(`Loaded ${mediaFiles.length} video(s)`);
	} catch (error) {
		console.error("Error opening files:", error);
	}
});

// 🟢 Open folder dialog (Load all media in a folder) - Keeps existing behavior
openFolderButton.addEventListener("click", async () => {
	try {
		const folderFiles = await window.electron.openFolderDialog();
		if (folderFiles.length > 0) {
			// Replace entire playlist with folder contents
			mediaFiles = folderFiles;
			currentVideoIndex = 0; // Always play first video in folder
			playMediaFile(mediaFiles[currentVideoIndex]);
			updatePlaylistDropdown(mediaFiles);
			// ✅  Highlight after playlist update
			highlightCurrentVideo(mediaFiles[currentVideoIndex]);
			showStatusMessage(`Loaded ${folderFiles.length} video(s) from folder`);
		}
	} catch (error) {
		console.error("Error opening folder:", error);
	}
});

// ── Add Subtitle File (navbar & context menu) ──────────────────────────────
document.querySelectorAll('.add-subtitle-btn').forEach(btn => {
	btn.addEventListener('click', async () => {
		try {
			const filePath = await window.electron.invoke('open-subtitle-dialog');
			if (!filePath) return;
			// Inject as an external VTT/SRT/ASS track
			const ext = filePath.split('.').pop().toLowerCase();
			const blobUrl = filePath.startsWith('blob:') ? filePath
				: await window.electron.invoke('read-file-buffer', filePath).then(buf => {
					const blob = new Blob([new Uint8Array(buf)], { type: 'text/plain' });
					return URL.createObjectURL(blob);
				});
			const trackEl = document.createElement('track');
			trackEl.kind = 'subtitles';
			trackEl.label = filePath.split(/[\\/]/).pop();
			trackEl.src = blobUrl;
			trackEl.default = true;
			video.appendChild(trackEl);
			// Update all subtitle lists
			const subtitleLists = document.querySelectorAll('.subtitle-track-list');
			subtitleLists.forEach(list => {
				const a = document.createElement('a');
				a.className = 'subtitle-item';
				a.dataset.trackIndex = video.textTracks.length - 1;
				a.textContent = trackEl.label;
				a.addEventListener('click', () => {
					for (let t of video.textTracks) t.mode = 'disabled';
					video.textTracks[parseInt(a.dataset.trackIndex)].mode = 'showing';
					document.querySelectorAll('.subtitle-item').forEach(el => el.classList.remove('active'));
					a.classList.add('active');
					showStatusMessage(`Subtitle: ${trackEl.label}`);
				});
				list.appendChild(a);
				});
			refreshDynamicListVisibility(); // show subtitle track list now that a track was added
			showStatusMessage(`Subtitle added: ${trackEl.label}`);
		} catch (err) {
			console.error('Subtitle open error:', err);
			showStatusMessage('Could not open subtitle file');
		}
	});
});

// Functions to toggle play/pause icon
function updatePlayPauseIcon(isPlaying) {
	const iconSrc = isPlaying ? "../../assets/icons/pause-.png" : "../../assets/icons/play-.png";
	const label = isPlaying ? "Pause" : "Play";

	playPauseBtn.src = iconSrc;
	playPauseBtn.setAttribute("alt", label);
	playPauseWrapper.setAttribute("data-tooltip", label);
}

function togglePlayPause() {
	if (video.readyState < 3) {
		return;
	}
	if (video.paused) {
		video.play();
		hideVideoTitle();
		video.style.display = "block";
		window.electron.sendPlayPauseStateForTray("playing");
		window.electron.sendPlayPauseStateForThumbar("playing");
	} else {
		video.pause();
		stopGifPlayback();
		showVideoTitle();
		window.electron.sendPlayPauseStateForTray("paused");
		window.electron.sendPlayPauseStateForThumbar("paused");
	}

}

// Event listeners for play/pause button
playPauseBtn.addEventListener("click", (e) => {
	togglePlayPause();
});

video.addEventListener("play", () => {
	updatePlayPauseIcon(true);
	if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
	// Capture a video frame ~800ms after playback starts and push it to SMTC artwork.
	// 800ms delay gives Chromium time to decode and render the first frame.
	scheduleArtworkUpdate(800);
});
video.addEventListener("pause", () => {
	updatePlayPauseIcon(false);
	if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
});

// ── Wire OS media overlay buttons (Windows SMTC / macOS / Linux) ─────────────
// These handlers let the media keys and overlay buttons control playback.
if ('mediaSession' in navigator) {
	navigator.mediaSession.setActionHandler('play', () => { if (video.paused) togglePlayPause(); });
	navigator.mediaSession.setActionHandler('pause', () => { if (!video.paused) togglePlayPause(); });
	navigator.mediaSession.setActionHandler('nexttrack', () => { if (nextButton) nextButton.click(); });
	navigator.mediaSession.setActionHandler('previoustrack', () => { if (prevButton) prevButton.click(); });
	navigator.mediaSession.setActionHandler('seekto', (details) => {
		if (details.seekTime !== undefined) video.currentTime = details.seekTime;
	});
}

// ✅ Function to get the next video index
function getNextIndex() {
	if (mediaFiles.length === 0) return null;

	if (isShuffle) {
		// ── Forward-history first: if we went back, replay the forward sequence ──
		// This is the core fix: re-use existing sequence before picking a new random
		if (shuffleFwd.length > 0) {
			return shuffleFwd[0]; // peek only — consumed in playNext()
		}

		// ── No forward history: pick a NEW random unplayed video ──
		// Seed playedVideos with currentVideoIndex if not already present,
		// so it is treated as "already seen" and never immediately replayed.
		if (!playedVideos.includes(currentVideoIndex)) {
			playedVideos.push(currentVideoIndex);
		}
		const remaining = mediaFiles
			.map((_, i) => i)
			.filter(i => !playedVideos.includes(i));

		if (remaining.length > 0) {
			return remaining[Math.floor(Math.random() * remaining.length)];
		}

		// All videos played — reset if repeat-all is on
		if (isRepeatMode === 2) {
			playedVideos = [];
			shuffleBack  = [];
			shuffleFwd   = [];
			const idx = Math.floor(Math.random() * mediaFiles.length);
			// Avoid immediately replaying the same video
			return idx !== currentVideoIndex ? idx : (idx + 1) % mediaFiles.length;
		}

		return null; // All played, no repeat — stop
	}

	// Non-shuffle: sequential
	const next = currentVideoIndex + 1;
	return next < mediaFiles.length ? next : (isRepeatMode === 2 ? 0 : null);
}


// ✅ Function to get the previous video index
function getPreviousIndex() {
	if (mediaFiles.length === 0) return null;

	if (isShuffle) {
		// Use new shuffleBack stack; fall back to legacy lastPlayedStack for compat
		if (shuffleBack.length > 0) return shuffleBack[shuffleBack.length - 1]; // peek only
		if (lastPlayedStack.length > 0) return lastPlayedStack[lastPlayedStack.length - 1];
		return null;
	}

	const prev = currentVideoIndex - 1;
	return prev >= 0 ? prev : (isRepeatMode === 2 ? mediaFiles.length - 1 : null);
}



// ✅ OPTIMIZED: Centralized debounce logic to prevent duplication
function clearLoadingFlagAfterDelay(delayMs = 500) {
	setTimeout(() => {
		isLoadingFile = false;
	}, delayMs);
}

// ✅ Play next video while tracking playback history
function playNext() {
	// Debounce rapid clicks to prevent streaming errors
	if (isLoadingFile) return;

	if (video.duration >= 60 && video.currentTime < video.duration) {
		savePlaybackTime(video.dataset.videoId, video.currentTime);
	}

	const nextIndex = getNextIndex();
	if (nextIndex === null) {
		stopPlayback();
		if (isShutdownAtPlaylistEndEnabled) window.electron.sendShutdownRequest();
		return;
	}

	// General navigation history (used by non-shuffle Previous)
	if (currentVideoIndex !== null && navigationHistory[navigationHistory.length - 1] !== currentVideoIndex) {
		navigationHistory.push(currentVideoIndex);
	}

	if (isShuffle) {
		if (shuffleFwd.length > 0) {
			// We are replaying a forward-history entry — consume it from the queue
			shuffleFwd.shift(); // nextIndex was shuffleFwd[0], now removed
		}
		// In both cases (forward replay OR new random), push current to back-stack
		if (shuffleBack[shuffleBack.length - 1] !== currentVideoIndex) {
			shuffleBack.push(currentVideoIndex);
		}
		// Maintain legacy arrays for compatibility with other code paths
		if (!playedVideos.includes(currentVideoIndex)) playedVideos.push(currentVideoIndex);
		if (lastPlayedStack[lastPlayedStack.length - 1] !== currentVideoIndex) {
			lastPlayedStack.push(currentVideoIndex);
		}
	}

	isLoadingFile = true;
	currentVideoIndex = nextIndex;
	lastPlayedIndex   = nextIndex;

	playVideoByIndex(nextIndex, true);
	highlightCurrentVideo(mediaFiles[nextIndex]);
	updateNavigationButtons();
	showStatusMessage("Next");
	clearLoadingFlagAfterDelay(500);
}

// ✅ Play previous video correctly
function playPrevious() {
	// Debounce rapid clicks to prevent streaming errors
	if (isLoadingFile) return;

	if (video.duration >= 60 && video.currentTime < video.duration) {
		savePlaybackTime(video.dataset.videoId, video.currentTime);
	}

	isLoadingFile = true;

	if (isShuffle) {
		// Pop from back-stack; push current video onto FRONT of forward queue
		let prevIndex = null;
		if (shuffleBack.length > 0) {
			prevIndex = shuffleBack.pop();
		} else if (lastPlayedStack.length > 0) {
			// Legacy compat fallback
			prevIndex = lastPlayedStack.pop();
		}

		if (prevIndex === null) {
			// Nothing to go back to
			isLoadingFile = false;
			return;
		}

		// Push current video to the front of the forward queue so
		// pressing Next will replay it in order (not pick a new random one)
		if (shuffleFwd[0] !== currentVideoIndex) {
			shuffleFwd.unshift(currentVideoIndex);
		}

		currentVideoIndex = prevIndex;
		lastPlayedIndex   = prevIndex;
		playVideoByIndex(prevIndex, true);
		highlightCurrentVideo(mediaFiles[prevIndex]);
		updateNavigationButtons();
		showStatusMessage("Previous");
		clearLoadingFlagAfterDelay(500);
		return;
	}

	// Non-shuffle: use navigationHistory first, then sequential fallback
	if (navigationHistory.length > 0) {
		const prevIndex = navigationHistory.pop();
		playedVideos.push(currentVideoIndex);
		currentVideoIndex = prevIndex;
		lastPlayedIndex   = prevIndex;
		playVideoByIndex(prevIndex, true);
		highlightCurrentVideo(mediaFiles[prevIndex]);
		updateNavigationButtons();
		showStatusMessage("Previous");
		clearLoadingFlagAfterDelay(500);
		return;
	}

	const prevIndex = getPreviousIndex();
	if (prevIndex === null) {
		isLoadingFile = false;
		return;
	}
	currentVideoIndex = prevIndex;
	lastPlayedIndex   = prevIndex;
	playVideoByIndex(prevIndex, true);
	highlightCurrentVideo(mediaFiles[prevIndex]);
	updateNavigationButtons();
	showStatusMessage("Previous");
	clearLoadingFlagAfterDelay(500);
}

// ✅ Ensure buttons are updated properly
function updateNavigationButtons() {
	const nextIndex = getNextIndex();
	const prevIndex = getPreviousIndex();

	nextButton.classList.toggle("hidden", nextIndex === null || mediaFiles.length === 0);
	prevButton.classList.toggle("hidden", prevIndex === null || mediaFiles.length === 0);

	// // console.log("🔄 Navigation updated | Next:", nextIndex, "| Previous:", prevIndex);
}


// ── OS Media Overlay (Windows SMTC / macOS / Linux) ──────────────────────────
//
// STEP 1 — updateMediaSessionMetadata(title)
//   Called immediately when a new file title is known.
//   Sets title + artist straight away; artwork starts as the app icon so the
//   overlay is never blank.
//
// STEP 2 — updateMediaSessionArtwork()
//   Called ~800 ms after playback starts (once the first frame is rendered).
//   Draws the current video frame onto a hidden canvas and converts it to a
//   base64 JPEG data-URL — no HTTP request, no ffmpeg, works in dev AND prod.
//   For audio-only files (no video track) the app icon stays as artwork.
// ─────────────────────────────────────────────────────────────────────────────

function updateMediaSessionMetadata(title) {
	if (!('mediaSession' in navigator)) return;
	navigator.mediaSession.metadata = new MediaMetadata({
		title: title || 'Anime Player',
		artist: 'Anime Player',
		// Placeholder artwork — replaced by a real video frame once playback starts
		artwork: [
			{ src: 'http://127.0.0.1:54321/icon', sizes: '512x512', type: 'image/png' }
		]
	});
}

// Capture one video frame via canvas and push it as SMTC artwork.
// Must be called AFTER the video element has rendered at least one frame.
let _artworkUpdateTimer = null;
function updateMediaSessionArtwork() {
	if (!('mediaSession' in navigator)) return;
	if (!navigator.mediaSession.metadata) return;
	// Guard: need a decoded video frame
	if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;
	try {
		const W = 320;
		const H = Math.round(video.videoHeight * (W / video.videoWidth)) || 180;
		const canvas = document.createElement('canvas');
		canvas.width = W;
		canvas.height = H;
		canvas.getContext('2d').drawImage(video, 0, 0, W, H);
		const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
		const meta = navigator.mediaSession.metadata;
		// Re-set metadata so Windows picks up the new artwork immediately
		navigator.mediaSession.metadata = new MediaMetadata({
			title: meta.title,
			artist: meta.artist,
			artwork: [{ src: dataUrl, sizes: `${W}x${H}`, type: 'image/jpeg' }]
		});
	} catch (e) {
		console.warn('[SMTC] Canvas thumbnail failed:', e.message);
	}
}

// Schedule an artwork refresh, debounced so rapid play events don't stack up
function scheduleArtworkUpdate(delayMs = 800) {
	clearTimeout(_artworkUpdateTimer);
	_artworkUpdateTimer = setTimeout(updateMediaSessionArtwork, delayMs);
}

function updateVideoTitle(fileName) {
	if (!fileName || typeof fileName !== "string") {
		console.error("Invalid fileName passed to updateVideoTitle:", fileName);
		document.title = "Anime Player"; // Reset to default
		return;
	}

	if (videoTitleElement) {
		// Remove file extensions (.mp4, .mp3, etc.)
		const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
		videoTitleElement.textContent = nameWithoutExtension;

		// Update SMTC title/artist immediately (artwork frame captured on play)
		updateMediaSessionMetadata(nameWithoutExtension);

		// Update window title
		document.title = nameWithoutExtension + " - Anime Player";
	} else {
		console.error('Element with id "videoTitle" not found.');
		document.title = "Anime Player";
	}
}



// Function to show video title when video is paused
function showVideoTitle() {
	videoTitleElement.style.display = "block";
	videoTitleElement.style.transition = "font-size 0.15s ease-out"
}

// Function to hide video title when video is playing
function hideVideoTitle() {
	videoTitleElement.style.display = "none";
	videoTitleElement.style.transition = "font-size 0.15s ease-out";
}

// Function to stop playback and reset the media player
function stopPlayback() {
	video.pause();
	stopExternalAudio(); // stop any transcoded audio stream
	video.style.display = "none";
	updateVideoTitle(video.dataset.videoId);
	updatePlayPauseIcon(false);
	playedVideos = [];
	video.currentTime = 0;
	updateSeekBar();
	currentTimeDisplay.textContent = formatTime(0);
	seekBar.style.width = `0%`;
	seekBarHandle.style.left = `0%`;
	audioImage.style.display = "none";
	document.getElementById("audioLogo").style.display = "none";
	stopGifPlayback();
	updateNavigationButtons();

	// Clean up temp subtitle files
	const cleanupPromise = window.electron.invoke('cleanup-subtitles');
	if (cleanupPromise && typeof cleanupPromise.catch === 'function') {
		cleanupPromise.catch(e => console.warn('Subtitle cleanup:', e));
	}
}


// ✅ OPTIMIZED: Consolidated playback control listeners (single loop instead of 3)
function attachPlaybackControlListeners() {
	const buttonMappings = [
		{
			selector: ".stopPlayback", callback: () => {
				stopPlayback();
				updateNavigationButtons();
			}
		},
		{ selector: ".previousbtn", callback: playPrevious },
		{ selector: ".nextbtn", callback: playNext }
	];

	buttonMappings.forEach(({ selector, callback }) => {
		document.querySelectorAll(selector).forEach(button => {
			button.addEventListener("click", callback);
		});
	});
}

attachPlaybackControlListeners();

// Keep direct button references
prevButton.addEventListener("click", playPrevious);
nextButton.addEventListener("click", playNext);

// Event listener for Previous Video using querySelectorAll and forEach
document.querySelectorAll(".previousbtn").forEach(button => {
	button.addEventListener("click", () => {
		playPrevious();
	});
});

// Event listener for Next Video using querySelectorAll and forEach
document.querySelectorAll(".nextbtn").forEach(button => {
	button.addEventListener("click", () => {
		playNext();
	});
});

// Rewind and Forward video 10 sec
rewind.addEventListener("click", () => {
	_seekMedia(currentMedia, currentMedia.currentTime - 10);
	showStatusMessage(
		`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
	);
});

forward.addEventListener("click", () => {
	_seekMedia(currentMedia, currentMedia.currentTime + 10);
	showStatusMessage(
		`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
	);
});

// Initial button visibility update
updateNavigationButtons();


// ✅ Handle two-finger swipe using the "wheel" event
document.addEventListener("wheel", (e) => {
	// Check if the wheel event is horizontal (deltaX) and not vertical (deltaY)
	if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
		if (e.deltaX > 0) {
			// Two-finger swipe left (rewind)
			_seekMedia(currentMedia, currentMedia.currentTime - 10);
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			);
		} else if (e.deltaX < 0) {
			// Two-finger swipe right (fast forward)
			_seekMedia(currentMedia, currentMedia.currentTime + 10);
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			);
		}
	}
});

// ✅ Save playback time
function savePlaybackTime(videoId, time) {
	if (!videoId) return;
	if (time === 0) {
		clearPlaybackTime(videoId);
		return;
	}
	// // console.log("✅ Saving playback time:", videoId, time);
	window.electron.send('save-playback-time', time, videoId);
}

// ✅ Clear playback time entry
function clearPlaybackTime(videoId) {
	if (!videoId) return;
	// // console.log("🗑️ Clearing playback time for:", videoId);
	window.electron.send('delete-playback-entry', videoId);
}

// ✅ Handle "Continue Watching" button visibility
function handleContinueButtonVisibility() {
	if (lastPlaybackTime > 0) {
		continueButton.style.display = "block";
		startAutoHideContinueButton();
	} else {
		continueButton.style.display = "none";
	}
}

// ✅ Auto-hide "Continue Watching" button after 5 seconds and clear playback cache
function startAutoHideContinueButton() {
	clearTimeout(hideContinueButtonTimeout);
	hideContinueButtonTimeout = setTimeout(() => {
		// // console.log("⏳ Continue Watching button auto-hidden");
		continueButton.style.display = "none";
		clearPlaybackTime(video.dataset.videoId);
	}, 5000);
}

// ✅ Save playback time on pause
video.addEventListener("pause", () => {
	const videoId = getVideoId();
	if (!videoId || video.currentTime === 0 || video.currentTime >= video.duration) {
		clearPlaybackTime(videoId);
		return;
	}
	if (video.duration >= 60) {
		lastPlaybackTime = video.currentTime;
		savePlaybackTime(videoId, lastPlaybackTime);
	}
	handleContinueButtonVisibility();
	continueButton.style.display = "none";
});


// ✅ Save playback time before window closes
window.addEventListener("beforeunload", () => {
	const videoId = getVideoId();
	if (videoId && video.currentTime > 0 && video.duration >= 60) {
		// // console.log("💾 Saving playback time before closing:", videoId, video.currentTime);
		window.electron.send('save-playback-time', video.currentTime, videoId);
	}
});

// ✅ Handle app closing
window.electron.onAppClosing(async () => {
	const videoId = getVideoId();
	if (videoId && !video.paused && video.duration >= 60) {
		// // console.log("💾 Saving playback time before quit:", videoId, video.currentTime);
		window.electron.send('save-playback-time', video.currentTime, videoId);
	}
});

// ✅ Function to save playback time and then quit
function savePlaybackAndQuit() {
	const videoId = getVideoId();
	if (videoId && video.currentTime > 0 && video.duration >= 60) {
		window.electron.send("appClose", video.currentTime, videoId);
	} else {
		window.electron.close();
	}
}

// ✅ Handle "Continue Watching" button click
continueButton.addEventListener("click", () => {
	if (lastPlaybackTime > 0) {
		// // console.log("🎬 Resuming playback from:", lastPlaybackTime);
		video.currentTime = lastPlaybackTime;
		video.play();
		clearPlaybackTime(video.dataset.videoId);
	}
	continueButton.style.display = "none";
});


// ✅ Function to delete the current media file
async function deleteCurrentMediaFile() {
	if (!mediaFiles.length || currentVideoIndex < 0) return;
	const filePath = mediaFiles[currentVideoIndex];
	if (!filePath) return;
	try {
		await window.electron.deleteFile(filePath); // API from preload.js
		// console.log("🗑️ File deleted:", filePath);
		// Remove the file from the playlist
		mediaFiles.splice(currentVideoIndex, 1);
		// Adjust index if necessary
		if (currentVideoIndex >= mediaFiles.length) {
			currentVideoIndex = mediaFiles.length - 1;
		}
		// ✅ Update the playlist UI with updated mediaFiles
		updatePlaylistDropdown(mediaFiles);
		// Play next file or stop if none
		if (mediaFiles.length > 0) {
			playVideoByIndex(currentVideoIndex);
		} else {
			stopPlayback(); // Stop player if no media left
		}
	} catch (error) {
		console.error("❌ Error deleting file:", error);
	}
}


// ✅ Function to update the playlist dropdown with media files
function updatePlaylistDropdown(mediaFiles) {
	if (!Array.isArray(mediaFiles) || mediaFiles.length === 0) {
		refreshDynamicListVisibility(); // hide playlist rows when empty
		return;
	}

	const playlistContainers = document.querySelectorAll(".play-list");

	playlistContainers.forEach((playlistContainer) => {
		playlistContainer.innerHTML = "";

		// ✅ Inject search bar
		// ── Search bar wrapper (icon + input + clear button) ──
		const searchWrap = document.createElement("div");
		searchWrap.classList.add("playlist-search-wrap");

		const searchIcon = document.createElement("img");
		searchIcon.className = "svg-icon playlist-search-icon";
		searchIcon.src = "../../assets/icons/fa/magnifying-glass.svg";
		searchIcon.alt = "";
		searchWrap.appendChild(searchIcon);

		const searchInput = document.createElement("input");
		searchInput.type = "text";
		searchInput.placeholder = "Search...";
		searchInput.classList.add("playlist-search");
		searchWrap.appendChild(searchInput);

		const clearBtn = document.createElement("button");
		clearBtn.classList.add("playlist-search-clear");
		clearBtn.innerHTML = '<img class="svg-icon" src="../../assets/icons/fa/xmark.svg" alt="">';
		clearBtn.style.display = "none";
		clearBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			searchInput.value = "";
			clearBtn.style.display = "none";
			playlistContainer.querySelectorAll(".playlist-item").forEach(item => {
				item.style.display = "block";
			});
			searchInput.focus();
		});
		searchWrap.appendChild(clearBtn);

		playlistContainer.appendChild(searchWrap);

		// Limit display to first 1000 files to prevent DOM slowdowns
		const DISPLAY_LIMIT = 1000;
		const filesToDisplay = mediaFiles.slice(0, DISPLAY_LIMIT);
		const hasMoreFiles = mediaFiles.length > DISPLAY_LIMIT;
		const fragment = document.createDocumentFragment();

		filesToDisplay.forEach((filePath, index) => {
			// Extract REAL filename (not 8.3 short name)
			const pathParts = filePath.split(/[/\\]/);
			const realFileName = pathParts[pathParts.length - 1];

			const fileLink = document.createElement("a");

			fileLink.href = "javascript:void(0)";
			fileLink.textContent = realFileName; // Use real filename
			fileLink.classList.add("playlist-item");

			// ✅ CRITICAL FIX: Store full filePath as data attribute
			fileLink.dataset.filePath = filePath;
			fileLink.dataset.index = index;

			fileLink.addEventListener("click", () => {
				const currentIndex = Number(fileLink.dataset.index);
				if (!Number.isNaN(currentIndex) && currentIndex >= 0 && currentIndex < mediaFiles.length) {
					playVideoByIndex(currentIndex);
					highlightCurrentVideo(filePath);  // Pass full path
					// Close context menu if open (playlist lives in both navbar & CM)
					if (window._hideContextMenu) window._hideContextMenu();
				} else {
					console.error('❌ Video not found in playlist:', fileLink.dataset.filePath, fileLink.dataset.index);
				}
			});
			// Prevent dblclick on playlist items from triggering fullscreen on mediaPlayer
			fileLink.addEventListener("dblclick", (e) => {
				e.stopPropagation(); // Block dblclick from reaching mediaPlayer dblclick → fullscreen
			});

			fragment.appendChild(fileLink);
		});

		playlistContainer.appendChild(fragment);

		// Add note about total count if truncated
		if (hasMoreFiles) {
			const totalNote = document.createElement("div");
			totalNote.className = "playlist-total-note";
			totalNote.textContent = `... and ${mediaFiles.length - DISPLAY_LIMIT} more files`;
			totalNote.style.cssText = [
				'padding: 8px 12px',
				'font-size: 12px',
				'color: #888',
				'text-align: center',
				'border-top: 1px solid #333',
				'margin-top: 4px',
				'font-style: italic'
			].join(';');
			playlistContainer.appendChild(totalNote);
		}

		// ✅ Activate search logic (with debounce)
		let debounceTimeout;
		searchInput.addEventListener("input", function() {
			clearTimeout(debounceTimeout);
			const hasVal = searchInput.value.length > 0;
			clearBtn.style.display = hasVal ? "flex" : "none";
			debounceTimeout = setTimeout(() => {
				const query = searchInput.value.toLowerCase().trim();
				const allItems = Array.from(playlistContainer.querySelectorAll(".playlist-item"));
				let matchCount = 0;
				allItems.forEach(item => {
					const visible = item.textContent.toLowerCase().includes(query);
					item.style.display = visible ? "block" : "none";
					if (visible) matchCount++;
				});
				// Show "3 / 12 matches" inside the clear button label when filtering
				if (query) {
					clearBtn.title = `${matchCount} / ${allItems.length} matches`;
					clearBtn.setAttribute('data-count', `${matchCount}/${allItems.length}`);
				} else {
					clearBtn.title = '';
					clearBtn.removeAttribute('data-count');
				}
			}, 150);
		});

		// Prevent input from closing dropdown or context menu
		searchInput.addEventListener("click", (e) => e.stopPropagation());
		searchInput.addEventListener("mousedown", (e) => e.stopPropagation());

		// Context menu: pin it open while search is focused (typing loses CSS :hover)
		searchInput.addEventListener("focus", () => {
			const cm = document.getElementById("context-menu");
			const cmPlaylistItem = document.getElementById("context-menu-playlist");
			const cmAudioItem = cmPlaylistItem ? cmPlaylistItem.closest(".cm-submenu") : null;
			if (cm && cm.style.display === "block") {
				// Force submenu chain visible while typing
				if (cmAudioItem) cmAudioItem.style.display = "block";
				const sub = playlistContainer.closest(".cm-submenu");
				if (sub) sub.style.setProperty("display", "block", "important");
			}
		});
		searchInput.addEventListener("blur", () => {
			// Remove forced display so CSS hover takes over again
			const sub = playlistContainer.closest(".cm-submenu");
			if (sub) sub.style.removeProperty("display");
		});

		searchInput.addEventListener("keydown", (e) => {
			e.stopPropagation();
			// Arrow keys navigate playlist while typing
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				const items = Array.from(playlistContainer.querySelectorAll(".playlist-item"))
					.filter(el => el.style.display !== "none");
				if (items.length === 0) return;
				const cur = items.findIndex(el => el.classList.contains("highlight"));
				const next = e.key === "ArrowDown"
					? (cur + 1) % items.length
					: (cur - 1 + items.length) % items.length;
				items[next].click();
				items[next].scrollIntoView({ block: "nearest" });
			}
			// Enter selects highlighted item
			if (e.key === "Enter") {
				const highlighted = playlistContainer.querySelector(".playlist-item.highlight");
				if (highlighted) highlighted.click();
			}
			// Escape clears search
			if (e.key === "Escape") {
				searchInput.value = "";
				clearBtn.style.display = "none";
				playlistContainer.querySelectorAll(".playlist-item").forEach(item => {
					item.style.display = "block";
				});
			}
		});
	});

	// ✅ Global: Clear input and reset on outside click
	document.addEventListener("click", function(event) {
		document.querySelectorAll(".play-list").forEach((playlistContainer) => {
			if (!playlistContainer.contains(event.target)) {
				const input = playlistContainer.querySelector(".playlist-search");
				if (input) input.value = "";
				playlistContainer.querySelectorAll(".playlist-item").forEach((item) => {
					item.style.display = "block";
				});
			}
		});
	});

	refreshDynamicListVisibility(); // show playlist rows now that files exist

	// Keep the current highlighted item visible in any open playlist panel.
	document.querySelectorAll(".play-list").forEach(playlistContainer => {
		if (isContainerVisible(playlistContainer)) {
			requestAnimationFrame(() => scrollToHighlighted(playlistContainer));
		}
	});

	// FIX: re-register scroll containers after playlist items are injected.
	// Dynamic content added to .play-list containers must be registered with
	// ScrollManager so wheel isolation is applied to the newly visible containers.
	if (window.ScrollManager) window.ScrollManager.registerAll();

	// ── One-time corruption scan ──────────────────────────────────────────────
	_scheduleCorruptionScan(mediaFiles);
}

// ── Corruption scan + X badge system ─────────────────────────────────────────
// Runs ONCE per unique playlist. Results cached in localStorage — no re-scan
// on restart for the same folder. Corrupt items get a red ✕ badge.
let _corruptScanInProgress = false;

function _playlistFingerprint(files) {
	const sorted = [...files].sort().join('|');
	return sorted.length + '_' + sorted.slice(0, 60) + '_' + sorted.slice(-40);
}

function _markCorruptItem(filePath, reason) {
	document.querySelectorAll('.playlist-item').forEach(item => {
		if (item.dataset.filePath !== filePath) return;
		if (item.querySelector('.corrupt-badge')) return;
		item.style.opacity = '0.5';
		const badge = document.createElement('span');
		badge.className = 'corrupt-badge';
		badge.title = `Corrupt: ${reason}`;
		badge.style.cssText = [
			'display:inline-flex','align-items:center','justify-content:center',
			'margin-left:6px','color:#ff4444','font-size:10px','font-weight:800',
			'background:rgba(255,68,68,0.15)','border:1px solid rgba(255,68,68,0.4)',
			'border-radius:3px','padding:0 5px','line-height:16px','flex-shrink:0',
			'cursor:help','pointer-events:all',
		].join(';');
		badge.textContent = '✕';
		// Show reason tooltip on click
		badge.addEventListener('click', (e) => {
			e.stopImmediatePropagation();
			showStatusMessage(`Corrupt: ${reason}`);
		}, { capture: true });
		item.appendChild(badge);
	});
}

async function _scheduleCorruptionScan(files) {
	if (!files || files.length === 0 || _corruptScanInProgress) return;

	// Only scan a small subset of displayed files for performance
	// Corruption scanning is mainly for user feedback, not comprehensive validation
	const CORRUPTION_SCAN_LIMIT = 20;
	const filesToScan = files.slice(0, CORRUPTION_SCAN_LIMIT);

	const CACHE_KEY = 'corruptScan:' + _playlistFingerprint(filesToScan);
	let cached = null;
	try { cached = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch {}

	if (cached) {
		// Re-apply badges from cache (DOM may have been rebuilt)
		cached.forEach(({ path: fp, reason }) => _markCorruptItem(fp, reason));
		if (cached.length > 0) {
			showStatusMessage(`⚠ ${cached.length} corrupt file${cached.length > 1 ? 's' : ''} in displayed playlist (cached)`);
		}
		return;
	}

	_corruptScanInProgress = true;
	const total = filesToScan.length;

	// Batch with slight delay so playlist renders first
	await new Promise(r => setTimeout(r, 300));
	// showStatusMessage(`Scanning ${total} displayed file${total !== 1 ? 's' : ''}…`);

	let corrupt = [];
	try {
		// Single batch IPC call — main process runs 8 concurrent ffprobe probes
		// and returns only the corrupt ones. Much faster than one-by-one IPC.
		const result = await window.electron.invoke('validate-media-files-batch', filesToScan);
		if (result && result.skipped) {
			corrupt = result.skipped; // [{ path, reason }]
			corrupt.forEach(({ path: fp, reason }) => _markCorruptItem(fp, reason));
		}
	} catch (e) {
		console.warn('[CorruptScan] batch validation error:', e);
	}

	_corruptScanInProgress = false;
	try { localStorage.setItem(CACHE_KEY, JSON.stringify(corrupt)); } catch {}

	if (corrupt.length > 0) {
		showStatusMessage(`⚠ ${corrupt.length} corrupt file${corrupt.length > 1 ? 's' : ''} in displayed playlist`);
	}
	// No "all OK" message — unnecessary noise on every playlist load
}
function isContainerVisible(container) {
	const style = window.getComputedStyle(container);
	if (style.display === 'none' || style.visibility === 'hidden') return false;

	// Walk up to check if any ancestor is hidden (handles cm-submenu, sub-dropdown-content, etc.)
	let el = container.parentElement;
	while (el && el !== document.body) {
		const ps = window.getComputedStyle(el);
		if (ps.display === 'none' || ps.visibility === 'hidden') return false;
		el = el.parentElement;
	}
	return true;
}

// ✅ PLAYLIST CONTAINER ARROW KEY NAVIGATION (Bottom Playlist Only)
// Using capture phase to intercept before other handlers
document.addEventListener("keydown", (e) => {
	const playlistContainer = document.querySelector(".playlist-container");
	
	// Only activate if playlist container is visible
	if (!playlistContainer || !isContainerVisible(playlistContainer)) return;
	
	// Don't interfere with search input or other text inputs
	const activeEl = document.activeElement;
	if (activeEl && (activeEl.classList.contains("playlist-search") || 
	    activeEl.tagName === "INPUT" ||
	    activeEl.tagName === "TEXTAREA")) return;
	
	if (e.key === "ArrowDown" || e.key === "ArrowUp") {
		e.preventDefault();
		e.stopPropagation();
		
		// Get all visible playlist items in the bottom container
		const playList = playlistContainer.querySelector(".play-list");
		if (!playList) return;
		
		const items = Array.from(playList.querySelectorAll(".playlist-item"))
			.filter(el => el.style.display !== "none");
		
		if (items.length === 0) return;
		
		// Find currently highlighted item
		const curIndex = items.findIndex(el => el.classList.contains("highlight"));
		
		// Calculate next index (wrap around)
		let nextIndex;
		if (e.key === "ArrowDown") {
			nextIndex = curIndex === -1 ? 0 : (curIndex + 1) % items.length;
		} else {
			nextIndex = curIndex === -1 ? items.length - 1 : (curIndex - 1 + items.length) % items.length;
		}
		
		// Click the item to play it and highlight it
		items[nextIndex].click();
		items[nextIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
		
		// Show status message for keyboard navigation
		showStatusMessage(`${e.key === "ArrowDown" ? "↓" : "↑"} ${items[nextIndex].textContent}`);
		return; // Stop further processing
	}
	
	// Enter key to play highlighted item
	if (e.key === "Enter") {
		const playList = playlistContainer.querySelector(".play-list");
		if (!playList) return;
		
		const highlighted = playList.querySelector(".playlist-item.highlight");
		if (highlighted) {
			e.preventDefault();
			e.stopPropagation();
			highlighted.click();
			showStatusMessage("Playing: " + highlighted.textContent);
		}
	}
}, true); // Use capture phase to intercept before other handlers

// ✅ Function to HIGHLIGHT CURRENT VIDEO (All Containers)
function highlightCurrentVideo(filePathOrName) {
	// Extract filename from path if it's a full path
	const pathParts = filePathOrName.split(/[/\\]/);
	const realFileName = pathParts[pathParts.length - 1];

	// Update ALL playlist containers
	document.querySelectorAll(".play-list").forEach(playlistContainer => {
		// Remove existing highlights
		playlistContainer.querySelectorAll(".highlight").forEach(item => {
			item.classList.remove("highlight");
		});

		// ✅ CRITICAL FIX: Match by data-filePath first (most reliable)
		playlistContainer.querySelectorAll(".playlist-item").forEach(item => {
			let shouldHighlight = false;
			const datasetPath = item.dataset.filePath || "";
			const datasetIndex = item.dataset.index !== undefined ? Number(item.dataset.index) : NaN;

			// ✅ Priority 1: Match by data-filePath (stored full path)
			if (datasetPath && datasetPath === filePathOrName) {
				shouldHighlight = true;
			}
			// ✅ Priority 2: Match by stored playlist index
			else if (!Number.isNaN(datasetIndex) && !Number.isNaN(Number(filePathOrName)) && datasetIndex === Number(filePathOrName)) {
				shouldHighlight = true;
			}
			// ✅ Priority 3: Fall back to filename matching (legacy compatibility)
			else if (!datasetPath && item.textContent.trim() === realFileName) {
				shouldHighlight = true;
			}

			if (shouldHighlight) {
				item.classList.add("highlight");

				// ✅ ONLY scroll if container is VISIBLE
				if (isContainerVisible(playlistContainer)) {
					item.scrollIntoView({
						behavior: "smooth",
						block: "center",
						inline: "nearest"
					});
				}
			}
		});
	});
}

const playlistContainers = document.querySelectorAll(".play-list");

// Attach scroll and mouse interaction listeners to each playlist container
playlistContainers.forEach((playlistContainer) => {
	playlistContainer.addEventListener("scroll", () => {
		isUserScrolling = true;

		// Clear the timeout if it already exists
		clearTimeout(scrollTimeout);

		// Set a timeout to reset `isUserScrolling` after 1.5 seconds of no scroll
		scrollTimeout = setTimeout(() => {
			isUserScrolling = false;
		}, 2000); // Adjust delay as needed
	});

	// Mouse enter/leave for tracking hover state (kept for compatibility with other listeners)
	playlistContainer.addEventListener("mouseenter", () => {
		isMouseOver = true;
	});
	playlistContainer.addEventListener("mouseleave", () => {
		isMouseOver = false;
	});
});

// For navbar playlist (on hover/show)
document.querySelectorAll('.sub-dropdown').forEach(dropdown => {
	dropdown.addEventListener('mouseenter', () => {
		setTimeout(() => scrollToHighlighted(dropdown.querySelector('.play-list')), 50);
	});
});


// For playlist-container toggle button
function togglePlaylist() {
	const playlistContainer = document.querySelector(".playlist-container");
	const playlistItems = playlistContainer.querySelectorAll(".playlist-item");

	if (playlistItems.length === 0) {
		showStatusMessage("No videos in the playlist.");
		playlistContainer.classList.remove("show");
		return;
	}

	const willShow = !playlistContainer.classList.contains("show");
	playlistContainer.classList.toggle("show");

	// ✅ Scroll after container becomes visible
	if (willShow) {
		setTimeout(() => scrollToHighlighted(playlistContainer.querySelector('.play-list')), 50);
	}
}



// Reusable scroll function
function scrollToHighlighted(playlistContainer) {
	if (!playlistContainer) return;

	const highlighted = playlistContainer.querySelector(".playlist-item.highlight");
	if (highlighted && isContainerVisible(playlistContainer)) {
		highlighted.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "nearest"
		});
	}
}

// Hide playlist on outside click
window.addEventListener("click", function(event) {
	const playlistContainer = document.querySelector(".playlist-container");
	if (playlistContainer && !playlistContainer.contains(event.target)) {
		playlistContainer.classList.remove("show");
	}
});


// ✅ Sort playlist and instantly play FIRST video of sorted result
function sortPlaylist() {
	if (mediaFiles.length === 0) return;

	if (sortMethod === 'date') {
		sortByDateAsync();
		return;
	}

	// Name sort (natural numeric: ep1, ep2...ep10)
	mediaFiles.sort((a, b) => {
		const nameA = a.split(/[/\\]/).pop();
		const nameB = b.split(/[/\\]/).pop();
		return nameA.localeCompare(nameB, undefined, {
			numeric: true,
			sensitivity: 'base'
		});
	});

	if (sortDirection === 'descending') mediaFiles.reverse();

	finalizeSortResult();
}

// ✅ Date sort — fetches mtimes from main process
async function sortByDateAsync() {
	try {
		const filesWithDates = await window.electron.invoke('get-file-dates', mediaFiles);

		if (!filesWithDates || typeof filesWithDates !== 'object') {
			console.warn('get-file-dates returned invalid data, falling back to name sort');
			sortMethod = 'name';
			sortPlaylist();
			return;
		}

		mediaFiles.sort((a, b) => {
			const dateA = filesWithDates[a] ?? 0;
			const dateB = filesWithDates[b] ?? 0;
			return dateA - dateB;
		});

		if (sortDirection === 'descending') mediaFiles.reverse();

		finalizeSortResult();
	} catch (err) {
		console.error('Date sort failed:', err);
		showStatusMessage('Date sort unavailable');
	}
}

// ✅ After sort: play index 0 (first in sorted list), update UI
function finalizeSortResult() {
	currentVideoIndex = 0;
	updatePlaylistDropdown(mediaFiles);
	playVideoByIndex(currentVideoIndex); // instant play first video
	highlightCurrentVideo(mediaFiles[currentVideoIndex]);
	updateSortUI();
	showStatusMessage(`Sorted: ${sortMethod} ${sortDirection === 'ascending' ? '⬆' : '⬇'}`);
}

// ✅ Sync active state on ALL sort buttons across both dropdowns
function updateSortUI() {
	// Context menu sort items — toggle .active and update .cm-check icon visibility
	document.querySelectorAll('[data-sort="name"], [data-sort="date"]').forEach(el => {
		const isActive = el.dataset.sort === sortMethod;
		el.classList.toggle('active', isActive);
		const cmCheck = el.querySelector('.cm-check');
		if (cmCheck) cmCheck.textContent = isActive ? '●' : '';
		const navCheck = el.querySelector('.nav-sort-check');
		if (navCheck) navCheck.textContent = isActive ? '●' : '';
	});
	document.querySelectorAll('[data-sort="ascending"], [data-sort="descending"]').forEach(el => {
		const isActive = el.dataset.sort === sortDirection;
		el.classList.toggle('active', isActive);
		const cmCheck = el.querySelector('.cm-check');
		if (cmCheck) cmCheck.textContent = isActive ? '●' : '';
		const navCheck = el.querySelector('.nav-sort-check');
		if (navCheck) navCheck.textContent = isActive ? '●' : '';
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', updateSortUI);
} else {
	updateSortUI();
}

// ✅ Wire up ALL sort clicks in both navbar + context menu dropdowns
document.addEventListener('click', (e) => {
	const target = e.target.closest('[data-sort]');
	if (!target) return;

	const val = target.dataset.sort;

	if (val === 'name' || val === 'date') {
		sortMethod = val;
		sortPlaylist();
	} else if (val === 'ascending' || val === 'descending') {
		sortDirection = val;
		sortPlaylist();
	}
});

// ✅ Toggle Order button — works in both dropdowns
document.addEventListener('click', (e) => {
	if (!e.target.closest('.toggle-sort-order')) return;
	sortDirection = sortDirection === 'ascending' ? 'descending' : 'ascending';
	sortPlaylist();
});

// CHAPTERS MANAGEMENT SYSTEM 

// Initialize DOM elements (delay to ensure they exist)
function initChaptersDOM() {
	chaptersList = null;     // legacy panel removed
	chapterTooltip = document.getElementById('chapter-tooltip');
	chaptersMarkersContainer = document.getElementById('chapters-markers-container');
	setupChapterEventListeners();
}

// Load chapters from video file
async function loadChaptersFromFile(filePath) {
	// console.log('[Chapters] Loading chapters from:', filePath);
	try {
		currentVideoPath = filePath;
		currentChapters = await window.electron.loadChapters(filePath);
		// console.log('[Chapters] Loaded chapters:', currentChapters);

		if (currentChapters && currentChapters.length > 0) {
			renderChapterMarkers();
			renderChaptersList();
			// console.log(`[Chapters] Successfully loaded ${currentChapters.length} chapters`);
		} else {
			// console.log('[Chapters] No chapters found in video');
			clearChapters();
		}
	} catch (error) {
		console.error('[Chapters] Error loading chapters:', error);
		clearChapters();
	}
}

// Render chapter markers on seekbar
function renderChapterMarkers() {
	if (!chaptersMarkersContainer) {
		console.warn('[Chapters] Markers container not found');
		return;
	}

	chaptersMarkersContainer.innerHTML = '';

	if (!video.duration) {
		console.warn('[Chapters] Video duration not available');
		return;
	}

	currentChapters.forEach((chapter, index) => {
		const marker = document.createElement('div');
		marker.className = 'chapter-marker';
		marker.id = `chapter-marker-${index}`;

		const percentage = (chapter.start / video.duration) * 100;
		marker.style.left = percentage + '%';

		marker.dataset.chapterIndex = index;
		marker.dataset.chapterName = chapter.name;
		marker.dataset.chapterTime = formatChapterTime(chapter.start);

		marker.addEventListener('click', (e) => {
			e.stopPropagation();
			jumpToChapter(index);
		});

		marker.addEventListener('mouseenter', (e) => {
			showChapterTooltip(e, chapter, percentage);
		});

		marker.addEventListener('mouseleave', () => {
			hideChapterTooltip();
		});

		chaptersMarkersContainer.appendChild(marker);
	});

	// console.log(`[Chapters] Rendered ${currentChapters.length} markers`);
}

// Render chapters list in navbar menu + context menu
function renderChaptersList() {
	// Helper to build a chapter anchor element
	function makeChapterAnchor(chapter, index, onClickExtra) {
		const a = document.createElement("a");
		a.className = "chapter-item";
		a.id = `chapter-item-${index}`;
		a.href = "javascript:void(0)";

		const name = document.createElement("span");
		name.textContent = chapter.name;
		a.appendChild(name);

		const badge = document.createElement("span");
		badge.className = "chapter-time-badge";
		badge.textContent = formatChapterTime(chapter.start);
		a.appendChild(badge);

		a.addEventListener("click", (e) => {
			e.preventDefault();
			jumpToChapter(index);
			if (typeof onClickExtra === "function") onClickExtra();
		});
		return a;
	}

	// Populate navbar Playback > Chapters sub-dropdown
	const navList = document.getElementById("chaptersListNav");
	if (navList) {
		navList.innerHTML = "";
		if (currentChapters.length === 0) {
			navList.innerHTML = '<a style="color:rgba(255,255,255,0.35);pointer-events:none;padding:8px 12px;font-size:11px">No chapters</a>';
		} else {
			currentChapters.forEach((ch, i) =>
				navList.appendChild(makeChapterAnchor(ch, i)));
		}
	}

	// Populate context menu Playback > Chapters list
	const cmList = document.getElementById("chaptersListCM");
	if (cmList) {
		cmList.innerHTML = "";
		if (currentChapters.length === 0) {
			cmList.innerHTML = '<div class="cm-no-chapters">No chapters available</div>';
		} else {
			currentChapters.forEach((ch, i) =>
				cmList.appendChild(makeChapterAnchor(ch, i, () => { if (window._hideContextMenu) window._hideContextMenu(); })));
		}
	}

	if (window.ScrollManager) window.ScrollManager.registerAll();
}

// Update active chapter highlight in nav/cm lists
function highlightActiveChapterInMenus(index) {
	document.querySelectorAll("#chaptersListNav .chapter-item, #chaptersListCM .chapter-item").forEach((el, i) => {
		el.classList.toggle("active-chapter", i === index);
	});
}

// Show chapter tooltip on hover
function showChapterTooltip(event, chapter, percentage) {
	if (!chapterTooltip || !seekBarWrapper) {
		console.warn('[Chapters] Tooltip or seekbar wrapper not found');
		return;
	}

	const rect = seekBarWrapper.getBoundingClientRect();
	const tooltipX = (percentage / 100) * rect.width;

	const timeStr = formatChapterTime(chapter.start);

	// ── Chapter thumbnail: reuse seekPreview canvas via previewVideo ──────────
	// Build a small canvas inside the tooltip and paint the chapter start frame.
	let thumbCanvas = chapterTooltip.querySelector('.chapter-thumb-canvas');
	if (!thumbCanvas) {
		thumbCanvas = document.createElement('canvas');
		thumbCanvas.className = 'chapter-thumb-canvas';
		thumbCanvas.width  = 160;
		thumbCanvas.height = 90;
		thumbCanvas.style.cssText = 'display:block;width:160px;height:90px;border-radius:3px;margin-bottom:6px;background:#000;';
		chapterTooltip.prepend(thumbCanvas);
	}

	// Paint the chapter frame using the hidden previewVideo element (already in DOM)
	const pv = document.querySelector('video[style*="opacity:0"]'); // the hidden previewVideo
	if (pv && pv.src && isFinite(pv.duration) && chapter.start <= pv.duration) {
		const thumbCtx = thumbCanvas.getContext('2d');
		const _paintChapter = () => {
			try {
				thumbCtx.clearRect(0, 0, 160, 90);
				thumbCtx.drawImage(pv, 0, 0, 160, 90);
			} catch {}
		};
		if (Math.abs(pv.currentTime - chapter.start) < 0.5) {
			_paintChapter();
		} else {
			const _onSeekedForChapter = () => {
				pv.removeEventListener('seeked', _onSeekedForChapter);
				_paintChapter();
			};
			pv.addEventListener('seeked', _onSeekedForChapter);
			try { pv.currentTime = chapter.start; } catch {}
		}
		thumbCanvas.style.display = 'block';
	} else {
		thumbCanvas.style.display = 'none';
	}

	chapterTooltip.querySelector('.chapter-thumb-text')?.remove();
	const textEl = document.createElement('div');
	textEl.className = 'chapter-thumb-text';
	textEl.innerHTML = `<strong>${chapter.name}</strong><br><small>${timeStr}</small>`;
	// Remove old text node if any (replace the innerHTML approach)
	Array.from(chapterTooltip.childNodes).forEach(n => {
		if (n !== thumbCanvas && n !== textEl) n.remove();
	});
	chapterTooltip.appendChild(textEl);

	chapterTooltip.style.display = 'block';
	chapterTooltip.style.left = tooltipX + 'px';
	chapterTooltip.style.transform = 'translateX(-50%)';
}

// Hide chapter tooltip
function hideChapterTooltip() {
	if (chapterTooltip) {
		chapterTooltip.style.display = 'none';
	}
}

function jumpToChapter(index) {
	if (index < 0 || index >= currentChapters.length) {
		console.warn('[Chapters] Invalid chapter index:', index);
		return;
	}

	const chapter = currentChapters[index];
	_seekMedia(video, chapter.start);

	// Highlight the current chapter in nav/cm menus
	highlightActiveChapterInMenus(index);
}

// Jump to next chapter
function jumpToNextChapter() {
	if (currentChapters.length === 0) return;

	const currentTime = video.currentTime;

	for (let i = 0; i < currentChapters.length; i++) {
		if (currentChapters[i].start > currentTime) {
			jumpToChapter(i);
			return;
		}
	}

	// console.log('[Chapters] Already at last chapter');
}

// Jump to previous chapter
function jumpToPreviousChapter() {
	if (currentChapters.length === 0) return;

	const currentTime = video.currentTime;
	let currentChapterIndex = -1;

	// Find which chapter we're currently in
	for (let i = 0; i < currentChapters.length; i++) {
		if (currentChapters[i].start <= currentTime) {
			currentChapterIndex = i;
		} else {
			break;
		}
	}

	// console.log(`[Chapters] Current chapter index: ${currentChapterIndex}`);

	// Jump to previous chapter
	if (currentChapterIndex > 0) {
		jumpToChapter(currentChapterIndex - 1);
		// console.log(`[Chapters] Jumping to previous chapter`);
	} else {
		// console.log('[Chapters] Already at first chapter');
	}
}

function clearChapters() {
	currentChapters = [];
	if (chaptersMarkersContainer) chaptersMarkersContainer.innerHTML = '';
	if (chapterTooltip) chapterTooltip.style.display = 'none';
}

// Toggle chapters — now chapters live in Playback menus; C key shows status
function toggleChaptersDropdown() {
	if (!currentChapters || currentChapters.length === 0) {
		showStatusMessage("No chapters available");
		return;
	}
	showStatusMessage(`Chapters: ${currentChapters.length} — use Playback menu`);
}

// Format time for chapters
function formatChapterTime(seconds) {
	if (!seconds || isNaN(seconds)) return '0:00';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}
	return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function setupChapterEventListeners() {
	// Close dropdown when clicking outside
	document.addEventListener('click', (e) => {
		// no-op: chapters now live in Playback menus only
	});

	// Update markers when video duration changes
	video.addEventListener('loadedmetadata', () => {
		if (currentChapters.length > 0) {
			renderChapterMarkers();
		}
	});
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initChaptersDOM);
} else {
	initChaptersDOM();
}

// console.log('[Chapters] Fixed chapters system loaded successfully');

// ✅ Add time function - adds minutes to current timer
function addTime(minutes) {
	// Get current time in seconds
	const currentHours = parseInt(document.getElementById('hours').textContent, 10);
	const currentMinutes = parseInt(document.getElementById('minutes').textContent, 10);
	const currentSeconds = parseInt(document.getElementById('seconds').textContent, 10);

	let currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

	// Add new minutes
	currentTotalSeconds += minutes * 60;

	// Calculate new time
	const hours = Math.floor(currentTotalSeconds / 3600);
	const mins = Math.floor((currentTotalSeconds % 3600) / 60);
	const secs = currentTotalSeconds % 60;

	// Update display
	updateDisplay(hours, mins, secs);

	// Update countdown if running
	if (countdownInterval && !isPaused) {
		totalTimeInSeconds = currentTotalSeconds;
	}

	// Enable play button if time > 0
	updatePlayButtonState(currentTotalSeconds > 0);

	showStatusMessage(`Added ${minutes} minutes`);
}

// ✅ Update display function
function updateDisplay(hours, minutes, seconds) {
	document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
	document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
	document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// ✅ Update play button state (enable/disable)
function updatePlayButtonState(enable) {
	const playBtn = document.querySelector('.play-btn');
	if (enable) {
		playBtn.disabled = false;
		playBtn.style.opacity = '1';
		playBtn.style.cursor = 'pointer';
	} else {
		playBtn.disabled = true;
		playBtn.style.opacity = '0.5';
		playBtn.style.cursor = 'not-allowed';

		// Ensure it shows play icon when disabled
		playBtn.innerHTML = `
            <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
        `;
	}
}

// ✅ Quick-set buttons handler - adds time instead of setting
document.querySelectorAll('.preset-btn').forEach(button => {
	button.addEventListener('click', function() {
		let minutes = parseInt(button.textContent);
		addTime(minutes);
	});
});

// ✅ Mouse wheel scroll for time unit adjustments
document.querySelectorAll('#hours, #minutes, #seconds').forEach(unit => {
	let max = unit.id === 'hours' ? 23 : 59;

	unit.addEventListener('wheel', function(event) {
		event.preventDefault();
		let delta = event.deltaY > 0 ? -1 : 1;
		let newValue = parseInt(unit.textContent) + delta;

		if (newValue < 0) newValue = max;
		if (newValue > max) newValue = 0;

		unit.textContent = newValue.toString().padStart(2, '0');

		// Check if total time > 0 to enable play button
		const totalSeconds = getTotalTimeInSeconds();
		updatePlayButtonState(totalSeconds > 0);

		// Update countdown if running
		if (countdownInterval && !isPaused) {
			totalTimeInSeconds = totalSeconds;
		}
	});
});

// Function to convert current display time to total seconds
function getTotalTimeInSeconds() {
	const hours = parseInt(document.getElementById('hours').textContent, 10);
	const minutes = parseInt(document.getElementById('minutes').textContent, 10);
	const seconds = parseInt(document.getElementById('seconds').textContent, 10);
	return hours * 3600 + minutes * 60 + seconds;
}

// ✅ Start countdown function
function startCountdown() {
	// Get current display time
	if (!isPaused) {
		totalTimeInSeconds = getTotalTimeInSeconds();
	} else {
		// Resume from paused time
		totalTimeInSeconds = remainingTimeOnPause;
		isPaused = false;
	}

	if (totalTimeInSeconds <= 0) {
		showStatusMessage('Please set a valid timer.');
		return;
	}

	// Clear any existing interval
	if (countdownInterval) {
		clearInterval(countdownInterval);
	}

	// Start countdown
	countdownInterval = setInterval(() => {
		if (totalTimeInSeconds <= 0) {
			clearInterval(countdownInterval);
			countdownInterval = null;

			// Update play button to disabled
			updatePlayButtonState(false);

			// Show play icon
			document.querySelector('.play-btn').innerHTML = `
                <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
            `;

			showStatusMessage('Time is up! Shutting down...');

			// Shut down the PC using Electron
			if (window.electron && typeof window.electron.sendShutdownRequest === 'function') {
				window.electron.sendShutdownRequest();
			} else {
				console.warn('Electron shutdown function not found.');
			}
			return;
		}

		totalTimeInSeconds--;
		updateTimeDisplay(totalTimeInSeconds);
	}, 1000);

	showStatusMessage('Countdown started');
}

// ✅ Pause countdown function
function pauseCountdown() {
	if (countdownInterval) {
		clearInterval(countdownInterval);
		countdownInterval = null;
		isPaused = true;
		remainingTimeOnPause = totalTimeInSeconds;
		showStatusMessage('Timer paused');
	}
}

// Function to update time display from total seconds
function updateTimeDisplay(totalSeconds) {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	updateDisplay(hours, minutes, seconds);
}

// ✅ Reset timer function - resets to 00:00:00 without stopping
function resetTimer() {
	if (countdownInterval) {
		// If timer is running, stop it and reset
		clearInterval(countdownInterval);
		countdownInterval = null;
		isPaused = false;
	}

	// Reset display
	updateDisplay(0, 0, 0);

	// Disable play button
	updatePlayButtonState(false);

	// Reset state variables
	totalTimeInSeconds = 0;
	remainingTimeOnPause = 0;

	// Ensure play icon is shown
	document.querySelector('.play-btn').innerHTML = `
        <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
    `;

	showStatusMessage('Timer reset');
}

// ✅ Delete timer function - stops timer and hides container
function deleteTimer() {
	// Stop any running timer
	if (countdownInterval) {
		clearInterval(countdownInterval);
		countdownInterval = null;
	}

	// Cancel any pending OS-level shutdown (main process setTimeout)
	if (window.electron && typeof window.electron.cancelShutdownTimer === 'function') {
		window.electron.cancelShutdownTimer();
	}

	// Reset all states
	isPaused = false;
	totalTimeInSeconds = 0;
	remainingTimeOnPause = 0;

	// Reset display
	updateDisplay(0, 0, 0);

	// Hide timer container
	const container = document.querySelector('.timer-container');
	if (container) {
		container.style.display = 'none';
	}
	showStatusMessage('Sleep timer cancelled');
}

// ✅ Play/Pause button click handler
document.querySelector('.play-btn').addEventListener('click', function() {
	const totalSeconds = getTotalTimeInSeconds();

	// If timer is 00:00:00, do nothing (button should be disabled)
	if (totalSeconds <= 0 && !isPaused) {
		return;
	}

	if (countdownInterval) {
		// Pause the timer
		pauseCountdown();
		// Change to play icon
		this.innerHTML = `
            <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
        `;
	} else {
		// Start or resume timer
		startCountdown();
		// Change to pause icon
		this.innerHTML = `
            <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
        `;
	}
});

// ✅ Delete timer button 
document.querySelectorAll('.icon-btn')[1].addEventListener('click', deleteTimer);

// ✅ Reset timer button 
document.querySelectorAll('.icon-btn')[0].addEventListener('click', resetTimer);

// Make timer container visible (call this from your main app)
function showTimerContainer() {
	const container = document.querySelector('.timer-container');
	if (container) {
		container.style.display = 'block';

		// Reset any running timer when showing
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}

		// Reset states
		isPaused = false;
		totalTimeInSeconds = 0;
		remainingTimeOnPause = 0;

		// Reset display
		updateDisplay(0, 0, 0);

		// Disable play button initially
		updatePlayButtonState(false);

		// Ensure play icon is shown
		document.querySelector('.play-btn').innerHTML = `
            <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
        `;
	}
}

// Initialize play button as disabled on page load
window.addEventListener('DOMContentLoaded', () => {
	updatePlayButtonState(false);
});

// Allow timer scrolling when mouse is over it
const timerContainer = document.querySelector('.timer-container');
if (timerContainer) {
	timerContainer.addEventListener("mouseenter", () => {
		isMouseOver = true;
	});

	timerContainer.addEventListener("mouseleave", () => {
		isMouseOver = false;
	});
}

document.getElementById('sleep-timer').addEventListener('click', () => showTimerContainer(true));



// Function to set playback speed
function setPlaybackSpeed(speed) {
	video.playbackRate = speed;
}

// Keep your existing speed controls
playbackSpeedLinks.forEach(link => {
	link.addEventListener("click", () => {
		const speedText = link.textContent;
		let speed;

		switch (speedText) {
			case "0.25":
				speed = 0.25;
				showStatusMessage("Slow 0.25x");
				break;
			case "0.5":
				speed = 0.5;
				showStatusMessage("Slow 0.5x");
				break;
			case "0.75":
				speed = 0.75;
				showStatusMessage("Slow 0.75x");
				break;
			case "Normal Speed":
				speed = 1;
				break;
			case "1.25":
				speed = 1.25;
				showStatusMessage("Fast 1.25x");
				break;
			case "1.5":
				speed = 1.5;
				showStatusMessage("Fast 1.5x");
				break;
			case "1.75":
				speed = 1.75;
				showStatusMessage("Fast 1.75x");
				break;
			case "2":
				speed = 2;
				showStatusMessage("Fast 2x");
				break;
			default:
				speed = 1;
				break;
		}

		setPlaybackSpeed(speed);
		playbackSpeedLinks.forEach(l => l.classList.remove("selected"));
		link.classList.add("selected");
	});
});

// Initialize to normal speed
setPlaybackSpeed(1);

// Create a reusable function for tooltip styling
function createTooltip() {
	const tooltip = document.createElement("div");
	tooltip.style.position = "absolute";
	tooltip.style.textShadow =
		"1px 1px 2px rgba(0, 0, 0, 0.863), -1px -1px 2px rgba(0, 0, 0, 0.733), 1px -1px 2px rgba(0, 0, 0, 0.707),-1px 1px 2px black";
	tooltip.style.color = "#fff";
	tooltip.style.fontWeight = "300";
	tooltip.style.padding = "5px 10px";
	tooltip.style.borderRadius = "5px";
	tooltip.style.transition = "opacity 0.2s ease-in-out";
	tooltip.style.opacity = "0";
	tooltip.style.pointerEvents = "none";
	tooltip.style.zIndex = "99";
	document.body.appendChild(tooltip);
	return tooltip;
}

// Audio Context and Gain Node setup (existing)
const videoElement = document.querySelector("video");
const volumeSlider = document.getElementById("volume-slider");
volumeSlider.max = 200; 

function pctToGain(pct) {
	return Math.pow(Math.max(0, pct) / 100, 3);   // (pct/100)^3
}
function gainToPct(gain) {
	return Math.round(Math.cbrt(Math.max(0, gain)) * 100); // cube-root × 100
}

// ── AUDIO GRAPH ─────────────────────────────────────────────────────────────
// Chain: source → [EQ filters] → compressor → stereoPanner → gainNode → masterLimiter → destination
//                                                                  ↓
//                                                            audioAnalyser (tap only, no feedback)
//
// KEY FIXES vs old code:
//  • Removed monitorAudioLevels() — it was pulling gainNode DOWN, directly fighting 200% volume
//  • Fixed double-analyser bug (old: analyser fed back into gainNode = audio summed twice = mud)
//  • stereoPanner default set to 0.0 center (was 0.2 = permanently off-center)
//  • masterLimiter added AFTER gainNode — catches only true clipping peaks at 200%,
//    does NOT reduce overall loudness. This is how VLC achieves loud + clean audio.

let audioContext = new AudioContext();

// ── AudioContext resume on visibility change / window focus ──────────────────
// Browsers suspend AudioContext when the tab/window loses focus.
// Resume it immediately when the window returns to visibility or focus.
let _audioOnlyMode = false;

document.addEventListener('visibilitychange', () => {
	if (!document.hidden && audioContext && audioContext.state === 'suspended') {
		audioContext.resume().catch(() => {});
	}
	// Audio-only mode: update document title badge when tab is hidden
	if (_audioOnlyMode) {
		const title = video.src
			? (mediaFiles[currentVideoIndex] || '').split(/[\\/]/).pop() || 'Playing'
			: 'Anime Player';
		document.title = document.hidden ? `▶ ${title}` : title;
	}
});
window.addEventListener('focus', () => {
	if (audioContext && audioContext.state === 'suspended') {
		audioContext.resume().catch(() => {});
	}
	// Re-sync external FFmpeg audio if drift occurred during focus loss.
	// Wait 600ms first so AudioContext can fully resume before we measure drift —
	// measuring immediately gives a false-positive large drift.
	if (audioTrackPlayer && audioTrackPlayer.src && !video.paused && _activeAudioIndex >= 0) {
		setTimeout(() => {
			if (video.paused || _activeAudioIndex < 0) return; // state changed while we waited
			const expected = video.currentTime;
			const actual = (_streamStartedAt || 0) + (audioTrackPlayer.currentTime || 0);
			if (Math.abs(expected - actual) > DRIFT_MAX) {
				startExternalAudio(_activeAudioIndex);
			}
		}, 600);
	}
});
window.addEventListener('blur', () => {
	// Keep AudioContext alive — just log the state change
	// audioContext.state will become 'suspended' automatically by the browser
});


// ── User volume control (0.0–3.5 = 0%–350%) ─────────────────────────────────
const gainNode = audioContext.createGain();

// ── Master limiter — brick-wall peak limiter AFTER the gain node ─────────────
// Threshold 0 dBFS (true digital ceiling). Catches only real clipping peaks.
// 1 ms attack stops peaks before they crack. 80 ms release = no pumping artifacts.
const masterLimiter = audioContext.createDynamicsCompressor();
masterLimiter.threshold.value = -0.1;  // true ceiling, not robbing 1 dB of headroom
masterLimiter.knee.value      = 0;     // Hard knee = true brick-wall
masterLimiter.ratio.value     = 20;    // 20:1 = limiter not compressor
masterLimiter.attack.value    = 0.001; // 1 ms — kills peaks before distortion
masterLimiter.release.value   = 0.08;  // 80 ms — fast enough to avoid pumping

// ── Per-preset compressor (voice dynamics, updated by applyAudioEffect) ──────
const compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -24;
compressor.knee.value      = 12;
compressor.ratio.value     = 3;
compressor.attack.value    = 0.015;
compressor.release.value   = 0.2;

// ── Compressor makeup gain — restores level lost to compression ───────────────
// The compressor silently removes 15–25 dB before the user gainNode runs.
// Without makeup the user's "200%" sounds like VLC's "50%".
// 'auto' preset uses passthrough (makeup=1, ratio=1) so it matches VLC directly.
// Other presets set their own makeup to compensate for their compression depth.
const compMakeupNode = audioContext.createGain();
compMakeupNode.gain.value = 1.0; // passthrough by default (overridden by preset)

// ── Stereo panner (each preset can set this; default = dead center) ───────────
const stereoPanner = audioContext.createStereoPanner();
stereoPanner.pan.value = 0; // center (was 0.2 before — permanently off-balance)

// ── Analyser tap (visualization only — NOT in the audio signal path) ──────────
const audioAnalyser = audioContext.createAnalyser();
audioAnalyser.fftSize = 256;
const bufferLength = audioAnalyser.frequencyBinCount;
const timeDomainData = new Uint8Array(bufferLength);

// ── Wire the base chain ──────────────────────────────────────────────────────
// applyAudioEffect() splices EQ filters between source and compressor.
// Chain: source → [EQ] → compressor → compMakeupNode → pan → gainNode → masterLimiter → dest
const source = audioContext.createMediaElementSource(videoElement);
source.connect(compressor);
compressor.connect(compMakeupNode);
compMakeupNode.connect(stereoPanner);
stereoPanner.connect(gainNode);
gainNode.connect(masterLimiter);
masterLimiter.connect(audioContext.destination);

// Analyser tap — parallel read-only branch. Reads the post-gain signal level
// for visualization but does NOT connect back to destination (no feedback loop).
gainNode.connect(audioAnalyser);

// Function to save volume setting to localStorage
function saveVolumeSetting(volume) {
	localStorage.setItem("volumeSetting", volume);
	localStorage.setItem("muteState", volume === 0);
}

// Function to load volume from localStorage (existing)
function loadVolumeSetting() {
	const savedVolume = localStorage.getItem("volumeSetting");
	const savedMuteState = localStorage.getItem("muteState");

	if (savedMuteState === "true") {
		updateVolume(0); // If muted, set volume to 0
	} else if (savedVolume) {
		// Saved value may be an old linear gain (0-3.5) or a new cubic gain (0-8).
		// In both cases we just reload the raw gain — the slider will display the
		// correct cubic-mapped percentage via gainToPct().
		updateVolume(parseFloat(savedVolume));
	} else {
		updateVolume(1.0); // Default: 100% display = 1.0 gain (unity)
	}
}

// Set initial volume — 100% display = 1.0 gain (unity, same as VLC default)
gainNode.gain.value = 1.0;
volumeSlider.value = gainToPct(gainNode.gain.value); // shows 100

// Call the loadVolumeSetting to apply saved or default volume
loadVolumeSetting(); // Load saved volume or apply default volume (100%)

// Update the volume update function to handle exact synchronization
function updateVolume(newVolume, source = null) {
	// Gain range: 0 (mute) to 8.0 (200% on VLC cubic curve = +18 dB)
	newVolume = parseFloat(Math.max(0, Math.min(8, newVolume)).toFixed(4));

	// Update the actual audio volume using ramp
	gainNode.gain.linearRampToValueAtTime(newVolume, audioContext.currentTime + 0.1);
	
	// IMMEDIATE: Set the gain value directly for instant icon/slider update
	gainNode.gain.value = newVolume;

	// Sync volume to external audio element (non-native codec path)
	// If connected to Web Audio API, volume is already handled by gainNode.
	// Only set the HTML property as fallback when Web Audio connection failed.
	if (audioTrackPlayer && audioTrackPlayer.src) {
		audioTrackPlayer.volume = audioTrackPlayer._webAudioConnected ? 1.0 : Math.min(1, newVolume);
	}

	// Sync slider display (shows 0-200% via cubic inverse)
	if (source !== 'slider') {
		volumeSlider.value = gainToPct(newVolume); // 0-200 display %
	}

	// Tooltip shown by callers that have mouse context (slider/wheel/hover);
	// keyboard/menu callers show the status pill instead — no double messages.

	// Save the exact volume setting
	saveVolumeSetting(newVolume);

	// Update volume button icon IMMEDIATELY with the target value
	updateVolumeIcon();
}

// Function to update and show the tooltip
// Accepts display percent (0-200) — the same number the slider shows.
function showTooltip(displayPctOrGain, event = null) {
	// If called with a gain value (old callers pass gainNode.gain.value),
	// convert to display %.  Values > 2 are definitely gains, ≤ 2 are
	// ambiguous but we treat them as gains for safety.
	const displayPct = displayPctOrGain > 2
		? Math.round(displayPctOrGain) // already a display %
		: gainToPct(displayPctOrGain); // convert gain → display %
	tooltip.textContent = `Volume: ${displayPct}%`;

	if (event) {
		const offsetX = 10; // Offset to avoid covering the mouse
		const offsetY = 25;
		tooltip.style.left = `${event.pageX + offsetX}px`;
		tooltip.style.top = `${event.pageY - offsetY}px`;
	} else {
		// Fallback positioning (near volume slider)
		const sliderRect = volumeSlider.getBoundingClientRect();
		tooltip.style.left = `${sliderRect.left + volumeSlider.offsetWidth * (volumeSlider.value / 200)}px`;
		tooltip.style.top = `${sliderRect.top - 30}px`;
	}

	tooltip.style.opacity = "1"; // Make visible

	// Clear previous timeout and set a new delay for hiding
	clearTimeout(tooltipTimeout);
	tooltipTimeout = setTimeout(() => {
		tooltip.style.opacity = "0";
	}, 1500);
}
// ── VOLUME FUNCTIONS with VLC cubic curve ────────────────────────────────────
// masterLimiter (above) provides clean 200% power — no initializeAdvancedAudio needed.

// Enhanced volume update — delegates to updateVolume (gain value 0-8)
function updateVolumeEnhanced(newVolume) {
	updateVolume(newVolume);
}

// Enhanced tooltip — shows display % (0-200), not raw gain
function showTooltipEnhanced(volume) {
	const pct = gainToPct(volume); // cubic inverse → display %
	const displayText = pct > 100 ? `📢 Volume: ${pct}%` : `Volume: ${pct}%`;
	
	tooltip.textContent = displayText;
	tooltip.style.opacity = '1';
	tooltip.style.visibility = 'visible';

	if (tooltipTimeout) clearTimeout(tooltipTimeout);
	tooltipTimeout = setTimeout(() => {
		tooltip.style.opacity = '0';
		tooltip.style.visibility = 'hidden';
	}, 1500);
}

// Volume slider input handler — display % → cubic gain
volumeSlider.addEventListener("input", (event) => {
	const displayPct = parseFloat(event.target.value); // 0-200
	const gain = pctToGain(displayPct);                // 0-8 via cubic
	updateVolume(gain, 'slider');
	showTooltip(displayPct, event); // show display % (0-200) near cursor
});

volumeSlider.addEventListener("mouseenter", () => {
	showTooltip(gainToPct(gainNode.gain.value)); // show display % on hover
});

volumeSlider.addEventListener("mouseleave", () => {
	tooltipTimeout = setTimeout(() => {
		tooltip.style.opacity = "0";
	}, 1000);
});

window.addEventListener('load', () => {
	// Force sync the slider with current volume on load
	volumeSlider.value = gainToPct(gainNode.gain.value); // show display %
	
	// ✅ Initialize wheel scrolling for bottom playlist container ONLY
	const bottomPlaylistContainer = document.querySelector(".playlist-container");
	if (bottomPlaylistContainer && !bottomPlaylistContainer._wheelListenerAdded) {
		bottomPlaylistContainer.addEventListener("wheel", (event) => {
			event.stopPropagation(); // Stop propagation to prevent seek bar interference
			
			const st = bottomPlaylistContainer.scrollTop;
			const sh = bottomPlaylistContainer.scrollHeight;
			const ch = bottomPlaylistContainer.clientHeight;
			
			// Only prevent default at boundaries to stop leak to video/seek bar
			const atTop    = event.deltaY < 0 && st <= 0;
			const atBottom = event.deltaY > 0 && st + ch >= sh - 1;
			
			if (atTop || atBottom) {
				event.preventDefault(); // Stop boundary leak only, allow normal scroll otherwise
			}
		}, { passive: false }); // Must be non-passive for preventDefault to work
		
		bottomPlaylistContainer._wheelListenerAdded = true; // Flag to prevent re-adding
	}
});

// Mouse wheel handler for slider — step 2 display % per tick, convert to gain
volumeSlider.addEventListener("wheel", (e) => {
	e.preventDefault();
	const step = e.deltaY > 0 ? -2 : 2; // 2 display % per tick
	let newDisplayPct = parseInt(volumeSlider.value) + step;
	newDisplayPct = Math.max(0, Math.min(newDisplayPct, 200));

	const gain = pctToGain(newDisplayPct);
	updateVolume(gain, 'wheel');
	showTooltip(newDisplayPct, e);
});

// Initialize tooltip for font size
const fontSizeTooltip = document.createElement("div");
fontSizeTooltip.style.position = "absolute";
fontSizeTooltip.style.top = "60px";
fontSizeTooltip.style.right = "25px";
fontSizeTooltip.style.color = "white";
fontSizeTooltip.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.863), -1px -1px 2px rgba(0, 0, 0, 0.733), 1px -1px 2px rgba(0, 0, 0, 0.707),-1px 1px 2px black";
fontSizeTooltip.style.padding = "5px 10px";
fontSizeTooltip.style.transition = "opacity 0.3s";
fontSizeTooltip.style.borderRadius = "5px";
fontSizeTooltip.style.zIndex = "1000";
fontSizeTooltip.style.display = "none"; // Initially hidden
mediaPlayer.appendChild(fontSizeTooltip);

let fontSize = loadFontSize() || defaultFontSize;

// Set initial subtitle font size via CSS custom property
document.documentElement.style.setProperty('--subtitle-font-size', `${fontSize}px`);

// Function to save font size to local storage
function saveFontSize(size) {
	localStorage.setItem("fontSize", size);
}

// Function to load font size from local storage
function loadFontSize() {
	return parseInt(localStorage.getItem("fontSize"));
}

// ── Track whether the physical Ctrl key is actually held ──────────────────────
// On Windows, Chromium synthesises wheel events with ctrlKey:true for trackpad
// pinch gestures — even when the user never touched the Ctrl key.
// By tracking the real keydown/keyup we can distinguish:
//   ctrlKey:true + _ctrlPhysicallyDown:false  →  trackpad pinch  →  video zoom
//   ctrlKey:true + _ctrlPhysicallyDown:true   →  keyboard Ctrl   →  font size
let _ctrlPhysicallyDown = false;
document.addEventListener('keydown', (e) => { if (e.key === 'Control') _ctrlPhysicallyDown = true;  }, true);
document.addEventListener('keyup',   (e) => { if (e.key === 'Control') _ctrlPhysicallyDown = false; }, true);

function handleMediaWheel(event) {
	// Always prevent default — stops browser zoom on Ctrl+pinch and seek-bar
	// scroll bleeding through
	event.preventDefault();
	event.stopPropagation();

	// If the mouse is over the playlist, allow it to scroll naturally
	if (isMouseOver) return;

	const isPinchGesture = event.ctrlKey && !_ctrlPhysicallyDown;

	if (event.ctrlKey && event.shiftKey && _ctrlPhysicallyDown) {
		// ── Keyboard Ctrl+Shift+scroll → video zoom (legacy shortcut) ──────────
		if (event.deltaY < 0) {
			scale = Math.min(scale + 0.05, maxZoom);
		} else {
			scale = Math.max(scale - 0.05, minZoom);
		}
		applyTransformations();
		video.style.transformOrigin = "center center";
		showStatusMessage(`Zoom: ${Math.round(scale * 100)}%`);

	} else if (isPinchGesture) {
		// ── Trackpad pinch (Windows/Linux) → video zoom ──────────────────────
		// deltaY is negative when pinching out (zoom in), positive when pinching in
		// Use exponential scaling so small and large deltas feel proportional
		const factor = Math.pow(pinchZoomSensitivity, event.deltaY); // smoother step
		scale = Math.max(minZoom, Math.min(maxZoom, scale * factor));
		applyTransformations();
		video.style.transformOrigin = "center center";
		showStatusMessage(`Zoom: ${Math.round(scale * 100)}%`);

	} else if (event.ctrlKey && _ctrlPhysicallyDown) {
		// ── Physical Ctrl+scroll → font size (title + subtitle synced) ────────
		if (event.deltaY < 0) {
			fontSize = Math.min(maxFontSize, fontSize + 2);
		} else {
			fontSize = Math.max(minFontSize, fontSize - 2);
		}

		videoTitleElement.style.fontSize = `${fontSize}px`;
		fontSizeTooltip.style.fontSize = `${fontSize}px`;

	} else {
		// Volume: step 2 display-% per tick, convert through VLC cubic curve
		const currentDisplayPct = gainToPct(gainNode.gain.value);
		const step = event.deltaY > 0 ? -2 : 2;
		const newDisplayPct = Math.max(0, Math.min(200, currentDisplayPct + step));
		const newGain = pctToGain(newDisplayPct);

		updateVolume(newGain, 'wheel');

		showStatusMessage(`Volume: ${newDisplayPct}%`, newDisplayPct > 100 ? 'vol-high' : 'vol-normal');

		tooltip.style.left = `${event.pageX}px`;
		tooltip.style.top = `${event.pageY - 30}px`;
		tooltip.textContent = `Volume: ${newDisplayPct}%`;
		tooltip.style.display = "block";

		setTimeout(() => {
			tooltip.style.display = "none";
		}, 3900);
	}
}

mediaPlayer.addEventListener("wheel", handleMediaWheel, { passive: false });
video.addEventListener("wheel", handleMediaWheel, { passive: false });

// Update the volume button icon and tooltip
function updateVolumeIcon() {
	const gain = gainNode.gain.value;
	const pct  = gainToPct(gain); // 0-200 display %
	if (gain === 0) {
		volumeBtn.src = "../../assets/icons/volume-mute.png";
		volumeBtn.setAttribute("title", "Unmute");
	} else if (pct < 40) {       // < 40% display = gain < 0.064
		volumeBtn.src = "../../assets/icons/volume-low.png";
		volumeBtn.setAttribute("title", "Volume Low");
	} else if (pct <= 100) {     // 40-100% display = unity and below
		volumeBtn.src = "../../assets/icons/volume.png";
		volumeBtn.setAttribute("title", "Normal Volume");
	} else {                      // > 100% = boosted
		volumeBtn.src = "../../assets/icons/volume-high.png";
		volumeBtn.setAttribute("title", "Mute");
	}
}

// Mute/Unmute functionality for volume button
let previousVolume = gainNode.gain.value; // To store the previous volume

volumeBtn.addEventListener("click", () => {
	if (gainNode.gain.value > 0) {
		previousVolume = gainNode.gain.value; // Store current volume
		updateVolume(0); // Mute
	} else {
		updateVolume(previousVolume || 0.1); // Restore volume or set default to 10%
	}

	// Save mute state
	localStorage.setItem("muteState", gainNode.gain.value === 0);
});

// Mute/Unmute functionality for multiple buttons
mute.forEach((muteButton) => {
	muteButton.addEventListener("click", () => {
		if (gainNode.gain.value > 0) {
			muteButton.textContent = "Unmute"; // Update button text
			previousVolume = gainNode.gain.value; // Store the current volume
			updateVolume(0); // Mute the volume
		} else {
			muteButton.textContent = "Mute"; // Update button text
			updateVolume(previousVolume || 0.1); // Restore the previous volume or default to 10%
		}

		// Save mute state
		localStorage.setItem("muteState", gainNode.gain.value === 0);
	});
});




// Move functionality with CTRL + Shift + Left-Click
video.addEventListener("mousedown", (event) => {
	if (event.ctrlKey && event.shiftKey) {
		isPanning = true;
		startX = event.clientX - panX;
		startY = event.clientY - panY;
		video.style.cursor = "move"; // Change cursor to indicate panning
		event.preventDefault(); // Prevent text selection or other default behavior
	}
});

document.addEventListener("mousemove", (event) => {
	if (isPanning) {
		let dx = event.clientX - startX;
		let dy = event.clientY - startY;

		const rotationAngle = parseInt(video.dataset.rotation) || 0;

		// Adjust pan direction based on rotation
		switch (rotationAngle) {
			case 90:
				// When rotated 90 degrees, move left-right becomes up-down and vice versa
				panX += dy;
				panY -= dx;
				break;
			case -90:
				// When rotated -90 degrees, move left-right becomes up-down and vice versa (opposite)
				panX -= dy;
				panY += dx;
				break;
			case 180:
				// When rotated 180 degrees, left-right and up-down are reversed
				panX -= dx;
				panY -= dy;
				break;
			default:
				// Normal panning for 0 or no rotation
				panX += dx;
				panY += dy;
				break;
		}

		// Update pan start position for smooth panning
		startX = event.clientX;
		startY = event.clientY;

		// Apply the updated transformations
		applyTransformations();
	}
});


document.addEventListener("mouseup", () => {
	isPanning = false; // Stop panning when mouse is released
	video.style.cursor = "default"; // Reset cursor
});

// ── Pinch-to-zoom: trackpad (pointer events) + touchscreen ──────────────────
// Works with two-finger pinch on trackpad and touchscreen devices.
// Persists scale state per-video alongside existing zoom infrastructure.
let _pinchActive   = false;
let _pinchStartDist = 0;
let _pinchStartScale = 1;
let _pinchMidX = 0;
let _pinchMidY = 0;

function _pinchDist(touches) {
	const dx = touches[0].clientX - touches[1].clientX;
	const dy = touches[0].clientY - touches[1].clientY;
	return Math.sqrt(dx * dx + dy * dy);
}

mediaPlayer.addEventListener('touchstart', (e) => {
	if (e.touches.length === 2) {
		_pinchActive    = true;
		_pinchStartDist = _pinchDist(e.touches);
		_pinchStartScale = scale;
		_pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
		_pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
		e.preventDefault();
	}
}, { passive: false });

mediaPlayer.addEventListener('touchmove', (e) => {
	if (_pinchActive && e.touches.length === 2) {
		const dist  = _pinchDist(e.touches);
		const ratio = dist / (_pinchStartDist || 1);
		scale = Math.max(minZoom, Math.min(maxZoom, _pinchStartScale * ratio));
		applyTransformations();
		e.preventDefault();
	}
}, { passive: false });

mediaPlayer.addEventListener('touchend', (e) => {
	if (e.touches.length < 2 && _pinchActive) {
		_pinchActive = false;
		showStatusMessage(`Zoom: ${Math.round(scale * 100)}%`);
	}
}, { passive: true });

// Also support trackpad pinch via pointer events (Electron/Chromium exposes this)
// Chromium fires 'gesturechange' for native trackpad pinch on macOS
mediaPlayer.addEventListener('gesturestart',  (e) => { _pinchStartScale = scale; e.preventDefault(); }, { passive: false });
mediaPlayer.addEventListener('gesturechange', (e) => {
	const gestureScale = 1 + (e.scale - 1) * 0.75; // dampen native pinch sensitivity
	scale = Math.max(minZoom, Math.min(maxZoom, _pinchStartScale * gestureScale));
	applyTransformations();
	e.preventDefault();
}, { passive: false });
mediaPlayer.addEventListener('gestureend',    (e) => {
	showStatusMessage(`Zoom: ${Math.round(scale * 100)}%`);
	e.preventDefault();
}, { passive: false });

video.addEventListener('touchstart', (e) => {
	if (e.touches.length === 2) {
		_pinchActive = true;
		_pinchStartDist = _pinchDist(e.touches);
		_pinchStartScale = scale;
		_pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
		_pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
		e.preventDefault();
		e.stopPropagation();
	}
}, { passive: false });

video.addEventListener('touchmove', (e) => {
	if (_pinchActive && e.touches.length === 2) {
		const dist = _pinchDist(e.touches);
		const ratio = dist / (_pinchStartDist || 1);
		scale = Math.max(minZoom, Math.min(maxZoom, _pinchStartScale * ratio));
		applyTransformations();
		e.preventDefault();
		e.stopPropagation();
	}
}, { passive: false });

video.addEventListener('touchend', (e) => {
	if (e.touches.length < 2 && _pinchActive) {
		_pinchActive = false;
		showStatusMessage(`Zoom: ${Math.round(scale * 100)}%`);
	}
	e.stopPropagation();
}, { passive: true });

video.addEventListener('gesturestart', (e) => { _pinchStartScale = scale; e.preventDefault(); e.stopPropagation(); }, { passive: false });
video.addEventListener('gesturechange', (e) => {
	const gestureScale = 1 + (e.scale - 1) * 0.75;
	scale = Math.max(minZoom, Math.min(maxZoom, _pinchStartScale * gestureScale));
	applyTransformations();
	e.preventDefault();
	e.stopPropagation();
}, { passive: false });
video.addEventListener('gestureend', (e) => {
	showStatusMessage(`Zoom: ${Math.round(scale * 100)}%`);
	e.preventDefault();
	e.stopPropagation();
}, { passive: false });

// Function to apply both zoom, pan, and rotation
function applyTransformations() {
	const rotationAngle = parseInt(video.dataset.rotation) || 0;

	// Apply zoom, pan, and rotation together
	video.style.transform = `rotate(${rotationAngle}deg) scale(${scale}) translate(${panX}px, ${panY}px)`;
	video.style.transformOrigin = "center center"; // Adjust zoom origin
}

// Reset zoom and pan function
function resetZoom() {
	scale = 1;
	panX = 0;
	panY = 0;
	currentZoomIndex = 0;

	// Reset the CSS transform for zoom, pan, and maintain rotation
	applyTransformations();
	updateZoomMenuUI();
}

// Toggle shuffle mode
function toggleShuffleMode() {
	isShuffle = !isShuffle;
	updateShuffleUI();
	updatePlaybackState();
	window.electron.sendShuffleState(isShuffle ? "on" : "off");

	// Clear all history when turning off shuffle
	if (!isShuffle) {
		playedVideos    = [];
		navigationHistory = [];
		shuffleBack     = [];
		shuffleFwd      = [];
		lastPlayedStack = [];
	}
}

function updateShuffleUI() {
	if (isShuffle) {
		shuffleButton.classList.add("active");
		shuffleButton.src = "../../assets/icons/shuffle.png";
		showStatusMessage("Shuffle: On");
		shuffleButton.title = "Shuffle off";
	} else {
		shuffleButton.classList.remove("active");
		shuffleButton.src = "../../assets/icons/no-shuffle.png";
		showStatusMessage("Shuffle: Off");
		shuffleButton.title = "Shuffle on";
	}
}

// Toggle repeat mode
function toggleRepeat() {
	// Cycle through states: off → one → all → off
	isRepeatMode = (isRepeatMode + 1) % 3;
	updateRepeatUI();
	updatePlaybackState();
	window.electron.sendRepeatState(getRepeatStateString());

	// Apply loop setting for single repeat mode
	if (currentMedia) {
		currentMedia.loop = isRepeatMode === 1; // Only loop for single mode
	}
}

function updateRepeatUI() {
	switch (isRepeatMode) {
		case 0:
			showStatusMessage("Loop: Off");
			loopBtn.src = "../../assets/icons/repeat-on.png";
			iconContainer.classList.add('off');
			loopBtn.parentElement.setAttribute('data-tooltip', 'Loop off');
			break;
		case 1:
			showStatusMessage("Loop: One");
			loopBtn.src = "../../assets/icons/repeat-one.png";
			iconContainer.classList.remove('off');
			loopBtn.parentElement.setAttribute('data-tooltip', 'Loop one');
			break;
		case 2:
			showStatusMessage("Loop: All");
			loopBtn.src = "../../assets/icons/repeat-on.png";
			iconContainer.classList.remove('off');
			loopBtn.parentElement.setAttribute('data-tooltip', 'Loop All');
			break;
		default:
			loopBtn.src = "../../assets/icons/repeat-on.png";
			iconContainer.classList.add('off');
			loopBtn.parentElement.setAttribute('data-tooltip', 'Loop off');
			break;
	}
}

function getRepeatStateString() {
	switch (isRepeatMode) {
		case 0:
			return "off";
		case 1:
			return "one";
		case 2:
			return "all";
		default:
			return "off";
	}
}

function updatePlaybackState() {
	const state = video.paused ? 'paused' : 'playing';
	window.electron.sendPlayPauseStateForTray(state);
	window.electron.sendPlayPauseStateForThumbar(state);

	// Update shuffle and repeat states - use the correct variable names
	window.electron.sendShuffleState(isShuffle ? 'on' : 'off');
	window.electron.sendRepeatState(getRepeatStateString());
}

// Call this whenever playback state changes
video.addEventListener('play', updatePlaybackState);
video.addEventListener('pause', updatePlaybackState);
video.addEventListener('ended', updatePlaybackState);


window.electron.onInitialPlayState((state) => {
	if (state === 'playing' && video.paused) video.play();
	if (state === 'paused' && !video.paused) video.pause();
	updatePlaybackState();
});

// Event listener for shuffle mode button loopbutton, switchtrack button and Full screen 
document.getElementById("shuffle-button").addEventListener("click", toggleShuffleMode);
loopBtn.addEventListener("click", toggleRepeat);

// Select the full-screen button elements
const fullscreenButtons = document.querySelectorAll(".fullscreen-button");

// Function to update the fullscreen button UI
function updateFullscreenIcon(fullscreen) {
	isFullscreen = fullscreen;

	// Update bottom-bar fullscreen button (image-based)
	fullscreenButtons.forEach(button => {
		const img = button.querySelector("img");
		if (img) {
			img.src = isFullscreen ?
				"../../assets/icons/exit-full-screen.png" :
				"../../assets/icons/full-screen.png";
		}
		// Update FA icon if present (context menu / nav bar)
		const icon = button.querySelector(".svg-icon");
		if (icon) {
			icon.src = isFullscreen ?
				"../../assets/icons/fa/compress.svg" :
				"../../assets/icons/fa/expand.svg";
		}
		// Update text span if present (nav bar)
		const textSpan = button.querySelector(".nav-row-text");
		if (textSpan) {
			textSpan.textContent = isFullscreen ? "Exit Full Screen" : "Full Screen";
		}
		// Update cm-text if present (context menu)
		const cmText = button.querySelector(".cm-text");
		if (cmText) {
			cmText.textContent = isFullscreen ? "Exit Full Screen" : "Full Screen";
		}
	});
}

// Fullscreen toggle function
function toggleFullScreen() {
	// ── FIX 3: Don't toggle fullscreen when any modal is open ───────────
	if (ModalAnimator.activeModals.size > 0) return;
	window.electron.toggleFullscreen();
}

// ── Audio-only background mode ────────────────────────────────────────────────
// Hides the video element so the OS compositor doesn't decode frames while the
// tab is hidden. Audio pipeline is untouched — music keeps playing.
function toggleAudioOnlyMode() {
	_audioOnlyMode = !_audioOnlyMode;
	if (_audioOnlyMode) {
		video.style.visibility = 'hidden';
		showStatusMessage('🎵 Audio-only mode: On');
		document.title = (mediaFiles[currentVideoIndex] || '').split(/[\\/]/).pop() || 'Playing';
	} else {
		video.style.visibility = '';
		showStatusMessage('🎬 Video mode restored');
		document.title = 'Anime Player';
	}
}

// Handle fullscreen button click
fullscreenButtons.forEach(btn => {
	btn.addEventListener("click", toggleFullScreen);
});


// Prevent double-click on controls from bubbling up
document.querySelector('.video-controls-container')?.addEventListener('dblclick', function(e) {
	e.stopPropagation();
});

// Prevent double-click on left arrow
document.querySelector('.left-arrow')?.addEventListener('dblclick', function(e) {
	e.stopPropagation();
});

// Prevent double-click on right arrow
document.querySelector('.right-arrow')?.addEventListener('dblclick', function(e) {
	e.stopPropagation();
});

// Prevent double-click on nav element
document.querySelector('nav')?.addEventListener('dblclick', function(e) {
	e.stopPropagation();
});

// Fullscreen toggle for media player
mediaPlayer?.addEventListener("dblclick", toggleFullScreen);

// Listen for fullscreen state changes
window.electron.onFullscreenStateChanged((isFullscreen) => {
	updateFullscreenIcon(isFullscreen);
});

// Initialize fullscreen icon state on load
window.addEventListener('DOMContentLoaded', () => {
	// Request current fullscreen state from main process
	window.electron.invoke('get-fullscreen-state')
		.then(isFullscreen => {
			updateFullscreenIcon(isFullscreen);
		})
		.catch(() => {
			// Fallback: assume not fullscreen
			updateFullscreenIcon(false);
		});
});


// Function to update the PiP button tooltip
function updatePiPTooltip(isPiP) {
	pipButton.title = isPiP ? "Exit Picture-in-Picture" : "Enter Picture-in-Picture";
}

// Toggle PiP mode
function togglePiPMode() {
	if (!document.pictureInPictureElement) {
		video.requestPictureInPicture()
			.then(() => updatePiPTooltip(true))
			.catch((error) => {
				// console.error("Failed to enter Picture-in-Picture mode:", error);
			});
	} else {
		document.exitPictureInPicture()
			.then(() => updatePiPTooltip(false))
			.catch((error) => {
				// console.error("Failed to exit Picture-in-Picture mode:", error);
			});
	}
}

// Event listener for PiP mode button
pipButton.addEventListener("click", togglePiPMode);

document.addEventListener("DOMContentLoaded", function() {
	const navbar = document.querySelector("nav");
	const Mediacontrols = document.querySelector(".video-controls-container");
	const video = document.querySelector("video");
	const navArrows = document.querySelector(".nav-arrows");
	const winButton = document.querySelector(".win-buttons");
	let hideTimeout;

	// Function to hide navbar, Mediacontrols, nav arrows, and cursor
	function hideControls() {
		if (!video.paused) {
			video.style.cursor = "none";

			navbar.classList.remove("visible");
			navbar.classList.add("hidden");

			Mediacontrols.classList.remove("visible");
			Mediacontrols.classList.add("hidden");

			navArrows.classList.add("hidden");
			winButton.classList.remove("visible");
			winButton.classList.add("hidden");
		}
	}

	// Function to show navbar, Mediacontrols, nav arrows, and cursor
	function showControls() {
		video.style.cursor = "default";

		navbar.classList.remove("hidden");
		navbar.classList.add("visible");

		Mediacontrols.classList.remove("hidden");
		Mediacontrols.classList.add("visible");

		navArrows.classList.remove("hidden");
		winButton.classList.remove("hidden");
		winButton.classList.add("visible")

		// Clear the previous timeout and start a new one to hide controls after 1000ms
		clearTimeout(hideTimeout);

		if (!video.paused) {
			// Only start hide timeout if video is loaded and playing
			hideTimeout = setTimeout(hideControls, 1000); // Hide after 1000ms of inactivity
		}
	}

	// Event listener for when the video's metadata is loaded
	video.addEventListener("loadedmetadata", function() {
		hideTimeout = setTimeout(hideControls, 1000); // Start hide timeout
	});

	// Event listener for when the video is paused
	video.addEventListener("pause", showControls);

	// Event listener for when the video is played
	video.addEventListener("play", function() {
		hideTimeout = setTimeout(hideControls, 1000); // Hide controls shortly after playing
	});

	// Show controls when the mouse moves and reset the timeout
	video.addEventListener("mousemove", showControls);

	// Event listener for the left mouse button to hide/show controls
	video.addEventListener("click", function(event) {
		if (event.button === 0) {
			togglePlayPause();
			// 0 is the left mouse button
			if (navbar.classList.contains("hidden")) {
				showControls();
			} else {
				hideControls();
			}
		}
	});

	// Stop hiding controls on mouseover of any interactive UI elements
	[navbar, navArrows, winButton, Mediacontrols].forEach((element) => {
		element.addEventListener("mouseover", () => clearTimeout(hideTimeout));
	});

	// Ensure controls are shown on initial load
	showControls();


	function positionDropdown(dropdown, parentElement) {
		if (!dropdown || !parentElement) return;

		const rect = parentElement.getBoundingClientRect();
		const dropdownHeight = dropdown.offsetHeight || 400; // Fallback height
		const viewportHeight = window.innerHeight;
		const spaceBelow = viewportHeight - rect.bottom;
		const spaceAbove = rect.top;

		// Remove previous positioning classes
		dropdown.classList.remove('open-upward', 'open-downward');

		// If not enough space below, open upward
		if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
			dropdown.classList.add('open-upward');
			dropdown.style.bottom = '0';
			dropdown.style.top = 'auto';
		} else {
			// Open downward (default)
			dropdown.classList.add('open-downward');
			dropdown.style.top = '0';
			dropdown.style.bottom = 'auto';
		}
	}


	// ── Function to adjust submenu positions dynamically ──
	// This ensures submenus stay within the viewport both vertically and horizontally
	function adjustSubmenuPositions(contextMenu, menuTop, menuLeft, screenHeight, screenWidth) {
		const SUBMENU_MARGIN = 10; // pixels to keep from screen edge
		const contextMenuWidth = contextMenu.offsetWidth;

		// Set up hover listeners on parent items to adjust submenu positions
		const parentItems = contextMenu.querySelectorAll('.cm-sub-item');

		parentItems.forEach(parentItem => {
			const submenu = parentItem.querySelector('.cm-submenu');
			if (!submenu) return;

			// Update on hover to handle dynamic content changes
			parentItem.addEventListener('mouseenter', () => {
				adjustSingleSubmenuPosition(parentItem, submenu, menuTop, menuLeft, screenHeight, screenWidth, contextMenuWidth);
			});
		});

		// Also do initial pass on all submenus
		parentItems.forEach(parentItem => {
			const submenu = parentItem.querySelector('.cm-submenu');
			if (submenu) {
				adjustSingleSubmenuPosition(parentItem, submenu, menuTop, menuLeft, screenHeight, screenWidth, contextMenuWidth);
			}
		});
	}

	function adjustSingleSubmenuPosition(parentItem, submenu, menuTop, menuLeft, screenHeight, screenWidth, contextMenuWidth) {
		// Force reflow to get accurate measurements
		const submenuHeight = submenu.offsetHeight;
		const submenuWidth = submenu.offsetWidth;
		const parentRect = parentItem.getBoundingClientRect();

		// Calculate submenu position relative to viewport
		const submenuTopPos = parentRect.top; // relative to viewport
		const submenuBottomPos = parentRect.bottom; // relative to viewport

		// ── VERTICAL ADJUSTMENT ──
		// Check if submenu would extend below screen
		let topValue = 'auto';
		let bottomValue = 'auto';

		// Try to align submenu top with parent item top (top: -4px keeps natural alignment)
		const proposedTop = submenuTopPos - menuTop;

		// Check if submenu fits below parent item
		if (submenuTopPos + submenuHeight > screenHeight - 10) {
			// Not enough space below — try to position so it fits above
			const spaceAbove = submenuTopPos - submenuHeight;
			if (spaceAbove < 10) {
				// Not enough space above either — align to top of screen with margin
				topValue = `${10 - menuTop}px`;
			} else {
				// Position above the parent item
				topValue = `${-submenuHeight - 4}px`;
			}
		} else {
			// Enough space below — use default positioning (top: -4px aligns with parent)
			topValue = '-4px';
		}

		submenu.style.top = topValue;
		submenu.style.bottom = bottomValue;

		// ── HORIZONTAL ADJUSTMENT ──
		// The horizontal flipping is already handled in showContextMenu
		// But we need to add proper margin to prevent touch-edge overflow

		// Get current left/right values
		const currentLeft = submenu.style.left;
		const currentRight = submenu.style.right;

		// Check right-opening submenu
		const openingLeft = currentRight && currentRight !== 'auto';
		if (!openingLeft) {
			// Submenu opens to the right (left: 100%)
			const submenuRightEdge = menuLeft + contextMenuWidth + submenuWidth;
			if (submenuRightEdge > screenWidth - 10) {
				// Would overflow right edge
				submenu.style.left = 'auto';
				submenu.style.right = '100%';
				submenu.style.marginRight = '12px';
				submenu.style.marginLeft = 'auto';
				parentItem.classList.add('open-left');
				submenu.classList.add('open-left');
			} else {
				submenu.style.left = '100%';
				submenu.style.right = 'auto';
				submenu.style.marginLeft = '12px';
				submenu.style.marginRight = 'auto';
				parentItem.classList.remove('open-left');
				submenu.classList.remove('open-left');
			}
		} else {
			// Submenu opens to the left (right: 100%)
			const submenuLeftEdge = menuLeft - submenuWidth;
			if (submenuLeftEdge < 10) {
				// Would overflow left edge — flip back to right
				submenu.style.left = '100%';
				submenu.style.right = 'auto';
				submenu.style.marginLeft = '12px';
				submenu.style.marginRight = 'auto';
				parentItem.classList.remove('open-left');
				submenu.classList.remove('open-left');
			} else {
				submenu.style.right = '100%';
				submenu.style.left = 'auto';
				submenu.style.marginRight = '12px';
				submenu.style.marginLeft = 'auto';
				parentItem.classList.add('open-left');
				submenu.classList.add('open-left');
			}
		}
	}


	// ── FIX 5: Delay-based submenu hover — prevents gap-close bug ──────
	// CSS :hover menus close when the cursor crosses the gap between
	// parent item and submenu. This JS approach uses an 80ms grace timer
	// and checks relatedTarget to avoid false mouseleave fires.
	function _initSubmenuHover(ctxMenu) {
		let _hideTimer = null;

		ctxMenu.querySelectorAll('.cm-sub-item').forEach(parentItem => {
			const submenu = parentItem.querySelector('.cm-submenu');
			if (!submenu) return;

			function scheduleHide() {
				clearTimeout(_hideTimer);
				_hideTimer = setTimeout(() => {
					submenu.classList.remove('cm-submenu-visible');
				}, 80);
			}

			function cancelHide() {
				clearTimeout(_hideTimer);
			}

			parentItem.addEventListener('mouseenter', () => {
				// Hide all sibling submenus first
				ctxMenu.querySelectorAll('.cm-submenu.cm-submenu-visible').forEach(s => {
					if (s !== submenu) s.classList.remove('cm-submenu-visible');
				});
				cancelHide();
				submenu.classList.add('cm-submenu-visible');
			});

			parentItem.addEventListener('mouseleave', (e) => {
				if (submenu.contains(e.relatedTarget)) {
					cancelHide(); // cursor moved directly into submenu — no gap
				} else {
					scheduleHide();
				}
			});

			submenu.addEventListener('mouseenter', cancelHide);
			submenu.addEventListener('mouseleave', (e) => {
				if (!parentItem.contains(e.relatedTarget)) {
					scheduleHide();
				}
			});
		});
	}

	// Function to show the context menu
	function showContextMenu(event) {
		event.preventDefault();
		isContextMenuVisible = true;

		const {
			clientX: mouseX,
			clientY: mouseY
		} = event;
		const {
			innerWidth: screenWidth,
			innerHeight: screenHeight
		} = window;

		// Show menu to calculate real dimensions (visibility:hidden so not visible yet)
		contextMenu.style.display = "block";
		contextMenu.style.visibility = "hidden";

		// Reset any previously flipped submenu directions before measuring
		contextMenu.querySelectorAll('.cm-submenu').forEach(sub => {
			sub.style.left  = '';
			sub.style.right = '';
		});

		// Force reflow to get accurate measurements
		const contextMenuHeight = contextMenu.scrollHeight;
		const contextMenuWidth  = contextMenu.offsetWidth;

		let top  = mouseY;
		let left = mouseX;

		// ── Vertical: flip upward if not enough space below ──────────────────
		if (mouseY + contextMenuHeight > screenHeight - 20) {
			top = Math.max(10, mouseY - contextMenuHeight);
		}
		top = Math.max(10, Math.min(top, screenHeight - contextMenuHeight - 10));

		// ── Horizontal: flip to the left if not enough space on right ─────────
		// Also account for the widest possible submenu (viz panel = 280px)
		const SUBMENU_WIDTH = 300; // conservative estimate for any submenu
		const menuFitsRight = left + contextMenuWidth + SUBMENU_WIDTH < screenWidth - 10;

		if (mouseX + contextMenuWidth > screenWidth - 20) {
			// Menu itself doesn't fit right — shift it left
			left = Math.max(10, mouseX - contextMenuWidth);
		}
		left = Math.max(10, Math.min(left, screenWidth - contextMenuWidth - 10));

		// ── Submenus: flip to LEFT side when context menu is near right edge ──
		// When there isn't room for a submenu to open to the right of the menu,
		// point all submenus leftward (left:auto; right:100%).
		const spaceForSubmenus = screenWidth - (left + contextMenuWidth);
		if (spaceForSubmenus < SUBMENU_WIDTH) {
			// Not enough room on the right — flip all submenus to open LEFT
			contextMenu.querySelectorAll('.cm-submenu').forEach(sub => {
				sub.style.left  = 'auto';
				sub.style.right = '100%';
				sub.style.marginLeft = 'auto';
				sub.style.marginRight = '12px';
				sub.classList.add('open-left');
				const parent = sub.closest('.cm-sub-item');
				if (parent) parent.classList.add('open-left');
			});
		} else {
			// Enough room on the right — use default (left:100%)
			contextMenu.querySelectorAll('.cm-submenu').forEach(sub => {
				sub.style.left  = '100%';
				sub.style.right = 'auto';
				sub.style.marginLeft = '12px';
				sub.style.marginRight = 'auto';
				sub.classList.remove('open-left');
				const parent = sub.closest('.cm-sub-item');
				if (parent) parent.classList.remove('open-left');
			});
		}

		// Apply position and make visible
		contextMenu.style.top  = `${top}px`;
		contextMenu.style.left = `${left}px`;
		contextMenu.style.visibility = "visible";

		// ── Adjust submenu vertical positions to stay within viewport ──
		adjustSubmenuPositions(contextMenu, top, left, screenHeight, screenWidth);
		// ── FIX 5: Re-init JS hover each time menu opens (handles dynamic content) ──
		_initSubmenuHover(contextMenu);

		updateContextTogglePlayPause();
	}

	function hideContextMenu() {
		contextMenu.style.display = "none";
		contextMenu.style.visibility = "visible";
	}
	// Expose globally so functions outside this closure (renderChaptersList, etc.) can close the menu
	window._hideContextMenu = hideContextMenu;

	// Attach event listeners
	mediaPlayer.addEventListener("contextmenu", showContextMenu);

	// Scroll to highlighted item when context menu playlist sub-panel opens
	const cmPlaylistItem = document.getElementById('context-menu-playlist');
	if (cmPlaylistItem) {
		cmPlaylistItem.addEventListener('mouseenter', () => {
			requestAnimationFrame(() => {
				const cmPlaylist = cmPlaylistItem.querySelector('.play-list');
				if (cmPlaylist) scrollToHighlighted(cmPlaylist);
			});
		});
	}

	document.addEventListener("click", (e) => {
		if (!contextMenu.contains(e.target)) {
			hideContextMenu();
		}
	});

	// Prevent dropdown from closing when clicking inside
	contextMenu.addEventListener("click", (e) => {
		if (e.target.closest(".sub-dropdown")) {
			e.stopPropagation();
		}
	});

	// UPDATE TOGGLE PLAY/PAUSE
	function updateContextTogglePlayPause() {
		const contextTogglePlayPause = document.querySelector("#contextTogglePlayPause");
		if (!contextTogglePlayPause) return;

		const textElement = contextTogglePlayPause.querySelector(".cm-text");
		const iconElement = contextTogglePlayPause.querySelector(".cm-icon");

		if (video.paused) {
			textElement.innerText = "Play";
			iconElement.innerHTML = '<img class="svg-icon" src="../../assets/icons/fa/play.svg" alt="">';
		} else {
			textElement.innerText = "Pause";
			iconElement.innerHTML = '<img class="svg-icon" src="../../assets/icons/fa/pause.svg" alt="">';
		}
	}

	// HANDLE CONTEXT MENU CLICKS
	const contextMenuItems = document.querySelectorAll(".context-menu ul li a");

	contextMenuItems.forEach((item) => {
		item.addEventListener("click", (event) => {
			const target = event.target;

			// Handle specific leaf actions first (even if inside a sub-item)
			if (target.closest("#contextOpenFile")) {
				hideContextMenu();
				openFileButton.click();
				return;
			} else if (target.closest("#contextOpenFolder")) {
				hideContextMenu();
				openFolderButton.click();
				return;
			} else if (target.closest("#contextTogglePlayPause")) {
				togglePlayPause();
				hideContextMenu();
				return;
			} else if (target.closest("#context-menu-shutdown-timer")) {
				showTimerContainer(true);
				hideContextMenu();
				return;
			}

			// Don't close if clicking a sub-menu trigger
			if (target.closest(".cm-sub-item")) {
				return;
			}

			hideContextMenu();
		});
	});
	loadSaturationValue();
	// Apply smart positioning to all sub-dropdowns
	document.querySelectorAll('.sub-dropdown').forEach(dropdown => {
		dropdown.addEventListener('mouseenter', function() {
			const dropdownContent = this.querySelector('.sub-dropdown-content');
			if (dropdownContent) {
				// Small delay to ensure dropdown is rendered
				setTimeout(() => {
					positionDropdown(dropdownContent, this);
				}, 1);
			}
		});
	});

	let resizeTimeout;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			if (contextMenu.style.display === "block") {
				// Reposition if menu is open
				const currentTop = parseInt(contextMenu.style.top);
				const currentLeft = parseInt(contextMenu.style.left);

				// Create synthetic event for repositioning
				const syntheticEvent = {
					preventDefault: () => {},
					clientX: currentLeft,
					clientY: currentTop
				};

				showContextMenu(syntheticEvent);
			}
		}, 250);
	});
});

// ✅ Format time to HH:MM:SS
function formatTime(time) {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = Math.floor(time % 60)
		.toString()
		.padStart(2, "0");

	const formattedHours = hours > 0 ? `${hours}:` : "";
	const formattedMinutes = minutes.toString().padStart(2, "0");

	return `${formattedHours}${formattedMinutes}:${seconds}`;
}

// ✅ Update the seek bar and handle position
function updateSeekBar() {
	if (video && video.duration && !isNaN(video.duration)) {
		const progress = (video.currentTime / video.duration) * 100;
		seekBar.style.width = `${progress}%`;
		seekBarHandle.style.left = `${progress}%`;
		currentTimeDisplay.textContent = formatTime(video.currentTime);
		seekBarHandle.style.display = "block";
	} else {
		seekBarHandle.style.display = "none";
		currentTimeDisplay.textContent = "0:00:00";
	}
}

// ✅ Function to update duration display
function updateDurationDisplay() {
	if (video && video.duration && !isNaN(video.duration)) {
		if (showRemainingTime) {
			const remainingTime = video.duration - video.currentTime;
			durationDisplay.textContent = `-${formatTime(remainingTime)}`;
		} else {
			durationDisplay.textContent = formatTime(video.duration);
		}
	} else {
		durationDisplay.textContent = "0:00:00";
	}
}

// Sync the seek bar and duration display when the video is playing
video.addEventListener("timeupdate", () => {
	updateSeekBar();
	updateDurationDisplay();

	// ── Auto-mark watched at 85% playthrough ─────────────────────────────────
	const filePath = mediaFiles[currentVideoIndex];
	if (filePath && video.duration && !isNaN(video.duration) && video.duration > 0) {
		const progress = video.currentTime / video.duration;
		if (progress >= 0.85) {
			const watchedKey = 'watched:' + filePath;
			if (!localStorage.getItem(watchedKey)) {
				localStorage.setItem(watchedKey, Date.now());
				// Accumulate stats
				try {
					const stats = JSON.parse(localStorage.getItem('_playerStats') || '{}');
					stats.episodesCompleted = (stats.episodesCompleted || 0) + 1;
					localStorage.setItem('_playerStats', JSON.stringify(stats));
				} catch {}
				// Mark playlist item visually
				document.querySelectorAll('.playlist-item').forEach(el => {
					if (el.dataset.filePath === filePath || el.textContent.trim() === filePath.split(/[\\/]/).pop()) {
						el.classList.add('watched');
					}
				});
			}
		}
		// Accumulate watch-time every ~5 s (timeupdate fires ~4×/s — gate it)
		if (!video._lastStatsSave || video.currentTime - video._lastStatsSave >= 5) {
			video._lastStatsSave = video.currentTime;
			try {
				const stats = JSON.parse(localStorage.getItem('_playerStats') || '{}');
				stats.totalWatchedSeconds = (stats.totalWatchedSeconds || 0) + 5;
				localStorage.setItem('_playerStats', JSON.stringify(stats));
			} catch {}
		}
	}
});

durationDisplay.addEventListener("click", () => {
	showRemainingTime = !showRemainingTime;
	updateDurationDisplay();
});

seekBarWrapper.addEventListener("click", (e) => {
	const rect = seekBarWrapper.getBoundingClientRect();
	const posX = e.clientX - rect.left;
	const percentage = posX / rect.width;
	const targetTime = percentage * video.duration;
	// Update UI instantly, let _seekTo debounce the actual seek
	seekBar.style.width = `${percentage * 100}%`;
	seekBarHandle.style.left = `${percentage * 100}%`;
	currentTimeDisplay.textContent = formatTime(targetTime);
	_seekTo(targetTime);
});

// Handle dragging for smoother seeking
let isDragging = false;
let temporaryTime = 0;

function updateDragging(e) {
	if (isDragging) {
		const rect = seekBarWrapper.getBoundingClientRect();
		const posX = e.clientX - rect.left;
		const percentage = Math.min(Math.max(posX / rect.width, 0), 1); // Ensure percentage is between 0 and 1

		// Update both seek bar and handle position continuously
		seekBar.style.width = `${percentage * 100}%`;
		seekBarHandle.style.left = `${percentage * 100}%`;

		// Update temporary time for display only (don't update video time yet)
		temporaryTime = percentage * video.duration;
		currentTimeDisplay.textContent = formatTime(temporaryTime);
	}
}

seekBarHandle.addEventListener("mousedown", (e) => {
	e.preventDefault();
	isDragging = true;
	// Don't pause - allows smooth seeking without buffering
	// video.pause(); // Pause video while seeking to prevent buffering
	document.addEventListener("mousemove", updateDragging);
});

document.addEventListener("mouseup", () => {
	if (isDragging) {
		isDragging = false;
		document.removeEventListener("mousemove", updateDragging);

		// Apply the seek (debounced to avoid re-request spam)
		if (temporaryTime !== video.currentTime) {
			_seekTo(temporaryTime);
		}

		// Resume playback — wait for seeked event so we don't resume mid-stall
		video.addEventListener('seeked', () => {
			if (!video.paused) video.play().catch(() => {});
		}, {
			once: true
		});

		hideHandleTimeout = setTimeout(() => {
			seekBarHandle.style.opacity = "0";
		}, 2000);
	}
});

seekBarWrapper.addEventListener("wheel", (e) => {
	e.preventDefault();
	if (video && video.duration && !isNaN(video.duration)) {
		const step = 10;
		const direction = e.deltaY > 0 ? -1 : 1;
		let newTime = video.currentTime + direction * step;
		newTime = Math.max(0, Math.min(newTime, video.duration));
		_seekTo(newTime);
	}
});

// ✅ Allow seekBarWrapper scrolling when mouse is over it
seekBarWrapper.addEventListener("wheel", (event) => {
	if (isMouseOver) {
		event.stopPropagation();
	}
});

// Detect mouse enter/leave events for the seekBarWrapper container
seekBarWrapper.addEventListener("mouseenter", () => {
	isMouseOver = true;
});
seekBarWrapper.addEventListener("mouseleave", () => {
	isMouseOver = false;
});

// Update seek bar and current time display
updateSeekBar();
updateDurationDisplay();


// Event listeners for all nav components
document.querySelectorAll(".quit").forEach((element) => {
	element.addEventListener("click", () => {
		savePlaybackAndQuit();
	});
});

// Event listeners for all nav components
document.querySelectorAll(".quit").forEach((element) => {
	element.addEventListener("click", () => {
		savePlaybackAndQuit();
	});
});

// Volume menu buttons — show status pill (no cursor = no tooltip)
document.querySelectorAll(".increase-volume").forEach((element) => {
	element.addEventListener("click", () => {
		const newPct = Math.min(200, gainToPct(gainNode.gain.value) + 5);
		const newVol = pctToGain(newPct);
		updateVolume(newVol);
		showStatusMessage(`Volume: ${newPct}%`, newPct > 100 ? 'vol-high' : 'vol-normal');
	});
});

document.querySelectorAll(".decrease-volume").forEach((element) => {
	element.addEventListener("click", () => {
		const newPct = Math.max(0, gainToPct(gainNode.gain.value) - 5);
		const newVol = pctToGain(newPct);
		updateVolume(newVol);
		showStatusMessage(`Volume: ${newPct}%`, newPct > 100 ? 'vol-high' : 'vol-normal');
	});
});


// keybord Shortcut
document.addEventListener("keydown", (event) => {
	// ── FIX 2: Context-aware typing guard ────────────────────────────────
	// When a text field has focus, only block text-producing keys.
	// Media keys, Escape, safe Ctrl-combos, and F-keys always pass through.
	const activeEl = document.activeElement;
	const isTyping = activeEl && (
		activeEl.tagName === 'INPUT' ||
		activeEl.tagName === 'TEXTAREA' ||
		activeEl.isContentEditable
	);
	if (isTyping) {
		const isEscape      = event.key === 'Escape';
		const isMediaKey    = event.key.startsWith('Media');
		const isFunctionKey = /^F\d+$/.test(event.key); // F2, F6, F11...
		// Ctrl+letter shortcuts that don't conflict with text editing
		const isSafeCtrl    = event.ctrlKey && !event.altKey &&
			['e', 'y', 'o', 'f', 'p', 'q'].includes(event.key.toLowerCase());

		const shouldPassThrough = isEscape || isMediaKey || isFunctionKey || isSafeCtrl;
		if (!shouldPassThrough) return;  // block text-producing keys only

		// Escape: close any open modal and blur the input
		if (isEscape) {
			['videoEffectsModal', 'syncToolModal', 'aboutModal', 'shortcutsModal'].forEach(id => {
				const m = document.getElementById(id);
				if (m && (m.classList.contains('show') || ModalAnimator.isOpen(m))) {
					ModalAnimator.close(m);
				}
			});
			// Close pinned ? overlay if open
			const ov = document.getElementById('shortcutHelpOverlay');
			if (ov && ov.style.display === 'flex') { ov.style.display = 'none'; ov._pinned = false; }
			activeEl.blur();
			return;
		}
		// F-keys and safe Ctrl-combos: fall through to handlers below
	}
	if (event.ctrlKey && event.key.toLowerCase() === 'e') {
		event.preventDefault();
		toggleToolModal('videoEffectsModal');
		return;
	}

	// Ctrl+S → Sleep Timer
	if (event.ctrlKey && event.key.toLowerCase() === 's') {
		event.preventDefault();
		showTimerContainer(true);
		return;
	}

	// Ctrl+Shift+S → Screenshot
	if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') {
		event.preventDefault();
		_takeScreenshot();
		return;
	}

	// Shift+I → Stats dashboard
	if (event.shiftKey && event.key === 'I') {
		event.preventDefault();
		showStatsDashboard();
		return;
	}

	// Shift+A → Toggle audio-only background mode
	if (event.shiftKey && event.key === 'A') {
		event.preventDefault();
		toggleAudioOnlyMode();
		return;
	}

	if (event.key === 'F2') {
		event.preventDefault();
		const btn = document.getElementById('navRenameFileBtn');
		if (btn) btn.click();
		return;
	}

	// F6 → Open Shortcut Editor
	if (event.key === 'F6') {
		event.preventDefault();
		toggleShortcutEditor();
		return;
	}

	if (event.ctrlKey && event.key.toLowerCase() === 'y') {
		event.preventDefault();
		toggleToolModal('syncToolModal');
		return;
	}

	if (event.ctrlKey && event.key.toLowerCase() === "o") {
		event.preventDefault();
		openFileButton.click();
		return;
	}

	if (event.ctrlKey && event.key.toLowerCase() === "f") {
		event.preventDefault();
		openFolderButton.click();
		return;
	}

	if (event.ctrlKey && event.key.toLowerCase() === "q") {
		event.preventDefault();
		window.close();
		return;
	}

	if (event.key === "?" || (!event.shiftKey && event.key === "/")) {
		event.preventDefault();
		const modal = document.getElementById('shortcutsModal');
		if (modal) {
			const isOpen = modal.classList.contains('show') || ModalAnimator.isOpen(modal);
			if (isOpen) {
				ModalAnimator.close(modal);
			} else {
				ModalAnimator.open(modal);
			}
		}
		return;
	}

	if (event.ctrlKey && event.key.toLowerCase() === "p") {
		event.preventDefault();
		togglePiPMode();
		return;
	}

	if (event.ctrlKey && event.key === "ArrowRight") {
		event.preventDefault();
		_seekMedia(currentMedia, currentMedia.currentTime + 60);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	if (event.ctrlKey && event.key === "ArrowLeft") {
		event.preventDefault();
		_seekMedia(currentMedia, currentMedia.currentTime - 60);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	if (event.shiftKey && event.key === "ArrowRight") {
		event.preventDefault();
		_seekMedia(currentMedia, currentMedia.currentTime + 5);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	if (event.shiftKey && event.key === "ArrowLeft") {
		event.preventDefault();
		_seekMedia(currentMedia, currentMedia.currentTime - 5);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	// Skip volume control via arrow keys if the standalone playlist panel is open
	// (arrow keys are used for item navigation in that context instead)
	const _plContainer = document.querySelector(".playlist-container");
	const _plOpen = _plContainer && _plContainer.classList.contains("show");

	if (!_plOpen) {
		if (event.key === "ArrowUp") {
			event.preventDefault();
			const newPct = Math.min(200, gainToPct(gainNode.gain.value) + 5);
			const newVol = pctToGain(newPct);
			updateVolume(newVol);
			showStatusMessage(`Volume: ${newPct}%`, newPct > 100 ? 'vol-high' : 'vol-normal');
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			const newPct = Math.max(0, gainToPct(gainNode.gain.value) - 5);
			const newVol = pctToGain(newPct);
			updateVolume(newVol);
			showStatusMessage(`Volume: ${newPct}%`, newPct > 100 ? 'vol-high' : 'vol-normal');
		}
	}

	if (event.shiftKey && event.key === ":") {
		event.preventDefault();
		togglePlaylist();
	}

	if (event.ctrlKey && event.key.toLowerCase() === "`") {
		event.preventDefault();
		window.electron.minimize();
		return;
	}

	if (event.key === " ") {
		event.preventDefault();
		togglePlayPause();
	}

	if (event.key.toLowerCase() === "z") {
		currentZoomIndex = (currentZoomIndex + 1) % zoomLevels.length; // Cycle through zoom levels
		scale = zoomLevels[currentZoomIndex];

		video.style.transform = `scale(${scale})`;
		video.style.transformOrigin = "center center"; // Zoom from the center

		updateZoomMenuUI();
		const zoomPercentage = Math.round(scale * 100);
		showStatusMessage(`Zoom: ${zoomPercentage}%`);
	}

	if (event.key.toLowerCase() === "a") {
		currentAspectRatioIndex = (currentAspectRatioIndex + 1) % aspectRatioLevels.length; // Cycle through aspect ratios
		const ratio = aspectRatioLevels[currentAspectRatioIndex];
		applyAspectRatio(ratio);
		updateAspectRatioUI(ratio);
		updateAspectRatioUICM(ratio);
		const option = document.querySelector(`[data-aspect-ratio="${ratio}"].aspect-ratio-option`);
		const text = option ? option.querySelector('.nav-row-text').textContent : ratio;
		showStatusMessage(`Aspect Ratio: ${text}`);
	}

	if (event.key.toLowerCase() === 't' && !event.ctrlKey) {
		event.preventDefault();
		if (currentMedia) {
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			);
		}
	}

if (event.key.toLowerCase() === 't' && !event.ctrlKey) {
	event.preventDefault();
	if (currentMedia) {
		// Clear any existing interval
		if (timeDisplayInterval) clearInterval(timeDisplayInterval);
		
		// Update time display in real-time
		const updateTimeDisplay = () => {
			const timeStr = `⏱️ ${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`;
			showStatusMessage(timeStr);
		};
		
		// Show initial time
		updateTimeDisplay();
		
		// Update every 100ms for smooth display
		timeDisplayInterval = setInterval(updateTimeDisplay, 100);
		
		// Stop updating after 5 seconds or when key is released
		setTimeout(() => {
			if (timeDisplayInterval) {
				clearInterval(timeDisplayInterval);
				timeDisplayInterval = null;
			}
		}, 5000);
	}
}

	if (event.key === "+") {
		// Increase speed
		if (video.playbackRate < 2) { // Limit max speed to 2
			const newSpeed = video.playbackRate + 0.25;
			setPlaybackSpeed(newSpeed);
			showStatusMessage(newSpeed === 1 ? "Normal Speed" : `Speed: ${newSpeed}x`);
		}
	} else if (event.key === "-") {
		// Decrease speed
		if (video.playbackRate > 0.25) { // Limit min speed to 0.25
			const newSpeed = video.playbackRate - 0.25;
			setPlaybackSpeed(newSpeed);
			showStatusMessage(newSpeed === 1 ? "Normal Speed" : `Speed: ${newSpeed}x`);
		}
	} else if (event.key === "=") {
		// Reset speed to normal
		setPlaybackSpeed(1);
		showStatusMessage("Normal Speed");
	}
	if (event.altKey && event.key.toLowerCase() === 'n') {
		event.preventDefault();
		sortMethod = 'name';
		sortPlaylist();
	} else if (event.altKey && event.key.toLowerCase() === 'd') {
		event.preventDefault();
		sortMethod = 'date';
		sortPlaylist();
	} else if (event.altKey && event.key.toLowerCase() === 'o') {
		event.preventDefault();
		sortDirection = sortDirection === 'ascending' ? 'descending' : 'ascending';
		sortPlaylist();
	}

	if (event.target === document.body || event.target === document.getElementById('media')) {
		if (event.key === '[' || event.key === '{') {
			event.preventDefault();
			jumpToPreviousChapter();
		}
		if (event.key === ']' || event.key === '}') {
			event.preventDefault();
			jumpToNextChapter();
		}
		if (event.key.toLowerCase() === 'c') {
			event.preventDefault();
			toggleChaptersDropdown();
		}
	}

	const keyActions = {
		ArrowLeft: () => {
			_seekMedia(currentMedia, currentMedia.currentTime - 10);
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			);
		},
		ArrowRight: () => {
			_seekMedia(currentMedia, currentMedia.currentTime + 10);
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			);
		},
		f: () => toggleFullScreen(),
		s: () => toggleShuffleMode(),
		p: () => {
			playPrevious();
			showStatusMessage("Previous");
		},
		n: () => {
			playNext();
			showStatusMessage("Next");
		},
		l: () => toggleRepeat(),
		m: () => volumeBtn.click(),
		8: () => {
			rotateVideo(0);
			showStatusMessage("Rotated 0°");
		},
		6: () => {
			rotateVideo(90);
			showStatusMessage("Rotated 90°");
		},
		4: () => {
			rotateVideo(-90);
			showStatusMessage("Rotated -90°");
		},
		2: () => {
			rotateVideo(180);
			showStatusMessage("Rotated 180°");
		},
		0: () => {
			currentMedia.currentTime = 0;
			currentMedia.play();
		},
		Delete: () => {
			deleteCurrentMediaFile();
			showStatusMessage("Deleted current media file.");
		},
		v: () => {
			const total = video.textTracks.length;
			if (total === 0) {
				showStatusMessage('No subtitles');
				return;
			}
			const next = currentSubtitleIndex + 1 >= total ? -1 : currentSubtitleIndex + 1;
			switchSubtitleTrack(next);
		},
		g: () => adjustAudioDelay(-0.1),
		h: () => adjustAudioDelay(0.1),
		d: () => adjustSubtitleDelay(-0.5),
		e: () => adjustSubtitleDelay(0.5),
	};

	if (keyActions[event.key]) {
		keyActions[event.key]();
	}

});

function updateZoomMenuUI() {
	zoomOptions.forEach(option => {
		const lvl = parseInt(option.dataset.zoomLevel, 10);
		const isActive = lvl === currentZoomIndex;
		option.classList.toggle('active', isActive);
		const icon = option.querySelector('.nav-row-icon, .cm-icon');
		if (icon && !icon.querySelector('img')) icon.textContent = isActive ? '●' : '';
	});
}

// Function to handle zoom menu clicks (fix: use dataset.zoomLevel, not undefined `index`)
zoomOptions.forEach((option) => {
	option.addEventListener("click", () => {
		const lvl = parseInt(option.dataset.zoomLevel, 10);
		// Last zoom level (index 5) is the reset entry
		if (lvl === 5 || isNaN(lvl)) {
			resetZoom();
			currentZoomIndex = 0;
			updateZoomMenuUI();
			showStatusMessage("Zoom: 100%");
			return;
		}
		currentZoomIndex = lvl;
		scale = zoomLevels[lvl];

		// Apply zoom transformations
		applyTransformations(); // keeps rotation + pan intact
		video.style.transformOrigin = "center center"; // Zoom from the center

		updateZoomMenuUI();

		// Display status message
		const zoomPercentage = Math.round(scale * 100);
		showStatusMessage(`Zoom: ${zoomPercentage}%`);
	});
});

// Initialize zoom menu active state on startup
updateZoomMenuUI();

// ═══════════════════════════════════════════════════════════════════════════
// ASPECT RATIO CONTROLS
// ═══════════════════════════════════════════════════════════════════════════

// Function to apply aspect ratio to video
function applyAspectRatio(ratio) {
	const videoContainer = video;
	
	// Map aspect ratio settings
	const aspectRatioMap = {
		'original': { objectFit: 'contain', aspectRatio: 'auto', width: '100%', height: '100%' },
		'fit': { objectFit: 'contain', aspectRatio: 'auto', width: '100%', height: '100%' },
		'fill': { objectFit: 'fill', aspectRatio: 'auto', width: '100%', height: '100%' },
		'16-9': { objectFit: 'cover', aspectRatio: '16 / 9', width: '100%', height: '100%' },
		'4-3': { objectFit: 'cover', aspectRatio: '4 / 3', width: '100%', height: '100%' },
		'21-9': { objectFit: 'cover', aspectRatio: '21 / 9', width: '100%', height: '100%' },
		'1-1': { objectFit: 'cover', aspectRatio: '1 / 1', width: '100%', height: '100%' }
	};

	const config = aspectRatioMap[ratio] || aspectRatioMap['original'];
	
	// Apply styles directly to video element
	videoContainer.style.objectFit = config.objectFit;
	videoContainer.style.width = config.width;
	videoContainer.style.height = config.height;
	videoContainer.style.aspectRatio = config.aspectRatio;

	// Save to localStorage
	localStorage.setItem('videoAspectRatio', ratio);
	currentAspectRatio = ratio;
	currentAspectRatioIndex = aspectRatioLevels.indexOf(ratio);
}

// Get and apply saved aspect ratio
function loadSavedAspectRatio() {
	const savedRatio = localStorage.getItem('videoAspectRatio') || 'original';
	applyAspectRatio(savedRatio);
	updateAspectRatioUI(savedRatio);
	updateAspectRatioUICM(savedRatio);
	currentAspectRatioIndex = aspectRatioLevels.indexOf(savedRatio);
}

// Update UI to show which aspect ratio is active (navbar)
function updateAspectRatioUI(activeRatio) {
	const aspectOptions = document.querySelectorAll('.aspect-ratio-option');
	aspectOptions.forEach(option => {
		option.classList.remove('active');
		const icon = option.querySelector('.nav-aspect-check');
		if (icon) {
			icon.textContent = '';
		}
	});
	
	const activeOption = document.querySelector(`[data-aspect-ratio="${activeRatio}"].aspect-ratio-option`);
	if (activeOption) {
		activeOption.classList.add('active');
		const icon = activeOption.querySelector('.nav-aspect-check');
		if (icon) {
			icon.textContent = '●';
		}
	}
}

// Update UI to show which aspect ratio is active (context menu)
function updateAspectRatioUICM(activeRatio) {
	const aspectOptions = document.querySelectorAll('.cm-aspect-ratio-option');
	aspectOptions.forEach(option => {
		option.classList.remove('active');
		const icon = option.querySelector('.cm-aspect-check');
		if (icon) {
			icon.textContent = '';
		}
	});
	
	const activeOption = document.querySelector(`[data-aspect-ratio="${activeRatio}"].cm-aspect-ratio-option`);
	if (activeOption) {
		activeOption.classList.add('active');
		const icon = activeOption.querySelector('.cm-aspect-check');
		if (icon) {
			icon.textContent = '●';
		}
	}
}

// Add event listeners to navbar aspect ratio options
const aspectRatioOptions = document.querySelectorAll('.aspect-ratio-option');
aspectRatioOptions.forEach((option) => {
	option.addEventListener('click', (e) => {
		e.preventDefault();
		const ratio = option.dataset.aspectRatio;
		applyAspectRatio(ratio);
		updateAspectRatioUI(ratio);
		updateAspectRatioUICM(ratio);
		showStatusMessage(`Aspect Ratio: ${option.querySelector('.nav-row-text').textContent}`);
	});
});

// Add event listeners to context menu aspect ratio options
const cmAspectRatioOptions = document.querySelectorAll('.cm-aspect-ratio-option');
cmAspectRatioOptions.forEach((option) => {
	option.addEventListener('click', (e) => {
		e.preventDefault();
		const ratio = option.dataset.aspectRatio;
		applyAspectRatio(ratio);
		updateAspectRatioUI(ratio);
		updateAspectRatioUICM(ratio);
		showStatusMessage(`Aspect Ratio: ${option.querySelector('.cm-text').textContent}`);
	});
});

// Load saved aspect ratio on initialization
loadSavedAspectRatio();


// showShortcuts button → toggle the shortcuts modal
const btn = document.getElementById("showShortcuts");
if (btn) btn.onclick = () => {
	const modal = document.getElementById('shortcutsModal');
	if (modal) {
		const isOpen = modal.classList.contains('show') || ModalAnimator.isOpen(modal);
		if (isOpen) {
			ModalAnimator.close(modal);
		} else {
			ModalAnimator.open(modal);
		}
	}
};

// Function to apply rotation
function applyRotation() {
	const rotationAngle = parseInt(video.dataset.rotation) || 0;
	video.style.transform = `rotate(${rotationAngle}deg)`;

	// Adjust container size based on rotation
	switch (rotationAngle) {
		case 90:
		case -90:
			// Set container dimensions to handle rotated video
			video.style.width = "100vh"; // Set width to viewport height
			video.style.height = "100vw"; // Set height to viewport width
			break;
		case 0:
		case 180:
			// Reset dimensions for normal orientation
			video.style.width = "100vw"; // Set width to viewport width
			video.style.height = "100vh"; // Set height to viewport height
			break;
		default:
			showStatusMessage("Error: Unsupported rotation angle.");
			return; // Exit function if there's an error
	}
video.classList.add('rotating');
setTimeout(() => video.classList.remove('rotating'), 600);
	video.style.objectFit = "contain"; // Adjust to fit container
}

// Function to rotate video
function rotateVideo(degrees) {
	video.dataset.rotation = degrees;
	rotationInitiated = true;
	applyRotation();
}

// Add event listener for full screen change
document.addEventListener("fullscreenchange", () => {
	applyRotation();
});

// Set initial rotation angle (example setting to 0 degrees)
video.dataset.rotation = "0"; // Set rotation angle
applyRotation(); // Apply initial rotation

// Audio Track Management (ffprobe-based — detects AC3, DTS, TrueHD, etc.) 

// Get or create the hidden <audio> element for non-native audio codecs
function getAudioTrackPlayer() {
	if (audioTrackPlayer) return audioTrackPlayer;

	// Try to find it in the DOM
	audioTrackPlayer = document.getElementById('audioTrackPlayer');

	// If not found, create it dynamically
	if (!audioTrackPlayer) {
		console.warn('[Audio] audioTrackPlayer not in HTML, creating it dynamically...');
		audioTrackPlayer = document.createElement('audio');
		audioTrackPlayer.id = 'audioTrackPlayer';
		audioTrackPlayer.style.display = 'none';
		audioTrackPlayer.preload = 'none';
		document.body.appendChild(audioTrackPlayer);
	}

	// ── KEY FIX: route audioTrackPlayer through the Web Audio API ────────────
	// Without this, ALL audio (video.muted=true, everything goes through this
	// player) completely bypasses gainNode, compressor, and all processing.
	// The HTML volume property tops out at 1.0, so the user's 200% gainNode
	// setting has ZERO effect on what they actually hear.
	// Connecting here sends the stream through: audioTrackPlayer → gainNode
	// → masterLimiter → destination, giving full 200%+ amplification.
	if (!audioTrackPlayer._webAudioConnected && typeof audioContext !== 'undefined' && typeof gainNode !== 'undefined') {
		try {
			const trackSource = audioContext.createMediaElementSource(audioTrackPlayer);
			// Connect directly to gainNode — bypasses the EQ/compressor chain
			// intentionally (those are calibrated for the main video element).
			// The gainNode provides the user's volume boost (0–200%+).
			trackSource.connect(gainNode);
			audioTrackPlayer.volume = 1.0; // gain is now controlled by gainNode
			audioTrackPlayer._webAudioConnected = true;
			// console.log('[Audio] audioTrackPlayer connected to Web Audio API (gainNode)');
		} catch (e) {
			console.warn('[Audio] Could not connect audioTrackPlayer to Web Audio API:', e);
		}
	}

	return audioTrackPlayer;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
	getAudioTrackPlayer();
});

// Also try immediately (script may run after DOM is ready)
if (document.readyState !== 'loading') {
	getAudioTrackPlayer();
}

// All audio tracks now route through the external FFmpeg pipe regardless of codec.
async function populateAudioTracks() {
	const audioTrackLists = document.querySelectorAll(".audio-track-list");
	audioTrackLists.forEach(list => {
		list.innerHTML = "";
	});

	// Always stop any existing external audio before detection
	stopExternalAudio();

	const filePath = mediaFiles[currentVideoIndex];
	if (!filePath) return;

	// 1. Detect tracks via ffprobe
	let ffTracks = [];
	try {
		const result = await window.electron.invoke('get-audio-tracks', filePath);
		if (result && result.success) ffTracks = result.tracks || [];
	} catch (e) {
		console.warn('[Audio] get-audio-tracks failed:', e);
	}

	if (ffTracks.length > 0) {
		ffprobeAudioTracks = ffTracks;

		// Auto-select: Hindi > English > default-flagged > track 0
		let autoIndex = 0;
		const hindiIdx = ffTracks.findIndex(t => ['hi', 'hin', 'hindi'].includes(t.lang.toLowerCase()));
		const engIdx = ffTracks.findIndex(t => ['en', 'eng'].includes(t.lang.toLowerCase()));
		const defIdx = ffTracks.findIndex(t => t.default);
		if (hindiIdx >= 0) autoIndex = hindiIdx;
		else if (engIdx >= 0) autoIndex = engIdx;
		else if (defIdx >= 0) autoIndex = defIdx;

		currentAudioIndex = autoIndex;
		autoSwitchDone = true;

		// Build dropdown UI
		audioTrackLists.forEach(list => {
			ffTracks.forEach(function(track, i) {
				var item = document.createElement("a");
				item.href = "javascript:void(0)";
				item.className = "track-item" + (i === autoIndex ? " selected-track" : "");
				var icon = document.createElement("span");
				icon.className = "cm-icon";
				icon.textContent = i === autoIndex ? '●' : '';
				var text = document.createElement("span");
				text.className = "cm-text";
				var codec = track.codec.toUpperCase();
				var ch = track.channelLayout || (track.channels ? track.channels + 'ch' : '');
				var lang = (track.lang && track.lang !== 'track' + (i + 1)) ? ' - ' + track.lang : '';
				var title = (track.title && track.title !== track.codec) ? ' [' + track.title + ']' : '';
				text.textContent = '[' + codec + (ch ? ' ' + ch : '') + ']' + lang + title;
				item.appendChild(icon);
				item.appendChild(text);
				item.addEventListener('click', function() {
					switchAudioTrackByIndex(i);
				});
				list.appendChild(item);
			});
		});

		// Apply the auto-selected track (no src-swap, no AbortError)
		applyAudioTrack(autoIndex);
		refreshDynamicListVisibility(); // show audio track rows
		return;
	}

	// next file — ffprobe should always find tracks for valid media files.
	ffprobeAudioTracks = [];
	console.warn('[Audio] No tracks found via ffprobe — cannot populate audio menu');
	refreshDynamicListVisibility(); // hide audio track rows (no tracks)
}

// Audio sync state 
var _activeAudioIndex = -1; // which track is in the <audio> element
var _streamStartedAt = 0; // video.currentTime when the stream was launched
var _driftTimer = null; // setInterval handle for drift correction
var DRIFT_MAX = 0.5; // seconds — restart stream if drift exceeds this


// instead we pass ?ss= so ffmpeg starts encoding at the correct offset.
function startExternalAudio(index) {
	audioTrackPlayer = getAudioTrackPlayer();
	if (!audioTrackPlayer) {
		console.error('[Audio] Failed to get or create audioTrackPlayer element!');
		return;
	}

	_stopDriftTimer();

	// Kill previous stream
	audioTrackPlayer.pause();
	audioTrackPlayer.removeAttribute('src');
	try {
		audioTrackPlayer.load();
	} catch (e) {}

	_activeAudioIndex = index;
	_streamStartedAt = video.currentTime || 0;

	var ss = _streamStartedAt.toFixed(3);
	var url = 'http://127.0.0.1:54321/audio/' + index + '?ss=' + ss + '&t=' + Date.now();

	// console.log('[Audio] Starting external audio stream:');
	// console.log('  Track:', index);
	// console.log('  Start position:', ss + 's');
	// console.log('  URL:', url);
	// console.log('  Video paused:', video.paused);

	audioTrackPlayer.src = url;
	audioTrackPlayer.muted = false;
	audioTrackPlayer.volume = audioTrackPlayer._webAudioConnected ? 1.0 : Math.min(1, gainNode ? gainNode.gain.value : 1);
	audioTrackPlayer.playbackRate = video.playbackRate;

	// Explicitly load the new source
	audioTrackPlayer.load();

	// Error handler
	function onError(e) {
		audioTrackPlayer.removeEventListener('error', onError);
		// clear src during seek/track-switch — not real errors, safe to ignore.
		const code = audioTrackPlayer.error ? audioTrackPlayer.error.code : 0;
		if (code === MediaError.MEDIA_ERR_ABORTED || code === MediaError.MEDIA_ERR_SRC_NOT_FOUND) return;
		console.error('[Audio] Stream error:', audioTrackPlayer.error);
	}
	audioTrackPlayer.addEventListener('error', onError);

	// Wait for enough buffered data, then play
	let _canPlayFired = false;
	let _timeoutHandle = null;
	
	function onCanPlay() {
		if (_canPlayFired) return; // Prevent duplicate execution
		_canPlayFired = true;
		audioTrackPlayer.removeEventListener('canplay', onCanPlay);
		audioTrackPlayer.removeEventListener('canplaythrough', onCanPlayThrough);
		clearTimeout(_timeoutHandle);
		// console.log('[Audio] Stream ready, playing...');

		// Guard: Check if stream is still active for this track
		if (!audioTrackPlayer.src || audioTrackPlayer.src !== url) return;

		// Sync play state with video: if paused, keep audio paused
		if (video.paused) {
			audioTrackPlayer.pause();
			_startDriftTimer();
		} else {
			audioTrackPlayer.play().then(function() {
				// console.log('[Audio] Playing successfully');
				_startDriftTimer();
			}).catch(function(e) {
				// AbortError means src was cleared — expected, don't log
				if (e.name !== 'AbortError') {
					// Only warn on unexpected errors
					if (e.name !== 'NotAllowedError') {
						console.warn('[Audio] canplay handler — play():', e.name);
					}
				}
			});
		}
	}

	function onCanPlayThrough() {
		onCanPlay(); // Treat the same as canplay
	}

	audioTrackPlayer.addEventListener('canplay', onCanPlay);
	audioTrackPlayer.addEventListener('canplaythrough', onCanPlayThrough);

	// Timeout fallback - if canplay never fires (5 seconds)
	// Only force play if: (1) stream is still active, (2) data is buffered, (3) video is playing
	_timeoutHandle = setTimeout(function() {
		audioTrackPlayer.removeEventListener('canplay', onCanPlay);
		audioTrackPlayer.removeEventListener('canplaythrough', onCanPlayThrough);
		
		// Only attempt play if conditions are met and canplay hasn't already fired
		if (!_canPlayFired && audioTrackPlayer && audioTrackPlayer.src === url && 
		    audioTrackPlayer.readyState >= 2 && !video.paused) {
			audioTrackPlayer.play().catch(function(e) {
				// Suppress expected errors (aborted, not allowed)
				if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
					console.warn('[Audio] Timeout fallback — play():', e.name);
				}
			});
		}
	}, 5000);
}

// comes through the external pipe. Video is only unmuted when no media is loaded.
function stopExternalAudio() {
	_stopDriftTimer();
	audioTrackPlayer = getAudioTrackPlayer();
	if (audioTrackPlayer) {
		// Pause first to cancel any pending play() promise
		audioTrackPlayer.pause();
		// Remove src to trigger cleanup
		audioTrackPlayer.removeAttribute('src');
		try {
			audioTrackPlayer.load();
		} catch (e) {}
	}
	_activeAudioIndex = -1;
}

// ── REPLACE the existing _startDriftTimer() function ────────────────────────
function _startDriftTimer() {
  _stopDriftTimer();
  _driftTimer = setInterval(() => {
    if (!audioTrackPlayer || !audioTrackPlayer.src) { _stopDriftTimer(); return; }

    // Resume AudioContext if browser suspended it (tab backgrounded, etc.)
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    // If video is paused, keep audio paused (don't drift-correct while paused)
    if (video.paused) {
      if (!audioTrackPlayer.paused) audioTrackPlayer.pause();
      return;
    }

    // If audio is paused but video is playing, restart the stream
    if (audioTrackPlayer.paused && !video.paused) {
      audioTrackPlayer.play().catch(() => {
        startExternalAudio(_activeAudioIndex);
      });
      return;
    }

    // Stalled (readyState < 2 while video is playing) — restart stream
    if (audioTrackPlayer.readyState < 2) {
      console.warn('[Audio] Stream stalled — restarting');
      startExternalAudio(_activeAudioIndex);
      return;
    }

    // Drift correction
    const expected = video.currentTime - _streamStartedAt;
    const actual   = audioTrackPlayer.currentTime;
    const drift    = Math.abs(expected - actual);

    if (drift > DRIFT_MAX) {
      console.warn(`[Audio] Drift ${drift.toFixed(3)}s — resyncing`);
      startExternalAudio(_activeAudioIndex);
    }
  }, 3000); // 3s — less aggressive polling; rate-limiter in startExternalAudio prevents storm calls
}

function _stopDriftTimer() {
	if (_driftTimer) {
		clearInterval(_driftTimer);
		_driftTimer = null;
	}
}

// Apply a chosen audio track (called on load and on user pick)
function applyAudioTrack(index) {
	const track = ffprobeAudioTracks[index];
	if (!track) return;

	currentAudioIndex = index;
	autoSwitchDone = true;

	// Mute the video element — audio comes entirely from the external pipe
	video.muted = true;

	// Update UI highlight
// Iterate per-list so index stays correct inside each list
document.querySelectorAll('.audio-track-list').forEach(list => {
    list.querySelectorAll('.track-item').forEach((el, i) => {
        const icon = el.querySelector('.cm-icon');
        const isActive = i === index;
        el.classList.toggle('selected-track', isActive);
        if (icon) icon.textContent = isActive ? '●' : '';
    });
});

	// Start/switch the ffmpeg audio stream for this track
	startExternalAudio(index);

	// console.log(`[Audio] Switching to track ${index}: ${track.codec.toUpperCase()} - ${track.lang} "${track.title}"`);
}

// Mirror play / pause / seek / rate from video → external audio element
video.addEventListener('play', function() {
	if (!audioTrackPlayer || !audioTrackPlayer.src) return;
	audioTrackPlayer.play().catch(function() {});
});

video.addEventListener('pause', function() {
	if (!audioTrackPlayer || !audioTrackPlayer.src) return;
	// Use a small delay to avoid interrupting play() during setup
	// (the browser may call pause synchronously after play() in rare cases)
	Promise.resolve().then(() => {
		if (audioTrackPlayer && !video.paused) return; // Video was unpaused quickly
		if (audioTrackPlayer) audioTrackPlayer.pause();
	});
});

// ── Debounced audio restart on seek ─────────────────────────────────────────
// Problem: calling startExternalAudio() on EVERY seeked event causes FFmpeg to
// restart its transcoding pipe continuously during drag-seeking, making the UI
// freeze for 500ms–2s per seek tick.
// Fix: debounce 250ms so FFmpeg only restarts ONCE after the user stops seeking.
let _audioRestartTimer = null;
video.addEventListener('seeked', function() {
	if (!audioTrackPlayer || !audioTrackPlayer.src || _activeAudioIndex < 0) return;
	clearTimeout(_audioRestartTimer);
	_audioRestartTimer = setTimeout(() => {
		startExternalAudio(_activeAudioIndex);
	}, 250);
});

video.addEventListener('ratechange', function() {
	if (!audioTrackPlayer || !audioTrackPlayer.src) return;
	audioTrackPlayer.playbackRate = video.playbackRate;
});


// Called when user picks a track from the dropdown
function switchAudioTrackByIndex(index) {
	var track = ffprobeAudioTracks[index];
	if (!track) return;
	applyAudioTrack(index);
	showStatusMessage('[Audio] ' + track.codec.toUpperCase() + ' - ' + track.lang);
}

function switchTrack(index) {
	if (video && video.audioTracks) {
		const audioTracks = video.audioTracks;
		const audioTrackLists = document.querySelectorAll(".audio-track-list");

		for (let i = 0; i < audioTracks.length; i++) {
			if (!audioTracks[i]) continue;
			audioTracks[i].enabled = false;
			audioTrackLists.forEach(list => {
				const items = list.querySelectorAll(".track-item");
				if (items[i]) items[i].classList.remove("selected-track");
			});
		}

		if (!audioTracks[index]) return;
		audioTracks[index].enabled = true;
		currentAudioIndex = index;
		autoSwitchDone = true;

		audioTrackLists.forEach(list => {
			const items = list.querySelectorAll(".track-item");
			if (items[index]) items[index].classList.add("selected-track");
		});

		const track = audioTracks[index];
		showStatusMessage(`${track.label || "Track "} - ${track.language || "1"}`);
		syncAudioAndVideo();
	} else {
		console.error("audioTracks API is not supported in this browser");
	}
}

// Sync audio and video without interrupting playback
function syncAudioAndVideo() {
	if (video.readyState >= 2) {
		if (!video.paused) {
			video.currentTime = video.currentTime;
		} else {
			video.play().catch((error) => console.error("Error playing video:", error));
		}
	}
}

// Handle key press for switching audio tracks (B key cycles through)
function handleKeyPress(event) {
	// Block ALL shortcuts if user is typing in any input, textarea, or contenteditable
	const activeEl = document.activeElement;
	const isTyping = activeEl && (
		activeEl.tagName === 'INPUT' ||
		activeEl.tagName === 'TEXTAREA' ||
		activeEl.isContentEditable
	);
	if (isTyping) return;

	if (event.key.toLowerCase() === "b") {
		if (ffprobeAudioTracks.length > 0) {
			// ffprobe mode — cycle through detected tracks
			const next = (currentAudioIndex + 1) % ffprobeAudioTracks.length;
			switchAudioTrackByIndex(next);
		} else if (video && video.audioTracks && video.audioTracks.length > 0) {
			// Native mode fallback
			currentAudioIndex = (currentAudioIndex + 1) % video.audioTracks.length;
			switchTrack(currentAudioIndex);
		}
	}
}

// Add event listener for key press
document.addEventListener("keydown", handleKeyPress);

// Audio tracks are populated in loadedmetadata (already handles this)
let _freezeCanvas = null;
let _freezeCtx = null;
let _freezeActive = false;
let _seekSpinnerTimer = null;
let _rafHandle = null;

function _ensureFreezeCanvas() {
	if (_freezeCanvas) return;
	_freezeCanvas = document.createElement('canvas');
	_freezeCanvas.style.cssText = [
		'position:absolute',
		'top:0', 'left:0', 'width:100%', 'height:100%',
		'object-fit:contain',
		'pointer-events:none',
		'z-index:97', // above video (z=auto) but below subtitle (z=98)
		'display:none',
	].join(';');
	document.getElementById('mediaPlayer').appendChild(_freezeCanvas);
	_freezeCtx = _freezeCanvas.getContext('2d');
}

function _captureAndFreeze() {
	if (!video.videoWidth || !video.videoHeight) return;
	_ensureFreezeCanvas();

	const rotationAngle = parseInt(video.dataset.rotation) || 0;
	const vw = video.videoWidth;
	const vh = video.videoHeight;

	// Bake the rotation into the canvas pixel data so the canvas itself can
	// remain a simple 100%×100% overlay with no CSS transform.
	// Applying the video's CSS transform to the canvas causes tiling artefacts
	// because the canvas pixel dimensions and CSS dimensions fight each other.
	_freezeCtx.save();
	_freezeCtx.setTransform(1, 0, 0, 1, 0, 0); // reset any previous transform

	switch (rotationAngle) {
		case 90:
			// Swap canvas dimensions, rotate CW 90°
			_freezeCanvas.width  = vh;
			_freezeCanvas.height = vw;
			_freezeCtx.translate(vh, 0);
			_freezeCtx.rotate(Math.PI / 2);
			break;
		case -90:
			// Swap canvas dimensions, rotate CCW 90°
			_freezeCanvas.width  = vh;
			_freezeCanvas.height = vw;
			_freezeCtx.translate(0, vw);
			_freezeCtx.rotate(-Math.PI / 2);
			break;
		case 180:
			_freezeCanvas.width  = vw;
			_freezeCanvas.height = vh;
			_freezeCtx.translate(vw, vh);
			_freezeCtx.rotate(Math.PI);
			break;
		default:
			_freezeCanvas.width  = vw;
			_freezeCanvas.height = vh;
			break;
	}

	// Keep canvas CSS as a plain full-size overlay — no CSS transform needed
	_freezeCanvas.style.transform       = '';
	_freezeCanvas.style.transformOrigin = '';
	_freezeCanvas.style.width           = '100%';
	_freezeCanvas.style.height          = '100%';

	try {
		_freezeCtx.drawImage(video, 0, 0, vw, vh);
		_freezeCtx.restore();
		_freezeCanvas.style.display = 'block';
		_freezeActive = true;
	} catch (e) {
		_freezeCtx.restore();
		// drawImage can fail if video is in error state — just skip freeze
		_freezeActive = false;
	}
}

function _releaseFreezeFrame() {
	clearTimeout(_seekSpinnerTimer);
	cancelAnimationFrame(_rafHandle);
	if (_freezeCanvas) {
		_freezeCanvas.style.display = 'none';
		// Reset transform/dimensions so the canvas is neutral for the next seek
		_freezeCanvas.style.transform       = '';
		_freezeCanvas.style.transformOrigin = '';
		_freezeCanvas.style.width           = '100%';
		_freezeCanvas.style.height          = '100%';
	}
	_freezeActive = false;
	// Loader completely disabled
}

function _onSeeking() {
	// Capture current frame BEFORE the browser wipes it for seamless seeking
	_captureAndFreeze();
	// Do NOT pause - allows smooth seeking without buffering
	// console.log('[Seek] Fast seeking - no buffer pause');
}

function _onSeeked() {
	// Don't release immediately — wait for the first new painted frame via rAF.
	// This ensures the canvas hides only AFTER the new frame is visible,
	// so there is zero gap between freeze-frame and live video.
	cancelAnimationFrame(_rafHandle);
	_rafHandle = requestAnimationFrame(() => {
		_rafHandle = requestAnimationFrame(() => {
			// Two rAF levels: first fires at start of paint, second after it completes
			_releaseFreezeFrame();
		});
	});
}

video.addEventListener('seeking', _onSeeking);
video.addEventListener('waiting', () => {
	// Loader completely disabled - no spinner shown on buffer
	// console.log('[Seek] Buffering...');
});
video.addEventListener('seeked', _onSeeked);
video.addEventListener('playing', _releaseFreezeFrame);
video.addEventListener('canplay', () => {
	// Loader completely disabled
});

// ── SEEK HELPERS ─────────────────────────────────────────────────────────────
// ROOT CAUSE of slow seeking on large files (2h, 10h):
//   video.currentTime = X  → "exact frame" seek
//     Chromium must: read the full index, locate the keyframe, then decode every
//     frame from that keyframe to your exact target. On a 10-hour file this can
//     stall for 3–8 seconds even on a fast SSD.
//
//   video.fastSeek(X) → "nearest keyframe" seek  (Chromium / Electron native)
//     Jumps straight to the nearest keyframe — essentially instant on any file.
//     You may land ±1-2s off vs an exact seek, but 10h files seek instantly.
//
// _seekTo:   used by seek bar clicks, drag release, wheel — debounced 50 ms
//            so rapid drags/clicks don't stack up seek requests.
// _seekMedia: used by all keyboard shortcuts (+5, +10, +60 etc.) — no debounce
//             needed because keyboard events are already discrete.

let _seekDebounceTimer = null;

function _seekTo(time) {
	clearTimeout(_seekDebounceTimer);
	_seekDebounceTimer = setTimeout(() => {
		const t = Math.max(0, Math.min(time, isFinite(video.duration) ? video.duration : time));
		// fastSeek() = nearest-keyframe seek → instant on large files.
		// Falls back to currentTime= on browsers that don't support it.
		if (typeof video.fastSeek === 'function') {
			video.fastSeek(t);
		} else {
			video.currentTime = t;
		}
	}, 50); // 50 ms — UI updates instantly above, this just throttles actual seeks
}

// Direct (non-debounced) fastSeek for discrete actions (keyboard, buttons, chapters).
// Works on any HTMLMediaElement (video or audioTrackPlayer).
function _seekMedia(media, time) {
	if (!media) return;
	const t = Math.max(0, Math.min(time, isFinite(media.duration) ? media.duration : time));
	if (typeof media.fastSeek === 'function') {
		media.fastSeek(t);
	} else {
		media.currentTime = t;
	}
}

let currentSubtitleIndex = -1;
let _subtitleBlobUrls = [];
let _subtitleCueStyles = [];
let _subtitlePopulatedForFile = null;

async function populateSubtitleTracks() {
	const filePath = mediaFiles[currentVideoIndex];
	if (!filePath) return;
	if (filePath === _subtitlePopulatedForFile) return;
	_subtitlePopulatedForFile = filePath;
	_subtitleTeardown();
	video.querySelectorAll('track').forEach(t => t.remove());
	_subtitleBlobUrls.forEach(u => URL.revokeObjectURL(u));
	_subtitleBlobUrls = [];
	_subtitleCueStyles = [];
	currentSubtitleIndex = -1;

	// Reset UI lists
	const subtitleLists = document.querySelectorAll('.subtitle-track-list');
	subtitleLists.forEach(list => {
		list.innerHTML = '';
		const offBtn = document.createElement('a');
		offBtn.href = 'javascript:void(0)';
		offBtn.className = 'subtitle-item active';
		offBtn.dataset.index = '-1';
		const offIcon = document.createElement('span');
		offIcon.className = 'cm-icon';
		offIcon.textContent = '●';
		const offText = document.createElement('span');
		offText.className = 'cm-text';
		offText.textContent = 'Off';
		offBtn.append(offIcon, offText);
		offBtn.addEventListener('click', () => switchSubtitleTrack(-1));
		list.appendChild(offBtn);
	});
	let result;
	try {
		result = await window.electron.invoke('get-subtitle-tracks', filePath);
	} catch (err) {
		console.error('[Sub] IPC error:', err);
		_subtitlePopulatedForFile = null;
		return;
	}
	if (!result || !result.success || result.tracks.length === 0) {
		refreshDynamicListVisibility(); // hide subtitle track list (no embedded tracks)
		return;
	}

	let forcedIndex = -1;

	result.tracks.forEach((track, i) => {
		// Create Blob URL from the VTT string sent by main process 
		// No HTTP fetch needed — data is already in memory.
		const blob = new Blob([track.vttContent], {
			type: 'text/vtt; charset=utf-8'
		});
		const blobUrl = URL.createObjectURL(blob);
		_subtitleBlobUrls.push(blobUrl); // remember for cleanup

		// Store ASS style data for this track (null for SRT/VTT, object for ASS/SSA)
		_subtitleCueStyles[i] = track.cueStyles || null;

		const trackEl = document.createElement('track');
		trackEl.src = blobUrl; // ← instant: no network, no disk
		trackEl.kind = 'subtitles';
		trackEl.label = track.title;
		trackEl.srclang = track.lang || 'und';
		trackEl.default = false;
		video.appendChild(trackEl);

		if (track.forced && forcedIndex === -1) forcedIndex = i;

		subtitleLists.forEach(list => {
			const a = document.createElement('a');
			a.href = 'javascript:void(0)';
			a.className = 'subtitle-item';
			a.dataset.index = i;
			const badge = track.forced ? ' ⚡' : '';
			const icon = document.createElement('span');
			icon.className = 'cm-icon';
			icon.textContent = '';
			const text = document.createElement('span');
			text.className = 'cm-text';
			text.textContent = `${track.title} (${track.lang})${badge}`;
			a.append(icon, text);
			a.addEventListener('click', () => switchSubtitleTrack(i));
			list.appendChild(a);
		});
	});

	// Auto-activate forced track if present; otherwise restore last user selection
	if (forcedIndex !== -1) {
		switchSubtitleTrack(forcedIndex);
	} else {
		try {
			const _subKey = 'lastSub:' + filePath;
			const saved = localStorage.getItem(_subKey);
			if (saved !== null) {
				const savedIdx = parseInt(saved, 10);
				// -1 = Off, valid positive index within track range
				if (savedIdx === -1 || (savedIdx >= 0 && savedIdx < result.tracks.length)) {
					switchSubtitleTrack(savedIdx);
				}
			}
		} catch {}
	}
	refreshDynamicListVisibility(); // show subtitle track list (tracks found)
}

// Subtitle render engine
// Event-driven: uses cuechange + seeked — zero polling, zero temp files.
// All state lives in these four variables; _subtitleTeardown() resets them all.

let _subTrack = null; // active TextTrack object
let _subCueHandler = null; // cuechange listener (kept so we can removeEventListener)
let _subSeekHandler = null; // seeked listener
let _subReadyTimer = null; // interval used while waiting for Blob cues to parse

// Teardown: removes all listeners, clears display, disables all tracks.
// Called at the start of every populateSubtitleTracks() and switchSubtitleTrack().
function _subtitleTeardown() {
	if (_subTrack && _subCueHandler) {
		try {
			_subTrack.removeEventListener('cuechange', _subCueHandler);
		} catch (_) {}
	}
	if (_subSeekHandler) {
		video.removeEventListener('seeked', _subSeekHandler);
	}
	if (_subReadyTimer) {
		clearInterval(_subReadyTimer);
		_subReadyTimer = null;
	}
	Array.from(video.textTracks).forEach(t => {
		try {
			t.mode = 'disabled';
		} catch (_) {}
	});
	const disp = document.getElementById('subtitle-display');
	if (disp) disp.innerHTML = '';
	_subTrack = null;
	_subCueHandler = null;
	_subSeekHandler = null;
}

// VLC-equivalent ASS subtitle renderer
// Implements the same positioning logic as libass/VLC:
//   • \pos(x,y)         → exact pixel → percentage of PlayRes
//   • \an / style align → CSS transform anchor (numpad 1-9)
//   • \move()           → midpoint used for static placement
//   • Style margins     → fallback when no \pos tag present
//   • Inline color/bold/italic from style + overrides
//
// Numpad alignment grid (same as libass):
//   7 8 9   ← top
//   4 5 6   ← middle
//   1 2 3   ← bottom

const _ALIGN_TRANSFORM = {
	1: ['0%', '-100%'], // bot-left
	2: ['-50%', '-100%'], // bot-center
	3: ['-100%', '-100%'], // bot-right
	4: ['0%', '-50%'], // mid-left
	5: ['-50%', '-50%'], // mid-center
	6: ['-100%', '-50%'], // mid-right
	7: ['0%', '0%'], // top-left
	8: ['-50%', '0%'], // top-center
	9: ['-100%', '0%'], // top-right
};
const _ALIGN_TEXT = {
	1: 'left',
	2: 'center',
	3: 'right',
	4: 'left',
	5: 'center',
	6: 'right',
	7: 'left',
	8: 'center',
	9: 'right'
};

const _HAS_LETTER   = /\p{L}/u;
const _IS_NUMS_ONLY = /^[\d\s.,\-]+$/;
// Detects ASS draw-path lines after {\p1} tag stripping.
// Draw paths contain ONLY ASS draw-command letters (m l b h v c s q t a z),
// digits, whitespace, and decimal/minus/slash characters.
// Removing those leaves an empty string for draw data, a non-empty string for real text.
// Also requires at least one digit (so lone letters like "a" or "m" are not flagged).
const _IS_DRAW_CMD = s => {
  const residual = s.replace(/[mlbhvcsqtaz]/gi, '').replace(/[\d\s.,\-\/]/g, '').trim();
  return residual.length === 0 && /\d/.test(s);
};

function _vttToHtml(text) {
	// Escape all HTML first to prevent injection
	text = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	// Now restore safe VTT formatting tags
	text = text
		.replace(/&lt;b&gt;/gi, '<b>')
		.replace(/&lt;\/b&gt;/gi, '</b>')
		.replace(/&lt;i&gt;/gi, '<i>')
		.replace(/&lt;\/i&gt;/gi, '</i>')
		.replace(/&lt;u&gt;/gi, '<u>')
		.replace(/&lt;\/u&gt;/gi, '</u>')
		.replace(/&lt;br&gt;/gi, '<br>')
		.replace(/&lt;br\s*\/&gt;/gi, '<br>');

	return text;
}


// ASS per-segment renderer
// Converts an array of {text, color, bold, italic, underline, fontSize} segments (parsed
// by main.js from raw ASS override tags) into HTML with per-span styling.
// This is what VLC/libass does: every tag-block produces a new styled run of text.
function _renderAssSegments(segments, pResY, dispH) {
	let flat = '';
	for (const seg of segments) {
		const lines = seg.text.split('\n');
		for (let li = 0; li < lines.length; li++) {
			if (li > 0) flat += '\n';
			const raw = lines[li];
			if (!raw) continue;
			const escaped = raw
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
			const css = [];
			// Color: skip pure-white (default), apply everything else
			if (seg.color && !/^#(?:f{6}|fff)$/i.test(seg.color)) css.push('color:' + seg.color);
			if (seg.bold) css.push('font-weight:bold');
			if (seg.italic) css.push('font-style:italic');
			if (seg.underline) css.push('text-decoration:underline');
			if (seg.fontSize > 0) {
				// Scale from ASS canvas pixels to display pixels
				const scaledFs = (pResY > 0 && dispH > 0) ?
					Math.round((seg.fontSize / pResY) * dispH) :
					seg.fontSize;
				if (scaledFs > 0) css.push('font-size:' + scaledFs + 'px');
			}
			flat += css.length ?
				`<span style="${css.join(';')}">${escaped}</span>` :
				escaped;
		}
	}
	// Wrap each line in a .subtitle-line span (matches existing VTT path)
	return flat.split('\n')
		.map(l => `<span class="subtitle-line">${l}</span>`)
		.join('<br>');
}


// Returns the actual rendered height of the video content inside the element 
// The <video> element fills the overlay container but the content is letterboxed.
// Font sizes must be scaled relative to the VIDEO HEIGHT, not the container height —
// exactly like VLC scales libass fonts to the video frame before compositing.
function _getVideoDisplayHeight() {
	const vw = video.videoWidth;
	const vh = video.videoHeight;
	const cw = video.clientWidth || video.offsetWidth;
	const ch = video.clientHeight || video.offsetHeight;
	if (!vw || !vh || !cw || !ch) return ch || 480;
	const videoAspect = vw / vh;
	const containerAspect = cw / ch;
	// object-fit:contain — video is pillarboxed or letterboxed
	if (videoAspect > containerAspect) {
		// Wider than container → letterboxed (bars top/bottom)
		return Math.round(cw / videoAspect);
	} else {
		// Taller than container → pillarboxed (bars left/right)
		return ch;
	}
}

// Build CSS text-shadow from ASS Outline + Shadow values
// Outline is simulated with 8 hard shadows; Shadow is a directional drop shadow.
// Both values are in ASS canvas pixels (at PlayResY scale) — we scale to display.
function _buildAssTextShadow(outlinePx, shadowPx, outlineColor, shadowColor, pResY, dispH) {
	const scale = (pResY > 0 && dispH > 0) ? dispH / pResY : 1;
	const o = outlinePx * scale;
	const s = shadowPx * scale;
	const shadows = [];
	if (o > 0.1) {
		const oc = outlineColor || '#000000';
		const dirs = [
			[-o, -o],
			[-o, 0],
			[-o, o],
			[0, -o],
			[0, o],
			[o, -o],
			[o, 0],
			[o, o]
		];
		for (const [dx, dy] of dirs) {
			shadows.push(`${dx.toFixed(2)}px ${dy.toFixed(2)}px 0 ${oc}`);
		}
	}
	if (s > 0.1) {
		const sc = shadowColor || 'rgba(0,0,0,0.75)';
		shadows.push(`${s.toFixed(2)}px ${s.toFixed(2)}px ${(s * 0.5).toFixed(2)}px ${sc}`);
	}
	return shadows.join(', ');
}

function _renderCues(activeCues) {
	const disp = document.getElementById('subtitle-display');
	if (!disp) return;
	disp.innerHTML = '';
	if (!activeCues || activeCues.length === 0) return;

	const assData = _subtitleCueStyles[currentSubtitleIndex] || null;
	const pResX = assData ? assData.playResX : 0;
	const pResY = assData ? assData.playResY : 0;
	// ── FIXED: dedup by cue identity (id + startTime), NOT by text content.
	// Text-key dedup collapsed ASS layers with identical text but different
	// positions (e.g. honorifics above dialogue). Each cue object is unique.
	const seenCueIds = new Set();
	const usedEventSet = new Set(); // each ASS event consumed by exactly one VTT cue

	Array.from(activeCues).forEach(cue => {
		// Each VTT cue has a unique id assigned by the browser; fall back to
		// startTime+endTime fingerprint so we never render the same cue twice.
		const cueKey = cue.id ? cue.id : `${cue.startTime.toFixed(4)}:${cue.endTime.toFixed(4)}`;
		if (seenCueIds.has(cueKey)) return;
		seenCueIds.add(cueKey);

		const raw = cue.text || '';
		let text = raw
			.replace(/\{[^}]*\\p\d[^}]*\}/g, '') // strip ASS draw-mode {\p1} blocks
			.replace(/\{[^}]+\}/g, '') // strip all other {ASS tag} blocks
			.replace(/\\[Nn]/g, '\n') // \N or \n → real newline
			.trim();
		if (!text) return;

		const validLines = text.split('\n').filter(line => {
			const l = line.trim();
			return l && !_IS_DRAW_CMD(l) && !_IS_NUMS_ONLY.test(l) && _HAS_LETTER.test(l);
		});
		if (validLines.length === 0) return;
		text = validLines.join('\n');

		const plainKey = text.replace(/<[^>]+>/g, '');

		let cueColor = '',
			cueBold = false,
			cueItalic = false,
			cueUnderline = false,
			cueFontName = '';
		let cueFontSize = 0,
			cueOutline = 0,
			cueShadow = 0,
			cueOutlineColor = '#000000',
			cueShadowColor = null,
			cueBorderStyle = 1;
		let posX = null,
			posY = null,
			assAlign = null;
		let bestEvent = null; // hoisted — set inside if(assData), read after it

		if (assData) {
			const st = cue.startTime;
			const et = cue.endTime;

			// Smart event matching
			// Problem: multiple simultaneous ASS events (signs + dialogue) share
			// the same timestamp, so time-only matching assigns them all the same
			// position. Fix: prefer text-content matching; each event consumed once.
			// Step 1: collect ALL events whose time window overlaps this cue.
			const candidates = assData.events.filter(e =>
				Math.abs(e.start - st) < 0.25 ||
				(e.start <= st + 0.05 && e.end >= et - 0.05)
			);

			// Step 2: normalize cue text for comparison (strip HTML tags, lowercase)
			const cueNorm = plainKey
				.replace(/<[^>]+>/g, '')
				.toLowerCase()
				.replace(/s+/g, ' ')
				.trim();

			// Step 3: score each candidate by text similarity (character overlap ratio)
			// then pick the highest-scoring unused event.
			bestEvent = null;
			let bestScore = -1;

			for (const e of candidates) {
				if (usedEventSet.has(e)) continue; // already consumed by another cue

				// Simple similarity: count common chars / max length
				const eText = e.text || '';
				if (!eText && candidates.length === 1) {
					// Only candidate, no text stored — use it directly
					bestEvent = e;
					bestScore = 1;
					break;
				}

				// Compute longest-common-substring approximation via char bigrams
				const bigrams = s => {
					const b = new Set();
					for (let i = 0; i < s.length - 1; i++) b.add(s[i] + s[i + 1]);
					return b;
				};
				const cb = bigrams(cueNorm),
					eb = bigrams(eText);
				let common = 0;
				cb.forEach(g => {
					if (eb.has(g)) common++;
				});
				const score = (cb.size + eb.size) === 0 ? 0 : (2 * common) / (cb.size + eb.size);

				if (score > bestScore) {
					bestScore = score;
					bestEvent = e;
				}
			}

			// Fallback: if no text-match found, take first unused candidate by time
			if (!bestEvent) {
				bestEvent = candidates.find(e => !usedEventSet.has(e)) || candidates[0] || null;
			}

			if (bestEvent) {
				usedEventSet.add(bestEvent); // mark as consumed for this render call
				const styleDef = assData.styles[bestEvent.style] || assData.styles['Default'] || null;
				if (styleDef) {
					cueColor = bestEvent.inlineColor || styleDef.color;
					cueBold = bestEvent.inlineBold != null ? bestEvent.inlineBold : styleDef.bold;
					cueItalic = bestEvent.inlineItalic != null ? bestEvent.inlineItalic : styleDef.italic;
					cueUnderline = styleDef.underline || false;
					cueFontName = styleDef.fontName || '';
					cueFontSize = styleDef.fontSize || 0;
					cueOutline = styleDef.outline || 0;
					cueShadow = styleDef.shadow || 0;
					cueOutlineColor = styleDef.outlineColor || '#000000';
					cueShadowColor = styleDef.shadowColor || null;
					cueBorderStyle = styleDef.borderStyle || 1;
				}
				posX = bestEvent.posX;
				posY = bestEvent.posY;
				assAlign = bestEvent.align ?? (assData.styles[bestEvent.style]?.alignment) ?? 2;

				// Margin-based fallback when no \pos tag
				if (posX === null && pResX > 0 && pResY > 0) {
					const style = assData.styles[bestEvent.style] || {};
					const mL = style.marginL || 0;
					const mR = style.marginR || 0;
					const mV = style.marginV || 0;
					const row = Math.ceil((assAlign || 2) / 3);
					if ((assAlign || 2) % 3 === 1) posX = mL;
					else if ((assAlign || 2) % 3 === 0) posX = pResX - mR;
					else posX = pResX / 2;
					if (row === 1) posY = pResY - mV;
					else if (row === 3) posY = mV;
					else posY = pResY / 2;
				}
			}
		}

		let leftPct, topPct, transformX, transformY, cssAlign;

		if (assData && posX !== null && posY !== null && pResX > 0 && pResY > 0) {
			leftPct = (posX / pResX) * 100;
			topPct = (posY / pResY) * 100;
			const an = Math.max(1, Math.min(9, assAlign || 2));
			[transformX, transformY] = _ALIGN_TRANSFORM[an];
			cssAlign = _ALIGN_TEXT[an];
		} else {
			let vLine = typeof cue.line === 'number' ? cue.line : NaN;
			if (!isNaN(vLine)) {
				topPct = cue.snapToLines === false ?
					Math.max(0, Math.min(100, vLine)) :
					(vLine < 0 ? Math.max(0, 100 + vLine * 5) : Math.min(100, vLine * 5));
			} else {
				topPct = 88;
			}
			leftPct = typeof cue.position === 'number' ? Math.max(0, Math.min(100, cue.position)) : 50;
			const vAlign = cue.align || 'center';
			cssAlign = vAlign === 'start' ? 'left' : vAlign === 'end' ? 'right' : 'center';
			transformX = cssAlign === 'left' ? '0%' : cssAlign === 'right' ? '-100%' : '-50%';
			transformY = '-50%';
		}

		// Clamp positions so cue always stays within the visible overlay 
		// This prevents off-screen placement that causes 1-char-wide wrapping.
		leftPct = Math.max(0, Math.min(100, leftPct));
		topPct = Math.max(0, Math.min(100, topPct));

		// Max-width: for positioned ASS cues use generous width so text doesn't
		// wrap character-by-character. Never trust cue.size from VTT (FFmpeg often
		// sets it to tiny values for sign subtitles).
		const hasAssPos = assData && posX !== null;
		const maxW = hasAssPos ? 90 : Math.max(50, Math.min(90, cue.size || 80));

		const wrapper = document.createElement('div');
		// 'wrap' class enables word-wrap for multi-line dialogue.
		// Single-line positioned signs use nowrap (default) to prevent char-by-char stacking.
		const isMultiLine = text.includes('\n');
		wrapper.className = 'subtitle-cue' + (isMultiLine ? ' wrap' : '');
		wrapper.style.cssText = [
			'left:' + leftPct.toFixed(3) + '%',
			'top:' + topPct.toFixed(3) + '%',
			'transform:translate(' + transformX + ',' + transformY + ')',
			'text-align:' + cssAlign,
			'max-width:' + maxW + '%',
		].join(';');

		// Color: apply wrapper-level style only for non-segmented cues.
		// For ASS segment cues, each <span> already carries its own color — applying
		// a wrapper color would override per-segment colors via CSS inheritance.
		const useSegments = bestEvent && Array.isArray(bestEvent.segments) && bestEvent.segments.length > 0;
		const isWhite = c => !c || /^#(?:f{6}|fff)$/i.test(c);
		if (!useSegments && !isWhite(cueColor)) {
			wrapper.style.color = cueColor;
		}
		// Bold / italic / underline: only set on wrapper for non-segmented cues.
		if (!useSegments) {
			if (cueBold) wrapper.style.fontWeight = 'bold';
			if (cueItalic) wrapper.style.fontStyle = 'italic';
			if (cueUnderline) wrapper.style.textDecoration = 'underline';
		}
		if (cueFontName) wrapper.style.fontFamily = '"' + cueFontName + '",Fira Sans,sans-serif';

		// Font size: scale ASS canvas pixels → actual video display pixels 
		// ASS FontSize is relative to PlayResY (the subtitle canvas height).
		// We must scale to the VIDEO's rendered height — NOT the overlay div height —
		// because the video is letterboxed inside the container.
		if (cueFontSize > 0) {
			const videoH = _getVideoDisplayHeight();
			const scaledFs = pResY > 0 ? Math.round((cueFontSize / pResY) * videoH) : cueFontSize;
			if (scaledFs > 0) wrapper.style.fontSize = scaledFs + 'px';
		}

		// Text shadow: ASS Outline + Shadow → CSS text-shadow
		// BorderStyle=3 = opaque box background (no outline/shadow, use bg instead).
		if (cueBorderStyle === 3) {
			// Opaque box: use a solid background color instead of text-shadow outline
			const boxBg = cueShadowColor || 'rgba(0,0,0,0.85)';
			wrapper.style.backgroundColor = boxBg;
			wrapper.style.padding = '2px 6px';
			wrapper.style.borderRadius = '2px';
		} else {
			const videoH = _getVideoDisplayHeight();
			const ts = _buildAssTextShadow(cueOutline, cueShadow, cueOutlineColor, cueShadowColor, pResY, videoH);
			if (ts) wrapper.style.textShadow = ts;
		}

		// Build inner HTML
		// Prefer ASS segments (multi-color support) over plain VTT text.
		// bestEvent.segments is set by main.js for ASS/SSA tracks; it is
		// undefined for plain SRT/VTT tracks — fall back to _vttToHtml in that case.
		let innerHtml;
		if (bestEvent && Array.isArray(bestEvent.segments) && bestEvent.segments.length > 0) {
			// ASS path: render every segment with its own inline color/bold/italic
			// Use actual VIDEO display height (not overlay height) for correct font scaling
			const videoH = _getVideoDisplayHeight();
			innerHtml = _renderAssSegments(bestEvent.segments, pResY, videoH);
		} else {
			// VTT/SRT path: convert <b>/<i>/<u> VTT tags to HTML
			innerHtml = text.split('\n')
				.map(line => '<span class="subtitle-line">' + _vttToHtml(line.trim()) + '</span>')
				.join('<br>');
		}
		wrapper.innerHTML = innerHtml;
		disp.appendChild(wrapper);
	});
}

// Attach cuechange + seeked listeners once cues are confirmed loaded.
function _attachSubtitleListeners(track) {
  // Debounce cuechange — fires up to 4x/sec on some tracks, causing layout thrash
  let _cueDebounce = null;
  function _debouncedRender() {
    clearTimeout(_cueDebounce);
    _cueDebounce = setTimeout(() => _renderCues(track.activeCues), 16); // ≤1 frame late
  }

  _subCueHandler  = _debouncedRender;
  _subSeekHandler = () => {
    clearTimeout(_cueDebounce);
    _renderCues(track.activeCues); // seek: render immediately, no debounce
  };

  track.addEventListener('cuechange', _subCueHandler);
  video.addEventListener('seeked',    _subSeekHandler);
  _renderCues(track.activeCues);
}

function switchSubtitleTrack(index) {
	currentSubtitleIndex = index;
	_subtitleTeardown();

	// Persist choice so it survives file reload / next session
	const _subKey = 'lastSub:' + (mediaFiles[currentVideoIndex] || '');
	try { localStorage.setItem(_subKey, index); } catch {}

	// UI highlight
	document.querySelectorAll('.subtitle-item').forEach(el => {
		const isActive = parseInt(el.dataset.index, 10) === index;
		el.classList.toggle('active', isActive);
		const icon = el.querySelector('.cm-icon');
		if (icon) icon.textContent = isActive ? '●' : '';
	});
	if (index === -1) {
		showStatusMessage('Subtitles Off');
		return;
	}

	const track = Array.from(video.textTracks)[index];
	if (!track) {
		console.warn('[Sub] No textTrack at index', index);
		return;
	}

	// mode = 'hidden' → browser parses cues into memory, suppresses native rendering
	track.mode = 'hidden';
	_subTrack = track;

	// Blob URLs are served from local memory — cues parse almost instantly,
	// but the browser does it async. Poll until cues arrive (max 5 s).
	if (track.cues && track.cues.length > 0) {
		_attachSubtitleListeners(track);
		showStatusMessage('Subtitle: ' + (track.label || `Track ${index + 1}`));
		return;
	}

	let waited = 0;
	_subReadyTimer = setInterval(() => {
		waited += 80;
		if (track.cues && track.cues.length > 0) {
			clearInterval(_subReadyTimer);
			_subReadyTimer = null;
			_attachSubtitleListeners(track);
			showStatusMessage('Subtitle: ' + (track.label || `Track ${index + 1}`));
		} else if (waited >= 5000) {
			clearInterval(_subReadyTimer);
			_subReadyTimer = null;
			console.warn('[Sub] Cues never loaded for track', index);
			showStatusMessage('Subtitle: no cues found');
		}
	}, 80);
}

// Fullscreen — adjust subtitle position class
document.addEventListener('fullscreenchange', () => {
	const disp = document.getElementById('subtitle-display');
	if (disp) disp.classList.toggle('fullscreen', !!document.fullscreenElement);
});

// Handle click on dropdowns to toggle visibility
document.querySelectorAll(".sub-dropdown").forEach((subDropdown) => {
	const subDropdownContent = subDropdown.querySelector(".sub-dropdown-content");
	if (!subDropdownContent) {
		return;
	}

	subDropdown.addEventListener("click", function(e) {
		e.stopPropagation(); // Prevent click event from bubbling up

		const isVisible = subDropdownContent.style.display === "block";

		// Close all sub-dropdowns before toggling the current one
		document.querySelectorAll(".sub-dropdown-content").forEach((content) => {
			if (content) content.style.display = "none";
		});

		// Toggle visibility of the clicked sub-dropdown
		subDropdownContent.style.display = isVisible ? "none" : "block";
	});
});

// Hide dropdown when clicking outside
window.addEventListener("click", function() {
	document.querySelectorAll(".sub-dropdown-content").forEach((content) => {
		if (content) content.style.display = "none";
	});
});
+
// Show the sub-dropdown content on hover
document.querySelectorAll(".sub-dropdown").forEach((subDropdown) => {
	const subDropdownContent = subDropdown.querySelector(".sub-dropdown-content");

	// Skip if no content element found
	if (!subDropdownContent) return;

	// Show on hover
	subDropdown.addEventListener("mouseover", function() {
		subDropdownContent.style.display = "block"; // Always show if hovered
	});

	// Hide on mouseout (unless it's locked by click or hovered on content)
	subDropdown.addEventListener("mouseout", function(e) {
		// Check if mouse is not entering the sub-dropdown content
		if (!subDropdown.contains(document.activeElement) && !subDropdownContent.contains(e.relatedTarget)) {
			subDropdownContent.style.display = "none"; // Hide only if mouse leaves both
		}
	});
});

// Prevent hiding when hovering over dropdown content
document.querySelectorAll(".sub-dropdown-content").forEach((content) => {
	content.addEventListener("mouseover", function() {
		content.style.display = "block"; // Keep visible on hover
	});

	content.addEventListener("mouseout", function(e) {
		if (!content.parentElement.contains(document.activeElement) &&
			(!e.relatedTarget || !content.contains(e.relatedTarget))) {
			content.style.display = "none";
		}
	});
});

document.addEventListener("click", () => {
	if (!audioContext) {
		audioContext = new AudioContext();
	} else if (audioContext.state === "suspended") {
		audioContext.resume();
	}
});

// Window control buttons

if (maximizeBtn) {
	maximizeBtn.addEventListener("click", () => window.electron.maximize());
}
if (minimizeBtn) {
	minimizeBtn.addEventListener("click", () => window.electron.minimize());
}

// Function to update the maximize button icon
function updateMaximizeIcon(maximized) {
	isMaximized = maximized;
	const maximizeIcon = document.querySelector("#maximize img");
	if (maximizeIcon) {
		maximizeIcon.src = isMaximized ?
			"../../assets/icons/win/restore-maximize.png" :
			"../../assets/icons/win/maximize.png";
		maximizeIcon.parentElement.title = isMaximized ? "Restore Down" : "Maximize";
	}
}

// Initialize window states
window.electron.onInitialWindowStates(({
	isMaximized,
	isFullscreen
}) => {
	updateMaximizeIcon(isMaximized);
	updateFullscreenIcon(isFullscreen);
});

// Listen for window state changes
window.electron.onWindowMaximizeState(updateMaximizeIcon);
window.electron.onFullscreenStateChanged(updateFullscreenIcon);

document.querySelector("#window-close").addEventListener("click", () => {
	savePlaybackAndQuit();
});

// ✅ Modified function to handle file open from system
window.electron.onFileOpen(async (filePath) => {
	if (filePath) {
		// Get real long filename from main process (fixes Windows 8.3 short names)
		const realPath = await window.electron.invoke('get-real-filename', filePath);
		
		// Get all media files from the same folder (sorted)
		const folderData = await window.electron.invoke('get-folder-media-files', realPath);
		
		if (!isFirstFileOpened) {
			// First file - initialize playlist with ALL files from the folder
			mediaFiles = folderData.files || [realPath];
			currentVideoIndex = mediaFiles.indexOf(realPath);
			if (currentVideoIndex === -1) {
				currentVideoIndex = 0;
			}
			isFirstFileOpened = true;
			updatePlaylistDropdown(mediaFiles);
			playMediaFile(mediaFiles[currentVideoIndex], mediaFiles[currentVideoIndex].split(/[/\\]/).pop());
		} else {
			// Subsequent files - add all folder files to playlist (avoid duplicates)
			const newFiles = folderData.files || [realPath];
			for (const file of newFiles) {
				if (!mediaFiles.includes(file)) {
					mediaFiles.push(file);
				}
			}
			updatePlaylistDropdown(mediaFiles);
			// Do not auto-play - let the current file continue
		}
	}
});

// ✅ Modified function for folder open from context menu
window.electron.openFolderFromContext(async (folderPath) => {
	try {
		const receivedFiles = await window.electron.invoke("open-folder", folderPath);

		if (Array.isArray(receivedFiles) && receivedFiles.length > 0) {
			// Resolve real filenames for all files (fixes Windows 8.3 short names)
			const resolvedFiles = await Promise.all(
				receivedFiles.map(filePath => window.electron.invoke('get-real-filename', filePath))
			);

			// Always REPLACE old playlist with the new folder's files
			mediaFiles = resolvedFiles;
			currentVideoIndex = 0;
			isFirstFileOpened = true;
			playMediaFile(mediaFiles[currentVideoIndex]);
			updatePlaylistDropdown(mediaFiles);
			// ✅  Highlight after playlist update
			highlightCurrentVideo(mediaFiles[currentVideoIndex]);
			showStatusMessage(`Loaded ${resolvedFiles.length} video(s) from folder`);
		}
	} catch (error) {
		console.error("❌ Error loading folder:", error);
	}
});

// Update Dialog Functions
const updateDialog = {
  _snoozeTimer: null,
  _currentVersion: null,
 
  init() {
    this.dialog       = document.getElementById('updateDialog');
    this.laterBtn     = document.getElementById('updateLaterBtn');
    this.installBtn   = document.getElementById('updateNowBtn');
    this.verFrom      = document.getElementById('udVerFrom');
    this.verTo        = document.getElementById('udVerTo');
    this.badge        = document.getElementById('udBadge');
    this.changelogList = document.getElementById('udChangelogList');
    this.sizeLabel    = document.getElementById('udSizeLabel');
 
    this.installBtn?.addEventListener('click', () => {
      window.electron.startUpdateDownload();
      this.hide();
    });
 
    this.laterBtn?.addEventListener('click', () => {
      this.hide();
      if (this._snoozeTimer) clearTimeout(this._snoozeTimer);
      // Remind again in 10 minutes
      this._snoozeTimer = setTimeout(() => this.show(), 10 * 60 * 1000);
    });
 
    // Close on backdrop click
    this.dialog?.addEventListener('click', (e) => {
      if (e.target === this.dialog) this.hide();
    });
  },
 
_parseChangelog(notes) {
  // First try to use release notes from GitHub
  if (notes && notes.length > 10) {
    const plainText = notes
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
    
    const TAG_MAP = {
      new:   { label: 'NEW',   cls: 'ud-tag--new' },
      fix:   { label: 'FIX',   cls: 'ud-tag--fix' },
      perf:  { label: 'PERF',  cls: 'ud-tag--perf' },
      ui:    { label: 'UI',    cls: 'ud-tag--ui' },
      break: { label: 'BREAK', cls: 'ud-tag--break' },
    };
    
    const entries = [];
    const lines = plainText.split('\n');
    
    for (const rawLine of lines) {
      const line = rawLine.replace(/^[-*•]\s*/, '').trim();
      if (!line || line.startsWith('#')) continue;
      
      const tagMatch = line.match(/^\[([A-Z]+)\]\s*(.*)/i);
      if (tagMatch) {
        const key = tagMatch[1].toLowerCase();
        const text = tagMatch[2].trim();
        if (!text) continue;
        const tagDef = TAG_MAP[key] || { label: tagMatch[1].toUpperCase(), cls: 'ud-tag--other' };
        entries.push({ tag: tagDef.label, cls: tagDef.cls, text });
      } else if (line.length > 3) {
        entries.push({ tag: '·', cls: 'ud-tag--other', text: line });
      }
    }
    
    if (entries.length) return entries.slice(0, 8);
  }
  
  // Fallback: load from local changelog.json
  try {
    // Fetch from bundled JSON
    return fetch('../../core/changelog.json')
      .then(res => res.json())
      .then(data => {
        const entries = [];
        const changelog = data.latest || [];
        for (const line of changelog) {
          const tagMatch = line.match(/^\[([A-Z]+)\]\s*(.*)/);
          if (tagMatch) {
            const tag = tagMatch[1];
            const text = tagMatch[2];
            let cls = 'ud-tag--other';
            if (tag === 'NEW') cls = 'ud-tag--new';
            else if (tag === 'FIX') cls = 'ud-tag--fix';
            else if (tag === 'PERF') cls = 'ud-tag--perf';
            else if (tag === 'UI') cls = 'ud-tag--ui';
            else if (tag === 'BREAK') cls = 'ud-tag--break';
            entries.push({ tag, cls, text });
          } else if (line.trim()) {
            entries.push({ tag: '·', cls: 'ud-tag--other', text: line });
          }
        }
        return entries;
      })
      .catch(() => {
        // Ultimate fallback
        return [
          { tag: 'NEW', cls: 'ud-tag--new', text: 'Latest features and improvements' },
          { tag: 'FIX', cls: 'ud-tag--fix', text: 'Bug fixes and stability updates' },
          { tag: 'PERF', cls: 'ud-tag--perf', text: 'Performance optimizations' },
        ];
      });
  } catch (e) {
    return [
      { tag: 'NEW', cls: 'ud-tag--new', text: 'Latest features and improvements' },
      { tag: 'FIX', cls: 'ud-tag--fix', text: 'Bug fixes and stability updates' },
    ];
  }
},

async _renderChangelog(entries) {
  if (!this.changelogList) return;
  
  // If entries is a Promise (from fetch), resolve it first
  let resolvedEntries = entries;
  if (entries && typeof entries.then === 'function') {
    resolvedEntries = await entries;
  }
  
  if (!resolvedEntries || resolvedEntries.length === 0) {
    this.changelogList.innerHTML =
      '<div class="ud-changelog-empty">No changelog available for this release.</div>';
    return;
  }
  
  this.changelogList.innerHTML = '';
  resolvedEntries.forEach(({ tag, cls, text }, i) => {
    const row = document.createElement('div');
    row.className = 'ud-entry';
    row.style.animationDelay = `${0.04 + i * 0.05}s`;
    
    const pill = document.createElement('span');
    pill.className = `ud-tag ${cls}`;
    pill.textContent = tag;
    
    const label = document.createElement('span');
    label.textContent = text;
    
    row.append(pill, label);
    this.changelogList.appendChild(row);
  });
},
  // ── Detect stability tier from version string ────────────────────────────
  // e.g. "2.2.0-beta.1" → beta, "2.2.0-rc.1" → rc, "2.2.0" → stable
  _detectStability(version) {
    if (!version) return 'STABLE';
    const v = version.toLowerCase();
    if (v.includes('beta'))  return 'BETA';
    if (v.includes('rc'))    return 'RC';
    if (v.includes('alpha')) return 'ALPHA';
    if (v.includes('nightly')) return 'NIGHTLY';
    return 'STABLE';
  },
 
  // ── Show the dialog ──────────────────────────────────────────────────────
  async show(info = {}) {
    if (!this.dialog) return;
 
    const newVersion = info.version || '—';
    this._currentVersion = newVersion;
 
    // Populate version labels
    if (this.verTo) this.verTo.textContent = `v${newVersion}`;
 
    // Current version — try to get from electron, fall back to '?'
    try {
      const appInfo = await window.electron.getAppInfo?.();
      if (appInfo?.version && this.verFrom) {
        this.verFrom.textContent = `v${appInfo.version}`;
      }
    } catch {
      if (this.verFrom) this.verFrom.textContent = '...';
    }
 
    // Stability badge
    const stability = this._detectStability(newVersion);
    if (this.badge) {
      this.badge.textContent = stability;
      this.badge.className = 'ud-badge';
      if (stability === 'BETA')   this.badge.classList.add('ud-badge--beta');
      if (stability === 'RC')     this.badge.classList.add('ud-badge--rc');
    }
 
    // Download size — electron-updater provides info.files[].size in bytes
    const totalBytes = info.files?.reduce((sum, f) => sum + (f.size || 0), 0) ?? 0;
    if (this.sizeLabel) {
      if (totalBytes > 0) {
        const mb = (totalBytes / (1024 * 1024)).toFixed(0);
        this.sizeLabel.textContent = `~${mb} MB download`;
      } else {
        this.sizeLabel.textContent = 'Download size unknown';
      }
    }
 
  // Show skeletons immediately
  if (this.changelogList) {
    this.changelogList.innerHTML = `
      <div class="ud-changelog-loading">
        <div class="ud-skeleton"></div>
        <div class="ud-skeleton ud-skeleton--short"></div>
        <div class="ud-skeleton"></div>
      </div>`;
  }
 
    // Parse release notes (provided by electron-updater from GitHub release body)
    const notes = info.releaseNotes || info.releaseNote || '';
    const entries = this._parseChangelog(notes);
 
    // Brief delay so skeletons are visible (feels like it fetched something)
    setTimeout(() => this._renderChangelog(entries), 350);
 
    // Show the dialog
    this.dialog.classList.add('active');
  },
 
  hide() {
    this.dialog?.classList.remove('active');
  },
};
 

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// Visualization is only for audio — disable it in context menu on startup
	// (will be re-enabled when an audio file is loaded, exactly like the navbar)
	const cmVizItem = document.getElementById("cm-viz-item");
	if (cmVizItem) { cmVizItem.classList.add("cm-viz-disabled"); }

	updateDialog.init();

	window.electron.onUpdateAvailable((_, info) => {
		if (info?.version) {
			showStatusMessage(`Update available: v${info.version} — open About to install`, 7000);
		}
		updateDialog.show(info?.version);
		_setUpdateStatus(
			'about-update-status--available',
			`<img class="svg-icon" src="../../assets/icons/fa/arrow-up-from-bracket.svg" alt=""> Update v${info?.version || ''} available — click to install`
		);
	});

	// Up-to-date — only update the About modal status bar, no popup notification
	if (window.electron.onUpdateNotAvailable) {
		window.electron.onUpdateNotAvailable(() => {
			_setUpdateStatus(
				'about-update-status--ok',
				'<img class="svg-icon" src="../../assets/icons/fa/circle-check.svg" alt=""> You\'re up to date!'
			);
			// No showStatusMessage here — user should not see a popup on every launch
		});
	}

	window.electron.onUpdateError((_, errMsg) => {
		console.error('Update check error:', errMsg);
		showStatusMessage('⚠️ Update check failed — check your connection', 5000);
		const statusEl = document.getElementById('aboutUpdateStatus');
		// Don't overwrite a positive result that already arrived
		if (statusEl &&
		    !statusEl.classList.contains('about-update-status--ok') &&
		    !statusEl.classList.contains('about-update-status--available')) {
			_setUpdateStatus(
				'about-update-status--error',
				'<img class="svg-icon" src="../../assets/icons/fa/triangle-exclamation.svg" alt=""> Update check failed — check your connection.'
			);
		} else if (statusEl) {
			// Still clear the icon spinner and timer
			const iconEl = document.getElementById('aboutUpdateIcon');
			if (iconEl) iconEl.classList.remove('fa-spin');
			if (_updateCheckTimer) { clearTimeout(_updateCheckTimer); _updateCheckTimer = null; }
		}
	});

	// ── Folder validation progress feedback ─────────────────────────────────
  if (window.electron.onFolderValidationStart) {
    window.electron.onFolderValidationStart(({ total }) => {
      showStatusMessage(`Scanning ${total} file${total !== 1 ? 's' : ''}…`);
    });
  }
  if (window.electron.onFolderValidationProgress) {
    window.electron.onFolderValidationProgress(({ done, total }) => {
      if (done % 5 === 0 || done === total) { // update every 5 files
        showStatusMessage(`Validating ${done} / ${total}…`);
      }
    });
  }
  if (window.electron.onFolderValidationDone) {
    window.electron.onFolderValidationDone(({ validCount, skippedCount, skipped }) => {
      if (skippedCount === 0) {
        showStatusMessage(`Loaded ${validCount} file${validCount !== 1 ? 's' : ''}`);
      } else {
        showStatusMessage(
          `Loaded ${validCount} file${validCount !== 1 ? 's' : ''} · skipped ${skippedCount} corrupt`
        );
        console.group('[Folder Scan] Skipped files:');
        skipped.forEach(s => console.warn(`  • ${s.name}: ${s.reason}`));
        console.groupEnd();
      }
    });
  }
  if (window.electron.onBackgroundValidationDone) {
    window.electron.onBackgroundValidationDone(({ skipped }) => {
      if (skipped.length > 0) {
        showStatusMessage(`⚠ ${skipped.length} corrupt file${skipped.length > 1 ? 's' : ''} detected in playlist`);
        console.group('[Background Validation] Corrupt files found:');
        skipped.forEach(s => console.warn(`  • ${s.name}: ${s.reason}`));
        console.groupEnd();
      }
    });
  }
});


// ✅ Handle actions from tray
// Handle play/pause action from tray
window.electron.onPlayPause(() => {
	togglePlayPause();
});

// Send the initial playback state when requested
window.electron.requestInitialPlayState();
window.electron.onInitialPlayState((state) => {
	window.electron.sendPlayPauseStateForTray(state || "paused");
	window.electron.sendPlayPauseStateForThumbar(state || "playing");
});

// GPU info: show status notification only on the very first launch after install.
// Uses localStorage so it is truly shown once and never again.
(async () => {
	try {
		const gpuShown = localStorage.getItem('gpuNotificationShown');
		if (gpuShown) return; // Already shown before — skip every subsequent launch

		const gpuInfo = await window.electron.invoke('get-gpu-info');
		if (gpuInfo && gpuInfo.vendor !== 'unknown') {
			const gpuName = (gpuInfo.gpus && gpuInfo.gpus[0]) ?
				(gpuInfo.gpus[0].description || gpuInfo.gpus[0].model || gpuInfo.vendor.toUpperCase()) :
				gpuInfo.vendor.toUpperCase();
			const hwLabel = gpuInfo.hwAccel !== 'none' ? ` · ${gpuInfo.hwAccel}` : '';
			showStatusMessage(`GPU: ${gpuName}${hwLabel}`);
			localStorage.setItem('gpuNotificationShown', '1'); // Never show again
		}
	} catch (e) {
		/* silent */
	}
})();

// Handle playNext action from tray
window.electron.onNext(() => {
	playNext();
});

// Handle playPrevious action from tray
window.electron.onPrevious(() => {
	playPrevious();
});

// Handle volume increase action from tray
window.electron.onIncreaseVolume(() => {
	const newPct = Math.min(200, gainToPct(gainNode.gain.value) + 5);
	const newVol = pctToGain(newPct);
	updateVolume(newVol);
	showStatusMessage(`Volume: ${newPct}%`, newPct > 100 ? 'vol-high' : 'vol-normal');
});

// Handle volume decrease action from tray
window.electron.onDecreaseVolume(() => {
	const newPct = Math.max(0, gainToPct(gainNode.gain.value) - 5);
	const newVol = pctToGain(newPct);
	updateVolume(newVol);
	showStatusMessage(`Volume: ${newPct}%`, newPct > 100 ? 'vol-high' : 'vol-normal');
});

// Handle mute action from tray
window.electron.onMute(() => {
	toggleMute();
});

// Handle Repate action from tray
window.electron.onShuffleState(() => {
	toggleShuffleMode();
});

// Handle repeat action from tray
window.electron.onRepeatState(() => {
	toggleRepeat();
});

//  AUDIO EFFECTS  (Auto / Voice / Movie / Music / Comfort)
//
// Design goals:
//  • Each preset must be CLEARLY audible as different (Dolby-style noticeable difference)
//  • Voice always intelligible — background voices, deep voices, whispers all hearable
//  • 200% volume stays clean — masterLimiter handles peaks, presets don't fight gain
//  • Compressor settings per preset restore dynamics that are appropriate for content

const EQ_PRESETS = {
	// ── AUTO — smart balanced mode, slightly vocal-forward ──────────────────
	auto: {
		label: 'Auto',
		filters: [
			// Remove sub-bass rumble (mic handling noise, AC hum)
			{ type: 'highpass',  frequency: 40,   Q: 0.7, gain: 0 },
			// Subtle warmth — makes audio feel "full" vs flat
			{ type: 'lowshelf',  frequency: 120,  Q: 1.0, gain: 2 },
			// Presence boost — the key freq for speech intelligibility
			{ type: 'peaking',   frequency: 2800, Q: 1.2, gain: 4 },
			// Air — opens up high end, reduces that "under a blanket" feel
			{ type: 'highshelf', frequency: 9000, Q: 0.8, gain: 2 },
		],
		// Passthrough compressor — no gain reduction, no makeup needed.
		// Ratio 1:1 + threshold 0 = completely transparent. This makes the
		// 'auto' preset match VLC's volume exactly at the same slider position.
		compThreshold: 0,   compRatio: 1,   compKnee: 0,
		compAttack: 0.015,  compRelease: 0.2,
		compMakeupGain: 1.0,
		panValue: 0,
	},

	// ── VOICE / DIALOG — Dolby Voice-style: crystal-clear speech ─────────────
	// Deep voices, background dialogue, soft-spoken characters — all come forward.
	// Inspired by Dolby Voice: removes mud, boosts presence, opens highs.
	coding: {
		label: 'Voice',
		filters: [
			// Cut sub-bass hard — removes rumble that masks speech
			{ type: 'highpass',  frequency: 80,   Q: 0.9, gain: 0 },
			// Warmth for deep voices — Morgan Freeman / bass voices
			{ type: 'peaking',   frequency: 180,  Q: 0.8, gain: 3 },
			// Cut "boxy" mud — the 300–400 Hz range smears intelligibility
			{ type: 'peaking',   frequency: 350,  Q: 1.2, gain: -3 },
			// Core presence — this single band is where speech lives (Dolby secret)
			{ type: 'peaking',   frequency: 2500, Q: 1.0, gain: 6 },
			// Upper presence — consonants (s, t, f) — makes speech "crisp"
			{ type: 'peaking',   frequency: 5000, Q: 1.0, gain: 4 },
			// Air shelf — lifts the "veil", opens dialogue up
			{ type: 'highshelf', frequency: 9000, Q: 0.8, gain: 3 },
		],
		// Heavier compression: brings up background voices, quieter characters
		compThreshold: -32, compRatio: 5, compKnee: 8,
		compAttack: 0.008,  compRelease: 0.15,
		// Full makeup: threshold -32, ratio 5 → ~25 dB reduction → 10^(25/20) ≈ 17.8× (capped at 10×)
		compMakeupGain: 10.0,
		panValue: 0,
	},

	// ── MOVIE — cinematic: deep impact bass + clear dialogue + sparkle ────────
	movie: {
		label: 'Movie',
		filters: [
			// Deep cinematic bass — explosions, score, LFE feel
			{ type: 'lowshelf',  frequency: 80,   Q: 0.8, gain: 6 },
			// Cut muddy low-mid — keeps bass clean, separates from dialogue
			{ type: 'peaking',   frequency: 280,  Q: 1.0, gain: -2 },
			// Dialogue presence — actors always audible over music/effects
			{ type: 'peaking',   frequency: 3000, Q: 1.3, gain: 5 },
			// Cinematic sparkle — surround-like air
			{ type: 'highshelf', frequency: 10000, Q: 0.8, gain: 4 },
		],
		// Medium compression: evening out action scenes vs quiet dialogue
		compThreshold: -26, compRatio: 4, compKnee: 10,
		compAttack: 0.01,   compRelease: 0.25,
		// Full makeup: threshold -26, ratio 4 → ~19 dB reduction → 10^(19/20) ≈ 8.9×
		compMakeupGain: 8.9,
		panValue: 0,
	},

	// ── MUSIC — V-curve: punchy bass + vocal clarity + airy highs ────────────
	music: {
		label: 'Music',
		filters: [
			// Punchy sub-bass — kick drum, bass guitar feel
			{ type: 'lowshelf',  frequency: 100,  Q: 0.8, gain: 5 },
			// Cut muddiness in low-mids (common in compressed pop music)
			{ type: 'peaking',   frequency: 400,  Q: 0.8, gain: -2 },
			// Vocal clarity — brings singers forward in the mix
			{ type: 'peaking',   frequency: 3500, Q: 1.0, gain: 3 },
			// Brilliance / air — hi-hats, cymbals, acoustic shimmer
			{ type: 'highshelf', frequency: 12000, Q: 0.8, gain: 5 },
		],
		compThreshold: -30, compRatio: 3, compKnee: 12,
		compAttack: 0.012,  compRelease: 0.2,
		// Full makeup: threshold -30, ratio 3 → ~20 dB reduction → 10^(20/20) = 10.0×
		compMakeupGain: 10.0,
		panValue: 0,
	},

	// ── COMFORT / NIGHT — gentle, warm, low-fatigue listening ────────────────
	// Background playback, sleeping, late night — nothing harsh or spiky.
	// Heavy compression brings up quiet parts so you don't miss dialogue.
	comfort: {
		label: 'Comfort',
		filters: [
			// Remove harsh sub-bass (avoids waking others)
			{ type: 'highpass',  frequency: 100,  Q: 0.7, gain: 0 },
			// Gentle warmth
			{ type: 'peaking',   frequency: 600,  Q: 0.9, gain: 2 },
			// Mild presence — speech stays understandable at low volume
			{ type: 'peaking',   frequency: 2200, Q: 1.0, gain: 3 },
			// Tame harshness — high frequencies reduced (no ear fatigue)
			{ type: 'highshelf', frequency: 7000, Q: 0.8, gain: -5 },
		],
		// Heavy gentle comp: raises whispers, softens shouts — night-mode leveling
		compThreshold: -40, compRatio: 6, compKnee: 15,
		compAttack: 0.02,   compRelease: 0.3,
		// Full makeup: threshold -40, ratio 6 → ~33 dB reduction → capped at 15× for safety
		compMakeupGain: 15.0,
		panValue: 0,
	},
};

let _eqFilterNodes = [];
let _activeEffectKey = null;

function applyAudioEffect(key) {
	const preset = EQ_PRESETS[key];
	if (!preset) return;
	if (typeof audioContext === 'undefined' || typeof gainNode === 'undefined') return;

	const now = audioContext.currentTime;

	// 1. Disconnect old EQ filter nodes cleanly
	_eqFilterNodes.forEach(f => { try { f.disconnect(); } catch (_) {} });
	_eqFilterNodes = [];

	// 2. Resume context if suspended (browser autoplay policy)
	if (audioContext.state === 'suspended') audioContext.resume();

	// 3. Disconnect source from compressor so we can splice EQ in between
	try { source.disconnect(); } catch (_) {}

	// 4. Build new EQ filter chain for this preset
	const filters = preset.filters.map(cfg => {
		const f = audioContext.createBiquadFilter();
		f.type = cfg.type;
		f.frequency.setValueAtTime(cfg.frequency, now);
		f.Q.setValueAtTime(cfg.Q ?? 1.0, now);
		if (cfg.gain !== undefined) f.gain.setValueAtTime(cfg.gain, now);
		return f;
	});

	// Chain filters together: f[0] → f[1] → … → f[n]
	if (filters.length > 1) {
		filters.reduce((prev, curr) => { prev.connect(curr); return curr; });
	}

	// 5. Re-wire: source → [EQ] → compressor → compMakeupNode → stereoPanner → gainNode → masterLimiter → dest
	if (filters.length > 0) {
		source.connect(filters[0]);
		filters[filters.length - 1].connect(compressor);
	} else {
		source.connect(compressor);
	}
	// Downstream nodes are permanently wired (compressor → compMakeupNode → stereoPanner → gainNode → masterLimiter)

	_eqFilterNodes = filters;

	// 6. Update compressor parameters for this preset
	const ramp = now + 0.15;
	compressor.threshold.linearRampToValueAtTime(preset.compThreshold, ramp);
	compressor.ratio.linearRampToValueAtTime(preset.compRatio, ramp);
	if (preset.compKnee   !== undefined) compressor.knee.linearRampToValueAtTime(preset.compKnee,    ramp);
	if (preset.compAttack  !== undefined) compressor.attack.linearRampToValueAtTime(preset.compAttack,  ramp);
	if (preset.compRelease !== undefined) compressor.release.linearRampToValueAtTime(preset.compRelease, ramp);

	// 6b. Apply makeup gain to restore level lost to compression.
	//     'auto' uses compMakeupGain: 1.0 (passthrough) — matches VLC volume directly.
	//     Other presets use calculated values to compensate their compression depth.
	const makeup = preset.compMakeupGain ?? 1.0;
	compMakeupNode.gain.linearRampToValueAtTime(makeup, ramp);

	// 7. Pan (center by default in all presets)
	if (typeof stereoPanner !== 'undefined') {
		stereoPanner.pan.linearRampToValueAtTime(preset.panValue ?? 0, ramp);
	}

	_activeEffectKey = key;
	_updateEffectUI(key);
	localStorage.setItem('activeAudioEffect', key);
	if (typeof showStatusMessage === 'function') showStatusMessage(`Audio: ${preset.label}`);
}

function _updateEffectUI(activeKey) {
	document.querySelectorAll('.audio-effect-option').forEach(el => {
		const isActive = el.dataset.effect === activeKey;
		el.classList.toggle('effect-active', isActive);
		// Update cm-check icon (context menu)
		const cmCheck = el.querySelector('.cm-check');
		if (cmCheck) cmCheck.textContent = isActive ? '●' : '';
		// Update nav-effect-check icon (nav bar)
		const navCheck = el.querySelector('.nav-effect-check');
		if (navCheck) navCheck.textContent = isActive ? '●' : '';
	});
}

// Wire nav-bar effect menu items
const _effectIdMap = {
	AutoToggle: 'auto',
	CodingAudioToggle: 'coding',
	MovieAudioToggle: 'movie',
	MusicAudioToggle: 'music',
	comfortModeToggle: 'comfort',
};
Object.entries(_effectIdMap).forEach(([id, key]) => {
	const el = document.getElementById(id);
	if (!el) return;
	el.dataset.effect = key;
	el.classList.add('audio-effect-option');
	el.addEventListener('click', () => applyAudioEffect(key));
});

// Restore saved audio effect on startup — silently (no status message on every launch)
// The effect is saved to localStorage whenever the user manually picks one.
function restoreAudioEffectOnStartup() {
	const saved = localStorage.getItem('activeAudioEffect') || 'auto';
	// Suppress the status message only for this one startup call
	window._suppressNextStatusMessage = true;
	applyAudioEffect(saved);
	// Flag is cleared inside showStatusMessage; reset here too as safety net
	window._suppressNextStatusMessage = false;
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', restoreAudioEffectOnStartup);
} else {
	restoreAudioEffectOnStartup();
}



//  AUDIO DEVICE DETECTION & SWITCHING
//  FIX: populate ONCE on load + on actual devicechange only.
//       No more getUserMedia on every mouseenter.


let currentAudioDeviceId = 'default';
let _devicesPopulated = false; // populate only once unless devices change

async function populateAudioDevices() {
	const lists = document.querySelectorAll('.audio-device-list');
	if (!lists.length) return;

	let devices = [];
	try {
	  const all = await navigator.mediaDevices.enumerateDevices();
	  devices = all.filter(d => d.kind === 'audiooutput');
  } catch (e) {
	  console.warn('[AudioDevice] enumerateDevices failed:', e);
  }

	_devicesPopulated = true;

	// Friendly label for well-known device IDs
	function _friendlyLabel(device, index) {
		const id = device.deviceId || 'default';
		if (device.label && device.label.trim()) return device.label.trim();
		if (id === 'default') return 'System Default';
		if (id === 'communications') return 'Communication Device';
		return `Output Device ${index + 1}`;
	}

	lists.forEach(list => {
		list.innerHTML = '';
	  const deviceList = devices.length ? devices : [{ deviceId: 'default', label: '' }];

	  deviceList.forEach((device, index) => {
		  const id = device.deviceId || 'default';
		  const isActive = id === currentAudioDeviceId;
		  const label = _friendlyLabel(device, index) + (isActive ? ' (current)' : '');

		const a = document.createElement('a');
		a.href = 'javascript:void(0)';
		a.className = 'device-item' + (isActive ? ' device-active' : '');

		const ic = document.createElement('span');
		ic.className = 'cm-icon';
		ic.textContent = isActive ? '●' : '';

		const tx = document.createElement('span');
		tx.className = 'cm-text';
		tx.textContent = label;

		a.append(ic, tx);
		a.addEventListener('click', (function (devId) {
			return () => switchAudioDevice(devId);
		})(id));

		list.appendChild(a);
	});
  });
}

async function switchAudioDevice(deviceId) {
	currentAudioDeviceId = deviceId;
	if (typeof video.setSinkId === 'function') {
		try {
			await video.setSinkId(deviceId);
		} catch (e) {}
	}
	const ap = document.getElementById('audioTrackPlayer');
	if (ap && typeof ap.setSinkId === 'function') {
		try {
			await ap.setSinkId(deviceId);
		} catch (e) {}
	}
	populateAudioDevices(); // refresh active-dot only
}

// Populate once on load; refresh only when actual hardware changes
if (navigator.mediaDevices) {
	navigator.mediaDevices.addEventListener('devicechange', () => {
		_devicesPopulated = false; // force re-enumerate
		populateAudioDevices();
	});
	populateAudioDevices();
}



//  SPEED CONTROLS
const SPEED_STEPS = {
	'faster': 0.5,
	'faster-fine': 0.1,
	'normal': null,
	'slower-fine': -0.1,
	'slower': -0.5,
};
let currentSpeedOptionKey = 'normal';

function updateSpeedUI() {
	document.querySelectorAll('.speed-option').forEach(el => {
		const isActive = el.dataset.speed === currentSpeedOptionKey;
		el.classList.toggle('active', isActive);
		el.classList.toggle('speed-active', isActive);

		// Use dedicated check span (nav-speed-check / cm-speed-check) —
		// always reserves fixed width so text never shifts.
		const checkEl = el.querySelector('.nav-speed-check, .cm-speed-check');
		if (checkEl) {
			checkEl.textContent = isActive ? '●' : '';
		}
	});
}

function applySpeedOption(key) {
	const step = SPEED_STEPS[key];
	video.playbackRate = (step === null) ?
		1.0 :
		Math.max(0.1, Math.min(4.0, Math.round((video.playbackRate + step) * 100) / 100));
	currentSpeedOptionKey = key;
	updateSpeedUI();
	const ap = document.getElementById('audioTrackPlayer');
	if (ap) ap.playbackRate = video.playbackRate;
	if (typeof showStatusMessage === 'function') showStatusMessage(`Speed: ${video.playbackRate.toFixed(2)}×`);
}

document.querySelectorAll('.speed-option').forEach(el => {
	el.addEventListener('click', e => {
		e.stopPropagation();
		applySpeedOption(el.dataset.speed);
		const cm = document.getElementById('contextMenu');
		if (cm) cm.style.display = 'none';
	});
});

updateSpeedUI();
// ══ DRAGGABLE TOOL MODALS ══════════════════════════════════════════════════
// Allows Video Effects, Track Sync and About modals to be dragged by header.
(function initDraggableModals() {
  const MODAL_IDS = ['videoEffectsModal', 'syncToolModal', 'aboutModal'];

  function makeDraggable(modal) {
    const inner = modal.querySelector('.tool-modal-inner');
    const header = modal.querySelector('.tool-modal-header');
    if (!inner || !header) return;

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    function resetPosition() {
      inner.style.position = '';
      inner.style.left = '';
      inner.style.top = '';
      inner.style.margin = '';
      modal.style.alignItems = '';
      modal.style.justifyContent = '';
    }

    // Reset position when modal is closed (so it re-centers next open)
    modal.addEventListener('modal-closed', resetPosition);

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return; // don't drag if clicking close btn
      isDragging = true;

      const rect = inner.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      // Switch to fixed absolute so we can freely reposition
      inner.style.position = 'fixed';
      inner.style.left = startLeft + 'px';
      inner.style.top = startTop + 'px';
      inner.style.margin = '0';
      modal.style.alignItems = 'flex-start';
      modal.style.justifyContent = 'flex-start';

      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop  = startTop + dy;

      // Clamp within viewport
      const w = inner.offsetWidth;
      const h = inner.offsetHeight;
      newLeft = Math.max(0, Math.min(window.innerWidth - w, newLeft));
      newTop  = Math.max(0, Math.min(window.innerHeight - h, newTop));

      inner.style.left = newLeft + 'px';
      inner.style.top  = newTop  + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
      }
    });
  }

  function init() {
    MODAL_IDS.forEach(id => {
      const modal = document.getElementById(id);
      if (modal) makeDraggable(modal);
    });

    // Patch close buttons to fire modal-closed event so position resets
    const closePairs = [
      ['videoEffectsClose',  'videoEffectsModal'],
      ['videoEffectsClose2', 'videoEffectsModal'],
      ['syncToolClose',      'syncToolModal'],
      ['syncToolClose2',     'syncToolModal'],
      ['aboutClose',         'aboutModal'],
      ['aboutClose2',        'aboutModal'],
    ];
    closePairs.forEach(([btnId, modalId]) => {
      const btn   = document.getElementById(btnId);
      const modal = document.getElementById(modalId);
      if (btn && modal) {
        btn.addEventListener('click', () => modal.dispatchEvent(new Event('modal-closed')));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ── Initial visibility state ─────────────────────────────────────────────────
// Run once after DOM is ready so playlist / audio / subtitle rows are hidden
// before any media is loaded.
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', refreshDynamicListVisibility);
} else {
	refreshDynamicListVisibility();
}


// ═══════════════════════════════════════════════════════════════════════════════
// M3U IMPORT / EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * exportPlaylistAsM3U()
 * Exports the current playlist as a UTF-8 BOM M3U file.
 * Supports emoji, Cyrillic, Japanese and all Unicode filenames.
 */
function exportPlaylistAsM3U() {
	if (!mediaFiles.length) { showStatusMessage('Playlist is empty'); return; }

	const BOM = '\uFEFF';   // UTF-8 BOM — ensures emoji / non-ASCII round-trips cleanly
	let lines  = BOM + '#EXTM3U\n';
	mediaFiles.forEach(fp => {
		const name = fp.split(/[/\\]/).pop().replace(/\.[^.]+$/, '');
		lines += `#EXTINF:-1,${name}\n${fp}\n`;
	});

	const blob = new Blob([lines], { type: 'audio/x-mpegurl;charset=utf-8' });
	const url  = URL.createObjectURL(blob);
	const a    = document.createElement('a');
	a.href     = url;
	a.download = 'playlist.m3u';
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
	showStatusMessage(`Exported ${mediaFiles.length} tracks → playlist.m3u`);
}

/**
 * importM3UFromFile()
 * Triggers a hidden file-input to pick an .m3u / .m3u8 file,
 * then parses it and loads into the playlist.
 *
 * Handles:
 *   • file:/// and file:// URI schemes
 *   • Percent-encoded characters  (%20 etc.)
 *   • Windows 8.3 short filenames (resolved via IPC)
 *   • Mixed / and \ path separators
 */
async function importM3UFromFile() {
	const inp = document.createElement('input');
	inp.type   = 'file';
	inp.accept = '.m3u,.m3u8';
	inp.style.display = 'none';
	document.body.appendChild(inp);

	inp.addEventListener('change', async () => {
		const file = inp.files[0];
		if (!file) { inp.remove(); return; }

		let text;
		try { text = await file.text(); } catch { inp.remove(); return; }

		const rawPaths = [];
		for (const line of text.split(/\r?\n/)) {
			const t = line.trim();
			if (!t || t.startsWith('#')) continue;

			let p = t;
			// Strip file URI scheme
			if (/^file:\/\/\//i.test(p)) p = p.replace(/^file:\/\/\//i, '');
			else if (/^file:\/\//i.test(p)) p = p.replace(/^file:\/\//i, '');

			// Decode percent-encoding (handles %20, %C3%A9 etc.)
			try { p = decodeURIComponent(p); } catch { /* leave as-is if malformed */ }

			// Normalize slashes for Windows
			p = p.replace(/\//g, '\\');

			if (p) rawPaths.push(p);
		}

		if (!rawPaths.length) { showStatusMessage('No paths found in M3U'); inp.remove(); return; }

		showStatusMessage(`Resolving ${rawPaths.length} paths…`);

		// Resolve Windows 8.3 short names via main process
		const resolved = await Promise.all(
			rawPaths.map(p =>
				window.electron.invoke('get-real-filename', p).catch(() => p)
			)
		);

		mediaFiles       = resolved.filter(Boolean);
		currentVideoIndex = 0;
		isFirstFileOpened = true;

		updatePlaylistDropdown(mediaFiles);
		if (mediaFiles[0]) {
			playMediaFile(mediaFiles[0]);
			highlightCurrentVideo(mediaFiles[0]);
		}
		showStatusMessage(`Imported ${mediaFiles.length} tracks from M3U`);
		inp.remove();
	});
	inp.click();
}

// Drag-and-drop: .m3u/.m3u8 playlists, subtitle files, media files, and folders
mediaPlayer.addEventListener('dragover', (e) => {
	const types = Array.from(e.dataTransfer.items || []);
	const hasM3U = types.some(i => i.kind === 'file') ||
		(e.dataTransfer.files && Array.from(e.dataTransfer.files).some(f => /\.m3u8?$/i.test(f.name)));
	if (hasM3U || e.dataTransfer.types.includes('Files')) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	}
});

const _MEDIA_EXTS = /\.(mp4|mkv|avi|mov|wmv|flv|webm|ts|m2ts|mp3|flac|aac|ogg|opus|wav|m4a|m4v|3gp|ogv|rm|rmvb)$/i;
const _SUB_EXTS   = /\.(srt|ass|ssa|vtt)$/i;

mediaPlayer.addEventListener('drop', async (e) => {
	e.preventDefault();
	const files = Array.from(e.dataTransfer.files || []);
	if (!files.length) return;

	// ── 1. Subtitle files ─────────────────────────────────────────────────────
	const subFiles = files.filter(f => _SUB_EXTS.test(f.name));
	if (subFiles.length > 0) {
		for (const subFile of subFiles) {
			try {
				const blob    = new Blob([await subFile.arrayBuffer()], { type: 'text/plain' });
				const blobUrl = URL.createObjectURL(blob);
				const trackEl = document.createElement('track');
				trackEl.src      = blobUrl;
				trackEl.kind     = 'subtitles';
				trackEl.label    = subFile.name.replace(_SUB_EXTS, '');
				trackEl.srclang  = 'und';
				trackEl.default  = false;
				video.appendChild(trackEl);
				_subtitleBlobUrls.push(blobUrl);

				const idx = Array.from(video.textTracks).length - 1;
				const subtitleLists = document.querySelectorAll('.subtitle-track-list');
				subtitleLists.forEach(list => {
					const a = document.createElement('a');
					a.href = 'javascript:void(0)';
					a.className = 'subtitle-item';
					a.dataset.index = idx;
					a.textContent = trackEl.label;
					a.addEventListener('click', () => switchSubtitleTrack(idx));
					list.appendChild(a);
				});
				switchSubtitleTrack(idx);
				showStatusMessage(`Subtitle: ${trackEl.label}`);
				refreshDynamicListVisibility();
			} catch (err) {
				console.error('[Drop Sub]', err);
				showStatusMessage('Could not load subtitle file');
			}
		}
		return; // don't treat sub files as media
	}

	// ── 2. M3U/M3U8 playlist ─────────────────────────────────────────────────
	const m3uFile = files.find(f => /\.m3u8?$/i.test(f.name));
	if (m3uFile) {
		const text = await m3uFile.text();
		const rawPaths = [];
		for (const line of text.split(/\r?\n/)) {
			const t = line.trim();
			if (!t || t.startsWith('#')) continue;
			let p = t.replace(/^file:\/\/\//i, '').replace(/^file:\/\//i, '');
			try { p = decodeURIComponent(p); } catch {}
			p = p.replace(/\//g, '\\');
			if (p) rawPaths.push(p);
		}
		if (!rawPaths.length) return;
		const resolved = await Promise.all(rawPaths.map(p => window.electron.invoke('get-real-filename', p).catch(() => p)));
		mediaFiles = resolved.filter(Boolean);
		currentVideoIndex = 0;
		isFirstFileOpened = true;
		updatePlaylistDropdown(mediaFiles);
		if (mediaFiles[0]) { playMediaFile(mediaFiles[0]); highlightCurrentVideo(mediaFiles[0]); }
		showStatusMessage(`Imported ${mediaFiles.length} tracks from M3U (drop)`);
		return;
	}

	// ── 3. Media files ────────────────────────────────────────────────────────
	const mediaDropFiles = files.filter(f => _MEDIA_EXTS.test(f.name));
	if (mediaDropFiles.length > 0) {
		// Resolve real paths — File.path is available in Electron renderer
		const paths = mediaDropFiles.map(f => f.path).filter(Boolean);
		if (paths.length) {
			const resolved = await Promise.all(paths.map(p => window.electron.invoke('get-real-filename', p).catch(() => p)));
			const newFiles = resolved.filter(Boolean);
			mediaFiles = [...mediaFiles, ...newFiles];
			if (!isFirstFileOpened) {
				currentVideoIndex = mediaFiles.length - newFiles.length;
				isFirstFileOpened = true;
				playMediaFile(mediaFiles[currentVideoIndex]);
				highlightCurrentVideo(mediaFiles[currentVideoIndex]);
			}
			updatePlaylistDropdown(mediaFiles);
			showStatusMessage(`Added ${newFiles.length} file(s) to playlist`);
		}
		return;
	}

	// ── 4. Folders ────────────────────────────────────────────────────────────
	// Electron exposes folder paths via File.path; use IPC to enumerate media inside
	const folderFiles = files.filter(f => !f.type && f.path); // folders have no MIME type in Electron
	if (folderFiles.length > 0) {
		for (const folder of folderFiles) {
			try {
				const result = await window.electron.getFolderMediaFiles(folder.path);
				if (result && result.length) {
					mediaFiles = [...mediaFiles, ...result];
					if (!isFirstFileOpened) {
						currentVideoIndex = mediaFiles.length - result.length;
						isFirstFileOpened = true;
						playMediaFile(mediaFiles[currentVideoIndex]);
						highlightCurrentVideo(mediaFiles[currentVideoIndex]);
					}
					updatePlaylistDropdown(mediaFiles);
					showStatusMessage(`Added ${result.length} file(s) from folder`);
				}
			} catch (err) {
				console.error('[Drop Folder]', err);
			}
		}
	}
});

// ─── Wire M3U menu buttons (added to index.html) ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
	const exportBtn = document.getElementById('exportM3UBtn');
	const importBtn = document.getElementById('importM3UBtn');
	if (exportBtn) exportBtn.addEventListener('click', exportPlaylistAsM3U);
	if (importBtn) importBtn.addEventListener('click', importM3UFromFile);
});


// ═══════════════════════════════════════════════════════════════════════════════
// SEEK BAR THUMBNAIL PREVIEW  (real-time canvas capture)
// Shows a scaled snapshot of the video frame at the hovered seek position.
// Respects current rotation, zoom, aspect ratio transformations.
// ═══════════════════════════════════════════════════════════════════════════════
(function initSeekPreview() {
	const wrapper = document.getElementById('seek-bar-wrapper');
	if (!wrapper) return;

	// ── Preview bubble ────────────────────────────────────────────────────────
	const preview = document.createElement('div');
	preview.id = 'seekPreview';
	preview.style.cssText = [
		'position:absolute',
		'bottom:calc(100% + 12px)',
		'width:160px',
		'height:90px',
		'pointer-events:none',
		'z-index:200',
		'display:none',
		'border-radius:4px',
		'overflow:hidden',
		'box-shadow:0 4px 16px rgba(0,0,0,0.7)',
		'border:1px solid rgba(255,255,255,0.15)',
		'background:#000',
	].join(';');

	const canvas = document.createElement('canvas');
	// Use 2x resolution for sharper rendering, then CSS scales it down smoothly
	const dpr = window.devicePixelRatio || 1;
	const canvasDisplayWidth = 160;
	const canvasDisplayHeight = 90;
	canvas.width = canvasDisplayWidth * dpr;
	canvas.height = canvasDisplayHeight * dpr;
	canvas.style.cssText = 'width:100%;height:100%;display:block;image-rendering:auto;';
	preview.appendChild(canvas);

	const timeLabel = document.createElement('div');
	timeLabel.style.cssText = [
		'position:absolute',
		'bottom:4px',
		'left:0',
		'right:0',
		'text-align:center',
		'font-size:11px',
		'color:#fff',
		'text-shadow:0 1px 3px rgba(0,0,0,0.9)',
		'pointer-events:none',
	].join(';');
	preview.appendChild(timeLabel);

	wrapper.style.position = 'relative';
	wrapper.appendChild(preview);

	const ctx = canvas.getContext('2d');
	// Enable image smoothing for smooth downscaling
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';

	// ── Hidden preview video ──────────────────────────────────────────────────
	// A second video element that seeks independently so the main playback is
	// never interrupted — this is the same technique YouTube uses.
	const previewVideo = document.createElement('video');
	previewVideo.muted    = true;
	previewVideo.preload  = 'auto';
	// Hidden but kept in DOM so the browser keeps its decoder warm
	previewVideo.style.cssText = 'position:fixed;width:1px;height:1px;top:-2px;left:-2px;opacity:0;pointer-events:none;';
	document.body.appendChild(previewVideo);

	let _lastSrc     = '';   // tracks which source the preview video has loaded
	let _pendingTime = null; // queued seek target while a seek is in-flight
	let _seeking     = false;
	let _previewThrottle = null;
	let _hoverTarget = 0;   // latest hovered time (updated every mousemove)

	// Sync preview video src whenever the main video changes
	function _syncSrc() {
		const src = video.currentSrc || video.src;
		if (!src || src === _lastSrc) return;
		_lastSrc = src;
		// Clear canvas immediately when switching videos (prevents ghosting/blur)
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		previewVideo.src = src;
		// Don't call .load() — setting .src already triggers it in most browsers
	}

	// Called every time a seek on the preview video completes
	function _onSeeked() {
		_seeking = false;
		// Paint the frame the preview video landed on
		try {
			const rotAngle = parseInt(video.dataset.rotation) || 0;
			ctx.save();
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Get video dimensions for aspect ratio calculation
			const videoW = previewVideo.videoWidth || 160;
			const videoH = previewVideo.videoHeight || 90;
			const canvasW = 160 * dpr;
			const canvasH = 90 * dpr;

			if (rotAngle === 90 || rotAngle === -90) {
				ctx.translate(80 * dpr, 45 * dpr);
				ctx.rotate(rotAngle * Math.PI / 180);
				ctx.drawImage(previewVideo, -45 * dpr, -80 * dpr, 90 * dpr, 160 * dpr);
			} else if (rotAngle === 180) {
				ctx.translate(160 * dpr, 90 * dpr);
				ctx.rotate(Math.PI);
				ctx.drawImage(previewVideo, 0, 0, 160 * dpr, 90 * dpr);
			} else {
				// Calculate aspect-fit dimensions (like object-fit: contain)
				const videoAspect = videoW / videoH;
				const canvasAspect = canvasW / canvasH;
				let drawW, drawH, drawX, drawY;

				if (videoAspect > canvasAspect) {
					// Video is wider - fit to width
					drawW = canvasW;
					drawH = canvasW / videoAspect;
					drawX = 0;
					drawY = (canvasH - drawH) / 2;
				} else {
					// Video is taller - fit to height
					drawH = canvasH;
					drawW = canvasH * videoAspect;
					drawX = (canvasW - drawW) / 2;
					drawY = 0;
				}

				ctx.drawImage(previewVideo, drawX, drawY, drawW, drawH);
			}
			ctx.restore();
		} catch (_e) {}

		// If the user kept moving while we were seeking, seek again to catch up
		if (_pendingTime !== null) {
			const t = _pendingTime;
			_pendingTime = null;
			_doSeek(t);
		}
	}

	function _doSeek(t) {
		if (!isFinite(previewVideo.duration)) return;
		_seeking = true;
		previewVideo.currentTime = t;
	}

	function _requestFrame(targetTime) {
		_syncSrc();
		if (!previewVideo.src) return;

		if (_seeking) {
			// A seek is already in-flight — queue this time; _onSeeked will pick it up
			_pendingTime = targetTime;
		} else {
			_doSeek(targetTime);
		}
	}

	previewVideo.addEventListener('seeked', _onSeeked);

	// If the preview video stalls/errors on a given time, release the lock
	previewVideo.addEventListener('error',   () => { _seeking = false; });
	previewVideo.addEventListener('waiting', () => { /* intentional no-op — seeked will still fire */ });

	// Clear canvas when preview video starts loading a new source (prevents ghosting)
	previewVideo.addEventListener('loadstart', () => {
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		_seeking = false;
		_pendingTime = null;
	});

	// Keep src in sync when main video loads a new file
	video.addEventListener('loadedmetadata', _syncSrc);

	// ── Seek-bar hover ────────────────────────────────────────────────────────
	wrapper.addEventListener('mousemove', (e) => {
		if (!video.duration || isNaN(video.duration)) return;

		const rect  = wrapper.getBoundingClientRect();
		const posX  = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		const pct   = posX / rect.width;
		_hoverTarget = pct * video.duration;

		// Always update the time label instantly (no perceived lag)
		timeLabel.textContent = formatTime(_hoverTarget);

		// Position the preview bubble centred on the cursor, clamped to wrapper
		const previewW = 160;
		let left = posX - previewW / 2;
		left = Math.max(0, Math.min(rect.width - previewW, left));
		preview.style.left    = left + 'px';
		preview.style.display = 'block';

		// Throttle actual seek/draw to ~80 ms — avoids hammering the decoder
		if (_previewThrottle) return;
		_previewThrottle = setTimeout(() => {
			_previewThrottle = null;
			_requestFrame(_hoverTarget);
		}, 80);
	});

	wrapper.addEventListener('mouseleave', () => {
		preview.style.display = 'none';
		_pendingTime = null;
		if (_previewThrottle) { clearTimeout(_previewThrottle); _previewThrottle = null; }
	});
})();


// ═══════════════════════════════════════════════════════════════════════════════
// SHORTCUT EDITOR  (F6)
// ═══════════════════════════════════════════════════════════════════════════════

const SC_GROUPS = [
  { label: 'Playback',   ids: ['play-pause','seek-back-5','seek-fwd-5','seek-back-10','seek-fwd-10','seek-back-60','seek-fwd-60'] },
  { label: 'Volume',     ids: ['volume-up','volume-down','mute'] },
  { label: 'Speed',      ids: ['speed-up','speed-down','speed-reset'] },
  { label: 'Navigation', ids: ['next','previous','shuffle','loop','next-chapter','prev-chapter'] },
  { label: 'View',       ids: ['fullscreen','pip','zoom-in'] },
  { label: 'Tracks',     ids: ['subtitle-cycle','audio-cycle','sub-delay-minus','sub-delay-plus','audio-delay-minus','audio-delay-plus'] },
  { label: 'Files',      ids: ['open-file','open-folder','rename'] },
  { label: 'Tools',      ids: ['video-effects','track-sync','show-time','shortcuts','minimize'] },
];

const DEFAULT_SHORTCUTS = {
  'play-pause':         { key: ' ',           ctrl: false, shift: false, alt: false, label: 'Play / Pause' },
  'seek-back-10':       { key: 'ArrowLeft',   ctrl: false, shift: false, alt: false, label: 'Seek Back 10s' },
  'seek-fwd-10':        { key: 'ArrowRight',  ctrl: false, shift: false, alt: false, label: 'Seek Forward 10s' },
  'seek-back-5':        { key: 'ArrowLeft',   ctrl: false, shift: true,  alt: false, label: 'Seek Back 5s' },
  'seek-fwd-5':         { key: 'ArrowRight',  ctrl: false, shift: true,  alt: false, label: 'Seek Forward 5s' },
  'seek-back-60':       { key: 'ArrowLeft',   ctrl: true,  shift: false, alt: false, label: 'Seek Back 60s' },
  'seek-fwd-60':        { key: 'ArrowRight',  ctrl: true,  shift: false, alt: false, label: 'Seek Forward 60s' },
  'volume-up':          { key: 'ArrowUp',     ctrl: false, shift: false, alt: false, label: 'Volume Up' },
  'volume-down':        { key: 'ArrowDown',   ctrl: false, shift: false, alt: false, label: 'Volume Down' },
  'mute':               { key: 'm',           ctrl: false, shift: false, alt: false, label: 'Mute' },
  'fullscreen':         { key: 'f',           ctrl: false, shift: false, alt: false, label: 'Fullscreen' },
  'next':               { key: 'n',           ctrl: false, shift: false, alt: false, label: 'Next Video' },
  'previous':           { key: 'p',           ctrl: false, shift: false, alt: false, label: 'Previous Video' },
  'shuffle':            { key: 's',           ctrl: false, shift: false, alt: false, label: 'Toggle Shuffle' },
  'loop':               { key: 'l',           ctrl: false, shift: false, alt: false, label: 'Toggle Loop' },
  'open-file':          { key: 'o',           ctrl: true,  shift: false, alt: false, label: 'Open File' },
  'open-folder':        { key: 'f',           ctrl: true,  shift: false, alt: false, label: 'Open Folder' },
  'video-effects':      { key: 'e',           ctrl: true,  shift: false, alt: false, label: 'Video Effects' },
  'track-sync':         { key: 'y',           ctrl: true,  shift: false, alt: false, label: 'Track Sync Tool' },
  'rename':             { key: 'F2',          ctrl: false, shift: false, alt: false, label: 'Rename File' },
  'shortcuts':          { key: 'F6',          ctrl: false, shift: false, alt: false, label: 'Shortcut Editor' },
  'zoom-in':            { key: 'z',           ctrl: false, shift: false, alt: false, label: 'Cycle Zoom' },
  'pip':                { key: 'p',           ctrl: true,  shift: false, alt: false, label: 'Picture-in-Picture' },
  'subtitle-cycle':     { key: 'v',           ctrl: false, shift: false, alt: false, label: 'Cycle Subtitle Track' },
  'audio-cycle':        { key: 'b',           ctrl: false, shift: false, alt: false, label: 'Cycle Audio Track' },
  'speed-up':           { key: '+',           ctrl: false, shift: false, alt: false, label: 'Speed Up' },
  'speed-down':         { key: '-',           ctrl: false, shift: false, alt: false, label: 'Speed Down' },
  'speed-reset':        { key: '=',           ctrl: false, shift: false, alt: false, label: 'Reset Speed' },
  'show-time':          { key: 't',           ctrl: false, shift: false, alt: false, label: 'Show Current Time' },
  'next-chapter':       { key: ']',           ctrl: false, shift: false, alt: false, label: 'Next Chapter' },
  'prev-chapter':       { key: '[',           ctrl: false, shift: false, alt: false, label: 'Previous Chapter' },
  'audio-delay-minus':  { key: 'g',           ctrl: false, shift: false, alt: false, label: 'Audio Delay −' },
  'audio-delay-plus':   { key: 'h',           ctrl: false, shift: false, alt: false, label: 'Audio Delay +' },
  'sub-delay-minus':    { key: 'd',           ctrl: false, shift: false, alt: false, label: 'Subtitle Delay −' },
  'sub-delay-plus':     { key: 'e',           ctrl: false, shift: false, alt: false, label: 'Subtitle Delay +' },
  'minimize':           { key: '`',           ctrl: true,  shift: false, alt: false, label: 'Minimize Window' },
};

let _shortcutBindings = {};
let _scEdRecording = null; // action ID currently being recorded

// ── Helpers ──────────────────────────────────────────────────────────────────
function _keyComboLabel(b) {
  const k = b.key === ' ' ? 'Space' : b.key;
  const parts = [];
  if (b.ctrl)  parts.push('Ctrl');
  if (b.shift) parts.push('Shift');
  if (b.alt)   parts.push('Alt');
  parts.push(k);
  return parts.join('+');
}

function _comboFingerprint(b) {
  return [b.ctrl ? 1 : 0, b.shift ? 1 : 0, b.alt ? 1 : 0, (b.key || '').toLowerCase()].join('|');
}

function _hasConflict(id) {
  const fp = _comboFingerprint(_shortcutBindings[id]);
  return Object.entries(_shortcutBindings).some(([oid, ob]) => oid !== id && _comboFingerprint(ob) === fp);
}

// ── Persistence ───────────────────────────────────────────────────────────────
function _loadShortcutBindings() {
  try {
    const saved = JSON.parse(localStorage.getItem('shortcutBindings'));
    _shortcutBindings = saved && typeof saved === 'object'
      ? Object.assign({}, DEFAULT_SHORTCUTS, saved)
      : Object.assign({}, DEFAULT_SHORTCUTS);
  } catch {
    _shortcutBindings = Object.assign({}, DEFAULT_SHORTCUTS);
  }
}

function _saveShortcutBindings() {
  localStorage.setItem('shortcutBindings', JSON.stringify(_shortcutBindings));
  if (window.electron && window.electron.invoke) {
    window.electron.invoke('save-shortcut-bindings', _shortcutBindings).catch(() => {});
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function _scEdRender() {
  const list = document.getElementById('scEdList');
  if (!list) return;

  const q = (document.getElementById('scEdSearch')?.value || '').toLowerCase().trim();
  let html = '';
  let total = 0;

  SC_GROUPS.forEach(group => {
    const rows = group.ids.filter(id =>
      _shortcutBindings[id] && (!q || _shortcutBindings[id].label.toLowerCase().includes(q))
    );
    if (!rows.length) return;
    total += rows.length;

    html += `<div style="font-size:10px;font-weight:600;color:var(--m-muted);letter-spacing:0.08em;text-transform:uppercase;padding:10px 16px 4px;user-select:none;">${group.label}</div>`;

    rows.forEach(id => {
      const b = _shortcutBindings[id];
      const isRec      = _scEdRecording === id;
      const isConflict = !isRec && _hasConflict(id);

      let kbdClass = 'sc-ed-kbd';
      if (isRec)      kbdClass += ' sc-ed-kbd--rec';
      if (isConflict) kbdClass += ' sc-ed-kbd--conflict';

      html += `
        <div class="sc-ed-row" data-id="${id}">
          <span class="sc-ed-lbl">${b.label}</span>
          <div style="display:flex;align-items:center;gap:6px;">
            ${isConflict ? `<span title="Conflicts with another shortcut" style="font-size:11px;color:rgba(255,100,80,0.8);">⚠</span>` : ''}
            <span class="${kbdClass}" data-action="${id}">${isRec ? '⌨ …' : _keyComboLabel(b)}</span>
            <button class="sc-ed-reset-one" data-action="${id}" title="Reset to default">↺</button>
          </div>
        </div>`;
    });
  });

  list.innerHTML = total
    ? html
    : `<div style="font-size:12px;color:var(--m-muted);text-align:center;padding:28px 0;">No shortcuts match</div>`;

  // Wire click-to-record on kbd chips
  list.querySelectorAll('.sc-ed-kbd[data-action]').forEach(chip => {
    chip.addEventListener('click', () => _scEdStartRecording(chip.dataset.action));
  });

  // Wire per-row reset buttons
  list.querySelectorAll('.sc-ed-reset-one').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.action;
      if (DEFAULT_SHORTCUTS[id]) {
        _shortcutBindings[id] = Object.assign({}, DEFAULT_SHORTCUTS[id]);
        _saveShortcutBindings();
        _scEdRender();
      }
    });
  });
}

// ── Recording ─────────────────────────────────────────────────────────────────
function _scEdStartRecording(actionId) {
  if (_scEdRecording) return; // already recording — ignore double-click
  _scEdRecording = actionId;
  _scEdRender();

  function _capture(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      _scEdRecording = null;
      _scEdRender();
      document.removeEventListener('keydown', _capture, true);
      return;
    }
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    _shortcutBindings[actionId] = {
      ..._shortcutBindings[actionId],
      key:   e.key,
      ctrl:  e.ctrlKey,
      shift: e.shiftKey,
      alt:   e.altKey,
    };
    _scEdRecording = null;
    _saveShortcutBindings();
    _scEdRender();
    document.removeEventListener('keydown', _capture, true);
  }

  document.addEventListener('keydown', _capture, true);
}

// ── Open / Close ──────────────────────────────────────────────────────────────
function toggleShortcutEditor() {
  const modal = document.getElementById('shortcutEditorModal');
  if (!modal) return;
  if (modal.classList.contains('show') || ModalAnimator.isOpen(modal)) {
    _scEdRecording = null;
    ModalAnimator.close(modal);
  } else {
    _scEdRender();
    ModalAnimator.open(modal);
  }
}

// ── Wire DOM on load ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const modal       = document.getElementById('shortcutEditorModal');
  const closeBtn    = document.getElementById('shortcutEditorClose');
  const closeBtn2   = document.getElementById('shortcutEditorClose2');
  const resetAllBtn = document.getElementById('shortcutEditorResetAll');
  const searchInput = document.getElementById('scEdSearch');
  const helpBtn     = document.getElementById('showShortcutEditorBtn');

  if (closeBtn)    closeBtn.addEventListener('click',    () => { _scEdRecording = null; ModalAnimator.close(modal); });
  if (closeBtn2)   closeBtn2.addEventListener('click',   () => { _scEdRecording = null; ModalAnimator.close(modal); });
  if (helpBtn)     helpBtn.addEventListener('click',     toggleShortcutEditor);
  if (searchInput) searchInput.addEventListener('input', _scEdRender);
  if (searchInput) searchInput.addEventListener('keydown', e => e.stopPropagation());

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      _scEdRecording = null;
      _shortcutBindings = Object.fromEntries(
        Object.entries(DEFAULT_SHORTCUTS).map(([id, b]) => [id, Object.assign({}, b)])
      );
      _saveShortcutBindings();
      _scEdRender();
      showStatusMessage('All shortcuts reset to defaults');
    });
  }

  // Close on backdrop click; cancel any active recording
  if (modal) {
    modal.addEventListener('mousedown', (e) => {
      if (e.target === modal) {
        _scEdRecording = null;
        ModalAnimator.close(modal);
      }
    });
    modal.addEventListener('keydown', e => {
      // Escape cancels recording without closing modal
      if (e.key === 'Escape' && _scEdRecording) {
        e.stopPropagation();
        _scEdRecording = null;
        _scEdRender();
      }
    });
  }
});

// Load bindings on startup
_loadShortcutBindings();


(function initScrollManager() {
  'use strict';

  // ── Selectors: all containers that should scroll in isolation ──────────────
  const SELECTORS = [
    '.sub-dropdown-content.chapters-list-nav',
    '.sub-dropdown-content.play-list',
    '.sub-dropdown-content.audio-track-list',
    '.sub-dropdown-content.subtitle-track-list',
    '.sub-dropdown-content.audio-device-list',
    '.viz-panel',
    // Context menu internal scroll panels (LEAF nodes — safe to add overflow-y)
    '.cm-viz-panel',             // viz presets + gif search inside context menu
    '.context-menu .play-list',  // playlist sub-panel
    '.chapters-list-cm.cm-dynamic-list',
    // NOTE: .context-menu itself and .cm-submenu are intentionally EXCLUDED —
    // they must NOT have overflow set (see CSS comment for explanation)
    '.playlist-container',
    '.tool-modal-body',
    '.modal-body',
  ];

  // WeakSet so garbage-collected DOM nodes don't leak memory
  const _registered = new WeakSet();

  // ── Core wheel handler (must be registered as {passive:false}) ─────────────
  // Logic: if the container CAN scroll in the wheel direction → let it scroll
  //        but stop the event from bubbling further (stopPropagation).
  //        If at a boundary and can't scroll → cancel entirely (preventDefault).
  function _handleWheel(e) {
    const el = this;
    const scrollTop    = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const delta = e.deltaY || e.detail || (-e.wheelDelta);

    // Not actually scrollable — let event bubble
    if (scrollHeight <= clientHeight) return;

    const canScrollUp   = scrollTop > 0;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

    // At top and scrolling up → cancel entirely (prevents seek bar change)
    if (delta < 0 && !canScrollUp) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // At bottom and scrolling down → cancel entirely
    if (delta > 0 && !canScrollDown) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Still within scrollable range → stop bubbling but allow the scroll
    e.stopPropagation();
  }

  // ── Register single element ────────────────────────────────────────────────
  function register(el) {
    if (!el || _registered.has(el)) return;
    _registered.add(el);
    // {passive:false} is REQUIRED — without it Chromium ignores preventDefault
    el.addEventListener('wheel', _handleWheel.bind(el), { passive: false });
  }

  // ── Register all matching elements (safe to call repeatedly) ──────────────
  function registerAll() {
    SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(register);
    });
  }

  // ── Watch context menu visibility changes ─────────────────────────────────
  // Context menu becomes display:block when right-clicked; register its panels then.
  function _observeContextMenu() {
    const cm = document.getElementById('contextMenu');
    if (!cm) return;
    new MutationObserver(() => {
      if (cm.style.display !== 'none') {
        requestAnimationFrame(registerAll);
      }
    }).observe(cm, { attributes: true, attributeFilter: ['style', 'class'] });
  }

  // ── Watch chapters + playlist containers for dynamic content ──────────────
  function _observeDynamicContainers() {
    const targets = [
      document.getElementById('chaptersListNav'),
      document.getElementById('chaptersListCM'),
      document.querySelector('.sub-dropdown-content.play-list'),
      document.querySelector('.playlist-container'),
    ].filter(Boolean);

    const observer = new MutationObserver(() => requestAnimationFrame(registerAll));
    targets.forEach(el => observer.observe(el, { childList: true, subtree: false }));
  }

  // ── Re-register when sub-dropdowns open ───────────────────────────────────
  function _attachHoverListeners() {
    document.querySelectorAll('.sub-dropdown').forEach(dropdown => {
      dropdown.addEventListener('mouseenter', () => {
        requestAnimationFrame(registerAll);
      }, { passive: true });
    });
  }

  // ── Keyboard guard: stop arrow keys from seeking when panel is hovered ─────
  // Runs in capture phase (fires before renderer.js's document keydown handler).
  // Consumes ArrowUp/Down/PageUp/Down only when a registered panel is hovered.
  const SCROLL_KEYS = new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End']);
  function _attachKeyboardGuard() {
    document.addEventListener('keydown', (e) => {
      if (!SCROLL_KEYS.has(e.key)) return;
      // Walk hovered elements deepest-first
      const hovered = Array.from(document.querySelectorAll(':hover'));
      for (let i = hovered.length - 1; i >= 0; i--) {
        const el = hovered[i];
        if (_registered.has(el) && el.scrollHeight > el.clientHeight) {
          e.stopPropagation(); // prevent reaching renderer.js seek handlers
          return;
        }
      }
    }, { capture: true }); // capture=true: fires before document-level handlers
  }

  // ── Viewport overflow fix: flip panels that extend below screen ────────────
  function _adjustPanelPosition(panel) {
    if (!panel || panel.offsetParent === null) return;
    const rect = panel.getBoundingClientRect();
    const vH   = window.innerHeight;
    const vW   = window.innerWidth;
    if (rect.bottom > vH - 4) {
      const overflow = rect.bottom - vH + 4;
      const currentTop = parseFloat(panel.style.top) || 0;
      panel.style.top = `${currentTop - overflow}px`;
    }
    if (rect.right > vW - 4) {
      panel.style.left  = 'auto';
      panel.style.right = '100%';
    }
  }

  function _observePanelPositions() {
    document.querySelectorAll('.sub-dropdown').forEach(dropdown => {
      dropdown.addEventListener('mouseenter', () => {
        requestAnimationFrame(() => {
          const panel = dropdown.querySelector('.sub-dropdown-content');
          _adjustPanelPosition(panel);
        });
      }, { passive: true });
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  // Call window.ScrollManager.registerAll() after any dynamic list update.
  window.ScrollManager = { register, registerAll };

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  function _init() {
    registerAll();
    _observeContextMenu();
    _observeDynamicContainers();
    _attachHoverListeners();
    _attachKeyboardGuard();
    _observePanelPositions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

// Initialize modal animations
if (typeof initializeModalAnimations === 'function') {
	document.addEventListener('DOMContentLoaded', () => {
		initializeModalAnimations();
	});
}

})();