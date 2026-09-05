import "../src/style.css";
import { Header } from "../src/components/header.js";

// Abbreviations (only some letters have one).
import abbrItems from "../src/data/abc/abbr.json";

// Audio: letters + spelled-out abbreviations live in abc-task1, NATO phonetic
// words live in abc-phonetic. Merge both into one lookup — keys never collide.
// Only URL strings are imported here; .mp3 bytes load on demand when clicked.
const taskAudioModules = import.meta.glob("../src/audio/abc-task1/*.mp3", {
  eager: true,
  import: "default",
});
const natoAudioModules = import.meta.glob("../src/audio/abc-phonetic/*.mp3", {
  eager: true,
  import: "default",
});
function toAudioMap(modules) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, url]) => [
      path.split("/").pop().replace(".mp3", "").toLowerCase(),
      url,
    ]),
  );
}
const audioByKey = { ...toAudioMap(taskAudioModules), ...toAudioMap(natoAudioModules) };

// NATO phonetic word for each letter (audio files: alpha.mp3 … zulu.mp3).
const NATO = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
};

const abbrByLetter = Object.fromEntries(
  abbrItems.map((item) => [item.letter, item.abbreviation]),
);

// Difficulty groups (same split as the /abc lesson). Determines the circle color.
const GROUP_BY_LETTER = {};
"FKLMNOQSTZ".split("").forEach((l) => (GROUP_BY_LETTER[l] = "green"));
"BDHPRVWX".split("").forEach((l) => (GROUP_BY_LETTER[l] = "yellow"));
"AIEGJUYC".split("").forEach((l) => (GROUP_BY_LETTER[l] = "red"));

const badgeColorByGroup = {
  green: "badge-success",
  yellow: "badge-warning",
  red: "badge-error",
};

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

// A round speaker control; rendered only when the audio file exists.
function SoundButton(key, label) {
  if (!audioByKey[key]) return "";
  return `
    <button type="button" data-audio="${key}"
      class="btn btn-circle btn-xs btn-ghost border border-base-content/30 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
      aria-label="${label}">${speakerIcon}</button>
  `;
}

// One alphabet cell: a colored letter circle + NATO word + abbreviation.
function Cell(letter) {
  const key = letter.toLowerCase();
  const nato = NATO[letter];
  const natoKey = nato.toLowerCase().replace(/[^a-z]/g, "");
  const abbr = abbrByLetter[letter];
  const abbrKey = abbr ? abbr.toLowerCase() : "";
  const badge = badgeColorByGroup[GROUP_BY_LETTER[letter]] ?? "badge-neutral";

  // The colored circle itself plays the letter sound (as in Task #1).
  const circleClass = `badge ${badge} flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold`;
  const letterCircle = audioByKey[key]
    ? `<button type="button" data-audio="${key}" class="${circleClass}" aria-label="Прослушать букву ${letter}">${letter}</button>`
    : `<span class="${circleClass}">${letter}</span>`;

  const abbrRow = abbr
    ? `
      <div class="flex items-center justify-center gap-1">
        <span class="font-mono text-sm font-semibold">${abbr}</span>
        ${SoundButton(abbrKey, `Прослушать аббревиатуру ${abbr}`)}
      </div>`
    : "";

  return `
    <div class="w-[calc(50%-0.375rem)] rounded-box bg-base-100 shadow sm:w-44">
      <div class="flex flex-col items-center justify-center gap-2 p-4">
        ${letterCircle}
        <div class="flex items-center gap-1">
          <span class="text-sm text-base-content/80">${nato}</span>
          ${SoundButton(natoKey, `Прослушать ${nato}`)}
        </div>
        ${abbrRow}
      </div>
    </div>
  `;
}

function Grid() {
  const letters = Object.keys(NATO);
  return `
    <section class="mx-auto max-w-4xl px-4 py-8">
      <h1 class="mb-2 text-center text-2xl font-bold">Alha-вит</h1>

      <div class="flex flex-wrap justify-center gap-3">
        ${letters.map(Cell).join("")}
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/abc/" })}
    <main>
      ${Grid()}
    </main>
  `;
}

// --- On-demand audio playback (one clip at a time) ---
let currentAudio = null;

function setButtonLoading(button, loading) {
  if (loading) {
    if (button.dataset.originalHtml === undefined) {
      button.dataset.originalHtml = button.innerHTML;
    }
    button.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
    button.classList.add("pointer-events-none");
    button.setAttribute("aria-busy", "true");
  } else {
    if (button.dataset.originalHtml !== undefined) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.classList.remove("pointer-events-none");
    button.removeAttribute("aria-busy");
  }
}

function playSound(button) {
  const url = audioByKey[button.dataset.audio];
  if (!url) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  setButtonLoading(button, true);
  const audio = new Audio(url);
  currentAudio = audio;

  const clearLoading = () => setButtonLoading(button, false);
  audio.addEventListener("playing", clearLoading, { once: true });
  audio.addEventListener("ended", () => {
    if (currentAudio === audio) currentAudio = null;
  });
  audio.addEventListener(
    "error",
    () => {
      clearLoading();
      if (currentAudio === audio) currentAudio = null;
    },
    { once: true },
  );

  audio.play().catch(() => clearLoading());
}

document.querySelector("#app").innerHTML = App();

document.querySelector("#app").addEventListener("click", (event) => {
  const button = event.target.closest("[data-audio]");
  if (button) playSound(button);
});
