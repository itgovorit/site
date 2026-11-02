// The 10x10 adjective board, shared by adjectives task 1 and the adjectives
// cheat sheet so both always show the same picture for a pair. Shapes come from
// src/data/adjectives/task1.json; styling lives under .adj-grid in style.css.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TONE_CLASS = {
  fill: "t-fill",
  light: "t-light",
  under: "t-under",
};

// Shapes paint in the order they are listed, and a later one replaces the tone
// of the cells it covers. `glass` is the exception: it keeps whatever is
// underneath and lays a translucent green over it, which is the whole point of
// transparent vs opaque — on one side the red shows through, on the other the
// same green hides it completely.
function paint(pair) {
  const base = new Map();
  const glass = new Set();

  for (const shape of pair.shapes ?? []) {
    for (let row = shape.row; row < shape.row + shape.height; row++) {
      for (let col = shape.col; col < shape.col + shape.width; col++) {
        const key = `${row}:${col}`;
        if (shape.tone === "glass") glass.add(key);
        else base.set(key, TONE_CLASS[shape.tone ?? "fill"]);
      }
    }
  }
  return { base, glass };
}

// Fast/slow is the one pair that cannot be drawn, because the difference is in
// time rather than in shape. Its cells start empty and are lit by animateBars,
// so they are tagged with the bar they belong to and their position along it.
function motionCells(pair) {
  const cells = new Map();
  (pair.motion ?? []).forEach((bar, barIndex) => {
    for (let i = 0; i < bar.length; i++) {
      cells.set(`${bar.row}:${bar.col + i}`, { bar: barIndex, index: i });
    }
  });
  return cells;
}

// A shape running off the board would silently lose cells, so say so loudly
// while the numbers are still being tuned.
export function checkPairs(pairs, grid) {
  if (!import.meta.env.DEV) return;
  for (const pair of pairs) {
    for (const shape of pair.shapes ?? []) {
      const fits =
        shape.col >= 0 &&
        shape.row >= 0 &&
        shape.col + shape.width <= grid &&
        shape.row + shape.height <= grid;
      if (!fits) console.warn(`adjective board: a shape in "${pair.id}" does not fit the board`);
    }
    for (const bar of pair.motion ?? []) {
      if (bar.col + bar.length > grid || bar.row >= grid) {
        console.warn(`adjective board: a bar in "${pair.id}" does not fit the board`);
      }
    }
  }
}

// The board as a whole is the illustration, so it carries one description and
// the cells themselves stay out of the accessibility tree.
//
// It sizes itself with width:100%, so its parent needs a definite width. Put it
// straight into a block or a stretched flex item, not a shrink-to-fit wrapper,
// or it collapses to nothing.
export function Board(pair, grid = 10) {
  const { base, glass } = paint(pair);
  const motion = motionCells(pair);

  let cells = "";
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const key = `${row}:${col}`;
      const classes = [base.get(key), glass.has(key) ? "has-glass" : ""]
        .filter(Boolean)
        .join(" ");
      const bar = motion.get(key);
      const attrs = bar ? ` data-bar="${bar.bar}" data-cell="${bar.index}"` : "";
      cells += `<span class="${classes}"${attrs}></span>`;
    }
  }

  return `
    <div class="adj-grid" role="img" aria-label="${escapeHtml(pair.alt)}">
      ${cells}
    </div>
  `;
}

// --- Fast / slow animation --------------------------------------------------

// Milliseconds per cell. Both bars fill the same cells, so the only thing that
// differs is how long each takes, which is exactly the pair being taught.
const STEP_MS = { fast: 110, slow: 420 };
// A beat with the slow bar full, before both reset together.
const HOLD_MS = 900;
const TICK_MS = 60;

// Light the first `count` cells of each bar and clear the rest.
function drawBars(cells, bars, countFor) {
  for (const cell of cells) {
    const bar = bars[Number(cell.dataset.bar)];
    cell.classList.toggle("t-fill", Number(cell.dataset.cell) < countFor(bar));
  }
}

// Run the fast/slow bars inside `root`. Returns a stop function, and a no-op if
// the pair has no bars, so callers never need to check.
export function animateBars(root, pair) {
  const cells = [...root.querySelectorAll("[data-bar]")];
  const bars = pair.motion ?? [];
  if (!cells.length || !bars.length) return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // No animation, so show the single frame that tells the story instead: the
    // fast bar has finished while the slow one is barely started.
    drawBars(cells, bars, (bar) =>
      bar.speed === "fast" ? bar.length : Math.ceil(bar.length / 3),
    );
    return () => {};
  }

  // One timer drives both bars off a shared clock, so they cannot drift apart
  // and they always restart together.
  const cycle = Math.max(...bars.map((bar) => STEP_MS[bar.speed] * bar.length)) + HOLD_MS;
  const start = performance.now();
  const tick = () => {
    const elapsed = (performance.now() - start) % cycle;
    drawBars(cells, bars, (bar) => Math.floor(elapsed / STEP_MS[bar.speed]));
  };

  tick();
  const timer = setInterval(tick, TICK_MS);
  return () => clearInterval(timer);
}
