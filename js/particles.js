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
const LARGE_PARTICLE_SIZE = { min: 4, max: 6 };
const SMALL_PARTICLE_MASS = 1;
const LARGE_PARTICLE_MASS = 5;
const PARTICLE_SPEED = { min: -1, max: 1 };
const ATTRACTION_FORCE = 0.05;
const RESIZE_DELAY = 150;

const mouse = {
  x: null,
  y: null,
  radius: MOUSE_RADIUS,
};

let resizeTimeout;

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

function createParticle(isLarge = false) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: Math.random() * (PARTICLE_SPEED.max - PARTICLE_SPEED.min) + PARTICLE_SPEED.min,
    dy: Math.random() * (PARTICLE_SPEED.max - PARTICLE_SPEED.min) + PARTICLE_SPEED.min,
    size: isLarge
      ? Math.random() * (LARGE_PARTICLE_SIZE.max - LARGE_PARTICLE_SIZE.min) + LARGE_PARTICLE_SIZE.min
      : Math.random() * (SMALL_PARTICLE_SIZE.max - SMALL_PARTICLE_SIZE.min) + SMALL_PARTICLE_SIZE.min,
    color: "lightblue",
    mass: isLarge ? LARGE_PARTICLE_MASS : SMALL_PARTICLE_MASS
  };
}

function drawParticle(particle) {
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fillStyle = particle.color;
  ctx.fill();
}

function updateParticle(particle) {
  // Magnet effect
  const dx = mouse.x - particle.x;
  const dy = mouse.y - particle.y;
  const distance = Math.sqrt(dx ** 2 + dy ** 2);

  if (distance < mouse.radius) {
    const angle = Math.atan2(dy, dx);
    const force = (mouse.radius - distance) / mouse.radius;
    const forceX = (Math.cos(angle) * force * ATTRACTION_FORCE) / particle.mass;
    const forceY = (Math.sin(angle) * force * ATTRACTION_FORCE) / particle.mass;

    particle.dx += forceX;
    particle.dy += forceY;
  }

  particle.x += particle.dx;
  particle.y += particle.dy;

  drawParticle(particle);

  // Check if particle is within bounds
  return !(
    particle.x + particle.size < 0 ||
    particle.x - particle.size > canvas.width ||
    particle.y + particle.size < 0 ||
    particle.y - particle.size > canvas.height
  );
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

function initParticles() {
  particlesArray = [];

  // Create large particles
  for (let i = 0; i < LARGE_PARTICLES_COUNT; i++) {
    particlesArray.push(createParticle(true));
  }

  // Create smaller, regular particles
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particlesArray.push(createParticle(false));
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and filter out particles that are out of bounds
  particlesArray = particlesArray.filter(particle => updateParticle(particle));

  // Add new particles to maintain the desired count
  while (particlesArray.length < MAX_PARTICLES + LARGE_PARTICLES_COUNT) {
    particlesArray.push(createParticle(particlesArray.length < LARGE_PARTICLES_COUNT));
  }

  connectParticles();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  canvas.style.display = 'none';

  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = setTimeout(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    canvas.style.display = 'block';
  }, RESIZE_DELAY);
});

initParticles();
animate();
