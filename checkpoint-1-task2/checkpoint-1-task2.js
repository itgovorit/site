import "../src/style.css";
import { Header } from "../src/components/header.js";

import data from "../src/data/checkpoint-1/task2.json";

// --- Tuning -----------------------------------------------------------------

// How fast the platforms rise, in pixels per second. Deliberately slow for now.
const SPEED = 40;
// Extra speed added after every correct answer. 0 keeps the pace constant.
const SPEED_STEP = 7;
// Vertical distance between rows of platforms.
const ROW_GAP = 110;
// Where the first platform starts, from the top of the game box. Gives the
// player a few seconds before the rising platforms become a threat.
const START_Y = 150;
// How long the ball takes to drop to the next row.
const DROP_MS = 380;

const BALL = 26; // ball diameter, px
// The view scrolls on once the ball is this far down the box (0–1).
// Kept high so, in the shorter box, the two choices under the ball always fit.
const FOLLOW_AT = 0.35;
// Horizontal centre of the left, middle and right column, as % of the width.
const COLUMN_X = [19, 50, 81];

// ---------------------------------------------------------------------------

const PAIRS = data.pairs;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Fisher–Yates shuffle (returns a new array).
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// --- Sound ------------------------------------------------------------------
//
// Retro bleeps synthesised with the Web Audio API — no files. The context is
// created on the first START press, because browsers only allow audio to begin
// from a user gesture.

// Overall loudness, 0–1.
const VOLUME = 0.15;

let audio = null;

function unlockAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audio ??= new Ctx();
  if (audio.state === "suspended") audio.resume();
}

// One note: an oscillator through a gain envelope that starts at `at` seconds
// from now, rises fast and fades out, so it never clicks. `to` slides the pitch.
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

const sfx = {
  // Ball settles back on a centre platform: a soft, low tick.
  // Higher and brighter than a "thud" on purpose: low triangle tones barely
  // come through laptop and phone speakers.
  land: () => tone({ freq: 440, to: 330, duration: 0.09, type: "square", volume: 0.9 }),
  // Right answer: a quick rising two-note chirp.
  correct: () => {
    tone({ freq: 660, duration: 0.07 });
    tone({ freq: 990, at: 0.07, duration: 0.1 });
  },
  // Whole run cleared: a rising arpeggio with a held top note.
  win: () => {
    [523, 659, 784, 1047].forEach((freq, i) => tone({ freq, at: i * 0.1, duration: 0.12 }));
    tone({ freq: 1568, at: 0.42, duration: 0.45, type: "triangle" });
  },
  // Wrong word or the ceiling: a descending buzz.
  over: () => {
    tone({ freq: 392, to: 98, duration: 0.6, type: "sawtooth", volume: 0.8 });
    tone({ freq: 196, to: 55, at: 0.05, duration: 0.6, type: "square", volume: 0.5 });
  },
};

// --- Rows -------------------------------------------------------------------
//
// The world is an endless column of rows, alternating: a centre platform with
// a starting word, then two side platforms with its opposite and a decoy. The
// ball drops from the centre to a side (the answer), then back to the centre.

let rows = [];
// The pairs still to come this game. Each pair is asked exactly once, in a
// random order, so a full run covers every word; the game is won when it runs
// out.
let deck = [];

// The wrong platform comes from another pair of the same kind, so a verb is
// never offered against an adjective and the choice is not a giveaway.
function decoyFor(pair) {
  const pool = PAIRS.filter((p) => p.id !== pair.id && p.type === pair.type);
  return pick(pick(pool).words);
}

// Returns false once every pair has been used.
function addQuestion() {
  if (!deck.length) return false;
  const pair = deck.pop();
  const flip = Math.random() < 0.5;
  const word = pair.words[flip ? 1 : 0];
  const answer = pair.words[flip ? 0 : 1];
  const correct = Math.random() < 0.5 ? 0 : 2;
  const sides = correct === 0 ? [answer, decoyFor(pair)] : [decoyFor(pair), answer];

  rows.push({ kind: "center", word, pair });
  rows.push({ kind: "sides", words: sides, correct, pair });
  return true;
}

const rowY = (index) => START_Y + index * ROW_GAP;

// --- State ------------------------------------------------------------------

