import "../src/style.css";
import { Header } from "../src/components/header.js";

import data from "../src/data/adjectives/task3.json";

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

// Sentences are stored with their gaps written inline, as [word]. One source of
// truth: a gap and its answer cannot drift apart the way a template string and
// a separate answers array can.
const GAP = /\[([^[\]]+)\]/g;

// Case and stray spaces are not what is being tested, so every comparison goes
// through this.
const normalise = (word) => String(word).trim().toLowerCase();

// Split a half-sentence into plain text and gaps, in order. `possible` are
// words that also fit the gap but are not the one being asked for: still
// marked wrong, just with a kinder explanation.
function parse(line, possible) {
  const parts = [];
  let last = 0;
  for (const match of line.matchAll(GAP)) {
    if (match.index > last) parts.push({ text: line.slice(last, match.index) });
    parts.push({ answer: match[1], possible });
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last) });
  return parts;
}

// Optional in the data, and either a single word or a list of them.
const asList = (value) => (value == null ? [] : [].concat(value)).map(normalise);

const DECK = shuffle(data.sentences).map((sentence) => ({
  ...sentence,
  problemParts: parse(sentence.problem, asList(sentence.possibleProblemOption)),
  instructionParts: parse(sentence.instruction, asList(sentence.possibleInstructionOption)),
}));

const POSSIBLE_TIP = "Этот ответ возможен — но я имел ввиду более подходящее слово";

// --- The two states ---------------------------------------------------------
//
// One hand-drawn pair per sentence, which is why this is a lookup rather than
// anything general: each sentence needs its own picture of the problem. The
// left half of the diff is what the design looks like now, the right half what
// the client is asking for, and reading the difference is how the missing words
// are worked out.

const INK = "#216e39"; // the green used on the task 1 board
const DARK = "#0f3d1b";
const PALE = "#9be9a8";
const GOLD = "#e4b028"; // the logo gold, also the sound chart's highlight

const starPath =
  "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7.2L12 17.8 5.8 21.4l1.6-7.2L2 9.5l7.1-.6L12 2z";

const DEMOS = {
  // Too dark -> lighter. Same icon, two shades.
  "dark-icon": (desired) => `
    <svg viewBox="0 0 24 24" class="h-24 w-24" style="fill: ${desired ? PALE : DARK}" aria-hidden="true">
      <path d="${starPath}" />
    </svg>`,

  // Too thin -> thicker. Same box, two border weights.
  "thin-border": (desired) => `
    <div
      class="h-20 w-36 rounded-lg"
      style="border: ${desired ? "12px" : "2px"} solid ${INK}"
    ></div>`,

  // Too small -> increase the height. Same width, two heights.
  "small-container": (desired) => `
    <div
      class="w-36 rounded-lg"
      style="height: ${desired ? "7rem" : "2.25rem"}; background: ${PALE}; border: 2px solid ${INK}"
    ></div>`,

  // Too transparent -> less transparent. A star sits behind the label in a
  // contrasting colour, which is what makes the transparency legible at all:
  // faint text lets the star read straight through it, solid text covers it.
  // Both layers share one grid cell, so they stack without absolute positioning.
  "transparent-text": (desired) => `
    <span class="grid place-items-center">
      <svg viewBox="0 0 24 24" class="col-start-1 row-start-1 h-32 w-32" style="fill: ${GOLD}" aria-hidden="true">
        <path d="${starPath}" />
      </svg>
      <!-- Both states are transparent: the sentence asks for *less*
           transparent, not opaque, so the star still shows through on the
           right — just less than on the left. -->
      <span
        class="col-start-1 row-start-1 text-3xl font-bold"
        style="color: ${INK}; opacity: ${desired ? "0.6" : "0.15"}"
      >Read more</span>
    </span>`,

  // Too narrow -> wider. Same height, two widths.
  "narrow-width": (desired) => `
    <div
      class="h-20 rounded-lg"
      style="width: ${desired ? "11rem" : "3rem"}; background: ${PALE}; border: 2px solid ${INK}"
    ></div>`,
};

