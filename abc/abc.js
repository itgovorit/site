import "../src/style.css";
import { Header } from "../src/components/header.js";
import { Warning } from "../src/components/warning.js";

// Hero background image for this page (Vite hashes and bundles it).
import heroUrl from "../src/img/abc/hero.jpg";

const PAGE_TITLE = "Alpha - вит";

function Hero() {
  return `
    <section
      class="hero min-h-[24rem]"
      style="background-image: url(${heroUrl});"
    >
      <div class="hero-overlay bg-opacity-60"></div>
      <div class="hero-content text-center text-neutral-content">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">${PAGE_TITLE}</h1>
        </div>
      </div>
    </section>
  `;
}

function Content() {
  // Static lesson content transcribed from the source material.
  return `
    <article class="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
      <h2 class="text-2xl font-bold">Сценарий: 🥸</h2>
      <p>
        Тебя зовут Дима)). Ты новенький в команде, и уже на первом созвоне на тебя
        хотят повесить таск в Джире. Скрам-мастер расшаривает экран и вбивает твое
        имя. Однако он пишет «Dmi...», а в системе ты заведен как
        Demitriy. И тут твой выход:
      </p>
      <div class="chat chat-start">
        <div class="chat-bubble">It’s D-E-M-I-T…</div>
      </div>
      <p>СМ начинает вводить заново ➡️ автокомплит тебя находит!</p>
      <p class=text-center">THE END (Конец) 🎉</p>

      <h2 class="pt-4 text-2xl font-bold">Объяснение 🧠:</h2>
      <p>
        Чтобы вот так по буквам продиктовать свое имя, нужно эти самые буквы хорошо
        знать.
      </p>
      ${Warning(`сегодня мы говорим именно про буквы (их названия в алфавите), а
        не про звуки. Буква <strong>C</strong>, например, может читаться и как <strong>/k/</strong>, и как <strong>/s/</strong>. В
        будущем мы уделим звукам много внимания. Но сегодня фокус на буквах!`)}
      <p>Исходя из опыта, английский алфавит можно условно поделить на три группы:</p>
      <p>
        🟢 Green: F, K, L, M, N, O, Q, S, T, Z — эти буквы обычно не вызывают
        проблем у русскоязычных, ошибки тут редкие и некритичные.
      </p>
      <p>
        🟡 Yellow: B, D, H, P, R, V, W, X — «айтишники» их обычно не путают, но
        произношение зачастую страдает (видят B, говорят «БЭ», а не «БИ»).
      </p>
      <p>
        🔴 Red: A - I - E, G - J, U - Y, C - (S) — а вот тут часто случается
        «тупняк». На эту группу обращаем особое внимание! 🔥
      </p>

      <h2 class="pt-4 text-2xl font-bold">Практика: 🚀</h2>
      <p>
        Предлагаю для начала пройтись по алфавиту на примере аббревиатур, которые
        могут встречаться по работе.
      </p>
      <p>
        👉 Task #1: Переходи на страницу, жмякай кнопки, слушай, повторяй и
        <strong>возвращайся</strong> сюда.
      </p>
      <p>
        <a id="task1" href="/abc-task1/" class="btn btn-primary">Task 1</a>
      </p>

      <p>Если дошел до конца — Good job! 👏</p>

      <p>Кстати, держи пару полезных фраз в мозго-копилку:</p>
      <ul class="list-disc space-y-2 pl-6">
        <li><strong>Spell it</strong>, please. (Скажи по буквам, плиз.)</li>
        <li>
          FTP <strong>stands for</strong> “File Transfer Protocol”. (FTP
          расшифровывается как…)
        </li>
        <li>No, it’s <strong>capital</strong> “D”. (Нет, “D” заглавная.)</li>
        <li>I-<strong>double</strong> A-S. (I-двойная A-S.)</li>
      </ul>
      <p>
        👉 Task #2: Идем на следующую страницу. Тут слушаем аудио и выбираем
        правильный вариант. Потому что вдруг ты тот самый скрам-мастер, которому
        произносят имя по буквам.
      </p>
      <p>
        <a id="task2" href="/abc-task2/" class="btn btn-primary">Task 2</a>
      </p>

      <h2 class="pt-4 text-2xl font-bold">Применение: 💪</h2>
      <p>Давай теперь постараемся вывести это все в плоскость твоей реальной жизни:</p>
      <ul class="list-disc space-y-2 pl-6">
        <li>Произнеси свое имя по буквам.</li>
        <li>
          Вспомни, какие аббревиатуры ты часто используешь на созвонах.
          <strong>Убедись,</strong> что произносишь их правильно. Если, к примеру,
          говоришь в конце английских согласных букв звук «Э», то это точно «косяк».
        </li>
      </ul>
      ${Warning(`Не все аббревиатуры произносятся по буквам. Так называемые
        акронимы звучат как одно слово. Например: SaaS, WIP — не произносят
        отдельными буквами.`)}

      <h2 class="pt-4 text-2xl font-bold">One more thing 💡</h2>
      <p>
        Зачастую, даже если ты идеально произнес букву, её могут не расслышать из-за
        плохого качества связи или слуха слушающего. В таких
        ситуациях можно воспользоваться <em>NATO phonetic alphabet</em>, где каждая
        буква — это отдельное слово: A - Alpha, B - Bravo и так далее. Помимо прочего
        используется и в гражданской авиации. Ведь там, как и в нашей работе, много
        людей, у кого английский не родной, а связь еще хуже, чем в «Тимсах».
      </p>
      <p>
        Такой алфавит работает идеально, если собеседник тоже в теме. Но даже если
        нет — ты всё равно будешь звучать круто! 😎 Не просто Dima, а ➡️ Delta -
        India - Mike - Alpha
      </p>
    </article>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/" })}
    <main>
      ${Hero()}
      ${Content()}
    </main>
  `;
}

document.querySelector("#app").innerHTML = App();

// Jump to an in-page anchor when arriving via a back-button link.
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
