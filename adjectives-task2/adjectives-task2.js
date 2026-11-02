import "../src/style.css";
import { Header } from "../src/components/header.js";

import data from "../src/data/adjectives/task2.json";

// The design review the complaints come from, behind the exercise.
import bgUrl from "../src/img/adjectives/task2/background.jpeg";

// A clip per sentence, named by the data. Only URL strings are imported here;
// the bytes load when the user presses play.
const audioModules = import.meta.glob("../src/audio/adjectives/task2/*.mp3", {
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

// Two independent shuffles. The sentences come up in a random order, so the run
// is different each visit; and within each one the options are shuffled too,
// because options[0] is the answer in the data and would otherwise always be
// sitting in the reel's window at the start. The answer is captured before that
// shuffle, since position stops meaning anything afterwards.
const DECK = shuffle(data.sentences).map((sentence) => ({
  ...sentence,
  answer: sentence.options[0],
  reel: shuffle(sentence.options),
}));

// The slot has to be wide enough for the longest word in the whole task, or it
// would resize as the reel turns. Measured from the data rather than guessed.
const SLOT_CH =
  Math.max(...DECK.flatMap((sentence) => sentence.options.map((o) => o.length))) + 2;

if (import.meta.env.DEV) {
  for (const sentence of DECK) {
    if (new Set(sentence.options).size !== sentence.options.length) {
      console.warn(`adjectives task2: "${sentence.id}" repeats an option`);
    }
  }
}

const chevron = (up) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="${up ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}" />
  </svg>
`;

const arrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
`;

// A hand about to tap: the affordance for the blurred translation.
const tapIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0" aria-hidden="true">
    <path d="M10 9.5V4a2 2 0 1 1 4 0v8" />
    <path d="M14 10a2 2 0 1 1 4 0v2" />
    <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
`;

// Points from the complaint down to the reply. Bigger and paler than the
// picker's own chevrons, so the two are not mistaken for each other.
const arrowDownIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7 text-base-content/40" aria-hidden="true">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
`;

// The reel: one word visible at a time, and whichever is in the window is the
// answer Check will grade. Arrows sit above and below so the sentence itself
// still reads straight across.
function Picker(sentence) {
  const slides = sentence.reel
    .map(
      (option) => `
        <li class="carousel-item flex h-full w-full items-center justify-center">
          ${escapeHtml(option)}
        </li>`,
    )
    .join("");

  return `
    <span class="picker inline-flex flex-col items-center gap-1 align-middle">
      <!-- Round, and the same size as the carousel arrows on the other tasks. -->
      <button type="button" class="nav btn btn-circle" data-dir="-1" aria-label="Предыдущий вариант">
        ${chevron(true)}
      </button>
      <ul
        class="reel carousel carousel-vertical h-11 rounded-box border-2 border-base-300 bg-base-100 text-center font-semibold"
        style="width: ${SLOT_CH}ch"
        aria-label="Выбери слово"
      >
        ${slides}
      </ul>
      <button type="button" class="nav btn btn-circle" data-dir="1" aria-label="Следующий вариант">
        ${chevron(false)}
      </button>
    </span>
  `;
}

// Sits in the sentence itself, just after the word slot. Laid out from the
// start and only unseen, so appearing costs no layout: its box already holds
// the width, which is what would otherwise nudge the slot sideways.
function PlayButton(sentence) {
  if (!audioByFile[sentence.audio]) return "";
  const phrase = `${sentence.before} ${sentence.answer}${sentence.after}`;
  // h-11 w-11 is the 44px tap target used across the site.
  return `
    <button
      type="button"
      class="play invisible btn btn-circle btn-ghost h-11 min-h-0 w-11 border border-base-content/30 p-0 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
      data-audio="${escapeHtml(sentence.audio)}"
      aria-label="Прослушать: ${escapeHtml(phrase)}"
    >${speakerIcon}</button>
  `;
}

function SentenceCard(sentence, index) {
  const isLast = index === DECK.length - 1;

  return `
    <div
      class="question card bg-base-100/85 shadow-md backdrop-blur-sm${index === 0 ? "" : " hidden"}"
      data-index="${index}"
      data-answer="${escapeHtml(sentence.answer)}"
    >
      <div class="card-body items-center gap-4 text-center">
        <!-- The complaint, then an arrow down, then the reply with the word
             still to be chosen: three centred lines, read top to bottom. -->
        <p class="text-xl">${escapeHtml(sentence.problem)}</p>

        ${arrowDownIcon}

        <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xl">
          <span>${escapeHtml(sentence.before)}</span>
          ${Picker(sentence)}
          ${sentence.after ? `<span>${escapeHtml(sentence.after)}</span>` : ""}
          ${PlayButton(sentence)}
        </div>

        <!-- Shown once the sentence is right: the translation, behind a
             spoiler. Laid out from the start and only unseen, so revealing it
             moves nothing. The icon and the "перевод" label are what say the
             blurred text can be tapped — on its own, blurred text reads as
             decoration rather than as a control. The whole thing is one button,
             so the label is part of the tap target and it works from the
             keyboard too. -->
        <div class="reveal invisible text-center">
          <button
            type="button"
            class="translation inline-flex max-w-full items-center gap-1.5 text-left align-middle text-base-content/60 hover:text-base-content"
          >
            ${tapIcon}
            <span class="shrink-0 text-xs font-medium uppercase tracking-wide">Перевод:</span>
            <span class="spoiler text-sm">${escapeHtml(sentence.translation ?? "")}</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button type="button" class="check btn btn-secondary">Check</button>
          ${
            // Rendered from the start but disabled, so the pair of buttons reads
            // as centred and Check does not sit off to one side.
            isLast
              ? ""
              : `<button type="button" class="next btn btn-success gap-1" disabled>Next ${arrowIcon}</button>`
          }
        </div>
      </div>
    </div>
  `;
}

function Explanation() {
  // Progress markers, not controls: the sentences are worked through in order
  // with Next, so these only report state. Red ring until answered, green after.
  const marks = DECK.map(
    (_, i) =>
      `<span
        class="task-mark flex h-9 w-9 items-center justify-center rounded-full border-2 border-error font-medium"
        data-mark="${i}"
        role="listitem"
        aria-label="Фраза ${i + 1}: без ответа"
      >${i + 1}</span>`,
  ).join("");

  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Критикуем Дизайн🛠️</h1>
      <p>
          Закончи фразу подходящим прилагательным
      </p>
      <div role="list" class="flex flex-wrap justify-center gap-2">${marks}</div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/adjectives/#task2" })}
    <main>
      ${Explanation()}
      <section class="bg-cover bg-center" style="background-image: url(${bgUrl});">
        <div class="mx-auto w-full max-w-xl px-4 py-12">
          ${DECK.map(SentenceCard).join("")}
          <!-- Holds its space from the start, so finishing shifts nothing. Gets
               its own panel because it sits straight on the photo. -->
          <p
            id="finale"
            class="invisible mt-6 rounded-box bg-base-100/85 px-4 py-2 text-center text-lg font-semibold backdrop-blur-sm"
          >
            Готово — все фразы собраны 🎉
          </p>
        </div>
      </section>
    </main>
  `;
}

// --- The reel --------------------------------------------------------------

// Which word is in the window. Tracked here rather than read back from
// scrollTop, so a half-finished scroll can never be mistaken for a choice.
function selected(card) {
  const sentence = DECK[Number(card.dataset.index)];
  return sentence.reel[Number(card.dataset.option ?? 0)];
}

function turn(card, delta) {
  const reel = card.querySelector(".reel");
  const slides = [...reel.children];
  const count = slides.length;

  const next = Number(card.dataset.option ?? 0) + delta;
  // Wraps round, so neither arrow is ever a dead end.
  const wrapped = next < 0 || next >= count;
  const index = ((next % count) + count) % count;
  card.dataset.option = String(index);

  // Slides are exactly one window tall, so offsetTop maps straight to scrollTop.
  const top = slides[index].offsetTop - slides[0].offsetTop;
  // "instant" rather than "auto": DaisyUI's .carousel sets scroll-behavior to
  // smooth, and a wrap would otherwise sweep past every word.
  reel.scrollTo({ top, behavior: wrapped ? "instant" : "smooth" });

  clearVerdict(card);
}

// A new word invalidates the last verdict.
function clearVerdict(card) {
  const reel = card.querySelector(".reel");
  reel.classList.remove("border-error", "border-success");
  reel.classList.add("border-base-300");
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

function showQuestion(index) {
  const target = String(index);
  let shown = null;
  for (const card of document.querySelectorAll(".question")) {
    const isTarget = card.dataset.index === target;
    card.classList.toggle("hidden", !isTarget);
    if (isTarget) shown = card;
  }
  return shown;
}

// Flip a sentence's progress marker from red to green.
function markAnswered(index) {
  const mark = document.querySelector(`.task-mark[data-mark="${index}"]`);
  if (!mark) return;
  mark.classList.remove("border-error");
  mark.classList.add("border-success");
  mark.setAttribute("aria-label", `Фраза ${Number(index) + 1}: отвечена`);
}

// Every marker green means the run is done. Read from the markers rather than a
// counter, so it cannot drift out of step with what the user can see.
function allAnswered() {
  return document.querySelectorAll(".task-mark.border-success").length === DECK.length;
}

function check(card) {
  const reel = card.querySelector(".reel");
  const correct = selected(card) === card.dataset.answer;

  reel.classList.remove("border-base-300", "border-error", "border-success");

  if (!correct) {
    // Marked wrong, but the reel stays live for another go.
    reel.classList.add("border-error");
    return;
  }

  reel.classList.add("border-success");
  card.dataset.done = "true";
  card.querySelector(".reveal").classList.remove("invisible");
  card.querySelector(".play")?.classList.remove("invisible");

  // Settled: the word is locked in and Check is spent.
  card.querySelector(".check").disabled = true;
  for (const nav of card.querySelectorAll(".nav")) nav.disabled = true;
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

    // Reveal the blurred translation (Telegram style, as on the other tasks).
    // The listener is on the whole button rather than the blurred span, so the
    // icon and label are live too. Unreachable until the sentence is right,
    // since the panel holding it is only laid out, not visible.
    const translation = event.target.closest(".translation");
    if (translation) {
      translation.querySelector(".spoiler").classList.toggle("revealed");
      return;
    }

    const play = event.target.closest(".play");
    if (play) {
      // Only once the sentence is right. The button's own visibility already
      // blocks a real click, but a scripted one would get through.
      if (card.dataset.done === "true") playSound(play.dataset.audio);
      return;
    }

    const nav = event.target.closest(".nav");
    if (nav && !nav.disabled) {
      turn(card, Number(nav.dataset.dir));
      return;
    }

    const checkButton = event.target.closest(".check");
    if (checkButton && !checkButton.disabled) {
      check(card);
      return;
    }

    const next = event.target.closest(".next");
    if (next && !next.disabled) {
      const shown = showQuestion(Number(card.dataset.index) + 1);
      shown?.scrollIntoView({ block: "nearest" });
    }
  });

  // Keep the tracked word honest when the reel is scrolled by hand.
  for (const card of document.querySelectorAll(".question")) {
    const reel = card.querySelector(".reel");
    let timer = null;
    reel.addEventListener("scroll", () => {
      if (card.dataset.done === "true") return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const step = reel.clientHeight || 1;
        const nearest = Math.round(reel.scrollTop / step);
        const last = reel.children.length - 1;
        const index = Math.min(Math.max(nearest, 0), last);
        if (String(index) !== card.dataset.option) {
          card.dataset.option = String(index);
          clearVerdict(card);
        }
      }, 120);
    });
    card.dataset.option = "0";
  }
}

document.querySelector("#app").innerHTML = App();
setup();
