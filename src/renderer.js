const mediaPlayer = document.getElementById("mediaPlayer");
const fileInput = document.getElementById("fileInput");
const folderInput = document.getElementById("folderInput");
const CSOInput = document.getElementById("CSOInput");
const shuffleButton = document.getElementById("shuffleButton");
const Ofile = document.getElementById("Ofile");
const folder = document.getElementById("folder");
const CSO = document.getElementById("CSO");
const video = document.getElementById("media");
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

// // Web Speech API initialization
// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// const recognition = new SpeechRecognition();
// recognition.lang = "en-IN" || "en-US"; // Set language to English (IN)
// recognition.interimResults = true; // Enable interim results for faster feedback
// recognition.maxAlternatives = 1; // Limit to one alternative result
// recognition.continuous = true; // Single recognition to reduce latency

// // Web Audio API for volume detection
// const webaudioContext = new(window.AudioContext)();
// let microphone;
// let analyser;
// let dataArray;
// let volumeWarningIssued = false;
// let isMicrophoneEnabled = false; // Initialize microphone status

// // Function to setup the microphone and analyser
// async function setupMicrophone() {
// 	try {
// 		const stream = await navigator.mediaDevices.getUserMedia({
// 			audio: true
// 		});
// 		microphone = webaudioContext.createMediaStreamSource(stream);
// 		analyser = webaudioContext.createAnalyser();
// 		microphone.connect(analyser);
// 		analyser.fftSize = 2048;
// 		dataArray = new Uint8Array(analyser.frequencyBinCount);

// 		// Start checking the voice volume after setup
// 		checkVoiceVolume();
// 		isMicrophoneEnabled = true; // Set the microphone status to enabled
// 		updateMicButtonText(); // Update button text
// 		startRecognition(); // Start recognition after microphone setup
// 	} catch (error) {
// 		// console.error("Error accessing microphone:", error);
// 		alert("Microphone access is required for voice commands. Please allow access in your browser settings.");
// 	}
// }

// // Function to request or stop microphone access
// async function toggleMicrophoneAccess() {
// 	if (isMicrophoneEnabled) {
// 		// Stop microphone access
// 		stopRecognition(); // Stop recognition if it’s running
// 		if (microphone) {
// 			microphone.disconnect(); // Disconnect the microphone
// 			microphone = null;
// 		}
// 		if (analyser) {
// 			analyser = null;
// 		}
// 		isMicrophoneEnabled = false; // Update the status
// 	} else {
// 		// Request microphone access
// 		await setupMicrophone(); // Call the setup function
// 	}

// 	// Update the button text after toggling
// 	updateMicButtonText(); // Update the button text
// }

// // Function to update the button text based on microphone status
// function updateMicButtonText() {
// 	const permissionButton = document.getElementById("mic-access-button");
// 	permissionButton.textContent = isMicrophoneEnabled ? "Disable Microphone" : "Enable Microphone";
// }

// // Function to monitor voice volume and provide feedback if too low
// function checkVoiceVolume() {
// 	if (!analyser) return; // Skip if analyser is not set up

// 	analyser.getByteFrequencyData(dataArray);
// 	const averageVolume =
// 		dataArray.reduce((sum, value) => sum + value) / dataArray.length;

// 	// Example threshold for low volume; adjust based on testing
// 	if (averageVolume < 10 && !volumeWarningIssued) {
// 		displayVolumeWarning(); // Function to visually notify the user
// 		volumeWarningIssued = true; // Prevent repeated warnings
// 	} else if (averageVolume >= 20) {
// 		hideVolumeWarning(); // Hide warning if volume is adequate
// 		volumeWarningIssued = false;
// 	}

// 	requestAnimationFrame(checkVoiceVolume); // Continuously check volume
// }

// // Function to display a warning to the user
// function displayVolumeWarning() {
// 	const warningElement = document.getElementById("volume-warning");
// 	if (warningElement) {
// 		warningElement.style.display = "block";
// 	}
// }

// // Function to hide the volume warning
// function hideVolumeWarning() {
// 	const warningElement = document.getElementById("volume-warning");
// 	if (warningElement) {
// 		warningElement.style.display = "none";
// 	}
// }

// // Start listening for voice commands
// function startRecognition() {
// 	if (recognition && !recognition.recognizing) {
// 		recognition.start();
// 	}
// }

// // Stop listening for voice commands
// function stopRecognition() {
// 	if (recognition && recognition.recognizing) {
// 		recognition.stop();
// 	}
// }

// // Add a flag to track recognition state
// recognition.recognizing = false;

// // Update recognition state on start and end events
// recognition.addEventListener("start", () => {
// 	// console.log("Speech recognition service has started.");
// 	recognition.recognizing = true; // Set the flag to true
// });

// recognition.addEventListener("end", () => {
// 	// console.log("Speech recognition service has stopped.");
// 	recognition.recognizing = false; // Set the flag to false
// 	// Automatically restart recognition if the microphone is enabled
// 	if (isMicrophoneEnabled) {
// 		startRecognition();
// 	}
// });

