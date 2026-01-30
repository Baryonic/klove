document.body.style.background = "black";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

// Number of background videos available
const TOTAL_VIDEOS = 5;

// Pick a random number between 1 and TOTAL_VIDEOS
const randomIndex = Math.floor(Math.random() * TOTAL_VIDEOS) + 1;

// Format number as two digits (01, 02, 03…)
const formatted = String(randomIndex).padStart(2, "0");

// Build the final path
const videoPath = `videos/background/bkgnd${formatted}.mp4`;

// Create video element
const video = document.createElement("video");
video.src = videoPath;
video.autoplay = true;
video.muted = true;
video.playsInline = true;

Object.assign(video.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: "-1",
    pointerEvents: "none",
    backgroundColor: "black"
});

document.body.appendChild(video);

video.play().catch(err => console.log("Autoplay blocked:", err));

video.addEventListener("ended", () => {
    video.style.transition = "opacity 10s ease-out";
    video.style.opacity = "0";

    setTimeout(() => {
        video.remove();
        document.body.style.background = "black";
    }, 1000);
});