// =======================================
// STARLIKE PARTICLE GRAVITY BACKGROUND
// Glow disappears at high speed
// =======================================

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
});

// -------------------------------
// Mouse tracking
// -------------------------------
const mouse = {
    x: w / 2,
    y: h / 2,
    lastMove: Date.now()
};

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.lastMove = Date.now();
});

// -------------------------------
// Particle system
// -------------------------------
const PARTICLE_COUNT = 10;
const particles = [];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;

        // Initial kinetic energy
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        this.size = Math.random() * 1.5 + 1;
    }

    update() {
        // Vector to mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

        // Gravity force (inverse-square)
        const force = 200 / (dist * dist);

        // Accelerate freely (no velocity limit)
        this.vx += force * dx / dist;
        this.vy += force * dy / dist;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
    }

    draw() {
        // Speed in pixels per frame
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        // Convert to pixels per second (approx)
        const speedPerSecond = speed * 60;

        // Threshold: 2 screen widths per second
        const warpSpeed = w * 0.2;

        const isWarping = speedPerSecond > warpSpeed;

        // -------------------------------
        // Motion trail (always visible)
        // -------------------------------
        ctx.strokeStyle = isWarping
            ? "rgba(255,255,255,0.5)"   // brighter trail at warp
            : "rgba(255,255,255,0.2)";

        ctx.lineWidth = this.size * (isWarping ? 0.6 : 0.4);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
        ctx.stroke();

        // -------------------------------
        // Warp mode: NO glow, only pixel
        // -------------------------------
        if (isWarping) {
            ctx.fillStyle = "white";
            ctx.fillRect(this.x, this.y, 1.5, 1.5);
            return;
        }

        // -------------------------------
        // Normal mode: Radial glow
        // -------------------------------
        const glowSize = this.size * 6;

        const g = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize
        );

        const intensity = Math.min(speed * 0.03, 1);

        g.addColorStop(0, `rgba(255,255,255,${0.8 + intensity * 0.4})`);
        g.addColorStop(0.2, `rgba(255,255,255,${0.4 + intensity * 0.3})`);
        g.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

// -------------------------------
// Animation loop
// -------------------------------
function animate() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();