// const commandMap = {
// 	"play": () => {
// 		if (video.paused) {
// 			video.play();
// 			hideVideoTitle();
// 			updatePlayPauseIcon(true);
// 		}
// 	},
// 	"start": () => {
// 		if (video.paused) {
// 			video.play();
// 			hideVideoTitle();
// 			updatePlayPauseIcon(true);
// 		}
// 	},
// 	"stop": () => {
// 		if (!video.paused) {
// 			video.pause();
// 			showVideoTitle();
// 			updatePlayPauseIcon(false);
// 		}
// 	},
// 	"pause": () => {
// 		if (!video.paused) {
// 			video.pause();
// 			showVideoTitle();
// 			updatePlayPauseIcon(false);
// 		}
// 	},
// 	"next":playNext,
// 	"back":playPrevious,
// 	"previous": playPrevious,
// 	"repeat": toggleRepeat,
// 	"loop": toggleRepeat,
// 	"repeat off": toggleRepeat,
// 	"loop off": toggleRepeat,
// 	"shuffle": toggleShuffleMode,
// 	"shuffle off": toggleShuffleMode,
// 	"shortcuts": toggleShortcutsInfoBox,
// 	"shortcuts close": toggleShortcutsInfoBox,
// 	"shortcut": toggleShortcutsInfoBox,
// 	"shortcut close": toggleShortcutsInfoBox,
// 	"full screen": toggleFullScreen,
// 	"exit full screen": toggleFullScreen,
// 	"mini screen": togglePiPMode,
// 	"exit": togglePiPMode,
// 	"exit mini screen": togglePiPMode,
// 	"refresh": () => {
// 		location.reload();
// 	},
// 	"open file": () => {
// 		CSOInput.click();
// 	},
// 	"loud": () => {
// 		updateVolume(gainNode.gain.value + 0.1);
// 		updateVolumeIcon();
// 	},
// 	"volume up": () => {
// 		updateVolume(gainNode.gain.value + 0.1);
// 		updateVolumeIcon();
// 	},
// 	"volume down": () => {
// 		updateVolume(gainNode.gain.value - 0.1);
// 		updateVolumeIcon();
// 	},
// 	"volume low": () => {
// 		updateVolume(gainNode.gain.value = 0.2);
// 		updateVolumeIcon();
// 	},
// 	"low volume": () => {
// 		updateVolume(gainNode.gain.value = 0.2);
// 		updateVolumeIcon();
// 	},
// 	"mute": () => {
// 		updateVolume(gainNode.gain.value = 0);
// 		updateVolumeIcon();		
// 		volumeSlider.value = 0; 
// 	},
// 	"default volume": () => {
// 		updateVolume(gainNode.gain.value = 1.0);
// 		updateVolumeIcon();
// 	},
// 	"medium volume": () => {
// 		updateVolume(gainNode.gain.value = 0.7);
// 		updateVolumeIcon();
// 	},
// 	"max volume": () => {
// 		updateVolume(gainNode.gain.value = 1.5);
// 	},
// 	'rewind': () => {
// 		video.currentTime = Math.max(0, video.currentTime - 10);
// 	},
// 	"forward": () => {
// 		video.currentTime = Math.min(video.duration, video.currentTime + 10);
// 	},
// 	"speed up": () => {
// 		if (video.playbackRate < 2) {
// 			const newSpeed = video.playbackRate + 0.25;
// 			setPlaybackSpeed(newSpeed);
// 			showStatusMessage(newSpeed === 1 ? "Normal" : `Speed: ${newSpeed}x`);
// 		}
// 	},
// 	"double speed": () => {
// 		if (video.playbackRate < 2) {
// 			const newSpeed = video.playbackRate + 1.0;
// 			setPlaybackSpeed(newSpeed);
// 			showStatusMessage(newSpeed === 1 ? "Normal" : `Speed: ${newSpeed}x`);
// 		}
// 	},
// 	"slow down": () => {
// 		if (video.playbackRate > 0.25) {
// 			const newSpeed = video.playbackRate - 0.25;
// 			setPlaybackSpeed(newSpeed);
// 			showStatusMessage(newSpeed === 1 ? "Normal" : `Speed: ${newSpeed}x`);
// 		}
// 	},
// 	"normal speed": () => {
// 		setPlaybackSpeed(1);
// 		showStatusMessage("Normal");
// 	},
// 	"landscape": () => {
// 		rotateVideo(-90);
// 		showStatusMessage("Landscape mode");
// 	},
// 	"portrait": () => {
// 		rotateVideo(0);
// 		showStatusMessage("Portrait mode");
// 	},
// 	"magnify": () => {
// 		currentZoomIndex = (currentZoomIndex + 1) % zoomLevels.length;
// 		scale = zoomLevels[currentZoomIndex];
// 		video.style.transform = `scale(${scale})`;
// 		video.style.transformOrigin = "center center";
// 		const zoomPercentage = Math.round(scale * 100);
// 		showStatusMessage(`Zoom: ${zoomPercentage}%`);
// 	},
// 	"continue": () => {
// 		let lastPlaybackTime = getPlaybackTimeFromCache(videoId); // Load from local storage
// 		if (lastPlaybackTime > 0) {
// 			video.currentTime = lastPlaybackTime; // Resume from last saved playback time
// 			video.play(); // Start playing the video
// 			document.getElementById("continueButton").style.display = "none"; // Hide the "Continue" button
// 			clearCache(videoId); // Clear the playback cache after continuing
// 		}
// 	},

// 	"restart": () => {
// 		currentMedia.currentTime = 0;
// 		currentMedia.play();
// 	},
// 	"close": () => {
// 		window.close();
// 	}
// };

// // Modified recognition result event handler to limit multiple command processing
// recognition.addEventListener("result", (event) => {
// 	if (commandProcessed) return; // Exit if a command has recently been processed

// 	for (let i = event.resultIndex; i < event.results.length; ++i) {
// 		const transcript = event.results[i][0].transcript.trim().toLowerCase();
// 		// console.log("Recognized command:", transcript);

// 		// Execute the command if it exists in the command map
// 		for (const command in commandMap) {
// 			if (transcript.includes(command)) {
// 				commandMap[command]();
// 				commandProcessed = true; // Set flag to prevent multiple processing

// 				// Stop recognition to prevent further triggers
// 				stopRecognition();

// 				// Reset the commandProcessed flag and restart recognition after a short delay
// 				setTimeout(() => {
// 					commandProcessed = false;
// 					if (isMicrophoneEnabled) startRecognition();
// 				}, 500); // Adjust delay as needed to prevent multiple triggers

// 				break; // Break after the first match
// 			}
// 		}
// 	}
// });

// // Error handling
// recognition.addEventListener("error", (event) => {
// 	//// console.error("Speech recognition error:", event.error);
// 	if (event.error === "not-allowed" || event.error === "service-not-allowed") {
// 		alert("Please allow microphone access to use voice commands.");
// 	}
// });

// // Request microphone access and initialize the Web Speech API
// async function requestMicrophoneAccess() {
// 	const permissionButton = document.getElementById("mic-access-button");

// 	if (permissionButton) {
// 		permissionButton.style.display = "block"; // Show the button to request access

// 		permissionButton.addEventListener("click", toggleMicrophoneAccess);
// 	}

// 	await setupMicrophone(); // Call setup after button is clicked
// }

// // Start the microphone access request
// requestMicrophoneAccess();

// // Initialize Web Speech API
// const synth = window.speechSynthesis;

// document.addEventListener("DOMContentLoaded", () => {
// 	// Select all descriptions
// 	const descriptions = document.querySelectorAll(".shortcut .description");

// 	descriptions.forEach(description => {
// 		description.addEventListener("mouseover", () => {
// 			// Get the parent shortcut container
// 			const shortcut = description.closest(".shortcut");

