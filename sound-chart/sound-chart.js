import "../src/style.css";
import { Header } from "../src/components/header.js";

// Phoneme rows: each cell carries its id, symbol and example word.
import chart from "../src/data/sound-chart.json";

// Which sounds are learned and so show a rune. Edit this file to reveal more.
import runes from "../src/data/sound-chart-runes.json";

// The classic English phonemic chart: 20 vowels on top, 24 consonants below.
//
// Layout notes — the grid is 24 units wide so both halves line up on the same
// column edges, exactly as in the printed chart:
//   • vowel and consonant cells span 3 units (24 / 8 = one eighth)
//   • diphthong cells span 4 units, so 3 of them fill the same width as 4
//     vowels, putting the block divider dead centre
// Every row therefore adds up to 24 units and the layout never reflows: the
// chart keeps its shape and the cells only grow or shrink with the viewport.

// The wooden board the chart is laid out on.
import boardAvifUrl from "../src/img/phonemes/sound-bg.avif";
import boardJpegUrl from "../src/img/phonemes/sound-bg.jpeg";

// Rune art, keyed by a sound's short id (e.g. "c-3"), each with both formats.
// Only URL strings are imported here; the bytes load when the browser paints.
const runeModules = import.meta.glob("../src/img/phonemes/*.{png,avif}", {
  eager: true,
  import: "default",
});
// A short id and nothing else, so other art in the folder (the board) is skipped.
const RUNE_FILE = /^[vdc]-\d+$/;
const runeArt = {};
for (const [path, url] of Object.entries(runeModules)) {
  const file = path.split("/").pop();
  const dot = file.lastIndexOf(".");
  const key = file.slice(0, dot);
  if (!RUNE_FILE.test(key)) continue;
  runeArt[key] ??= {};
  runeArt[key][file.slice(dot + 1)] = url;
}

// The three chart sections. `prefix` is the group's short name — v = vowel,
// d = diphthong, c = consonant — which combines with a phoneme's id into its
// short id, e.g. "c-3". That short id is the single handle for a sound: the key
// in sound-chart-runes.json, the rune file name, and the ?highlight= token.
// Ids stay independent per group.
const SECTIONS = {
  vowels: { rows: chart.vowels, prefix: "v" },
  diphthongs: { rows: chart.diphthongs, prefix: "d" },
  consonants: { rows: chart.consonants, prefix: "c" },
};

// A sound shows its rune only when it is listed as learned *and* the art exists,
// so an unfinished image can never break a cell.
function runeFor(prefix, id) {
  const unlocked = runes[prefix]?.includes(id);
  const key = `${prefix}-${id}`;
  return unlocked && runeArt[key]?.png ? { key, ...runeArt[key] } : null;
}

// Shared cell look. Cells are transparent so the board shows through; the ink
// colour and every grid line come from the .sound-chart rules in src/style.css.
// min-h-[46px] gives each cell a comfortable tap target, and the grid's min-width
// does the same for the horizontal axis (see Chart).
const CELL =
  "flex min-h-[46px] items-center justify-center px-1 leading-none";

// The chart's two heavy rules, styled in src/style.css: after the 4th column, and
// under the last vowel row.
const RULE_RIGHT = "rule-right";
const RULE_BOTTOM = "rule-bottom";

// Span classes are passed as whole strings, never built from a number, so
// Tailwind's scanner can see them in the source and generate the utilities.
const SPAN_NARROW = "col-span-3"; // vowels and consonants: 1/8 of the row
const SPAN_WIDE = "col-span-4"; // diphthongs: 3 of them match 4 vowels

// IPA is read out poorly by screen readers and is hard to place at a glance, so
// every cell is labelled "/iː/ as in see" for both the tooltip and assistive tech.
function Cell(cell, { prefix, spanClass, extra = "" }) {
  const { id, symbol, example } = cell;
  const label = example ? `/${symbol}/ as in ${example}` : `/${symbol}/`;
  const rune = runeFor(prefix, id);

  // Data attributes are the lookup keys for highlighting and for the card.
  const identity = `data-symbol="${symbol}" data-key="${prefix}-${id}"`;

  // A learned sound shows its rune (the art already contains the symbol), so the
  // <img> itself needs no alt text — the button carries the label.
  const face = rune
    ? `<picture>
        ${rune.avif ? `<source srcset="${rune.avif}" type="image/avif" />` : ""}
        <img src="${rune.png}" alt="" class="h-10 w-10 object-contain sm:h-12 sm:w-12" />
      </picture>`
    : `<span class="text-xl sm:text-2xl">${symbol}</span>`;

  // Only learned sounds do something on click, so only those are buttons —
  // an unlearned cell would otherwise be a control that goes nowhere.
  if (rune) {
    return `
      <button
        type="button"
        class="phoneme rune ${CELL} ${spanClass} ${extra} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--chart-focus)]"
        ${identity}
        title="${label}"
        aria-label="${label}"
        aria-haspopup="dialog"
      >${face}</button>
    `;
  }

  // No rune yet, so the sound reads as inactive: carved into the boards.
  return `
    <div class="phoneme carved ${CELL} ${spanClass} ${extra}" ${identity} title="${label}" aria-label="${label}" role="img">${face}</div>
  `;
}

// Top-right box of the printed chart: primary stress plus rising and falling
// intonation. These are marks rather than sounds, so the cell is not clickable.
function StressCell() {
  return `
    <div
      class="carved ${CELL} col-span-4 flex-col gap-0.5"
      role="img"
      aria-label="Stress and intonation marks"
    >
      <span class="text-lg leading-none">ˈ</span>
      <span class="text-sm leading-none" aria-hidden="true">↗↘</span>
    </div>
  `;
}

