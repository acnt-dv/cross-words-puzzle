# واژه‌خانه — Persian Crossword MVP

واژه‌خانه is a small, RTL-first Persian crossword web app. The first release focuses on the simplest useful experience: validated, file-based 8×8 puzzles that work well on desktop and mobile.

## MVP scope

- Next.js, React, and TypeScript
- Persian UI and right-to-left layout
- Full-board 8×8 crosswords with scattered blocks, rows 1–8 as horizontal clue lines, and right-to-left columns 1–8 as vertical clue lines
- Multi-part clue lines, matching the structure of traditional Persian newspaper crosswords
- Keyboard input, clue selection, answer checking, and reset
- Built-in Persian virtual keyboard for phones and devices without a Persian keyboard
- Automatic puzzle discovery from JSON files and a puzzle selector
- Responsive, accessible interface
- No account, backend, timer, or puzzle editor in the first version

The grid and puzzle model are intentionally data-driven so a later release can introduce the requested 16×16 format without rewriting the game UI. The 16×16 version will need a larger verified word bank and more careful crossing generation.

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Select a clue or tap a white square, then type with the device keyboard or the built-in Persian keyboard. Tap a crossing square a second time to switch between its horizontal and vertical answers.

## Add a new puzzle

1. Run `npm run generate:layout`. It creates a genuinely new, asymmetric block pattern; it never selects from a fixed template.
2. Copy the emitted `blocks` array into the ready-to-copy [Persian puzzle-generation prompt](docs/puzzle-generation-prompt.fa.md), then replace its topic, difficulty, ID, and title placeholders. Tell the model to preserve that exact `blocks` array while it creates the answers and clues.
3. Save the model's JSON-only response as a new `.json` file in [`content/puzzles`](content/puzzles). The filename may be different from the puzzle ID, but both should be unique.
4. Restart `npm run dev`, or run `npm run build` for a production build.
5. Choose the new puzzle from the **انتخاب جدول** menu.

The app discovers every JSON file in that folder at startup. It rejects malformed JSON, duplicate IDs, out-of-bounds answers, incorrect 1–8 numbering, mismatched crossing letters, disconnected layouts, sparse rows or columns, and any playable square that is not shared by exactly one horizontal and one vertical entry. The error includes the source filename and the invalid field or cell.

Each puzzle owns its own layout. For new puzzles, `blocks` is the exact list of black cells and must exactly match the cells not covered by entries. The generator enforces 12–24 scattered, asymmetric blocks, at least four white cells per row and column, connected white cells, and no run of three adjacent black cells horizontally or vertically. L-shaped and zig-zag block groups are allowed. The validator rejects an explicit repeated layout across puzzle files.

The complete machine-readable shape is documented in [`docs/puzzle.schema.json`](docs/puzzle.schema.json). The schema helps editors with autocomplete, while the application validator enforces the additional geometric and crossing rules.

## Quality checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

The test suite validates grid bounds, Persian answer content, crossing consistency, full-board coverage, the exact 1–8 numbering on both axes, and the rule that every playable square belongs to one horizontal row segment and one vertical column segment. GitHub Actions runs the same checks for every pull request and push to `main`.

## Planned evolution

1. Ship and validate the handcrafted 8×8 MVP.
2. Extract a reusable Persian word bank.
3. Add progress persistence and hints.
4. Introduce a curated 16×16 daily-puzzle format.

## License

No license has been selected yet. All rights are reserved by the repository owner.
