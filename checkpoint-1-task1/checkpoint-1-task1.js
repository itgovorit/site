import "../src/style.css";
import { Header } from "../src/components/header.js";

import data from "../src/data/checkpoint-1/task1.json";
import bgUrl from "../src/img/checkpoint-1/task1/background.jpeg";

// One clip per step, named in the data. The folder may not exist yet: the glob
// then comes back empty and the play button simply is not shown.
const audioModules = import.meta.glob("../src/audio/checkpoint-1/task1/*.mp3", {
  eager: true,
  import: "default",
});
const audioByFile = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [path.split("/").pop(), url]),
);

// Three steps of one real session: ssh into the server, give the password, run
// the script. A step with `symbols` is built from option buttons; a step with
// `symbols: null` is typed on the device keyboard.
const STEPS = data.passwords;
const STEP_TITLES = ["Подключись к серверу", "Введи пароль", "Запусти скрипт"];

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

// What goes before each token when the command is assembled. Read from the
// phrase itself, so "jcu" + "@" + "127.2.5.1" join with no spaces while "ssh"
// and "-p" get one — and a wrong pick still lands where the right one would.
function separators(phrase, tokens) {
  const seps = [];
  let pos = 0;
  for (const token of tokens) {
    let sep = "";
    while (phrase[pos] === " ") {
      sep += " ";
      pos++;
    }
    if (phrase.slice(pos, pos + token.length) !== token) return null;
    seps.push(sep);
    pos += token.length;
  }
  return pos === phrase.length ? seps : null;
}

for (const step of STEPS) {
  if (!step.symbols) continue;
  const tokens = step.symbols.map((s) => s.char);
  step.seps = separators(step.phrase, tokens);
  if (!step.seps) {
    if (import.meta.env.DEV) {
      console.warn(`checkpoint-1 task1: "${step.id}" symbols do not spell "${step.phrase}"`);
    }
    step.seps = tokens.map((_, i) => (i === 0 ? "" : " "));
  }
  if (import.meta.env.DEV) {
    for (const s of step.symbols) {
      if (s.options[0] !== s.char) console.warn(`checkpoint-1 task1: "${step.id}" options[0] is not "${s.char}"`);
      if (new Set(s.options).size !== s.options.length) {
        console.warn(`checkpoint-1 task1: "${step.id}" "${s.char}" has repeated options`);
      }
    }
  }
}

// User and host come from the ssh command, so the prompts follow the data.
const sshTarget = STEPS[0].phrase.match(/(\S+)@(\S+)\s*$/) ?? [null, "user", "server"];
const REMOTE_USER = sshTarget[1];
const REMOTE_HOST = sshTarget[2];

const PROMPTS = [
  `<span class="text-success">skynet@mainframe</span>:<span class="text-info">~</span>$ `,
  `${escapeHtml(REMOTE_USER)}@${escapeHtml(REMOTE_HOST)}'s password: `,
  `<span class="text-success">${escapeHtml(REMOTE_USER)}@prod</span>:<span class="text-info">~</span>$ `,
];

const playIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.04-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
  </svg>
`;

const repeatIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
`;

// Each step has two clips: "<name>-1" for the first listen and "<name>-2" for
// every repeat after it, where <name> is the step's `audio` without ".mp3".
const clipName = (s, n) => `${s.audio.replace(/\.mp3$/, "")}-${n}.mp3`;

// Steps whose first clip has already been played. A retry keeps it, so after a
// mistake the button offers Repeat rather than starting over.
const heard = new Set();

// --- State -----------------------------------------------------------------

let step = 0;
let typed = []; // tokens picked so far (option steps)
let options = []; // shuffled options for the token being asked for
let phase = "typing"; // typing | ready | error | done
const history = []; // finished terminal lines, as HTML

const current = () => STEPS[step];
const isTypedStep = () => !current().symbols;
const assembled = () => typed.map((t, i) => current().seps[i] + t).join("");

// --- Markup ----------------------------------------------------------------

