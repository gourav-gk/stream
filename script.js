const playPauseBtn = document.querySelector(".play-pause-btn")
const theaterBtn = document.querySelector(".theater-btn")
const fullScreenBtn = document.querySelector(".full-screen-btn")
const miniPlayerBtn = document.querySelector(".mini-player-btn")
const muteBtn = document.querySelector(".mute-btn")
const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")
const currentTimeElem = document.querySelector(".current-time")
const totalTimeElem = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const volumeSlider = document.querySelector(".volume-slider")
const videoContainer = document.querySelector(".video-container")
const timelineContainer = document.querySelector(".timeline-container")
const settingBtn = document.querySelector(".setting-btn")
const settingBox = document.querySelector(".setting-box")
const settingTab = document.querySelectorAll(".setting-tab")
const optionBox = document.querySelector(".option-box")
const optionBoxHeader = document.querySelector(".option-box-header")
const video = document.querySelector("video")
const speedVal = document.getElementById("speed-val")


document.addEventListener("keydown", e => {
  const tagName = document.activeElement.tagName.toLowerCase()

  if (tagName === "input") return

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return
    case "k":
      togglePlay()
      break
    case "f":
      toggleFullScreenMode()
      break
    case "t":
      toggleTheaterMode()
      break
    case "i":
      toggleMiniPlayerMode()
      break
    case "m":
      toggleMute()
      break
    case "arrowleft":
    case "j":
      skip(-5)
      break
    case "arrowright":
    case "l":
      skip(5)
      break
    case "c":
      toggleCaptions()
      break
  }
})

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  )

  const previewImgSrc = `assets/previewImgs/thumbnail_${previewImgNumber}.jpg`
  previewImg.src = previewImgSrc
  timelineContainer.style.setProperty("--preview-position", percent)

  if (isScrubbing) {
    e.preventDefault()
    thumbnailImg.src = previewImgSrc
    timelineContainer.style.setProperty("--progress-position", percent)
  }
}

// Playback Speed
speedBtn.addEventListener("click", ()=>{
  let newPlaybackRate = video.playbackRate + 0.25
  if (newPlaybackRate > 2) newPlaybackRate = 0.25  
  changePlaybackSpeed(newPlaybackRate)
})

function changePlaybackSpeed(newPlaybackRate) {
  //let newPlaybackRate = video.playbackRate + 0.25
  //if (newPlaybackRate > 2) newPlaybackRate = 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
  speedVal.textContent = `${newPlaybackRate}`
}

// Captions
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)

function toggleCaptions() {
  const isHidden = captions.mode === "hidden"
  captions.mode = isHidden ? "showing" : "hidden"
  videoContainer.classList.toggle("captions", isHidden)
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration)
})

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime)
  const percent = video.currentTime / video.duration
  timelineContainer.style.setProperty("--progress-position", percent)
})

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
})
function formatDuration(time) {
  const seconds = Math.floor(time % 60)
  const minutes = Math.floor(time / 60) % 60
  const hours = Math.floor(time / 3600)
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`
  }
}

function skip(duration) {
  video.currentTime += duration
}

// Volume
muteBtn.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value
  video.muted = e.target.value === 0
})

function toggleMute() {
  video.muted = !video.muted
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume
  let volumeLevel
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    volumeLevel = "muted"
  } else if (video.volume >= 0.5) {
    volumeLevel = "high"
  } else {
    volumeLevel = "low"
  }

  videoContainer.dataset.volumeLevel = volumeLevel
})

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode)
fullScreenBtn.addEventListener("click", toggleFullScreenMode)
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater")
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture()
  } else {
    video.requestPictureInPicture()
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player")
})

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)

function togglePlay() {
  video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
  videoContainer.classList.remove("thumbshow");
  document.getElementById('play-icon').style.display = "none"
})

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused")
})

// Setting 
settingBtn.addEventListener("click",()=>{
  if(settingBox.classList.contains("visible") || optionBox.classList.contains("visible"))
  {
    settingBox.classList.remove("visible")
    settingBtn.classList.remove("active")
    optionBox.classList.remove("visible")
  }else{
    settingBox.classList.add("visible")
    settingBtn.classList.add("active")
  }
})

settingTab.forEach(tab => {
  tab.addEventListener("click",()=>{
    settingBox.classList.remove("visible")
    optionBox.classList.add("visible")
    populateOption(tab.attributes['tab-for'].nodeValue)

  })
})

function populateOption(type){
  let option = `<div class="option-box-header" onclick="backSetting()"><img src="assets/img/left.png"><div class="pl-10">${type.toUpperCase()}</div></div><hr>`
  
  if(type == "quality"){
    hls.levels.forEach(level => {
      option += `<div class="option-tab">${level.height}</div>`
    })
    
  }
  else if(type == "speed"){
    for(var i= 0.25; i<= 2;i+=0.25)
    {
      option += `<div class="option-tab">${i}</div>`
    }

  }
  optionBox.innerHTML = option
  document.querySelectorAll(".option-tab").forEach(btn=>{
    btn.addEventListener("click",()=>{
      updateSetting(type,btn.innerText)
    })
  })
}

function updateSetting(type,text){
  if(type == "quality")
  {
    updateQuality(+text)
  }
  else if(type == "speed")
  {
    changePlaybackSpeed(text)
    backSetting()
  }
}

function updateQuality(newQuality){
  window.hls.levels.forEach((level, levelIndex) => {
      if(level.height === newQuality){
          window.hls.currentLevel = levelIndex
          document.getElementById("quality-val").textContent = `${newQuality}p`
      }
  })
  backSetting()
}

function backSetting(){
  optionBox.classList.remove("visible")
  settingBox.classList.add("visible")
}

document.body.addEventListener("click", (event) => {
  if (settingBox.classList.contains("visible") && !settingBtn.contains(event.target) && !settingBox.contains(event.target) && !optionBox.contains(event.target)) {
    settingBox.classList.remove("visible")
    settingBtn.classList.remove("active")
  }else if(optionBox.classList.contains("visible") && !settingBox.contains(event.target) && !optionBox.contains(event.target)){
    optionBox.classList.remove("visible")
  }
});
