import "../src/style.css";
import { Header } from "../src/components/header.js";
import data from "../src/data/checkpoint-1/task3.json";
import bgUrl from "../src/img/checkpoint-1/task3/background.jpeg";

// One spoken clip per step, named in the data ("head.mp3", …). Only URL strings
// are imported here; the bytes load when Play is pressed.
const audioModules = import.meta.glob("../src/audio/checkpoint-1/task3/*.mp3", {
  eager: true,
  import: "default",
});
const audioByFile = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [path.split("/").pop(), url]),
);

const playIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.04-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
  </svg>
`;

let currentClip = null;

function playInstruction() {
  const url = audioByFile[STEPS[step]?.audio];
  if (!url) return;
  currentClip?.pause();
  currentClip = new Audio(url);
  currentClip.play().catch(() => {});
}

const STEPS = data.steps;

// Retro palette, shared with the other checkpoint games.
const C = {
  bg: "#0b0620",
  grid: "rgba(45,226,230,0.07)",
  head: "#2979ff",
  headEdge: "#1a237e",
  eye: "#e53935",
  mouth: "#e53935",
  antenna: "#90caf9",
  outline: "rgba(45,226,230,0.75)",
  cyan: "#2de2e6",
  magenta: "#ff3cac",
  ink: "#e8e6ff",
};

// --- The robot --------------------------------------------------------------
//
// Drawn in a 200 x 200 box. Each part has a "current" and a "desired" size, and
// `LOOK` holds the number being shown for every part right now. Solving step N
// moves part N from its current to its desired value; the other parts stay put.
// Sizes are in box units and the layout is worked out so that, with every part
// at its desired size, the whole robot fits inside the box with room to spare.

const CX = 100; // horizontal centre of the robot
const CY = 112; // vertical centre of the head

const PARTS = {
  head: { from: 0.5, to: 1 }, // scale of the head, 1 = full size
  eyes: { from: 0, to: 1 }, // shade: 0 = light, 1 = dark ("make them darker")
  ears: { from: 18, to: 52 }, // height ("make them longer")
  mouth: { from: 38, to: 96 }, // width
  antennas: { from: 1.5, to: 5 }, // stroke width
};

const HEAD_W = 120;
const HEAD_H = 110;
const EYE_R = 15; // eyes keep their size; only the shade changes
const EAR_W = 18; // ears keep their width; only the length changes

// The two ends of the eye shade. The animation blends between them.
const EYE_LIGHT = [255, 190, 186];
const EYE_DARK = [139, 10, 20];

const lerp = (a, b, t) => a + (b - a) * t;
const eyeColour = (t) => `rgb(${EYE_LIGHT.map((v, i) => Math.round(lerp(v, EYE_DARK[i], t))).join(",")})`;

// What each part looks like before step `n`: parts of earlier steps are done.
function look(n) {
  const out = {};
  STEPS.forEach((step, i) => {
    const p = PARTS[step.part];
    out[step.part] = i < n ? p.to : p.from;
  });
  return out;
}

// The dashed "desired" outline for one part, shown while it is being asked for.
function outlineFor(part, L) {
  const s = L.head;
  const hw = HEAD_W * s;
  const hh = HEAD_H * s;
  const stroke = `fill="none" stroke="${C.outline}" stroke-width="1.6" stroke-dasharray="4 3"`;

  if (part === "head") {
    return `<rect x="${CX - HEAD_W / 2}" y="${CY - HEAD_H / 2}" width="${HEAD_W}" height="${HEAD_H}" rx="4" ${stroke}/>`;
  }
  if (part === "eyes") {
    // A shade cannot be shown as an outline, so the target is a dashed ring in
    // the dark colour the eyes should end up, just around the current eye.
    return [-1, 1]
      .map(
        (d) =>
          `<circle cx="${CX + d * 30 * s}" cy="${CY - 18 * s}" r="${EYE_R + 4}" fill="none" stroke="${eyeColour(1)}" stroke-width="3.5" stroke-dasharray="4 3"/>`,
      )
      .join("");
  }
  if (part === "ears") {
    const h = PARTS.ears.to * s;
    return [-1, 1]
      .map((d) => {
        const x = d < 0 ? CX - hw / 2 - EAR_W : CX + hw / 2;
        return `<rect x="${x}" y="${CY - h / 2}" width="${EAR_W}" height="${h}" rx="2" ${stroke}/>`;
      })
      .join("");
  }
  if (part === "mouth") {
    const w = PARTS.mouth.to * s;
    return `<rect x="${CX - w / 2}" y="${CY + 20 * s}" width="${w}" height="${18 * s}" rx="3" ${stroke}/>`;
  }
  // antennas: the heavier stroke they should end up with
  const top = CY - hh / 2;
  const spread = 36 * s;
  const h = 38 * s;
  const w = PARTS.antennas.to;
  return [-1, 1]
    .map(
      (d) =>
        `<line x1="${CX + d * spread}" y1="${top - h}" x2="${CX}" y2="${top}" stroke="${C.outline}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="4 3"/>`,
    )
    .join("");
}

