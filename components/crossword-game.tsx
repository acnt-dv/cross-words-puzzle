"use client";

import { useMemo, useRef, useState } from "react";
import {
  GRID_SIZE,
  getEntryCells,
  puzzleCells,
  puzzleEntries,
  type Direction,
} from "@/lib/puzzle";

const normalizeLetter = (value: string) =>
  [...value.replace(/ي/g, "ی").replace(/ك/g, "ک")]
    .filter((letter) => /[\u0600-\u06FF]/.test(letter))
    .at(-1) ?? "";

export function CrosswordGame() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeEntryId, setActiveEntryId] = useState("a1");
  const [activeCellKey, setActiveCellKey] = useState("0-6");
  const [checked, setChecked] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const activeEntry = puzzleEntries.find((entry) => entry.id === activeEntryId) ?? puzzleEntries[0];
  const activeKeys = useMemo(
    () => new Set(getEntryCells(activeEntry).map(({ row, col }) => `${row}-${col}`)),
    [activeEntry],
  );
  const filledCount = Object.values(answers).filter(Boolean).length;
  const totalCount = puzzleCells.size;
  const isComplete = filledCount === totalCount;
  const isSolved = isComplete && [...puzzleCells].every(([key, cell]) => answers[key] === cell.answer);

  const focusCell = (key: string) => {
    setActiveCellKey(key);
    requestAnimationFrame(() => inputRefs.current[key]?.focus());
  };

  const selectEntry = (entryId: string, preferredKey?: string) => {
    const entry = puzzleEntries.find((item) => item.id === entryId);
    if (!entry) return;

    setActiveEntryId(entryId);
    const keys = getEntryCells(entry).map(({ row, col }) => `${row}-${col}`);
    const target = preferredKey && keys.includes(preferredKey)
      ? preferredKey
      : keys.find((key) => !answers[key]) ?? keys[0];
    focusCell(target);
  };

  const selectCell = (key: string, entryIds: string[]) => {
    const nextEntry = entryIds.includes(activeEntryId) ? activeEntryId : entryIds[0];
    selectEntry(nextEntry, key);
  };

  const moveWithinEntry = (key: string, offset: number) => {
    if (!offset) return;
    const keys = getEntryCells(activeEntry).map(({ row, col }) => `${row}-${col}`);
    const index = keys.indexOf(key);
    const nextKey = keys[index + offset];
    if (nextKey) focusCell(nextKey);
  };

  const updateCell = (key: string, rawValue: string) => {
    const value = normalizeLetter(rawValue);
    setAnswers((current) => ({ ...current, [key]: value }));
    setChecked(false);
    if (value) moveWithinEntry(key, 1);
  };

  const resetPuzzle = () => {
    if (filledCount && !window.confirm("همهٔ پاسخ‌ها پاک شوند؟")) return;
    setAnswers({});
    setChecked(false);
    selectEntry("a1", "0-6");
  };

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="brand-mark" aria-hidden="true">و</div>
        <div>
          <p className="eyebrow">جدول امروز · شمارهٔ ۱</p>
          <h1>واژه‌خانه</h1>
          <p className="intro">یک جدول کوچک فارسی؛ سرنخ را بخوانید و خانه‌ها را با صفحه‌کلید پر کنید.</p>
        </div>
        <div className="size-badge" aria-label="اندازهٔ جدول هشت در هشت">
          <strong>۸ × ۸</strong>
          <span>نسخهٔ آزمایشی</span>
        </div>
      </header>

      <section className="game-layout" aria-label="جدول کلمات متقاطع">
        <div className="board-card">
          <div className="progress-row">
            <div>
              <span>{filledCount.toLocaleString("fa-IR")} از {totalCount.toLocaleString("fa-IR")} خانه</span>
              <div className="progress-track" aria-hidden="true">
                <span style={{ width: `${(filledCount / totalCount) * 100}%` }} />
              </div>
            </div>
            <p>{activeEntry.number.toLocaleString("fa-IR")}. {activeEntry.clue}</p>
          </div>

          <div className="grid-frame">
            <div className="crossword-grid" role="grid" aria-label="جدول هشت در هشت">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
                const row = Math.floor(index / GRID_SIZE);
                const col = index % GRID_SIZE;
                const key = `${row}-${col}`;
                const cell = puzzleCells.get(key);

                if (!cell) return <span className="block-cell" key={key} aria-hidden="true" />;

                const isCorrect = checked && answers[key] === cell.answer;
                const isWrong = checked && Boolean(answers[key]) && answers[key] !== cell.answer;

                return (
                  <label
                    className={`letter-cell ${activeKeys.has(key) ? "is-in-word" : ""} ${activeCellKey === key ? "is-active" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                    key={key}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectCell(key, cell.entryIds);
                    }}
                  >
                    {cell.number ? <span className="cell-number">{cell.number.toLocaleString("fa-IR")}</span> : null}
                    <input
                      ref={(node) => { inputRefs.current[key] = node; }}
                      value={answers[key] ?? ""}
                      onFocus={() => selectCell(key, cell.entryIds)}
                      onChange={(event) => updateCell(key, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Backspace") {
                          if (!answers[key]) moveWithinEntry(key, -1);
                          else updateCell(key, "");
                        }
                        if (event.key === "ArrowLeft") moveWithinEntry(key, activeEntry.direction === "across" ? 1 : 0);
                        if (event.key === "ArrowRight") moveWithinEntry(key, activeEntry.direction === "across" ? -1 : 0);
                        if (event.key === "ArrowDown") moveWithinEntry(key, activeEntry.direction === "down" ? 1 : 0);
                        if (event.key === "ArrowUp") moveWithinEntry(key, activeEntry.direction === "down" ? -1 : 0);
                      }}
                      inputMode="text"
                      autoComplete="off"
                      aria-label={`ردیف ${row + 1}، ستون ${col + 1}`}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="actions">
            <button className="primary-button" type="button" onClick={() => setChecked(true)}>بررسی پاسخ‌ها</button>
            <button className="secondary-button" type="button" onClick={resetPuzzle}>پاک کردن جدول</button>
          </div>

          {checked ? (
            <div className={`result-message ${isSolved ? "success" : ""}`} role="status">
              {isSolved
                ? "آفرین! همهٔ پاسخ‌ها درست است."
                : isComplete
                  ? "چند خانه نیاز به بازبینی دارد؛ خانه‌های قرمز را دوباره بررسی کنید."
                  : "هنوز جدول کامل نشده است؛ خانه‌های پرشده بررسی شدند."}
            </div>
          ) : null}
        </div>

        <aside className="clues-card">
          <div className="clues-heading">
            <p className="eyebrow">راهنمای بازی</p>
            <h2>سرنخ‌ها</h2>
          </div>
          {(["across", "down"] as Direction[]).map((direction) => (
            <section className="clue-group" key={direction}>
              <h3>{direction === "across" ? "افقی" : "عمودی"}</h3>
              <ol>
                {puzzleEntries.filter((entry) => entry.direction === direction).map((entry) => (
                  <li key={entry.id}>
                    <button
                      className={entry.id === activeEntryId ? "is-selected" : ""}
                      type="button"
                      onClick={() => selectEntry(entry.id)}
                    >
                      <span>{entry.number.toLocaleString("fa-IR")}</span>
                      {entry.clue}
                      <small>{entry.answer.length.toLocaleString("fa-IR")} حرف</small>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </aside>
      </section>

      <footer>
        <span>نسخهٔ نمایشی ۰.۱</span>
        <p>ساخته‌شده برای دوست‌داران واژه‌های فارسی</p>
      </footer>
    </main>
  );
}