function VowelRow(vowelRow, diphRow, rowIndex) {
  // Thick rule under row 3 separates vowels from consonants.
  const isLastVowelRow = rowIndex === SECTIONS.vowels.rows.length - 1;
  const underline = isLastVowelRow ? RULE_BOTTOM : "";

  const left = vowelRow
    .map((cell, i) =>
      Cell(cell, {
        prefix: SECTIONS.vowels.prefix,
        spanClass: SPAN_NARROW,
        // Thick rule after the 4th column splits vowels from diphthongs.
        extra: `${i === vowelRow.length - 1 ? RULE_RIGHT : ""} ${underline}`,
      }),
    )
    .join("");

  const right = diphRow
    .map((cell) =>
      Cell(cell, {
        prefix: SECTIONS.diphthongs.prefix,
        spanClass: SPAN_WIDE,
        extra: underline,
      }),
    )
    .join("");

  // Row 1 is two diphthongs short of full width; the stress box fills the gap.
  const filler = rowIndex === 0 ? StressCell() : "";

  return left + right + filler;
}

function ConsonantRow(row) {
  return row
    .map((cell) =>
      Cell(cell, {
        prefix: SECTIONS.consonants.prefix,
        spanClass: SPAN_NARROW,
      }),
    )
    .join("");
}

function Chart() {
  const vowelCells = SECTIONS.vowels.rows
    .map((row, i) => VowelRow(row, SECTIONS.diphthongs.rows[i], i))
    .join("");
  const consonantCells = SECTIONS.consonants.rows.map(ConsonantRow).join("");

  // The board is a background image so the cells above it can stay transparent.
  // Stated twice: browsers without image-set() take the plain jpeg on the first
  // line, the rest pick the smaller avif on the second.
  const board = [
    `background-image: url(${boardJpegUrl});`,
    `background-image: image-set(url(${boardAvifUrl}) type('image/avif'), url(${boardJpegUrl}) type('image/jpeg'));`,
  ].join(" ");

  // min-w keeps the narrowest cell at ~46px: the 1px frame comes off the top,
  // leaving (400 - 1) / 24 ≈ 16.6px per unit, so a 3-unit cell is ~49.9px. Below
  // that width the wrapper scrolls instead of squashing cells.
  return `
    <div id="chart-scroll" class="overflow-x-auto px-4 pb-12">
      <div
        class="sound-chart mx-auto grid w-full max-w-3xl min-w-[400px] grid-cols-[repeat(24,minmax(0,1fr))]"
        style="${board}"
      >
        ${vowelCells}
        ${consonantCells}
      </div>
    </div>
  `;
}

// The card opened by a rune. Intentionally empty for now — `data-key` and
// `data-symbol` are set on open, so the content can be filled in later.
function RuneCard() {
  return `
    <dialog id="rune-card" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Закрыть">✕</button>
        </form>
        <div class="card-content"></div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button aria-label="Закрыть">close</button>
      </form>
    </dialog>
  `;
}

// Credit for the layout this chart is based on.
function Credits() {
  return `
    <section class="mx-auto max-w-3xl px-4 pb-12 text-sm text-base-content/60">
      За основу взята
      <a
        class="link link-secondary"
        href="https://adrianunderhill.com/the-pronunciation-charts/"
        target="_blank"
        rel="noopener noreferrer"
        >Sound Foundations chart</a
      >
      Адриана Андерхилла (Adrian Underhill).
    </section>
  `;
}

function Explanation() {
  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Таблица звуков 🔊</h1>
      <p>
        Все 44 звука английского языка на одной картинке. Сверху гласные: слева
        монофтонги, справа дифтонги. Снизу согласные. Звуки, которые мы уже
        разобрали, превращаются в руны — нажми на руну, чтобы открыть карточку.
      </p>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/" })}
    <main>
      ${Explanation()}
      ${Chart()}
      ${Credits()}
    </main>
    ${RuneCard()}
  `;
}

// --- Highlighting from the URL ---
//
// Another page can link here with sounds pre-highlighted, listing their short
// ids (v = vowel, d = diphthong, c = consonant), e.g.
//   /sound-chart/?highlight=c-3,c-11,v-1
// Short ids keep the link readable, since IPA symbols would need percent
// encoding. Unknown tokens are ignored.
// A highlighted sound glows: a gold light pulses behind it and shows through the
// translucent rune art. The effect lives in src/style.css, since it needs a
// pseudo-element and keyframes.
const HIGHLIGHT = "rune-glow";

function applyHighlightFromUrl() {
  const raw = new URLSearchParams(window.location.search).get("highlight");
  if (!raw) return;

  const wanted = raw
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (wanted.length === 0) return;

  const cells = [...document.querySelectorAll(".phoneme")];
  const matched = cells.filter((cell) =>
    wanted.includes(cell.dataset.key.toLowerCase()),
  );

  matched.forEach((cell) => {
    cell.classList.add(HIGHLIGHT);
    // Marks the cell for anything that needs to find the highlighted set later.
    cell.dataset.highlighted = "true";
  });

  // The chart scrolls sideways on narrow screens, so bring the first match into
  // view rather than leaving it off the edge.
  matched[0]?.scrollIntoView({ inline: "center", block: "nearest" });
}

// --- The rune card ---
function setupRuneCard() {
  const root = document.querySelector("#app");
  const dialog = document.querySelector("#rune-card");
  if (!root || !dialog) return;

  root.addEventListener("click", (event) => {
    const cell = event.target.closest(".rune");
    if (!cell) return;

    // Hand the card what it needs; the content itself comes later.
    dialog.dataset.key = cell.dataset.key;
    dialog.dataset.symbol = cell.dataset.symbol;
    dialog.showModal();
  });
}

document.querySelector("#app").innerHTML = App();
applyHighlightFromUrl();
setupRuneCard();
