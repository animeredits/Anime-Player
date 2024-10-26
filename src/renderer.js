const mediaPlayer = document.getElementById("mediaPlayer");
const fileInput = document.getElementById("fileInput");
const folderInput = document.getElementById("folderInput");
const CSOInput = document.getElementById("CSOInput");
const randomButton = document.getElementById("randomButton");
const Ofile = document.getElementById("Ofile");
const folder = document.getElementById("folder");
const CSO = document.getElementById("CSO");
const quit = document.getElementById("quit");
const video = document.getElementById("media");
const gifImageElement = document.getElementById("gifImage");
const rewind = document.getElementById("rewind");
const forward = document.getElementById("forward");
const nextButton  = document.getElementById("nextVideo");
const prevButton  = document.getElementById("prevVideo");
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
const audioImage = document.getElementById("audioImage");
const logoOptions = document.getElementById("logoOptions");
const audioLogoDropdown = document.getElementById("audioLogoDropdown");
const customLogoLink = document.getElementById("customLogoLink");
const customLogoInput = document.getElementById("customLogoInput");
const deleteLogoButton = document.getElementById("deleteLogoButton");
const logoPreviewContainer = document.getElementById("logoPreviewContainer");
const logoPreviewImage = document.getElementById("logoPreviewImage");
const statusMessage  = document.getElementById("statusMessage");


// Web Speech API initialization
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US"; // Set language to English (US)
recognition.interimResults = true; // Enable interim results for faster feedback
recognition.maxAlternatives = 1; // Limit to one alternative result
recognition.continuous = true; // Single recognition to reduce latency

// Web Audio API for volume detection
// const webaudioContext = new (window.AudioContext || window.webkitAudioContext)();
// let microphone;
// let analyser;
// let dataArray;
// let volumeWarningIssued = false;
// let isMicrophoneEnabled = false; // Initialize microphone status

// // Function to setup the microphone and analyser
// async function setupMicrophone() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     microphone = webaudioContext.createMediaStreamSource(stream);
//     analyser = webaudioContext.createAnalyser();
//     microphone.connect(analyser);
//     analyser.fftSize = 2048;
//     dataArray = new Uint8Array(analyser.frequencyBinCount);

//     // Start checking the voice volume after setup
//     checkVoiceVolume();
//     isMicrophoneEnabled = true; // Set the microphone status to enabled
//     updateMicButtonText(); // Update button text
//     startRecognition(); // Start recognition after microphone setup
//   } catch (error) {
//     console.error("Error accessing microphone:", error);
//     alert("Microphone access is required for voice commands. Please allow access in your browser settings.");
//   }
// }

// // Function to request or stop microphone access
// async function toggleMicrophoneAccess() {
//   if (isMicrophoneEnabled) {
//     // Stop microphone access
//     stopRecognition(); // Stop recognition if it’s running
//     if (microphone) {
//       microphone.disconnect(); // Disconnect the microphone
//       microphone = null;
//     }
//     if (analyser) {
//       analyser = null;
//     }
//     isMicrophoneEnabled = false; // Update the status
//   } else {
//     // Request microphone access
//     await setupMicrophone(); // Call the setup function
//   }
  
//   // Update the button text after toggling
//   updateMicButtonText(); // Update the button text
// }

// // Function to update the button text based on microphone status
// function updateMicButtonText() {
//   const permissionButton = document.getElementById("mic-access-button");
//   permissionButton.textContent = isMicrophoneEnabled ? "Disable Microphone" : "Enable Microphone";
// }

// // Function to monitor voice volume and provide feedback if too low
// function checkVoiceVolume() {
//   if (!analyser) return; // Skip if analyser is not set up

//   analyser.getByteFrequencyData(dataArray);
//   const averageVolume =
//     dataArray.reduce((sum, value) => sum + value) / dataArray.length;

//   // Example threshold for low volume; adjust based on testing
//   if (averageVolume < 10 && !volumeWarningIssued) {
//     console.warn("Your voice is too low. Please speak louder.");
//     displayVolumeWarning(); // Function to visually notify the user
//     volumeWarningIssued = true; // Prevent repeated warnings
//   } else if (averageVolume >= 20) {
//     hideVolumeWarning(); // Hide warning if volume is adequate
//     volumeWarningIssued = false;
//   }

