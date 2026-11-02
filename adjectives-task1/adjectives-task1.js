import "../src/style.css";
import { Header } from "../src/components/header.js";

import data from "../src/data/adjectives/task1.json";
import { Board as drawBoard, animateBars, checkPairs } from "../src/components/adjective-board.js";

// A clip per pair, named by the data. Only URL strings are imported here; the
// bytes load when the user presses play.
const audioModules = import.meta.glob("../src/audio/adjectives/task1/*.mp3", {
  eager: true,
  import: "default",
});
const audioByFile = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [path.split("/").pop(), url]),
);

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

const GRID = data.grid;
const PAIRS = data.pairs;
const OPTION_COUNT = 3;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Fisher–Yates shuffle (returns a new array).
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Some boards are near-twins — thick/thin is wide/narrow rotated a quarter
// turn, and the slow bar mid-fill is the short bar — so offering them against
// each other would test luck rather than the words. Each clash is declared once
// in the data under `confusableWith` and mirrored here, since "easy to mistake
// for" runs both ways.
const CONFLICTS = (() => {
  const map = new Map(PAIRS.map((pair) => [pair.id, new Set()]));
  for (const pair of PAIRS) {
    for (const otherId of pair.confusableWith ?? []) {
      if (import.meta.env.DEV && !map.has(otherId)) {
        console.warn(`adjectives task1: "${pair.id}" lists unknown pair "${otherId}"`);
        continue;
      }
      map.get(pair.id).add(otherId);
      map.get(otherId).add(pair.id);
    }
  }
  return map;
})();

// Decoys are drawn from the pairs the answer cannot be mistaken for. Only the
// answer is protected: two near-twins may well end up side by side as the two
// wrong options, and that is harmless, because whichever board is on screen
// looks like neither of them.
function pickDecoys(answer) {
  const banned = CONFLICTS.get(answer.id);
  const pool = PAIRS.filter((other) => other.id !== answer.id && !banned.has(other.id));

  if (import.meta.env.DEV && pool.length < OPTION_COUNT - 1) {
    console.warn(
      `adjectives task1: "${answer.id}" rules out too much to fill ${OPTION_COUNT} options`,
    );
  }
  return shuffle(pool).slice(0, OPTION_COUNT - 1);
}

// Every pair is asked once, in a random order. Built once at load, so the
// answers cannot shift under the user mid-run.
const DECK = shuffle(PAIRS).map((pair) => ({
  pair,
  options: shuffle([pair, ...pickDecoys(pair)]),
}));

// --- Board -----------------------------------------------------------------

// Drawing lives in src/components/adjective-board.js, shared with the cheat
// sheet. Kept as a direct child of the card body: the grid sizes itself with
// width:100%, so a shrink-to-fit wrapper would collapse it.
checkPairs(PAIRS, GRID);
const Board = (pair) => drawBoard(pair, GRID);

// --- Markup ----------------------------------------------------------------

const arrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
`;

function QuestionCard(entry, index) {
  const isLast = index === DECK.length - 1;

  const options = entry.options
    .map(
      (option) => `
        <button
          type="button"
          class="option btn btn-outline btn-secondary"
          data-id="${escapeHtml(option.id)}"
          disabled
        >${escapeHtml(option.title)}</button>`,
    )
    .join("");

  return `
    <div
      class="question card bg-base-100 shadow-sm${index === 0 ? "" : " hidden"}"
      data-index="${index}"
      data-answer="${escapeHtml(entry.pair.id)}"
    >
      <div class="card-body items-center gap-5">
        ${Board(entry.pair)}

        <div class="flex flex-wrap justify-center gap-3">${options}</div>

        <!-- Laid out from the start and only unseen, so revealing the answer
             moves nothing on the page. The translation stays blurred behind a
             spoiler: worth a guess in English before reading the Russian. -->
        <div class="reveal invisible text-center">
          <div class="flex flex-wrap items-center justify-center gap-2">
            <p class="text-xl font-semibold">${escapeHtml(entry.pair.title)}</p>
            ${
              // h-11 w-11 is the 44px tap target used across the site.
              audioByFile[entry.pair.audio]
                ? `<button
                    type="button"
                    class="play btn btn-circle btn-ghost h-11 min-h-0 w-11 border border-base-content/30 p-0 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
                    data-audio="${escapeHtml(entry.pair.audio)}"
                    aria-label="Прослушать: ${escapeHtml(entry.pair.title)}"
                  >${speakerIcon}</button>`
                : ""
            }
          </div>
          <!-- American IPA, same monospaced treatment as the other tasks. -->
          <p class="font-mono text-base text-base-content/50">
            ${escapeHtml(entry.pair.transcription ?? "")}
          </p>
          <!-- Grey and small: the English pair is the thing being learned, the
               Russian is only there to confirm it. 60% is as faint as this can
               go and still clear 4.5:1 against the card. -->
          <p class="text-base-content/60">
            <span class="spoiler text-sm">${escapeHtml(entry.pair.translation)}</span>
          </p>
          ${
            // Optional usage note, same treatment as `comment` on the
            // instructions task. Inserted as HTML on purpose: the notes are
            // our own copy and use <strong>/<i> for the English words.
            entry.pair.note
              ? `<p class="mx-auto max-w-sm pt-2 text-sm text-base-content/70">${entry.pair.note}</p>`
              : ""
          }
        </div>

        ${
          isLast
            ? ""
            : `<button type="button" class="next btn btn-success gap-1" disabled>Next ${arrowIcon}</button>`
        }
      </div>
    </div>
  `;
}

function Explanation() {
  // Progress markers, not controls: the questions are worked through in order
  // with Next, so these only report state. Red ring until answered, green after.
  const marks = DECK.map(
    (_, i) =>
      `<span
        class="task-mark flex h-9 w-9 items-center justify-center rounded-full border-2 border-error font-medium"
        data-mark="${i}"
        role="listitem"
        aria-label="Вопрос ${i + 1}: без ответа"
      >${i + 1}</span>`,
  ).join("");

  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Какая разница? 🟩</h1>
      <p>
        Выбери пару прилагательных, которые описывают эти 2 зелёные сущности
      </p>
      <div role="list" class="flex flex-wrap justify-center gap-2">${marks}</div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/adjectives/#task1" })}
    <main>
      ${Explanation()}
      <section class="bg-base-200 px-4 py-12">
        <div class="mx-auto w-full max-w-md">
          ${DECK.map(QuestionCard).join("")}
          <!-- Same single-cell trick as the reveal: it holds its space from the
               start, so finishing the run does not shift the page. -->
          <p id="finale" class="invisible pt-6 text-center text-lg font-semibold">
            Готово — все пары разобраны 🎉
          </p>
        </div>
      </section>
    </main>
  `;
}

// --- Fast / slow animation -------------------------------------------------

// The animation itself is in the shared board component. Only the question on
// screen runs it.
let stopBars = () => {};

function stopMotion() {
  stopBars();
  stopBars = () => {};
}

function startMotion(card) {
  stopMotion();
  stopBars = animateBars(card, DECK[Number(card.dataset.index)].pair);
}

// --- Board fade ------------------------------------------------------------

// One tile's fade, and the window over which the hundred tiles are staggered.
// A phase runs FADE_MS + STAGGER_MS, and a swap is two phases back to back:
// the old picture empties out completely, then the new one assembles.
const FADE_MS = 200;
const STAGGER_MS = 400;
const PHASE_MS = FADE_MS + STAGGER_MS;
// A touch of slack so a phase is visibly finished before the next one starts.
const GAP_MS = 60;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let swapTimer = null;

// Give each tile a delay drawn from a shuffled order, so the picture comes
// apart and together in no particular pattern rather than sweeping across.
function stagger(tiles, opacity) {
  const order = shuffle(tiles);
  order.forEach((tile, i) => {
    tile.style.transitionDelay = `${Math.round((i / order.length) * STAGGER_MS)}ms`;
    tile.style.opacity = String(opacity);
  });
}

// Put every tile at a starting opacity without animating the way there, and
// commit it. Both directions need this: a tile transitions from the
// last value the browser actually painted, so without a committed start the
// fade is skipped entirely — which is what happens to a freshly cloned board,
// since none of its styles have been through a layout pass yet.
function primeTo(tiles, opacity) {
  for (const tile of tiles) {
    tile.style.transition = "none";
    tile.style.transitionDelay = "0ms";
    tile.style.opacity = String(opacity);
  }
  void tiles[0]?.offsetWidth;
  for (const tile of tiles) tile.style.transition = "";
}

// Assemble a board out of nothing, one tile at a time.
function fadeIn(board) {
  const tiles = [...board.children];
  primeTo(tiles, 0);
  stagger(tiles, 1);
}

// Take a board apart the same way.
function fadeOut(board) {
  const tiles = [...board.children];
  primeTo(tiles, 1);
  stagger(tiles, 0);
}

// Drop every inline style the animation left behind, so the board simply shows.
function showAtOnce(board) {
  for (const tile of board.children) {
    tile.style.transition = "";
    tile.style.transitionDelay = "";
    tile.style.opacity = "";
  }
}

// --- On-demand audio playback (one clip at a time) -------------------------

let currentAudio = null;

function playSound(file) {
  const url = audioByFile[file];
  if (!url) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  // Creating the Audio here is what fetches the file; nothing loads before this.
  currentAudio = new Audio(url);
  currentAudio.play().catch(() => {});
}

