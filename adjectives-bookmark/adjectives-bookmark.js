import "../src/style.css";
import { Header } from "../src/components/header.js";

// The pairs come straight from task 1, so words and transcriptions live in one
// place and the cheat sheet cannot drift from the exercise.
import task1 from "../src/data/adjectives/task1.json";
import bookmark from "../src/data/adjectives/bookmark.json";
import { Board, animateBars } from "../src/components/adjective-board.js";

// Single-word clips (wide.mp3, width.mp3, …), keyed by file stem. Only URL
// strings are imported here; the bytes load when a button is pressed. A word
// without a clip simply gets no button, so missing files never show up broken.
const audioModules = import.meta.glob("../src/audio/adjectives/*.mp3", {
  eager: true,
  import: "default",
});
const audioByWord = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [
    path.split("/").pop().replace(".mp3", "").toLowerCase(),
    url,
  ]),
);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// "Big — Small" + "/bɪɡ/ — /smɔːl/" -> two words, each with its own IPA.
const split = (value) => String(value).split("—").map((s) => s.trim());

const PAIRS = task1.pairs.map((pair) => {
  const words = split(pair.title);
  const ipa = split(pair.transcription ?? "");
  return {
    id: pair.id,
    source: pair,
    translation: pair.translation,
    words: words.map((word, i) => ({ word, ipa: ipa[i] ?? "" })),
  };
});
const PAIR_BY_ID = Object.fromEntries(PAIRS.map((pair) => [pair.id, pair]));

// Only nouns whose pair exists. The data lists just the pairs that have a
// matching noun — dark/light has none, so it is left out of that table.
const NOUNS = bookmark.nouns.filter((entry) => PAIR_BY_ID[entry.pair]);

if (import.meta.env.DEV) {
  for (const entry of bookmark.nouns) {
    if (!PAIR_BY_ID[entry.pair]) {
      console.warn(`adjectives bookmark: noun "${entry.noun}" points at unknown pair "${entry.pair}"`);
    }
  }
}

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

// Same small ghost circle as the other bookmark pages. Rendered only when the
// clip exists.
function SoundButton(word) {
  const key = word.toLowerCase();
  if (!audioByWord[key]) return "";
  return `
    <button type="button" data-audio="${escapeHtml(key)}"
      class="btn btn-circle btn-xs btn-ghost shrink-0 border border-base-content/30 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
      aria-label="Прослушать ${escapeHtml(word)}">${speakerIcon}</button>
  `;
}

// One word: the word with its sound button, IPA underneath.
function Word({ word, ipa }) {
  return `
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-1.5">
        <span class="font-semibold">${escapeHtml(word)}</span>
        ${SoundButton(word)}
      </div>
      <span class="font-mono text-sm text-base-content/60">${escapeHtml(ipa)}</span>
    </div>
  `;
}

function PairsTable() {
  const rows = PAIRS.map(
    (pair) => `
      <tr data-pair="${escapeHtml(pair.id)}">
        <!-- Same picture as task 1. The fixed-width block gives the board the
             definite width it needs to size itself. -->
        <td class="w-24 pr-0"><div class="w-20 sm:w-24">${Board(pair.source, task1.grid)}</div></td>
        <td>${Word(pair.words[0])}</td>
        <td>${Word(pair.words[1])}</td>
        <td class="text-sm text-base-content/60">${escapeHtml(pair.translation)}</td>
      </tr>`,
  ).join("");

  return `
    <section class="space-y-3">
      <h2 class="text-2xl font-bold">Пары противоположностей ↔️</h2>
      <div class="overflow-x-auto rounded-box bg-base-100 shadow-sm">
        <table class="table">
          <thead>
            <tr><th><span class="sr-only">Картинка</span></th><th>Прилагательное</th><th>Противоположность</th><th>Перевод</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function NounsTable() {
  const rows = NOUNS.map((entry) => {
    const pair = PAIR_BY_ID[entry.pair];
    return `
      <tr>
        <td>
          ${Word({ word: entry.noun, ipa: entry.transcription })}
          <span class="text-sm text-base-content/60">${escapeHtml(entry.translation)}</span>
        </td>
        <td class="font-semibold">${pair.words.map((w) => escapeHtml(w.word.toLowerCase())).join(", ")}</td>
      </tr>`;
  }).join("");

  return `
    <section class="space-y-3">
      <h2 class="text-2xl font-bold">Существительное → прилагательные 📐</h2>
      <p class="text-base-content/70">
        То же самое можно сказать через существительное:
        <strong>Increase the width</strong> = <strong>make it wider</strong>.
      </p>
      <div class="overflow-x-auto rounded-box bg-base-100 shadow-sm">
        <table class="table">
          <thead>
            <tr><th>Существительное</th><th>Прилагательные</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/adjectives/#bookmark" })}
    <main class="bg-base-200">
      <div class="mx-auto max-w-3xl space-y-10 px-4 py-10">
        <header class="space-y-2">
          <h1 class="text-3xl font-bold">Шпаргалка: прилагательные 🔖</h1>
          <p class="text-base-content/70">
            Все пары из урока, транскрипция (американский вариант) и
            произношение. Жми 🔊, чтобы послушать.
          </p>
        </header>
        ${PairsTable()}
        ${NounsTable()}
      </div>
    </main>
  `;
}

// --- On-demand audio playback (one clip at a time) -------------------------

let currentAudio = null;

function playSound(key) {
  const url = audioByWord[key];
  if (!url) return;
  currentAudio?.pause();
  // Creating the Audio here is what fetches the file; nothing loads before this.
  currentAudio = new Audio(url);
  currentAudio.play().catch(() => {});
}

document.querySelector("#app").innerHTML = App();

// Fast/slow only makes sense moving, so its board runs the same animation as
// in task 1. The other boards are static.
for (const pair of PAIRS) {
  const row = document.querySelector(`tr[data-pair="${pair.id}"]`);
  if (row) animateBars(row, pair.source);
}

document.querySelector("#app").addEventListener("click", (event) => {
  const button = event.target.closest("[data-audio]");
  if (button) playSound(button.dataset.audio);
});