//   requestAnimationFrame(checkVoiceVolume); // Continuously check volume
// }

// // Function to display a warning to the user
// function displayVolumeWarning() {
//   const warningElement = document.getElementById("volume-warning");
//   if (warningElement) {
//     warningElement.style.display = "block";
//   }
// }

// // Function to hide the volume warning
// function hideVolumeWarning() {
//   const warningElement = document.getElementById("volume-warning");
//   if (warningElement) {
//     warningElement.style.display = "none";
//   }
// }

// // Start listening for voice commands
// function startRecognition() {
//   if (recognition && !recognition.recognizing) {
//     recognition.start();
//   }
// }

// // Stop listening for voice commands
// function stopRecognition() {
//   if (recognition && recognition.recognizing) {
//     recognition.stop();
//   }
// }

// // Add a flag to track recognition state
// recognition.recognizing = false;

// // Update recognition state on start and end events
// recognition.addEventListener("start", () => {
//   console.log("Speech recognition service has started.");
//   recognition.recognizing = true; // Set the flag to true
// });

// recognition.addEventListener("end", () => {
//   console.log("Speech recognition service has stopped.");
//   recognition.recognizing = false; // Set the flag to false
//   // Automatically restart recognition if the microphone is enabled
//   if (isMicrophoneEnabled) {
//     startRecognition();
//   }
// });


// const commandMap = {
//   play: () => {
//     if (video.paused) {
//       video.play();
//       hideVideoTitle();
//       updatePlayPauseIcon(true);
//     }
//   },
//   stop: () => {
//     if (!video.paused) {
//       video.pause();
//       showVideoTitle();
//       updatePlayPauseIcon(false);
//     }
//   },
//   next: playNext,
//   previous: playPrevious,
//   back: playPrevious
// };

// // In the recognition result event:
// recognition.addEventListener("result", (event) => {
//   for (let i = event.resultIndex; i < event.results.length; ++i) {
//     const transcript = event.results[i][0].transcript.trim().toLowerCase();
//     console.log("Recognized command:", transcript);

//     // Execute the command if it exists in the command map
//     for (const command in commandMap) {
//       if (transcript.includes(command)) {
//         commandMap[command]();
//         break; // Break after the first match
//       }
//     }
//   }
// });

// // Error handling
// recognition.addEventListener("error", (event) => {
//   console.error("Speech recognition error:", event.error);
//   if (event.error === "not-allowed" || event.error === "service-not-allowed") {
//     alert("Please allow microphone access to use voice commands.");
//   }
// });

// // Request microphone access and initialize the Web Speech API
// async function requestMicrophoneAccess() {
//   const permissionButton = document.getElementById("mic-access-button");

//   if (permissionButton) {
//     permissionButton.style.display = "block"; // Show the button to request access

//     permissionButton.addEventListener("click", toggleMicrophoneAccess);
//   }

//   await setupMicrophone(); // Call setup after button is clicked
// }

// // Start the microphone access request
// requestMicrophoneAccess();


// const offset = 69;
// const borderWidth = 1;
// const angles = [];

// for (let i = 0; i <= 2; i += 0.25) {
//   angles.push(Math.PI * i);
// }
// let nearBy = [];

// function clearNearBy() {
//   nearBy.splice(0).forEach((e) => (e.style.borderImage = null));
//   nearBy = [];
// }

// const cards = document.querySelectorAll(".card");

// // Add event listeners to each card element
// cards.forEach((card) => {
//   card.addEventListener("mousemove", (e) => {
//     let x = e.clientX; // x position of cursor
//     let y = e.clientY; // y position of cursor

//     clearNearBy();

//     nearBy = angles.reduce((acc, rad, index, arr) => {
//       const offsets = [offset * 0.35, offset * 1.105];

//       const elements = offsets.reduce((elementAccumulator, o, i, offsetArray) => {
//         const cx = Math.floor(x + Math.cos(rad) * o);
//         const cy = Math.floor(y + Math.sin(rad) * o);
//         const element = document.elementFromPoint(cx, cy);

//         if (element && element.classList.contains('card')) {
//           const brect = element.getBoundingClientRect();
//           const bx = x - brect.left; // x position within the element
//           const by = y - brect.top; // y position within the element
//           const gr = Math.floor(offset * 1.7);