let state = "idle"; // idle | running | over
let scroll = 0;
let speed = SPEED;
let score = 0;
let ball = { row: 0, col: 1 };
let drop = null; // { from, to, start }
let lastTime = 0;
let frame = 0;

// --- Markup -----------------------------------------------------------------

function App() {
  return `
    ${Header({ backHref: "/checkpoint-1/#task2" })}
    <main>
      <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
        <h1 class="text-3xl font-bold">Противоположности 🕹️</h1>
        <p>
          Юзай две кнопки и доведи шарик до конца,  подбирая противоположности к центральному слову.
        </p>
      </section>

      <section class="bg-base-200 px-4 py-10">
        <div class="mx-auto flex w-full max-w-md flex-col items-center gap-4">
          <div class="flex w-full items-center justify-between font-mono text-sm">
            <span>SCORE: <span id="score">0</span></span>
          </div>

          <!-- Short on purpose: tall enough for the current word and the two
               choices under it, but the next word stays below the edge until
               the platforms carry it up. -->
          <div id="game" class="retro-game relative h-[22rem] w-full overflow-hidden rounded-box">
            <div id="world" class="absolute inset-x-0 top-0"></div>
            <div id="ball" class="retro-ball absolute" style="width:${BALL}px;height:${BALL}px"></div>

            <div id="overlay" class="retro-overlay absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <p class="retro-title text-2xl">OPPOSITES</p>
              <p class="text-sm opacity-80">← → или кнопки внизу</p>
              <button type="button" id="start" class="btn btn-secondary btn-lg font-mono">START</button>
            </div>
          </div>

          <div class="grid w-full grid-cols-2 gap-3">
            <button type="button" id="left" class="retro-key" aria-label="Влево">◀</button>
            <button type="button" id="right" class="retro-key" aria-label="Вправо">▶</button>
          </div>
        </div>
      </section>
    </main>
  `;
}

// --- Rendering --------------------------------------------------------------

const world = () => document.querySelector("#world");

function Platform(word, col, index, side) {
  return `<div class="retro-platform absolute" data-row="${index}" data-col="${col}"
    style="left:${COLUMN_X[col]}%;top:${rowY(index)}px">${escapeHtml(word)}</div>`;
}

// Platforms are drawn once, as rows are generated; only the world's offset and
// the ball move each frame.
function drawRow(index) {
  const row = rows[index];
  const html =
    row.kind === "center"
      ? Platform(row.word, 1, index)
      : Platform(row.words[0], 0, index) + Platform(row.words[1], 2, index);
  world().insertAdjacentHTML("beforeend", html);
}

function ensureRows() {
  const height = document.querySelector("#game").clientHeight;
  // Enough to fill the screen, and always a few rows past the ball, so a quick
  // player can never drop onto a row that does not exist yet.
  while (rowY(rows.length) - scroll < height + ROW_GAP || rows.length < ball.row + 4) {
    const before = rows.length;
    if (!addQuestion()) break;
    for (let i = before; i < rows.length; i++) drawRow(i);
  }
  // Drop platforms long gone off the top.
  for (const el of world().querySelectorAll(".retro-platform")) {
    if (rowY(Number(el.dataset.row)) - scroll < -ROW_GAP) el.remove();
  }
}

// Where the ball sits on a given platform: centred on it, resting on its top.
function ballPos(row, col) {
  return { x: COLUMN_X[col], y: rowY(row) - BALL };
}

function currentBallPos(now) {
  if (!drop) return ballPos(ball.row, ball.col);
  const t = Math.min(1, (now - drop.start) / DROP_MS);
  const a = ballPos(drop.from.row, drop.from.col);
  const b = ballPos(drop.to.row, drop.to.col);
  // Sideways at an even pace, down with gravity.
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t * t };
}

function draw(now) {
  world().style.transform = `translateY(${-scroll}px)`;
  const pos = currentBallPos(now);
  const el = document.querySelector("#ball");
  el.style.left = `calc(${pos.x}% - ${BALL / 2}px)`;
  el.style.top = `${pos.y - scroll}px`;
  document.querySelector("#score").textContent = `${score} / ${PAIRS.length}`;
  return pos;
}

// --- Game loop --------------------------------------------------------------

