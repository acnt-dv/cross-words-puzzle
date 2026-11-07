import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { validatePuzzleDocument, type PuzzleDocument } from "./puzzle";

export async function loadPuzzles(): Promise<PuzzleDocument[]> {
  const directory = path.join(process.cwd(), "content", "puzzles");
  const filenames = (await readdir(directory)).filter((filename) => filename.endsWith(".json")).sort();
  if (!filenames.length) throw new Error("پوشهٔ content/puzzles باید حداقل یک فایل JSON داشته باشد.");

  const puzzles = await Promise.all(filenames.map(async (filename) => {
    const source = await readFile(path.join(directory, filename), "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      throw new Error(`${filename}: JSON معتبر نیست — ${message}`);
    }
    return validatePuzzleDocument(parsed, filename);
  }));

  const ids = new Set<string>();
  for (const puzzle of puzzles) {
    if (ids.has(puzzle.id)) throw new Error(`شناسهٔ جدول تکراری است: ${puzzle.id}`);
    ids.add(puzzle.id);
  }
  return puzzles;
}
