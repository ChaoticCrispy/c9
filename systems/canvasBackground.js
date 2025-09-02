const simplex = new SimplexNoise();

let animationId = null;
let activeEffect = null;

// ---------- Background Effect Manager ----------
let bg = {
  canvas: null,
  ctx: null,
};

function initBackgroundCanvas() {
  bg.canvas = document.getElementById("backgroundCanvas");
  if (!bg.canvas) {
    console.error("Canvas with id 'backgroundCanvas' not found!");
    return;
  }
  bg.ctx = bg.canvas.getContext("2d");
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);

  // run default effect
  const theme = localStorage.getItem("editorTheme") || "dark";
  let effect;
  if (theme === "matrix") {
    effect = "matrix";
  } else if (theme === "custom") {
    effect = localStorage.getItem("backgroundEffect") || "none";
  } else {
    effect = "none";
  }
  updateBackgroundEffect(effect);
}

function stopBackgroundEffect() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (bg.ctx && bg.canvas) {
    bg.ctx.clearRect(0, 0, bg.canvas.width, bg.canvas.height);
  }
  activeEffect = null;
}

function resizeCanvas() {
  if (!bg.canvas) return;
  bg.canvas.width = window.innerWidth;
  bg.canvas.height = window.innerHeight;
}

// --- Helpers ---
function getAlpha() {
  const slider = document.getElementById("bg-alpha");
  if (!slider) return 1;
  let val = parseFloat(slider.value);
  if (isNaN(val)) val = 1;
  return Math.min(Math.max(val, 0), 1);
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// ------------- SWITCHER -------------
function updateBackgroundEffect(effectName) {
  stopBackgroundEffect();
  activeEffect = effectName;

  if (!bg.canvas || !bg.ctx) return;
  if (effectName === "constellation") {
    runConstellation(bg.canvas, bg.ctx);
  } else if (effectName === "matrix") {
    runMatrix(bg.canvas, bg.ctx);
  } else if (effectName === "night sky") {
    runStarfield(bg.canvas, bg.ctx);
  } else if (effectName === "aurora") {
    runAurora(bg.canvas, bg.ctx);
  } else if (effectName === "ntlights") {
    runNorthernLights(bg.canvas, bg.ctx);
  } else if (effectName === "orbs") {
    runCalmOrbs(bg.canvas, bg.ctx);
  } else {
    bg.ctx.clearRect(0, 0, bg.canvas.width, bg.canvas.height);
  }
}

window.initCanvasBackground = initBackgroundCanvas;
window.updateBackgroundEffect = updateBackgroundEffect;

// ========================================================================================================
// === EFFECTS ===

// --- CONSTELLATION ---
function runConstellation(canvas, ctx) {
  stopBackgroundEffect();
  resizeCanvas();
  activeEffect = "constellation";

  const DOT_COUNT = 150;
  const maxDist = 160;
  const COLORS = ["#ffffff", "#aaddff", "#ffd2a1", "#b5ffe1"];

  const dots = Array.from({ length: DOT_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7,
    radius: Math.random() * 2 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    twinkle: Math.random() * Math.PI * 2
  }));

  let driftAngle = 0;

  function draw() {
    if (activeEffect !== "constellation") return;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#02010a");
    bgGrad.addColorStop(1, "#000000");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const globalAlpha = getAlpha();

    driftAngle += 0.001;
    const driftX = Math.sin(driftAngle) * 0.2;
    const driftY = Math.cos(driftAngle) * 0.2;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.twinkle += 0.03;
      const twinkleAlpha = 0.6 + Math.sin(dot.twinkle) * 0.4;

      const glowRadius = 10;
      const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, glowRadius);
      gradient.addColorStop(0, `rgba(255,255,255,${0.25 * twinkleAlpha * globalAlpha})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(dot.x - glowRadius, dot.y - glowRadius, glowRadius * 2, glowRadius * 2);

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.globalAlpha = twinkleAlpha * globalAlpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      for (let j = i + 1; j < dots.length; j++) {
        const dx = dot.x - dots[j].x;
        const dy = dot.y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const fade = 1 - dist / maxDist;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200,220,255,${fade * 0.5 * globalAlpha})`;
          ctx.lineWidth = fade * 1.5;
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }

      dot.x += dot.vx + driftX * 0.2;
      dot.y += dot.vy + driftY * 0.2;
      if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
      if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
    }

    animationId = requestAnimationFrame(draw);
  }

  draw();
}