//           if (!element.style.borderImage) {
//             element.style.borderImage = `radial-gradient(${gr}px ${gr}px at ${bx}px ${by}px, rgba(255,255,255,0.3), rgba(255,255,255,0.1), transparent) 9 / ${borderWidth}px / 0px stretch`;
//           }

//           // console.log("Element at", offsets, (rad * 180) / Math.PI, element);

//           return [...elementAccumulator, element];
//         }

//         return elementAccumulator;
//       }, []);

//       return acc.concat(elements);
//     }, []);
//   });

//   card.addEventListener("mouseleave", (e) => {
//     clearNearBy();
//   });
// });

let currentMedia = video;
let isFullScreen = false;
let isRepeat = false;
let videoFiles = [];
let playedVideos = [];
let currentVideoIndex = 0;
let currentAudioIndex = 0;
let autoSwitchDone = false;
let isGifPlaying = false;
let lastPlayedIndex = -1;
let showRemainingTime = false;
let lastPlaybackTime = 0;
let videoId;
let hideContinueButtonTimeout;
let isVideoPaused = false;
let isRandom = false;
let isLooping = false;
const volumeStep = 0.05;
const minFontSize = 18;
const maxFontSize = 36; 
let rotationInitiated = false;
let isAppClosing = false;
let fontSize = 16
let scale = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;
const minZoom = 1;
const maxZoom = 3;

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
logoOptions.addEventListener("change", function () {
  if (this.value) {
    updateLogo(this.value);
  } else {
    console.error("Invalid selection: no logo source");
  }
});

// Trigger file input when clicking the custom logo link
customLogoLink.addEventListener("click", function () {
  customLogoInput.click(); // Programmatically click the file input
});

// Update the saveCustomLogo function to add hover preview functionality
function saveCustomLogo(filePath, fileName) {
  const logoOptionsContainer = document.querySelector(
    "#logoOptions .sub-dropdown-content"
  );

  const newLogoDiv = document.createElement("div");
  newLogoDiv.classList.add("logo-item", "custom");
  newLogoDiv.setAttribute("data-filename", fileName);

  const newLogoLink = document.createElement("a");
  newLogoLink.setAttribute("data-src", filePath);
  newLogoLink.textContent = fileName;

  // Add hover event listeners to show a preview of the logo
  newLogoLink.addEventListener("mouseenter", function () {
    logoPreviewImage.src = filePath;
    logoPreviewContainer.style.display = "block"; // Show the preview container
  });
  newLogoLink.addEventListener("mouseleave", function () {
    logoPreviewContainer.style.display = "none"; // Hide the preview container
  });

  newLogoLink.addEventListener("click", function () {
    audioImage.src = filePath;
    audioImage.style.display = "block";
    audioImage.classList.remove("D-logo-rotate-animation");
  });

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-thin", "fa-trash", "delete-icon");

  deleteIcon.addEventListener("mouseenter", function () {
    deleteIcon.classList.add("fa-bounce");
  });
  deleteIcon.addEventListener("mouseleave", function () {
    deleteIcon.classList.remove("fa-bounce");
  });

  deleteIcon.addEventListener("click", function () {
    logoOptionsContainer.removeChild(newLogoDiv);
    removeCustomLogoFromStorage(fileName);
    deleteCustomLogo(fileName)
    checkPlayAllButton();
  });

  newLogoDiv.appendChild(newLogoLink);
  newLogoDiv.appendChild(deleteIcon);
  logoOptionsContainer.appendChild(newLogoDiv);

  saveCustomLogoToStorage(filePath, fileName);
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
    const autoSaveCheckbox = document.getElementById("autoSaveLogoConfirm");

    modal.style.display = "block"; // Show the modal

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
    const filePath = file.path; // Get the actual file path of the uploaded file
    audioImage.src = filePath; // Set the logo to the uploaded image or GIF
    audioImage.style.display = "block"; // Show the logo
    audioImage.classList.remove("D-logo-rotate-animation");

    // Check if auto-save is enabled
    const autoSaveLogo =
      JSON.parse(localStorage.getItem("autoSaveLogo")) || false;

    if (autoSaveLogo) {
      // Automatically save the logo without asking
      const fileName = file.name; // Get the file name
      const response = await window.electron.saveCustomLogo(filePath, fileName);
      if (response.success) {
        console.log("GIF saved successfully at:", response.path);
        saveCustomLogo(filePath, fileName); // Immediately add to the logo list
      } else {
        console.error("Failed to save GIF");
      }
    } else {
      // Use custom confirm dialog
      const { confirmed, autoSave } = await showCustomConfirm();
      if (confirmed) {
        const fileName = file.name; // Get the file name
        const response = await window.electron.saveCustomLogo(
          filePath,
          fileName
        );
        if (response.success) {
          console.log("GIF saved successfully at:", response.path);
          saveCustomLogo(filePath, fileName); // Immediately add to the logo list

          // If checkbox is checked, save the auto-save preference
          if (autoSave) {
            localStorage.setItem("autoSaveLogo", JSON.stringify(true));
          }
        } else {
          console.error("Failed to save GIF");
        }
      }
    }
  } else {
    console.error("No file selected or invalid file");
  }
});

