# Tic Tac Arena (Next.js)

Tic tac toe with Easy, Hard and Insane AI, an AI vs AI mode, first to 3 points,
a champion celebration, Oracle hints and Time Rewind.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Folders

```
app/
  layout.js            Page shell, fonts, loads the CSS
  page.js              Home page
  arena/*.css          Styles (base, menu, game, effects, champion, responsive)
components/
  Arena.jsx            All screens' markup (menu, board, champion)
game/
  config.js            Settings (WIN_TARGET = points to win)
  ai.js                Rules and the Easy, Hard and Insane AI
  audio.js             Synthesized sound effects
  effects.js           Confetti, fireworks and particle effects
  decor.js             X/O drawings, background shapes, logo
  champion.js          Champion screen
  game.js              Board, turns, rounds, match, Time Rewind
  main.js              Menu choices and button wiring
```
