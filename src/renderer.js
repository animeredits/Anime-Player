const video = document.getElementById("media");
const mediaPlayer = document.getElementById("mediaPlayer");
const minimizeBtn = document.querySelector("#minimize");
const maximizeBtn = document.querySelector("#maximize");
const videoEffectBtn = document.querySelector('.videoEffectBtn');
const saturationModal = document.getElementById('saturationModal');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');
const resetBtn = document.getElementById('saturation-resetBtn');
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
const zoomOptions = zoomTrackList.querySelectorAll("a");
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
const gifSearchInput = document.getElementById("gifSearchInput");
const gifSearchButton = document.getElementById("gifSearchButton");
const gifResultsContainer = document.getElementById("gifResultsContainer");
const gifSearchContainer = document.getElementById("gifSearchContainer");
const statusMessage = document.getElementById("statusMessage");
const subtitleDisplay = document.getElementById('subtitle-display');

let currentChapters = [];
let currentVideoPath = null;
let chaptersDropdown, chaptersButton, chaptersCloseBtn, chaptersList, chapterTooltip, chaptersMarkersContainer;
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
let lastPlayedIndex = -1;
let lastPlayedStack = [];
let navigationHistory = [];
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
let sortMethod = 'name'; // 'name' | 'date'
let sortDirection = 'ascending'; // 'ascending' | 'descending'
let hideContinueButtonTimeout;
let hideHandleTimeout;
let isVideoPaused = false;
// let isLeftMouseDown = false;
// let isRightMouseDown = false;
// let leftWasPausedBeforeHold = false;
// let rightWasPausedBeforeHold = false;
let totalTimeInSeconds = 0;
let countdownInterval = null;
let remainingTimeOnPause = 0;
let isPaused = false;
let isContextMenuVisible = false;
let isSpeedAdjustmentHold = false;
let contextMenuClick = false;
let isShuffle = false;
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
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;
let minZoom = 0.25;
let maxZoom = 3;
let recognitionActive = false;
let isMouseOver = false;
let isShutdownAtVideoEndEnabled = false;
let isShutdownAtPlaylistEndEnabled = false;


// ✅ Function to show the temporary status message
function showStatusMessage(text) {
	statusMessage.innerText = text;
	statusMessage.style.opacity = '1';
	statusMessage.style.transition = "font-size 0.15s ease-out";

	// Hide the message after 1.5 seconds
	setTimeout(() => {
		statusMessage.style.opacity = '0';
	}, 1800);
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

// Change the logo based on selection from a dropdown
document.getElementById('customLogoInput').addEventListener('change', function(e) {
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function(event) {
			const src = event.target.result;
			updateLogo(src);
		};
		reader.readAsDataURL(file);
	}
});

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
				// console.log("GIF saved successfully at:", response.path);
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
					// console.log("GIF saved successfully at:", response.path);
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


