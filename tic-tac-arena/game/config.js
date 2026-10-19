/* Shared settings. Every other script reads from window.Arena.config. */
window.Arena = window.Arena || {};
Arena.config = {
  WIN_TARGET: 3, // points needed to win the match
  LV: { easy: 'Easy', hard: 'Hard', insane: 'Insane' },
  SPEED: { slow: 1250, normal: 700, fast: 260 }, // AI vs AI delay between moves (ms)
  SPEED_NAME: { slow: 'Slow', normal: 'Normal', fast: 'Fast' },
  THINK: { easy: 450, hard: 700, insane: 950 }, // AI "thinking" time when you play (ms)
  COL: { X: '#ff5f76', O: '#32dbc6', sun: '#ffc83d', paper: '#f6f0e6', violet: '#7a6bff', amber: '#ff9f1c' },
};