function tick(now) {
  if (state !== "running") return;
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  scroll += speed * dt;
  ensureRows();

  if (drop && now - drop.start >= DROP_MS) land();
  if (state !== "running") return;

  // The view follows a ball that gets ahead of the rising platforms, so it
  // never drops out of the bottom of the box. Playing fast buys time.
  const height = document.querySelector("#game").clientHeight;
  const ballY = currentBallPos(now).y;
  scroll = Math.max(scroll, ballY - height * FOLLOW_AT);

  const pos = draw(now);
  // The ball has been carried up into the ceiling.
  if (pos.y - scroll <= 0) return gameOver("top");

  frame = requestAnimationFrame(tick);
}

function land() {
  ball = drop.to;
  drop = null;
  const row = rows[ball.row];
  if (row.kind !== "sides") return sfx.land();

  if (ball.col === row.correct) {
    // The last pair plays the win jingle instead, from win().
    if (!(ball.row === rows.length - 1 && !deck.length)) sfx.correct();
    score += 1;
    speed += SPEED_STEP;
    markPlatform(ball.row, ball.col, "is-right");
    // That was the last pair: every word has been covered.
    if (ball.row === rows.length - 1 && !deck.length) win();
  } else {
    markPlatform(ball.row, ball.col, "is-wrong");
    markPlatform(ball.row, row.correct, "is-right");
    gameOver("wrong");
  }
}

function markPlatform(row, col, cls) {
  world().querySelector(`.retro-platform[data-row="${row}"][data-col="${col}"]`)?.classList.add(cls);
}

// From the centre either arrow is an answer; from a side only the arrow back
// towards the centre does anything.
function move(dir) {
  if (state !== "running" || drop) return;
  const onCenter = ball.col === 1;
  if (!onCenter && (ball.col === 0 ? dir < 0 : dir > 0)) return;
  const to = { row: ball.row + 1, col: onCenter ? (dir < 0 ? 0 : 2) : 1 };
  drop = { from: { ...ball }, to, start: performance.now() };
}

function start() {
  cancelAnimationFrame(frame);
  rows = [];
  deck = shuffle(PAIRS);
  world().innerHTML = "";
  scroll = 0;
  speed = SPEED;
  score = 0;
  ball = { row: 0, col: 1 };
  drop = null;
  state = "running";
  document.querySelector("#overlay").classList.add("hidden");
  ensureRows();
  lastTime = performance.now();
  draw(lastTime);
  frame = requestAnimationFrame(tick);
}

function win() {
  sfx.win();
  state = "over";
  cancelAnimationFrame(frame);
  draw(performance.now());
  const overlay = document.querySelector("#overlay");
  overlay.innerHTML = `
    <p class="retro-title text-2xl">YOU WIN</p>
    <p class="text-sm opacity-80">Все пары пройдены</p>
    <p class="font-mono text-lg">SCORE: ${score} / ${PAIRS.length}</p>
    <button type="button" id="start" class="btn btn-secondary btn-lg font-mono">PLAY AGAIN</button>
  `;
  overlay.classList.remove("hidden");
}

// The pair to show at the end: the one just answered wrongly, or the one the
// ball was standing on when the time ran out.
function gameOver(reason) {
  sfx.over();
  state = "over";
  cancelAnimationFrame(frame);
  draw(performance.now());
  const pair = rows[ball.row].pair;
  const overlay = document.querySelector("#overlay");
  overlay.innerHTML = `
    <p class="retro-title text-2xl">GAME OVER</p>
    <p class="text-sm opacity-80">${reason === "top" ? "Время вышло" : "Неверное слово"}</p>
    <p class="font-mono text-lg">SCORE: ${score} / ${PAIRS.length}</p>
    <div class="space-y-1">
      <p class="font-mono text-xl uppercase">${escapeHtml(pair.words.join(" — "))}</p>
      <p class="text-sm opacity-80">${escapeHtml(pair.translation)}</p>
    </div>
    <button type="button" id="start" class="btn btn-secondary btn-lg font-mono">PLAY AGAIN</button>
  `;
  overlay.classList.remove("hidden");
}

// --- Wiring -----------------------------------------------------------------

document.querySelector("#app").innerHTML = App();

document.querySelector("#app").addEventListener("click", (event) => {
  if (event.target.closest("#start")) {
    unlockAudio();
    return start();
  }
  if (event.target.closest("#left")) return move(-1);
  if (event.target.closest("#right")) return move(1);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    move(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    move(1);
  }
});