// 			// Find all keys > span elements within this shortcut
// 			const keySpans = shortcut.querySelectorAll(".keys > span");

// 			// Concatenate the text content of all key spans
// 			let textToSpeak = Array.from(keySpans)
// 				.map(span => span.textContent.trim())
// 				.join(", ");

// 			// Speak the text
// 			speakText(textToSpeak);
// 		});
// 	});
// });

// // Function to handle speech synthesis
// function speakText(text) {
// 	if (synth.speaking) {
// 		synth.cancel(); // Stop ongoing speech if any
// 	}

// 	const utterance = new SpeechSynthesisUtterance(text);
// 	utterance.rate = 1; // Speech rate (normal speed)
// 	utterance.pitch = 1; // Speech pitch (normal tone)
// 	utterance.lang = "en-US"; // Language
// 	synth.speak(utterance);
// }


// const keys = document.querySelectorAll('.key');
// keys.forEach((key) => {
// 	key.addEventListener('mouseenter', () => {
// 		const text = key.textContent.trim(); // Get text content
// 		speakText(text);
// 	});
// });

let commandProcessed = false;
let currentMedia = video;
let isFullScreen = false;
let isRepeat = false;
let videoFiles = [];
let playedVideos = [];
let currentVideoIndex = 0;
let currentAudioIndex = 0;
let autoSwitchDone = false;
let isGifPlaying = false;
let debounceTimeout;
let lastPlayedIndex = -1;
let showRemainingTime = false;
let lastPlaybackTime = 0;
let lastPlayedStack = [];
let isUserScrolling = false;
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

// Function to show the temporary status message
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

// Function to update logo if the audio doesn't have a thumbnail
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

// Trigger file input when clicking the custom logo link
customLogoLink.addEventListener("click", function() {
	customLogoInput.click(); // Programmatically click the file input
});


// Function to show the preview
function showLogoPreview(logoSrc) {
    Array.from(logoPreviewImages).forEach((img) => {
        img.src = logoSrc;
        img.parentElement.style.display = "block"; // Show the preview container
    });
}

// Function to hide the preview
function hideLogoPreview() {
    Array.from(logoPreviewContainers).forEach((container) => {
        container.style.display = "none"; // Hide the preview container
    });
}

// Update the saveCustomLogo function to add hover preview functionality
function saveCustomLogo(filePath, fileName) {
    const logoOptionsContainer = document.querySelector("#logoOptions .sub-dropdown-content");

    const newLogoDiv = document.createElement("div");
    newLogoDiv.classList.add("logo-item", "custom");
    newLogoDiv.setAttribute("data-filename", fileName);

    const newLogoLink = document.createElement("a");
    newLogoLink.setAttribute("data-src", filePath);
    newLogoLink.textContent = fileName;

    newLogoLink.addEventListener("mouseenter", function () {
        showLogoPreview(filePath);
    });
    newLogoLink.addEventListener("mouseleave", function () {
        hideLogoPreview();
    });

    newLogoLink.addEventListener("click", function () {
        const audioImage = document.querySelector(".audio-image"); // Assuming there's a class for the audio image
        audioImage.src = filePath;
        audioImage.style.display = "block";
        audioImage.classList.remove("D-logo-rotate-animation");
    });

    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-thin", "fa-trash", "delete-icon");

    deleteIcon.addEventListener("click", function () {
        logoOptionsContainer.removeChild(newLogoDiv);
        removeCustomLogoFromStorage(fileName); // Assuming this function exists
    });

    newLogoDiv.appendChild(newLogoLink);
    newLogoDiv.appendChild(deleteIcon);
    logoOptionsContainer.appendChild(newLogoDiv);

 saveCustomLogoToStorage(filePath, fileName); // Assuming this function exists
 checkPlayAllButton();
}

// Function to remove the logo from localStorage
function removeCustomLogoFromStorage(fileName) {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	delete logos[fileName];
	localStorage.setItem("customLogos", JSON.stringify(logos));
}

// Save the custom logo to localStorage with an absolute file path
function saveCustomLogoToStorage(filePath, fileName) {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	logos[fileName] = filePath; // Store the absolute file path
	localStorage.setItem("customLogos", JSON.stringify(logos));
}

// Load custom logos from localStorage and add them to the dropdown list
function loadCustomLogos() {
	const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
	const logoOptionsContainer = document.querySelector(
		"#logoOptions .sub-dropdown-content"
	);

	// Clear previous custom logo entries, keep default ones
	const customLogoItems =
		logoOptionsContainer.querySelectorAll(".logo-item.custom");
	customLogoItems.forEach((item) => logoOptionsContainer.removeChild(item));

	// Load all saved logos
	for (const [fileName, filePath] of Object.entries(logos)) {
		saveCustomLogo(filePath, fileName); // Use the saved file path
	}

	// Check if there's a previously selected logo
	const selectedLogo = localStorage.getItem("selectedLogo");

	if (selectedLogo) {
		// If a logo was previously selected, set it as the audio logo
		setSelectedLogo(selectedLogo);
	} else {
		// No previous logo selection, set the first default logo
		const defaultLogoLinks = document.querySelectorAll(
			"#logoOptions .sub-dropdown-content a[data-src]"
		);
		if (defaultLogoLinks.length > 0) {
			const firstLogoSrc = defaultLogoLinks[0].getAttribute("data-src");
			setSelectedLogo(firstLogoSrc); // Set the first logo as the default logo
		}
	}
}

// Show custom confirm dialog and return a promise
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

