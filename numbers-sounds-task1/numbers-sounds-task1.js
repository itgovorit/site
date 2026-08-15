import "../src/style.css";
import { Header } from "../src/components/header.js";

import pairs from "../src/data/numbers-sounds/minimal-pairs.json";

// Scandinavian-myth themed assets.
import bgUrl from "../src/img/numbers-sounds/background.jpg";
import purpleUrl from "../src/img/numbers-sounds/purple.png";
import yellowUrl from "../src/img/numbers-sounds/yellow.png";
import greenUrl from "../src/img/numbers-sounds/green-sm.png";
import rubyUrl from "../src/img/numbers-sounds/ruby-sm.png";

// This task drills the /v/ vs /w/ contrast.
const group = pairs.find((g) => g.group === "V vs W");

// Runestone image for each answer option.
const answerImages = [purpleUrl, yellowUrl];

// Resolve word audio URLs (only URL strings imported here; the .mp3 bytes are
// fetched on demand when the user presses Play).
const audioModules = import.meta.glob("../src/audio/numbers-sounds-pairs/*.mp3", {
  eager: true,
  import: "default",
});
const audioByWord = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [
    path.split("/").pop().replace(".mp3", "").toLowerCase(),
    url,
  ]),
);

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z" />
    <path d="M18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

// Filled "next" (fast-forward) icon, matching the speaker's style.
const nextIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
    <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v6.62c0 1.44 1.555 2.343 2.805 1.63L10.5 13.69V15.31c0 1.44 1.555 2.343 2.805 1.63l5.74-3.31c1.25-.722 1.25-2.538 0-3.26L13.305 7.06C12.055 6.347 10.5 7.25 10.5 8.69v1.62L5.055 7.06Z" />
  </svg>
`;

// Filled "restart" (refresh) icon, matching the same style.
const restartIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
    <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9A9 9 0 0 0 20.694 14.33a.75.75 0 0 0-.531-.918Z" clip-rule="evenodd" />
  </svg>
`;

const nextInner = `${nextIcon} Next`;
const restartInner = `${restartIcon} Restart`;