// `visible` lists the parts drawn so far. The robot is revealed one part at a
// time, so the player never sees the finished picture before building it.
function robotSVG(L, outlinePart, visible) {
  const has = (part) => visible.has(part);
  const s = L.head;
  const hw = HEAD_W * s;
  const hh = HEAD_H * s;
  const hx = CX - hw / 2;
  const hy = CY - hh / 2;

  const earH = L.ears * s;
  const mouthW = L.mouth * s;

  const antennas = [-1, 1]
    .map(
      (d) =>
        `<line x1="${CX + d * 36 * s}" y1="${hy - 38 * s}" x2="${CX}" y2="${hy}" stroke="${C.antenna}" stroke-width="${L.antennas}" stroke-linecap="round"/>`,
    )
    .join("");

  const ears = [
    { x: hx - EAR_W },
    { x: hx + hw },
  ]
    .map(
      (e) =>
        `<rect x="${e.x}" y="${CY - earH / 2}" width="${EAR_W}" height="${earH}" rx="2" fill="${C.head}" stroke="${C.headEdge}" stroke-width="1.5"/>`,
    )
    .join("");

  const eyes = [-1, 1]
    .map((d) => `<circle cx="${CX + d * 30 * s}" cy="${CY - 18 * s}" r="${EYE_R * s}" fill="${eyeColour(L.eyes)}"/>`)
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="h-full w-full" role="img" aria-label="Робот">
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="${C.grid}" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="200" height="200" fill="${C.bg}"/>
      <rect width="200" height="200" fill="url(#grid)"/>
      <g id="robot">
        ${has("antennas") ? antennas : ""}
        ${has("ears") ? ears : ""}
        ${has("head") ? `<rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="4" fill="${C.head}" stroke="${C.headEdge}" stroke-width="2"/>` : ""}
        ${has("eyes") ? eyes : ""}
        ${has("mouth") ? `<rect x="${CX - mouthW / 2}" y="${CY + 20 * s}" width="${mouthW}" height="${18 * s}" rx="3" fill="${C.mouth}"/>` : ""}
      </g>
      <!-- On top of the robot, not behind it: the eyes and mouth sit inside the
           head, so an outline underneath would be hidden by it. -->
      <g id="target">${outlinePart ? outlineFor(outlinePart, L) : ""}</g>
    </svg>`;
}

// --- State ------------------------------------------------------------------

let step = 0;
let phase = "input"; // input | animating | done
let shown = look(0); // the numbers drawn right now
const ANIM_MS = 800;

// --- Markup -----------------------------------------------------------------

function App() {
  return `
    ${Header({ backHref: "/checkpoint-1/#task3" })}
    <main>
      <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
        <h1 class="text-3xl font-bold">Собери робота 🤖</h1>
        <p>
          Пунктиром показано, какой должна стать деталь. Слушай - нажимай на слова по порядку. 
        </p>
      </section>

      <section class="bg-cover bg-center px-4 py-10" style="background-image: url(${bgUrl});">
        <!-- Translucent panel over the photo, as on task 1 and symbols-task3. -->
        <div class="mx-auto flex w-full max-w-sm flex-col items-center gap-5 rounded-box bg-base-100/30 p-5 shadow-md backdrop-blur-sm">
          <div id="dots" class="flex gap-2" aria-hidden="true"></div>

          <div id="canvas" class="retro-game relative aspect-square w-full overflow-hidden rounded-box"></div>

          <!-- The problem is heard, not read: a play button for the step's
               clip. Fixed height so the end message does not change the layout. -->
          <div id="instruction" class="retro-line flex h-[4.25rem] w-full items-center justify-center rounded-box px-4 py-2 text-center font-mono"></div>

          <!-- Dark panel, like the instruction strip above: the light retro text
               would be unreadable straight on the page background. -->
          <div id="row" class="retro-line flex min-h-28 w-full flex-wrap content-center items-center justify-center gap-2 rounded-box px-3 py-3 font-mono text-lg"></div>

          <!-- Light pill so the message stays readable over the photo. Kept in
               the layout when empty (just unseen), so nothing below moves. -->
          <p id="feedback" class="invisible min-h-9 rounded-full bg-base-100/90 px-4 py-1.5 text-center font-mono text-base font-semibold shadow-sm" aria-live="polite">&nbsp;</p>
        </div>
      </section>
    </main>
  `;
}

const $ = (sel) => document.querySelector(sel);

function renderDots() {
  $("#dots").innerHTML = STEPS.map((_, i) => {
    const fill = i < step ? C.cyan : i === step && phase !== "done" ? C.magenta : "transparent";
    return `<span class="h-3 w-3 rounded-full border-2" style="border-color:${C.cyan};background:${fill}"></span>`;
  }).join("");
}

function renderCanvas() {
  const outline = phase === "input" ? STEPS[step].part : null;
  // Every part solved so far, plus the one being worked on now.
  const visible = new Set(STEPS.slice(0, phase === "done" ? STEPS.length : step + 1).map((s) => s.part));
  $("#canvas").innerHTML = robotSVG(shown, outline, visible);
}

function renderInstruction() {
  if (phase === "done") {
    $("#instruction").innerHTML = `<span style="color:${C.magenta}">✦ ROBOT COMPLETE ✦</span>`;
    return;
  }
  // The clip says the problem ("It is too small"). If a clip is missing, fall
  // back to showing the text so the step can still be done.
  const s = STEPS[step];
  $("#instruction").innerHTML = audioByFile[s.audio]
    ? `<button type="button" id="play" class="retro-key flex items-center gap-2 px-5" style="height:3rem;font-size:1.1rem" aria-label="Прослушать задание">${playIcon}<span class="font-mono">PLAY</span></button>`
    : `<span style="color:${C.magenta}">&gt;</span> ${escapeHtml(s.instruction)}`;
}

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

// The pills for the current sentence: its words plus the extras, shuffled.
// `order` is a pill's place in the sentence (0, 1, 2…), or null for an extra.
// Shuffled once per step, so a reset after a mistake keeps the same layout.
let pills = [];
let picked = 0; // how many words of the sentence are already in place
let locked = false; // true while a wrong pick is being shown

function preparePills() {
  const s = STEPS[step];
  const list = [
    ...s.words.map((word, order) => ({ word, order })),
    ...(s.extra ?? []).map((word) => ({ word, order: null })),
  ];
  // Never start with the sentence already in order.
  do pills = shuffle(list);
  while (pills.every((p, i) => p.order === i) && list.length > 1);
  picked = 0;
}

// Word pills, styled like the other checkpoint controls. A placed word gets a
// green overlay with its number; a wrong pick flashes red.
function renderRow() {
  const row = $("#row");
  if (phase !== "input") {
    row.innerHTML = "";
    return;
  }
  row.innerHTML = pills
    .map((p, i) => {
      const placed = p.order !== null && p.order < picked;
      // The red mark is added only on a wrong pick, in choose().
      const badge = placed
        ? `<span class="pill-mark pill-right" aria-hidden="true"><span class="pill-num">${p.order + 1}</span></span>`
        : "";
      return `
        <button
          type="button"
          class="word-pill"
          data-pill="${i}"
          ${placed ? 'disabled aria-label="' + escapeHtml(p.word) + ', ' + (p.order + 1) + '"' : ""}
        >${escapeHtml(p.word)}${badge}</button>`;
    })
    .join("");
}

function render() {
  renderDots();
  renderCanvas();
  renderInstruction();
  renderRow();
}

// The feedback line sits on the light page, not on a dark panel, so the neon
// colours are swapped for darker versions of the same hues there.
const ON_LIGHT = { [C.cyan]: "#0b7f82", [C.magenta]: "#c2187a", [C.ink]: "#1f1b3a" };

function setFeedback(text, color = C.ink) {
  color = ON_LIGHT[color] ?? color;
  const el = $("#feedback");
  el.textContent = text || "\u00a0";
  el.style.color = color;
  el.classList.toggle("invisible", !text);
}

// --- Animation --------------------------------------------------------------

function animate(part, onDone) {
  const p = PARTS[part];
  const start = performance.now();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const frame = (now) => {
    const t = reduce ? 1 : Math.min(1, (now - start) / ANIM_MS);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    shown = { ...shown, [part]: lerp(p.from, p.to, eased) };
    renderCanvas();
    if (t < 1) requestAnimationFrame(frame);
    else onDone();
  };
  requestAnimationFrame(frame);
}

// --- Behaviour --------------------------------------------------------------

// --- Sound ------------------------------------------------------------------
//
// Same retro bleeps as task 2, synthesised with the Web Audio API — no files.
// The context is created on the first pill press, because browsers only allow
// audio to start from a user gesture.

// Overall loudness, 0–1.
const VOLUME = 0.15;

let audio = null;

function unlockAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audio ??= new Ctx();
  if (audio.state === "suspended") audio.resume();
}

// One note: an oscillator through a gain envelope that starts `at` seconds from
// now, rises fast and fades out, so it never clicks. `to` slides the pitch.
function tone({ freq, to = freq, at = 0, duration = 0.12, type = "square", volume = 1 }) {
  if (!audio) return;
  const start = audio.currentTime + at;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(VOLUME * volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

// A major scale, so the words of a sentence climb up it as they are placed.
const SCALE = [523, 587, 659, 698, 784, 880, 988];

const sfx = {
  // A right word: one note, one step higher for each word already placed.
  word: (n) => tone({ freq: SCALE[Math.min(n, SCALE.length - 1)], duration: 0.09 }),
  // Wrong word or the extra one: a short falling buzz.
  wrong: () => {
    tone({ freq: 330, to: 110, duration: 0.35, type: "sawtooth", volume: 0.8 });
    tone({ freq: 165, to: 55, at: 0.03, duration: 0.35, type: "square", volume: 0.5 });
  },
  // Sentence finished, the part is about to change: a rising sweep.
  sentence: () => tone({ freq: 440, to: 1320, duration: 0.45, type: "triangle", volume: 1.2 }),
  // Robot complete: the task 2 win jingle.
  win: () => {
    [523, 659, 784, 1047].forEach((freq, i) => tone({ freq, at: i * 0.1, duration: 0.12 }));
    tone({ freq: 1568, at: 0.42, duration: 0.45, type: "triangle" });
  },
};

// How long a wrong pick stays red before the sentence starts over.
const WRONG_MS = 700;

function choose(index) {
  if (phase !== "input" || locked) return;
  const pill = pills[index];
  const s = STEPS[step];

  if (pill.order !== picked) {
    // Wrong word, or the extra one: flash it red, then clear every pill.
    locked = true;
    sfx.wrong();
    const el = $(`.word-pill[data-pill="${index}"]`);
    el.classList.add("is-wrong");
    el.insertAdjacentHTML(
      "beforeend",
      `<span class="pill-mark pill-wrong" aria-hidden="true"><span class="pill-num">✕</span></span>`,
    );
    setFeedback("✗ Неверный порядок!", C.magenta);
    setTimeout(() => {
      locked = false;
      picked = 0;
      setFeedback("");
      renderRow();
    }, WRONG_MS);
    return;
  }

  sfx.word(picked);
  picked += 1;
  renderRow();
  if (picked < s.words.length) return;

  setFeedback(`✓ ${s.words.join(" ")}`, C.cyan);
  phase = "animating";
  // A beat with the finished sentence on screen before the part changes.
  setTimeout(() => {
    sfx.sentence(); // plays while the part changes
    renderRow();
    renderCanvas(); // outline goes away while the part moves
    animate(s.part, () => {
      step += 1;
      phase = step >= STEPS.length ? "done" : "input";
      if (phase === "done") sfx.win();
      shown = look(step);
      if (phase === "input") preparePills();
      setFeedback(phase === "done" ? "Робот готов!" : "", C.magenta);
      render();
    });
  }, 500);
}

document.querySelector("#app").innerHTML = App();
preparePills();
render();

document.querySelector("#app").addEventListener("click", (event) => {
  if (event.target.closest("#play")) return playInstruction();
  const pill = event.target.closest(".word-pill");
  if (pill && !pill.disabled) {
    unlockAudio();
    choose(Number(pill.dataset.pill));
  }
});
