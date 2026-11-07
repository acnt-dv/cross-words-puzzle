export type Direction = "across" | "down";

export type PuzzleEntry = {
  id: string;
  number: number;
  direction: Direction;
  row: number;
  col: number;
  answer: string;
  clue: string;
};

export type PuzzleCell = {
  row: number;
  col: number;
  answer: string;
  number?: number;
  entryIds: string[];
};

export const GRID_SIZE = 8;

export const puzzleEntries: PuzzleEntry[] = [
  { id: "a1", number: 1, direction: "across", row: 0, col: 6, answer: "مداد", clue: "وسیله‌ای برای نوشتن و طراحی" },
  { id: "d2", number: 2, direction: "down", row: 0, col: 5, answer: "دوستانه", clue: "با مهر و صمیمیت" },
  { id: "a3", number: 3, direction: "across", row: 1, col: 2, answer: "توپ", clue: "وسیلهٔ گرد بسیاری از ورزش‌ها" },
  { id: "d4", number: 4, direction: "down", row: 1, col: 0, answer: "پرندگان", clue: "جانوران بال‌دار" },
  { id: "a5", number: 5, direction: "across", row: 2, col: 6, answer: "استمرار", clue: "پیوستگی و ادامه داشتن" },
  { id: "a6", number: 6, direction: "across", row: 3, col: 2, answer: "چمن", clue: "پوشش سبز و کوتاه زمین" },
  { id: "a7", number: 7, direction: "across", row: 4, col: 7, answer: "بهار", clue: "فصل شکوفه‌ها" },
  { id: "a8", number: 8, direction: "across", row: 5, col: 2, answer: "برگ", clue: "بخش سبز و پهن گیاه" },
  { id: "a9", number: 9, direction: "across", row: 6, col: 6, answer: "شهر", clue: "محل بزرگ زندگی و کار مردم" },
  { id: "a10", number: 10, direction: "across", row: 7, col: 2, answer: "آهن", clue: "فلزی پرکاربرد و محکم" },
];

export function getEntryCells(entry: PuzzleEntry) {
  return Array.from({ length: entry.answer.length }, (_, index) => ({
    row: entry.row + (entry.direction === "down" ? index : 0),
    col: entry.col - (entry.direction === "across" ? index : 0),
  }));
}

export function buildPuzzleCells() {
  const cells = new Map<string, PuzzleCell>();

  for (const entry of puzzleEntries) {
    getEntryCells(entry).forEach(({ row, col }, index) => {
      const key = `${row}-${col}`;
      const existing = cells.get(key);
      const letter = [...entry.answer][index];

      if (existing && existing.answer !== letter) {
        throw new Error(`Puzzle conflict at ${key}`);
      }

      cells.set(key, {
        row,
        col,
        answer: letter,
        number: existing?.number ?? (index === 0 ? entry.number : undefined),
        entryIds: [...(existing?.entryIds ?? []), entry.id],
      });
    });
  }

  return cells;
}

export const puzzleCells = buildPuzzleCells();
