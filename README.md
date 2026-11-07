# واژه‌خانه — Persian Crossword MVP

واژه‌خانه is a small, RTL-first Persian crossword web app. The first release focuses on the simplest useful experience: one handcrafted 8×8 puzzle that works well on desktop and mobile.

## MVP scope

- Next.js, React, and TypeScript
- Persian UI and right-to-left layout
- One 8×8 crossword with across and down clues
- Keyboard input, clue selection, answer checking, and reset
- Built-in Persian virtual keyboard for phones and devices without a Persian keyboard
- Responsive, accessible interface
- No account, backend, timer, or puzzle editor in the first version

The grid and puzzle model are intentionally data-driven so a later release can introduce the requested 16×16 format without rewriting the game UI. The 16×16 version will need a larger verified word bank, more careful crossing generation, and a dedicated puzzle-authoring/validation step.

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Select a clue or tap a white square, then type with the device keyboard or the built-in Persian keyboard. Tap a crossing square a second time to switch between its horizontal and vertical answers.

## Quality checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

The test suite validates grid bounds, Persian answer content, crossing consistency, and full board connectivity. GitHub Actions runs the same checks for every pull request and push to `main`.

## Planned evolution

1. Ship and validate the handcrafted 8×8 MVP.
2. Extract a reusable Persian word bank and puzzle validator.
3. Add multiple puzzles, progress persistence, and hints.
4. Introduce a curated 16×16 daily-puzzle format.

## License

No license has been selected yet. All rights are reserved by the repository owner.
