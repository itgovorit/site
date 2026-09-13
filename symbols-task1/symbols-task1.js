import "../src/style.css";
import { Header } from "../src/components/header.js";

// Full symbol list, split into difficulty levels.
import symbols from "../src/data/symbols/symbol-list.json";

// Per-level background images.
import easyBg from "../src/img/symbols/easy.jpg";
import mediumBg from "../src/img/symbols/medium.jpg";
import hardBg from "../src/img/symbols/hard.jpg";

// Each level shows its own symbols, plus one "decoy" word borrowed from another
// group. The decoy's symbol never appears in the symbol reel, so it can never be
// a correct match — it just keeps one extra option around until the end.
const GROUPS = [symbols.slice(0, 7), symbols.slice(7, 17), symbols.slice(17)];
const LEVELS = [
  { name: "Easy", emoji: "🟢", items: GROUPS[0], bg: easyBg, decoy: GROUPS[1][0] },
  { name: "Medium", emoji: "🟡", items: GROUPS[1], bg: mediumBg, decoy: GROUPS[2][0] },
  { name: "Hard", emoji: "🔴", items: GROUPS[2], bg: hardBg, decoy: GROUPS[0][0] },
];

// Shared sizing so the three reels fit even on small screens.
const REEL_BOX = "h-28 w-24 sm:h-32 sm:w-40";
const REEL_ITEM = "h-28 sm:h-32";

// Symbol pronunciation clips (lowercase, spaces replaced with dashes). Only URL
// strings are imported here; the .mp3 bytes load on demand when Play is pressed.
const audioModules = import.meta.glob("../src/audio/symbols/*.mp3", {
  eager: true,
  import: "default",
});
const audioByName = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [
    path.split("/").pop().replace(".mp3", ""),
    url,
  ]),
);