if (import.meta.env.DEV) {
  // Declared after DEMOS on purpose: it checks every sentence has a picture.
  for (const sentence of DECK) {
    const gaps = [...sentence.problemParts, ...sentence.instructionParts].filter((p) => p.answer);
    if (!gaps.length) console.warn(`adjectives task3: "${sentence.id}" has no gaps`);
    if (!DEMOS[sentence.id]) console.warn(`adjectives task3: "${sentence.id}" has no diff demo`);

    // Alternatives belong to a half, so they need exactly one gap there to
    // attach to, and must not repeat the real answer.
    for (const [field, parts] of [
      ["possibleProblemOption", sentence.problemParts],
      ["possibleInstructionOption", sentence.instructionParts],
    ]) {
      if (sentence[field] == null) continue;
      const halfGaps = parts.filter((p) => p.answer);
      if (halfGaps.length !== 1) {
        console.warn(`adjectives task3: "${sentence.id}" ${field} needs exactly one gap, found ${halfGaps.length}`);
      }
      for (const gap of halfGaps) {
        if (gap.possible.includes(normalise(gap.answer))) {
          console.warn(`adjectives task3: "${sentence.id}" ${field} repeats the answer "${gap.answer}"`);
        }
      }
    }
  }
}

// DaisyUI forces each diff item's single child to fill the figure, so the demo
// goes inside that one child — and both halves line up across the split because
// each is as wide as the whole figure.
function Diff(sentence) {
  // No width or height utilities on this div on purpose. DaisyUI sizes it to
  // `100cqi` — the width of the whole figure — and anchors it at left: 0, which
  // is what keeps the demo centred on the figure while the slider clips it. A
  // `w-full` here would instead resolve against the clipped item, so the
  // content would re-centre and slide as the slider moved.
  const half = (desired) => `
    <div class="grid place-items-center bg-base-200">
      ${DEMOS[sentence.id]?.(desired) ?? ""}
      <span
        class="badge badge-sm absolute bottom-2 ${desired ? "right-3" : "left-3"} border-0 bg-base-100/80 font-medium"
      >${desired ? "нужно" : "сейчас"}</span>
    </div>`;

  return `
    <figure class="diff h-56 rounded-box" tabindex="0">
      <div class="diff-item-1" role="img" aria-label="Сейчас" tabindex="0">
        ${half(false)}
      </div>
      <div class="diff-item-2" role="img" aria-label="Нужно">
        ${half(true)}
      </div>
      <div class="diff-resizer"></div>
    </figure>
  `;
}

// --- Markup -----------------------------------------------------------------

const arrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
`;

const arrowDownIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7 text-base-content/40" aria-hidden="true">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
`;

const tapIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0" aria-hidden="true">
    <path d="M10 9.5V4a2 2 0 1 1 4 0v8" />
    <path d="M14 10a2 2 0 1 1 4 0v2" />
    <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
