const video = document.getElementById("media");
const mediaPlayer = document.getElementById("mediaPlayer");
const openFileButton = document.getElementById("openFileButton");
const openFolderButton = document.getElementById("openFolderButton");
const shuffleButton = document.getElementById("shuffleButton");
const gifImageElement = document.getElementById("gifImage");
const rewind = document.getElementById("rewind");
const forward = document.getElementById("forward");
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
const loopBtn = document.getElementById("LoopBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBarContainer = document.getElementById("progressBarContainer");
const progressBarWrapper = document.getElementById("progressBarWrapper");
const progressBar = document.getElementById("progressBar");
const progressHandle = document.getElementById("progressHandle");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");
const pipButton = document.getElementById("pip");
const volumeBtn = document.getElementById("volumeBtn");
const mute = document.querySelectorAll(".mute");
const videoTitleElement = document.getElementById("videoTitle");
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

let currentMedia = video;
let isFullScreen = false;
let isRepeatMode  = false;
let mediaFiles = [];
let playedVideos = [];
let currentVideoIndex = 0;
let currentAudioIndex = 0;
let lastPlayedIndex = -1;
let lastPlayedStack = [];
let autoSwitchDone = false;
let isGifPlaying = false;
let debounceTimeout;
let showRemainingTime = false;
let lastPlaybackTime = 0;
let isUserScrolling = false;
const tooltip = createTooltip();
let tooltipTimeout;
let scrollTimeout;
let currentSpeedIndex = 3;
let videoId;
let hideContinueButtonTimeout;
let hideHandleTimeout;
let isVideoPaused = false;
let isShuffle = false;
let isLooping = false;
const volumeStep = 0.05;
const minFontSize = 18;
const maxFontSize = 36;
let rotationInitiated = false;
let isAppClosing = false;
const defaultFontSize = 16;
let scale = 1;
const zoomLevels = [1.3, 1.5, 2, 2.5, 3, 1];
let currentZoomIndex = 0;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;
const minZoom = 0.25;
const maxZoom = 3;
let recognitionActive = false;
let isMouseOver = false;


// Set tooltips for buttons
shuffleButton.title = "Shuffle";
loopBtn.title = "Repeat";

// ✅ Function to show the temporary status message
function showStatusMessage(text) {
	statusMessage.innerText = text;
	statusMessage.style.opacity = '1';

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
	if (!audioThumbnailExists()) {
		// Check if the audio has a thumbnail
		audioImage.src = src; // Set the logo
		audioImage.style.display = "block"; // Show the logo
	} else {
		console.log("Audio already has a thumbnail; skipping logo update");
	}
}

// Change the logo based on selection from a dropdown
logoOptions.addEventListener("change", function() {
	if (this.value) {
		updateLogo(this.value);
	} else {
		console.error("Invalid selection: no logo source");
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
customLogoInput.addEventListener("change", async function (event) {
    if (!event.target.files.length) {
        console.error("No file selected or invalid file");
        return;
    }

    const file = event.target.files[0];
    event.target.value = ""; // Reset input value to allow re-selecting the same file

    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = async function (e) {
        const fileBuffer = e.target.result;
        const autoSaveLogo = JSON.parse(localStorage.getItem("autoSaveLogo")) || false;

        if (autoSaveLogo) {
            const response = await window.electron.saveCustomLogo(fileBuffer, fileName);
            if (response.success) {
                console.log("GIF saved successfully at:", response.path);
                saveCustomLogo(response.path, fileName);
                loadCustomLogos(); // ✅ Refresh the list
            } else {
                console.error("Failed to save GIF:", response.error);
            }
        } else {
            const { confirmed, autoSave } = await showCustomConfirm();
            if (confirmed) {
                const response = await window.electron.saveCustomLogo(fileBuffer, fileName);
                if (response.success) {
                    console.log("GIF saved successfully at:", response.path);
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

    reader.onerror = function () {
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
    newLogoLink.addEventListener("mouseenter", function () {
        showLogoPreview(filePath);
    });
    newLogoLink.addEventListener("mouseleave", function () {
        hideLogoPreview();
    });

    // Set the uploaded logo as selected when clicked
    newLogoLink.addEventListener("click", function () {
        setSelectedLogo(filePath);
    });

    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-thin", "fa-trash", "delete-icon");

    deleteIcon.addEventListener("click", function () {
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
    logos[fileName] = filePath;  // Store absolute path
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
                console.log(response.message); // Log success message
                
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
    link.addEventListener("mouseenter", function () {
        const logoSrc = this.getAttribute("data-src");
        if (logoSrc) showLogoPreview(logoSrc);
    });

    link.addEventListener("mouseleave", function () {
        hideLogoPreview();
    });

    link.addEventListener("click", function () {
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

// Detect mouse enter/leave events for the playlist container
gifResultsContainer.addEventListener("mouseenter", () => {
	isMouseOver = true;
});
gifResultsContainer.addEventListener("mouseleave", () => {
	isMouseOver = false;
});

gifSearchButton.addEventListener("mouseover",()=>{
	
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

// ✅ Function to load media file
async function loadMediaFile(filePath, fileName) {
    if (!filePath) return;
    try {
        // Normalize path and extract filename
        let fixedPath = filePath.replace(/\\/g, "/");
        const filename = fixedPath.substring(fixedPath.lastIndexOf("/") + 1);
        video.dataset.videoId = filename;

        // Encode only the filename, not the full path
        const encodedFilename = encodeURIComponent(filename);
        const directory = fixedPath.substring(0, fixedPath.lastIndexOf("/") + 1);
        const fileURL = `file://${directory}${encodedFilename}`;
        video.src = fileURL;

        // Detect if the file is video or audio
        const fileExtension = filename.split(".").pop().toLowerCase();
        const videoFormats = ["mp4", "webm", "mkv", "avi", "mov"];
        const audioFormats = ["mp3", "wav", "aac", "ogg", "flac"];

		if (videoFormats.includes(fileExtension)) {
            // If it's a video file
            audioImage.style.display = "none"; // Hide audio logo
            document.getElementById("audioLogo").style.display = "none";
			audioLogoDropdown.style.pointerEvents = "none"; // Disable dropdown
            audioLogoDropdown.style.opacity = "0.5"; // Make it look disabled
        } else if (audioFormats.includes(fileExtension)) {
        	// Show the audio logo when an audio file is played
			document.getElementById("audioLogo").style.display = "block";
			audioImage.style.display = "block";
			loadCustomLogos(); 
			// Enable the logo dropdown for selection
			audioLogoDropdown.style.pointerEvents = "auto";
			audioLogoDropdown.style.opacity = "1";

			// Check if a logo has already been set, if not, select the first logo
			const savedLogo = localStorage.getItem("selectedLogo");
			if (savedLogo) {
				setSelectedLogo(savedLogo); // Apply the saved logo
			} else {
				// Use the first logo as default
				const defaultLogoLinks = document.querySelectorAll(
					"#logoOptions .sub-dropdown-content a[data-src]"
				);
				if (defaultLogoLinks.length > 0) {
					const firstLogoSrc = defaultLogoLinks[0].getAttribute("data-src");
					setSelectedLogo(firstLogoSrc);
				}
			}
		} else {
			// Hide the audio logo when a video file is played
			document.getElementById("audioLogo").style.display = "none";
			audioImage.style.display = "none";
        }

        // Update UI
        updateVideoTitle(fileName);
        gifImageElement.style.display = "none";
        video.style.display = "block";
		
        // Load saved playback time
        const savedPlayback = await window.electron.invoke('load-playback-time', filename);
        lastPlaybackTime = savedPlayback?.time || 0;
        if (lastPlaybackTime > 0) {
            handleContinueButtonVisibility();
        } else {
            video.currentTime = 0;
        }

        // Reset and apply transformations
        video.dataset.rotation = "0";
        applyRotation();
    } catch (error) {
        console.error("❌ Error loading media file:", error);
        return;
    }
}

// ✅ Ensure event listeners are only added once
currentMedia.addEventListener("loadedmetadata", async () => {
	updateProgressBar();
	updateNavigationButtons();
	updateDurationDisplay();
	resetZoom(showStatusMessage(''));
	updateVideoTitle(video.dataset.videoId);
	populateAudioTracks();
	highlightCurrentVideoInPlaylist(video.dataset.videoId);
	// Start from 0 unless "Continue Watching" button is pressed
	video.currentTime = 0;
	video.play().catch(console.error);
});

// ✅ Handle playback ending
currentMedia.addEventListener("ended", () => {
	resetZoom();
	stopPlayback();
	updateNavigationButtons();
	updateProgressBar();
	updateDurationDisplay();
});

// ✅ Get unique video ID
function getVideoId() {
    return video?.dataset?.videoId || null;
}

// ✅ Function to play a media file
function playMediaFile(filePath) {
    if (!filePath) return;

    const fileName = filePath.split(/[/\\]/).pop(); // Get the file name
    loadMediaFile(filePath, fileName); // Load the media file
    updateVideoTitle(fileName); // Update the title with the filename
}

// ✅ Function to play a video by its index
function playVideoByIndex(index) {
    if (index < 0 || index >= mediaFiles.length) return;
    currentVideoIndex = index;
    lastPlayedIndex = index;
    
    const filePath = mediaFiles[index];
    const fileName = filePath.split(/[/\\]/).pop();
    
    loadMediaFile(filePath, fileName);
    highlightCurrentVideoInPlaylist(fileName);
    updateNavigationButtons();
}

video.addEventListener("ended", () => {
    const nextIndex = getNextIndex();
    if (nextIndex !== null) {
        playVideoByIndex(nextIndex);
    } else {
        stopPlayback();
    }
});

// 🟢 Open file dialog (Multiple File Selection)
openFileButton.addEventListener("click", async () => {
    try {
        const filePaths = await window.electron.openFileDialog();
        if (filePaths && filePaths.length > 0) {
            mediaFiles = filePaths;
            currentVideoIndex = 0;
            playMediaFile(mediaFiles[currentVideoIndex]);
            updatePlaylistDropdown();
        }
    } catch (error) {
        console.error("Error opening files:", error);
    }
});


// 🟢 Open folder dialog (Load all media in a folder)
openFolderButton.addEventListener("click", async () => {
    try {
        const folderFiles = await window.electron.openFolderDialog();
        if (folderFiles && folderFiles.length > 0) {
            mediaFiles = folderFiles;
            currentVideoIndex = 0;
            playMediaFile(mediaFiles[currentVideoIndex]);
            updatePlaylistDropdown();
        }
    } catch (error) {
        console.error("Error opening folder:", error);
    }
});

// Functions to toggle play/pause icon
function updatePlayPauseIcon(isPlaying) {
    playPauseBtn.src = isPlaying ? "../assets/icons/pause-.png" : "../assets/icons/play-.png";
    playPauseBtn.setAttribute("alt", isPlaying ? "Pause" : "Play");
    playPauseBtn.setAttribute("title", isPlaying ? "Pause" : "Play");
}

function togglePlayPause() {
	if (video.readyState < 3) {
return;
}
if (video.paused) {
video.play();
hideVideoTitle();
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
playPauseBtn.addEventListener("click", togglePlayPause);
video.addEventListener("play", () => updatePlayPauseIcon(true));
video.addEventListener("pause", () => updatePlayPauseIcon(false));

// ✅ Function to get the next video index
function getNextIndex() {
    if (mediaFiles.length === 0) return null;

    if (isShuffle) {
        let remainingVideos = mediaFiles
            .map((file, index) => ({ file, index }))
            .filter(({ index }) => !playedVideos.includes(index)); // ✅ Ensure videos aren’t repeated

        if (remainingVideos.length > 0) {
            let randomVideo = remainingVideos[Math.floor(Math.random() * remainingVideos.length)];
            return randomVideo.index;
        } else {
            playedVideos = []; // ✅ Reset when all videos are played
            return Math.floor(Math.random() * mediaFiles.length); // Restart shuffle
        }
    }

    let nextIndex = currentVideoIndex + 1;
    return nextIndex < mediaFiles.length ? nextIndex : (isRepeatMode === 2 ? 0 : null);
}


// ✅ Function to get the previous video index
function getPreviousIndex() {
    if (mediaFiles.length === 0) return null;

    if (!isShuffle && lastPlayedStack.length > 0) {
        return lastPlayedStack.pop();
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
        return;
    }

    lastPlayedStack.push(currentVideoIndex); // ✅ Store history for Previous button
    playedVideos.push(currentVideoIndex); // ✅ Store played videos

    currentVideoIndex = nextIndex;
    lastPlayedIndex = nextIndex;

    playVideoByIndex(nextIndex);
    highlightCurrentVideoInPlaylist(mediaFiles[nextIndex]);
    updateNavigationButtons();
    showStatusMessage("Next Video");
}


// ✅ Play previous video correctly
function playPrevious() {
    if (video.duration >= 60 && video.currentTime < video.duration) {
        savePlaybackTime(video.dataset.videoId, video.currentTime);
    }

    if (isShuffle && lastPlayedStack.length > 0) {
        let prevIndex = lastPlayedStack.pop(); // ✅ Retrieve last played video
        playVideoByIndex(prevIndex);
        highlightCurrentVideoInPlaylist(mediaFiles[prevIndex]);
        updateNavigationButtons();
        showStatusMessage("Previous Video");
        return;
    }

    const prevIndex = getPreviousIndex();
    if (prevIndex === null) {
        console.warn("No previous video available.");
        return;
    }

    currentVideoIndex = prevIndex;
    lastPlayedIndex = prevIndex;

    playVideoByIndex(prevIndex);
    highlightCurrentVideoInPlaylist(mediaFiles[prevIndex]);
    updateNavigationButtons();
    showStatusMessage("Previous Video");
}


// ✅ Ensure buttons are updated properly
function updateNavigationButtons() {
    const nextIndex = getNextIndex();
    const prevIndex = getPreviousIndex();

    nextButton.classList.toggle("hidden", nextIndex === null || mediaFiles.length === 0);
    prevButton.classList.toggle("hidden", prevIndex === null || mediaFiles.length === 0);

    // console.log("🔄 Navigation updated | Next:", nextIndex, "| Previous:", prevIndex);
}


// Function to update video title with truncation
function updateVideoTitle(fileName) {
    const videoTitleElement = document.getElementById("videoTitle");

    if (!fileName || typeof fileName !== "string") {
        console.error("Invalid fileName passed to updateVideoTitle:", fileName);
        return;
    }

    if (videoTitleElement) {
        // Remove file extensions (.mp4, .mp3, etc.)
        const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
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

// Function to stop playback and reset the media player
function stopPlayback() {
	video.pause();
	video.src = "";
    updateVideoTitle(video.dataset.videoId);
    updatePlayPauseIcon(false);
	playedVideos = [];
	video.currentTime = 0;
	updateProgressBar();
	currentTimeDisplay.textContent = formatTime(0);
	progressBar.style.width = `0%`;
	progressHandle.style.left = `0%`;
	audioImage.style.display = "none";
	document.getElementById("audioLogo").style.display = "none";
	stopGifPlayback();
	updateNavigationButtons();
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
});

// Add tooltip for rewind button
rewind.setAttribute("title", "Rewind 10 seconds");

forward.addEventListener("click", () => {
	currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
});

// Add tooltip for forward button
forward.setAttribute("title", "Forward 10 seconds");

// Initial button visibility update
updateNavigationButtons();

// ✅ Save playback time
function savePlaybackTime(videoId, time) {
    if (!videoId) return;
    if (time === 0) {
        clearPlaybackTime(videoId);
        return;
    }
    // console.log("✅ Saving playback time:", videoId, time);
    window.electron.send('save-playback-time', time, videoId);
}

// ✅ Clear playback time entry
function clearPlaybackTime(videoId) {
    if (!videoId) return;
    // console.log("🗑️ Clearing playback time for:", videoId);
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
        // console.log("⏳ Continue Watching button auto-hidden");
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
        // console.log("💾 Saving playback time before closing:", videoId, video.currentTime);
        window.electron.send('save-playback-time', video.currentTime, videoId);
    }
});

// ✅ Handle app closing
	window.electron.onAppClosing(async () => {
    const videoId = getVideoId();
    if (videoId && !video.paused && video.duration >= 60) {
        // console.log("💾 Saving playback time before quit:", videoId, video.currentTime);
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
        // console.log("🎬 Resuming playback from:", lastPlaybackTime);
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
        await window.electron.deleteFile(filePath); // Call API from preload.js
        // console.log("🗑️ File moved to Recycle Bin:", filePath);

        // Remove file from playlist and move to next video
        mediaFiles.splice(currentVideoIndex, 1);

        // Update the playlist UI
        updatePlaylistDropdown();

        // Play next file if available
        if (mediaFiles.length > 0) {
            if (currentVideoIndex >= mediaFiles.length) {
                currentVideoIndex = mediaFiles.length - 1;
            }
            playMediaFile(mediaFiles[currentVideoIndex]);
        } else {
            stopPlayback(); // Stop playback if no files left
        }
    } catch (error) {
        console.error("❌ Error deleting file:", error);
    }
}

// ✅ Function to update playlist dropdown dynamically
function updatePlaylistDropdown() {
    const playlistContainers = document.querySelectorAll(".play-list");

    playlistContainers.forEach((playlistContainer) => {
        playlistContainer.innerHTML = "";

        // Create search input field
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Search video...";
        searchInput.style.backgroundColor = "transparent";
        searchInput.style.color = "#fff";
        searchInput.style.paddingLeft = "5px";
        searchInput.style.width = "100%";
        searchInput.style.height = "28px";
        searchInput.style.border = "none";
        searchInput.style.outline = "none";
        searchInput.classList.add("playlist-search");
        searchInput.addEventListener("input", filterPlaylistItems);
        playlistContainer.appendChild(searchInput);

        mediaFiles.forEach((file, index) => {
            const fileName = typeof file === "string" ? file.split(/[/\\]/).pop() : file.name;

            const fileLink = document.createElement("a");
            fileLink.href = "javascript:void(0)";
            fileLink.textContent = fileName;
            fileLink.classList.add("playlist-item");

            fileLink.addEventListener("click", () => {
                playVideoByIndex(index);
                highlightCurrentVideo(fileLink);
            });

            playlistContainer.appendChild(fileLink);
        });

        // Prevent container from closing when clicked inside
        searchInput.addEventListener("click", function(event) {
            event.stopPropagation();
        });

        // Debounce search input
        let debounceTimeout;
        searchInput.addEventListener("input", function() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(filterPlaylistItems, 300);
        });

        // Stop key events from propagating
        searchInput.addEventListener("keydown", function(event) {
            if (document.activeElement === searchInput) {
                event.stopPropagation();
            }
        });
    });

    // ✅ Click outside clears search input and restores playlist
    document.addEventListener("click", function(event) {
        document.querySelectorAll(".play-list").forEach((playlistContainer) => {
            if (!playlistContainer.contains(event.target)) {
                const searchInput = playlistContainer.querySelector(".playlist-search");
                if (searchInput) searchInput.value = ""; // Clear input
                playlistContainer.querySelectorAll(".playlist-item").forEach((item) => {
                    item.style.display = "block"; // Show all items
                });
            }
        });
    });
}

// ✅ Function to filter playlist items based on search input
function filterPlaylistItems(event) {
    const searchQuery = event?.target?.value?.toLowerCase() || "";
    const playlistContainer = event?.target?.closest(".play-list");

    if (!playlistContainer) return;

    playlistContainer.querySelectorAll(".playlist-item").forEach((item) => {
        const fileName = item.textContent.toLowerCase();
        item.style.display = fileName.includes(searchQuery) ? "block" : "none";
    });
}

// ✅ Function to highlight the currently playing video and scroll to it
function highlightCurrentVideo(selectedLink) {
    if (!selectedLink) return;

    // Get the text of the selected item to use as reference
    const selectedText = selectedLink.textContent.trim();

    // Remove highlight from previous selections
    document.querySelectorAll(".play-list .highlight").forEach((item) => {
        item.classList.remove("highlight");
    });

    // Find and highlight matching items in all playlist containers
    document.querySelectorAll(".play-list .playlist-item").forEach((item) => {
        if (item.textContent.trim() === selectedText) {
            item.classList.add("highlight");

            // Auto-scroll to the highlighted item if the user isn't scrolling
            if (!isUserScrolling) {
                item.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    });
}

// ✅ Auto-scroll to the current video in the playlist if the user isn't interacting
function highlightCurrentVideoInPlaylist(fileName) {
    document.querySelectorAll(".play-list .playlist-item").forEach((item) => {
        if (item.textContent === fileName) {
            highlightCurrentVideo(item);
        }
    });
}

// ✅ Auto-scroll logic: checks and scrolls every second
setInterval(() => {
    const highlightedItem = document.querySelector(".play-list .highlight");
    if (highlightedItem && !isUserScrolling) {
        highlightedItem.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }
}, 1000); // Check every second

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

// playlist Container show
function togglePlaylist() {
    const playlistContainer = document.querySelector(".playlist-container");
    const playlistItems = playlistContainer.querySelectorAll(".playlist-item");

    // Check if there are any items in the playlist
    if (playlistItems.length === 0) {
        // Show message if playlist is empty
        showStatusMessage("No videos in the playlist.") 
        playlistContainer.classList.remove("show");
    } else {
        // Toggle playlist visibility only if it has items
        playlistContainer.classList.toggle("show");
    }
}

// ✅ Hide dropdown and clear search input when clicking outside
window.addEventListener("click", function (event) {
    const playlistContainer = document.querySelector(".playlist-container");
    if (!playlistContainer.contains(event.target)) {
        playlistContainer.classList.remove("show");
    }
});

document.addEventListener("keydown", function (event) {
    const playlistContainer = document.querySelector(".playlist-container");
    const isPlaylistVisible = playlistContainer.classList.contains("show");

    if (isPlaylistVisible) {
        // Playlist navigation when visible
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
    } else {
        // Adjust volume when playlist is hidden
        if (event.key === "ArrowUp") {
            event.preventDefault();
            updateVolume(gainNode.gain.value + 0.05);
            showStatusMessage(`Volume: ${(gainNode.gain.value * 100).toFixed(0)}%`);
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            updateVolume(gainNode.gain.value - 0.05);
            showStatusMessage(`Volume: ${(gainNode.gain.value * 100).toFixed(0)}%`);
        }
    }
});

// Function to set playback speed
function setPlaybackSpeed(speed) {
	video.playbackRate = speed;
}

// Add click event listeners to each speed option
playbackSpeedLinks.forEach(link => {
	link.addEventListener("click", () => {
		const speedText = link.textContent; // Get the text content of the clicked link
		let speed;

		// Determine the playback speed based on the link text
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

		// Set the playback speed
		setPlaybackSpeed(speed);

		// Optional: Highlight the selected speed
		playbackSpeedLinks.forEach(l => l.classList.remove("selected")); // Remove selected class from all
		link.classList.add("selected"); // Add selected class to the clicked link
	});
});

// Optional: Initialize to normal speed
setPlaybackSpeed(1); // Default to normal playback speed


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
midBoostFilter.gain.setValueAtTime(4, audioContext.currentTime); // Boost mid-range frequencies by 4 dB (reduced)

// Set compressor parameters for vocal clarity (updated for softer compression)
compressor.threshold.setValueAtTime(-40, audioContext.currentTime); // Lower threshold for more subtle compression
compressor.knee.setValueAtTime(28, audioContext.currentTime); // Moderate knee
compressor.ratio.setValueAtTime(3, audioContext.currentTime); // Softer compression ratio
compressor.attack.setValueAtTime(0.01, audioContext.currentTime); // Fast attack time
compressor.release.setValueAtTime(0.1, audioContext.currentTime); // Quick release time

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
function monitorAudioLevels() {
	audioAnalyser.getByteTimeDomainData(timeDomainData); // Get the waveform data from the analyser

	// Calculate the root mean square (RMS) value to estimate audio loudness
	let sum = 0;
	for (let i = 0; i < bufferLength; i++) {
		let sample = timeDomainData[i] / 128 - 1.0; // Normalize the data between -1.0 and 1.0
		sum += sample * sample;
	}
	const rms = Math.sqrt(sum / bufferLength); // Calculate RMS

	// Check if RMS level is above a threshold (e.g., 0.7 indicates loud audio)
	if (rms > 0.7) {
		// Reduce the volume gradually to protect from loud audio
		let newVolume = Math.max(0, gainNode.gain.value - 0.1); // Decrease volume smoothly
		gainNode.gain.linearRampToValueAtTime(
			newVolume,
			audioContext.currentTime + 0.1
		);
	}

	// Call this function repeatedly for real-time monitoring
	requestAnimationFrame(monitorAudioLevels);
}

// Start monitoring audio levels when the video is played
videoElement.addEventListener("play", () => {
	monitorAudioLevels(); // Start monitoring when video playback begins
});

// Function to save volume to localStorage (existing)
function saveVolumeSetting(volume) {
	localStorage.setItem("volumeSetting", volume);
}

// Function to load volume from localStorage (existing)
function loadVolumeSetting() {
	const savedVolume = localStorage.getItem("volumeSetting");
	if (savedVolume) {
		updateVolume(parseFloat(savedVolume)); // Update volume based on saved value
	} else {
		updateVolume(1.0); // Set default to 100% volume if no saved value
	}
}


// Set initial volume (existing)
gainNode.gain.value = 1.0; // Set default volume to 100%
volumeSlider.value = gainNode.gain.value * 100; // Sync slider with volume (0-200 range)

// Call the loadVolumeSetting to apply saved or default volume
loadVolumeSetting(); // Load saved volume or apply default volume (100%)

// Function to update volume, slider, and tooltip (existing)
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

	// Update volume button icon and tooltip
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

// Attach event listener for volume updates
volumeSlider.addEventListener("input", (event) => {
    updateVolume(event.target.value / 100);
    showTooltip(gainNode.gain.value);
});

volumeSlider.addEventListener("mouseenter", () => {
    showTooltip(gainNode.gain.value);
});

volumeSlider.addEventListener("mouseleave", () => {
    tooltipTimeout = setTimeout(() => {
        tooltip.style.opacity = "0";
    }, 1000);
});

// Volume adjustment using mouse wheel
volumeSlider.addEventListener("wheel", (e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -0.05 : 0.05;
    let newVolume = gainNode.gain.value + direction;
    newVolume = Math.max(0, Math.min(newVolume, 2));

    updateVolume(newVolume);
    showTooltip(newVolume, e);
});

// Initialize tooltip for font size
const fontSizeTooltip = document.createElement("div");
fontSizeTooltip.style.position = "absolute";
fontSizeTooltip.style.top = "60px";
fontSizeTooltip.style.right = "25px";
fontSizeTooltip.style.color = "white";
fontSizeTooltip.style.padding = "5px 10px";
fontSizeTooltip.style.borderRadius = "5px";
fontSizeTooltip.style.zIndex = "1000";
fontSizeTooltip.style.display = "none"; // Initially hidden
mediaPlayer.appendChild(fontSizeTooltip);

let fontSize = loadFontSize() || defaultFontSize;

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
		saveFontSize(fontSize);

		const fontSizePercentage = Math.round(((fontSize - minFontSize) / (maxFontSize - minFontSize)) * 100);
		fontSizeTooltip.textContent = `Text size: ${fontSizePercentage}%`;
		fontSizeTooltip.style.display = "block";

		setTimeout(() => {
			fontSizeTooltip.style.display = "none";
		}, 1500);

	} else {
		// Adjust volume
		if (event.deltaY < 0) {
			updateVolume(Math.min(2, gainNode.gain.value + 0.05)); // Increase volume up to 200%
		} else if (event.deltaY > 0) {
			updateVolume(Math.max(0, gainNode.gain.value - 0.05)); // Decrease volume
		}

		tooltip.style.left = `${event.pageX}px`;
		tooltip.style.top = `${event.pageY - 30}px`;
		tooltip.textContent = `Volume: ${(gainNode.gain.value * 100).toFixed(0)}%`;
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
		gainNode.gain.value = 0; // Mute
		volumeSlider.value = 0; // Update the slider to 0
	} else {
		gainNode.gain.value = previousVolume; // Restore volume
		volumeSlider.value = previousVolume * 100; // Restore slider value (adjust scale if needed)
	}

	// Update the icon and tooltip based on the current volume
	updateVolumeIcon();
});

// Mute/Unmute functionality for multiple buttons
mute.forEach((muteButton) => {
    muteButton.addEventListener("click", () => {
        if (muteButton.textContent.trim() === "Mute") {
            muteButton.textContent = "Unmute"; // Update button text
            previousVolume = gainNode.gain.value; // Store the current volume
            gainNode.gain.value = 0; // Mute the volume
            updateVolume(0); // Update volume display
            volumeSlider.value = 0; // Set slider to 0
        } else {
            muteButton.textContent = "Mute"; // Update button text
            gainNode.gain.value = previousVolume; // Restore the previous volume
            updateVolume(previousVolume); // Update volume display
            volumeSlider.value = previousVolume * 100; // Restore slider value
        }

        // Update the icon to reflect the new state
        updateVolumeIcon();
    });
});

// Zoom functionality (CTRL + Shift + Mouse Wheel)
// Handle zoom separately
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

// Toggle shuffle mode and show status
function toggleShuffleMode() {
    isShuffle = !isShuffle;

    if (isShuffle) {
        shuffleButton.classList.add("active");
        shuffleButton.src = "../assets/icons/shuffle.png"; 
        showStatusMessage("Shuffle: On");
        shuffleButton.title = "Shuffle off";
        window.electron.sendShuffleState("on");
    } else {
        shuffleButton.classList.remove("active");
        shuffleButton.src = "../assets/icons/no-shuffle.png"; 
        showStatusMessage("Shuffle: Off");
        shuffleButton.title = "Shuffle";
        playedVideos = [];
        lastPlayedStack = [];
        window.electron.sendShuffleState("off");
    }
}

// Toggle repeat mode and show status
function toggleRepeat() {
    // 0 = Off, 1 = Loop One, 2 = Loop All
    isRepeatMode = (isRepeatMode + 1) % 3;

    if (isRepeatMode === 0) {
        currentMedia.loop = false;
        showStatusMessage("Loop: Off");
        loopBtn.src = "../assets/icons/repeat-on.png";
        loopBtn.title = "Loop one";
        window.electron.sendRepeatState("off");
    } else if (isRepeatMode === 1) {
        currentMedia.loop = true; // Loop only one video
        showStatusMessage("Loop: One");
        loopBtn.src = "../assets/icons/repeat-one.png";
        loopBtn.title = "Loop All";
        window.electron.sendRepeatState("one");
    } else if (isRepeatMode === 2) {
        currentMedia.loop = false; // Handled manually in playNext
        showStatusMessage("Loop: All");
        loopBtn.src = "../assets/icons/repeat-on.png";
        loopBtn.title = "Loop off";
        window.electron.sendRepeatState("all");
    }
}

// Event listener for shuffle mode button loopbutton, switchtrack button and Full screen 
document.getElementById("shuffleButton").addEventListener("click", toggleShuffleMode);
loopBtn.addEventListener("click", toggleRepeat);

// Select the full-screen button elements
const fullscreenButtons = document.querySelectorAll(".fullscreenBtn");

// Function to update the fullscreen button UI
function updateFullScreenUI(isFullscreen) {
    fullscreenButtons.forEach((button) => {
        const img = button.querySelector("img");
        if (img) {
            img.src = isFullscreen 
                ? "../assets/icons/exit-full-screen.png" 
                : "../assets/icons/full-screen.png"; 
        }
        // Update the tooltip (title) based on fullscreen state
        button.title = isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen";
    });
}

// Fullscreen toggle function
function toggleFullScreen() {
    window.electron.toggleFullscreen(); // Notify the main process to toggle fullscreen
}

// Add event listeners for full-screen buttons
fullscreenButtons.forEach((element) => {
    element.addEventListener("click", () => {
        toggleFullScreen();
    });

    // Set initial title
    element.title = "Enter Fullscreen";
});


// Add double-click event listener to the media player
mediaPlayer.addEventListener("dblclick", toggleFullScreen);

// Listen for fullscreen change events
document.addEventListener("fullscreenchange", () => {
	const isFullscreen = document.fullscreenElement !== null;
	updateFullScreenUI(isFullscreen);
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

// Set initial tooltip
pipButton.title = "Enter Picture-in-Picture";

document.addEventListener("DOMContentLoaded", function() {
	const navbar = document.querySelector("nav");
	const Mediacontrols = document.querySelector(".controls");
	const video = document.querySelector("video");
	const navArrows = document.querySelector(".nav-arrows");
	const winButton = document.querySelector(".win-buttons");
	const progress = document.querySelector(".progress");
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

			progress.classList.remove("visible");
			progress.classList.add("hidden");
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

		progress.classList.remove("hidden");
		progress.classList.add("visible");

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

	// Function to show the context menu
	function showContextMenu(event) {
		event.preventDefault();
	
		const { clientX: mouseX, clientY: mouseY } = event;
		const { innerWidth: screenWidth, innerHeight: screenHeight } = window;
	
		// Get the context menu dimensions
		const contextMenuHeight = contextMenu.offsetHeight;
		const contextMenuWidth = contextMenu.offsetWidth;
	
		// Calculate the position dynamically
		let top = mouseY;
		let left = mouseX;
	
		// Adjust if the menu would overflow the bottom of the screen
		if (mouseY + contextMenuHeight > screenHeight) {
			top = screenHeight - contextMenuHeight; // Position to fit within the screen
		}
	
		// Adjust if the menu would overflow the right of the screen
		if (mouseX + contextMenuWidth > screenWidth) {
			left = screenWidth - contextMenuWidth; // Position to fit within the screen
		}
	
		// Set the calculated position and display the menu
		contextMenu.style.top = `${top}px`;
		contextMenu.style.left = `${left}px`;
		contextMenu.style.display = "block";
	
		updateContextTogglePlayPause(); // Update the context menu state
	}
	
		// Function to hide the context menu
		function hideContextMenu() {
			contextMenu.style.display = "none";
		}
	
		// Attach event listener to mediaPlayer to show context menu
		mediaPlayer.addEventListener("contextmenu", showContextMenu);
	
		// Hide the context menu when clicking elsewhere
		document.addEventListener("click", hideContextMenu);
	
		// Function to update the context menu toggle play/pause item based on video state
		function updateContextTogglePlayPause() {
			const contextTogglePlayPause = document.querySelector("#contextTogglePlayPause");
			const textElement = contextTogglePlayPause.querySelector(".text");
			const iconElement = contextTogglePlayPause.querySelector(".icon");
	
			if (video.paused) {
				textElement.innerText = "Play";
				iconElement.innerHTML = "&#9658;";
			} else {
				textElement.innerText = "Pause";
				iconElement.innerHTML = "&#10074;&#10074;";
			}
		}
		
	// Handle context menu item clicks
	contextMenuItems.forEach((item) => {
		item.addEventListener("click", (event) => {
			const target = event.target;

			if (target.closest("#contextOpenFile")) {
				openFileButton.click();
			} else if (target.closest("#contextOpenFolder")) {
				openFolderButton.click();
			} else if (target.closest("#contextTogglePlayPause")) {
				togglePlayPause(); // Call the toggle function
			}
			hideContextMenu(); // Hide context menu after clicking an item
		});
	});

	window.electron.onFullscreenStateChanged((isFullscreen) => {
        updateFullScreenUI(isFullscreen);
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

// ✅ Update the progress bar and handle position
function updateProgressBar() {
	if (video && video.duration && !isNaN(video.duration)) {
		const progress = (video.currentTime / video.duration) * 100;
		progressBar.style.width = `${progress}%`;
		progressHandle.style.left = `${progress}%`;
		currentTimeDisplay.textContent = formatTime(video.currentTime);
		progressHandle.style.display = "block";
	} else {
		progressHandle.style.display = "none";
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

// Sync the progress bar and duration display when the video is playing
video.addEventListener("timeupdate", () => {
	updateProgressBar();
	updateDurationDisplay();
});

durationDisplay.addEventListener("click", () => {
	showRemainingTime = !showRemainingTime;
	updateDurationDisplay();
});

progressBarWrapper.addEventListener("click", (e) => {
	const rect = progressBarWrapper.getBoundingClientRect();
	const posX = e.clientX - rect.left;
	const percentage = posX / rect.width;
	video.currentTime = percentage * video.duration;
	updateProgressBar();
});

// Handle dragging for smoother seeking
let isDragging = false;
let temporaryTime = 0;

function updateDragging(e) {
	if (isDragging) {
		const rect = progressBarWrapper.getBoundingClientRect();
		const posX = e.clientX - rect.left;
		const percentage = Math.min(Math.max(posX / rect.width, 0), 1);
		progressBar.style.width = `${percentage * 100}%`;
		progressHandle.style.left = `${percentage * 100}%`;
		currentTimeDisplay.textContent = formatTime(percentage * video.duration);
	}
}

progressHandle.addEventListener("mousedown", (e) => {
	e.preventDefault();
	isDragging = true;
	document.addEventListener("mousemove", updateDragging);
});

document.addEventListener("mouseup", () => {
	if (isDragging) {
		isDragging = false;
		document.removeEventListener("mousemove", updateDragging);
		const rect = progressBarWrapper.getBoundingClientRect();
		const percentage = parseFloat(progressBar.style.width) / 100;
		video.currentTime = percentage * video.duration; // Update video time only after dragging ends
		updateProgressBar();
	}
});

progressBarWrapper.addEventListener("wheel", (e) => {
	e.preventDefault();
	if (video && video.duration && !isNaN(video.duration)) {
		const step = 10;
		const direction = e.deltaY > 0 ? -1 : 1;
		let newTime = video.currentTime + direction * step;
		newTime = Math.max(0, Math.min(newTime, video.duration));
		video.currentTime = newTime;
	}
});

// ✅ Allow progressBarWrapper scrolling when mouse is over it
progressBarWrapper.addEventListener("wheel", (event) => {
	if (isMouseOver) {
		event.stopPropagation();
	}
});

// Detect mouse enter/leave events for the progressBarWrapper container
progressBarWrapper.addEventListener("mouseenter", () => {
	isMouseOver = true;
});
progressBarWrapper.addEventListener("mouseleave", () => {
	isMouseOver = false;
});

// Update progress bar and current time display
updateProgressBar();
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


// Player Shortcut
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

	if (event.ctrlKey && event.key === "/") {
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

	if (event.ctrlKey && event.key === "d") {
        event.preventDefault();
        deleteCurrentMediaFile();
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
		t: () => {
			showStatusMessage(
				`${formatTime(currentMedia.currentTime)} /${formatTime(currentMedia.duration)}`
			); // Show current time and total duration
		},
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
			deleteCurrentMediaFile();		}
	};

	if (keyActions[event.key]) {
		keyActions[event.key]();
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

// Toggle the modal Shortcuts and Search Shortcuts
const shortcuts = document.querySelectorAll('.shortcut');
const keyboardTab = document.getElementById('keyboardTab');
const voiceTab = document.getElementById('voiceTab');
const keyboardShortcuts = document.getElementById('keyboardShortcuts');
const voiceShortcuts = document.getElementById('voiceShortcuts');
const searchInput = document.getElementById('shortcutSearch');

// Handle tab click
keyboardTab.addEventListener('click', () => {
	keyboardTab.classList.add('active-tab');
	voiceTab.classList.remove('active-tab');
	keyboardShortcuts.style.display = 'grid';
	voiceShortcuts.style.display = 'none';
});

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

function populateAudioTracks() {
	const audioTrackLists = document.querySelectorAll(".audio-track-list");
	audioTrackLists.forEach((audioTrackList) => {
		audioTrackList.innerHTML = ""; // Clear any existing content

		if (video && video.audioTracks) {
			const audioTracks = video.audioTracks;
			// console.log("Available audio tracks:", audioTracks.length);

			if (audioTracks.length === 1) {
				// Only one track, no need to switch
				// console.log("Only one audio track available. No need to switch.");
				const track = audioTracks[0];

				// Create a list item for the single track
				const trackItem = document.createElement("a");
				trackItem.href = "javascript:void(0)";
				trackItem.textContent = `${track.label || "Track"} ${track.language || "1"}`;
				trackItem.className = "track-item";

				audioTrackList.appendChild(trackItem);

				// Enable the single audio track
				audioTracks[0].enabled = true;
				currentAudioIndex = 0; // Set the current track index
				autoSwitchDone = true; // Mark that auto-switch has been done

				// console.log(Single audio track selected: ${ track.label || "Unnamed Track" }, Language: ${track.language || "Unknown"}`);
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
				trackItem.textContent = `${track.label || "Track"} ${track.language || "1"}`;
				trackItem.className = "track-item";
				trackItem.onclick = () => switchTrack(i); // Add click handler

				audioTrackList.appendChild(trackItem);
			}

			// Switch to Hindi track if found, otherwise fallback to English, otherwise default to the first track
			if (hindiTrackIndex !== -1) {
				switchTrack(hindiTrackIndex);
				// console.log("Hindi track found and selected.");
			} else if (englishTrackIndex !== -1) {
				switchTrack(englishTrackIndex);
				// console.log("Hindi track not found. English track selected.");
			} else {
				switchTrack(defaultTrackIndex);
				// console.log("Neither Hindi nor English track found. Default track selected.");
			}
		} else {
			console.error("audioTracks API is not supported in this browser");
		}
	});
}

function switchTrack(index) {
	if (video && video.audioTracks) {
		const audioTracks = video.audioTracks;
		const audioTrackLists = document.querySelectorAll(".audio-track-list");

		// Deselect all audio tracks and remove highlight from all items
		for (let i = 0; i < audioTracks.length; i++) {
			audioTracks[i].enabled = false;

			audioTrackLists.forEach((audioTrackList) => {
				const trackItems = audioTrackList.querySelectorAll(".track-item");
				if (trackItems[i]) {
					trackItems[i].classList.remove("selected-track");
				}
			});
		}

		// Enable the selected audio track
		audioTracks[index].enabled = true;
		currentAudioIndex = index; // Update current track index
		autoSwitchDone = true; // Mark that auto-switch has been done

		// Highlight the selected track
		audioTrackLists.forEach((audioTrackList) => {
			const trackItems = audioTrackList.querySelectorAll(".track-item");
			if (trackItems[index]) {
				trackItems[index].classList.add("selected-track");
			}
		});

		// Get the label and language of the selected track
		const track = audioTracks[index];
		const trackName = track.label || "Track ";
		const trackLanguage = track.language || "1";

		// Display the status message with track name and language
		showStatusMessage(`${trackName} - ${trackLanguage}`);
		// console.log(Switched to track ${index + 1}: ${audioTracks[index].label || "Unnamed Track" );

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
			video
				.play()
				.catch((error) => console.error("Error playing video:", error));
		}
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

// Electron window controls
document.querySelector("#minimize").addEventListener("click", () => {
	window.electron.minimize();
});

document.querySelector("#maximize").addEventListener("click", () => {
	window.electron.maximize();
});

// Function to update the maximize button icon
function updateMaximizeIcon(isFullScreen) {
    const maximizeIcon = document.querySelector("#maximize img");
    if (maximizeIcon) {
        maximizeIcon.src = isFullScreen
            ? "../assets/icons/win/restore-maximize.png"
            : "../assets/icons/win/maximize.png";
    }
}


  // Listen for fullscreen state changes
window.electron.onWindowStateChange(updateMaximizeIcon);

  // Set the correct icon when the app starts
window.electron.onInitialWindowState(updateMaximizeIcon);

document.querySelector("#window-close").addEventListener("click", () => {
	savePlaybackAndQuit();
});


// Show loader
function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "block";
}

// Hide loader
function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
}

// ✅ Handle File Open from System (Double-click on a file)
document.addEventListener("DOMContentLoaded", () => {
    window.electron.onFileOpen((filePath) => {
        if (filePath) {
            loadMediaFile(filePath, filePath.split("/").pop());
        }
    });
});

window.electron.onDownloadProgress((percent) => {
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.querySelector('.progress');

if (progressContainer) {
  progressContainer.style.display = 'block'; // Show progress bar
}

if (progressBar) {
progressBar.style.width = `${percent}%`;
}
});

window.electron.showProgressBar = () => {
document.querySelector('.progress').style.display = 'block';
};

window.electron.hideProgressBar = () => {
document.querySelector('.progress').style.display = 'none';
}

// Handle actions from tray
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
window.electron.onRepeatState(() => {
	toggleRepeat();
});