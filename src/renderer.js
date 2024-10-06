const mediaPlayer = document.getElementById("mediaPlayer");
const fileInput = document.getElementById("fileInput");
const folderInput = document.getElementById("folderInput");
const CSOInput = document.getElementById("CSOInput");
const randomButton = document.getElementById("randomButton");
const Ofile = document.getElementById("Ofile")
const folder = document.getElementById("folder")
const CSO = document.getElementById("CSO")
const quit = document.getElementById("quit")
const video = document.getElementById('media');
const gifImageElement = document.getElementById("gifImage");
const rewind = document.getElementById('rewind');
const forward = document.getElementById('forward');
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBarContainer = document.getElementById("progressBarContainer");
const progressBarWrapper = document.getElementById("progressBarWrapper");
const progressBar = document.getElementById("progressBar");
const progressHandle = document.getElementById("progressHandle");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");
const pipButton = document.getElementById("pip");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const volumeBtn = document.getElementById("volumeBtn");
const contextMenu = document.getElementById("contextMenu");
const videoTitleElement = document.getElementById("videoTitle");
const switchAudio = document.getElementById("switchAudioTrack");
const contextMenuItems = document.querySelectorAll(".context-menu li");
const audioImage = document.getElementById('audioImage');
const logoOptions = document.getElementById('logoOptions');
const audioLogoDropdown = document.getElementById('audioLogoDropdown');
const customLogoLink = document.getElementById('customLogoLink');
const customLogoInput = document.getElementById('customLogoInput');
const deleteLogoButton = document.getElementById('deleteLogoButton');

let currentMedia = video;
let isFullScreen = false;
let isRepeat = false;
let videoFiles = [];
let playedVideos = [];
let currentFolderIndex = -1;
let currentVideoIndex = 0;
let currentAudioIndex = 0;
let autoSwitchDone = false;
let isGifPlaying = false; // Control variable to start/stop playback
let lastPlayedIndex = -1;
let showRemainingTime = false;
let isRandom = false;
let history = [];
let fontSize = 16;
const volumeStep = 0.05;
const maxFontSize = 35;
// let previousVolume = 1; 

// disabling the dragging behavior
document.querySelectorAll("a ,img").forEach((link) => {
	link.setAttribute("draggable", "false");
});


let cards = document.querySelectorAll(".card");

cards.forEach((card) => {
	document.addEventListener("mousemove", function(e) {
		// Get card's position and dimensions
		let rect = card.getBoundingClientRect();

		// Calculate the boundaries (within 20px)
		let isNearLeft = e.clientX >= rect.left - 10 && e.clientX <= rect.left;
		let isNearRight = e.clientX >= rect.right && e.clientX <= rect.right + 20;
		let isNearTop = e.clientY >= rect.top - 10 && e.clientY <= rect.top;
		let isNearBottom = e.clientY >= rect.bottom && e.clientY <= rect.bottom + 20;

		let isInsideHorizontally = e.clientX >= rect.left && e.clientX <= rect.right;
		let isInsideVertically = e.clientY >= rect.top && e.clientY <= rect.bottom;

		let isNear = isNearLeft || isNearRight || isNearTop || isNearBottom || (isInsideHorizontally && isInsideVertically);

		// Start the glow effect when the mouse is near or inside the card
		if (isNear) {
			let x = e.clientX - rect.left;
			let y = e.clientY - rect.top;

			card.style.setProperty("--x", x + "px");
			card.style.setProperty("--y", y + "px");

			card.classList.add("hovered");
		} else {
			card.classList.remove("hovered");
		}
	});
});


// Function to update logo if the audio doesn't have a thumbnail
function updateLogo(src) {
	if (!audioThumbnailExists()) { // Check if the audio has a thumbnail
		audioImage.src = src; // Set the logo
		audioImage.style.display = 'block'; // Show the logo
	} else {
		console.log('Audio already has a thumbnail; skipping logo update');
	}
}

// Change the logo based on selection from a dropdown
logoOptions.addEventListener('change', function() {
	if (this.value) {
		updateLogo(this.value);
	} else {
		console.error('Invalid selection: no logo source');
	}
});

// Trigger file input when clicking the custom logo link
customLogoLink.addEventListener('click', function() {
	customLogoInput.click(); // Programmatically click the file input
});

// Save custom logo to the default list with delete functionality
function saveCustomLogo(filePath, fileName) {
	const logoOptionsContainer = document.querySelector('#logoOptions .sub-dropdown-content');

	// Existing code for creating new logo div
	const newLogoDiv = document.createElement('div');
	newLogoDiv.classList.add('logo-item', 'custom');
	newLogoDiv.setAttribute('data-filename', fileName);

	const newLogoLink = document.createElement('a');
	newLogoLink.setAttribute('data-src', filePath);
	newLogoLink.textContent = fileName;

	newLogoLink.addEventListener('click', function() {
		audioImage.src = filePath;
		audioImage.style.display = 'block';
		audioImage.classList.remove('D-logo-rotate-animation');
	});

	const deleteButton = document.createElement('button');
	deleteButton.textContent = 'Delete';
	deleteButton.classList.add('delete-button');
	deleteButton.addEventListener('click', function() {
		logoOptionsContainer.removeChild(newLogoDiv);
		removeCustomLogoFromStorage(fileName);
		checkPlayAllButton(); // Check for "Play All" button after deletion
	});

	newLogoDiv.appendChild(newLogoLink);
	newLogoDiv.appendChild(deleteButton);
	logoOptionsContainer.appendChild(newLogoDiv);

	// Save the logo to localStorage
	saveCustomLogoToStorage(filePath, fileName);

	checkPlayAllButton(); // Check for "Play All" button after adding a new logo
}


// Function to remove the logo from localStorage
function removeCustomLogoFromStorage(fileName) {
	const logos = JSON.parse(localStorage.getItem('customLogos')) || {};
	delete logos[fileName];
	localStorage.setItem('customLogos', JSON.stringify(logos));
}

// Save the custom logo to localStorage with an absolute file path
function saveCustomLogoToStorage(filePath, fileName) {
	const logos = JSON.parse(localStorage.getItem('customLogos')) || {};
	logos[fileName] = filePath; // Store the absolute file path
	localStorage.setItem('customLogos', JSON.stringify(logos));
}