`;

// Each gap becomes an input sized to its own answer, so the blank is a hint at
// how long the word is but never resizes as it is typed.
function Line(parts) {
  const html = parts
    .map((part) =>
      // The wrapper is a daisyUI tooltip that stays inert while data-tip is
      // empty; it only gets text when the input holds a "possible" answer.
      // The hidden note mirrors that text for screen readers, which never see
      // the tooltip's pseudo-element.
      part.answer
        ? `<span class="blank-tip tooltip tooltip-error mx-1" data-tip="">
             <input
               type="text"
               class="gap input input-bordered h-11 px-2 text-center text-xl font-semibold"
               style="width: ${part.answer.length + 3}ch"
               data-answer="${escapeHtml(normalise(part.answer))}"
               data-possible="${escapeHtml(part.possible.join("|"))}"
               autocomplete="off"
               autocapitalize="off"
               autocorrect="off"
               spellcheck="false"
               aria-label="Пропущенное слово"
             />
             <span class="blank-note sr-only" aria-live="polite"></span>
           </span>`
        : `<span>${escapeHtml(part.text)}</span>`,
    )
    .join("");

  return `<div class="flex flex-wrap items-center justify-center gap-y-1 text-xl">${html}</div>`;
}

function SentenceCard(sentence, index) {
  const isLast = index === DECK.length - 1;

  return `
    <div
      class="question card bg-base-100 shadow-sm${index === 0 ? "" : " hidden"}"
      data-index="${index}"
    >
      <div class="card-body items-center gap-4 text-center">
        ${Diff(sentence)}

        ${Line(sentence.problemParts)}
        ${arrowDownIcon}
        ${Line(sentence.instructionParts)}

        <!-- Laid out from the start and only unseen, so revealing it moves
             nothing. The icon and label are what say the blurred text can be
             tapped. -->
        <div class="reveal invisible text-center">
          <button
            type="button"
            class="translation inline-flex max-w-full items-center gap-1.5 text-left align-middle text-base-content/60 hover:text-base-content"
          >
            ${tapIcon}
            <span class="shrink-0 text-xs font-medium uppercase tracking-wide">перевод</span>
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
      <h1 class="text-3xl font-bold">Как Есть vs Как Надо 🔍</h1>
      <p>
        Потяни разделитель на картинке: слева — как сейчас, справа — как просит
        клиент. Разница подскажет, какие слова вписать в пропуски.
      </p>
      <div role="list" class="flex flex-wrap justify-center gap-2">${marks}</div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/adjectives/#task3" })}
    <main>
      ${Explanation()}
      <section class="bg-base-200 px-4 py-12">
        <div class="mx-auto w-full max-w-xl">
          ${DECK.map(SentenceCard).join("")}
          <!-- Holds its space from the start, so finishing shifts nothing. -->
          <p id="finale" class="invisible pt-6 text-center text-lg font-semibold">
            Готово — все фразы собраны 🎉
          </p>
        </div>
      </section>
    </main>
  `;
}

// --- Behaviour --------------------------------------------------------------

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

// Show or drop the "possible, but not the word I meant" note on one input.
// tooltip-open keeps it up without hover, which touch screens do not have.
function setPossibleNote(input, on) {
  const tip = input.closest(".blank-tip");
  tip.dataset.tip = on ? POSSIBLE_TIP : "";
  tip.classList.toggle("tooltip-open", on);
  tip.querySelector(".blank-note").textContent = on ? POSSIBLE_TIP : "";
}

// A fresh keystroke invalidates the last verdict on that one input.
function clearVerdict(input) {
  input.classList.remove("input-error", "input-success");
  setPossibleNote(input, false);
}

// "right" for the intended word, "possible" for an accepted alternative, and
// "wrong" for anything else. A possible answer still counts as a miss — the
// exercise wants the word the picture is pointing at — it only earns a note.
function verdict(input) {
  const value = normalise(input.value);
  if (value === input.dataset.answer) return "right";
  const possible = input.dataset.possible ? input.dataset.possible.split("|") : [];
  if (value && possible.includes(value)) return "possible";
  return "wrong";
}

function check(card) {
  const inputs = [...card.querySelectorAll(".gap")];
  let allRight = true;

  for (const input of inputs) {
    const result = verdict(input);
    input.classList.remove("input-error", "input-success");
    input.classList.add(result === "right" ? "input-success" : "input-error");
    setPossibleNote(input, result === "possible");
    if (result !== "right") allRight = false;
  }

  if (!allRight) return;

  card.dataset.done = "true";
  for (const input of inputs) input.readOnly = true;
  card.querySelector(".check").disabled = true;
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

    // Reveal the blurred translation (Telegram style, as on the other tasks).
    const translation = event.target.closest(".translation");
    if (translation) {
      translation.querySelector(".spoiler").classList.toggle("revealed");
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

  root.addEventListener("input", (event) => {
    const input = event.target.closest(".gap");
    if (input) clearVerdict(input);
  });

  // Enter checks the sentence, so the whole thing is doable from the keyboard.
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const input = event.target.closest(".gap");
    if (!input) return;
    event.preventDefault();
    const card = input.closest(".question");
    if (card.dataset.done === "true") {
      card.querySelector(".next")?.click();
    } else {
      card.querySelector(".check").click();
    }
  });
}

document.querySelector("#app").innerHTML = App();
setup();