function App() {
  return `
    ${Header({ backHref: "/checkpoint-1/#task1" })}
    <main>
      <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
        <h1 class="text-3xl font-bold">Зайди на сервер 🖥️</h1>
        <p>
          Слушай - Вводи комманды - останови SKYNET
        </p>
      </section>

      <section class="bg-cover bg-center px-4 py-12" style="background-image: url(${bgUrl});">
        <!-- Translucent panel over the photo, as on the other tasks. -->
        <div class="mx-auto flex w-full max-w-xl flex-col items-center gap-5 rounded-box bg-base-100/30 p-5 shadow-md backdrop-blur-sm">
          <!-- min-h fits a title that wraps to two lines on a phone, so a
               shorter title on the next step does not pull the page up. -->
          <div class="flex min-h-12 w-full items-center justify-between gap-3">
            <span id="step-title" class="font-semibold"></span>
            <button type="button" id="play" class="btn btn-secondary hidden shrink-0 gap-2"></button>
          </div>

          <!-- Fixed height and scrolls on its own, like a real terminal, so
               lines piling up never push the page around. -->
          <div class="w-full overflow-hidden rounded-box bg-neutral text-neutral-content shadow-md">
            <div class="flex gap-1.5 bg-black/30 px-4 py-2" aria-hidden="true">
              <span class="h-3 w-3 rounded-full bg-error"></span>
              <span class="h-3 w-3 rounded-full bg-warning"></span>
              <span class="h-3 w-3 rounded-full bg-success"></span>
            </div>
            <div
              id="screen"
              class="h-64 overflow-y-auto whitespace-pre-wrap break-all p-4 font-mono text-base leading-relaxed"
              aria-live="polite"
            ></div>
          </div>

          <!-- Same as Try again, but available at any point in the step. Kept
               in the layout once the session is done (just unseen), so its
               row never collapses and nothing below moves. -->
          <button type="button" id="clear" class="btn btn-ghost btn-sm self-end font-mono [&:not(:hover)]:text-white">Clear</button>

          <!-- Tall enough for the three stacked options, so swapping to Enter,
               Try again or the input moves nothing. -->
          <div id="controls" class="flex min-h-44 w-full flex-col items-center justify-center gap-2"></div>
        </div>
      </section>
    </main>
  `;
}

// --- Rendering --------------------------------------------------------------

function liveLine() {
  if (phase === "error" || phase === "done") return "";
  const prompt = PROMPTS[step];
  if (isTypedStep()) {
    return `<div class="flex">${prompt}<input
      id="cmd"
      type="text"
      class="min-w-0 flex-1 bg-transparent text-neutral-content caret-success outline-none"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      aria-label="Команда"
    /></div>`;
  }
  const cursor = phase === "typing" ? `<span class="term-cursor">▌</span>` : "";
  return `<div>${prompt}${escapeHtml(assembled())}${cursor}</div>`;
}

function renderScreen() {
  const screen = document.querySelector("#screen");
  screen.innerHTML = history.map((line) => `<div>${line}</div>`).join("") + liveLine();
  screen.scrollTop = screen.scrollHeight;
}

function renderControls() {
  const controls = document.querySelector("#controls");

  if (phase === "done") {
    controls.innerHTML = `<p class="text-lg font-semibold">Готово — скрипт запущен 🎉</p>`;
  } else if (phase === "error") {
    controls.innerHTML = `<button type="button" id="retry" class="btn btn-warning btn-lg">Try again</button>`;
  } else if (phase === "ready" || isTypedStep()) {
    controls.innerHTML = `<button type="button" id="enter" class="btn btn-secondary btn-lg font-mono">Enter ⏎</button>`;
  } else {
    controls.innerHTML = options
      .map(
        (token, i) => `
          <button
            type="button"
            class="option btn btn-outline h-12 w-full max-w-xs font-mono text-xl normal-case [&:not(:hover)]:border-white [&:not(:hover)]:text-white"
            data-opt="${i}"
          >${escapeHtml(token)}</button>`,
      )
      .join("");
  }
}