function soundKey(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Escape values used in HTML text and attributes (symbols include < > & ").
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z" />
    <path d="M18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

const crossIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="h-8 w-8 text-error" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
`;

function Explanation() {
  const tabs = LEVELS.map(
    (lvl, i) =>
      `<button type="button" class="level-tab tab ${i === 0 ? "tab-active" : ""}" data-target="${i}">${lvl.emoji} ${lvl.name}</button>`,
  ).join("");

  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Найди пару 🎰</h1>
      <p>
<p>
  Сопоставь символ и его название. Крути центральный барабан стрелками и проверяй, нажав <strong>Check</strong>. Угадал — послушай и жми <strong>Next</strong>.
  И <strong>X</strong> там только для контекста, чтоб не запутаться, где минус, а где нижнее подчеркивание, например: <strong>X-X</strong> и <strong>X_X</strong>
</p>
      <div role="tablist" class="tabs tabs-boxed justify-center">${tabs}</div>
    </section>
  `;
}

// The left reel is display-only (auto-advances); the right reel is controllable.
function VerticalCarousel(items, { controllable }) {
  const cls = controllable
    ? "word-reel"
    : "symbol-reel overflow-hidden pointer-events-none";

  return `
    <div class="flex flex-col items-center gap-2">
      ${
        controllable
          ? `<button type="button" class="nav btn h-11 min-h-0 w-24 rounded-full text-lg sm:w-40" data-dir="-1" aria-label="Вверх">▲</button>`
          : `<div class="h-11"></div>`
      }
      <div class="reel ${cls} carousel carousel-vertical ${REEL_BOX} rounded-box bg-white/70 ring-4 ring-base-300 backdrop-blur-sm transition">
        ${items}
      </div>
      ${
        controllable
          ? `<button type="button" class="nav btn h-11 min-h-0 w-24 rounded-full text-lg sm:w-40" data-dir="1" aria-label="Вниз">▼</button>`
          : `<div class="h-11"></div>`
      }
    </div>
  `;
}

function LevelPanel(level, levelIndex) {
  const symbolItems = level.items
    .map(
      (entry) => `
        <div class="carousel-item flex ${REEL_ITEM} w-full items-center justify-center text-3xl font-bold sm:text-4xl"
             data-value="${escapeHtml(entry.symbol)}">${escapeHtml(entry.symbol)}</div>
      `,
    )
    .join("");

  const wordItems = shuffle([...level.items, level.decoy])
    .map(
      (entry) => `
        <div class="carousel-item box-border flex ${REEL_ITEM} w-full items-center justify-center px-2 text-center text-sm font-medium sm:text-base"
             data-owner="${escapeHtml(entry.symbol)}">${escapeHtml(entry.names[0])}</div>
      `,
    )
    .join("");

  const dots = level.items
    .map(
      (_, i) =>
        `<span class="dot h-3 w-3 rounded-full bg-error transition" data-dot="${i}"></span>`,
    )
    .join("");

  return `
    <section
      class="level bg-cover bg-center ${levelIndex === 0 ? "" : "hidden"}"
      data-level="${levelIndex}"
      data-index="0"
      style="background-image: linear-gradient(rgb(0 0 0 / 0.45), rgb(0 0 0 / 0.45)), url(${level.bg});"
    >
      <div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-12">
        <div class="dots flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 backdrop-blur-sm">${dots}</div>

        <div class="flex items-start justify-center gap-3 sm:gap-6">
          ${VerticalCarousel(symbolItems, { controllable: false })}
          ${VerticalCarousel(wordItems, { controllable: true })}
          <div class="flex flex-col items-center gap-2">
            <div class="h-11"></div>
            <div class="result reel carousel carousel-vertical ${REEL_BOX} overflow-hidden rounded-box bg-white/70 ring-4 ring-base-300 backdrop-blur-sm">
              <div class="carousel-item flex ${REEL_ITEM} w-full items-center justify-center"><span class="text-4xl">🤔</span></div>
              <div class="carousel-item flex ${REEL_ITEM} w-full items-center justify-center">${crossIcon}</div>
              <div class="carousel-item flex ${REEL_ITEM} w-full items-center justify-center">
                <button type="button" class="play-sound btn btn-circle btn-secondary" data-key="" aria-label="Прослушать">${speakerIcon}</button>
              </div>
            </div>
            <div class="h-11"></div>
          </div>
        </div>

        <button type="button" class="action btn btn-lg border-0 bg-base-100/80 backdrop-blur-sm hover:bg-base-100" data-mode="check">Check</button>
        ${
          // Revealed in place of Check once the level is done. The hardest level
          // has nothing to move on to, so it gets no button.
          levelIndex < LEVELS.length - 1
            ? `<button type="button" class="next-level btn btn-lg btn-success hidden" data-target="${levelIndex + 1}">Next Level</button>`
            : ""
        }
        <span class="feedback font-medium" aria-live="polite"></span>
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/symbols/#task1" })}
    <main>
      ${Explanation()}
      ${LEVELS.map(LevelPanel).join("")}
    </main>
  `;
}

// The carousel item nearest to a reel's vertical center.
function centeredItem(reel) {
  const reelRect = reel.getBoundingClientRect();
  const center = reelRect.top + reelRect.height / 2;
  let best = null;
  let min = Infinity;
  for (const item of reel.children) {
    const rect = item.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - center);
    if (distance < min) {
      min = distance;
      best = item;
    }
  }
  return best;
}

function setReels(levelEl, matched) {
  for (const reel of levelEl.querySelectorAll(".reel, .result")) {
    reel.classList.toggle("ring-success", matched === true);
    reel.classList.toggle("ring-error", matched === false);
    reel.classList.toggle("ring-base-300", matched === null);
  }
}

// Result drum positions: 0 = thinking, 1 = wrong (cross), 2 = correct (play).
function rollResult(levelEl, index) {
  const reel = levelEl.querySelector(".result");
  reel.scrollTo({ top: index * reel.clientHeight, behavior: "smooth" });
}

function check(levelEl) {
  const symbolReel = levelEl.querySelector(".symbol-reel");
  const wordReel = levelEl.querySelector(".word-reel");
  const total = symbolReel.children.length;
  const index = Number(levelEl.dataset.index);
  if (index >= total) return;

  const targetSymbol = symbolReel.children[index]?.dataset.value;
  const wordItem = centeredItem(wordReel);
  const matched = !!wordItem && wordItem.dataset.owner === targetSymbol;

  if (!matched) {
    setReels(levelEl, false);
    rollResult(levelEl, 1);
    return;
  }

  setReels(levelEl, true);

  // Remember the matched word so it can be dropped from the options on Next.
  levelEl._matchedWord = wordItem;

  const key = soundKey(wordItem.textContent.trim());
  const playBtn = levelEl.querySelector(".result .play-sound");
  playBtn.dataset.key = key;
  playBtn.disabled = !audioByName[key];
  rollResult(levelEl, 2);

  const dot = levelEl.querySelector(`.dot[data-dot="${index}"]`);
  if (dot) {
    dot.classList.remove("bg-error");
    dot.classList.add("bg-success");
  }

  // Lock the arrows until the user moves on to the next symbol.
  levelEl
    .querySelectorAll(".nav")
    .forEach((btn) => (btn.disabled = true));

  const action = levelEl.querySelector(".action");
  action.textContent = "Next";
  action.dataset.mode = "next";
}

