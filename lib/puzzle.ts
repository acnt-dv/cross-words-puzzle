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
  { id: "h1a", number: 1, direction: "across", row: 0, col: 6, answer: "کرنش", clue: "خم‌شدن یا تغییر شکل زیر نیرو" },
  { id: "h2a", number: 2, direction: "across", row: 1, col: 7, answer: "فیلترشکن", clue: "ابزار عبور از محدودیت اینترنت" },
  { id: "h3a", number: 3, direction: "across", row: 2, col: 3, answer: "بلوا", clue: "آشوب و غوغا" },
  { id: "h3b", number: 3, direction: "across", row: 2, col: 7, answer: "رمه", clue: "گروهی از گوسفندان" },
  { id: "h4a", number: 4, direction: "across", row: 3, col: 1, answer: "چپ", clue: "مقابل راست" },
  { id: "h4b", number: 4, direction: "across", row: 3, col: 4, answer: "بت", clue: "پیکرهٔ مورد پرستش" },
  { id: "h4c", number: 4, direction: "across", row: 3, col: 7, answer: "ای", clue: "حرف ندا" },
  { id: "h5a", number: 5, direction: "across", row: 4, col: 1, answer: "نخ", clue: "رشتهٔ باریک برای دوختن" },
  { id: "h5b", number: 5, direction: "across", row: 4, col: 4, answer: "ری", clue: "شهر کهن نزدیک تهران" },
  { id: "h5c", number: 5, direction: "across", row: 4, col: 7, answer: "یا", clue: "حرف انتخاب" },
  { id: "h6a", number: 6, direction: "across", row: 5, col: 2, answer: "گشت", clue: "گردش و بازدید" },
  { id: "h6b", number: 6, direction: "across", row: 5, col: 7, answer: "نگاه", clue: "دیدن و نگریستن" },
  { id: "h7a", number: 7, direction: "across", row: 6, col: 7, answer: "درونمایه", clue: "مضمون اصلی یک اثر" },
  { id: "h8a", number: 8, direction: "across", row: 7, col: 4, answer: "هاون", clue: "ابزار کوبیدن مواد" },
  { id: "v1a", number: 1, direction: "down", row: 1, col: 7, answer: "فرایند", clue: "مجموعه مراحل انجام یک کار" },
  { id: "v2a", number: 2, direction: "down", row: 0, col: 6, answer: "کیمیاگر", clue: "کسی که در پی تبدیل فلزات بود" },
  { id: "v3a", number: 3, direction: "down", row: 0, col: 5, answer: "رله", clue: "قطعهٔ کنترل‌کنندهٔ مدار" },
  { id: "v3b", number: 3, direction: "down", row: 5, col: 5, answer: "او", clue: "ضمیر سوم‌شخص مفرد" },
  { id: "v4a", number: 4, direction: "down", row: 0, col: 4, answer: "نت", clue: "نشانهٔ موسیقی" },
  { id: "v4b", number: 4, direction: "down", row: 3, col: 4, answer: "برهنه", clue: "بدون پوشش" },
  { id: "v5a", number: 5, direction: "down", row: 0, col: 3, answer: "شربتی", clue: "دارای رنگ یا طعم شربت" },
  { id: "v5b", number: 5, direction: "down", row: 6, col: 3, answer: "ما", clue: "ضمیر اول‌شخص جمع" },
  { id: "v6a", number: 6, direction: "down", row: 1, col: 2, answer: "شل", clue: "سفت نبودن" },
  { id: "v6b", number: 6, direction: "down", row: 5, col: 2, answer: "گاو", clue: "دام بزرگ اهلی" },
  { id: "v7a", number: 7, direction: "down", row: 1, col: 1, answer: "کوچنشین", clue: "کسی که با جابه‌جایی زندگی می‌کند" },
  { id: "v8a", number: 8, direction: "down", row: 1, col: 0, answer: "ناپخته", clue: "خام یا کم‌تجربه" },
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
