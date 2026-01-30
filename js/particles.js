// =======================================
// STARLIKE PARTICLE GRAVITY BACKGROUND
// Particles permanently die on mouse collision (<5px)
// Diffraction-cross star glow with variable-width spikes
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
// Config
// -------------------------------

// Fraction of spike length that uses thick width (0–1)
const SPIKE_THICK_FRACTION = 0.33; // 1/3 by default

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
const bursts = []; // explosion fragments

class BurstParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 1;
        this.size = Math.random() * 1.5 + 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.92;
        this.vy *= 0.92;

        this.life -= 0.04;
    }

    draw() {
        if (this.life <= 0) return;

        ctx.fillStyle = `rgba(255,255,255,${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        this.size = Math.random() * 1.5 + 1;
        this.dead = false;
    }

    update() {
        if (this.dead) return;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

        // Collision → burst + permanent death
        if (dist < 5) {
            for (let i = 0; i < 10; i++) {
                bursts.push(new BurstParticle(this.x, this.y));
            }
            this.dead = true;
            return;
        }

        // Gravity force (inverse-square)
        const force = 200 / (dist * dist);

        this.vx += force * dx / dist;
        this.vy += force * dy / dist;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap edges
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
    }

    draw() {
        if (this.dead) return;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const speedPerSecond = speed * 60;
        const warpSpeed = w * 0.2;
        const isWarping = speedPerSecond > warpSpeed;

        // Motion trail
        ctx.strokeStyle = isWarping
            ? "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.2)";

        ctx.lineWidth = this.size * (isWarping ? 0.6 : 0.4);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
        ctx.stroke();

        // Warp mode: no glow
        if (isWarping) {
            ctx.fillStyle = "white";
            ctx.fillRect(this.x, this.y, 1.5, 1.5);
            return;
        }

        // -------------------------------
        // Diffraction-cross star glow
        // -------------------------------

        const pulse = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
        const intensity = Math.min(speed * 0.03 + pulse, 1);

        const coreAlpha = 0.8 * intensity;
        const spikeAlpha = 0.4 * intensity;

        // Core point
        ctx.fillStyle = `rgba(255,255,255,${coreAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // -------------------------------
        // Cross spikes with variable width
        // -------------------------------

        const spikeLength = this.size * 3;
        const thickPart = spikeLength * SPIKE_THICK_FRACTION;

        ctx.strokeStyle = `rgba(255,255,255,${spikeAlpha})`;

        // === Horizontal spike ===

        // Thick inner segment (2px)
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - thickPart, this.y);
        ctx.lineTo(this.x + thickPart, this.y);
        ctx.stroke();

        // Thin outer segments (1px)
        ctx.lineWidth = 1;

        // Left thin segment
        ctx.beginPath();
        ctx.moveTo(this.x - spikeLength, this.y);
        ctx.lineTo(this.x - thickPart, this.y);
        ctx.stroke();

        // Right thin segment
        ctx.beginPath();
        ctx.moveTo(this.x + thickPart, this.y);
        ctx.lineTo(this.x + spikeLength, this.y);
        ctx.stroke();

        // === Vertical spike ===

        // Thick inner segment (2px)
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - thickPart);
        ctx.lineTo(this.x, this.y + thickPart);
        ctx.stroke();

        // Thin outer segments (1px)
        ctx.lineWidth = 1;

        // Top thin segment
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - spikeLength);
        ctx.lineTo(this.x, this.y - thickPart);
        ctx.stroke();

        // Bottom thin segment
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + thickPart);
        ctx.lineTo(this.x, this.y + spikeLength);
        ctx.stroke();
    }
}

// Create initial particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

// -------------------------------
// Animation loop
// -------------------------------
function animate() {
    ctx.clearRect(0, 0, w, h);

    // Update + draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Remove dead particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].dead) particles.splice(i, 1);
    }

    // Update + draw bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.update();
        b.draw();
        if (b.life <= 0) bursts.splice(i, 1);
    }

    requestAnimationFrame(animate);
}

animate();