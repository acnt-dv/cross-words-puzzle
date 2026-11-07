"use client";

import { useMemo, useRef, useState } from "react";
import {
  GRID_SIZE,
  getEntryCells,
  puzzleCells,
  puzzleEntries,
  type Direction,
} from "@/lib/puzzle";

const PERSIAN_KEY_ROWS = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "چ"],
  ["ش", "س", "ی", "ب", "ل", "ا", "ت", "ن", "م", "ک", "گ"],
  ["ظ", "ط", "ز", "ر", "ذ", "د", "پ", "و", "ژ"],
];

const normalizeLetter = (value: string) =>
  [...value.replace(/ي/g, "ی").replace(/ك/g, "ک")]
    .filter((letter) => /[\u0600-\u06FF]/.test(letter))
    .at(-1) ?? "";

export function CrosswordGame() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeEntryId, setActiveEntryId] = useState("h1a");
  const [activeCellKey, setActiveCellKey] = useState("0-6");
  const [checked, setChecked] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pointerStartedOnActiveCell = useRef(false);
  const pendingFocusEntryId = useRef<string | null>(null);
  const activeEntry = puzzleEntries.find((entry) => entry.id === activeEntryId) ?? puzzleEntries[0];
  const activeKeys = useMemo(
    () => new Set(getEntryCells(activeEntry).map(({ row, col }) => `${row}-${col}`)),
    [activeEntry],
  );
  const filledCount = Object.values(answers).filter(Boolean).length;
  const totalCount = puzzleCells.size;
  const isComplete = filledCount === totalCount;
  const isSolved = isComplete && [...puzzleCells].every(([key, cell]) => answers[key] === cell.answer);

  const focusCell = (key: string, entryId = activeEntryId) => {
    pendingFocusEntryId.current = entryId;
    setActiveCellKey(key);
    inputRefs.current[key]?.focus({ preventScroll: true });
  };

  const selectEntry = (entryId: string, preferredKey?: string) => {
    const entry = puzzleEntries.find((item) => item.id === entryId);
    if (!entry) return;

    setActiveEntryId(entryId);
    const keys = getEntryCells(entry).map(({ row, col }) => `${row}-${col}`);
    const target = preferredKey && keys.includes(preferredKey)
      ? preferredKey
      : keys.find((key) => !answers[key]) ?? keys[0];
    focusCell(target, entryId);
  };

  const selectCell = (key: string, entryIds: string[]) => {
    const pendingEntry = pendingFocusEntryId.current;
    const nextEntry = pendingEntry && entryIds.includes(pendingEntry)
      ? pendingEntry
      : entryIds.includes(activeEntryId)
        ? activeEntryId
        : entryIds[0];
    pendingFocusEntryId.current = null;
    setActiveEntryId(nextEntry);
    setActiveCellKey(key);
  };

  const cycleCellDirection = (key: string, entryIds: string[]) => {
    if (entryIds.length < 2) return;
    const currentIndex = entryIds.indexOf(activeEntryId);
    const nextEntry = entryIds[(currentIndex + 1) % entryIds.length];
    setActiveEntryId(nextEntry);
    setActiveCellKey(key);
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

  const deleteActiveCell = () => {
    if (answers[activeCellKey]) {
      setAnswers((current) => ({ ...current, [activeCellKey]: "" }));
      setChecked(false);
      return;
    }

    const keys = getEntryCells(activeEntry).map(({ row, col }) => `${row}-${col}`);
    const previousKey = keys[keys.indexOf(activeCellKey) - 1];
    if (!previousKey) return;

    setAnswers((current) => ({ ...current, [previousKey]: "" }));
    setChecked(false);
    focusCell(previousKey);
  };

  const resetPuzzle = () => {
    if (filledCount && !window.confirm("همهٔ پاسخ‌ها پاک شوند؟")) return;
    setAnswers({});
    setChecked(false);
    selectEntry("h1a", "0-6");
  };

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="brand-mark" aria-hidden="true">و</div>
        <div>
          <p className="eyebrow">جدول امروز · شمارهٔ ۱</p>
          <h1>واژه‌خانه</h1>
          <p className="intro">۸ سطر افقی و ۸ ستون عمودی؛ هر شماره می‌تواند چند واژهٔ پیوسته داشته باشد.</p>
        </div>
        <div className="size-badge" aria-label="اندازهٔ جدول هشت در هشت">
          <strong>۸ × ۸</strong>
          <span>۱۶ پاسخ درهم‌تنیده</span>
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
            <div className="numbered-grid">
              <div className="column-labels" aria-hidden="true">
                {Array.from({ length: GRID_SIZE }, (_, index) => (
                  <span key={index}>{(GRID_SIZE - index).toLocaleString("fa-IR")}</span>
                ))}
              </div>
              <div className="axis-corner" aria-hidden="true" />
              <div className="crossword-grid" role="grid" aria-label="جدول هشت در هشت؛ سطرهای افقی ۱ تا ۸ و ستون‌های عمودی ۱ تا ۸">
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
                  >
                    <input
                      ref={(node) => { inputRefs.current[key] = node; }}
                      value={answers[key] ?? ""}
                      onFocus={() => selectCell(key, cell.entryIds)}
                      onPointerDown={() => {
                        pointerStartedOnActiveCell.current = activeCellKey === key;
                      }}
                      onClick={() => {
                        if (pointerStartedOnActiveCell.current) {
                          cycleCellDirection(key, cell.entryIds);
                        }
                      }}
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
                      lang="fa"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-label={`ردیف ${row + 1}، ستون ${col + 1}`}
                    />
                  </label>
                );
              })}
              </div>
              <div className="row-labels" aria-hidden="true">
                {Array.from({ length: GRID_SIZE }, (_, index) => (
                  <span key={index}>{(index + 1).toLocaleString("fa-IR")}</span>
                ))}
              </div>
            </div>
          </div>

          <section className="virtual-keyboard" aria-label="صفحه‌کلید فارسی">
            <div className="keyboard-heading">
              <div>
                <strong>صفحه‌کلید فارسی</strong>
                <span>برای تغییر جهت، روی خانهٔ تقاطع دوباره بزنید.</span>
              </div>
              <span className="direction-chip">
                {activeEntry.direction === "across" ? "افقی ←" : "عمودی ↓"}
              </span>
            </div>
            <div className="keyboard-rows" dir="rtl">
              {PERSIAN_KEY_ROWS.map((row, rowIndex) => (
                <div className="keyboard-row" key={rowIndex}>
                  {row.map((letter) => (
                    <button
                      type="button"
                      className="letter-key"
                      key={letter}
                      onClick={() => updateCell(activeCellKey, letter)}
                      aria-label={`حرف ${letter}`}
                    >
                      {letter}
                    </button>
                  ))}
                  {rowIndex === PERSIAN_KEY_ROWS.length - 1 ? (
                    <button
                      type="button"
                      className="delete-key"
                      onClick={deleteActiveCell}
                      aria-label="پاک کردن حرف"
                    >
                      حذف ⌫
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

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
          {(["across", "down"] as Direction[]).map((direction) => {
            const directionEntries = puzzleEntries.filter((entry) => entry.direction === direction);
            return (
              <section className="clue-group" key={direction}>
                <h3>{direction === "across" ? "افقی · سطرهای ۱ تا ۸" : "عمودی · ستون‌های ۱ تا ۸"}</h3>
                <ol>
                  {Array.from({ length: GRID_SIZE }, (_, lineIndex) => {
                    const lineNumber = lineIndex + 1;
                    const lineEntries = directionEntries.filter((entry) => entry.number === lineNumber);
                    return (
                      <li className="clue-line" key={lineNumber}>
                        <span className="clue-line-number">{lineNumber.toLocaleString("fa-IR")}</span>
                        <div className="clue-parts">
                          {lineEntries.map((entry) => (
                            <button
                              className={entry.id === activeEntryId ? "is-selected" : ""}
                              type="button"
                              key={entry.id}
                              onClick={() => selectEntry(entry.id)}
                            >
                              <span>{entry.clue}</span>
                              <small>{entry.answer.length.toLocaleString("fa-IR")} حرف</small>
                            </button>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </aside>
      </section>

      <footer>
        <span>نسخهٔ نمایشی ۰.۱</span>
        <p>ساخته‌شده برای دوست‌داران واژه‌های فارسی</p>
      </footer>
    </main>
  );
}