// --- STARFIELD ---
function runStarfield(canvas, ctx) {
  stopBackgroundEffect();
  resizeCanvas();
  activeEffect = "githubStarfield";

  const STAR_COUNT = 300;
  const FOV = 300;
  const SPEED = 0.02;
  const Z_DEPTH = 1000;
  const COLORS = ["#ffffff", "#ffe9c4", "#d4fbff", "#ffd2a1"];

  let stars = Array.from({ length: STAR_COUNT }, () => ({
    x: (Math.random() - 0.5) * canvas.width,
    y: (Math.random() - 0.5) * canvas.height,
    z: Math.random() * Z_DEPTH,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 2 + 0.5
  }));

  function resetStar(s) {
    s.x = (Math.random() - 0.5) * canvas.width;
    s.y = (Math.random() - 0.5) * canvas.height;
    s.z = Z_DEPTH;
    s.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    s.size = Math.random() * 2 + 0.5;
  }

  let driftAngle = 0;

  function draw() {
    if (activeEffect !== "githubStarfield") return;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#000010");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const globalAlpha = getAlpha();

    driftAngle += 0.001;
    const driftX = Math.sin(driftAngle) * 0.3;
    const driftY = Math.cos(driftAngle) * 0.2;

    for (let s of stars) {
      s.z -= SPEED * Z_DEPTH * 0.01;
      if (s.z <= 0) resetStar(s);

      const k = FOV / s.z;
      const x = (s.x + driftX * s.z) * k + canvas.width / 2;
      const y = (s.y + driftY * s.z) * k + canvas.height / 2;

      const twinkle = 0.8 + Math.sin(Date.now() * 0.002 + s.z) * 0.2;
      const size = ((Z_DEPTH - s.z) / Z_DEPTH) * s.size * twinkle;
      const alpha = ((Z_DEPTH - s.z) / Z_DEPTH) * twinkle * globalAlpha;

      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
      ctx.lineWidth = size * 0.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - driftX * 8, y - driftY * 8);
      ctx.stroke();

      const glowR = size * 5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      g.addColorStop(0, s.color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  }

  draw();
}

// --- CALM ORBS ---
function runCalmOrbs(canvas, ctx) {
  stopBackgroundEffect();
  resizeCanvas();
  activeEffect = "calOrbs";

  const ORB_COUNT = 25;
  const COLORS = [
    "rgba(255,255,255,1)",
    "rgba(150,200,255,1)",
    "rgba(255,200,200,1)",
    "rgba(200,255,220,1)"
  ];

  const orbs = Array.from({ length: ORB_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 40 + Math.random() * 50,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alphaShift: Math.random() * Math.PI * 2
  }));

  function draw() {
    if (activeEffect !== "calOrbs") return;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#000010");
    bgGrad.addColorStop(1, "#000000");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const globalAlpha = getAlpha();

    for (const orb of orbs) {
      orb.alphaShift += 0.004;
      const pulse = 0.6 + Math.sin(orb.alphaShift) * 0.4;

      const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      g.addColorStop(0, orb.color.replace("1)", `${0.25 * pulse * globalAlpha})`));
      g.addColorStop(0.6, orb.color.replace("1)", `${0.1 * pulse * globalAlpha})`));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2);

      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < -orb.r) orb.x = canvas.width + orb.r;
      if (orb.x > canvas.width + orb.r) orb.x = -orb.r;
      if (orb.y < -orb.r) orb.y = canvas.height + orb.r;
      if (orb.y > canvas.height + orb.r) orb.y = -orb.r;
    }

    animationId = requestAnimationFrame(draw);
  }

  draw();
}

