"use strict";

// Primary customization values.
const MAIN_MESSAGE = "Love you.";
const PARTICLE_TEXT_VARIANTS = [
  "iloveyou",
  "i loveyou",
  "ilove you",
  "i love you"
];

const PARTICLE_COUNT = 700;
const HEART_Y_OFFSET = -90;
const PULSE_SPEED = 0.0009;
const PULSE_AMOUNT = 0.035;
const GLITCH_INTENSITY = 0.18;
const HEART_COLOR_PALETTE = ["#ff174f", "#ff2f6d", "#ff5d7e", "#ff7a45", "#fff0f5", "#ff9ab1", "#8fffd2"];
const FLOATING_TEXT_VARIANTS = [...PARTICLE_TEXT_VARIANTS, "0xLOVE", "heart.key", "decrypt", "01001001"];

const CONFIG = {
  introTypeSpeed: 34,
  revealDuration: 2200,
  particleFontMin: 8,
  particleFontMax: 15,
  floatParticleCount: 72,
  centerGlowRadius: 0.18,
  heartLineWidth: 28
};

const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
const mainMessage = document.getElementById("mainMessage");
const revealButton = document.getElementById("revealButton");
const terminalLines = Array.from(document.querySelectorAll(".terminal-line"));
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let dpr = 1;
let heartScale = 1;
let centerX = 0;
let centerY = 0;
let particles = [];
let floaters = [];
let animationFrame = 0;
let revealStart = 0;
let revealed = false;
let finalMode = false;
let loopRunning = false;

mainMessage.textContent = MAIN_MESSAGE;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickColor(index) {
  return HEART_COLOR_PALETTE[index % HEART_COLOR_PALETTE.length];
}

function pickTextVariant(variants = PARTICLE_TEXT_VARIANTS) {
  return variants[Math.floor(Math.random() * variants.length)];
}

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  centerX = width / 2;
  heartScale = Math.min(width / 42, height / 42);
  centerY = getHeartCenterY();

  // Rebuild targets whenever the viewport changes so the heart stays centered.
  buildParticles();

  if (!revealed || finalMode || reducedMotionQuery.matches) {
    drawFrame(performance.now());
  }
}

function getResponsiveHeartYOffset() {
  if (width <= 560) {
    return clamp(HEART_Y_OFFSET * 0.72, -80, -50);
  }

  return clamp(HEART_Y_OFFSET - width * 0.015, -130, -90);
}

function getHeartCenterY() {
  const targetY = height / 2 + getResponsiveHeartYOffset();
  const topSafeY = 18 + 13.5 * heartScale + CONFIG.heartLineWidth;
  const bottomSafeY = height - 24 - 17.4 * heartScale - CONFIG.heartLineWidth;

  return clamp(targetY, topSafeY, Math.max(topSafeY, bottomSafeY));
}

