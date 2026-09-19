// confetti.js - Neo-Brutalist Geometric Particle Burst (Zero Dependencies)

const NEO_COLORS = ['#FF6B6B', '#FFD93D', '#C4B5FD', '#10B981', '#3B82F6', '#000000'];

export function triggerNeoConfetti(originX, originY) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const startX = originX !== undefined ? originX : width / 2;
  const startY = originY !== undefined ? originY : height / 2;

  const particleCount = 45;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 7 + Math.random() * 9,
      widthRatio: Math.random() > 0.5 ? 1 : 1.6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: NEO_COLORS[Math.floor(Math.random() * NEO_COLORS.length)],
      alpha: 1,
      gravity: 0.28,
    });
  }

  let animationFrameId;
  const startTime = performance.now();
  const maxDuration = 1400; // ms

  function render(now) {
    const elapsed = now - startTime;
    if (elapsed > maxDuration) {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      return;
    }

    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, 1 - elapsed / maxDuration);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      const w = p.size * p.widthRatio;
      const h = p.size;

      // Draw sharp neo-brutalist square/rectangle with thick black border
      ctx.fillStyle = p.color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      ctx.restore();
    });

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}
