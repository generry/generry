/* Champion screen: trophy, light rays, twinkling stars, confetti cannons, firework rockets and fanfare. */
(function () {
  'use strict';
  const { COL } = Arena.config;
  const { fx, sound, markSVG } = Arena;
  const $ = (id) => document.getElementById(id);

  const el = $('champion');
  const title = $('champTitle');
  let timers = [];
  let loop = 0;
  let opts = null;

  // Twinkling stars behind the card
  (function makeStars() {
    const box = $('champFx');
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      s.className = 'champ-star';
      s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--s:${10 + Math.random() * 22}px;--d:${1.6 + Math.random() * 2}s;--dl:${Math.random() * 2.5}s`;
      box.appendChild(s);
    }
  })();

  function buildTitle(text) {
    title.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.setProperty('--i', i);
      s.setAttribute('aria-hidden', 'true');
      title.appendChild(s);
    });
    title.setAttribute('aria-label', text);
  }

  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  function celebrate(color) {
    const pal = [color, COL.sun, COL.paper, COL.violet, COL.amber];
    const W = () => innerWidth;
    const H = () => innerHeight;
    sound.sfx.champion();
    at(150, () => fx.rain(pal, 140));
    for (let k = 0; k < 6; k++) {
      at(250 + k * 380, () => {
        fx.cannon(W() * 0.03, H() * 0.98, 38, pal, 46);
        fx.cannon(W() * 0.97, H() * 0.98, -38, pal, 46);
      });
    }
    for (let k = 0; k < 9; k++) at(700 + k * 520, () => fx.rocket(W() * (0.12 + Math.random() * 0.76), pal));
    // Keep a lighter celebration going while the screen stays open
    loop = setInterval(() => {
      fx.rain(pal, 26);
      if (Math.random() < 0.5) fx.rocket(W() * (0.15 + Math.random() * 0.7), pal);
    }, 1300);
  }

  function show(o) {
    opts = o;
    const win = o.variant === 'win';
    el.dataset.variant = o.variant;
    $('champKicker').textContent = win ? 'Match winner' : 'Match over';
    buildTitle(win ? 'CHAMPION' : 'DEFEAT');
    const mark = $('champMark');
    mark.dataset.mark = o.mark;
    mark.innerHTML = markSVG(o.mark);
    $('champName').textContent = o.name;
    $('champScore').textContent = `${o.score.win} – ${o.score.other}`;
    $('champSub').textContent = o.sub;
    $('champRewind').hidden = !o.canRewind;
    el.hidden = false;
    el.scrollTop = 0;
    $('champRematch').focus({ preventScroll: true });
    if (win) {
      celebrate(COL[o.mark]);
    } else {
      sound.sfx.defeat();
      at(300, () => fx.burst(innerWidth / 2, innerHeight * 0.35, [COL.X, COL.violet], 30, 0.8));
    }
  }

  function hide() {
    timers.forEach(clearTimeout);
    timers = [];
    clearInterval(loop);
    loop = 0;
    fx.clear();
    el.hidden = true;
  }

  $('champRematch').addEventListener('click', () => { const o = opts; hide(); if (o) o.onRematch(); });
  $('champMenu').addEventListener('click', () => { const o = opts; hide(); if (o) o.onMenu(); });
  $('champRewind').addEventListener('click', () => { const o = opts; hide(); if (o) o.onRewind(); });

  // Keep keyboard focus inside the dialog while it is open
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll('button')].filter((b) => !b.hidden);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  Arena.champion = { show, hide };
})();