function buildParticles() {
  const nextParticles = [];
  const count = reducedMotionQuery.matches ? Math.min(PARTICLE_COUNT, 520) : PARTICLE_COUNT;

  for (let i = 0; i < count; i += 1) {
    // Start with the classic heart curve, then vary depth and jitter for an organic text cloud.
    const t = (i / count) * Math.PI * 2;
    const curve = heartPoint(t);
    const layer = Math.random();
    const fillDepth = 0.22 + Math.pow(Math.random(), 0.42) * 0.78;
    const radiusJitter = CONFIG.heartLineWidth * (0.18 + layer * 0.44);
    const targetX = centerX + curve.x * heartScale * fillDepth + randomBetween(-radiusJitter, radiusJitter);
    const targetY = centerY - curve.y * heartScale * fillDepth + randomBetween(-radiusJitter, radiusJitter);
    const burstRadius = Math.min(width, height) * randomBetween(0.1, 0.5);
    const burstAngle = Math.random() * Math.PI * 2;

    nextParticles.push({
      targetX,
      targetY,
      startX: centerX + Math.cos(burstAngle) * burstRadius * randomBetween(0.08, 0.24),
      startY: centerY + Math.sin(burstAngle) * burstRadius * randomBetween(0.08, 0.24),
      scatterX: centerX + Math.cos(burstAngle) * burstRadius,
      scatterY: centerY + Math.sin(burstAngle) * burstRadius,
      color: pickColor(i + Math.floor(Math.random() * HEART_COLOR_PALETTE.length)),
      text: pickTextVariant(),
      size: randomBetween(CONFIG.particleFontMin, CONFIG.particleFontMax) * clamp(heartScale / 18, 0.72, 1.18),
      alpha: randomBetween(0.58, 1),
      delay: randomBetween(0, 0.24),
      drift: randomBetween(0.6, 2.8),
      phase: Math.random() * Math.PI * 2
    });
  }

  particles = nextParticles;
  floaters = Array.from({ length: CONFIG.floatParticleCount }, (_, index) => ({
    x: randomBetween(width * 0.12, width * 0.88),
    y: randomBetween(height * 0.12, height * 0.9),
    color: pickColor(index + 2),
    text: pickTextVariant(FLOATING_TEXT_VARIANTS),
    size: randomBetween(7, 11) * clamp(width / 900, 0.72, 1),
    alpha: randomBetween(0.16, 0.38),
    speed: randomBetween(0.12, 0.38),
    phase: Math.random() * Math.PI * 2
  }));
}

