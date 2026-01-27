document.body.style.background = "black";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

// Fetch list of files from /videos/background/
fetch("/videos/background/")
    .then(res => res.text())
    .then(html => {
        // Extract .mp4 filenames from directory listing
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const links = [...doc.querySelectorAll("a")];

        const mp4Files = links
            .map(a => a.getAttribute("href"))
            .filter(href => href && href.toLowerCase().endsWith(".mp4"));

        if (mp4Files.length === 0) {
            console.error("No MP4 files found in /videos/background/");
            return;
        }

        // Pick a random video
        const randomVideo = mp4Files[Math.floor(Math.random() * mp4Files.length-1)];

        // Create video element
        const video = document.createElement("video");
        video.src = "./videos/background/" + randomVideo;
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
    })
    .catch(err => console.error("Error loading video list:", err));