// ✅ Update the saveCustomLogo function to add hover preview functionality
function saveCustomLogo(filePath, fileName) {
	const logoOptionsContainer = document.querySelector("#logoOptions .sub-dropdown-content");

	const newLogoDiv = document.createElement("div");
	newLogoDiv.classList.add("logo-item", "custom");
	newLogoDiv.setAttribute("data-filename", fileName);

	const newLogoLink = document.createElement("a");
	newLogoLink.setAttribute("data-src", filePath);
	newLogoLink.textContent = fileName;

	// Show logo preview on hover
	newLogoLink.addEventListener("mouseenter", function() {
		showLogoPreview(filePath);
	});
	newLogoLink.addEventListener("mouseleave", function() {
		hideLogoPreview();
	});

	// Set the uploaded logo as selected when clicked
	newLogoLink.addEventListener("click", function() {
		setSelectedLogo(filePath);
	});

	const deleteIcon = document.createElement("i");
	deleteIcon.classList.add("fa-thin", "fa-trash", "delete-icon");

	deleteIcon.addEventListener("click", function() {
		logoOptionsContainer.removeChild(newLogoDiv);
		removeCustomLogoFromStorage(fileName);
		deleteCustomLogo(fileName);
	});

	newLogoDiv.appendChild(newLogoLink);
	newLogoDiv.appendChild(deleteIcon);
	logoOptionsContainer.appendChild(newLogoDiv);

	saveCustomLogoToStorage(filePath, fileName);
	checkPlayAllButton();

	// ✅ Immediately select and show the new logo
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
	const logoOptionsContainer = document.querySelector("#logoOptions .sub-dropdown-content");

	// Clear existing custom logo items
	const customLogoItems = logoOptionsContainer.querySelectorAll(".logo-item.custom");
	customLogoItems.forEach((item) => logoOptionsContainer.removeChild(item));

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

		modal.style.display = "flex"; // Show the modal

		confirmButton.onclick = () => {
			resolve({
				confirmed: true,
				autoSave: autoSaveCheckbox.checked,
			});
			modal.style.display = "none"; // Hide modal
		};

		cancelButton.onclick = () => {
			resolve({
				confirmed: false,
			});
			modal.style.display = "none"; // Hide modal
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

//✅  Function to play all custom logos
async function playAllCustomLogos() {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	const logoKeys = Object.keys(logos);

	isGifPlaying = true; // Set to true when starting playback

	while (isGifPlaying) {
		// Loop while isGifPlaying is true
		for (let i = 0; i < logoKeys.length; i++) {
			if (!isGifPlaying) break; // Exit loop if playback is stopped

			const logoSrc = logos[logoKeys[i]];
			const audioImage = document.getElementById("audioImage");
			if (audioImage) {
				audioImage.src = logoSrc;
				audioImage.style.display = "block";
				audioImage.classList.remove("D-logo-rotate-animation");

				await new Promise((resolve) => {
					audioImage.onload = () => {
						setTimeout(() => {
							resolve();
						}, 2000); // Duration in milliseconds
					};
					audioImage.src = logoSrc; // This triggers the onload event
				});
			}
		}
	}
}

// ✅ Function to stop playback
function stopGifPlayback() {
	isGifPlaying = false; // Set to false to stop the loop
}

// ✅ Function to set the selected logo and save the preference
function setSelectedLogo(logoSrc) {
	if (logoSrc) {
		audioImage.src = logoSrc; // Set the image source
		audioImage.style.display = 'block'; // Show the logo
		localStorage.setItem('selectedLogo', logoSrc); // Save the selected logo to localStorage
	} else {
		// If logoSrc is empty or null, clear the logo
		audioImage.src = '';
		audioImage.style.display = 'none';
	}

	// Optionally, handle animations based on your conditions
	const defaultLogoLinks = document.querySelectorAll(
		"#logoOptions .sub-dropdown-content a[data-src]"
	);
	defaultLogoLinks.forEach((link, index) => {
		if (link.getAttribute("data-src") === logoSrc) {
			if (index === 1) {
				audioImage.classList.add("D-logo-rotate-animation");
			} else {
				audioImage.classList.remove("D-logo-rotate-animation");
			}
		}
	});
}

// ✅ Update default logo links to add hover preview functionality
const defaultLogoLinks = document.querySelectorAll(
	"#logoOptions .sub-dropdown-content a[data-src]"
);
defaultLogoLinks.forEach((link) => {
	link.addEventListener("mouseenter", function() {
		const logoSrc = this.getAttribute("data-src");
		if (logoSrc) showLogoPreview(logoSrc);
	});

	link.addEventListener("mouseleave", function() {
		hideLogoPreview();
	});

	link.addEventListener("click", function() {
		const logoText = this.textContent.trim();
		const logoSrc = this.getAttribute("data-src");

		if (logoText === "None") {
			// Clear the selected logo if "None" is chosen
			Array.from(logoPreviewImages).forEach((img) => {
				img.src = '';
				img.alt = 'No Logo Selected';
			});
			setSelectedLogo(''); // Assuming this function exists
		} else if (logoSrc) {
			setSelectedLogo(logoSrc); // Assuming this function exists
		}
	});
});

// ✅ Function to search GIFs using the Giphy API
function searchGifs() {
	const searchTerm = gifSearchInput.value.trim();
	if (!searchTerm) return;

	clearGifResults();
	gifResultsContainer.innerHTML = `<div class="loading">Loading...</div>`;
	gifResultsContainer.style.display = "block";

	fetch(`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=100`)
		.then((response) => response.json())
		.then((data) => {
			displayGifResults(data.data);
		})
		.catch((error) => {
			console.error("Error fetching GIFs:", error);
			gifResultsContainer.innerHTML = `<div class="no-results">Error fetching results. Please try again later.</div>`;
		});
}

// ✅ Display GIF results
function displayGifResults(gifs) {
	gifResultsContainer.innerHTML = ""; // Clear previous results
	if (gifs.length === 0) {
		gifResultsContainer.innerHTML = `<div class="no-results">No results found.</div>`;
		return;
	}

	gifs.forEach(gif => {
		const gifUrl = gif.images.fixed_height.url;
		const gifPreview = document.createElement("img");
		gifPreview.src = gifUrl;
		gifPreview.alt = gif.title || "GIF preview";
		gifPreview.classList.add("gif-preview");

		// Add click event for downloading the GIF
		gifPreview.addEventListener("click", function() {
			downloadAndSaveGif(gifUrl, gif.title);
		});

		gifResultsContainer.appendChild(gifPreview);
	});
}

// ✅ Function to clear GIF results and free up network resources
function clearGifResults() {
	const gifElements = gifResultsContainer.querySelectorAll("img"); // Select all GIFs
	gifElements.forEach((gif) => {
		if (gif.src.startsWith("blob:")) {
			URL.revokeObjectURL(gif.src); // Revoke blob URLs to free memory
		}
	});

	gifResultsContainer.innerHTML = ""; // Clear all child elements
	gifResultsContainer.style.display = "none"; // Hide the container
}

// Event listeners
gifSearchInput.addEventListener("input", function() {
	clearTimeout(debounceTimeout);
	debounceTimeout = setTimeout(searchGifs, 300); // Debounce search
});

gifSearchInput.addEventListener("keydown", function(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		searchGifs();
	}
});

// Hide the results container and clear results when clicking outside
document.addEventListener("click", function(event) {
	if (!gifSearchContainer.contains(event.target)) {
		clearGifResults(); // Clean up GIFs when clicking outside
		gifSearchInput.value = ""; // Optionally clear the search input
	}
});

// Prevent container from closing when clicked inside
gifSearchContainer.addEventListener("click", function(event) {
	event.stopPropagation();
});

// Allow gif scrolling when mouse is over it
gifSearchContainer.addEventListener("wheel", (event) => {
	if (isMouseOver) {
		event.stopPropagation();
	}
});

// Detect mouse enter/leave events for the Gif container
gifResultsContainer.addEventListener("mouseenter", () => {
	isMouseOver = true;
});
gifResultsContainer.addEventListener("mouseleave", () => {
	isMouseOver = false;
});

gifSearchButton.addEventListener("mouseover", () => {

})

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

// ✅ Function to apply saturation effect
function applySaturationToVideo(value) {
	video.style.filter = `saturate(${value}%)`;
	localStorage.setItem("saturationValue", value); // Save to localStorage
}

// Update displayed value and apply saturation
function updateSaturation(value) {
	saturationValue.textContent = value + '%';
	applySaturationToVideo(value);
}

function loadSaturationValue() {
	const savedValue = localStorage.getItem("saturationValue");
	if (savedValue) {
		saturationSlider.value = savedValue;
		updateSaturation(savedValue);
	}
}

// Slider input event
saturationSlider.addEventListener('input', function() {
	updateSaturation(this.value);
});

// Mouse wheel adjustment on slider
saturationSlider.addEventListener('wheel', function(e) {
	e.preventDefault(); // Prevent page scrolling
	let newValue = parseInt(this.value) + (e.deltaY > 0 ? -STEP : STEP);

	// Clamp between min (0) and max (200)
	newValue = Math.max(0, Math.min(200, newValue));

	this.value = newValue;
	updateSaturation(newValue);
});


// Allow saturationModal scrolling when mouse is over it
saturationModal.addEventListener("wheel", (event) => {
	if (isMouseOver) {
		event.stopPropagation();
	}
});

// Prevent keyboard scrolling when focused on the saturationModal
saturationModal.addEventListener("keydown", (event) => {
	if (isMouseOver) {
		// List of keys that typically scroll the page
		const scrollKeys = ['ArrowLeft', 'ArrowRight'];

		if (scrollKeys.includes(event.code)) {
			event.stopPropagation();
		}
	}
});

// Detect mouse enter/leave events for the saturationModal container
saturationModal.addEventListener("mouseenter", () => {
	isMouseOver = true;
});
saturationModal.addEventListener("mouseleave", () => {
	isMouseOver = false;
});

// Also handle focus/blur for keyboard users
saturationModal.addEventListener("focus", () => {
	isMouseOver = true;
});
saturationModal.addEventListener("blur", () => {
	isMouseOver = false;
});

// Reset to default
resetBtn.addEventListener('click', function() {
	saturationSlider.value = DEFAULT_SATURATION;
	updateSaturation(DEFAULT_SATURATION);
});

// Open modal when button is clicked
videoEffectBtn.addEventListener('click', function() {
	saturationModal.style.display = 'block';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
	if (event.target === saturationModal) {
		saturationModal.style.display = 'none';
	}
});

// Show modal on hover
videoEffectBtn.addEventListener('mouseover', function() {
	saturationModal.style.display = 'block';
});

// Hide modal when mouse leaves the container
// Assuming the container is the modal itself or a parent element
const modalContainer = saturationModal; // or select the container element

modalContainer.addEventListener('mouseleave', function() {
	saturationModal.style.display = 'none';
});

// ✅ Function to load media file
async function loadMediaFile(filePath, fileName) {
	if (!filePath) {
		video.style.display = "none";
		document.getElementById("noMediaLogo").style.display = "block";
		audioImage.style.display = "none";
		document.getElementById("audioLogo").style.display = "none";
		return;
	}

	try {
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
		} else if (audioFormats.includes(fileExtension)) {
			document.getElementById("audioLogo").style.display = "block";
			audioImage.style.display = "block";
			loadCustomLogos();
			audioLogoDropdown.style.pointerEvents = "auto";
			audioLogoDropdown.style.opacity = "1";
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

	} catch (error) {
		console.error("❌ Error loading media file:", error);
		video.style.display = "none";
		document.getElementById("noMediaLogo").style.display = "block";
	}
}

// Ensure event listeners are only added once
currentMedia.addEventListener("loadedmetadata", async () => {
	updateSeekBar();
	updateNavigationButtons();
	updateDurationDisplay();
	resetZoom(showStatusMessage(''));
	updateVideoTitle(video.dataset.videoId);
	highlightCurrentVideo(video.dataset.videoId);
	video.currentTime = 0;

	// Load chapters from video file
	if (mediaFiles[currentVideoIndex]) {
		loadChaptersFromFile(mediaFiles[currentVideoIndex]);
	}

	// Await track detection BEFORE play() to prevent AbortError race
	await Promise.all([
		populateAudioTracks(),
		populateSubtitleTracks()
	]);

	// Guard: if another load started while awaiting, skip play()
	if (!video.paused) return;
	video.play().catch(function(err) {
		if (err.name !== 'AbortError') console.error('play() error:', err);
	});
});

// ✅ Handle playback ending
currentMedia.addEventListener("ended", () => {
	resetZoom();
	stopPlayback();
	updateNavigationButtons();
	updateSeekBar();
	updateDurationDisplay();
});

// ✅ Get unique video ID
function getVideoId() {
	return video?.dataset?.videoId || null;
}

// ✅ Modified playMediaFile to handle both initial play and playlist updates
function playMediaFile(filePath) {
	if (!filePath) return;

	// Extract REAL filename (not 8.3 short name)
	const pathParts = filePath.split(/[/\\]/);
	const realFileName = pathParts[pathParts.length - 1];

	// If file not in playlist, add it
	if (!mediaFiles.includes(filePath)) {
		mediaFiles.push(filePath);
		updatePlaylistDropdown(mediaFiles);
		updateVideoTitle(realFileName);
	}

	currentVideoIndex = mediaFiles.indexOf(filePath);
	loadMediaFile(filePath, realFileName);
	highlightCurrentVideo(realFileName);
	updateNavigationButtons();
}

// ✅ Function to play a video by its index
function playVideoByIndex(index) {
	if (index < 0 || index >= mediaFiles.length) return;
	currentVideoIndex = index;
	lastPlayedIndex = index;

	const filePath = mediaFiles[index];

	// Extract REAL filename (not 8.3 short name)
	const pathParts = filePath.split(/[/\\]/);
	const realFileName = pathParts[pathParts.length - 1];

	loadMediaFile(filePath, realFileName);
	highlightCurrentVideo(realFileName);
	updateNavigationButtons();
}

video.addEventListener("ended", () => {
	const nextIndex = getNextIndex();
	if (nextIndex !== null) {
		playVideoByIndex(nextIndex);
	} else {
		stopPlayback();

		// Shutdown PC if the "Shutdown at end of playlist" checkbox is checked
		if (isShutdownAtPlaylistEndEnabled) {
			window.electron.sendShutdownRequest(); // Send shutdown request to main process
		}
	}

	// Shutdown PC if the "Shutdown at end of video" checkbox is checked
	if (isShutdownAtVideoEndEnabled) {
		window.electron.sendShutdownRequest(); // Send shutdown request to main process
	}
});

// 🟢 Open file dialog - replaces playlist and plays instantly
openFileButton.addEventListener("click", async () => {
	try {
		const result = await window.electron.openFileDialog();
		if (!result) return;

		if (result.singleFile) {
			const alreadyInPlaylist = mediaFiles.indexOf(result.currentFile);
			if (alreadyInPlaylist !== -1) {
				// File is already in current playlist — just switch to it, don't reload
				currentVideoIndex = alreadyInPlaylist;
				playMediaFile(mediaFiles[currentVideoIndex]);
				return;
			}
			// New file not in playlist — replace with sibling files from its folder
			mediaFiles = result.siblingFiles;
			currentVideoIndex = mediaFiles.indexOf(result.currentFile);
			if (currentVideoIndex === -1) {
				mediaFiles = [result.currentFile];
				currentVideoIndex = 0;
			}
		} else {
			// Multiple files: REPLACE entire playlist, play first selected file instantly
			mediaFiles = result.files;
			currentVideoIndex = 0;
		}

		playMediaFile(mediaFiles[currentVideoIndex]);
		updatePlaylistDropdown(mediaFiles);
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
			showStatusMessage(`Loaded ${folderFiles.length} video(s) from folder`);
		}
	} catch (error) {
		console.error("Error opening folder:", error);
	}
});

