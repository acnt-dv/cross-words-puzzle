import { describe, expect, it } from "vitest";
import puzzleSource from "../content/puzzles/classic-01.json";
import {
  GRID_SIZE,
  buildPuzzleCells,
  getPuzzleBlocks,
  getEntryCells,
  validatePuzzleCollection,
  validatePuzzleDocument,
} from "./puzzle";

const puzzle = validatePuzzleDocument(puzzleSource, "classic-01.json");
const puzzleEntries = puzzle.entries;
const puzzleCells = buildPuzzleCells(puzzleEntries);
const anotherValidLayout = [
  { row: 0, col: 0 }, { row: 0, col: 2 },
  { row: 1, col: 4 }, { row: 1, col: 6 },
  { row: 2, col: 1 }, { row: 2, col: 5 },
  { row: 3, col: 3 }, { row: 3, col: 7 },
  { row: 4, col: 0 }, { row: 4, col: 4 },
  { row: 5, col: 2 }, { row: 5, col: 6 },
  { row: 6, col: 1 }, { row: 6, col: 5 },
  { row: 7, col: 3 }, { row: 7, col: 7 },
];

describe("Persian crossword puzzle", () => {
  it("accepts the bundled JSON puzzle", () => {
    expect(puzzle.id).toBe("classic-01");
    expect(puzzle.size).toBe(8);
  });

  it("rejects a JSON puzzle with a broken crossing", () => {
    const broken = structuredClone(puzzleSource);
    broken.entries[0].answer = "کرنس";
    expect(() => validatePuzzleDocument(broken, "broken.json")).toThrow(/تعارض حرف/);
  });

  it("rejects answers reused across different puzzle files", () => {
    const secondPuzzle = structuredClone(puzzle);
    secondPuzzle.id = "another-puzzle";
    expect(() => validatePuzzleCollection([puzzle, secondPuzzle])).toThrow(/پاسخ «کرنش»/);
  });

  it("rejects an explicit block list that does not match the grid", () => {
    const withBlocks = structuredClone(puzzle);
    withBlocks.blocks = anotherValidLayout;
    expect(() => validatePuzzleDocument(withBlocks, "wrong-blocks.json")).toThrow(/blocks باید دقیقاً/);
  });

  it("rejects an explicit block pattern reused by another puzzle", () => {
    const first = structuredClone(puzzle);
    first.blocks = anotherValidLayout;
    const second = structuredClone(first);
    second.id = "same-layout";
    expect(() => validatePuzzleCollection([first, second])).toThrow(/الگوی خانه‌های بسته/);
  });

  it("rejects three consecutive explicit blocks", () => {
    const withBlocks = structuredClone(puzzle);
    withBlocks.blocks = getPuzzleBlocks(puzzleCells);
    expect(() => validatePuzzleDocument(withBlocks, "three-blocks.json")).toThrow(/بیش از دو خانهٔ بسته/);
  });

  it("keeps every answer inside the 8×8 board", () => {
    for (const entry of puzzleEntries) {
      for (const cell of getEntryCells(entry)) {
        expect(cell.row).toBeGreaterThanOrEqual(0);
        expect(cell.row).toBeLessThan(GRID_SIZE);
        expect(cell.col).toBeGreaterThanOrEqual(0);
        expect(cell.col).toBeLessThan(GRID_SIZE);
      }
    }
  });

  it("uses non-empty clues and Persian-only answers", () => {
    for (const entry of puzzleEntries) {
      expect(entry.clue.trim()).not.toBe("");
      expect(entry.answer).toMatch(/^[\u0600-\u06FF]+$/);
      expect(entry.answer.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("stores the same letter at every crossing", () => {
    for (const entry of puzzleEntries) {
      getEntryCells(entry).forEach(({ row, col }, index) => {
        expect(puzzleCells.get(`${row}-${col}`)?.answer).toBe([...entry.answer][index]);
      });
    }
  });

  it("forms one connected crossword instead of isolated word groups", () => {
    const [firstKey] = puzzleCells.keys();
    const visited = new Set([firstKey]);
    const queue = [firstKey];

    while (queue.length) {
      const key = queue.shift()!;
      const cell = puzzleCells.get(key)!;
      const neighbours = [
        `${cell.row - 1}-${cell.col}`,
        `${cell.row + 1}-${cell.col}`,
        `${cell.row}-${cell.col - 1}`,
        `${cell.row}-${cell.col + 1}`,
      ];

      for (const neighbour of neighbours) {
        if (puzzleCells.has(neighbour) && !visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push(neighbour);
        }
      }
    }

    expect(visited.size).toBe(puzzleCells.size);
  });

  it("contains horizontal rows 1–8 and vertical columns 1–8", () => {
    const across = puzzleEntries.filter((entry) => entry.direction === "across");
    const down = puzzleEntries.filter((entry) => entry.direction === "down");
    expect([...new Set(across.map((entry) => entry.number))]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...new Set(down.map((entry) => entry.number))]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("maps horizontal numbers to rows and vertical numbers right-to-left to columns", () => {
    const across = puzzleEntries.filter((entry) => entry.direction === "across");
    const down = puzzleEntries.filter((entry) => entry.direction === "down");
    for (const entry of across) expect(entry.number).toBe(entry.row + 1);
    for (const entry of down) expect(entry.number).toBe(GRID_SIZE - entry.col);
  });

  it("uses the full board with scattered blocks instead of two separated halves", () => {
    expect(puzzleCells.size).toBe(50);
    for (let index = 0; index < GRID_SIZE; index++) {
      const rowCells = [...puzzleCells.values()].filter((cell) => cell.row === index);
      const columnCells = [...puzzleCells.values()].filter((cell) => cell.col === index);
      expect(rowCells.length).toBeGreaterThanOrEqual(4);
      expect(columnCells.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("crosses every playable square in both directions", () => {
    for (const cell of puzzleCells.values()) {
      expect(cell.entryIds).toHaveLength(2);
      const directions = cell.entryIds.map((id) => puzzleEntries.find((entry) => entry.id === id)?.direction);
      expect(directions).toContain("across");
      expect(directions).toContain("down");
    }
  });
});
