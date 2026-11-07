import { describe, expect, it } from "vitest";
import { GRID_SIZE, getEntryCells, puzzleCells, puzzleEntries } from "./puzzle";

describe("Persian crossword puzzle", () => {
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
      expect(entry.answer.length).toBeGreaterThanOrEqual(3);
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

  it("contains both horizontal and vertical clues", () => {
    expect(puzzleEntries.some((entry) => entry.direction === "across")).toBe(true);
    expect(puzzleEntries.some((entry) => entry.direction === "down")).toBe(true);
  });
});
