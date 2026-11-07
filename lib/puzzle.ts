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

export type PuzzleDocument = {
  version: 1;
  id: string;
  title: string;
  description: string;
  size: 8;
  entries: PuzzleEntry[];
};

export type PuzzleCell = {
  row: number;
  col: number;
  answer: string;
  entryIds: string[];
};

export const GRID_SIZE = 8;
const PERSIAN_WORD = /^[آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+$/u;

export function getEntryCells(entry: PuzzleEntry) {
  return Array.from({ length: [...entry.answer].length }, (_, index) => ({
    row: entry.row + (entry.direction === "down" ? index : 0),
    col: entry.col - (entry.direction === "across" ? index : 0),
  }));
}

export function buildPuzzleCells(entries: PuzzleEntry[]) {
  const cells = new Map<string, PuzzleCell>();
  for (const entry of entries) {
    getEntryCells(entry).forEach(({ row, col }, index) => {
      const key = `${row}-${col}`;
      const existing = cells.get(key);
      const letter = [...entry.answer][index];
      if (existing && existing.answer !== letter) {
        throw new Error(`تعارض حرف در خانهٔ ${key}: «${existing.answer}» با «${letter}» برابر نیست.`);
      }
      cells.set(key, {
        row,
        col,
        answer: letter,
        entryIds: [...(existing?.entryIds ?? []), entry.id],
      });
    });
  }
  return cells;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function assertPuzzle(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function validatePuzzleDocument(value: unknown, source = "فایل جدول"): PuzzleDocument {
  assertPuzzle(isRecord(value), `${source}: ریشهٔ فایل باید یک شیء JSON باشد.`);
  assertPuzzle(value.version === 1, `${source}: مقدار version باید 1 باشد.`);
  assertPuzzle(value.size === GRID_SIZE, `${source}: مقدار size باید 8 باشد.`);
  assertPuzzle(typeof value.id === "string" && /^[a-z0-9-]+$/.test(value.id), `${source}: id فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.`);
  assertPuzzle(typeof value.title === "string" && value.title.trim().length > 0, `${source}: title الزامی است.`);
  assertPuzzle(typeof value.description === "string", `${source}: description باید رشته باشد.`);
  assertPuzzle(Array.isArray(value.entries) && value.entries.length > 0, `${source}: entries نباید خالی باشد.`);

  const ids = new Set<string>();
  const entries = value.entries.map((rawEntry, index): PuzzleEntry => {
    const label = `${source}: entries[${index}]`;
    assertPuzzle(isRecord(rawEntry), `${label} باید یک شیء باشد.`);
    assertPuzzle(typeof rawEntry.id === "string" && /^[hv][1-8][a-z]$/.test(rawEntry.id), `${label}.id باید مانند h3a یا v6b باشد.`);
    assertPuzzle(!ids.has(rawEntry.id), `${label}.id تکراری است: ${rawEntry.id}`);
    ids.add(rawEntry.id);
    assertPuzzle(Number.isInteger(rawEntry.number) && Number(rawEntry.number) >= 1 && Number(rawEntry.number) <= GRID_SIZE, `${label}.number باید بین 1 و 8 باشد.`);
    assertPuzzle(rawEntry.direction === "across" || rawEntry.direction === "down", `${label}.direction فقط across یا down است.`);
    assertPuzzle(Number.isInteger(rawEntry.row) && Number(rawEntry.row) >= 0 && Number(rawEntry.row) < GRID_SIZE, `${label}.row باید بین 0 و 7 باشد.`);
    assertPuzzle(Number.isInteger(rawEntry.col) && Number(rawEntry.col) >= 0 && Number(rawEntry.col) < GRID_SIZE, `${label}.col باید بین 0 و 7 باشد.`);
    assertPuzzle(typeof rawEntry.answer === "string" && [...rawEntry.answer].length >= 2 && PERSIAN_WORD.test(rawEntry.answer), `${label}.answer باید واژهٔ فارسی با حداقل 2 حرف و بدون فاصله یا اعراب باشد.`);
    assertPuzzle(typeof rawEntry.clue === "string" && rawEntry.clue.trim().length > 0, `${label}.clue الزامی است.`);

    const entry = rawEntry as unknown as PuzzleEntry;
    const expectedNumber = entry.direction === "across" ? entry.row + 1 : GRID_SIZE - entry.col;
    assertPuzzle(entry.number === expectedNumber, `${label}.number باید با سطر یا ستون متناظر برابر ${expectedNumber} باشد.`);
    for (const cell of getEntryCells(entry)) {
      assertPuzzle(cell.row >= 0 && cell.row < GRID_SIZE && cell.col >= 0 && cell.col < GRID_SIZE, `${label} از محدودهٔ 8×8 خارج شده است.`);
    }
    return entry;
  });

  const expectedLines = "1,2,3,4,5,6,7,8";
  for (const direction of ["across", "down"] as Direction[]) {
    const numbers = [...new Set(entries.filter((entry) => entry.direction === direction).map((entry) => entry.number))].sort((a, b) => a - b);
    assertPuzzle(numbers.join() === expectedLines, `${source}: جهت ${direction} باید همهٔ شماره‌های 1 تا 8 را داشته باشد.`);
  }

  const cells = buildPuzzleCells(entries);
  assertPuzzle(cells.size >= 40, `${source}: جدول باید حداقل 40 خانهٔ سفید داشته باشد.`);
  for (const cell of cells.values()) {
    assertPuzzle(cell.entryIds.length === 2, `${source}: خانهٔ ${cell.row}-${cell.col} باید دقیقاً در یک افقی و یک عمودی مشترک باشد.`);
    const directions = cell.entryIds.map((id) => entries.find((entry) => entry.id === id)?.direction);
    assertPuzzle(directions.includes("across") && directions.includes("down"), `${source}: خانهٔ ${cell.row}-${cell.col} تقاطع کامل افقی/عمودی نیست.`);
  }

  for (let index = 0; index < GRID_SIZE; index++) {
    const rowCount = [...cells.values()].filter((cell) => cell.row === index).length;
    const columnCount = [...cells.values()].filter((cell) => cell.col === index).length;
    assertPuzzle(rowCount >= 4, `${source}: سطر ${index + 1} کمتر از 4 خانهٔ سفید دارد.`);
    assertPuzzle(columnCount >= 4, `${source}: ستون ${GRID_SIZE - index} کمتر از 4 خانهٔ سفید دارد.`);
  }

  const [firstKey] = cells.keys();
  const visited = new Set([firstKey]);
  const queue = [firstKey];
  while (queue.length) {
    const key = queue.shift()!;
    const cell = cells.get(key)!;
    for (const neighbour of [`${cell.row - 1}-${cell.col}`, `${cell.row + 1}-${cell.col}`, `${cell.row}-${cell.col - 1}`, `${cell.row}-${cell.col + 1}`]) {
      if (cells.has(neighbour) && !visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push(neighbour);
      }
    }
  }
  assertPuzzle(visited.size === cells.size, `${source}: خانه‌های سفید باید یک شبکهٔ متصل بسازند.`);

  return { ...value, entries } as PuzzleDocument;
}

export function validatePuzzleCollection(puzzles: PuzzleDocument[]) {
  const ids = new Set<string>();
  const answers = new Map<string, string>();

  for (const puzzle of puzzles) {
    assertPuzzle(!ids.has(puzzle.id), `شناسهٔ جدول تکراری است: ${puzzle.id}`);
    ids.add(puzzle.id);

    for (const entry of puzzle.entries) {
      const previousPuzzleId = answers.get(entry.answer);
      assertPuzzle(
        !previousPuzzleId,
        `پاسخ «${entry.answer}» در جدول‌های ${previousPuzzleId} و ${puzzle.id} تکرار شده است.`,
      );
      answers.set(entry.answer, puzzle.id);
    }
  }

  return puzzles;
}
