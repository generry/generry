/* Entry point: menu choices and button wiring. */
(function () {
  'use strict';
  const { sound, game } = Arena;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // What the player picked on the menu
  const S = { mode: 'pvai', level: 'hard', mark: 'X', xb: 'hard', ob: 'insane', speed: 'normal' };

  function sync() {
    $$('[data-key]').forEach((box) => {
      box.querySelectorAll('button[data-value]').forEach((b) => {
        b.setAttribute('aria-pressed', String(S[box.dataset.key] === b.dataset.value));
      });
    });
    $('#optsPvai').hidden = S.mode !== 'pvai';
    $('#optsAiai').hidden = S.mode !== 'aiai';
  }

  $$('[data-key]').forEach((box) => box.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-value]');
    if (!b) return;
    S[box.dataset.key] = b.dataset.value;
    sound.sfx.click();
    sync();
  }));
  sync();

  $('#startBtn').addEventListener('click', () => game.start(S));
  $('#backBtn').addEventListener('click', game.toMenu);
  $('#menuBtn').addEventListener('click', game.toMenu);
  $('#againBtn').addEventListener('click', game.newRound);
  $('#newBtn').addEventListener('click', game.newRound);
  $('#skipBtn').addEventListener('click', game.newRound);
  $('#rewindBtn').addEventListener('click', game.rewind);
  $('#oracleBtn').addEventListener('click', game.toggleOracle);
  $('#pauseBtn').addEventListener('click', game.togglePause);
  $('#speedBtn').addEventListener('click', game.cycleSpeed);
  $('#soundBtn').addEventListener('click', (e) => {
    const on = sound.toggle();
    e.currentTarget.setAttribute('aria-pressed', String(on));
    if (on) sound.tone(660, 0.1, 'triangle', 0.08);
  });

  document.body.dataset.turn = 'none';
  game.showMenu();
})();