// --- AURORA ---
function runAurora(canvas, ctx) {
  stopBackgroundEffect();
  resizeCanvas();
  activeEffect = "aurora";

  const waves = [];
  const COLORS = [
    ["rgba(0,255,200,0.15)", "rgba(0,180,255,0.05)"],
    ["rgba(180,0,255,0.15)", "rgba(0,100,255,0.05)"],
    ["rgba(0,255,100,0.15)", "rgba(0,150,200,0.05)"]
  ];

  for (let i = 0; i < COLORS.length; i++) {
    waves.push({
      amplitude: 50 + Math.random() * 30,
      wavelength: 200 + Math.random() * 150,
      speed: 0.002 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
      color1: COLORS[i][0],
      color2: COLORS[i][1],
      offsetY: canvas.height / 2 + (i - 1) * 80
    });
  }

  function drawWave(wave, time) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 10) {
      const y =
        wave.offsetY +
        Math.sin((x / wave.wavelength) + (time * wave.speed) + wave.phase) *
        wave.amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, wave.offsetY - 200, 0, canvas.height);
    grad.addColorStop(0, wave.color1);
    grad.addColorStop(1, wave.color2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function draw(time) {
    if (activeEffect !== "aurora") return;

    ctx.fillStyle = "#000010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const wave of waves) drawWave(wave, time);

    animationId = requestAnimationFrame(draw);
  }

  draw(0);
}

// --- NORTHERN LIGHTS ---
function runNorthernLights(canvas, ctx) {
  type = localStorage.getItem("customBgColor");
  if (type != "ntlights") {
    return;
  }
  stopBackgroundEffect();
  resizeCanvas();
  activeEffect = "ntlights";

  const strip = 2;

  function parseCustomColor() {
    let customColor = localStorage.getItem("customBgColor");
    if (customColor && /^#([0-9A-F]{3}){1,2}$/i.test(customColor)) {
      if (customColor.length === 4) {
        customColor =
          "#" +
          [...customColor.slice(1)]
            .map(c => c + c)
            .join("");
      }
      const r = parseInt(customColor.substr(1, 2), 16);
      const g = parseInt(customColor.substr(3, 2), 16);
      const b = parseInt(customColor.substr(5, 2), 16);
      return { r, g, b, valid: true };
    }
    return { r: 0, g: 0, b: 0, valid: false };
  }

  function draw(t) {
    type = localStorage.getItem("customBgColor");
    if (type != "ntlights") {
      return;
    }
    ctx.fillStyle = "#000010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { r: baseR, g: baseG, b: baseB, valid } = parseCustomColor();

    for (let x = 0; x < canvas.width; x += strip) {
      const off = simplex.noise3D(x * 0.002, 0, t * 0.0002);
      const grad = ctx.createLinearGradient(x, 0, x, canvas.height);

      for (let y = 0; y <= 1; y += 0.1) {
        const n = simplex.noise3D(x * 0.002, y * 3, t * 0.0003 + off);
        if (activeEffect !== "ntlights") return;

        let r, g, b;
        if (valid) {
          // Add per-channel noise so it shimmers
          r = Math.min(255, Math.max(0, baseR + n * 60));
          g = Math.min(255, Math.max(0, baseG + n * 40));
          b = Math.min(255, Math.max(0, baseB + n * 80));
        } else {
          // Default aurora
          r = 0;
          g = Math.floor(190 + n * 60);
          b = Math.floor(120 + n * 60);
        }

        grad.addColorStop(y, `rgba(${r},${g},${b},${0.7 - y * 0.6})`);
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, strip, canvas.height);
    }

    animationId = requestAnimationFrame(draw);
  }

  draw(0);
}

// --- MATRIX ---
function runMatrix(canvas, ctx) {
  stopBackgroundEffect();
  resizeCanvas();
  activeEffect = "matrix";

  const fontSize = 16;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(0);
  const chars = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function adjustBrightness({ r, g, b }, factor = 1.3) {
    return {
      r: Math.min(255, Math.floor(r * factor)),
      g: Math.min(255, Math.floor(g * factor)),
      b: Math.min(255, Math.floor(b * factor))
    };
  }

  function draw() {
    if (activeEffect !== "matrix") return;
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg-color")
      .trim() || "#00ff00";

    let { r, g, b } = hexToRgb(computed);
    ({ r, g, b } = adjustBrightness({ r, g, b }, 1.4));

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${getAlpha()})`;
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    animationId = requestAnimationFrame(draw);
  }

  draw();
}