// --- Behaviour -------------------------------------------------------------

// A settled question stays locked whatever the animation does.
function lockOptions(card, locked) {
  if (card.dataset.done === "true") return;
  for (const option of card.querySelectorAll(".option")) option.disabled = locked;
}

// Put one question on screen. Does not animate anything itself.
function revealCard(index) {
  const target = String(index);
  let shown = null;
  for (const card of document.querySelectorAll(".question")) {
    const isTarget = card.dataset.index === target;
    card.classList.toggle("hidden", !isTarget);
    if (isTarget) shown = card;
  }
  if (!shown) return null;

  // Only the question on screen animates; everything else is idle.
  stopMotion();
  startMotion(shown);
  return shown;
}

// The first board has nothing to replace, so it just assembles.
function openFirstQuestion() {
  const card = revealCard(0);
  if (!card) return;
  const board = card.querySelector(".adj-grid");

  if (reducedMotion()) {
    showAtOnce(board);
    lockOptions(card, false);
    return;
  }

  lockOptions(card, true);
  fadeIn(board);
  swapTimer = setTimeout(() => lockOptions(card, false), PHASE_MS + GAP_MS);
}

// Two phases, in order: the board on screen empties out, and only once it is
// gone does the next question appear and build itself up. Options stay locked
// across both, so nothing is answerable until the picture is complete.
function advanceTo(index, fromCard) {
  clearTimeout(swapTimer);

  // Spent either way, and guards against a second press mid-transition.
  const next = fromCard.querySelector(".next");
  if (next) next.disabled = true;

  if (reducedMotion()) {
    const card = revealCard(index);
    if (!card) return;
    showAtOnce(card.querySelector(".adj-grid"));
    lockOptions(card, false);
    card.scrollIntoView({ block: "nearest" });
    return;
  }

  fadeOut(fromCard.querySelector(".adj-grid"));

  swapTimer = setTimeout(() => {
    const card = revealCard(index);
    if (!card) return;
    lockOptions(card, true);
    fadeIn(card.querySelector(".adj-grid"));
    card.scrollIntoView({ block: "nearest" });
    swapTimer = setTimeout(() => lockOptions(card, false), PHASE_MS + GAP_MS);
  }, PHASE_MS + GAP_MS);
}

// Flip a question's progress marker from red to green.
function markAnswered(index) {
  const mark = document.querySelector(`.task-mark[data-mark="${index}"]`);
  if (!mark) return;
  mark.classList.remove("border-error");
  mark.classList.add("border-success");
  mark.setAttribute("aria-label", `Вопрос ${Number(index) + 1}: отвечен`);
}

// Every marker green means the run is done. Read from the markers rather than a
// counter, so it cannot drift out of step with what the user can see.
function allAnswered() {
  return document.querySelectorAll(".task-mark.border-success").length === DECK.length;
}

function grade(card, button) {
  const correct = button.dataset.id === card.dataset.answer;

  if (!correct) {
    // Wrong pick turns red and is spent; the others stay live for another go.
    button.classList.remove("btn-outline", "btn-secondary");
    button.classList.add("btn-error");
    button.disabled = true;
    return;
  }

  button.classList.remove("btn-outline", "btn-secondary");
  button.classList.add("btn-success");
  // Settled, so no further picks on this question — and lockOptions must not
  // hand them back when the next fade finishes.
  card.dataset.done = "true";
  card.querySelectorAll(".option").forEach((option) => {
    option.disabled = true;
  });
  card.querySelector(".reveal").classList.remove("invisible");
  markAnswered(card.dataset.index);

  const next = card.querySelector(".next");
  if (next) next.disabled = false;

  if (allAnswered()) {
    document.querySelector("#finale").classList.remove("invisible");
  }
}

function setup() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const card = event.target.closest(".question");
    if (!card) return;

    // Reveal a blurred translation on click (Telegram style), same as the other
    // tasks. Unreachable until the answer is in, since the panel holding it is
    // only laid out, not visible.
    const spoiler = event.target.closest(".spoiler");
    if (spoiler) {
      spoiler.classList.toggle("revealed");
      return;
    }

    const play = event.target.closest(".play");
    if (play) {
      // Only once the answer is in. The panel's visibility already blocks a
      // real click, but a scripted one would get through.
      const revealed = !play.closest(".reveal").classList.contains("invisible");
      if (revealed) playSound(play.dataset.audio);
      return;
    }

    const option = event.target.closest(".option");
    if (option && !option.disabled) {
      grade(card, option);
      return;
    }

    const next = event.target.closest(".next");
    if (next && !next.disabled) {
      advanceTo(Number(card.dataset.index) + 1, card);
    }
  });

  openFirstQuestion();
}

document.querySelector("#app").innerHTML = App();
setup();
