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
  { id: "a1", number: 1, direction: "across", row: 0, col: 3, answer: "گیشه", clue: "باجهٔ فروش بلیت یا ارائهٔ خدمات" },
  { id: "d1", number: 1, direction: "down", row: 0, col: 3, answer: "گلگون", clue: "سرخ‌رنگ و شاداب" },
  { id: "d2", number: 2, direction: "down", row: 0, col: 2, answer: "یغما", clue: "غارت و تاراج" },
  { id: "d3", number: 3, direction: "down", row: 0, col: 1, answer: "شوری", clue: "مزه‌ای که از نمک می‌آید" },
  { id: "d4", number: 4, direction: "down", row: 0, col: 0, answer: "هیکل", clue: "اندام و جثهٔ بدن" },
  { id: "a5", number: 5, direction: "across", row: 1, col: 3, answer: "لغوی", clue: "مربوط به واژه و معنی آن" },
  { id: "a6", number: 6, direction: "across", row: 2, col: 3, answer: "گمرک", clue: "محل کنترل کالاهای ورودی و خروجی" },
  { id: "a7", number: 7, direction: "across", row: 3, col: 4, answer: "اوایل", clue: "بخش آغازین یک دوره" },
  { id: "d7", number: 7, direction: "down", row: 3, col: 4, answer: "ارزید", clue: "ارزش داشت" },
  { id: "a8", number: 8, direction: "across", row: 4, col: 7, answer: "میگرن", clue: "سردرد شدید و دوره‌ای" },
  { id: "d8", number: 8, direction: "down", row: 4, col: 7, answer: "منجم", clue: "دانشمند ستاره‌شناس" },
  { id: "d9", number: 9, direction: "down", row: 4, col: 6, answer: "یواش", clue: "آهسته، در گفتار روزمره" },
  { id: "d10", number: 10, direction: "down", row: 4, col: 5, answer: "گیره", clue: "ابزار نگهدارنده و فشرده‌کننده" },
  { id: "a11", number: 11, direction: "across", row: 5, col: 7, answer: "نویز", clue: "صدای مزاحم در یک پیام یا دستگاه" },
  { id: "a12", number: 12, direction: "across", row: 6, col: 7, answer: "جاری", clue: "روان و در حال حرکت" },
  { id: "a13", number: 13, direction: "across", row: 7, col: 7, answer: "مشهد", clue: "مرکز استان خراسان رضوی" },
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