// Load custom logos from localStorage and add them to the dropdown list
function loadCustomLogos() {
	const logos = JSON.parse(localStorage.getItem('customLogos')) || {};
	const logoOptionsContainer = document.querySelector('#logoOptions .sub-dropdown-content');

	// Clear previous custom logo entries, keep default ones
	const customLogoItems = logoOptionsContainer.querySelectorAll('.logo-item.custom');
	customLogoItems.forEach(item => logoOptionsContainer.removeChild(item));

	for (const [fileName, filePath] of Object.entries(logos)) {
		saveCustomLogo(filePath, fileName); // Use the saved file path
	}
}

// Show custom confirm dialog and return a promise
function showCustomConfirm() {
	return new Promise((resolve) => {
		const modal = document.getElementById('customConfirmDialog');
		const confirmButton = document.getElementById('confirmButton');
		const cancelButton = document.getElementById('cancelButton');
		const autoSaveCheckbox = document.getElementById('autoSaveLogoConfirm');

		modal.style.display = 'block'; // Show the modal

		confirmButton.onclick = () => {
			resolve({
				confirmed: true,
				autoSave: autoSaveCheckbox.checked
			});
			modal.style.display = 'none'; // Hide modal
		};

		cancelButton.onclick = () => {
			resolve({
				confirmed: false
			});
			modal.style.display = 'none'; // Hide modal
		};
	});
}

// Updated customLogoInput change event
customLogoInput.addEventListener('change', async function(event) {
	const file = event.target.files[0];
	if (file) {
		const filePath = file.path; // Get the actual file path of the uploaded file
		audioImage.src = filePath; // Set the logo to the uploaded image or GIF
		audioImage.style.display = 'block'; // Show the logo
		audioImage.classList.remove('D-logo-rotate-animation');

		// Check if auto-save is enabled
		const autoSaveLogo = JSON.parse(localStorage.getItem('autoSaveLogo')) || false;

		if (autoSaveLogo) {
			// Automatically save the logo without asking
			const fileName = file.name; // Get the file name
			const response = await window.electron.saveCustomLogo(filePath, fileName);
			if (response.success) {
				console.log('GIF saved successfully at:', response.path);
				saveCustomLogo(filePath, fileName); // Immediately add to the logo list
			} else {
				console.error('Failed to save GIF');
			}
		} else {
			// Use custom confirm dialog
			const {
				confirmed,
				autoSave
			} = await showCustomConfirm();
			if (confirmed) {
				const fileName = file.name; // Get the file name
				const response = await window.electron.saveCustomLogo(filePath, fileName);
				if (response.success) {
					console.log('GIF saved successfully at:', response.path);
					saveCustomLogo(filePath, fileName); // Immediately add to the logo list

					// If checkbox is checked, save the auto-save preference
					if (autoSave) {
						localStorage.setItem('autoSaveLogo', JSON.stringify(true));
					}
				} else {
					console.error('Failed to save GIF');
				}
			}
		}
	} else {
		console.error('No file selected or invalid file');
	}
});


// Function to check and show the "Play All" button
function checkPlayAllButton() {
	const logos = JSON.parse(localStorage.getItem('customLogos')) || {};
	const playAllButtonContainer = document.getElementById('playAllButtonContainer'); // Create a div in HTML for the button

	// Clear existing button if any
	playAllButtonContainer.innerHTML = '';

	// Create "Play All" button if two or more custom logos exist
	if (Object.keys(logos).length >= 2) {
		const playAllButton = document.createElement('button');
		playAllButton.textContent = 'Play All';
		playAllButton.classList.add('play-all-button');
		playAllButton.addEventListener('click', playAllCustomLogos);
		playAllButtonContainer.appendChild(playAllButton);
	}
}

