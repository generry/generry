/* Game screen: board, turns, AI moves, rounds, first-to-3 match, effects and Time Rewind. */
(function () {
  'use strict';
  const { ai, config: C, sound, fx, champion, markSVG } = Arena;
  const { getWinner, other, evalMoves, aiMove } = ai;
  const { LV, SPEED, SPEED_NAME, THINK, COL, WIN_TARGET } = C;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const board = $('#board');
  const wrap = $('#wrap');
  const wl = $('#winline');
  const cells = [];
  let G = null; // current game state

  /* ---------- Board ---------- */
  for (let i = 0; i < 9; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cell';
    b.addEventListener('click', () => {
      if (!G || G.over || G.players[G.turn] !== 'human' || G.board[i]) return;
      sound.unlock();
      play(i);
    });
    board.appendChild(b);
    cells.push(b);
  }

  const later = (fn, ms) => G.t.push(setTimeout(fn, ms));
  function clearTimers() { if (G) { G.t.forEach(clearTimeout); G.t = []; } }
  const playerName = (m) => (G.players[m] === 'human' ? 'You' : `${LV[G.players[m]]} AI`);

  function showScreen(name) {
    const m = $('#menu'), g = $('#game');
    m.hidden = name !== 'menu';
    g.hidden = name !== 'game';
    const el = name === 'menu' ? m : g;
    el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter');
    document.body.dataset.screen = name;
    window.scrollTo(0, 0);
  }

  /* ---------- Starting a match ---------- */
  function start(S) {
    sound.unlock();
    const players = S.mode === 'pvai'
      ? { [S.mark]: 'human', [other(S.mark)]: S.level }
      : { X: S.xb, O: S.ob };
    G = {
      mode: S.mode, players, board: Array(9).fill(null), turn: 'X', over: false, matchOver: false, result: null,
      history: [], scores: { X: 0, O: 0, D: 0 }, rewinds: 0, matchRewinds: 0, round: 0, paused: false,
      oracle: false, speed: S.speed, t: [], oracleCache: { k: '', v: null },
    };
    $('#ctlPvai').hidden = G.mode !== 'pvai';
    $('#ctlAiai').hidden = G.mode !== 'aiai';
    $('#pauseBtn').textContent = 'Pause';
    $('#speedBtn').textContent = 'Speed: ' + SPEED_NAME[G.speed];
    $('#oracleBtn').setAttribute('aria-pressed', 'false');
    $('#oracleNote').hidden = true;
    $('#goal').innerHTML = `First to <b>${WIN_TARGET}</b> points wins the match`;

    const icon = (l) => {
      const shape = l === 'easy' ? '<circle cx="50" cy="50" r="30"/>'
        : l === 'hard' ? '<path d="M50 14L88 84H12Z"/>'
        : '<path d="M50 8L59 37L88 28L69 50L88 72L59 63L50 92L41 63L12 72L31 50L12 28L41 37Z"/>';
      const col = l === 'easy' ? 'teal' : l === 'hard' ? 'sun' : 'coral';
      return `<svg class="lv-ico" viewBox="0 0 100 100" aria-hidden="true" style="stroke:var(--${col})">${shape}</svg>`;
    };
    $('#modeChip').innerHTML = G.mode === 'pvai'
      ? `${icon(S.level)}<span>You vs ${LV[S.level]} AI</span>`
      : `<span>AI vs AI &middot; X ${LV[S.xb]}, O ${LV[S.ob]}</span>`;

    const tiles = $$('.tile');
    tiles[0].querySelector('.t-glyph').innerHTML = markSVG('X');
    tiles[2].querySelector('.t-glyph').innerHTML = markSVG('O');
    tiles[0].querySelector('.t-name').textContent = playerName('X');
    tiles[2].querySelector('.t-name').textContent = playerName('O');
    $$('.pips').forEach((p) => { p.innerHTML = '<i></i>'.repeat(WIN_TARGET); });

    showScreen('game');
    newRound();
  }

  function newRound() {
    clearTimers();
    resetFX();
    G.round++;
    G.starter = G.round % 2 === 1 ? 'X' : 'O';
    G.board = Array(9).fill(null);
    G.turn = G.starter;
    G.over = false; G.matchOver = false; G.result = null; G.history = []; G.rewinds = 0;
    cells.forEach((c) => { c.classList.remove('pop', 'win'); c._m = null; delete c.dataset.mark; });
    $('#result').hidden = true;
    render();
    updateScore();
    scheduleAI();
  }

  function rematch() {
    champion.hide();
    G.scores = { X: 0, O: 0, D: 0 };
    G.round = 0;
    G.matchRewinds = 0;
    newRound();
  }

  /* ---------- Rendering ---------- */
  function oracleScores() {
    const k = G.board.join('') + G.turn;
    if (G.oracleCache.k !== k) G.oracleCache = { k, v: evalMoves(G.board.slice(), G.turn) };
    return G.oracleCache.v;
  }

  function render() {
    document.body.dataset.turn = G.over ? 'none' : G.turn;
    const human = !G.over && G.players[G.turn] === 'human';
    const hints = G.oracle && !G.over ? oracleScores() : null;
    cells.forEach((c, i) => {
      const m = G.board[i];
      if (m) {
        if (c._m !== m) { c.innerHTML = markSVG(m); c.dataset.mark = m; c._m = m; }
      } else {
        delete c.dataset.mark; c._m = null;
        let h = '';
        if (hints) {
          const s = hints[i];
          h = `<span class="hint ${s > 0 ? 'win' : s < 0 ? 'lose' : 'draw'}">${s > 0 ? 'Win' : s < 0 ? 'Lose' : 'Draw'}</span>`;
        }
        c.innerHTML = `<span class="ghost">${markSVG(G.turn)}</span>${h}`;
      }
      c.disabled = !(human && !m);
      c.setAttribute('aria-label', `Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${m || 'empty'}`);
    });
    $$('.tile').forEach((t) => { t.dataset.active = String(!G.over && t.dataset.k === G.turn); });
    setStatus();
    $('#rewindBtn').disabled = !canRewind();
  }

  function setStatus() {
    const el = $('#status');
    if (G.over) { el.textContent = resultText(G.result).title; return; }
    const m = G.turn;
    const glyph = `<span class="st-glyph st-${m.toLowerCase()}">${markSVG(m)}</span>`;
    if (G.players[m] === 'human') el.innerHTML = `${glyph}<span>Your move</span>`;
    else el.innerHTML = `${glyph}<span>${G.mode === 'aiai' ? m + ' (' + LV[G.players[m]] + ')' : playerName(m)} is thinking</span><span class="dots"><i></i><i></i><i></i></span>`;
  }

  // Points counter and the three point dots under each player
  function updateScore(bumpKey) {
    $$('.tile').forEach((t) => {
      const k = t.dataset.k;
      const n = t.querySelector('.t-num');
      n.textContent = G.scores[k];
      if (bumpKey === k) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
      const pips = t.querySelectorAll('.pips i');
      if (pips.length) {
        const pts = G.scores[k];
        pips.forEach((p, i) => {
          p.classList.toggle('on', i < pts);
          p.classList.toggle('next', pts === WIN_TARGET - 1 && i === pts);
        });
        t.querySelector('.pips').setAttribute('aria-label', `${pts} of ${WIN_TARGET} points`);
      }
    });
  }

  /* ---------- Turns ---------- */
  function scheduleAI() {
    if (G.over || G.paused) return;
    const lv = G.players[G.turn];
    if (lv === 'human') return;
    const d = G.mode === 'aiai' ? SPEED[G.speed] : THINK[lv] + Math.random() * 250;
    const hl = G.history.length;
    later(() => {
      if (G.over || G.paused || G.history.length !== hl) return;
      play(aiMove(G.board.slice(), G.turn, G.players[G.turn]));
    }, d);
  }

  function play(i) {
    const mark = G.turn;
    G.history.push({ board: G.board.slice(), turn: mark });
    G.board[i] = mark;
    cells[i].classList.add('pop');
    sound.sfx.place(mark);
    const w = getWinner(G.board);
    if (w) return finish({ type: 'win', mark: w.mark, line: w.line });
    if (G.board.every(Boolean)) return finish({ type: 'draw' });
    G.turn = other(mark);
    render();
    scheduleAI();
  }

  function resultText(r) {
    if (r.type === 'draw') {
      const insane = Object.values(G.players).includes('insane');
      return { title: 'It is a draw', sub: insane ? 'A draw is the best anyone can do against a perfect player.' : 'Dead even. Go again?', tone: 'draw' };
    }
    const mine = G.players[r.mark] === 'human';
    if (G.matchOver) {
      if (G.mode === 'aiai') return { title: `${r.mark} (${LV[G.players[r.mark]]}) wins the match`, sub: '', tone: 'win' };
      return { title: mine ? 'You win the match!' : `${playerName(r.mark)} wins the match`, sub: '', tone: mine ? 'win' : 'lose' };
    }
    if (G.mode === 'aiai') return { title: `${r.mark} (${LV[G.players[r.mark]]}) wins the round`, sub: '', tone: 'win' };
    if (mine) return { title: 'You win the round!', sub: G.rewinds === 0 ? 'Flawless. No rewinds used.' : `Won with ${G.rewinds} rewind${G.rewinds > 1 ? 's' : ''}.`, tone: 'win' };
    return { title: `${playerName(r.mark)} wins the round`, sub: 'Use Rewind move to take back your last move and try again.', tone: 'lose' };
  }

  function finish(res) {
    G.over = true;
    G.result = res;
    if (res.type === 'win') {
      G.scores[res.mark]++;
      if (G.scores[res.mark] >= WIN_TARGET) G.matchOver = true;
    } else {
      G.scores.D++;
    }
    render();
    updateScore(res.type === 'win' ? res.mark : 'D');
    const tone = resultText(res).tone;
    runFX(res, tone);

    if (G.matchOver) { later(showChampion, tone === 'win' ? 2300 : 2100); return; }
    if (G.mode === 'pvai') {
      later(() => {
        const t = resultText(res);
        $('#rTitle').textContent = t.title;
        $('#rSub').textContent = t.sub;
        $('#result').dataset.type = t.tone;
        $('#result').hidden = false;
        $('#againBtn').focus({ preventScroll: true });
        $('#result').scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }, 1500);
    } else {
      later(() => { if (!G.paused) newRound(); }, tone === 'win' ? 3200 : 2000);
    }
  }

  /* ---------- Champion screen ---------- */
  function showChampion() {
    const r = G.result;
    const m = r.mark;
    const mine = G.players[m] === 'human';
    const variant = G.mode === 'pvai' && !mine ? 'lose' : 'win';
    let sub;
    if (G.mode === 'aiai') sub = `${LV[G.players[m]]} AI takes the match in ${G.round} round${G.round > 1 ? 's' : ''}.`;
    else if (mine) sub = G.matchRewinds === 0 ? 'A flawless run. No rewinds used.' : `Won the match using ${G.matchRewinds} rewind${G.matchRewinds > 1 ? 's' : ''}.`;
    else sub = 'So close. Rewind your last move or start a rematch.';
    champion.show({
      mark: m,
      variant,
      name: G.mode === 'aiai' ? `${m} · ${LV[G.players[m]]} AI` : mine ? 'You' : playerName(m),
      score: { win: G.scores[m], other: G.scores[other(m)] },
      sub,
      canRewind: variant === 'lose' && canRewind(),
      onRematch: rematch,
      onMenu: toMenu,
      onRewind: rewind,
    });
  }

  /* ---------- Round effects ---------- */
  function drawLine(line, mark) {
    const W = wrap.offsetWidth, H = wrap.offsetHeight, bl = board.clientLeft, bt = board.clientTop;
    const ctr = (i) => [cells[i].offsetLeft + bl + cells[i].offsetWidth / 2, cells[i].offsetTop + bt + cells[i].offsetHeight / 2];
    let [x1, y1] = ctr(line[0]);
    let [x2, y2] = ctr(line[2]);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, ext = cells[0].offsetWidth * 0.36;
    x1 -= ux * ext; y1 -= uy * ext; x2 += ux * ext; y2 += uy * ext;
    wl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    wl.style.setProperty('--L', (len + 2 * ext).toFixed(1));
    wl.dataset.mark = mark;
    const pts = `x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"`;
    wl.innerHTML = `<line class="glow" ${pts}/><line class="core" ${pts}/>`;
    void wl.getBoundingClientRect();
    wl.classList.add('go');
  }

  function shockwave(color) {
    const s = document.createElement('div');
    s.className = 'shockwave';
    s.style.setProperty('--c', color);
    wrap.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }

  function runFX(res, tone) {
    const br = wrap.getBoundingClientRect();
    const cx = br.left + br.width / 2, cy = br.top + br.height / 2;
    if (res.type === 'win') {
      const pal = [COL[res.mark], COL.sun, COL.paper, COL.violet];
      const markColor = res.mark === 'X' ? 'var(--coral)' : 'var(--teal)';
      res.line.forEach((i) => cells[i].classList.add('win'));
      board.classList.add('done');
      later(() => drawLine(res.line, res.mark), 260);
      later(() => { shockwave(markColor); wrap.classList.add('shake'); }, 420);
      if (tone === 'win') {
        document.body.dataset.mood = 'win';
        later(sound.sfx.win, 300);
        const pts = res.line.map((i) => { const r = cells[i].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
        pts.forEach((p, k) => later(() => fx.burst(p[0], p[1], pal, 40, 1), 450 + k * 170));
        for (let k = 0; k < 5; k++) later(() => fx.burst(br.left + Math.random() * br.width, br.top + Math.random() * br.height * 0.8, pal, 30, 1.1), 1000 + k * 260);
        later(() => fx.rain(pal, 90), 700);
        later(() => { fx.burst(cx, cy, pal, 80, 1.5); shockwave('var(--sun)'); }, 2200);
      } else {
        document.body.dataset.mood = 'lose';
        later(() => { board.classList.add('glitch'); sound.sfx.lose(); }, 500);
      }
    } else {
      document.body.dataset.mood = 'draw';
      board.classList.add('done');
      later(() => { shockwave('var(--sun)'); fx.burst(cx, cy, [COL.X, COL.O, COL.sun], 26, 0.7); sound.sfx.draw(); }, 200);
    }
  }

  function resetFX() {
    wrap.classList.remove('shake');
    board.classList.remove('done', 'glitch');
    wl.classList.remove('go');
    wl.innerHTML = '';
    $$('.shockwave').forEach((s) => s.remove());
    document.body.dataset.mood = '';
    fx.clear();
  }

  /* ---------- Time Rewind ---------- */
  function canRewind() { return G.mode === 'pvai' && G.history.some((h) => G.players[h.turn] === 'human'); }

  function rewind() {
    if (!canRewind()) return;
    let k = -1;
    for (let j = G.history.length - 1; j >= 0; j--) if (G.players[G.history[j].turn] === 'human') { k = j; break; }
    const h = G.history[k];
    clearTimers();
    if (G.over) {
      const r = G.result;
      if (r.type === 'win') G.scores[r.mark]--; else G.scores.D--;
      G.over = false; G.matchOver = false; G.result = null;
      champion.hide();
      resetFX();
      $('#result').hidden = true;
    }
    G.board = h.board.slice();
    G.turn = h.turn;
    G.history.length = k;
    G.rewinds++;
    G.matchRewinds++;
    cells.forEach((c) => { c.classList.remove('pop', 'win'); c._m = null; });
    sound.sfx.undo();
    render();
    updateScore();
  }

  /* ---------- Controls used by main.js ---------- */
  function toMenu() {
    if (G) clearTimers();
    champion.hide();
    resetFX();
    document.body.dataset.turn = 'none';
    showScreen('menu');
  }

  function toggleOracle() {
    G.oracle = !G.oracle;
    $('#oracleBtn').setAttribute('aria-pressed', String(G.oracle));
    $('#oracleNote').hidden = !G.oracle;
    render();
  }

  function togglePause() {
    G.paused = !G.paused;
    $('#pauseBtn').textContent = G.paused ? 'Resume' : 'Pause';
    if (G.paused) clearTimers();
    else if (G.matchOver) showChampion();
    else if (G.over) newRound();
    else scheduleAI();
  }

  function cycleSpeed() {
    const order = ['slow', 'normal', 'fast'];
    G.speed = order[(order.indexOf(G.speed) + 1) % 3];
    $('#speedBtn').textContent = 'Speed: ' + SPEED_NAME[G.speed];
  }

  Arena.game = { start, newRound, rewind, toMenu, toggleOracle, togglePause, cycleSpeed, showMenu: () => showScreen('menu') };
})();