function render() {
  const s = current();
  document.querySelector("#step-title").textContent =
    `Шаг ${step + 1} из ${STEPS.length}: ${STEP_TITLES[step] ?? ""}`;
  const play = document.querySelector("#play");
  const repeat = heard.has(step);
  const clip = clipName(s, repeat ? 2 : 1);
  // invisible, not hidden: the button sets the height of the title row, so
  // removing it would shift everything below up.
  play.classList.remove("hidden");
  play.classList.toggle("invisible", !audioByFile[clip] || phase === "done");
  play.innerHTML = repeat ? `${repeatIcon} Repeat` : `${playIcon} Play`;
  play.setAttribute("aria-label", repeat ? "Прослушать ещё раз" : "Прослушать");

  document.querySelector("#clear").classList.toggle("invisible", phase === "done");

  renderScreen();
  renderControls();

  if (phase === "typing" && isTypedStep()) document.querySelector("#cmd")?.focus();
}

function prepareOptions() {
  const next = current().symbols?.[typed.length];
  options = next ? shuffle(next.options) : [];
}

function startStep(index) {
  step = index;
  typed = [];
  phase = "typing";
  prepareOptions();
  render();
}

// --- Behaviour --------------------------------------------------------------

// The pick is shown whether it is right or not; grading waits for Enter.
function choose(index) {
  typed.push(options[index]);
  if (typed.length === current().symbols.length) phase = "ready";
  prepareOptions();
  render();
}

const red = (text) => `<span class="text-error">${escapeHtml(text)}</span>`;
const green = (text) => `<span class="text-success">${escapeHtml(text)}</span>`;
const dim = (text) => `<span class="opacity-60">${escapeHtml(text)}</span>`;

// Extra spaces are not what is being tested on the typed step.
const tidy = (text) => text.trim().replace(/\s+/g, " ");

function enter() {
  const s = current();
  const entry = isTypedStep() ? tidy(document.querySelector("#cmd")?.value ?? "") : assembled();
  if (isTypedStep() && !entry) return;

  history.push(PROMPTS[step] + escapeHtml(entry));
  const ok = entry === (isTypedStep() ? tidy(s.phrase) : s.phrase);

  if (step === 0) {
    if (!ok) {
      history.push(red("ssh: unknown host"));
      phase = "error";
      return render();
    }
    return startStep(1);
  }

  if (step === 1) {
    if (!ok) {
      history.push(red("Permission denied, please try again."));
      phase = "error";
      return render();
    }
    history.push(dim(`Welcome to Skynet(${REMOTE_HOST})`), dim(`BE CAREFUL!!!`));
    return startStep(2);
  }

  if (!ok) {
    const first = entry.split(" ")[0];
    history.push(red(`bash: ${first}: No such file or directory`));
    phase = "error";
    return render();
  }
  history.push(dim("Running…"), green("Done."));
  phase = "done";
  render();
}

function retry() {
  startStep(step);
}

let currentAudio = null;

// First press plays "-1" and turns the button into Repeat; every press after
// that plays "-2", as often as wanted.
function playStep() {
  const repeat = heard.has(step);
  const url = audioByFile[clipName(current(), repeat ? 2 : 1)];
  if (!url) return;
  currentAudio?.pause();
  currentAudio = new Audio(url);
  currentAudio.play().catch(() => {});
  if (!repeat) {
    heard.add(step);
    render();
  }
}

document.querySelector("#app").innerHTML = App();

document.querySelector("#app").addEventListener("click", (event) => {
  const option = event.target.closest(".option");
  if (option) return choose(Number(option.dataset.opt));
  if (event.target.closest("#enter")) return enter();
  if (event.target.closest("#retry") || event.target.closest("#clear")) return retry();
  if (event.target.closest("#play")) return playStep();
  // Tapping anywhere on the screen puts the caret back in the command line.
  if (event.target.closest("#screen")) document.querySelector("#cmd")?.focus();
});

// The real Enter key submits the typed step.
document.querySelector("#app").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.id === "cmd") {
    event.preventDefault();
    enter();
  }
});

startStep(0);