// Advance to the next symbol after a correct answer.
function next(levelEl) {
  const symbolReel = levelEl.querySelector(".symbol-reel");
  const feedback = levelEl.querySelector(".feedback");
  const action = levelEl.querySelector(".action");
  const total = symbolReel.children.length;

  // Drop the just-matched word so the remaining choices shrink each round.
  if (levelEl._matchedWord) {
    levelEl._matchedWord.remove();
    levelEl._matchedWord = null;
    const wordReel = levelEl.querySelector(".word-reel");
    wordReel.scrollTo({ top: 0, behavior: "auto" });
  }

  const index = Number(levelEl.dataset.index) + 1;
  levelEl.dataset.index = String(index);

  // Arrows become usable again for the next symbol.
  levelEl
    .querySelectorAll(".nav")
    .forEach((btn) => (btn.disabled = false));

  rollResult(levelEl, 0);
  setReels(levelEl, null);

  if (index >= total) {
    feedback.textContent = "🎉 Уровень пройден!";
    feedback.classList.add("text-success");
    action.disabled = true;

    // Swap Check out for "Next Level" rather than leaving a dead button next to
    // it. On the last level there is none, so the disabled Check stays put.
    const nextLevelBtn = levelEl.querySelector(".next-level");
    if (nextLevelBtn) {
      action.classList.add("hidden");
      nextLevelBtn.classList.remove("hidden");
    }
    return;
  }

  symbolReel.scrollTo({
    top: index * symbolReel.clientHeight,
    behavior: "smooth",
  });
  action.textContent = "Check";
  action.dataset.mode = "check";
}

function clearResult(levelEl) {
  if (Number(levelEl.dataset.index) >= levelEl.querySelectorAll(".symbol-reel > *").length) {
    return;
  }
  const action = levelEl.querySelector(".action");
  if (action && action.dataset.mode === "next") return;
  setReels(levelEl, null);
  rollResult(levelEl, 0);
}

// Play a symbol's pronunciation clip (one at a time).
let currentAudio = null;
function playSymbol(key) {
  const url = audioByName[key];
  if (!url) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  currentAudio = new Audio(url);
  currentAudio.play().catch(() => {});
}

// Reveal one level and mark its tab. Used by the tabs and by "Next Level".
function showLevel(target) {
  const index = String(target);
  document
    .querySelectorAll(".level-tab")
    .forEach((t) => t.classList.toggle("tab-active", t.dataset.target === index));
  document
    .querySelectorAll(".level")
    .forEach((l) => l.classList.toggle("hidden", l.dataset.level !== index));
}

function setup() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("click", (event) => {
    // Level selector: show only the chosen level.
    const tab = event.target.closest(".level-tab");
    if (tab) {
      showLevel(tab.dataset.target);
      return;
    }

    const levelEl = event.target.closest(".level");
    if (!levelEl) return;

    // Shown once a level is finished; moves on the same way the tabs do.
    const nextLevelBtn = event.target.closest(".next-level");
    if (nextLevelBtn) {
      showLevel(nextLevelBtn.dataset.target);
      return;
    }

    const action = event.target.closest(".action");
    if (action) {
      if (action.dataset.mode === "next") next(levelEl);
      else check(levelEl);
      return;
    }

    const playBtn = event.target.closest(".play-sound");
    if (playBtn) {
      playSymbol(playBtn.dataset.key);
      return;
    }

    // Arrow navigation (word reel only): scroll one item up/down (cyclic).
    const button = event.target.closest(".nav");
    if (!button) return;
    const reel = levelEl.querySelector(".word-reel");
    if (!reel) return;

    const items = [...reel.children];
    const current = centeredItem(reel);
    const dir = Number(button.dataset.dir);
    const idx = (items.indexOf(current) + dir + items.length) % items.length;
    reel.scrollTo({ top: idx * reel.clientHeight, behavior: "smooth" });
  });

  // Moving a word reel invalidates the previous (incorrect) result for its level.
  for (const reel of document.querySelectorAll(".word-reel")) {
    reel.addEventListener("scroll", () => clearResult(reel.closest(".level")));
  }
}

document.querySelector("#app").innerHTML = App();
setup();