async function typeTerminalLines() {
  if (reducedMotionQuery.matches) {
    terminalLines.forEach((line) => {
      line.textContent = line.dataset.type;
    });
    return;
  }

  for (const line of terminalLines) {
    line.classList.add("is-active");
    const text = line.dataset.type || "";

    for (let i = 0; i <= text.length; i += 1) {
      if (revealed) {
        line.textContent = text;
        break;
      }

      line.textContent = text.slice(0, i);
      await wait(CONFIG.introTypeSpeed);
    }

    line.classList.remove("is-active");
    await wait(180);
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function triggerReveal() {
  if (revealed) {
    return;
  }

  revealed = true;
  finalMode = reducedMotionQuery.matches;
  revealStart = performance.now();
  document.body.classList.add("revealed");
  revealButton.setAttribute("aria-expanded", "true");

  if (finalMode) {
    drawFrame(revealStart);
  } else {
    startAnimationLoop();
  }
}

function drawBackgroundGlow(time) {
  const pulse = finalMode ? 1 : 1 + Math.sin(time * PULSE_SPEED) * PULSE_AMOUNT;
  const coreRadius = Math.min(width, height) * CONFIG.centerGlowRadius * pulse;
  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2.8);

  glow.addColorStop(0, "rgba(255, 47, 109, 0.28)");
  glow.addColorStop(0.34, "rgba(255, 23, 79, 0.16)");
  glow.addColorStop(0.62, "rgba(121, 255, 200, 0.035)");
  glow.addColorStop(1, "rgba(255, 23, 79, 0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius * 2.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawFloaters(time) {
  ctx.save();
  ctx.font = `${Math.max(7, width * 0.012)}px "SFMono-Regular", Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 12;

  floaters.forEach((floater, index) => {
    const slowTime = time * 0.001 * floater.speed;
    const x = floater.x + Math.sin(slowTime + floater.phase) * 18;
    const y = ((floater.y - slowTime * 42 + height + 60) % (height + 120)) - 60;
    const fade = 0.58 + Math.sin(time * 0.0014 + index) * 0.3;

    ctx.globalAlpha = floater.alpha * fade;
    ctx.fillStyle = floater.color;
    ctx.shadowColor = floater.color;
    ctx.fillText(floater.text, x, y);
  });

  ctx.restore();
}

function drawGlitchBands(time, revealProgress) {
  if (finalMode || reducedMotionQuery.matches) {
    return;
  }

  const gate = Math.sin(time * 0.0013) + Math.sin(time * 0.0037);

  if (gate < 1.45) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const bandCount = Math.max(1, Math.round(GLITCH_INTENSITY * 10));

  for (let i = 0; i < bandCount; i += 1) {
    const y = randomBetween(height * 0.08, height * 0.92);
    const bandHeight = randomBetween(1, 5);
    const x = randomBetween(-width * 0.1, width * 0.28);
    const bandWidth = randomBetween(width * 0.2, width * 0.9);
    const color = i % 3 === 0 ? "121, 255, 200" : "255, 47, 109";

    ctx.globalAlpha = randomBetween(0.018, 0.06) * revealProgress;
    ctx.fillStyle = `rgba(${color}, 1)`;
    ctx.fillRect(x, y, bandWidth, bandHeight);
  }

  ctx.restore();
}

function drawHeartParticles(time, revealProgress) {
  const progress = finalMode ? 1 : easeOutCubic(revealProgress);
  const pulse = finalMode || revealProgress < 1 ? 1 : 1 + Math.sin(time * PULSE_SPEED) * PULSE_AMOUNT;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  particles.forEach((particle) => {
    // Particles briefly burst from the center before easing into the final heart.
    const localProgress = clamp((progress - particle.delay) / (1 - particle.delay), 0, 1);
    const eased = easeInOutSine(localProgress);
    const burstProgress = easeOutCubic(clamp(localProgress / 0.3, 0, 1));
    const originX = particle.startX + (particle.scatterX - particle.startX) * burstProgress;
    const originY = particle.startY + (particle.scatterY - particle.startY) * burstProgress;
    const settleWave = Math.sin(time * 0.002 + particle.phase) * particle.drift;
    const startX = finalMode ? particle.targetX : originX;
    const startY = finalMode ? particle.targetY : originY;
    const x = startX + (particle.targetX - startX) * eased + settleWave * (0.2 + eased);
    const y = startY + (particle.targetY - startY) * eased + Math.cos(time * 0.002 + particle.phase) * particle.drift * (0.2 + eased);
    const px = centerX + (x - centerX) * pulse;
    const py = centerY + (y - centerY) * pulse;
    const alpha = finalMode ? particle.alpha : clamp(localProgress * 1.35, 0, particle.alpha);

    ctx.globalAlpha = alpha;
    ctx.font = `${particle.size}px "SFMono-Regular", Consolas, monospace`;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 10 + localProgress * 12;
    ctx.fillText(particle.text, px, py);
  });

  ctx.restore();
}

function drawFrame(time) {
  ctx.clearRect(0, 0, width, height);

  if (!revealed && !finalMode) {
    return;
  }

  const elapsed = finalMode ? CONFIG.revealDuration : time - revealStart;
  const revealProgress = clamp(elapsed / CONFIG.revealDuration, 0, 1);

  drawBackgroundGlow(time);
  drawFloaters(time);
  drawGlitchBands(time, revealProgress);
  drawHeartParticles(time, revealProgress);

  if (revealed && !reducedMotionQuery.matches) {
    animationFrame = window.requestAnimationFrame(drawFrame);
  }
}

function startAnimationLoop() {
  if (loopRunning) {
    return;
  }

  loopRunning = true;
  animationFrame = window.requestAnimationFrame(drawFrame);
}

function handleDocumentClick(event) {
  const target = event.target;

  if (target instanceof HTMLElement && target.closest("a")) {
    return;
  }

  triggerReveal();
}

function handleButtonKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    triggerReveal();
  }
}

function handleMotionPreferenceChange() {
  document.body.classList.toggle("reduced-motion", reducedMotionQuery.matches);

  if (reducedMotionQuery.matches && revealed) {
    finalMode = true;
    loopRunning = false;
    window.cancelAnimationFrame(animationFrame);
    drawFrame(performance.now());
  }
}

function init() {
  document.body.classList.toggle("reduced-motion", reducedMotionQuery.matches);
  resizeCanvas();
  typeTerminalLines();

  revealButton.addEventListener("click", triggerReveal);
  revealButton.addEventListener("keydown", handleButtonKeydown);
  document.addEventListener("click", handleDocumentClick);
  window.addEventListener("resize", resizeCanvas);
  reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
}

init();
