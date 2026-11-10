const SIZE = 8;
const MIN_BLOCKS = 12;
const MAX_BLOCKS = 24;

const key = (row, col) => `${row}-${col}`;

function hasThreeInLine(blocks) {
  for (let index = 0; index < SIZE; index++) {
    let horizontalRun = 0;
    let verticalRun = 0;
    for (let position = 0; position < SIZE; position++) {
      horizontalRun = blocks.has(key(index, position)) ? horizontalRun + 1 : 0;
      verticalRun = blocks.has(key(position, index)) ? verticalRun + 1 : 0;
      if (horizontalRun > 2 || verticalRun > 2) return true;
    }
  }
  return false;
}

function hasShortWhiteSegment(blocks) {
  for (const vertical of [false, true]) {
    for (let index = 0; index < SIZE; index++) {
      let run = 0;
      for (let position = 0; position <= SIZE; position++) {
        const row = vertical ? position : index;
        const col = vertical ? index : position;
        const white = position < SIZE && !blocks.has(key(row, col));
        if (white) run++;
        else if (run) {
          if (run < 2) return true;
          run = 0;
        }
      }
    }
  }
  return false;
}

function isConnected(blocks) {
  const whites = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (!blocks.has(key(row, col))) whites.push({ row, col });
    }
  }

  const visited = new Set([key(whites[0].row, whites[0].col)]);
  const queue = [whites[0]];
  while (queue.length) {
    const { row, col } = queue.shift();
    for (const [nextRow, nextCol] of [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]) {
      const nextKey = key(nextRow, nextCol);
      if (nextRow >= 0 && nextRow < SIZE && nextCol >= 0 && nextCol < SIZE && !blocks.has(nextKey) && !visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push({ row: nextRow, col: nextCol });
      }
    }
  }
  return visited.size === whites.length;
}

function isAsymmetric(blocks) {
  const hasHorizontalMirror = [...blocks].every((item) => {
    const [row, col] = item.split("-").map(Number);
    return blocks.has(key(row, SIZE - 1 - col));
  });
  const hasVerticalMirror = [...blocks].every((item) => {
    const [row, col] = item.split("-").map(Number);
    return blocks.has(key(SIZE - 1 - row, col));
  });
  const hasRotation = [...blocks].every((item) => {
    const [row, col] = item.split("-").map(Number);
    return blocks.has(key(SIZE - 1 - row, SIZE - 1 - col));
  });
  return !hasHorizontalMirror && !hasVerticalMirror && !hasRotation;
}

function isValid(blocks) {
  if (hasThreeInLine(blocks) || hasShortWhiteSegment(blocks) || !isConnected(blocks) || !isAsymmetric(blocks)) return false;
  for (let index = 0; index < SIZE; index++) {
    const rowWhites = Array.from({ length: SIZE }, (_, col) => !blocks.has(key(index, col))).filter(Boolean).length;
    const columnWhites = Array.from({ length: SIZE }, (_, row) => !blocks.has(key(row, index))).filter(Boolean).length;
    if (rowWhites < 4 || columnWhites < 4) return false;
  }
  return true;
}

function createLayout() {
  const cells = Array.from({ length: SIZE * SIZE }, (_, index) => ({ row: Math.floor(index / SIZE), col: index % SIZE }));
  for (let attempt = 0; attempt < 10_000; attempt++) {
    const shuffled = [...cells].sort(() => Math.random() - 0.5);
    const count = MIN_BLOCKS + Math.floor(Math.random() * (MAX_BLOCKS - MIN_BLOCKS + 1));
    const blocks = new Set();

    for (const { row, col } of shuffled) {
      if (blocks.size === count) break;
      blocks.add(key(row, col));
      if (hasThreeInLine(blocks) || hasShortWhiteSegment(blocks)) blocks.delete(key(row, col));
    }

    if (isValid(blocks)) {
      return [...blocks]
        .map((item) => {
          const [row, col] = item.split("-").map(Number);
          return { row, col };
        })
        .sort((a, b) => a.row - b.row || a.col - b.col);
    }
  }
  throw new Error("Could not generate a valid 8×8 layout. Please run the command again.");
}

const blocks = createLayout();
console.log(JSON.stringify({ blocks }, null, 2));
console.error(`\nPreview (# = black square):\n${Array.from({ length: SIZE }, (_, row) => Array.from({ length: SIZE }, (_, col) => blocks.some((block) => block.row === row && block.col === col) ? "#" : ".").join("")).join("\n")}`);
