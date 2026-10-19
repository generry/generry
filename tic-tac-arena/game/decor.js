/* Decoration: X and O drawings, floating background shapes and the menu logo. */
(function () {
  'use strict';
  const { COL } = Arena.config;

  // Animated X or O mark (the stroke draws itself when it first appears)
  Arena.markSVG = (m) => m === 'X'
    ? '<svg class="mark x" viewBox="0 0 100 100" aria-hidden="true"><path pathLength="1" d="M26 26L74 74"/><path pathLength="1" d="M74 26L26 74"/></svg>'
    : '<svg class="mark o" viewBox="0 0 100 100" aria-hidden="true"><circle pathLength="1" cx="50" cy="50" r="27"/></svg>';

  // Slowly drifting shapes behind the app
  const bg = document.getElementById('bg');
  const types = ['ring', 'tri', 'sq', 'cross'];
  const cols = [COL.X, COL.O, COL.sun, COL.violet];
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('span');
    const sz = 26 + Math.random() * 50;
    s.className = 'shape ' + types[i % 4];
    s.style.cssText = `left:${(i * 83 + 7) % 96}%;top:${(i * 47 + 11) % 92}%;width:${sz}px;height:${sz}px;--c:${cols[(i * 3) % 4]};--d:${12 + Math.random() * 12}s;--dx:${(Math.random() - 0.5) * 80}px;--dy:${(Math.random() - 0.5) * 100}px;--rot:${(Math.random() - 0.5) * 160}deg`;
    bg.appendChild(s);
  }

  // Menu logo: a board where X takes the diagonal
  const c = [20, 60, 100];
  const X = (cx, cy, dl) => `<path class="m x" pathLength="1" style="--dl:${dl}s" d="M${cx - 11} ${cy - 11}L${cx + 11} ${cy + 11}M${cx + 11} ${cy - 11}L${cx - 11} ${cy + 11}"/>`;
  const O = (cx, cy, dl) => `<circle class="m o" pathLength="1" style="--dl:${dl}s" cx="${cx}" cy="${cy}" r="11"/>`;
  document.getElementById('logo').innerHTML =
    '<path class="grid" d="M40 8V112M80 8V112M8 40H112M8 80H112"/>' +
    X(c[0], c[0], 0.1) + O(c[1], c[0], 0.3) + O(c[0], c[1], 0.5) + X(c[1], c[1], 0.7) + O(c[2], c[1], 0.9) + X(c[2], c[2], 1.0) +
    '<path class="strike" pathLength="1" d="M6 6L114 114"/>';
})();
