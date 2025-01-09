const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];


// Constants
const MAX_PARTICLES = 80;
const LARGE_PARTICLES_COUNT = 5;
const MOUSE_RADIUS = 200;
const SMALL_PARTICLE_SIZE = { min: 2, max: 4 };
const LARGE_PARTICLE_SIZE = { min: 5, max: 12 };
const SMALL_PARTICLE_MASS = 1;
const LARGE_PARTICLE_MASS = 5;
const PARTICLE_SPEED = { min: -1, max: 1 };
const ATTRACTION_FORCE = 0.05;
const RESIZE_DELAY = 150; // Delay in ms before showing canvas after resize

// Mouse tracker
const mouse = {
  x: null,
  y: null,
  radius: MOUSE_RADIUS,
};

// Add resize timeout variable
let resizeTimeout;

// Track mouse position
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

class Particle {
  constructor(x, y, dx, dy, size, color, mass) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.dx = dx || (Math.random() * (PARTICLE_SPEED.max - PARTICLE_SPEED.min) + PARTICLE_SPEED.min);
    this.dy = dy || (Math.random() * (PARTICLE_SPEED.max - PARTICLE_SPEED.min) + PARTICLE_SPEED.min);
    this.size = size || Math.random() * (SMALL_PARTICLE_SIZE.max - SMALL_PARTICLE_SIZE.min) + SMALL_PARTICLE_SIZE.min;
    this.color = color || "lightblue";
    this.mass = mass || SMALL_PARTICLE_MASS;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    // Boundary collision
    if (this.x + this.size > canvas.width || this.x - this.size < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.size > canvas.height || this.y - this.size < 0) {
      this.dy = -this.dy;
    }

    // Magnet effect
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance < mouse.radius) {
      const angle = Math.atan2(dy, dx);
      const force = (mouse.radius - distance) / mouse.radius; // Force is stronger closer to the cursor
      const forceX = (Math.cos(angle) * force * ATTRACTION_FORCE) / this.mass;
      const forceY = (Math.sin(angle) * force * ATTRACTION_FORCE) / this.mass;

      this.dx += forceX;
      this.dy += forceY;
    }

    this.x += this.dx;
    this.y += this.dy;

    this.draw();
  }
}

function initParticles() {
  particlesArray = [];
  // Create large particles
  for (let i = 0; i < LARGE_PARTICLES_COUNT; i++) {
    particlesArray.push(
      new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        (Math.random() - 0.5) * 0.5, // Smaller initial velocity for large particles
        (Math.random() - 0.5) * 0.5,
        Math.random() * (LARGE_PARTICLE_SIZE.max - LARGE_PARTICLE_SIZE.min) + LARGE_PARTICLE_SIZE.min,
        LARGE_PARTICLE_MASS
      )
    );
  }

  // Create smaller, regular particles
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particlesArray.push(new Particle());
  }
}

function connectParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    for (let j = i + 1; j < particlesArray.length; j++) {
      const distance = Math.sqrt(
        (particlesArray[i].x - particlesArray[j].x) ** 2 +
        (particlesArray[i].y - particlesArray[j].y) ** 2
      );
      if (distance < 100) {
        ctx.beginPath();
        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
        ctx.strokeStyle = `rgba(173, 216, 230, ${1 - distance / 100})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach((particle) => particle.update());
  connectParticles();
  requestAnimationFrame(animate);
}

// Update canvas size on window resize with debouncing
window.addEventListener("resize", () => {
  // Hide canvas immediately when resize starts
  canvas.style.display = 'none';

  // Clear previous timeout if it exists
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  // Set new timeout
  resizeTimeout = setTimeout(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    // Show canvas after resize is complete
    canvas.style.display = 'block';
  }, RESIZE_DELAY);
});

// Initialize and animate
initParticles();
animate();
