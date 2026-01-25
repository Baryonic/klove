document.body.style.background = "black";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

const video = document.createElement("video");
video.src = "videos/explosion.mp4";   // <-- FIXED PATH
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
    video.style.transition = "opacity 20s ease-out";
    video.style.opacity = "0";

    setTimeout(() => {
        video.remove();
        document.body.style.background = "black";
    }, 1000);
});