// Updated customLogoInput change event
customLogoInput.addEventListener("change", async function (event) {
	const file = event.target.files[0];
	if (file) {
	  const fileName = file.name; // Get file name
	  // Use FileReader to read the file as an ArrayBuffer
	const reader = new FileReader();
	reader.onload = async function (e) {
		const fileBuffer = e.target.result; // ArrayBuffer of the file content

		// Check if auto-save is enabled
		const autoSaveLogo =
		JSON.parse(localStorage.getItem("autoSaveLogo")) || false;

		if (autoSaveLogo) {
		  // Automatically save the logo without asking
		const response = await window.electron.saveCustomLogo(fileBuffer, fileName);
		if (response.success) {
			console.log("GIF saved successfully at:", response.path);
			saveCustomLogo(URL.createObjectURL(file), fileName); // Add to the logo list
		} else {
			console.error("Failed to save GIF:", response.error);
		}
		} else {
		  // Use custom confirm dialog
		const { confirmed, autoSave } = await showCustomConfirm();
		if (confirmed) {
			const response = await window.electron.saveCustomLogo(
			fileBuffer,
			fileName
			);
			if (response.success) {
			console.log("GIF saved successfully at:", response.path);
			  saveCustomLogo(URL.createObjectURL(file), fileName); // Add to the logo list
			  // If checkbox is checked, save the auto-save preference
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
	  reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
	} else {
	console.error("No file selected or invalid file");
	}
});

// Function to delete the custom logo
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

// Function to check and show the "Play All" button
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

// Function to play all custom logos
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

// Function to stop playback
function stopGifPlayback() {
	isGifPlaying = false; // Set to false to stop the loop
}

// Function to set the selected logo and save the preference
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


// Update default logo links to add hover preview functionality
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


// Function to search GIFs
function searchGifs() {
	const searchTerm = gifSearchInput.value.trim();
	if (!searchTerm) return;

	clearGifResults(); // Remove previous GIFs before starting a new search
	gifResultsContainer.innerHTML = `<div class="loading">Loading...</div>`;
	gifResultsContainer.style.display = "block";

	fetch(`https://api.giphy.com/v1/gifs/search?api_key=KlO42gtgg2Q48imB0bV7Xraa73usqtLT&q=${encodeURIComponent(searchTerm)}&limit=100`)
		.then((response) => response.json())
		.then((data) => {
			displayGifResults(data.data);
		})
		.catch((error) => {
			console.error("Error fetching GIFs:", error);
			gifResultsContainer.innerHTML = `<div class="no-results">Error fetching results. Please try again later.</div>`;
		});
}

// Display GIF results
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
// Function to clear GIF results and free up network resources
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

function loadMediaFile(file) {
	if (!file) {
		return;
	}

	const fileType = file.type.split("/")[0]; // Determine if it's audio, video, or image
	const fileURL = URL.createObjectURL(file);
	const fileName = file.name;

	videoId = getVideoId(fileName); // Get unique video ID from file name

	// Reset styles
	gifImageElement.style.display = "none";
	videoElement.style.display = "none";
	document.getElementById("audioLogo").style.display = "none";
	audioImage.style.display = "none";
	audioLogoDropdown.style.pointerEvents = "none";
	audioLogoDropdown.style.opacity = "0.5";

	// Store last playback time from cache
	(async () => {
		lastPlaybackTime = await getPlaybackTimeFromCache(videoId);
		handleContinueButtonVisibility(); // Update button visibility based on the playback time
	})();

	// Reset rotation angle before loading new media
	video.dataset.rotation = "0"; // Reset rotation angle to 0 degrees
	applyRotation(); // Apply the reset rotation

	if (file.type === "image/gif") {
		// Handle GIF files
		gifImageElement.src = fileURL;
		gifImageElement.style.display = "block";
		updateVideoTitle(fileName);

		gifImageElement.onload = () => {
			URL.revokeObjectURL(fileURL);
		};
		return; // Exit early
	}

	if (fileType === "video" || fileType === "audio") {
		currentMedia.src = fileURL;
		updateVideoTitle(fileName);

		if (fileType === "audio") {
			// Show the audio logo when an audio file is played
			document.getElementById("audioLogo").style.display = "block";
			audioImage.style.display = "block";
			loadCustomLogos(); // Load any custom logos from localStorage

			readAudioMetadata(file, function(hasArtwork) {
				if (hasArtwork) {
					audioImage.style.display = "none";
				} else {
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
				}
			});
		} else {
			// Hide the audio logo when a video file is played
			document.getElementById("audioLogo").style.display = "none";
			audioImage.style.display = "none";
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
					populateAudioTracks(); // Populate audio tracks if any
					showStatusMessage(""); // Reset any status message
					highlightCurrentVideoInPlaylist(fileName); // Highlight the current video in the playlist
				})
				.catch((error) => {
					console.error("Error playing media:", error);
				});
		});

		// Reset zoom when video ends
		currentMedia.addEventListener("ended", resetZoom(), stopPlayback);

		return; // Exit early
	}

	console.error("Unsupported file type:", file.type);
}


function getVideoId(fileName) {
	// Generate or extract video ID from file name
	return fileName.replace(/\.[^/.]+$/, "");
}

function savePlaybackTimeToCache(videoId, time) {
	// Subtract 2 seconds from the current time, ensuring it's not negative
	const adjustedTime = Math.max(0, time - 2);

	// If the time is 0, clear the cache instead of saving it
	if (adjustedTime === 0) {
		clearCache(videoId);
		return;
	}

	const playbackData = {
		videoId,
		time: adjustedTime,
		timestamp: Date.now()
	};
	localStorage.setItem(`playback-${videoId}`, JSON.stringify(playbackData));
}

function getPlaybackTimeFromCache(videoId) {
	const playbackData = localStorage.getItem(`playback-${videoId}`);
	if (playbackData) {
		const parsedData = JSON.parse(playbackData);
		const currentTime = Date.now();
		const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

		// Check if the saved timestamp is older than 2 days
		if (currentTime - parsedData.timestamp > twoDaysInMillis) {
			clearCache(videoId); // If it's been more than 2 days, clear the cache
			return 0; // Return 0 to reset playback
		}

		return parsedData.time; // Return the saved playback time
	}
	return 0; // Return 0 if no cache exists
}

function clearCache(videoId) {
	localStorage.removeItem(`playback-${videoId}`); // Remove the specific playback cache
}

// Update visibility of the continue button
function handleContinueButtonVisibility() {
	if (lastPlaybackTime > 0) {
		continueButton.style.display = "block"; // Show the button if playback time exists
		startAutoHideContinueButton(); // Start the 5-second timeout for auto-hiding the button
	} else {
		continueButton.style.display = "none"; // Hide the button if no playback time
	}
}

// Start a timeout to auto-hide the "Continue Watching" button and clear playback cache after 5 seconds
function startAutoHideContinueButton() {
	clearTimeout(hideContinueButtonTimeout); // Clear any previous timeout
	hideContinueButtonTimeout = setTimeout(() => {
		continueButton.style.display = "none"; // Hide the button after 5 seconds

		// Clear the playback cache if the button is not clicked
		clearCache(videoId);
	}, 5000); // 5 seconds (5000 milliseconds)
}

video.addEventListener("pause", () => {
	// Check if the video/audio ended
	if (video.currentTime >= video.duration || video.currentTime === 0) {
		clearCache(videoId); // Clear the cache when the media ends or currentTime is 0
		return; // Exit early, no need to save the playback time
	}

	// Only save playback time if the video length is 1 minute or more
	if (video.duration >= 60) {
		lastPlaybackTime = video.currentTime; // Store the current playback time
		savePlaybackTimeToCache(videoId, lastPlaybackTime); // Save to cache
	}

	handleContinueButtonVisibility(); // Update the button visibility on pause
	continueButton.style.display = "none"; // Hide when video is paused
});

// Save playback time only when the window is about to unload
window.addEventListener('beforeunload', () => {
	if (!currentMedia.paused && currentMedia.duration >= 60) { // Check video duration
		lastPlaybackTime = currentMedia.currentTime;
		if (window.electron && window.electron.savePlaybackTime) {
			window.electron.savePlaybackTime(lastPlaybackTime, videoId);
		}
	}
});

if (window.electron && window.electron.onAppClosing) {
	window.electron.onAppClosing(async () => {
		if (!currentMedia.paused && currentMedia.duration >= 60) { // Check video duration
			lastPlaybackTime = currentMedia.currentTime;
			try {
				await window.electron.savePlaybackTime(lastPlaybackTime, videoId); // Save to main process
				savePlaybackTimeToCache(videoId, lastPlaybackTime); // Also save to localStorage
			} catch (error) {
				console.error('Error saving playback time:', error);
			}
		}
	});
}

window.addEventListener('load', () => {
	// Assume `videoId` is already defined
	let lastPlaybackTime = getPlaybackTimeFromCache(videoId); // Load from local storage

	// If there's a playback time in local storage, set it for the video
	if (lastPlaybackTime > 0) {
		video.currentTime = lastPlaybackTime; // Resume from last saved playback time
		handleContinueButtonVisibility(); // Update button visibility
	}

	// Load saved playback time from main process (for reopening the same file)
	window.electron.loadPlaybackTime((playbackData) => {
		if (playbackData && playbackData.videoId === videoId) {
			lastPlaybackTime = playbackData.time;
			// Show the "Continue" button only if the playback time is greater than 0
			if (lastPlaybackTime > 0) {
				continueButton.style.display = "block";
			}
		}
	});
});

// Handle "Continue" button click to resume playback
document.getElementById("continueButton").addEventListener("click", () => {
	video.currentTime = lastPlaybackTime; // Resume from last saved playback time
	video.play(); // Play the video
	document.getElementById("continueOverlay").style.display = "none";
	// Clear the playback cache after continuing
	clearCache(videoId);
});


function checkAndSetArtwork(artworkExists) {
	if (artworkExists) {
		// If artwork exists, set the logo to none
		audioImage.src = ''; // Clear the logo
		audioImage.style.display = 'none'; // Hide the logo
		localStorage.removeItem('selectedLogo'); // Remove any saved selection
	} else {
		// If no artwork, set the selected logo if available
		const selectedLogo = localStorage.getItem('selectedLogo');
		if (selectedLogo) {
			setSelectedLogo(selectedLogo);
		}
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
			const size =
				((data[6] & 0x7f) << 21) |
				((data[7] & 0x7f) << 14) |
				((data[8] & 0x7f) << 7) |
				(data[9] & 0x7f);

			while (offset < size) {
				const frameID = String.fromCharCode(
					data[offset],
					data[offset + 1],
					data[offset + 2],
					data[offset + 3]
				);
				const frameSize =
					(data[offset + 4] << 24) |
					(data[offset + 5] << 16) |
					(data[offset + 6] << 8) |
					data[offset + 7];
				const frameFlags = (data[offset + 8] << 8) | data[offset + 9];

				// 'APIC' frame contains the artwork
				if (frameID === "APIC") {
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
		console.error("Error reading audio file metadata");
		callback(false);
	};

	// Read the first part of the file to get the metadata
	reader.readAsArrayBuffer(file.slice(0, 1024 * 10)); // Read the first 10KB
}


// Efficiently Update Playlist Dropdown
function updatePlaylistDropdown() {
	const playlistContainers = document.querySelectorAll(".play-list");

	playlistContainers.forEach((playlistContainer) => {
		// Clear and repopulate the playlist
		playlistContainer.innerHTML = "";

		videoFiles.forEach((file, index) => {
			const fileLink = document.createElement("a");
			fileLink.href = "javascript:void(0)";
			fileLink.textContent = file.name;
			fileLink.classList.add("playlist-item");

			fileLink.addEventListener("click", () => {
				playVideoByIndex(index);
				highlightCurrentVideo(fileLink); // Highlight in all playlists
			});

			playlistContainer.appendChild(fileLink);
		});
	});
}


// Function to highlight the currently playing video and scroll to it
function highlightCurrentVideo(selectedLink) {
	// Get the text of the selected item to use as a reference
	const selectedText = selectedLink.textContent.trim();

	// Remove the highlight from any previously highlighted video across all playlists
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


// Auto-scroll to the current video in the playlist if user isn't interacting
function highlightCurrentVideoInPlaylist(fileName) {
	const playlistItems = document.querySelectorAll(".play-list .playlist-item");

	playlistItems.forEach((item) => {
		if (item.textContent === fileName) {
			highlightCurrentVideo(item); // Highlight and scroll to the current video
		}
	});
}

// Set up auto-scrolling interval
setInterval(() => {
	const highlightedItem = document.querySelector(".play-list .highlight");
	if (highlightedItem && !isUserScrolling) {
		highlightedItem.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	}
}, 1000); // Check every 1 second; adjust as needed

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

// Hide dropdown when clicking outside
window.addEventListener("click", function (event) {
    const playlistContainer = document.querySelector(".playlist-container");
    // Check if the click was outside the playlist container
    if (!playlistContainer.contains(event.target)) {
        playlistContainer.classList.remove("show");
    }
});


// Add drag-and-drop functionality
document.addEventListener('dragover', (event) => {
  event.preventDefault(); // Prevent default to allow drop
});

document.addEventListener('drop', (event) => {
event.preventDefault();
if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    loadMediaFile(file); // Call your existing loadMediaFile function
}
});

// Function to play a video by its index
function playVideoByIndex(index) {
	if (index < 0 || index >= videoFiles.length) return;

	const videoFile = videoFiles[index];
	loadMediaFile(videoFile);

	playedVideos.push(index);
	if (playedVideos.length === videoFiles.length) {
		playedVideos = []; // Reset once all videos have been played
	}

	lastPlayedIndex = index;
	currentVideoIndex = index;
}

// Function to play media based on file type
function playMedia(file) {
	const fileType = file.type.split("/")[0];
	if (["video", "audio"].includes(fileType) || file.type === "image/gif") {
		loadMediaFile(file);
	} else {
		// console.error("Unsupported file type");
	}
}

// Event listener for file input changes
fileInput.addEventListener("change", async (event) => {
	const file = event.target.files[0];
	if (file) {
		playMedia(file);
		updateVideoTitle(file.name);
	}
});

// Handle file selection from input
function handleFileSelection(files) {
	videoFiles = Array.from(files).filter(
		(file) =>
		file.type.startsWith("video/") ||
		file.type.startsWith("audio/") ||
		file.type === "image/gif"
	);

	// Update the playlist dropdown
	updatePlaylistDropdown();

	// Check if there are valid video files and update navigation buttons
	if (videoFiles.length > 0) {
		currentVideoIndex = 0; // Default to the first file
		playMedia(videoFiles[currentVideoIndex]);
		audioLogo.style.display = videoFiles[0].type.startsWith("video/") ? "none" : "block";
		updateNavigationButtons();
	} else {
		nextButton.classList.add("hidden");
		prevButton.classList.add("hidden");
	}
}

// Event listener for multiple file selection
CSOInput.addEventListener("change", (event) => handleFileSelection(event.target.files));

// Event listener for folder file selection
folderInput.addEventListener("change", (event) => handleFileSelection(event.target.files));

// File input button click handlers
Ofile.addEventListener("click", () => fileInput.click());
CSO.addEventListener("click", () => CSOInput.click());
folder.addEventListener("click", () => folderInput.click());

// Functions to toggle play/pause icon
function updatePlayPauseIcon(isPlaying) {
	playPauseBtn.classList.toggle("fa-play", !isPlaying);
	playPauseBtn.setAttribute("title", isPlaying ? "pause" : "play");
	playPauseBtn.classList.toggle("fa-pause", isPlaying);
}

function togglePlayPause() {
	if (video.readyState < 3) {
		return;
	}
	if (video.paused) {
		video.play();
		hideVideoTitle();
		window.electron.sendPlayPauseState("playing");
	} else {
		video.pause();
		stopGifPlayback();
		showVideoTitle();
		window.electron.sendPlayPauseState("paused");
	}
}

// Event listeners for play/pause button
playPauseBtn.addEventListener("click", togglePlayPause);
video.addEventListener("play", () => updatePlayPauseIcon(true));
video.addEventListener("pause", () => updatePlayPauseIcon(false));

// Function to determine next video index
function getNextIndex() {
	if (isShuffle) {
		let remainingVideos = videoFiles.filter((_, index) => !playedVideos.includes(index));
		return remainingVideos.length > 0 ?
			videoFiles.indexOf(remainingVideos[Math.floor(Math.random() * remainingVideos.length)]) :
			null;
	}
	return (currentVideoIndex + 1) % videoFiles.length;
}

// Function to determine previous video index
function getPreviousIndex() {
	if (!isShuffle && lastPlayedStack.length > 0) {
		return lastPlayedStack[lastPlayedStack.length - 1]; // Return last played video from stack
	}
	return (currentVideoIndex - 1 + videoFiles.length) % videoFiles.length;
}

// Function to update the visibility of next and previous buttons
function updateNavigationButtons() {
	const nextIndex = getNextIndex();
	const prevIndex = getPreviousIndex();

	// Hide next button if no next video
	if (nextIndex == null || videoFiles.length === 0) {
		nextButton.classList.add("hidden");
	} else {
		nextButton.classList.remove("hidden");
	}

	// Hide previous button if no previous video
	if (prevIndex == null || videoFiles.length === 0) {
		prevButton.classList.add("hidden");
	} else {
		prevButton.classList.remove("hidden");
	}
}

// Function to play the next video
function playNext() {
	const nextIndex = getNextIndex();
	if (nextIndex === null && !isLooping) {
		stopPlayback();
		return;
	}

	lastPlayedStack.push(currentVideoIndex); // Store the last played index before playing next
	lastPlayedIndex = nextIndex;
	playVideoByIndex(nextIndex);
	highlightCurrentVideoInPlaylist(videoFiles[nextIndex].name);
	updateNavigationButtons();
	showStatusMessage("Next")
}

// Function to play the previous video
function playPrevious() {
	if (lastPlayedStack.length > 0) {
		const prevIndex = lastPlayedStack.pop(); // Get the last played video index from the stack
		playVideoByIndex(prevIndex);
		highlightCurrentVideoInPlaylist(videoFiles[prevIndex].name);
		updateNavigationButtons();
		showStatusMessage("Back")
	}
}

// Function to stop playback and reset the media player
function stopPlayback() {
	video.pause();
	currentVideoIndex = null;
	video.src = "";
	updateVideoTitle("");
	updatePlayPauseIcon(false);
	playedVideos = [];
	video.currentTime = 0;
	updateProgressBar();
	currentTimeDisplay.textContent = formatTime(0);
	progressBar.style.width = `0%`;
	progressHandle.style.left = `0%`;
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

// Handle video end event (to automatically play the next video)
video.addEventListener("ended", () => {
	playNext();
	updateNavigationButtons();
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
			case "Normal":
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

// Function to update video title with truncation
function updateVideoTitle(title) {
	const videoTitleElement = document.getElementById("videoTitle");

	if (videoTitleElement) {
		// Remove file extensions (.mp4, .mp3, etc.)
		const nameWithoutExtension = title.replace(/\.[^/.]+$/, "");
		videoTitleElement.textContent = nameWithoutExtension;
	} else {
		// console.error('Element with id "videoTitle" not found.');
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

// Volume Tooltip (existing)
const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.863), -1px -1px 2px rgba(0, 0, 0, 0.733), 1px -1px 2px rgba(0, 0, 0, 0.707),-1px 1px 2px black";
tooltip.style.color = "#fff";
tooltip.style.fontWeight = "300";
// tooltip.style.padding = "5px";
tooltip.style.borderRadius = "5px";
tooltip.style.display = "none";
tooltip.style.zIndex = "99";
mediaPlayer.appendChild(tooltip);

// Audio Context and Gain Node setup (existing)
const videoElement = document.querySelector("video");
const volumeSlider = document.getElementById("volume-slider");
volumeSlider.max = 150; // Set the maximum slider value to 150% volume (changed from 200%)

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
volumeSlider.value = gainNode.gain.value * 100; // Sync slider with volume (0-150 range)

// Call the loadVolumeSetting to apply saved or default volume
loadVolumeSetting(); // Load saved volume or apply default volume (100%)

// Function to update volume, slider, and tooltip (existing)
function updateVolume(newVolume) {
	// Ensure the volume value is within the range [0, 1.5]
	newVolume = Math.max(0, Math.min(1.5, newVolume));

	// Smoothly transition to the new volume level
	gainNode.gain.linearRampToValueAtTime(newVolume, audioContext.currentTime + 0.1);

	// Update slider value and show tooltip
	volumeSlider.value = newVolume * 100; // Sync slider with volume (0-150 range)
	showTooltip(newVolume);

	// Save the new volume setting to localStorage
	saveVolumeSetting(newVolume);

	// Update volume button icon and tooltip
	updateVolumeIcon();
}


// Function to show tooltip (existing)
function showTooltip(volume) {
	tooltip.textContent = `Volume: ${(volume * 100).toFixed(0)}%`;
	const sliderRect = volumeSlider.getBoundingClientRect();
	const sliderX = sliderRect.left + volumeSlider.offsetWidth * (volumeSlider.value / 150);
	tooltip.style.left = `${sliderX}px`;
	tooltip.style.top = `${sliderRect.top - 30}px`;
	tooltip.style.display = "block";

	setTimeout(() => {
		tooltip.style.display = "none";
	}, 1500);
}

// Update volume when slider changes (existing)
let tooltipTimeout;
volumeSlider.addEventListener("input", (event) => {
	const volume = event.target.value / 100;
	updateVolume(volume);
	clearTimeout(tooltipTimeout); // Clear any existing timeout
});

// Hide tooltip after a delay only if the user is not actively changing the volume (existing)
volumeSlider.addEventListener("change", () => {
	tooltipTimeout = setTimeout(() => {
		tooltip.style.display = "none";
	}, 1000);
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
			updateVolume(Math.min(2, gainNode.gain.value + 0.1)); // Increase volume up to 200%
		} else if (event.deltaY > 0) {
			updateVolume(Math.max(0, gainNode.gain.value - 0.1)); // Decrease volume
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

// Show tooltip when hovering over the volume slider
volumeSlider.addEventListener("mouseenter", () => {
	// Show tooltip with the current volume
	showTooltip(gainNode.gain.value);
});

// Hide tooltip when the mouse leaves the slider
volumeSlider.addEventListener("mouseleave", () => {
	tooltip.style.display = "none";
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

	// Reset zoom status message
	showStatusMessage(`Zoom: 100%`);
}

// Toggle shuffle mode and show status
function toggleShuffleMode() {
	isShuffle = !isShuffle;

	if (isShuffle) {
shuffleButton.classList.add("active");
showStatusMessage("Shuffle: On");
	window.electron.sendShuffleState("on");
	} else {
shuffleButton.classList.remove("active");
showStatusMessage("Shuffle: Off");
playedVideos = [];
lastPlayedStack = [];
	window.electron.sendShuffleState("off");
	}
}

// Toggle repeat mode and show status
function toggleRepeat() {
	isRepeat = !isRepeat;
	currentMedia.loop = isRepeat;

	if (isRepeat) {
		showStatusMessage("Repeat: On");
		window.electron.sendRepeatState("on");
		video.play();
	} else {
		showStatusMessage("Repeat: Off");
		window.electron.sendRepeatState("off");
	}
}

// Event listener for shuffle mode button loopbutton, switchtrack button and Full screen 
document.getElementById("shuffleButton").addEventListener("click", toggleShuffleMode);
document.getElementById("repeatBtn").addEventListener("click", toggleRepeat);
switchAudio.addEventListener("click", populateAudioTracks);

// Select the full-screen button elements
const fullscreenButtons = document.querySelectorAll(".fullscreenBtn");

// Function to update the fullscreen button UI
function updateFullScreenUI(isFullscreen) {
	const fullscreenButtons = document.querySelectorAll('.fullscreenBtn');
	fullscreenButtons.forEach((button) => {
const icon = button.querySelector(".material-symbols-outlined");
if (icon) {
	icon.textContent = isFullscreen ? "fullscreen_exit" : "fullscreen";
}
});
}

 // Fullscreen toggle function
function toggleFullScreen() {
window.electron.toggleFullscreen(); // Notify the main process to toggle fullscreen
}

 // Listen for fullscreen state changes (from main process or DOM events)
window.electron.onFullscreenStateChanged((isFullscreen) => {
updateFullScreenUI(isFullscreen);
});


// Add event listeners for full-screen buttons
fullscreenButtons.forEach((element) => {
	element.addEventListener("click", () => {
		toggleFullScreen();
	});
});

// Add double-click event listener to the media player
mediaPlayer.addEventListener("dblclick", toggleFullScreen);

// Listen for fullscreen change events
document.addEventListener("fullscreenchange", () => {
	const isFullscreen = document.fullscreenElement !== null;
	updateFullScreenUI(isFullscreen);
});


// Toggle PiP mode
function togglePiPMode() {
	if (!document.pictureInPictureElement) {
		video.requestPictureInPicture().then(() => {}).catch((error) => {
			// console.error("Failed to enter Picture-in-Picture mode:", error);
		});
	} else {
		document.exitPictureInPicture().then(() => {}).catch((error) => {
			// console.error("Failed to exit Picture-in-Picture mode:", error);
		});
	}
}

// Event listener for PiP mode button
pipButton.addEventListener("click", () => togglePiPMode(video));

document.addEventListener("DOMContentLoaded", function() {
	const navbar = document.querySelector("nav");
	const Mediacontrols = document.querySelector(".controls");
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
				CSOInput.click();
			} else if (target.closest("#contextOpenFolder")) {
				folderInput.click();
			} else if (target.closest("#contextTogglePlayPause")) {
				togglePlayPause(); // Call the toggle function
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
let seekUpdateInterval;
let temporaryTime = 0;
const updateInterval = 20; // Adjust this to control speed (e.g., 20ms for smoother, faster updates)

function updateDragging(e) {
	if (isDragging) {
		const rect = progressBarWrapper.getBoundingClientRect();
		const posX = e.clientX - rect.left;
		const percentage = Math.min(Math.max(posX / rect.width, 0), 1); // Ensure percentage is between 0 and 1

		// Update both progress bar and handle position continuously
		progressBar.style.width = `${percentage * 100}%`;
		progressHandle.style.left = `${percentage * 100}%`;

        // Update temporary time for display
        temporaryTime = percentage * video.duration;
        currentTimeDisplay.textContent = formatTime(temporaryTime);

		// Calculate the new time based on drag position
		const newTime = percentage * video.duration;
		currentTimeDisplay.textContent = formatTime(newTime);

		// Use debounced approach with reduced interval for faster response
		if (!seekUpdateInterval) {
			seekUpdateInterval = setInterval(() => {
				video.currentTime = newTime; // Update video time at a faster rate for smoother playback
			}, updateInterval);
		}
	}
}

// Show the progress handle on mouse enter
progressBarWrapper.addEventListener("mouseenter", () => {
	isDragging = true
	progressHandle.style.opacity = "1"; // Show the handle
	if (hideHandleTimeout) clearTimeout(hideHandleTimeout);
});

// Hide the progress handle on mouse leave with a delay
progressBarWrapper.addEventListener("mouseleave", () => {
	hideHandleTimeout = setTimeout(() => {
		progressHandle.style.opacity = "0"; // Hide the handle
	}, 2000); // Hide after 3 seconds
});

// Reset the handle visibility if dragging starts
progressHandle.addEventListener("mousedown", () => {
	isDragging = true;
	progressHandle.style.opacity = "1"; // Show handle during dragging
	document.addEventListener("mousemove", updateDragging);
});

// Handle `mouseup` event to end dragging and clean up
document.addEventListener("mouseup", () => {
	if (isDragging) {
		isDragging = false;
		clearInterval(seekUpdateInterval); // Clear the interval after dragging ends
		seekUpdateInterval = null;
		document.removeEventListener("mousemove", updateDragging);
		// Hide the handle after a delay
		hideHandleTimeout = setTimeout(() => {
			progressHandle.style.opacity = "0";
		}, 2000);
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

// Allow progressBarWrapper scrolling when mouse is over it
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
		window.electron.close();
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
		fileInput.click();
		return;
	}

	if (event.shiftKey && event.key.toLowerCase() === "o") {
		event.preventDefault();
		CSOInput.click();
		return;
	}

	if (event.ctrlKey && event.key.toLowerCase() === "f") {
		event.preventDefault();
		folderInput.click();
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
	const keyActions = {
		ArrowUp: () => {
			updateVolume(gainNode.gain.value + 0.1) // Increase volume
		},
		ArrowDown: () => {
			updateVolume(gainNode.gain.value - 0.1) // Decrease volume
		},
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
		r: () => toggleShuffleMode(),
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
				`- ${formatTime(currentMedia.currentTime)} /${formatTime(currentMedia.duration)}`
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
		}
	};

	if (keyActions[event.key]) {
		keyActions[event.key]();
	}
	if (event.key === "+") {
		// Increase speed
		if (video.playbackRate < 2) { // Limit max speed to 2
			const newSpeed = video.playbackRate + 0.25;
			setPlaybackSpeed(newSpeed);
			showStatusMessage(newSpeed === 1 ? "Normal" : `Speed: ${newSpeed}x`);
		}
	} else if (event.key === "-") {
		// Decrease speed
		if (video.playbackRate > 0.25) { // Limit min speed to 0.25
			const newSpeed = video.playbackRate - 0.25;
			setPlaybackSpeed(newSpeed);
			showStatusMessage(newSpeed === 1 ? "Normal" : `Speed: ${newSpeed}x`);
		}
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

voiceTab.addEventListener('click', () => {
	voiceTab.classList.add('active-tab');
	keyboardTab.classList.remove('active-tab');
	keyboardShortcuts.style.display = 'none';
	voiceShortcuts.style.display = 'grid';
});

// Add search functionality for active tab
searchInput.addEventListener('input', (e) => {
	const query = e.target.value.toLowerCase();
	const activeShortcuts = keyboardShortcuts.style.display === 'grid' ? keyboardShortcuts : voiceShortcuts;
	const shortcuts = activeShortcuts.querySelectorAll('.shortcut');

	shortcuts.forEach((shortcut) => {
		const descriptionElement = shortcut.querySelector('.description');
		if (descriptionElement) {
			const description = descriptionElement.textContent.toLowerCase();
			shortcut.style.display = description.includes(query) ? 'flex' : 'none';
		}
	});
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

// Listen for updates from the main process to change the icon dynamically
window.electron.onWindowStateChange((isFullScreen) => {
    const maximizeIcon = document.querySelector("#maximize i");
    if (isFullScreen) {
        maximizeIcon.className = "fa-light fa-down-left-and-up-right-to-center"; // Icon for "Restore" or "Normal Screen"
    } else {
        maximizeIcon.className = "fa-light fa-square"; // Icon for "Maximize"
    }
});

document.querySelector("#windws-close").addEventListener("click", () => {
	window.electron.close();
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

document.addEventListener("DOMContentLoaded", () => {
    window.electron.onFileOpen((filePath) => {
        if (filePath) {
            showLoader();
            window.electron.getFileData(filePath)
                .then((fileData) => {
                    if (fileData) {
                        const file = createFileObject(fileData);
                        playMedia(file);
                        updateVideoTitle(fileData.fileName);
                    }
                })
                .catch((error) => console.error("Failed to load file:", error))
                .finally(() => hideLoader());
        }
    });

    window.electron.requestOpenFile();
});

// Create File object from received data
function createFileObject({ buffer, mimeType, fileName }) {
    const blob = new Blob([buffer], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
}

 // Handle download progress
window.electron.onDownloadProgress((percent) => {
	const progressBar = document.getElementById('progress-bar');
	progressBar.style.width = `${percent}%`;
	progressBar.textContent = `${percent.toFixed(2)}%`;
});

// Handle actions from tray
// Handle play/pause action from tray
window.electron.onPlayPause(() => {
	togglePlayPause();
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

// Handle shuffle action from tray
window.electron.onShuffleState(() => {
	toggleShuffleMode();
});

// Handle Repate action from tray
window.electron.onRepeatState(() => {
	toggleRepeat();
});

