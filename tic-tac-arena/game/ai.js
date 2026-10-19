/* Game rules and the three AI levels. No DOM code here. */
(function (root) {
  'use strict';

  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const other = (m) => (m === 'X' ? 'O' : 'X');
  const rand = (a) => a[Math.floor(Math.random() * a.length)];

  function getWinner(b) {
    for (const l of LINES) {
      if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { mark: b[l[0]], line: l };
    }
    return null;
  }

  const empties = (b) => b.reduce((a, v, i) => (v ? a : (a.push(i), a)), []);

  // Full game-tree search. Faster wins and slower losses score higher.
  function minimax(b, turn, me, depth) {
    const w = getWinner(b);
    if (w) return w.mark === me ? 10 - depth : depth - 10;
    let best = null;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = turn;
      const s = minimax(b, other(turn), me, depth + 1);
      b[i] = null;
      if (best === null || (turn === me ? s > best : s < best)) best = s;
    }
    return best === null ? 0 : best;
  }

  // Result of every empty square for `mark` if both sides then play perfectly.
  function evalMoves(b, mark) {
    const res = {};
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = mark;
      res[i] = minimax(b, other(mark), mark, 1);
      b[i] = null;
    }
    return res;
  }

  function aiMove(b, mark, level) {
    const em = empties(b);
    const finishing = (m) => {
      for (const i of em) { b[i] = m; const w = getWinner(b); b[i] = null; if (w) return i; }
      return -1;
    };
    if (level === 'easy') {
      if (Math.random() < 0.3) { const w = finishing(mark); if (w >= 0) return w; }
      if (Math.random() < 0.15) { const k = finishing(other(mark)); if (k >= 0) return k; }
      return rand(em);
    }
    if (level === 'hard' && Math.random() < 0.15) return rand(em); // Hard blunders now and then
    if (em.length === 9) return rand([0, 2, 4, 6, 8]);
    const sc = evalMoves(b, mark);
    const best = Math.max(...em.map((i) => sc[i]));
    return rand(em.filter((i) => sc[i] === best));
  }

  const api = { LINES, other, rand, getWinner, empties, minimax, evalMoves, aiMove };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.Arena = root.Arena || {};
  root.Arena.ai = api;
})(typeof window !== 'undefined' ? window : globalThis);