// Function to check and show the "Play All" button
function checkPlayAllButton() {
  const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
  const playAllButtonContainer = document.getElementById(
    "playAllButtonContainer"
  ); // Create a div in HTML for the button

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

async function playAllCustomLogos() {
  const logos = JSON.parse(localStorage.getItem("customLogos")) || {};
  const logoKeys = Object.keys(logos);

  isGifPlaying = true; // Set to true when starting playback

  while (isGifPlaying) {
    // Loop while isGifPlaying is true
    for (let i = 0; i < logoKeys.length; i++) {
      if (!isGifPlaying) break; // Exit loop if playback is stopped

      const logoSrc = logos[logoKeys[i]];
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
      if (index === 0) {
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
    if (logoSrc) {
      logoPreviewImage.src = logoSrc;
      logoPreviewContainer.style.display = "block"; // Show the preview container
    }
  });
  link.addEventListener("mouseleave", function () {
    logoPreviewContainer.style.display = "none"; // Hide the preview container
  });

  link.addEventListener("click", function () {
    const logoSrc = this.getAttribute("data-src");
    if (logoSrc) {
      setSelectedLogo(logoSrc);
    }
  });
});

// Function to delete the custom logo
function deleteCustomLogo(fileName) {
  window.electron.deleteLogo(fileName)
    .then(response => {
      if (response.success) {
        console.log(response.message);  // Log success message
        // Optionally, update the UI or notify the user that the file was deleted
      } 
    })
    .catch(error => {
      console.error('Error deleting the logo:', error);
    });
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

      readAudioMetadata(file, function (hasArtwork) {
        if (hasArtwork) {
          audioImage.style.display = "none";
          console.log("Audio has artwork; skipping default logo");
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
          populateAudioTracks();
          showStatusMessage(""); 
        })
        .catch((error) => {
          console.error("Error playing media:", error);
        });
    });
    // Reset zoom when video ends
     currentMedia.addEventListener("ended", resetZoom);

    return; // Exit early
  }

  // console.error("Unsupported file type:", file.type);
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

  const playbackData = { videoId, time: adjustedTime, timestamp: Date.now() };
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
  const continueButton = document.getElementById("continueButton");
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
    const continueButton = document.getElementById("continueButton");
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
  const continueButton = document.getElementById("continueButton");
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
      const continueButton = document.getElementById("continueButton");
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
  document.getElementById("continueButton").style.display = "none"; // Hide the button after clicking

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

  reader.onload = function (event) {
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

  reader.onerror = function () {
    console.error("Error reading audio file metadata");
    callback(false);
  };

  // Read the first part of the file to get the metadata
  reader.readAsArrayBuffer(file.slice(0, 1024 * 10)); // Read the first 10KB
}

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
    console.error("Unsupported file type");
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
  if (isRandom) {
    let remainingVideos = videoFiles.filter((_, index) => !playedVideos.includes(index));
    return remainingVideos.length > 0 
      ? videoFiles.indexOf(remainingVideos[Math.floor(Math.random() * remainingVideos.length)]) 
      : null;
  }
  return (currentVideoIndex + 1) % videoFiles.length;
}