async function playAllCustomLogos() {
	const logos = JSON.parse(localStorage.getItem('customLogos')) || {};
	const logoKeys = Object.keys(logos);

	isGifPlaying = true; // Set to true when starting playback

	while (isGifPlaying) { // Loop while isGifPlaying is true
		for (let i = 0; i < logoKeys.length; i++) {
			if (!isGifPlaying) break; // Exit loop if playback is stopped

			const logoSrc = logos[logoKeys[i]];
			audioImage.src = logoSrc;
			audioImage.style.display = 'block';
			audioImage.classList.remove('D-logo-rotate-animation');

			await new Promise(resolve => {
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

// Function to stop playback
function stopGifPlayback() {
	isGifPlaying = false; // Set to false to stop the loop
}


// Function to set the selected logo and save the preference
function setSelectedLogo(logoSrc) {
	audioImage.src = logoSrc; // Set the image source
	audioImage.style.display = 'block'; // Show the logo
	localStorage.setItem('selectedLogo', logoSrc); // Save the selected logo to localStorage

	// Optionally, add/remove animation class based on the index or some condition
	const defaultLogoLinks = document.querySelectorAll('#logoOptions .sub-dropdown-content a[data-src]');
	defaultLogoLinks.forEach((link, index) => {
		if (link.getAttribute('data-src') === logoSrc) {
			if (index === 0) {
				audioImage.classList.add('D-logo-rotate-animation');
			} else {
				audioImage.classList.remove('D-logo-rotate-animation');
			}
		}
	});
}

// Change the logo based on default selection (also supporting GIFs)
const defaultLogoLinks = document.querySelectorAll('#logoOptions .sub-dropdown-content a[data-src]');
defaultLogoLinks.forEach((link) => {
	link.addEventListener('click', function() {
		const logoSrc = this.getAttribute('data-src');
		if (logoSrc) {
			setSelectedLogo(logoSrc); // Set the selected logo
		}
	});
});


function loadMediaFile(file) {
	const fileType = file.type.split("/")[0]; // Determine if it's audio, video, or image
	const fileURL = URL.createObjectURL(file);
	const fileName = file.name;

	if (file.type === "image/gif") {
		// Handle GIF files
		gifImageElement.src = fileURL;
		gifImageElement.style.display = "block";
		videoElement.style.display = "none";
		document.getElementById("audioLogo").style.display = "none";
		audioImage.style.display = "none";
		audioLogoDropdown.style.pointerEvents = "none";
		audioLogoDropdown.style.opacity = "0.5";

		updateVideoTitle(fileName);

		gifImageElement.onload = () => {
			URL.revokeObjectURL(fileURL);
		};
	} else if (fileType === "video" || fileType === "audio") {
		currentMedia.src = fileURL;
		updateVideoTitle(fileName);

		if (fileType === "audio") {
			readAudioMetadata(file, function(hasArtwork) {
				if (!hasArtwork) {
					audioImage.style.display = 'none';
					console.log('Audio has artwork; skipping default logo');
				} else {
					updateLogo()
					audioLogoDropdown.style.pointerEvents = 'auto';
					audioLogoDropdown.style.opacity = '1';

					if (defaultLogoLinks.length > 0) {
						defaultLogoLinks[0].click();
					}
				}
			});
		} else {
			document.getElementById("audioLogo").style.display = "none";
			audioImage.style.display = "none";
			audioLogoDropdown.style.pointerEvents = "none";
			audioLogoDropdown.style.opacity = "0.5";
		}

		gifImageElement.style.display = "none";
		videoElement.style.display = "block";
		autoSwitchDone = false;
		currentTimeDisplay.textContent = "00:00";
		durationDisplay.textContent = "00:00";

		currentMedia.addEventListener("loadedmetadata", () => {
			updateProgressBar();
			updateDurationDisplay();

			currentMedia
				.play()
				.then(() => {
					populateAudioTracks();
				})
				.catch((error) => {
					console.error("Error playing media:", error);
				});
		});
	} else {
		console.error("Unsupported file type");
	}
}

function readAudioMetadata(file, callback) {
	const reader = new FileReader();

	reader.onload = function(event) {
		const data = new Uint8Array(event.target.result);

		// Check for ID3 tag header (first 3 bytes should be 'ID3')
		if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
			let offset = 10; // ID3 header is 10 bytes

			// The size of the ID3 tag is stored in the next 4 bytes, using a synchsafe integer
			const size = ((data[6] & 0x7F) << 21) |
				((data[7] & 0x7F) << 14) |
				((data[8] & 0x7F) << 7) |
				(data[9] & 0x7F);

			while (offset < size) {
				const frameID = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
				const frameSize = (data[offset + 4] << 24) |
					(data[offset + 5] << 16) |
					(data[offset + 6] << 8) |
					data[offset + 7];
				const frameFlags = (data[offset + 8] << 8) | data[offset + 9];

				// 'APIC' frame contains the artwork
				if (frameID === 'APIC') {
					callback(true);
					return;
				}

				// Move to the next frame
				offset += 10 + frameSize;
			}
		}

		// If no artwork was found
		callback(false);
	};

	reader.onerror = function() {
		console.error('Error reading audio file metadata');
		callback(false);
	};

	// Read the first part of the file to get the metadata
	reader.readAsArrayBuffer(file.slice(0, 1024 * 10)); // Read the first 10KB
}

// Function to handle video playback
function playVideoByIndex(index) {
	if (index >= 0 && index < videoFiles.length) {
		const videoFile = videoFiles[index];
		loadMediaFile(videoFile);
		// Add the current video index to history if it's not already the last entry
		if (history.length === 0 || history[history.length - 1] !== index) {
			history.push(index);
		}
		playedVideos.push(index); // Add the played video to the list
		if (playedVideos.length === videoFiles.length) {
			playedVideos = []; // Reset once all videos have been played
		}

		lastPlayedIndex = index; // Update last played index
		currentVideoIndex = index; // Update current video index
	}
}

// Function to play media based on type
function playMedia(file) {
	const fileType = file.type.split("/")[0]; // Get 'video', 'audio', or 'image'
	if (fileType === "video" || fileType === "audio" || file.type === "image/gif") {
		loadMediaFile(file);
	} else {
		console.error("Unsupported file type");
	}
}

// Event listeners for file inputs
fileInput.addEventListener("change", async (event) => {
	const file = event.target.files[0];
	if (file) playMedia(file);
	updateVideoTitle(file.name);
});

// Event listener for selecting multiple files
CSOInput.addEventListener("change", (event) => {
	videoFiles = Array.from(event.target.files).filter(
		(file) => file.type.startsWith("video/") || file.type.startsWith("audio/") || file.type === "image/gif"
	);
	if (videoFiles.length > 0) {
		currentVideoIndex = 0; // Default to the first file in the list
		playMedia(videoFiles[currentVideoIndex]);
	}
});

// Event listener for selecting files from a folder
folderInput.addEventListener("change", (event) => {
	videoFiles = Array.from(event.target.files).filter(
		(file) => file.type.startsWith("video/") || file.type.startsWith("audio/") || file.type === "image/gif"
	);
	if (videoFiles.length > 0) {
		currentVideoIndex = 0; // Default to the first file in the list
		playMedia(videoFiles[currentVideoIndex]);
	}
});


Ofile.addEventListener("click", () => {
	fileInput.click();
});

CSO.addEventListener("click", () => {
	CSOInput.click();
});

folder.addEventListener("click", () => {
	folderInput.click();
});

// Functions to toggle play/pause icon
function updatePlayPauseIcon(isPlaying) {
	playPauseBtn.classList.toggle("fa-play", !isPlaying);
	playPauseBtn.classList.toggle("fa-pause", isPlaying);
}

function togglePlayPause() {
	if (video.readyState < 3) {
		return;
	}
	if (video.paused) {
		video.play();
		hideVideoTitle();
		window.electron.sendPlayPauseState('playing'); // Send 'playing' state to main process
	} else {
		video.pause();
		stopGifPlayback
		showVideoTitle();
		window.electron.sendPlayPauseState('paused'); // Send 'paused' state to main process
	}
}

// Event listeners play/pause button
playPauseBtn.addEventListener("click", togglePlayPause);

// Update icon based on video play/pause state
video.addEventListener("play", () => {
	updatePlayPauseIcon(true);
});

video.addEventListener("pause", () => {
	updatePlayPauseIcon(false);
});

// Function to play the next video
function playNext() {
	if (isRandom) {
		// When in random mode
		let remainingVideos = videoFiles.filter(
			(_, index) => !playedVideos.includes(index)
		);
		if (remainingVideos.length > 0) {
			currentVideoIndex = videoFiles.indexOf(
				remainingVideos[Math.floor(Math.random() * remainingVideos.length)]
			);
		} else {
			stopPlayback(); // Stop playing when all videos have been played
			return; // Stop playing when all videos have been played
		}
	} else {
		// When not in random mode
		currentVideoIndex = (currentVideoIndex + 1) % videoFiles.length;
		// If looping is disabled and we reach the end, stop playback
		if (currentVideoIndex === 0 && playedVideos.length > 0 && !isLooping) {
			stopPlayback(); // Stop playback and reset the playe
			return;
		}
	}

	lastPlayedIndex = currentVideoIndex; // Update last played index
	playVideoByIndex(currentVideoIndex);
}

// Function to play the previous video
function playPrevious() {
	if (isRandom) {
		// When in random mode
		let remainingVideos = videoFiles.filter(
			(_, index) => !playedVideos.includes(index)
		);
		if (remainingVideos.length > 0) {
			currentVideoIndex = videoFiles.indexOf(
				remainingVideos[Math.floor(Math.random() * remainingVideos.length)]
			);
		} else {
			stopPlayback(); // Stop playing when all videos have been played
			return; // Stop playing when all videos have been played
		}
	} else {
		// When not in random mode
		currentVideoIndex =
			(currentVideoIndex - 1 + videoFiles.length) % videoFiles.length;
		// If looping is disabled and we reach the beginning, stop playback
		if (
			currentVideoIndex === videoFiles.length - 1 &&
			playedVideos.length > 0 &&
			!isLooping
		) {
			stopPlayback(); // Stop playback and reset the playe
			return;
		}
	}

	lastPlayedIndex = currentVideoIndex; // Update last played index
	playVideoByIndex(currentVideoIndex);
}

// Function to stop playback and reset the media player
function stopPlayback() {
	video.pause(); // Stop the current media
	currentVideoIndex = null; // Reset the current video index
	video.src = ""; // Clear the video source
	updateVideoTitle(""); // Clear the video title display

	// Reset play/pause icon
	updatePlayPauseIcon(false);

	// Clear played videos list
	playedVideos = [];

	// Reset current time and progress bar
	video.currentTime = 0; // Reset current time to the start
	updateProgressBar(); // Update the progress bar to reflect the reset
	currentTimeDisplay.textContent = formatTime(0); // Reset current time display

	// Ensure progress bar and handle are reset to default position
	progressBar.style.width = `0%`; // Reset progress bar width
	progressHandle.style.left = `0%`; // Reset handle position

	// Reset logo (gif)
	audioImage.style.display = 'none';

	console.log("All videos have been played. Playback stopped.");
}


// Event listeners for stop playback 
document.getElementById("stopPlayback").addEventListener("click", stopPlayback)

// Event listeners for navigation buttons
document.getElementById("prevVideo").addEventListener("click", playPrevious);
document.getElementById("nextVideo").addEventListener("click", playNext);

// Handle video end event (to automatically play the next video)
video.addEventListener("ended", playNext);

// Rewind and Forward video 10 sec
rewind.addEventListener("click", () => {
	currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
});
forward.addEventListener("click", () => {
	currentMedia.currentTime = Math.min(
		currentMedia.duration,
		currentMedia.currentTime + 10
	);
});

// Function to update video title with truncation
function updateVideoTitle(title) {
	const videoTitleElement = document.getElementById("videoTitle");

	if (videoTitleElement) {
		// Remove file extensions (.mp4, .mp3, etc.)
		const nameWithoutExtension = title.replace(/\.[^/.]+$/, "");
		videoTitleElement.textContent = nameWithoutExtension;
	} else {
		console.error('Element with id "videoTitle" not found.');
	}
}

// Function to show video title when video is paused
function showVideoTitle() {
	videoTitleElement.style.display = "block";
}

// Function to hide video title when video is playing
function hideVideoTitle() {
	videoTitleElement.style.display = "none";
}

// Volume Tooltip
const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.backgroundColor = "#000";
tooltip.style.color = "#fff";
tooltip.style.padding = "5px";
tooltip.style.borderRadius = "5px";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

// Audio Context and Gain Node setup
const videoElement = document.querySelector("video");
const volumeSlider = document.getElementById("volume-slider");
volumeSlider.max = 200; // Set the maximum slider value to 200 (200% volume)

const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
const compressor = audioContext.createDynamicsCompressor();
const midBoostFilter = audioContext.createBiquadFilter();
const stereoPanner = audioContext.createStereoPanner(); // Create a stereo panner node

// Set up a bandpass filter to enhance mid-range frequencies (where most vocals are)
midBoostFilter.type = "peaking";
midBoostFilter.frequency.setValueAtTime(4300, audioContext.currentTime); // Center frequency at 1kHz
midBoostFilter.Q.setValueAtTime(2, audioContext.currentTime); // Bandwidth (resonance) of the filter
midBoostFilter.gain.setValueAtTime(8, audioContext.currentTime); // Boost mid-range frequencies by 6 dB

// Set compressor parameters for vocal clarity
compressor.threshold.setValueAtTime(-35, audioContext.currentTime); // Set threshold to -10 dB for more sensitivity
compressor.knee.setValueAtTime(28, audioContext.currentTime); // Moderate knee
compressor.ratio.setValueAtTime(6, audioContext.currentTime); // Compression ratio of 4:1 for moderate effect
compressor.attack.setValueAtTime(0.01, audioContext.currentTime); // Fast attack time to control peaks
compressor.release.setValueAtTime(0.1, audioContext.currentTime); // Quick release time

// Connect nodes
const source = audioContext.createMediaElementSource(videoElement);
source.connect(midBoostFilter);
midBoostFilter.connect(compressor);
compressor.connect(stereoPanner); // Connect compressor to stereo panner
stereoPanner.connect(gainNode); // Connect stereo panner to gain node
gainNode.connect(audioContext.destination);

// Function to save volume to localStorage
function saveVolumeSetting(volume) {
	localStorage.setItem("volumeSetting", volume);
}

// Function to load volume from localStorage
function loadVolumeSetting() {
	const savedVolume = localStorage.getItem("volumeSetting");
	if (savedVolume) {
		updateVolume(parseFloat(savedVolume)); // Update volume based on saved value
	} else {
		updateVolume(1.0); // Set default to 100% volume if no saved value
	}
}

// Set initial volume to 2.0 for 200% increase
gainNode.gain.value = 1.0; // Set initial volume
volumeSlider.value = gainNode.gain.value * 100; // Sync slider with volume (0-200 range)

// Function to update volume, slider, and tooltip
function updateVolume(newVolume) {
	// Ensure the volume value is within the range [0, 2]
	newVolume = Math.max(0, Math.min(2, newVolume));

	// Smoothly transition to the new volume level
	gainNode.gain.linearRampToValueAtTime(newVolume, audioContext.currentTime + 0.1);

	// Update slider value and show tooltip
	volumeSlider.value = newVolume * 100; // Sync slider with volume (0-200 range)
	showTooltip(newVolume);

	// Save the new volume setting to localStorage
	saveVolumeSetting(newVolume);
}

function showTooltip(volume) {
	tooltip.textContent = `Volume: ${(volume * 100).toFixed(0)}%`;
	const sliderRect = volumeSlider.getBoundingClientRect();
	const sliderX = sliderRect.left + volumeSlider.offsetWidth * (volumeSlider.value / 200);
	tooltip.style.left = `${sliderX}px`;
	tooltip.style.top = `${sliderRect.top - 30}px`;
	tooltip.style.display = "block";

	setTimeout(() => {
		tooltip.style.display = "none";
	}, 1500);
}


// Update volume when slider changes
let tooltipTimeout;

volumeSlider.addEventListener("input", (event) => {
	const volume = event.target.value / 100;
	updateVolume(volume);
	clearTimeout(tooltipTimeout); // Clear any existing timeout
});

// Hide tooltip after a delay only if the user is not actively changing the volume
volumeSlider.addEventListener("change", () => {
	tooltipTimeout = setTimeout(() => {
		tooltip.style.display = "none";
	}, 1000);
});


// Add functionality for changing volume and font size
mediaPlayer.addEventListener("wheel", (event) => {
	event.preventDefault(); // Prevent default behavior

	if (event.ctrlKey) {
		// Adjust font size
		if (event.deltaY < 0) {
			fontSize = Math.min(maxFontSize, fontSize + 2);
		} else if (event.deltaY > 0) {
			fontSize = Math.max(10, fontSize - 2);
		}
		videoTitleElement.style.fontSize = `${fontSize}px`;
	} else {
		// Adjust volume with mouse wheel
		if (event.deltaY < 0) {
			updateVolume(Math.min(2, gainNode.gain.value + 0.10)); // Increase volume up to 200%
		} else if (event.deltaY > 0) {
			updateVolume(Math.max(0, gainNode.gain.value - 0.10)); // Decrease volume
		}

		// Show volume tooltip for wheel interaction
		tooltip.style.left = `${event.pageX}px`;
		tooltip.style.top = `${event.pageY - 30}px`;
		tooltip.textContent = `Volume: ${(gainNode.gain.value * 100).toFixed(0)}%`;
		tooltip.style.display = "block";

		setTimeout(() => {
			tooltip.style.display = "none";
		}, 3900);
	}
});

// Add mouse wheel event listener to the volume slider
volumeSlider.addEventListener("wheel", (e) => {
	e.preventDefault(); // Prevent the default scrolling behavior

	const direction = e.deltaY > 0 ? -1 : 1; // Determine direction of scroll (up or down)
	let newVolume = gainNode.gain.value + direction * 0.05; // Adjust volume by a small step

	// Ensure new volume is within the range [0, 2]
	newVolume = Math.max(0, Math.min(newVolume, 2));

	// Update volume, slider value, and show tooltip
	updateVolume(newVolume);
});

// Handle Arrow Up and Arrow Down key presses
document.addEventListener("keydown", (event) => {
	if (event.key === "ArrowUp") {
		updateVolume(gainNode.gain.value + 0.1); // Increase volume
	} else if (event.key === "ArrowDown") {
		updateVolume(gainNode.gain.value - 0.1); // Decrease volume
	}
});

// Update the volume button icon and tooltip
function updateVolumeIcon() {
	if (gainNode.gain.value === 0) {
		volumeBtn.classList.remove("fa-volume-high", "fa-volume-low");
		volumeBtn.classList.add("fa-volume-mute");
		volumeBtn.setAttribute("title", "Unmute"); // Update tooltip
	} else if (gainNode.gain.value < 0.35) {
		volumeBtn.classList.remove("fa-volume-high", "fa-volume-mute");
		volumeBtn.classList.add("fa-volume-low");
		volumeBtn.setAttribute("title", "Volume Low"); // Update tooltip
	} else {
		volumeBtn.classList.remove("fa-volume-low", "fa-volume-mute");
		volumeBtn.classList.add("fa-volume-high");
		volumeBtn.setAttribute("title", "Mute"); // Update tooltip
	}
}

// Mute/Unmute functionality for volume button
let previousVolume = gainNode.gain.value; // To store the previous volume
volumeBtn.addEventListener("click", () => {
	if (gainNode.gain.value > 0) {
		previousVolume = gainNode.gain.value; // Store current volume
		gainNode.gain.value = 0; // Mute
	} else {
		gainNode.gain.value = previousVolume; // Restore volume
	}

	// Update the icon and tooltip based on the current volume
	updateVolumeIcon();
});



// Toggle random mode
function toggleRandomMode() {
	isRandom = !isRandom;

	if (isRandom) {
		randomButton.classList.add("active"); // Add active class or change icon
	} else {
		randomButton.classList.remove("active"); // Remove active class or change icon
		playedVideos = []; // Reset played videos when random mode is off
		history = []; // Reset history when random mode is off
	}
}

// Event listener for random mode button and Full screen
randomButton.addEventListener("click", toggleRandomMode);
switchAudio.addEventListener("click", populateAudioTracks);
fullscreenBtn.addEventListener("click", toggleFullScreen);

// Add double-click event listener to the media player
mediaPlayer.addEventListener("dblclick", toggleFullScreen);


// Toggle fullscreen mode
function toggleFullScreen() {
	if (video.readyState < 2) {
		return;
	}
	window.electron.toggleFullscreen();
}

// Toggle PiP mode
function togglePiPMode() {
	if (!document.pictureInPictureElement) {
		video.requestPictureInPicture().catch((error) => {
			console.error("Failed to enter Picture-in-Picture mode:", error);
		});
	} else {
		document.exitPictureInPicture().catch((error) => {
			console.error("Failed to exit Picture-in-Picture mode:", error);
		});
	}
}

// Event listener for PiP mode button
pipButton.addEventListener("click", () => togglePiPMode(video));

document.addEventListener("DOMContentLoaded", function() {
	const navbar = document.querySelector("nav");
	const footer = document.querySelector("footer");
	const video = document.querySelector("video");
	const navArrows = document.querySelector(".nav-arrows");
	const winButton = document.querySelector(".win-buttons ");
	let hideTimeout;
	let videoLoaded = false; // Flag to track if video is loaded

	// Function to hide navbar, footer, nav arrows, and cursor
	function hideControls() {
		if (videoLoaded && !video.paused) {
			// Only hide controls if video is loaded and playing
			navbar.classList.remove("navVisible");
			navbar.classList.add("navHidden");

			footer.classList.remove("footerVisible");
			footer.classList.add("footerHidden");

			navArrows.classList.add("hidden");
			winButton.classList.remove("navVisible");
			winButton.classList.add("navHidden");

			document.body.style.cursor = "none"; // Hide cursor
		}
	}

	// Function to show navbar, footer, nav arrows, and cursor
	function showControls() {
		navbar.classList.remove("navHidden");
		navbar.classList.add("navVisible");

		footer.classList.remove("footerHidden");
		footer.classList.add("footerVisible");

		navArrows.classList.remove("hidden");
		winButton.classList.remove("navHidden");
		winButton.classList.add("navVisible");

		document.body.style.cursor = "default"; // Show cursor

		// Clear the previous timeout and start a new one to hide controls after 1800ms
		clearTimeout(hideTimeout);
		if (videoLoaded && !video.paused) {
			// Only start hide timeout if video is loaded and playing
			hideTimeout = setTimeout(hideControls, 1800); // Hide after 1800ms of inactivity
		}
	}


	// Function to reset hide timeout
	function resetHideTimeout() {
		clearTimeout(hideTimeout);
		hideTimeout = setTimeout(hideControls, 1800); // Reset hide timeout
	}

	// Event listener for when the video's metadata is loaded
	video.addEventListener("loadedmetadata", function() {
		videoLoaded = true; // Set the flag to true once the video is loaded
		hideTimeout = setTimeout(hideControls, 1800); // Start hide timeout
	});

	// Event listener for when the video is paused
	video.addEventListener("pause", function() {
		showControls(); // Always show controls when video is paused
	});

	// Event listener for when the video is played
	video.addEventListener("play", function() {
		hideTimeout = setTimeout(hideControls, 1800); // Hide controls shortly after playing
	});

	// Show controls when the mouse moves and reset the timeout
	video.addEventListener("mousemove", showControls);

	// Event listener for the left mouse button to hide/show controls
	video.addEventListener("click", function(event) {
		if (event.button === 0) {
			// 0 is the left mouse button
			if (navbar.classList.contains("hidden")) {
				showControls();
			} else {
				hideControls();
			}
		}
	});

	// Event listeners for mouseover on navbar, winButton, navArrows and footer to stop hiding controls
	navbar.addEventListener("mouseover", function() {
		clearTimeout(hideTimeout);
	});
	winButton.addEventListener("mouseover", function() {
		clearTimeout(hideTimeout);
	});
	navArrows.addEventListener("mouseover", function() {
		clearTimeout(hideTimeout);
	});
	footer.addEventListener("mouseover", function() {
		clearTimeout(hideTimeout);
	});

	// Ensure controls are shown on initial load
	showControls();

	// Load the Visualization when the app is ready
	loadCustomLogos();

	// Function to show the context menu
	function showContextMenu(event) {
		event.preventDefault();
		contextMenu.style.top = `${event.clientY}px`;
		contextMenu.style.left = `${event.clientX}px`;
		contextMenu.style.display = "block";
	}

	// Function to hide the context menu
	function hideContextMenu() {
		contextMenu.style.display = "none";
	}

	// Attach event listener to mediaPlayer to show context menu
	mediaPlayer.addEventListener("contextmenu", showContextMenu);

	// Hide the context menu when clicking elsewhere
	document.addEventListener("click", hideContextMenu);

	// Handle context menu item clicks
	contextMenuItems.forEach((item) => {
		item.addEventListener("click", (event) => {
			const target = event.target;

			if (target.closest("#contextOpenFile")) {
				fileInput.click();
			} else if (target.closest("#contextOpenFolder")) {
				folderInput.click();
			} else if (target.closest("#contextTogglePlayPause")) {
				if (video.paused) {
					video.play();
					document.getElementById("contextTogglePlayPause").innerText = "Pause";
				} else {
					video.pause();
					document.getElementById("contextTogglePlayPause").innerText = "Play";
				}
			}
			hideContextMenu(); // Hide context menu after clicking an item
		});
	});
});

// Format time to HH:MM:SS
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

// Update the progress bar and handle position
function updateProgressBar() {
	if (video && video.duration && !isNaN(video.duration)) {
		const progress = (video.currentTime / video.duration) * 100;
		progressBar.style.width = `${progress}%`;
		progressHandle.style.left = `100%`; // Keep the handle at the end of the progress bar
		currentTimeDisplay.textContent = formatTime(video.currentTime);
	} else {
		currentTimeDisplay.textContent = "0:00:00";
	}
}

// Function to update duration display
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

// Sync the progress bar and duration display when the video is playing
video.addEventListener("timeupdate", () => {
	updateProgressBar();
	updateDurationDisplay(); // Update the duration display dynamically
});

// Update the duration display on click
durationDisplay.addEventListener("click", () => {
	showRemainingTime = !showRemainingTime; // Toggle the flag
	updateDurationDisplay(); // Update the display based on the flag
});

// Update the progress bar when clicking within the extended clickable area
progressBarWrapper.addEventListener("click", (e) => {
	const rect = progressBarWrapper.getBoundingClientRect();
	const posY = e.clientY - rect.top; // Position of the click relative to the top of the wrapper
	const posX = e.clientX - rect.left; // Position of the click relative to the left of the wrapper

	if (posY >= -20 && posY <= 20) {
		// Check if click is within the extended clickable area
		const percentage = posX / rect.width;
		video.currentTime = percentage * video.duration;
		updateProgressBar(); // Ensure handle and progress bar update immediately
	}
});

// Handle dragging for smoother seeking
let isDragging = false;

function updateDragging(e) {
	if (isDragging) {
		const rect = progressBarWrapper.getBoundingClientRect();
		const posX = e.clientX - rect.left;
		const percentage = Math.min(Math.max(posX / rect.width, 0), 1); // Ensure percentage is between 0 and 1

		// Update both progress bar and handle position simultaneously
		progressBar.style.width = `${percentage * 100}%`;
		progressHandle.style.left = `100%`; // Keep the handle at the end of the progress bar

		video.currentTime = percentage * video.duration; // Sync the video time with the dragging position
		currentTimeDisplay.textContent = formatTime(video.currentTime); // Update current time display
	}
}

progressHandle.addEventListener("mousedown", () => {
	isDragging = true;
	document.addEventListener("mousemove", updateDragging);
});

document.addEventListener("mouseup", () => {
	if (isDragging) {
		isDragging = false;
		document.removeEventListener("mousemove", updateDragging);
	}
});

// Add mouse wheel event listener to the progress bar wrapper
progressBarWrapper.addEventListener("wheel", (e) => {
	e.preventDefault(); // Prevent the default scrolling behavior

	if (video && video.duration && !isNaN(video.duration)) {
		const step = 10; // Number of seconds to seek per wheel scroll (adjust as desired)
		const direction = e.deltaY > 0 ? -1 : 1; // Determine direction of scroll (up or down)
		let newTime = video.currentTime + direction * step;

		// Ensure new time is within valid bounds
		newTime = Math.max(0, Math.min(newTime, video.duration));

		// Update video current time
		video.currentTime = newTime;

	}
});

// Update progress bar and current time display
updateProgressBar();
updateDurationDisplay();

// Player Shortcut
document.addEventListener("keydown", (event) => {
	if ((event.ctrlKey && event.key.toLowerCase() === "o")) {
		event.preventDefault();
		fileInput.click();
		return;
	}

	if (
		(event.shiftKey && event.key.toLowerCase() === "o")
	) {
		event.preventDefault();
		CSOInput.click();
		return;
	}

	if ((event.ctrlKey && event.key.toLowerCase() === "f")) {
		event.preventDefault();
		folderInput.click();
		return;
	}

	if ((event.ctrlKey && event.key.toLowerCase() === "q")) {
		event.preventDefault();
		window.electron.close();
		return;
	}

	if (event.ctrlKey && event.key === "/") {
		event.preventDefault();
		toggleShortcutsInfoBox();
		return;
	}

	if ((event.ctrlKey && event.key.toLowerCase() === "p")) {
		event.preventDefault();
		togglePiPMode();
		return;
	}

	if (event.ctrlKey && event.key === "-") {
		event.preventDefault();
		window.electron.minimize();
		return;
	}

	if (event.key === " ") {
		event.preventDefault();
		togglePlayPause();
	}

	const keyActions = {
		ArrowLeft: () =>
			(currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 5)),
		ArrowRight: () =>
			(currentMedia.currentTime = Math.min(
				currentMedia.duration,
				currentMedia.currentTime + 5
			)),
		f: () => toggleFullScreen(),
		r: () => toggleRandomMode(),
		p: () => playPrevious(),
		n: () => playNext(),
		l: () => toggleRepeat(),
		m: () => volumeBtn.click(),
		8: () => rotateVideo(0),
		6: () => rotateVideo(90),
		4: () => rotateVideo(-90),
		2: () => rotateVideo(180),
	};

	if (keyActions[event.key]) {
		keyActions[event.key]();
	}
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

const btn = document.getElementById("showShortcuts");
btn.onclick = function() {
	toggleShortcutsInfoBox();
};

// Toggle Repeat Video
function toggleRepeat() {
	isRepeat = !isRepeat;
	currentMedia.loop = isRepeat;
}

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
			// Handle unexpected rotation angles
			console.error("Unsupported rotation angle");
	}

	// Apply CSS to ensure video fits within the container
	video.style.objectFit = "contain"; // Adjust to your needs (cover, contain, etc.)
}

// Function to rotate video
function rotateVideo(degrees) {
	video.dataset.rotation = degrees;
	applyRotation();
}

// Add event listener for full screen change
document.addEventListener("fullscreenchange", () => {
	if (document.fullscreenElement) {
		applyRotation(); // Apply rotation in full screen
	}
});

// Set initial rotation angle (example setting to 0 degrees)
video.dataset.rotation = "0"; // Set rotation angle
applyRotation(); // Apply initial rotation


function populateAudioTracks() {
	const audioTrackList = document.getElementById("audio-track-list");
	audioTrackList.innerHTML = ""; // Clear any existing content

	if (video && video.audioTracks) {
		const audioTracks = video.audioTracks;
		console.log("Available audio tracks:", audioTracks.length);

		if (audioTracks.length === 1) {
			// Only one track, no need to switch
			console.log("Only one audio track available. No need to switch.");
			const track = audioTracks[0];

			// Create a list item for the single track
			const trackItem = document.createElement("a");
			trackItem.href = "javascript:void(0)";
			trackItem.textContent = `${track.label || "Unnamed Track"} - ${ track.language || "Unknown Language"}`;
			trackItem.className = "track-item";
			trackItem.style.border = "1px solid rgba(255, 255, 255, 0.125)";

			audioTrackList.appendChild(trackItem);

			// Enable the single audio track
			audioTracks[0].enabled = true;
			currentAudioIndex = 0; // Set the current track index
			autoSwitchDone = true; // Mark that auto-switch has been done

			console.log(
				`Single audio track selected: ${
          track.label || "Unnamed Track"
        }, Language: ${track.language || "Unknown"}`
			);
			return; // Exit the function as no further action is needed
		}

		let hindiTrackIndex = -1; // To store index of Hindi track
		let englishTrackIndex = -1; // To store index of English track
		let defaultTrackIndex = 0; // Fallback to the first track if neither Hindi nor English is found

		for (let i = 0; i < audioTracks.length; i++) {
			const track = audioTracks[i];

			// Check for Hindi track (language codes may vary, e.g., 'hi', 'hin')
			if (
				track.language &&
				(track.language.toLowerCase() === "hi" ||
					track.language.toLowerCase() === "hin" ||
					track.language.toLowerCase() === "hindi")
			) {
				hindiTrackIndex = i; // Save Hindi track index if found
			}

			// Check for English track (language codes may vary, e.g., 'en', 'eng')
			if (
				track.language &&
				(track.language.toLowerCase() === "en" ||
					track.language.toLowerCase() === "eng")
			) {
				englishTrackIndex = i; // Save English track index if found
			}

			// Create a list item for each track
			const trackItem = document.createElement("a");
			trackItem.href = "javascript:void(0)";
			trackItem.textContent = `${track.label || "Unnamed Track"} - ${
        track.language || "Unknown Language"
      }`;
			trackItem.className = "track-item";
			trackItem.onclick = () => switchTrack(i); // Add click handler

			audioTrackList.appendChild(trackItem);
		}

		// Switch to Hindi track if found, otherwise fallback to English, otherwise default to the first track
		if (hindiTrackIndex !== -1) {
			switchTrack(hindiTrackIndex);
			console.log("Hindi track found and selected.");
		} else if (englishTrackIndex !== -1) {
			switchTrack(englishTrackIndex);
			console.log("Hindi track not found. English track selected.");
		} else {
			switchTrack(defaultTrackIndex);
			console.log(
				"Neither Hindi nor English track found. Default track selected."
			);
		}
	} else {
		console.error("audioTracks API is not supported in this browser");
	}
}

function switchTrack(index) {
	if (video && video.audioTracks) {
		const audioTracks = video.audioTracks;

		// Deselect all audio tracks first
		for (let i = 0; i < audioTracks.length; i++) {
			audioTracks[i].enabled = false;
		}

		// Enable the selected audio track
		audioTracks[index].enabled = true;
		currentAudioIndex = index; // Update current track index
		autoSwitchDone = true; // Mark that auto-switch has been done

		console.log(
			`Switched to track ${index + 1}: ${
        audioTracks[index].label || "Unnamed Track"
      }, Language: ${audioTracks[index].language || "Unknown"}`
		);

		// Sync audio and video without interrupting playback
		syncAudioAndVideo();
	} else {
		console.error("audioTracks API is not supported in this browser");
	}
}

// Sync audio and video without interrupting playback
function syncAudioAndVideo() {
	if (video.readyState >= 2) {
		if (!video.paused) {
			video.currentTime = video.currentTime; // Keep playing without interruption
		} else {
			video.play().catch((error) => console.error("Error playing video:", error));
		}
	} else {
		console.log("Video is not ready, waiting...");
	}
}

// Handle key press for switching tracks
function handleKeyPress(event) {
	if (event.key.toLowerCase() === "b") {
		if (video && video.audioTracks && video.audioTracks.length > 0) {
			currentAudioIndex = (currentAudioIndex + 1) % video.audioTracks.length;
			switchTrack(currentAudioIndex);
		}
	}
}

// Add event listener for key press
document.addEventListener("keydown", handleKeyPress);

// Call this function when video metadata is loaded or when the video source changes
video.addEventListener("loadeddata", populateAudioTracks);

// Handle click on dropdowns to toggle visibility
document.querySelectorAll(".sub-dropdown").forEach((subDropdown) => {
	const subDropdownContent = subDropdown.querySelector(".sub-dropdown-content");

	// Add a click event to toggle visibility
	subDropdown.addEventListener("click", function(e) {
		e.stopPropagation(); // Prevents click event from bubbling up

		const isVisible = subDropdownContent.style.display === "block";

		// Close all sub-dropdowns before toggling the current one
		document
			.querySelectorAll(".sub-dropdown-content")
			.forEach((content) => (content.style.display = "none"));

		// Toggle visibility of the clicked sub-dropdown
		subDropdownContent.style.display = isVisible ? "none" : "block";
	});
});

// Hide dropdown when clicking outside
window.addEventListener("click", function() {
	document
		.querySelectorAll(".sub-dropdown-content")
		.forEach((content) => (content.style.display = "none"));
});

// Show the sub-dropdown content on hover (but not lock it)
document.querySelectorAll(".sub-dropdown").forEach((subDropdown) => {
	const subDropdownContent = subDropdown.querySelector(".sub-dropdown-content");

	// Show on hover
	subDropdown.addEventListener("mouseover", function() {
		if (subDropdownContent.style.display !== "block") {
			// Only show if it's not locked by click
			subDropdownContent.style.display = "block";
		}
	});

	// Hide on mouseout (unless it's locked by click)
	subDropdown.addEventListener("mouseout", function() {
		if (!subDropdown.contains(document.activeElement)) {
			// Don't hide if it's clicked
			subDropdownContent.style.display = "none";
		}
	});
});


// Electron window controls
document.querySelector("#minimize").addEventListener("click", () => {
	window.electron.minimize();
});

document.querySelector("#maximize").addEventListener("click", () => {
	window.electron.maximize();
});

document.querySelector("#windws-close").addEventListener("click", () => {
	window.electron.close();
});

// Handle play/pause action from tray
window.electron.onPlayPause(() => {
	togglePlayPause()
});

// Handle playNext action from tray
window.electron.onNext(() => {
	playNext();
});

// Handle playPrevious action from tray
window.electron.onPrevious(() => {
	playPrevious();
});

// Handle mute action from tray
window.electron.onMute(() => {
	toggleMute();
});

// Handle volume increase action from tray
window.electron.onIncreaseVolume(() => {
	increaseVolume();
});

// Handle volume decrease action from tray
window.electron.onDecreaseVolume(() => {
	decreaseVolume();
});