// Functions to toggle play/pause icon
function updatePlayPauseIcon(isPlaying) {
	const iconSrc = isPlaying ? "../assets/icons/pause-.png" : "../assets/icons/play-.png";
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

video.addEventListener("play", () => updatePlayPauseIcon(true));
video.addEventListener("pause", () => updatePlayPauseIcon(false));

// ✅ Function to get the next video index
function getNextIndex() {
	if (mediaFiles.length === 0) return null;

	if (isShuffle) {
		// Get all unplayed videos
		let remainingVideos = mediaFiles
			.map((file, index) => ({
				file,
				index
			}))
			.filter(({
				index
			}) => !playedVideos.includes(index));

		// If we have unplayed videos, pick one randomly
		if (remainingVideos.length > 0) {
			let randomVideo = remainingVideos[Math.floor(Math.random() * remainingVideos.length)];
			return randomVideo.index;
		}
		// If all videos have been played and repeat mode is on (mode 2), reset and shuffle again
		else if (isRepeatMode === 2) {
			playedVideos = []; // Reset played videos
			return Math.floor(Math.random() * mediaFiles.length); // Start new shuffle cycle
		}
		// If no repeat mode, end playback
		else {
			return null;
		}
	}

	// Original non-shuffle logic
	let nextIndex = currentVideoIndex + 1;
	return nextIndex < mediaFiles.length ? nextIndex : (isRepeatMode === 2 ? 0 : null);
}


// ✅ Function to get the previous video index
function getPreviousIndex() {
	if (mediaFiles.length === 0) return null;

	if (isShuffle && lastPlayedStack.length > 0) {
		return lastPlayedStack.pop(); // ✅ Use last played history
	}

	let prevIndex = currentVideoIndex - 1;
	return prevIndex >= 0 ? prevIndex : (isRepeatMode === 2 ? mediaFiles.length - 1 : null);
}


// ✅ Play next video while tracking playback history
function playNext() {
	if (video.duration >= 60 && video.currentTime < video.duration) {
		savePlaybackTime(video.dataset.videoId, video.currentTime);
	}

	const nextIndex = getNextIndex();
	if (nextIndex === null) {
		stopPlayback();

		// Shutdown PC if the "Shutdown at end of playlist" checkbox is checked
		if (isShutdownAtPlaylistEndEnabled) {
			window.electron.sendShutdownRequest();
		}
		return;
	}

	// Store navigation history
	if (currentVideoIndex !== null && navigationHistory[navigationHistory.length - 1] !== currentVideoIndex) {
		navigationHistory.push(currentVideoIndex);
	}

	// Mark current video as played (only in shuffle mode)
	if (isShuffle && !playedVideos.includes(currentVideoIndex)) {
		playedVideos.push(currentVideoIndex);
	}

	currentVideoIndex = nextIndex;
	lastPlayedIndex = nextIndex;

	playVideoByIndex(nextIndex);
	highlightCurrentVideo(mediaFiles[nextIndex]);
	updateNavigationButtons();
	showStatusMessage("Next");
}

// ✅ Play previous video correctly
function playPrevious() {
	if (video.duration >= 60 && video.currentTime < video.duration) {
		savePlaybackTime(video.dataset.videoId, video.currentTime);
	}

	if (navigationHistory.length > 0) {
		let prevIndex = navigationHistory.pop(); // Retrieve the actual previous video
		playedVideos.push(currentVideoIndex); // Store the current video as played
		currentVideoIndex = prevIndex;
		lastPlayedIndex = prevIndex;

		playVideoByIndex(prevIndex);
		highlightCurrentVideo(mediaFiles[prevIndex]);
		updateNavigationButtons();
		showStatusMessage("Previous");
		return;
	}

	// Fallback if navigation history is empty
	const prevIndex = getPreviousIndex();
	if (prevIndex === null) {
		console.warn("No previous video available.");
		return;
	}

	currentVideoIndex = prevIndex;
	lastPlayedIndex = prevIndex;

	playVideoByIndex(prevIndex);
	highlightCurrentVideo(mediaFiles[prevIndex]);
	updateNavigationButtons();
	showStatusMessage("Previous Video");
}

// ✅ Ensure buttons are updated properly
function updateNavigationButtons() {
	const nextIndex = getNextIndex();
	const prevIndex = getPreviousIndex();

	nextButton.classList.toggle("hidden", nextIndex === null || mediaFiles.length === 0);
	prevButton.classList.toggle("hidden", prevIndex === null || mediaFiles.length === 0);

	// // console.log("🔄 Navigation updated | Next:", nextIndex, "| Previous:", prevIndex);
}


// Function to update video title with truncation
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
	window.electron.invoke('cleanup-subtitles').catch(e => console.warn('Subtitle cleanup:', e));
}

// Event listener for stop playback using querySelectorAll and forEach
document.querySelectorAll(".stopPlayback").forEach(button => {
	button.addEventListener("click", () => {
		stopPlayback();
		updateNavigationButtons(); // Ensure buttons are updated when stopped
	});
});

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
	currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
	showStatusMessage(
		`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
	);
});

forward.addEventListener("click", () => {
	currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
	showStatusMessage(
		`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
	);
});

// Double click on video for rewind/forward (YouTube-like)
// video.addEventListener('dblclick', (e) => {
//     // Get click position relative to video element
//     const rect = video.getBoundingClientRect();
//     const clickX = e.clientX - rect.left;
//     const videoWidth = rect.width;

//     // Determine if click was on left or right side (45% threshold like YouTube)
//     if (clickX < videoWidth * 0.5) {
//         // Left side - rewind
//         currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10); 
//         showStatusMessage(
// 			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
// 		);
//         // Visual feedback (optional)
//         video.classList.add('rewind-effect');
//         setTimeout(() => video.classList.remove('rewind-effect'), 300);
//     } 
//     else if (clickX > videoWidth * 0.5) {
//         // Right side - forward
//         currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
// 		showStatusMessage(
// 			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
// 		);
//         // Visual feedback (optional)
//         video.classList.add('forward-effect');
//         setTimeout(() => video.classList.remove('forward-effect'), 300);
//     }
//     // Middle area (50-50%) does nothing on double click
// });

// Initial button visibility update
updateNavigationButtons();


