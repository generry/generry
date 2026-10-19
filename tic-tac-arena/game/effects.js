/* Canvas particle effects: bursts, confetti rain, confetti cannons and firework rockets. */
(function () {
  'use strict';
  const cv = document.getElementById('fx');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX_PARTS = 1100;
  let parts = [];
  let raf = 0;
  let DPR = 1;

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(innerWidth * DPR);
    cv.height = Math.round(innerHeight * DPR);
  }
  addEventListener('resize', size);
  size();

  const scale = (n) => (reduce ? Math.min(n, 14) : n);
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const room = (n) => Math.max(0, Math.min(n, MAX_PARTS - parts.length));

  // Round burst from a point
  function burst(x, y, colors, n, power = 1) {
    n = room(scale(n));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (3 + Math.random() * 9) * power;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4 * power, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, sz: 6 + Math.random() * 9, c: colors[i % colors.length], shape: i % 4, life: 0, max: 70 + Math.random() * 60 });
    }
    start();
  }

  // Confetti falling from the top of the screen
  function rain(colors, n) {
    n = room(scale(n));
    for (let i = 0; i < n; i++) {
      parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 3, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, sz: 6 + Math.random() * 8, c: colors[i % colors.length], shape: i % 4, life: 0, max: 150 + Math.random() * 80 });
    }
    start();
  }

  // Confetti cannon: angle is measured from straight up, positive leans right
  function cannon(x, y, angle, colors, n, power = 1) {
    n = room(scale(n));
    for (let i = 0; i < n; i++) {
      const a = ((angle + (Math.random() - 0.5) * 36) * Math.PI) / 180;
      const s = (13 + Math.random() * 11) * power;
      parts.push({ x, y, vx: Math.sin(a) * s, vy: -Math.cos(a) * s, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.5, sz: 7 + Math.random() * 9, c: colors[i % colors.length], shape: i % 3 === 0 ? 1 : i % 4, life: 0, max: 110 + Math.random() * 70 });
    }
    start();
  }

  // Firework rocket: climbs from the bottom with a spark trail, then bursts
  function rocket(x, colors) {
    parts.push({ kind: 'rocket', x, y: innerHeight + 10, vx: (Math.random() - 0.5) * 1.6, vy: -(11 + Math.random() * 3.5), sz: 5, c: '#fff4b8', colors, shape: 0, r: 0, vr: 0, life: 0, max: 200 });
    start();
  }

  function tick() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter((p) => p.life < p.max);
    const live = parts.slice();
    for (const p of live) {
      p.life++;
      if (p.kind === 'rocket') {
        p.vy += 0.2; p.x += p.vx; p.y += p.vy;
        if (parts.length < MAX_PARTS) parts.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 1.2, vy: 1, sz: 3.5, c: '#ffe9a8', shape: 0, r: 0, vr: 0, life: 0, max: 16 });
        if (p.vy > -1.5) { p.life = p.max; burst(p.x, p.y, p.colors, 70, 1.35); continue; }
      } else {
        p.vy += 0.26; p.vx *= 0.985; p.vy *= 0.987; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      }
      const k = p.life / p.max;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.strokeStyle = p.c; ctx.lineWidth = 3;
      const h = p.sz / 2;
      if (p.shape === 0) { ctx.beginPath(); ctx.arc(0, 0, h, 0, 6.283); ctx.fill(); }
      else if (p.shape === 1) { ctx.fillRect(-h, -h * 0.6, p.sz, p.sz * 0.6); }
      else if (p.shape === 2) { ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(h, h); ctx.lineTo(-h, h); ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, 0, h, 0, 6.283); ctx.stroke(); }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = 0; ctx.clearRect(0, 0, cv.width, cv.height); }
  }

  function clear() { parts = []; }

  window.Arena = window.Arena || {};
  Arena.fx = { burst, rain, cannon, rocket, clear };
})();
