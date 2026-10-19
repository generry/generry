/* Sound effects, synthesized with the Web Audio API (no audio files needed). */
(function () {
  'use strict';
  let AC = null;
  let on = true;

  function context() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
    }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }

  function tone(freq, dur = 0.12, type = 'sine', vol = 0.08, delay = 0) {
    if (!on) return;
    const a = context();
    if (!a) return;
    const t = a.currentTime + delay;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  const sfx = {
    place: (m) => tone(m === 'X' ? 560 : 420, 0.1, 'triangle', 0.1),
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, i * 0.09)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.28, 'sawtooth', 0.05, i * 0.13)),
    draw: () => { tone(330, 0.2, 'sine', 0.08); tone(330, 0.3, 'sine', 0.08, 0.2); },
    undo: () => tone(300, 0.12, 'triangle', 0.08),
    click: () => tone(480, 0.06, 'triangle', 0.06),
    // Champion fanfare: short rising phrase, a held chord, then sparkles
    champion: () => {
      let t = 0;
      [[523, 0.13], [523, 0.13], [523, 0.13], [659, 0.32], [587, 0.13], [659, 0.13], [784, 0.5]].forEach(([f, d]) => {
        tone(f, d + 0.1, 'square', 0.04, t);
        tone(f / 2, d + 0.1, 'triangle', 0.07, t);
        t += d + 0.03;
      });
      [523, 659, 784, 1047].forEach((f) => tone(f, 1.1, 'triangle', 0.07, t + 0.1));
      [1568, 1319, 1760, 2093, 1760, 2349].forEach((f, i) => tone(f, 0.18, 'sine', 0.05, t + 0.4 + i * 0.11));
    },
    defeat: () => [330, 294, 262, 220].forEach((f, i) => tone(f, 0.4, 'triangle', 0.07, i * 0.22)),
  };

  window.Arena = window.Arena || {};
  Arena.sound = {
    tone,
    sfx,
    unlock: context,
    isOn: () => on,
    toggle() { on = !on; return on; },
  };
})();