// ✅ Handle two-finger swipe using the "wheel" event
document.addEventListener("wheel", (e) => {
	// Check if the wheel event is horizontal (deltaX) and not vertical (deltaY)
	if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
		if (e.deltaX > 0) {
			// Two-finger swipe left (rewind)
			currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			);
		} else if (e.deltaX < 0) {
			// Two-finger swipe right (fast forward)
			currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
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
	if (!Array.isArray(mediaFiles) || mediaFiles.length === 0) return;

	const playlistContainers = document.querySelectorAll(".play-list");

	playlistContainers.forEach((playlistContainer) => {
		playlistContainer.innerHTML = "";

		// ✅ Inject search bar
		const searchInput = document.createElement("input");
		searchInput.type = "text";
		searchInput.placeholder = "Search video...";
		searchInput.classList.add("playlist-search");

		// Styling
		Object.assign(searchInput.style, {
			placeholdercolor: "#fff",
			backgroundColor: "transparent",
			backdropFilter: "blur(10px)",
			color: "#fff",
			position: "sticky",
			top: "0",
			zIndex: "2",
			paddingLeft: "5px",
			width: "100%",
			height: "28px",
			outline: "none",
			border: "none",
			display: "block",
		});

		playlistContainer.appendChild(searchInput);

		mediaFiles.forEach((filePath, index) => {
			// Extract REAL filename (not 8.3 short name)
			const pathParts = filePath.split(/[/\\]/);
			const realFileName = pathParts[pathParts.length - 1];

			const fileLink = document.createElement("a");

			fileLink.href = "javascript:void(0)";
			fileLink.textContent = realFileName; // Use real filename
			fileLink.classList.add("playlist-item");

			fileLink.addEventListener("click", () => {
				playVideoByIndex(index);
				highlightCurrentVideo(realFileName);
			});

			playlistContainer.appendChild(fileLink);
		});

		// ✅ Activate search logic (with debounce)
		let debounceTimeout;
		searchInput.addEventListener("input", function() {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => {
				const query = searchInput.value.toLowerCase().trim();
				playlistContainer.querySelectorAll(".playlist-item").forEach(item => {
					item.style.display = item.textContent.toLowerCase().includes(query) ? "block" : "none";
				});
			}, 300);
		});

		// Prevent input from closing dropdown
		searchInput.addEventListener("click", (e) => e.stopPropagation());
		searchInput.addEventListener("keydown", (e) => e.stopPropagation());
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
}

// ✅ Function to HIGHLIGHT CURRENT VIDEO (All Containers)
function highlightCurrentVideo(fileName) {
	// Extract filename from path if needed
	const pathParts = fileName.split(/[/\\]/);
	const realFileName = pathParts[pathParts.length - 1];

	// Update ALL playlist containers
	document.querySelectorAll(".play-list").forEach(playlistContainer => {
		// Remove existing highlights
		playlistContainer.querySelectorAll(".highlight").forEach(item => {
			item.classList.remove("highlight");
		});

		// Add highlight to matching items
		playlistContainer.querySelectorAll(".playlist-item").forEach(item => {
			if (item.textContent.trim() === realFileName) {
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

// Check if a container is actually visible in the DOM
function isContainerVisible(container) {
	const style = window.getComputedStyle(container);
	const parent = container.closest('.sub-dropdown-content, .playlist-container');

	// Check if element or parent is hidden
	if (style.display === 'none' || style.visibility === 'hidden') return false;
	if (parent) {
		const parentStyle = window.getComputedStyle(parent);
		if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') return false;
	}

	return true;
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

	// Allow playlist scrolling when mouse is over it
	playlistContainer.addEventListener("wheel", (event) => {
		if (isMouseOver) {
			event.stopPropagation();
		}
	});

	// Detect mouse enter/leave events for the playlist container
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

// KEYBOARD NAVIGATION for playlist
document.addEventListener("keydown", function(event) {
	const playlistContainer = document.querySelector(".playlist-container");

	if (playlistContainer && playlistContainer.classList.contains("show")) {
		const playlistItems = Array.from(playlistContainer.querySelectorAll(".playlist-item"));
		if (playlistItems.length === 0) return;

		const currentIndex = playlistItems.findIndex(item => item.classList.contains("highlight"));

		if (event.key === "ArrowDown") {
			event.preventDefault();
			const nextIndex = (currentIndex + 1) % playlistItems.length;
			playlistItems[nextIndex].click();
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			const prevIndex = (currentIndex - 1 + playlistItems.length) % playlistItems.length;
			playlistItems[prevIndex].click();
		}
	}
});

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
		// Update cm-check icon (context menu)
		const cmCheck = el.querySelector('.cm-check');
		if (cmCheck) cmCheck.innerHTML = isActive ? '<i class="fa-solid fa-check"></i>' : '';
		// Update nav-sort-check icon (nav bar)
		const navCheck = el.querySelector('.nav-sort-check');
		if (navCheck) navCheck.innerHTML = isActive ? '<i class="fa-solid fa-check"></i>' : '';
	});
	document.querySelectorAll('[data-sort="ascending"], [data-sort="descending"]').forEach(el => {
		const isActive = el.dataset.sort === sortDirection;
		el.classList.toggle('active', isActive);
		const cmCheck = el.querySelector('.cm-check');
		if (cmCheck) cmCheck.innerHTML = isActive ? '<i class="fa-solid fa-check"></i>' : '';
		const navCheck = el.querySelector('.nav-sort-check');
		if (navCheck) navCheck.innerHTML = isActive ? '<i class="fa-solid fa-check"></i>' : '';
	});
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
	chaptersDropdown = document.getElementById('chapters-dropdown');
	chaptersButton = document.getElementById('chapters-button');
	chaptersCloseBtn = document.getElementById('chapters-close-btn');
	chaptersList = document.querySelector('.chapters-list');
	chapterTooltip = document.getElementById('chapter-tooltip');
	chaptersMarkersContainer = document.getElementById('chapters-markers-container');

	// console.log('[Chapters] DOM Elements initialized:');
	// console.log('  - chaptersDropdown:', !!chaptersDropdown);
	// console.log('  - chaptersButton:', !!chaptersButton);
	// console.log('  - chaptersList:', !!chaptersList);
	// console.log('  - chapterTooltip:', !!chapterTooltip);
	// console.log('  - chaptersMarkersContainer:', !!chaptersMarkersContainer);

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

// Render chapters list in dropdown
function renderChaptersList() {
	if (!chaptersList) {
		console.warn('[Chapters] List container not found');
		return;
	}

	chaptersList.innerHTML = '';

	currentChapters.forEach((chapter, index) => {
		const item = document.createElement('a');
		item.className = 'chapter-item';
		item.id = `chapter-item-${index}`;

		const nameSpan = document.createElement('span');
		nameSpan.className = 'chapter-item-name';
		nameSpan.textContent = chapter.name;

		const timeSpan = document.createElement('span');
		timeSpan.className = 'chapter-item-time';
		timeSpan.textContent = formatChapterTime(chapter.start);

		item.appendChild(nameSpan);
		item.appendChild(timeSpan);

		item.addEventListener('click', (e) => {
			e.preventDefault();
			jumpToChapter(index);
			if (chaptersDropdown) {
				chaptersDropdown.style.display = 'none';
			}
		});

		chaptersList.appendChild(item);
	});

	// console.log(`[Chapters] Rendered ${currentChapters.length} chapter items`);
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
	// console.log(`[Chapters] Showing tooltip: ${chapter.name} at ${timeStr}`);

	chapterTooltip.innerHTML = `<strong>${chapter.name}</strong><br><small>${timeStr}</small>`;
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

// Jump to chapter
function jumpToChapter(index) {
	if (index < 0 || index >= currentChapters.length) {
		console.warn('[Chapters] Invalid chapter index:', index);
		return;
	}

	const chapter = currentChapters[index];
	video.currentTime = chapter.start;
	// console.log(`[Chapters] Jumped to chapter: ${chapter.name} at ${formatChapterTime(chapter.start)}`);

	// Highlight the current chapter
	if (chaptersList) {
		document.querySelectorAll('.chapter-item').forEach((item, i) => {
			item.style.background = i === index ? 'rgba(0, 212, 255, 0.2)' : '';
		});
	}
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

// Clear chapters
function clearChapters() {
	currentChapters = [];
	if (chaptersMarkersContainer) chaptersMarkersContainer.innerHTML = '';
	if (chaptersList) chaptersList.innerHTML = '';
	if (chapterTooltip) chapterTooltip.style.display = 'none';
}

// Toggle chapters dropdown
function toggleChaptersDropdown() {
	if (!chaptersDropdown) {
		console.warn('[Chapters] Dropdown not found');
		return;
	}

	if (chaptersDropdown.style.display === 'none' || chaptersDropdown.style.display === '') {
		chaptersDropdown.style.display = 'flex';
		if (chaptersButton) chaptersButton.classList.add('active');
	} else {
		chaptersDropdown.style.display = 'none';
		if (chaptersButton) chaptersButton.classList.remove('active');
	}
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

// Setup all chapter event listeners
function setupChapterEventListeners() {
	// Chapters button click
	if (chaptersButton) {
		chaptersButton.onclick = null; // Clear any existing listeners
		chaptersButton.addEventListener('click', (e) => {
			// console.log('[Chapters] Button clicked');
			e.stopPropagation();
			toggleChaptersDropdown();
		});
		// console.log('[Chapters] Button listener attached');
	} else {
		console.warn('[Chapters] Button not found for listener');
	}

	// Close button
	if (chaptersCloseBtn) {
		chaptersCloseBtn.addEventListener('click', () => {
			if (chaptersDropdown) {
				chaptersDropdown.style.display = 'none';
				if (chaptersButton) chaptersButton.classList.remove('active');
			}
		});
	}

	// Close dropdown when clicking outside
	document.addEventListener('click', (e) => {
		if (chaptersDropdown && chaptersButton) {
			if (!chaptersDropdown.contains(e.target) && e.target !== chaptersButton && !chaptersButton.contains(e.target)) {
				chaptersDropdown.style.display = 'none';
				chaptersButton.classList.remove('active');
			}
		}
	});

	// Update markers when video duration changes
	video.addEventListener('loadedmetadata', () => {
		if (currentChapters.length > 0) {
			renderChapterMarkers();
		}
	});

	// Tooltip stays pinned at the marker — no mousemove follower needed

	// console.log('[Chapters] All event listeners attached');
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
volumeSlider.max = 200; // Set the maximum slider value to 200% volume

let audioContext = new AudioContext();
const gainNode = audioContext.createGain();
const compressor = audioContext.createDynamicsCompressor();
const midBoostFilter = audioContext.createBiquadFilter();
const stereoPanner = audioContext.createStereoPanner(); // Create a stereo panner node

// Set up a bandpass filter to enhance mid-range frequencies (where most vocals are)
midBoostFilter.type = "peaking";
midBoostFilter.frequency.setValueAtTime(3650, audioContext.currentTime); // Center frequency
midBoostFilter.Q.setValueAtTime(2, audioContext.currentTime); // Bandwidth (resonance) of the filter
midBoostFilter.gain.setValueAtTime(2, audioContext.currentTime); // Milder mid boost

// Set compressor parameters for vocal clarity (updated for softer compression)
compressor.threshold.setValueAtTime(-40, audioContext.currentTime); // Lower threshold for more subtle compression
compressor.knee.setValueAtTime(28, audioContext.currentTime); // Moderate knee
compressor.ratio.setValueAtTime(2, audioContext.currentTime); // Gentler compression
compressor.attack.setValueAtTime(0.03, audioContext.currentTime); // Slightly slower attack
compressor.release.setValueAtTime(0.3, audioContext.currentTime); // Smoother release
stereoPanner.pan.setValueAtTime(0.2, audioContext.currentTime); // Slight stereo offset

// Connect nodes
const source = audioContext.createMediaElementSource(videoElement);
source.connect(midBoostFilter);
midBoostFilter.connect(compressor);
compressor.connect(stereoPanner); // Connect compressor to stereo panner
stereoPanner.connect(gainNode); // Connect stereo panner to gain node
gainNode.connect(audioContext.destination);

// Create an analyser node for real-time audio monitoring (new code)
const audioAnalyser = audioContext.createAnalyser();
audioAnalyser.fftSize = 256; // Size of the FFT for analysis
const bufferLength = audioAnalyser.frequencyBinCount; // Length of data array for analyser
const timeDomainData = new Uint8Array(bufferLength); // Array to hold the frequency data

// Connect analyser node to monitor audio levels
compressor.connect(audioAnalyser); // Place analyser after the compressor
audioAnalyser.connect(gainNode); // Continue connecting analyser to the gain node

// Function to monitor audio levels and normalize automatically
let _monitorRafId = null;
let _monitorRunning = false;

function monitorAudioLevels() {
	if (!_monitorRunning) return; // Stop if flagged

	audioAnalyser.getByteTimeDomainData(timeDomainData);

	let sum = 0;
	for (let i = 0; i < bufferLength; i++) {
		let sample = timeDomainData[i] / 128 - 1.0;
		sum += sample * sample;
	}
	const rms = Math.sqrt(sum / bufferLength);

	if (rms > 0.7) {
		let newVolume = Math.max(0, gainNode.gain.value - 0.1);
		gainNode.gain.linearRampToValueAtTime(newVolume, audioContext.currentTime + 0.1);
	}

	_monitorRafId = requestAnimationFrame(monitorAudioLevels);
}

function startMonitor() {
	if (_monitorRunning) return; // Already running — do NOT start a second loop
	_monitorRunning = true;
	_monitorRafId = requestAnimationFrame(monitorAudioLevels);
}

function stopMonitor() {
	_monitorRunning = false;
	if (_monitorRafId !== null) {
		cancelAnimationFrame(_monitorRafId);
		_monitorRafId = null;
	}
}

// Start monitoring audio levels when the video is played

videoElement.addEventListener("play", startMonitor);
videoElement.addEventListener("pause", stopMonitor);
videoElement.addEventListener("ended", stopMonitor);

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
		updateVolume(parseFloat(savedVolume)); // Update volume based on saved value
	} else {
		updateVolume(0.1); // Set default to 10% volume if no saved value
	}
}

// Set initial volume (existing)
gainNode.gain.value = 0.1; // Set default volume to 10%
volumeSlider.value = gainNode.gain.value * 100; // Sync slider with volume (0-200 range)

// Call the loadVolumeSetting to apply saved or default volume
loadVolumeSetting(); // Load saved volume or apply default volume (100%)

// Update the volume update function to handle exact synchronization
function updateVolume(newVolume, source = null) {
	// Ensure the volume value is within the precise range [0, 2]
	newVolume = parseFloat(Math.max(0, Math.min(2, newVolume).toFixed(2)));

	// Update the actual audio volume
	gainNode.gain.linearRampToValueAtTime(newVolume, audioContext.currentTime + 0.1);

	// Sync volume to external audio element (non-native codec path)
	// audioTrackPlayer.volume is 0–1, gainNode supports 0–2 (boosted)
	if (audioTrackPlayer && audioTrackPlayer.src) {
		audioTrackPlayer.volume = Math.min(1, newVolume);
	}

	// Always update the slider to match the exact volume, except when the source is the slider
	if (source !== 'slider') {
		volumeSlider.value = Math.round(newVolume * 100); // Ensure integer values for the slider
	}

	// Show tooltip with precise percentage
	showTooltip(newVolume);

	// Save the exact volume setting
	saveVolumeSetting(newVolume);

	// Update volume button icon
	updateVolumeIcon();
}

// Function to update and show the tooltip
function showTooltip(volume, event = null) {
	tooltip.textContent = `Volume: ${(volume * 100).toFixed(0)}%`;

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

// Volume slider input handler - use exact values
volumeSlider.addEventListener("input", (event) => {
	const exactVolume = parseFloat(event.target.value) / 100;
	updateVolume(exactVolume, 'slider');
	showTooltip(exactVolume, event);
});

volumeSlider.addEventListener("mouseenter", () => {
	showTooltip(gainNode.gain.value);
});

volumeSlider.addEventListener("mouseleave", () => {
	tooltipTimeout = setTimeout(() => {
		tooltip.style.opacity = "0";
	}, 1000);
});

window.addEventListener('load', () => {
	// Force sync the slider with current volume on load
	volumeSlider.value = Math.round(gainNode.gain.value * 100);
});

// Mouse wheel handler for slider - use same calculation
volumeSlider.addEventListener("wheel", (e) => {
	e.preventDefault();
	// Calculate exact steps (1% per wheel tick)
	const step = e.deltaY > 0 ? -1 : 1;
	let newValue = parseInt(volumeSlider.value) + step;
	newValue = Math.max(0, Math.min(newValue, 200));

	const exactVolume = parseFloat(newValue / 100).toFixed(2);
	updateVolume(exactVolume, 'wheel');
	showTooltip(exactVolume, e);
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

// Text size adjustment functionality (CTRL + Mouse Wheel)
// Handle text scaling separately
mediaPlayer.addEventListener("wheel", (event) => {
	// Prevent default scrolling
	event.preventDefault();

	// If the mouse is over the playlist, allow it to scroll naturally
	if (isMouseOver) return;

	if (event.ctrlKey && event.shiftKey) {
		// Zoom functionality
		if (event.deltaY < 0) {
			scale = Math.min(scale + 0.1, maxZoom); // Max zoom level
		} else {
			scale = Math.max(scale - 0.1, minZoom); // Min zoom level (no zoom)
		}

		video.style.transform = `scale(${scale})`;
		video.style.transformOrigin = "center center"; // Zoom from the center

		const zoomPercentage = Math.round(scale * 100);
		showStatusMessage(`Zoom: ${zoomPercentage}%`);

	} else if (event.ctrlKey) {
		// Adjust font size
		if (event.deltaY < 0) {
			fontSize = Math.min(maxFontSize, fontSize + 2); // Increase font size
		} else {
			fontSize = Math.max(minFontSize, fontSize - 2); // Decrease font size
		}

		videoTitleElement.style.fontSize = `${fontSize}px`;
		statusMessage.style.fontSize = `${fontSize}px`;
		fontSizeTooltip.style.fontSize = `${fontSize}px`;
		// Update subtitle font size via CSS custom property
		document.documentElement.style.setProperty('--subtitle-font-size', `${fontSize}px`);
		saveFontSize(fontSize);

		const fontSizePercentage = Math.round(((fontSize - minFontSize) / (maxFontSize - minFontSize)) * 100);
		fontSizeTooltip.textContent = `Text size: ${fontSizePercentage}%`;
		fontSizeTooltip.style.display = "block";

		setTimeout(() => {
			fontSizeTooltip.style.display = "none";
		}, 1500);

	} else {
		// Volume adjustment with exact steps
		const step = event.deltaY > 0 ? -0.05 : 0.05;
		let newVolume = parseFloat((gainNode.gain.value + step).toFixed(2));
		newVolume = Math.max(0, Math.min(2, newVolume));

		updateVolume(newVolume, 'wheel');

		tooltip.style.left = `${event.pageX}px`;
		tooltip.style.top = `${event.pageY - 30}px`;
		tooltip.textContent = `Volume: ${Math.round(newVolume * 100)}%`;
		tooltip.style.display = "block";

		setTimeout(() => {
			tooltip.style.display = "none";
		}, 3900);
	}
});

// Update the volume button icon and tooltip
function updateVolumeIcon() {
	if (gainNode.gain.value === 0) {
		volumeBtn.src = "../assets/icons/volume-mute.png";
		volumeBtn.setAttribute("title", "Unmute"); // Update tooltip
	} else if (gainNode.gain.value < 0.70) {
		volumeBtn.src = "../assets/icons/volume-low.png";
		volumeBtn.setAttribute("title", "Volume Low"); // Update tooltip
	} else if (gainNode.gain.value < 1.2) {
		volumeBtn.src = "../assets/icons/volume.png";
		volumeBtn.setAttribute("title", "Normal Volume"); // Update tooltip
	} else {
		volumeBtn.src = "../assets/icons/volume-high.png";
		volumeBtn.setAttribute("title", "Mute"); // Update tooltip
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


// Zoom functionality (CTRL + Shift + Mouse Wheel)
mediaPlayer.addEventListener("wheel", (event) => {
	// Prevent default behavior
	event.preventDefault();

	if (event.ctrlKey && event.shiftKey) {
		// Zoom functionality with CTRL + Shift + Mouse Wheel
		if (event.deltaY < 0) {
			scale = Math.min(scale + 0.1, maxZoom); // Max zoom level
			video.style.cursor = "zoom-in";
		} else {
			scale = Math.max(scale - 0.1, minZoom); // Min zoom level (no zoom)
			video.style.cursor = "zoom-out";
		}

		// Apply zoom along with rotation and pan
		applyTransformations();
	}
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

	// Reset the CSS transform for zoom, pan, and maintain rotation
	applyTransformations();
}

// Toggle shuffle mode
function toggleShuffleMode() {
	isShuffle = !isShuffle;
	updateShuffleUI();
	updatePlaybackState();
	window.electron.sendShuffleState(isShuffle ? "on" : "off");

	// Clear history when turning off shuffle
	if (!isShuffle) {
		playedVideos = [];
		navigationHistory = [];
	}
}

function updateShuffleUI() {
	if (isShuffle) {
		shuffleButton.classList.add("active");
		shuffleButton.src = "../assets/icons/shuffle.png";
		showStatusMessage("Shuffle: On");
		shuffleButton.title = "Shuffle off";
	} else {
		shuffleButton.classList.remove("active");
		shuffleButton.src = "../assets/icons/no-shuffle.png";
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
			loopBtn.src = "../assets/icons/repeat-on.png";
			iconContainer.classList.add('off');
			loopBtn.parentElement.setAttribute('data-tooltip', 'Loop off');
			break;
		case 1:
			showStatusMessage("Loop: One");
			loopBtn.src = "../assets/icons/repeat-one.png";
			iconContainer.classList.remove('off');
			loopBtn.parentElement.setAttribute('data-tooltip', 'Loop one');
			break;
		case 2:
			showStatusMessage("Loop: All");
			loopBtn.src = "../assets/icons/repeat-on.png";
			iconContainer.classList.remove('off');
			loopBtn.parentElement.setAttribute('data-tooltip', 'Loop All');
			break;
		default:
			loopBtn.src = "../assets/icons/repeat-on.png";
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
				"../assets/icons/exit-full-screen.png" :
				"../assets/icons/full-screen.png";
		}
		// Update FA icon if present (context menu / nav bar)
		const icon = button.querySelector("i.fa-solid");
		if (icon) {
			icon.className = isFullscreen ?
				"fa-solid fa-compress" :
				"fa-solid fa-expand";
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
	window.electron.toggleFullscreen();
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

		// Show menu to calculate dimensions
		contextMenu.style.display = "block";
		contextMenu.style.visibility = "hidden";

		// Force reflow to get accurate measurements
		const contextMenuHeight = contextMenu.scrollHeight;
		const contextMenuWidth = contextMenu.offsetWidth;

		let top = mouseY;
		let left = mouseX;

		// Smart vertical positioning
		if (mouseY + contextMenuHeight > screenHeight - 20) {
			// Not enough space below, open upward
			top = Math.max(10, mouseY - contextMenuHeight);
		}

		// Smart horizontal positioning
		if (mouseX + contextMenuWidth > screenWidth - 20) {
			// Not enough space on right, open to the left
			left = Math.max(10, mouseX - contextMenuWidth);
		}

		// Ensure menu stays within viewport bounds
		top = Math.max(10, Math.min(top, screenHeight - contextMenuHeight - 10));
		left = Math.max(10, Math.min(left, screenWidth - contextMenuWidth - 10));

		// Apply position and make visible
		contextMenu.style.top = `${top}px`;
		contextMenu.style.left = `${left}px`;
		contextMenu.style.visibility = "visible";

		updateContextTogglePlayPause();
	}

	function hideContextMenu() {
		contextMenu.style.display = "none";
		contextMenu.style.visibility = "visible";
	}

	// Attach event listeners
	mediaPlayer.addEventListener("contextmenu", showContextMenu);

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
			iconElement.innerHTML = '<i class="fa-solid fa-play"></i>';
		} else {
			textElement.innerText = "Pause";
			iconElement.innerHTML = '<i class="fa-solid fa-pause"></i>';
		}
	}

	// HANDLE CONTEXT MENU CLICKS
	const contextMenuItems = document.querySelectorAll(".context-menu ul li a");

	contextMenuItems.forEach((item) => {
		item.addEventListener("click", (event) => {
			const target = event.target;

			// Don't close if clicking a sub-menu trigger
			if (target.closest(".cm-sub-item")) {
				return;
			}

			if (target.closest("#contextOpenFile")) {
				openFileButton.click();
			} else if (target.closest("#contextOpenFolder")) {
				openFolderButton.click();
			} else if (target.closest("#contextTogglePlayPause")) {
				togglePlayPause();
			} else if (target.closest("#context-menu-shutdown-timer")) {
				showTimerContainer(true);
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

document.querySelectorAll(".increase-volume").forEach((element) => {
	element.addEventListener("click", () => {
		updateVolume(gainNode.gain.value + 0.1)
	});
});

document.querySelectorAll(".decrease-volume").forEach((element) => {
	element.addEventListener("click", () => {
		updateVolume(gainNode.gain.value - 0.1)
	});
});

// Event listeners for all nav components
document.querySelectorAll(".quit").forEach((element) => {
	element.addEventListener("click", () => {
		savePlaybackAndQuit();
	});
});

document.querySelectorAll(".increase-volume").forEach((element) => {
	element.addEventListener("click", () => {
		updateVolume(gainNode.gain.value + 0.1)
	});
});

document.querySelectorAll(".decrease-volume").forEach((element) => {
	element.addEventListener("click", () => {
		updateVolume(gainNode.gain.value - 0.1)
	});
});


// keybord Shortcut
document.addEventListener("keydown", (event) => {
	if (gifSearchContainer.contains(document.activeElement)) {
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
		toggleShortcutsInfoBox();
		return;
	}

	if (event.ctrlKey && event.key.toLowerCase() === "p") {
		event.preventDefault();
		togglePiPMode();
		return;
	}

	if (event.ctrlKey && event.key === "ArrowRight") {
		event.preventDefault();
		currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 60);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	if (event.ctrlKey && event.key === "ArrowLeft") {
		event.preventDefault();
		currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 60);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	if (event.shiftKey && event.key === "ArrowRight") {
		event.preventDefault();
		currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 5);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	if (event.shiftKey && event.key === "ArrowLeft") {
		event.preventDefault();
		currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime - 5);
		showStatusMessage(
			`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
		);
		return;
	}

	if (event.key === "ArrowUp") {
		event.preventDefault();
		updateVolume(Math.min(2, gainNode.gain.value + 0.05));
		showStatusMessage(`Volume: ${(Math.min(2, gainNode.gain.value + 0.05) * 100).toFixed(0)}%`);
	} else if (event.key === "ArrowDown") {
		event.preventDefault();
		updateVolume(Math.max(0, gainNode.gain.value - 0.05));
		showStatusMessage(`Volume: ${(Math.max(0, gainNode.gain.value - 0.05) * 100).toFixed(0)}%`);
	}

	if (event.ctrlKey && event.key === ";") {
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

		const zoomPercentage = Math.round(scale * 100);
		showStatusMessage(`Zoom: ${zoomPercentage}%`);
	}

	if (event.key.toLowerCase() === 't' && !event.ctrlKey) {
		event.preventDefault();
		if (currentMedia) {
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			);
		}
	}

	if (event.ctrlKey && event.key.toLowerCase() === 't') {
		event.preventDefault();
		showTimerContainer()
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
			currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			); // Show current time and total duration
		},
		ArrowRight: () => {
			currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} / ${formatTime(currentMedia.duration)}`
			); // Show current time and total duration
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
		}
	};

	if (keyActions[event.key]) {
		keyActions[event.key]();
	}

});

// Function to handle zoom menu clicks
zoomOptions.forEach((option, index) => {
	option.addEventListener("click", () => {
		// Update the scale based on the clicked menu option
		scale = zoomLevels[index];
		currentZoomIndex = index;

		// Apply zoom transformations
		video.style.transform = `scale(${scale})`;
		video.style.transformOrigin = "center center"; // Zoom from the center

		// Display status message
		const zoomPercentage = Math.round(scale * 100);
		showStatusMessage(`Zoom: ${zoomPercentage}%`);
	});
});


// Function to toggle the shortcuts info box (modal)
function toggleShortcutsInfoBox() {
	const modal = document.getElementById("shortcutsModal");

	// Toggle the modal's visibility
	if (modal.style.display === "block") {
		modal.style.display = "none";
	} else {
		modal.style.display = "block";

		// Close the modal when the user clicks on <span> (x)
		const closeBtn = document.querySelector(".modalClose");
		closeBtn.onclick = function() {
			modal.style.display = "none";
		};

		// Close the modal when the user clicks anywhere outside of it
		window.onclick = function(event) {
			if (event.target == modal) {
				modal.style.display = "none";
			}
		};
	}
}

// Allow shortcutsModal scrolling when mouse is over it
shortcutsModal.addEventListener("wheel", (event) => {
	if (isMouseOver) {
		event.stopPropagation();
	}
});

// Detect mouse enter/leave events for the playlist container
shortcutsModal.addEventListener("mouseenter", () => {
	isMouseOver = true;
});
shortcutsModal.addEventListener("mouseleave", () => {
	isMouseOver = false;
});


const btn = document.getElementById("showShortcuts");
btn.onclick = function() {
	toggleShortcutsInfoBox();
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

	video.style.objectFit = "contain"; // Adjust to fit container
}

// Function to rotate video
function rotateVideo(degrees) {
	video.dataset.rotation = degrees;
	rotationInitiated = true;
	applyRotation();
}

// Function to rotate video
function rotateVideo(degrees) {
	video.dataset.rotation = degrees;
	rotationInitiated = true; // Set the flag to true
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

// Holds ffprobe track data returned from main process

// Audio Track Management
//
// ARCHITECTURE:
//   video#media  → always plays /stream (HEVC/H264 video + container audio).
//                  For native codecs (AAC) this is all we need.
//   audio#audioTrackPlayer → hidden <audio> element that plays /audio/<n>
//                  (ffmpeg transcodes EAC3/AC3/DTS → Opus/WebM).
//                  We mute the <video> and sync this element to it.
//
// This avoids ALL video.src swapping, so no AbortError, no re-load races.
//



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
		// console.log('[Audio] audioTrackPlayer element created successfully');
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
// The NATIVE_AUDIO_CODECS distinction is no longer needed for routing decisions.

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
				var codec = track.codec.toUpperCase();
				var ch = track.channelLayout || (track.channels ? track.channels + 'ch' : '');
				var lang = (track.lang && track.lang !== 'track' + (i + 1)) ? ' - ' + track.lang : '';
				var title = (track.title && track.title !== track.codec) ? ' [' + track.title + ']' : '';
				item.textContent = '[' + codec + (ch ? ' ' + ch : '') + ']' + lang + title;
				item.addEventListener('click', function() {
					switchAudioTrackByIndex(i);
				});
				list.appendChild(item);
			});
		});

		// Apply the auto-selected track (no src-swap, no AbortError)
		applyAudioTrack(autoIndex);
		return;
	}

	// 2. No ffprobe tracks found
	// The video.audioTracks browser API is unreliable for MKV in Electron
	// (wrong indices, often empty). Show a message and let the user try the
	// next file — ffprobe should always find tracks for valid media files.
	ffprobeAudioTracks = [];
	console.warn('[Audio] No tracks found via ffprobe — cannot populate audio menu');
}

// Apply audio track selection without touching video.src
// For native codecs: use browser audioTracks API (video element handles it)
// For non-native:    mute video, play /audio/<n> in hidden <audio> element, keep in sync
// Audio sync state 
var _activeAudioIndex = -1; // which track is in the <audio> element
var _streamStartedAt = 0; // video.currentTime when the stream was launched
var _driftTimer = null; // setInterval handle for drift correction
var DRIFT_MAX = 0.5; // seconds — restart stream if drift exceeds this

// Launch (or re-launch) the external audio stream from video.currentTime.
// This kills the old ffmpeg process and starts a new one from the right seek position.
// Because the stream is a live WebM pipe, we CANNOT seek audioTrackPlayer.currentTime —
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
	audioTrackPlayer.volume = Math.min(1, gainNode ? gainNode.gain.value : 1);
	audioTrackPlayer.playbackRate = video.playbackRate;

	// Explicitly load the new source
	audioTrackPlayer.load();

	// Error handler
	function onError(e) {
		audioTrackPlayer.removeEventListener('error', onError);
		console.error('[Audio] Stream error:', e);
		console.error('[Audio] Error details:', audioTrackPlayer.error);
	}
	audioTrackPlayer.addEventListener('error', onError);

	// Wait for enough buffered data, then play
	function onCanPlay() {
		audioTrackPlayer.removeEventListener('canplay', onCanPlay);
		// console.log('[Audio] Stream ready, playing...');

		// Always try to play, even if video is paused (video might play immediately after)
		audioTrackPlayer.play().then(function() {
			// console.log('[Audio] Playing successfully');
			_startDriftTimer();
			// If video is paused, pause audio too
			if (video.paused) {
				audioTrackPlayer.pause();
			}
		}).catch(function(e) {
			if (e.name !== 'AbortError') {
				console.error('[Audio] play() failed:', e.name, e.message);
			}
		});
	}
	audioTrackPlayer.addEventListener('canplay', onCanPlay);

	// Timeout fallback - if canplay never fires
	setTimeout(function() {
		if (audioTrackPlayer.readyState < 2) {
			console.warn('[Audio] Stream not ready after 5s, forcing play attempt...');
			audioTrackPlayer.play().catch(function(e) {
				console.error('[Audio] Force play failed:', e.message);
			});
		}
	}, 5000);
}

// Stop the external audio stream and clear drift correction.
// NOTE: We do NOT unmute video here — video stays muted because all audio
// comes through the external pipe. Video is only unmuted when no media is loaded.
function stopExternalAudio() {
	_stopDriftTimer();
	audioTrackPlayer = getAudioTrackPlayer();
	if (audioTrackPlayer) {
		audioTrackPlayer.pause();
		audioTrackPlayer.removeAttribute('src');
		try {
			audioTrackPlayer.load();
		} catch (e) {}
	}
	_activeAudioIndex = -1;
}

// Drift correction: every 2 s check how far audio has wandered from video.
// audioTrackPlayer.currentTime counts up from 0 since stream start.
// Expected audio time = video.currentTime - _streamStartedAt.
// If |expected - actual| > DRIFT_MAX, restart the stream from current position.
function _startDriftTimer() {
	_stopDriftTimer();
	_driftTimer = setInterval(function() {
		if (!audioTrackPlayer || !audioTrackPlayer.src) {
			_stopDriftTimer();
			return;
		}
		if (video.paused || audioTrackPlayer.paused) return; // OK while paused

		if (audioTrackPlayer.readyState < 2) {
			// Stalled
			// console.log('[Audio] stalled — restarting');
			startExternalAudio(_activeAudioIndex);
			return;
		}

		var expected = video.currentTime - _streamStartedAt;
		var actual = audioTrackPlayer.currentTime;
		var drift = Math.abs(expected - actual);
		if (drift > DRIFT_MAX) {
			// console.log('[Audio] drift=' + drift.toFixed(3) + 's — resyncing');
			startExternalAudio(_activeAudioIndex);
		}
	}, 2000);
}

function _stopDriftTimer() {
	if (_driftTimer) {
		clearInterval(_driftTimer);
		_driftTimer = null;
	}
}

// Apply a chosen audio track (called on load and on user pick)
//
// WHY always external (even for native AAC):
//   video.audioTracks[] browser API is unreliable for MKV in Electron.
//   Its indices don't match ffprobe's — e.g. if track 0 is EAC3 (non-native),
//   the browser may only expose the two AAC tracks as indices 0 and 1, making
//   ffprobe index 2 → video.audioTracks[2] = undefined → no track enabled →
//   browser falls back to English default.
//   The HTTP /audio/<n> pipe already transcodes to WebM/Opus for EAC3/AC3/DTS.
//   For AAC it's equally fast — FFmpeg just reads/remuxes, barely any CPU cost.
//   All three tracks now work identically through one reliable code path.
function applyAudioTrack(index) {
	const track = ffprobeAudioTracks[index];
	if (!track) return;

	currentAudioIndex = index;
	autoSwitchDone = true;

	// Mute the video element — audio comes entirely from the external pipe
	video.muted = true;

	// Update UI highlight
	document.querySelectorAll('.audio-track-list .track-item').forEach((el, i) => {
		el.classList.toggle('selected-track', i === index);
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
	audioTrackPlayer.pause();
});

video.addEventListener('seeked', function() {
	if (!audioTrackPlayer || !audioTrackPlayer.src) return;
	// Live stream can't seek in place — restart from new position
	startExternalAudio(_activeAudioIndex);
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


// Freeze-frame seek overlay
// Problem: browser clears the video frame the instant video.currentTime changes,
// causing a black/white flash while it fetches & decodes the new position.
//
// Fix (same technique used by YouTube, Netflix, VLC preview):
//   1. Before seeking → snapshot current frame onto a hidden <canvas>
//   2. Show canvas ON TOP of video (covers the black flash completely)
//   3. Show spinner on top of the canvas so user knows it's loading
//   4. When 'seeked' fires AND first new frame is painted → hide canvas
//
// The canvas exactly matches the video element size/position so the transition
// is completely seamless — user never sees black.

let _freezeCanvas = null; // created once, reused
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

	// Match canvas resolution to actual video pixels for sharp snapshot
	_freezeCanvas.width = video.videoWidth;
	_freezeCanvas.height = video.videoHeight;

	try {
		_freezeCtx.drawImage(video, 0, 0, _freezeCanvas.width, _freezeCanvas.height);
		_freezeCanvas.style.display = 'block';
		_freezeActive = true;
	} catch (e) {
		// drawImage can fail if video is in error state — just skip freeze
		_freezeActive = false;
	}
}

function _releaseFreezeFrame() {
	clearTimeout(_seekSpinnerTimer);
	cancelAnimationFrame(_rafHandle);
	if (_freezeCanvas) _freezeCanvas.style.display = 'none';
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

// Debounced seek helper
// Throttle rapid currentTime changes (drag, wheel) to one Range request per 100 ms.
// The freeze-frame already covers the gap visually, so debounce is for perf only.
let _seekDebounceTimer = null;

function _seekTo(time) {
	clearTimeout(_seekDebounceTimer);
	_seekDebounceTimer = setTimeout(() => {
		video.currentTime = time;
	}, 80);
}


let currentSubtitleIndex = -1; // -1 = off

// Tracks currently-alive Blob URLs so we can revoke them when loading a new video
// (avoids memory leaks — browser keeps Blob data alive until revoked)
let _subtitleBlobUrls = [];

// ASS style data per track (index → { styles, events }).  Null for SRT/VTT.
// Populated by populateSubtitleTracks(), consumed by _renderCues().
let _subtitleCueStyles = [];

// ── Subtitle population guard ─────────────────────────────────────────────
// Problem: loadedmetadata fires TWICE — once when video.src is set, and again
// when populateSubtitleTracks appends <track> elements to the video element.
// A simple boolean flag resets between the two fires (async completes first),
// so the second fire bypasses it and re-populates → duplicate track list.
//
// Fix: key the guard to the file path. Once a file's subtitles are populated,
// any subsequent call for the SAME file is a no-op — regardless of timing.
// Resets to null when a new file starts loading (playMediaFile / stopPlayback).
let _subtitlePopulatedForFile = null;

async function populateSubtitleTracks() {
	const filePath = mediaFiles[currentVideoIndex];
	if (!filePath) return;
	// Already populated for this exact file — skip (handles double loadedmetadata)
	if (filePath === _subtitlePopulatedForFile) return;
	_subtitlePopulatedForFile = filePath; // claim this file immediately (before any await)

	// Tear down previous subtitle state & revoke old Blob URLs
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
		offBtn.textContent = 'Off';
		offBtn.addEventListener('click', () => switchSubtitleTrack(-1));
		list.appendChild(offBtn);
	});

	let result;
	try {
		result = await window.electron.invoke('get-subtitle-tracks', filePath);
	} catch (err) {
		console.error('[Sub] IPC error:', err);
		_subtitlePopulatedForFile = null; // allow retry on error
		return;
	}
	if (!result || !result.success || result.tracks.length === 0) return;

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
			a.textContent = `${track.title} (${track.lang})${badge}`;
			a.addEventListener('click', () => switchSubtitleTrack(i));
			list.appendChild(a);
		});
	});

	// Auto-activate forced track if present
	if (forcedIndex !== -1) switchSubtitleTrack(forcedIndex);
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
	const seen = new Set(); // dedup identical cue text
	const usedEventSet = new Set(); // each ASS event consumed by exactly one VTT cue

	Array.from(activeCues).forEach(cue => {
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
		if (seen.has(plainKey)) return;
		seen.add(plainKey);

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
	_subCueHandler = () => _renderCues(track.activeCues);
	_subSeekHandler = () => _renderCues(track.activeCues);
	track.addEventListener('cuechange', _subCueHandler);
	video.addEventListener('seeked', _subSeekHandler);
	// Render immediately in case video is mid-cue
	_renderCues(track.activeCues);
}

function switchSubtitleTrack(index) {
	currentSubtitleIndex = index;
	_subtitleTeardown();

	// UI highlight
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
			"../assets/icons/win/restore-maximize.png" :
			"../assets/icons/win/maximize.png";
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
window.electron.onFileOpen((filePath) => {
	if (filePath) {
		if (!isFirstFileOpened) {
			// First file - initialize playlist and start playing it
			mediaFiles = [filePath];
			currentVideoIndex = 0;
			isFirstFileOpened = true;
			updatePlaylistDropdown(mediaFiles);
			playMediaFile(filePath, filePath.split("/").pop());
		} else {
			// Subsequent files (e.g. multi-select from Explorer / second-instance) —
			// add to playlist but do NOT auto-play. The first file already started;
			// overriding it here would cause the last-received file to win instead.
			if (!mediaFiles.includes(filePath)) {
				mediaFiles.push(filePath);
				updatePlaylistDropdown(mediaFiles);
				// Do not call playMediaFile here — first file stays playing.
			}
		}
	}
});

// ✅ Modified function for folder open from context menu
window.electron.openFolderFromContext(async (folderPath) => {
	try {
		const receivedFiles = await window.electron.invoke("open-folder", folderPath);

		if (Array.isArray(receivedFiles) && receivedFiles.length > 0) {
			// Always REPLACE old playlist with the new folder's files
			mediaFiles = receivedFiles;
			currentVideoIndex = 0;
			isFirstFileOpened = true;
			updatePlaylistDropdown(mediaFiles);
			playMediaFile(mediaFiles[currentVideoIndex]);
			showStatusMessage(`Loaded ${receivedFiles.length} video(s) from folder`);
		}
	} catch (error) {
		console.error("❌ Error loading folder:", error);
	}
});

// Update Dialog Functions
const updateDialog = {
	_snoozeTimer: null,

	init: function() {
		this.dialog    = document.getElementById('updateDialog');
		this.versionEl = document.getElementById('updateVersionLabel');
		this.updateNowBtn  = document.getElementById('updateNowBtn');
		this.updateLaterBtn = document.getElementById('updateLaterBtn');

		this.updateNowBtn.addEventListener('click', () => {
			window.electron.startUpdateDownload();
			this.hide();
		});

		// "Later" snoozes for 10 minutes then reminds again
		this.updateLaterBtn.addEventListener('click', () => {
			this.hide();
			if (this._snoozeTimer) clearTimeout(this._snoozeTimer);
			this._snoozeTimer = setTimeout(() => this.show(), 10 * 60 * 1000);
		});
	},

	show: function(version) {
		if (version && this.versionEl) {
			this.versionEl.textContent = `v${version}`;
			this.versionEl.style.display = 'inline';
		}
		this.dialog.classList.add('active');
		void this.dialog.offsetWidth; // force reflow
	},

	hide: function() {
		this.dialog.classList.remove('active');
	}
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	updateDialog.init();

	window.electron.onUpdateAvailable((_, info) => {
		updateDialog.show(info?.version);
	});

	window.electron.onUpdateError((_, errMsg) => {
		console.error('Update failed:', errMsg);
		showStatusMessage('⚠️ Update failed — will retry later', 5000);
	});
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

// GPU info: fetch at startup, show briefly as status message
(async () => {
	try {
		const gpuInfo = await window.electron.invoke('get-gpu-info');
		if (gpuInfo && gpuInfo.vendor !== 'unknown') {
			const gpuName = (gpuInfo.gpus && gpuInfo.gpus[0]) ?
				(gpuInfo.gpus[0].description || gpuInfo.gpus[0].model || gpuInfo.vendor.toUpperCase()) :
				gpuInfo.vendor.toUpperCase();
			const hwLabel = gpuInfo.hwAccel !== 'none' ? ` · ${gpuInfo.hwAccel}` : '';
			showStatusMessage(`GPU: ${gpuName}${hwLabel}`);
		}
	} catch (e) {
		/* silent */ }
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
	updateVolume(gainNode.gain.value + 0.1) // Increase volume
	showStatusMessage(`Volume: ${(gainNode.gain.value * 100).toFixed(0)}%`);
});

// Handle volume decrease action from tray
window.electron.onDecreaseVolume(() => {
	updateVolume(gainNode.gain.value - 0.1); // Decrease volume
	showStatusMessage(`Volume: ${(gainNode.gain.value * 100).toFixed(0)}%`);
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

//  AUDIO EFFECTS  (Auto / Coding / Movie / Music / Comfort)

const EQ_PRESETS = {
	auto: {
		label: 'Auto',
		filters: [{
				type: 'highpass',
				frequency: 40,
				Q: 0.7,
				gain: 0
			},
			{
				type: 'peaking',
				frequency: 3000,
				Q: 1.5,
				gain: 2.5
			},
			{
				type: 'peaking',
				frequency: 8000,
				Q: 1.5,
				gain: 1.5
			},
			{
				type: 'lowpass',
				frequency: 18000,
				Q: 0.7,
				gain: 0
			},
		],
		compThreshold: -40,
		compRatio: 2,
		panValue: 0,
	},
	coding: {
		label: 'Coding',
		filters: [{
				type: 'highpass',
				frequency: 60,
				Q: 0.7,
				gain: 0
			},
			{
				type: 'peaking',
				frequency: 200,
				Q: 1.0,
				gain: -3
			},
			{
				type: 'peaking',
				frequency: 1000,
				Q: 1.0,
				gain: 0
			},
			{
				type: 'peaking',
				frequency: 6000,
				Q: 1.0,
				gain: 1
			},
			{
				type: 'lowpass',
				frequency: 16000,
				Q: 0.7,
				gain: 0
			},
		],
		compThreshold: -50,
		compRatio: 1.5,
		panValue: 0,
	},
	movie: {
		label: 'Movie',
		filters: [{
				type: 'lowshelf',
				frequency: 80,
				Q: 1.0,
				gain: 5
			},
			{
				type: 'peaking',
				frequency: 300,
				Q: 1.0,
				gain: -2
			},
			{
				type: 'peaking',
				frequency: 3500,
				Q: 1.5,
				gain: 4
			},
			{
				type: 'highshelf',
				frequency: 10000,
				Q: 1.0,
				gain: 3
			},
		],
		compThreshold: -30,
		compRatio: 4,
		panValue: 0,
	},
	music: {
		label: 'Music',
		filters: [{
				type: 'lowshelf',
				frequency: 100,
				Q: 1.0,
				gain: 4
			},
			{
				type: 'peaking',
				frequency: 500,
				Q: 0.8,
				gain: -1
			},
			{
				type: 'peaking',
				frequency: 4000,
				Q: 1.0,
				gain: 3
			},
			{
				type: 'highshelf',
				frequency: 12000,
				Q: 1.0,
				gain: 4
			},
		],
		compThreshold: -35,
		compRatio: 3,
		panValue: 0,
	},
	comfort: {
		label: 'Comfort',
		filters: [{
				type: 'lowshelf',
				frequency: 100,
				Q: 1.0,
				gain: -2
			},
			{
				type: 'peaking',
				frequency: 800,
				Q: 1.0,
				gain: 2
			},
			{
				type: 'peaking',
				frequency: 3000,
				Q: 1.2,
				gain: 1
			},
			{
				type: 'highshelf',
				frequency: 9000,
				Q: 1.0,
				gain: -4
			},
		],
		compThreshold: -50,
		compRatio: 1.8,
		panValue: 0,
	},
};

let _eqFilterNodes = [];
let _activeEffectKey = null;

function applyAudioEffect(key) {
	const preset = EQ_PRESETS[key];
	if (!preset) return;
	// Guard: if AudioContext nodes not ready yet, skip silently
	if (typeof audioContext === 'undefined' || typeof gainNode === 'undefined') return;

	const now = audioContext.currentTime;

	// 1. Disconnect old EQ nodes (no leaks)
	_eqFilterNodes.forEach(f => {
		try {
			f.disconnect();
		} catch (_) {}
	});
	_eqFilterNodes = [];

	// 2. Resume if suspended 
	if (audioContext.state === 'suspended') audioContext.resume();

	// 3. Build new filter chain 
	const filters = preset.filters.map(cfg => {
		const f = audioContext.createBiquadFilter();
		f.type = cfg.type;
		f.frequency.setValueAtTime(cfg.frequency, now);
		f.Q.setValueAtTime(cfg.Q ?? 1.0, now);
		if (cfg.gain !== undefined) f.gain.setValueAtTime(cfg.gain, now);
		return f;
	});
	if (filters.length > 1) filters.reduce((p, c) => {
		p.connect(c);
		return c;
	});

	// 4. Re-wire: compressor → [EQ chain] → gainNode
	// Safely disconnect existing connections without crashing
	try {
		audioAnalyser.disconnect();
	} catch (_) {}
	try {
		compressor.disconnect();
	} catch (_) {}

	if (filters.length > 0) {
		compressor.connect(filters[0]);
		filters[filters.length - 1].connect(gainNode);
	} else {
		compressor.connect(gainNode);
	}
	// Keep analyser alive in parallel
	compressor.connect(audioAnalyser);
	audioAnalyser.connect(gainNode);

	_eqFilterNodes = filters;

	// 5. Compressor & panner tweaks 
	if (typeof compressor !== 'undefined') {
		compressor.threshold.linearRampToValueAtTime(preset.compThreshold, now + 0.15);
		compressor.ratio.linearRampToValueAtTime(preset.compRatio, now + 0.15);
	}
	if (typeof stereoPanner !== 'undefined') {
		stereoPanner.pan.linearRampToValueAtTime(preset.panValue, now + 0.15);
	}

	_activeEffectKey = key;
	_updateEffectUI(key);
	if (typeof showStatusMessage === 'function') showStatusMessage(`Audio Effect: ${preset.label}`);
}

function _updateEffectUI(activeKey) {
	document.querySelectorAll('.audio-effect-option').forEach(el => {
		const isActive = el.dataset.effect === activeKey;
		el.classList.toggle('effect-active', isActive);
		// Update cm-check icon (context menu)
		const cmCheck = el.querySelector('.cm-check');
		if (cmCheck) cmCheck.innerHTML = isActive ? '<i class="fa-solid fa-check"></i>' : '';
		// Update nav-effect-check icon (nav bar)
		const navCheck = el.querySelector('.nav-effect-check');
		if (navCheck) navCheck.innerHTML = isActive ? '<i class="fa-solid fa-check"></i>' : '';
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

// Apply default — call directly (script runs after DOM is parsed in <body> bottom)
applyAudioEffect('auto');



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
		// Only enumerate — never call getUserMedia().
		// getUserMedia({audio:true}) triggers the OS microphone indicator
		// even though we only need OUTPUT (speaker) devices for setSinkId().
		const all = await navigator.mediaDevices.enumerateDevices();
		devices = all.filter(d => d.kind === 'audiooutput');
	} catch (e) {
		console.warn('[AudioDevice] enumerateDevices failed:', e);
	}

	_devicesPopulated = true;

	lists.forEach(list => {
		list.innerHTML = '';
		const deviceList = devices.length ? devices : [{
			deviceId: 'default',
			label: 'Default'
		}];

		deviceList.forEach(device => {
			const id = device.deviceId || 'default';
			const label = device.label || (id === 'default' ? 'Default' : `Speaker (${id.slice(0,6)})`);
			const a = document.createElement('a');
			a.href = 'javascript:void(0)';
			a.className = 'device-item' + (id === currentAudioDeviceId ? ' device-active' : '');

			const ic = document.createElement('span');
			ic.className = 'cm-icon';
			ic.textContent = id === currentAudioDeviceId ? '●' : '';

			const tx = document.createElement('span');
			tx.className = 'cm-text';
			tx.textContent = label;

			a.append(ic, tx);
			// Use closure-safe reference — create once per item
			a.addEventListener('click', (function(devId) {
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



//  EMPTY SUBMENU PLACEHOLDER
//  FIX: separate observer per list; re-entrancy guard prevents
//       infinite mutation loop when placeholder is inserted.


let _checkingSubmenus = false; // re-entrancy guard

function checkEmptySubmenus() {
	if (_checkingSubmenus) return;
	_checkingSubmenus = true;

	document.querySelectorAll('.context-menu .cm-sub-item').forEach(li => {
		const dyn = li.querySelector('.cm-dynamic-list');
		if (!dyn) return;

		// Count real children (ignore existing placeholder)
		const realCount = Array.from(dyn.children).filter(c => !c.classList.contains('cm-empty-placeholder')).length;
		const existing = dyn.querySelector('.cm-empty-placeholder');

		if (realCount === 0 && !existing) {
			const p = document.createElement('div');
			p.className = 'cm-empty-placeholder';
			p.textContent = 'No items';
			dyn.appendChild(p);
		} else if (realCount > 0 && existing) {
			existing.remove();
		}
	});

	_checkingSubmenus = false;
}

// Watch only track/subtitle/playlist — NOT audio-device-list
// (populateAudioDevices rebuilds that; watching it would infinite-loop)
const _checkTargets = '.audio-track-list, .subtitle-track-list, .play-list';
document.querySelectorAll(_checkTargets).forEach(el => {
	new MutationObserver(() => {
		if (!_checkingSubmenus) checkEmptySubmenus();
	}).observe(el, {
		childList: true
	});
});

// Initial check after a short delay
setTimeout(checkEmptySubmenus, 600);



//  SPEED CONTROLS


const SPEED_STEPS = {
	'faster': 0.5,
	'faster-fine': 0.1,
	'normal': null,
	'slower-fine': -0.1,
	'slower': -0.5,
};

function applySpeedOption(key) {
	const step = SPEED_STEPS[key];
	video.playbackRate = (step === null) ?
		1.0 :
		Math.max(0.1, Math.min(4.0, Math.round((video.playbackRate + step) * 100) / 100));
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