// Function to determine previous video index
function getPreviousIndex() {
  if (isRandom) {
    let remainingVideos = videoFiles.filter((_, index) => !playedVideos.includes(index));
    return remainingVideos.length > 0 
      ? videoFiles.indexOf(remainingVideos[Math.floor(Math.random() * remainingVideos.length)]) 
      : null;
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

  lastPlayedIndex = nextIndex;
  playVideoByIndex(nextIndex);
  updateNavigationButtons(); // Update button visibility
}

// Function to play the previous video
function playPrevious() {
  const prevIndex = getPreviousIndex();
  if (prevIndex === null && !isLooping) {
    stopPlayback();
    return;
  }

  lastPlayedIndex = prevIndex;
  playVideoByIndex(prevIndex);
  updateNavigationButtons(); // Update button visibility
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
  updateNavigationButtons(); // Update button visibility
  console.log("All videos have been played. Playback stopped.");
}

// Event listeners for stop playback and navigation buttons
document.getElementById("stopPlayback").addEventListener("click", () => {
  stopPlayback();
  updateNavigationButtons(); // Ensure buttons are updated when stopped
});

prevButton.addEventListener("click", playPrevious);
nextButton.addEventListener("click", playNext);

// Handle video end event (to automatically play the next video)
video.addEventListener("ended", () => {
  playNext();
  updateNavigationButtons(); 
});

// Rewind and Forward video 10 sec
rewind.addEventListener("click", () => {
  currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
});
forward.addEventListener("click", () => {
  currentMedia.currentTime = Math.min(currentMedia.duration, currentMedia.currentTime + 10);
});

// Initial button visibility update
updateNavigationButtons();


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

// Volume Tooltip (existing)
const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.backgroundColor = "#000";
tooltip.style.color = "#fff";
tooltip.style.padding = "5px";
tooltip.style.borderRadius = "5px";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

// Audio Context and Gain Node setup (existing)
const videoElement = document.querySelector("video");
const volumeSlider = document.getElementById("volume-slider");
volumeSlider.max = 150; // Set the maximum slider value to 150% volume (changed from 200%)

const audioContext = new AudioContext();
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
  gainNode.gain.linearRampToValueAtTime(
    newVolume,
    audioContext.currentTime + 0.1
  );

  // Update slider value and show tooltip
  volumeSlider.value = newVolume * 100; // Sync slider with volume (0-150 range)
  showTooltip(newVolume);

  // Save the new volume setting to localStorage
  saveVolumeSetting(newVolume);
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
// fontSizeTooltip.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
fontSizeTooltip.style.color = "white";
fontSizeTooltip.style.padding = "5px 10px";
fontSizeTooltip.style.borderRadius = "5px";
fontSizeTooltip.style.zIndex = "1000";
fontSizeTooltip.style.display = "none"; // Initially hidden
document.body.appendChild(fontSizeTooltip);

// Text size adjustment functionality (CTRL + Mouse Wheel)
// Handle text scaling separately
mediaPlayer.addEventListener("wheel", (event) => {
  // Prevent default behavior
  event.preventDefault();

  if (event.ctrlKey && event.shiftKey) {
    // Zoom functionality with CTRL + Shift + Mouse Wheel
    if (event.deltaY < 0) {
      scale = Math.min(scale + 0.1, maxZoom); // Max zoom level
    } else {
      scale = Math.max(scale - 0.1, minZoom); // Min zoom level (no zoom)
    }

    // Apply zoom to the video container
    video.style.transform = `scale(${scale})`;
    video.style.transformOrigin = "center center"; // Zoom from the center

    // Show zoom percentage in statusMessage
    const zoomPercentage = Math.round(scale * 100);
    showStatusMessage(`Zoom: ${zoomPercentage}%`);

  } else if (event.ctrlKey) {
    // Adjust font size with CTRL + Wheel (no SHIFT)
    if (event.deltaY < 0) {
      fontSize = Math.min(maxFontSize, fontSize + 2); // Increase font size
    } else {
      fontSize = Math.max(minFontSize, fontSize - 2); // Decrease font size
    }

    // Apply the updated font size
    videoTitleElement.style.fontSize = `${fontSize}px`;
    statusMessage.style.fontSize = `${fontSize}px`; // Adjust showStatusMessage font size

    // Update the tooltip font size
    fontSizeTooltip.style.fontSize = `${fontSize}px`; // Update the tooltip font size

    // Show font size percentage
    const fontSizePercentage = Math.round(((fontSize - minFontSize) / (maxFontSize - minFontSize)) * 100);
    fontSizeTooltip.textContent = `Text size: ${fontSizePercentage}%`;
    fontSizeTooltip.style.display = "block";

    // Hide font size tooltip after delay
    setTimeout(() => {
      fontSizeTooltip.style.display = "none";
    }, 1500);

  } else {
    // Adjust volume with mouse wheel
    if (event.deltaY < 0) {
      updateVolume(Math.min(2, gainNode.gain.value + 0.1)); // Increase volume up to 200%
    } else if (event.deltaY > 0) {
      updateVolume(Math.max(0, gainNode.gain.value - 0.1)); // Decrease volume
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

// Function to display status messages
function showStatusMessage(message) {
  statusMessage.textContent = message;
  statusMessage.style.display = "block";

  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 3000);
}

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

// Function to show the temporary status message
function showStatusMessage(text) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.innerText = text;
  statusMessage.style.opacity = '1';  // Show the message

  // Hide the message after 2 seconds
  setTimeout(() => {
    statusMessage.style.opacity = '0';  // Fade out the message
  }, 1500);  // Adjust timing as needed
}


// Zoom functionality (CTRL + Shift + Mouse Wheel)
// Handle zoom separately
mediaPlayer.addEventListener("wheel", (event) => {
  // Prevent default behavior
  event.preventDefault();

  if (event.ctrlKey && event.shiftKey) {
    // Zoom functionality with CTRL + Shift + Mouse Wheel
    if (event.deltaY < 0) {
      scale = Math.min(scale + 0.1, maxZoom); // Max zoom level
    } else {
      scale = Math.max(scale - 0.1, minZoom); // Min zoom level (no zoom)
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

// Toggle random mode and show status
function toggleRandomMode() {
  isRandom = !isRandom;

  if (isRandom) {
    randomButton.classList.add("active");
    showStatusMessage("Random: On");
  } else {
    randomButton.classList.remove("active");
    showStatusMessage("Random: Off");
    playedVideos = [];
  }
}

// Toggle repeat mode and show status
function toggleRepeat() {
  isRepeat = !isRepeat;
  currentMedia.loop = isRepeat;

  if (isRepeat) {
    showStatusMessage("Loop: On");
  } else {
    showStatusMessage("Loop: Off");
  }
}

// Event listener for random mode button loopbutton, switchtrack button and Full screen 
document.getElementById("randomButton").addEventListener("click", toggleRandomMode);
document.getElementById("repeatBtn").addEventListener("click", toggleRepeat);
switchAudio.addEventListener("click", populateAudioTracks);
fullscreenBtn.addEventListener("click", toggleFullScreen);

// Add double-click event listener to the media player
mediaPlayer.addEventListener("dblclick", toggleFullScreen);

// Toggle fullscreen mode
function toggleFullScreen() {
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

document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector("nav");
  const footer = document.querySelector("footer");
  const video = document.querySelector("video");
  const navArrows = document.querySelector(".nav-arrows");
  const winButton = document.querySelector(".win-buttons");
  let hideTimeout;
  
  // Function to hide navbar, footer, nav arrows, and cursor
  function hideControls() {
    if (!video.paused) {
      // Only hide controls if video is loaded and playing
      navbar.classList.remove("visible");
      navbar.classList.add("hidden");
  
      footer.classList.remove("visible");
      footer.classList.add("hidden");
  
      navArrows.classList.add("hidden");
      winButton.classList.remove("visible");
      winButton.classList.add("hidden");
  
      document.body.style.cursor = "none"; 
    }
  }
  
  // Function to show navbar, footer, nav arrows, and cursor
  function showControls() {
    navbar.classList.remove("hidden");
    navbar.classList.add("visible");
  
    footer.classList.remove("hidden");
    footer.classList.add("visible");
  
    navArrows.classList.remove("hidden");
    winButton.classList.remove("hidden");
    winButton.classList.add("visible");
  
    document.body.style.cursor = "default"; 
  
    // Clear the previous timeout and start a new one to hide controls after 1000ms
    clearTimeout(hideTimeout);
  
    if (!video.paused) {
      // Only start hide timeout if video is loaded and playing
      hideTimeout = setTimeout(hideControls, 1000); // Hide after 1000ms of inactivity
    }
  }
  
  // Event listener for when the video's metadata is loaded
  video.addEventListener("loadedmetadata", function () {
    hideTimeout = setTimeout(hideControls, 1000); // Start hide timeout
  });
  
  // Event listener for when the video is paused
  video.addEventListener("pause", function () {
    showControls(); // Always show controls when video is paused
  });
  
  // Event listener for when the video is played
  video.addEventListener("play", function () {
    hideTimeout = setTimeout(hideControls, 1000); // Hide controls shortly after playing
  });
  
  // Show controls when the mouse moves and reset the timeout
  video.addEventListener("mousemove", showControls);
  
  // Event listener for the left mouse button to hide/show controls
  video.addEventListener("click", function (event) {
    if (event.button === 0) {
      // 0 is the left mouse button
      if (navbar.classList.contains("hidden")) {
        showControls();
      } else {
        hideControls();
      }
    }
  });
  
  // Event listeners for mouseover on navbar, winButton, navArrows, and footer to stop hiding controls
  navbar.addEventListener("mouseover", function () {
    clearTimeout(hideTimeout);
  });
  winButton.addEventListener("mouseover", function () {
    clearTimeout(hideTimeout);
  });
  navArrows.addEventListener("mouseover", function () {
    clearTimeout(hideTimeout);
  });
  footer.addEventListener("mouseover", function () {
    clearTimeout(hideTimeout);
  });
  
  // Additional mousemove event listener to show controls and hide cursor if video is playing
  video.addEventListener("mousemove", function () {
    if (!video.paused) {
      showControls();
    }
  });
  
  // Ensure controls are shown on initial load
  showControls();

  // Function to show the context menu
  function showContextMenu(event) {
    event.preventDefault();
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
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
    textElement.innerText = "Play"; // Update text to Play
    iconElement.innerHTML = "&#9658;"; // Change icon to play
  } else {
    textElement.innerText = "Pause"; // Update text to Pause
    iconElement.innerHTML = "&#10074;&#10074;"; // Change icon to pause
  }
}

// Handle context menu item clicks
contextMenuItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    const target = event.target;

    if (target.closest("#contextOpenFile")) {
      fileInput.click();
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
    window.electron.close();
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

  if (event.ctrlKey && event.key === "`") {
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
    8: () => {
      rotateVideo(0);
      showStatusMessage(" rotated 0°");
    },
    6: () => {
      rotateVideo(90);
      showStatusMessage("rotated 90°");
    },
    4: () => {
      rotateVideo(-90);
      showStatusMessage("rotated -90°");
    },
    2: () => {
      rotateVideo(180);
      showStatusMessage("rotated 180°");
    },
    0: () => {
      resetZoom();
      showStatusMessage("Zoom Reset");
    }
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
    closeBtn.onclick = function () {
      modal.style.display = "none";
    };

    // Close the modal when the user clicks anywhere outside of it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }
}

const btn = document.getElementById("showShortcuts");
btn.onclick = function () {
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

function populateAudioTracks() {
  const audioTrackList = document.getElementById("audio-track-list");
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
      trackItem.textContent = `${track.label || "Unnamed Track"} - ${
        track.language || "Unknown Language"
      }`;
      trackItem.className = "track-item";
      trackItem.style.border = "1px solid rgba(255, 255, 255, 0.125)";

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

  // Add a click event to toggle visibility
  subDropdown.addEventListener("click", function (e) {
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
window.addEventListener("click", function () {
  document
    .querySelectorAll(".sub-dropdown-content")
    .forEach((content) => (content.style.display = "none"));
});

// Show the sub-dropdown content on hover (but not lock it)
document.querySelectorAll(".sub-dropdown").forEach((subDropdown) => {
  const subDropdownContent = subDropdown.querySelector(".sub-dropdown-content");

  // Show on hover
  subDropdown.addEventListener("mouseover", function () {
    if (subDropdownContent.style.display !== "block") {
      // Only show if it's not locked by click
      subDropdownContent.style.display = "block";
    }
  });

  // Hide on mouseout (unless it's locked by click)
  subDropdown.addEventListener("mouseout", function () {
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

document.querySelector("#windws-close").addEventListener("click",  () => {
  window.electron.close(); 
});

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


const updateOnlineStatus = () => {
  console.log(navigator.onLine ? 'online' : 'offline');
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

updateOnlineStatus();