function Explanation() {
  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">${group.group} 🎧</h1>
      <p>
        Нажми <strong>Play</strong>, послушай слово и выбери звук который слышишь в начале слова. Всего 8 слов.
      </p>
    </section>
  `;
}

function Task() {
  // Answer runes: an image with the sound carved on top.
  const answers = group.contrast
    .map(
      (sound, i) => `
        <button
          type="button"
          class="answer group relative cursor-pointer transition duration-200 enabled:hover:scale-105 enabled:active:scale-90 disabled:cursor-default disabled:opacity-40 disabled:grayscale"
          data-sound="${sound}"
        >
          <img src="${answerImages[i % answerImages.length]}" alt="" class="h-36 w-36 object-contain drop-shadow-xl sm:h-44 sm:w-44" />
          <span class="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/70 [text-shadow:_0_0_10px_rgb(255_255_255_/_0.9),_0_0_22px_rgb(255_255_255_/_0.6)] [-webkit-text-stroke:2px_rgb(0_0_0_/_0.55)] [paint-order:stroke_fill]">${sound.replace(/\//g, "")}</span>
        </button>
      `,
    )
    .join("");

  const dots = group.words
    .map(
      () => `<img src="${rubyUrl}" alt="" class="dot h-6 w-6 object-contain drop-shadow" />`,
    )
    .join("");

  return `
    <section
      class="bg-cover bg-center"
      style="background-image: url(${bgUrl});"
    >
      <div class="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 py-16">
        <div id="dots" class="flex flex-wrap items-center justify-center gap-2 rounded-full bg-base-100/40 px-4 py-2 backdrop-blur-sm">${dots}</div>

        <button type="button" id="play" class="btn btn-lg gap-2 border-0 bg-base-100/80 backdrop-blur-sm hover:bg-base-100" aria-label="Прослушать слово">
          ${speakerIcon} Play
        </button>

        <div class="flex items-center justify-center gap-8">
          ${answers}
        </div>

        <div class="flex min-h-14 items-center justify-center">
          <p id="feedback" class="rounded-box bg-base-100/80 px-4 py-1 text-center font-medium backdrop-blur-sm empty:hidden" aria-live="polite"></p>
        </div>

        <button type="button" id="next" class="btn btn-lg invisible gap-2 border-0 bg-base-100/80 backdrop-blur-sm hover:bg-base-100">
          ${nextIcon} Next
        </button>
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/numbers-sounds/#task1" })}
    <main>
      ${Explanation()}
      ${Task()}
    </main>
  `;
}

// --- State ---
let current = null; // current word object
let answered = false;
let currentAudio = null;
const solved = new Set(); // indices of words answered correctly

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.setAttribute("src", i < solved.size ? greenUrl : rubyUrl);
  });
}

function remainingIndices() {
  return group.words.map((_, i) => i).filter((i) => !solved.has(i));
}

function resetAnswerStyles() {
  document.querySelectorAll(".answer").forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove("scale-110", "opacity-50", "grayscale");
  });
}

function pickNext() {
  const remaining = remainingIndices();
  const feedback = document.querySelector("#feedback");

  if (remaining.length === 0) {
    current = null;
    feedback.innerHTML = '<span class="font-bold text-success">🎉 Все слова угаданы верно!</span>';
    document.querySelector("#play").classList.add("btn-disabled");
    document.querySelectorAll(".answer").forEach((b) => (b.disabled = true));
    // Offer a restart in the same button slot.
    const btn = document.querySelector("#next");
    btn.innerHTML = restartInner;
    btn.dataset.mode = "restart";
    btn.classList.remove("invisible");
    return;
  }

  const index = remaining[Math.floor(Math.random() * remaining.length)];
  current = { index, ...group.words[index] };
  answered = false;

  feedback.textContent = "";
  document.querySelector("#next").classList.add("invisible");
  resetAnswerStyles(); // answers stay disabled until the word is played
}

// Enable the answer runes once the current word has been played.
function enableAnswers() {
  document.querySelectorAll(".answer").forEach((btn) => {
    btn.disabled = false;
  });
}

// --- Audio (loaded on demand, one at a time) ---
function setPlayLoading(button, loading) {
  if (loading) {
    if (button.dataset.originalHtml === undefined) {
      button.dataset.originalHtml = button.innerHTML;
    }
    button.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Загрузка';
    button.classList.add("pointer-events-none");
  } else if (button.dataset.originalHtml !== undefined) {
    button.innerHTML = button.dataset.originalHtml;
    delete button.dataset.originalHtml;
    button.classList.remove("pointer-events-none");
  }
}

function play() {
  if (!current) return;
  const url = audioByWord[current.word.toLowerCase()];
  if (!url) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const button = document.querySelector("#play");
  setPlayLoading(button, true);
  const audio = new Audio(url);
  currentAudio = audio;

  audio.addEventListener(
    "playing",
    () => {
      setPlayLoading(button, false);
      if (!answered) enableAnswers();
    },
    { once: true },
  );
  audio.addEventListener("ended", () => {
    if (currentAudio === audio) currentAudio = null;
  });
  audio.addEventListener("error", () => setPlayLoading(button, false), { once: true });
  audio.play().catch(() => setPlayLoading(button, false));
}

// --- Answering ---
function answer(button) {
  if (answered || !current) return;
  answered = true;

  const feedback = document.querySelector("#feedback");
  const correct = button.dataset.sound === current.sound;

  document.querySelectorAll(".answer").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.sound === current.sound) btn.classList.add("scale-110");
    else btn.classList.add("opacity-50", "grayscale");
  });

  if (correct) {
    solved.add(current.index);
    updateDots();
    feedback.innerHTML = `<span class="font-bold text-success">✅ Correct!</span> «${current.word}» ${current.sound}`;
  } else {
    feedback.innerHTML = `<span class="font-bold text-error">❌ Wrong!</span> «${current.word}» — звук ${current.sound}. Вернём позже.`;
  }

  // Let the user read and relisten; advance only on Next.
  const btn = document.querySelector("#next");
  btn.innerHTML = nextInner;
  btn.dataset.mode = "next";
  btn.classList.remove("invisible");
}

// Restart the whole game.
function restart() {
  solved.clear();
  updateDots();
  document.querySelector("#play").classList.remove("btn-disabled");
  document.querySelector("#next").dataset.mode = "next";
  pickNext();
}

function setup() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("click", (event) => {
    if (event.target.closest("#play")) {
      play();
      return;
    }
    const nextBtn = event.target.closest("#next");
    if (nextBtn) {
      if (nextBtn.dataset.mode === "restart") {
        restart();
      } else {
        pickNext();
        play(); // auto-play the new word (user can replay via Play)
      }
      return;
    }
    const answerBtn = event.target.closest(".answer");
    if (answerBtn && !answerBtn.disabled) answer(answerBtn);
  });

  updateDots();
  pickNext();
}

document.querySelector("#app").innerHTML = App();
setup();
