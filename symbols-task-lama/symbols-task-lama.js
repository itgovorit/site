import "../src/style.css";
import { Header } from "../src/components/header.js";

// { preposition, pattern } entries describing where the "$" (target) sits
// relative to the lamas. "default" is a non-question entry and is skipped.
import lamaData from "../src/data/symbols/taskLama.json";

// Lama pictures. Only URL strings are imported; Vite fingerprints them.
const imgModules = import.meta.glob("../src/img/symbols/lama/*.png", {
  eager: true,
  import: "default",
});
const lamaImg = Object.fromEntries(
  Object.entries(imgModules).map(([path, url]) => [
    path.split("/").pop().replace(".png", ""),
    url,
  ]),
);

// Seconds allowed to answer each question.
const TIME_LIMIT = 5;

// Pairs that are too easy to confuse — never offer them as the two options
// together (keys reference entries in taskLama.json).
const CONFLICTS = {
  before: ["start"],
  start: ["before"],
  after: ["end"],
  end: ["after"],
};

// Questions to ask (everything except the "default" entry).
const ENTRIES = Object.entries(lamaData)
  .filter(([key, value]) => key !== "default" && value && value.pattern)
  .map(([key, value]) => ({
    key,
    preposition: value.preposition,
    pattern: value.pattern,
  }));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const arrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
    <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
  </svg>
`;

const restartIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
    <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd" />
  </svg>
`;

// One cell of the visual pattern: the "$" target or a lama picture.
function PatternTile(token) {
  if (token === "target") {
    return `
      <div class="flex h-16 w-16 items-center justify-center rounded-box bg-warning/20 text-3xl font-bold sm:h-24 sm:w-24 sm:text-5xl">$</div>
    `;
  }
  const url = lamaImg[token];
  return `
    <div class="flex h-16 items-center justify-center sm:h-24">
      <img src="${url}" alt="${escapeHtml(token)}" class="h-full w-auto object-contain" />
    </div>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/symbols/#taskLama" })}
    <main>
      <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
        <h1 class="text-3xl font-bold">Где $? 🦙</h1>
        <p>
          Определи позицию <strong>$</strong> относительно Ламы.
          Выбери правильный предлог. На каждый вопрос — ${TIME_LIMIT} секунд!
        </p>
      </section>
      <section class="bg-base-200">
        <div
          id="stage"
          class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-8 px-4 py-12 text-center"
        ></div>
      </section>
    </main>
  `;
}

// --- Game state ---
let order = [];
let current = 0;
let score = 0;
let answered = false;
let timerId = null;

function startGame() {
  order = shuffle(ENTRIES.map((_, i) => i));
  current = 0;
  score = 0;
  renderRound();
}

function renderRound() {
  const stage = document.querySelector("#stage");
  const entry = ENTRIES[order[current]];
  answered = false;

  // Pick one wrong preposition from a different entry, skipping confusable pairs.
  const blocked = CONFLICTS[entry.key] || [];
  const others = ENTRIES.filter(
    (e) => e.key !== entry.key && !blocked.includes(e.key),
  );
  const wrong = others[Math.floor(Math.random() * others.length)];
  const options = shuffle([entry.preposition, wrong.preposition]);

  const tiles = entry.pattern.map(PatternTile).join("");
  const buttons = options
    .map(
      (opt) => `
        <button type="button"
          class="option btn btn-lg border-0 bg-base-100/80 backdrop-blur-sm hover:bg-base-100"
          data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>
      `,
    )
    .join("");

  stage.innerHTML = `
    <div class="text-sm font-medium text-base-content/60">
      Вопрос ${current + 1} из ${order.length} · Очки: ${score}
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">${tiles}</div>

    <div class="h-2 w-full max-w-xs overflow-hidden rounded-full bg-base-300">
      <div class="timer-bar h-full bg-primary" style="width: 100%"></div>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-4" data-correct="${escapeHtml(entry.preposition)}">
      ${buttons}
    </div>

    <div class="next-wrap flex h-14 items-center"></div>
  `;

  startTimer();
}

function startTimer() {
  const bar = document.querySelector("#stage .timer-bar");
  if (bar) {
    bar.style.transition = "none";
    bar.style.width = "100%";
    void bar.offsetWidth; // force reflow so the transition runs from 100%
    bar.style.transition = `width ${TIME_LIMIT}s linear`;
    bar.style.width = "0%";
  }
  clearTimeout(timerId);
  timerId = setTimeout(() => handleAnswer(null), TIME_LIMIT * 1000);
}

// value: the chosen preposition, or null when the timer ran out.
function handleAnswer(value) {
  if (answered) return;
  answered = true;
  clearTimeout(timerId);

  const stage = document.querySelector("#stage");
  const group = stage.querySelector("[data-correct]");
  const correct = group.dataset.correct;

  // Freeze the countdown bar where it is.
  const bar = stage.querySelector(".timer-bar");
  if (bar) {
    const width = getComputedStyle(bar).width;
    bar.style.transition = "none";
    bar.style.width = width;
  }

  if (value === correct) score++;

  group.querySelectorAll(".option").forEach((btn) => {
    btn.disabled = true;
    // Drop the translucent base background so the result color shows brightly.
    btn.classList.remove("bg-base-100/80", "backdrop-blur-sm", "hover:bg-base-100");
    if (btn.dataset.value === correct) {
      btn.classList.add("bg-green-500", "text-white", "hover:bg-green-500");
    } else if (btn.dataset.value === value) {
      btn.classList.add("bg-red-500", "text-white", "hover:bg-red-500");
    }
  });

  const last = current >= order.length - 1;
  stage.querySelector(".next-wrap").innerHTML = `
    <button type="button"
      class="next btn btn-lg gap-2 border-0 bg-base-100/80 backdrop-blur-sm hover:bg-base-100">
      ${last ? "Результат" : "Дальше"} ${arrowIcon}
    </button>
  `;
}

function next() {
  current++;
  if (current >= order.length) renderResult();
  else renderRound();
}

function renderResult() {
  const stage = document.querySelector("#stage");
  const perfect = score === order.length;
  stage.innerHTML = `
    <img src="${perfect ? lamaImg.happy : lamaImg.default}" alt="" class="h-32 w-32 object-contain" />
    <h2 class="text-2xl font-bold">Done!</h2>
    <p class="text-lg">Correct: <strong>${score}</strong> out of ${order.length}</p>
    <button type="button"
      class="restart btn btn-lg gap-2 border-0 bg-base-100/80 backdrop-blur-sm hover:bg-base-100">
      ${restartIcon} Try again
    </button>
  `;
}

document.querySelector("#app").innerHTML = App();

document.querySelector("#stage").addEventListener("click", (event) => {
  const option = event.target.closest(".option");
  if (option) {
    handleAnswer(option.dataset.value);
    return;
  }
  if (event.target.closest(".next")) {
    next();
    return;
  }
  if (event.target.closest(".restart")) {
    startGame();
  }
});

startGame();
