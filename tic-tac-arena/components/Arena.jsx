"use client";

import { useEffect } from "react";

// Markup for the whole game (menu, board and champion screen).
// The game logic in /game attaches to these elements after the page loads.
export default function Arena() {
  useEffect(() => {
    if (window.__arenaBooted) return;
    window.__arenaBooted = true;
    (async () => {
      // Order matters: each file reads what the earlier ones add to window.Arena
      await import("../game/config.js");
      await import("../game/ai.js");
      await import("../game/audio.js");
      await import("../game/effects.js");
      await import("../game/decor.js");
      await import("../game/champion.js");
      await import("../game/game.js");
      await import("../game/main.js");
    })();
  }, []);

  return (
    <>
      <div className="bg" id="bg" aria-hidden="true"></div>
      <canvas id="fx" aria-hidden="true"></canvas>

      <main className="app">
        {/* Menu screen */}
        <section id="menu" className="screen">
          <header className="brand">
            <svg id="logo" className="logo" viewBox="0 0 120 120" role="img" aria-label="Tic tac toe board with three X marks in a diagonal"></svg>
            <h1>Tic Tac <span>Arena</span></h1>
            <p className="tag">First to 3 points is the champion.</p>
          </header>

          <div className="panel">
            <div>
              <span className="label" id="lbMode">Mode</span>
              <div className="seg" data-key="mode" role="group" aria-labelledby="lbMode">
                <button type="button" data-value="pvai" aria-pressed="true">You vs AI</button>
                <button type="button" data-value="aiai" aria-pressed="false">AI vs AI</button>
              </div>
            </div>

            <div id="optsPvai" className="opts">
              <div>
                <span className="label" id="lbLevel">Difficulty</span>
                <div className="levels" data-key="level" role="group" aria-labelledby="lbLevel">
                  <button type="button" className="level" data-value="easy" aria-pressed="false">
                    <svg className="lv-ico" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="30"/></svg>
                    <span className="lv-name">Easy</span>
                    <span className="lv-desc">Plays loose and often misses a block.</span>
                  </button>
                  <button type="button" className="level" data-value="hard" aria-pressed="true">
                    <svg className="lv-ico" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 14L88 84H12Z"/></svg>
                    <span className="lv-name">Hard</span>
                    <span className="lv-desc">Blocks and punishes, but still slips up.</span>
                  </button>
                  <button type="button" className="level" data-value="insane" aria-pressed="false">
                    <svg className="lv-ico" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8L59 37L88 28L69 50L88 72L59 63L50 92L41 63L12 72L31 50L12 28L41 37Z"/></svg>
                    <span className="lv-name">Insane</span>
                    <span className="lv-desc">Sees every outcome. You can draw, never win.</span>
                  </button>
                </div>
              </div>
              <div>
                <span className="label" id="lbMark">You play as</span>
                <div className="seg" data-key="mark" role="group" aria-labelledby="lbMark">
                  <button type="button" data-value="X" aria-pressed="true">X (moves first)</button>
                  <button type="button" data-value="O" aria-pressed="false">O (moves second)</button>
                </div>
              </div>
            </div>

            <div id="optsAiai" className="opts" hidden>
              <div>
                <span className="label" id="lbXb">Player X brain</span>
                <div className="seg" data-key="xb" role="group" aria-labelledby="lbXb">
                  <button type="button" data-value="easy" aria-pressed="false">Easy</button>
                  <button type="button" data-value="hard" aria-pressed="true">Hard</button>
                  <button type="button" data-value="insane" aria-pressed="false">Insane</button>
                </div>
              </div>
              <div>
                <span className="label" id="lbOb">Player O brain</span>
                <div className="seg" data-key="ob" role="group" aria-labelledby="lbOb">
                  <button type="button" data-value="easy" aria-pressed="false">Easy</button>
                  <button type="button" data-value="hard" aria-pressed="false">Hard</button>
                  <button type="button" data-value="insane" aria-pressed="true">Insane</button>
                </div>
              </div>
              <div>
                <span className="label" id="lbSpeed">Speed</span>
                <div className="seg" data-key="speed" role="group" aria-labelledby="lbSpeed">
                  <button type="button" data-value="slow" aria-pressed="false">Slow</button>
                  <button type="button" data-value="normal" aria-pressed="true">Normal</button>
                  <button type="button" data-value="fast" aria-pressed="false">Fast</button>
                </div>
              </div>
            </div>

            <button type="button" className="cta" id="startBtn">
              Start match
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>

          <ul className="perks" aria-label="Features">
            <li>Champion celebration</li>
            <li>Win fireworks</li>
            <li>Oracle hints</li>
            <li>Time Rewind</li>
          </ul>
        </section>

        {/* Game screen */}
        <section id="game" className="screen" hidden>
          <div className="topbar">
            <button type="button" className="chip-btn" id="backBtn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Menu
            </button>
            <div className="tools">
              <button type="button" className="chip-btn" id="soundBtn" aria-pressed="true">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9c1.5 1.5 1.5 4.5 0 6"/></svg>Sound
              </button>
              <button type="button" className="chip-btn" id="oracleBtn" aria-pressed="false" title="Shows the result of each move if both sides play perfectly afterwards">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>Oracle
              </button>
            </div>
          </div>

          <div className="mode-chip" id="modeChip"></div>
          <p className="goal" id="goal"></p>

          <div className="score" id="score">
            <div className="tile" data-k="X">
              <span className="t-glyph st-x"></span><span className="t-name"></span>
              <div className="t-score"><b className="t-num">0</b><span className="pips" role="img"></span></div>
            </div>
            <div className="tile" data-k="D"><span className="t-name">Draws</span><b className="t-num">0</b></div>
            <div className="tile" data-k="O">
              <span className="t-glyph st-o"></span><span className="t-name"></span>
              <div className="t-score"><b className="t-num">0</b><span className="pips" role="img"></span></div>
            </div>
          </div>

          <p className="status" id="status" aria-live="polite"></p>

          <div className="board-wrap" id="wrap">
            <div className="board" id="board" role="group" aria-label="Game board"></div>
            <svg className="winline" id="winline" aria-hidden="true"></svg>
          </div>
          <p className="note" id="oracleNote" hidden>Oracle labels show how each move ends if both sides play perfectly after it.</p>

          <div className="result" id="result" hidden>
            <div className="r-title" id="rTitle"></div>
            <p className="r-sub" id="rSub"></p>
            <div className="r-actions">
              <button type="button" className="cta" id="againBtn">Next round</button>
              <button type="button" className="btn" id="menuBtn">Menu</button>
            </div>
          </div>

          <div className="controls">
            <div className="controls" id="ctlPvai">
              <button type="button" className="btn" id="rewindBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>Rewind move</button>
              <button type="button" className="btn" id="newBtn">New round</button>
            </div>
            <div className="controls" id="ctlAiai" hidden>
              <button type="button" className="btn" id="pauseBtn">Pause</button>
              <button type="button" className="btn" id="speedBtn">Speed: Normal</button>
              <button type="button" className="btn" id="skipBtn">Next round</button>
            </div>
          </div>
        </section>
      </main>

      {/* Champion screen (opens when a player reaches 3 points) */}
      <div className="champion" id="champion" role="dialog" aria-modal="true" aria-labelledby="champTitle" data-variant="win" hidden>
        <div className="champ-fx" id="champFx" aria-hidden="true"><div className="champ-rays"></div></div>
        <div className="champ-card">
          <div className="champ-trophy" aria-hidden="true">
            <svg viewBox="0 0 120 140">
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff4b8"/><stop offset="0.45" stopColor="#ffc83d"/><stop offset="1" stopColor="#e68a00"/>
                </linearGradient>
                <clipPath id="cupClip"><path d="M30 14h60v34c0 21-13 36-30 36S30 69 30 48z"/></clipPath>
              </defs>
              <path d="M30 26H14c0 22 9 32 22 35" fill="none" stroke="url(#gold)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M90 26h16c0 22-9 32-22 35" fill="none" stroke="url(#gold)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 14h60v34c0 21-13 36-30 36S30 69 30 48z" fill="url(#gold)"/>
              <rect className="shine" x="0" y="10" width="22" height="80" fill="#fff" opacity="0.55" clipPath="url(#cupClip)"/>
              <path d="M60 28l5.5 11.500 12.500 1.800-9 8.900 2.100 12.600L60 56.700 48.900 63.800 51 51.200 42 42.300l12.500-1.800z" fill="#fff4b8" opacity="0.9"/>
              <rect x="53" y="84" width="14" height="18" fill="url(#gold)"/>
              <rect x="36" y="102" width="48" height="12" rx="4" fill="url(#gold)"/>
              <rect x="28" y="114" width="64" height="14" rx="5" fill="#e68a00"/>
            </svg>
          </div>
          <p className="champ-kicker" id="champKicker">Match winner</p>
          <h2 className="champ-title" id="champTitle">Champion</h2>
          <div className="champ-who"><span className="champ-mark" id="champMark"></span><span id="champName"></span></div>
          <p className="champ-score" id="champScore"></p>
          <p className="champ-sub" id="champSub"></p>
          <div className="champ-actions">
            <button type="button" className="cta" id="champRematch">Rematch</button>
            <button type="button" className="btn" id="champRewind" hidden>Rewind last move</button>
            <button type="button" className="btn" id="champMenu">Menu</button>
          </div>
        </div>
      </div>
    </>
  );
}
