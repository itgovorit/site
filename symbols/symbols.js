import "../src/style.css";
import { Header } from "../src/components/header.js";
import { Warning } from "../src/components/warning.js";

const PAGE_TITLE = "Точка, точка, запятая";

function Hero() {
  return `
    <section class="hero bg-base-200 py-20">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold">${PAGE_TITLE}</h1>
          <p class="pt-4 text-2xl text-base-content/60">(^._.^)</p>
        </div>
      </div>
    </section>
  `;
}

function Content() {
  // Static lesson content transcribed from the source material.
  return `
    <article class="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
      <h2 class="text-2xl font-bold">Сценарий 2: 🖥️</h2>
      <p>
        Созвон, твой коллега раздает экран и вводит команды в терминале. Но
        благополучно ошибается ➡️ Vim ругается. Твой выход:
      </p>
      <div class="chat chat-start">
        <div class="chat-bubble">Add a dash before p</div>
      </div>
      <p>Коллега материт себя, хвалит тебя. Или наоборот 😄</p>
      <p class="text-center">The END! 🎉</p>

      <h2 class="pt-4 text-2xl font-bold">Symbols 🔣:</h2>
      <p>
        Чтобы правильно произнести свою почту, терминальные команды, куски кода и
        пароли (гы-гы) нам нужно повторить/выучить полезные символы на языке
        Шекспира.
      </p>

      <p>
        Для начала проверим что ты знаешь. Переходи на страницу и выбирай один из трёх уровней.
         Не обязательно знать все символы. Иногда достаточно узнать Что ты пока не знаешь 😉.
      </p>
      <p>
        <a id="task1" href="/symbols-task1/" class="btn btn-secondary">Task #1</a>
      </p>

      <h2 class="pt-4 text-2xl font-bold">Position ⛳:</h2>
      <p>
        Итак, после того как повторили/узнали символы, давай определимся, куда их можно поставить. Исходя из
        нашего сценария, есть несколько вариантов:
      </p>
      <p class="text-sm text-base-content/60">
        🟢 — символ, который добавляем/меняем &nbsp;·&nbsp; 🔴 — буква
      </p>
      <ul class="space-y-2">
        <li><span class="mr-2 tracking-widest">🟢🔴</span> <strong>before</strong> — <span class="spoiler text-sm">перед</span></li>
        <li><span class="mr-2 tracking-widest">🔴🟢</span> <strong>after</strong> — <span class="spoiler text-sm">после</span></li>
        <li><span class="mr-2 tracking-widest">🔴🟢🔴</span> <strong>between</strong> — <span class="spoiler text-sm">между</span></li>
        <li><span class="mr-2 tracking-widest">🟢🔴🟢</span> <strong>around</strong> — <span class="spoiler text-sm">вокруг / с обеих сторон</span></li>
        <li><span class="mr-2 tracking-widest">🟢🔴🔴🔴</span> <strong>at the start</strong> — <span class="spoiler text-sm">в начале</span></li>
        <li><span class="mr-2 tracking-widest">🔴🔴🔴🟢</span> <strong>at the end</strong> — <span class="spoiler text-sm">в конце</span></li>
      </ul>

            <p>Давай быстро проверим как ты это запомнил на примере Ламы. 
            Причем тут лама не важно - это просто "например"</p>
      <p>
        <a id="taskLama" href="/symbols-task-lama/" class="btn btn-secondary">Task с Ламой</a>
      </p>

      <h2 class="pt-4 text-2xl font-bold">Action 🤸:</h2>
      <p>Ок, теперь нам нужен глагол. Потому что какое предложение без глагола?! Возьмем всего три:</p>
      <ul class="space-y-2">
        <li>➕ <strong>Add</strong> — <span class="spoiler text-sm">добавить</span></li>
        <li>❌ <strong>Remove</strong> — <span class="spoiler text-sm">удалить</span></li>
        <li>🔄 <strong>Change</strong> 🔴 to 🟢 — <span class="spoiler text-sm">заменить</span></li>
      </ul>

      <p>Отлично теперь у нас есть глагол, мы знаем символы и вспомнили предлоги чтобы понять куда их ставить. 
      Теперь мы можем давать полноценные инструкции для ввода в терминал:</p>
      <ul class="space-y-2">
        <li><span class="font-mono">(➕ ";" 🔴🟢 "i")</span> → Add a semicolon after i</li>
        <li><span class="font-mono">(❌ "-" 🟢🔴 "p")</span> → <span class="spoiler">Remove the hyphen before p</span></li>
        <li><span class="font-mono">(🔄 "-" to "_" 🔴🟢🔴 "m" and "g")</span> → <span class="spoiler">Change the hyphen to an underscore between "m" and "g"</span></li>
        <li><span class="font-mono">(❌ "," 🔴🔴🔴🟢)</span> → <span class="spoiler">Remove the comma at the end</span></li>
        <li><span class="font-mono">(➕ "$" 🟢🔴🔴🔴)</span> → <span class="spoiler">Add a Dollar sign at the start</span></li>
      </ul>

      ${Warning(`Подозреваю что твой внимательный взгляд упал на артикли
        <strong>a</strong> и <strong>the</strong>. Предлагаю пока не запариваться.
        Можно и пропустить артикль. Однако особо внимательные наверное заметили определённую
        закономерность. Но как-нибудь обсудим!`)}

      <h2 class="pt-4 text-2xl font-bold">Practice: 🚀</h2>
       <p>Давай попытаемся построить предложения используя этот набор слов</p>
      <p>
        <a id="task3" href="/symbols-task3/" class="btn btn-secondary">Task #3</a>
      </p>
      
       <p>
        Если все сделал - Respect! Надеюсь не намучился с перетаскиванием. 😕
      </p>

      <p>
        Держи шпаргалку: символ, его название и транскрипция — всё в одном месте, с
        озвучкой. 🔖. Там ты увидишь что некоторые символы имеют несколько названий. <code>'!'</code> часто называют <strong>bang</strong>
        Точка в url всегда читается как  <strong>dot</strong>, но в конце предложения это <strong>period</strong>. Но особо не загоняйся - со временем разберёшься, что где. 
        Если знаешь хотя бы одно слово - уже вэри гуд
      </p>
      <p>
        <a id="bookmark" href="/symbols-bookmark/" class="btn btn-secondary">Bookmark</a>
      </p>
      <h2 class="pt-4 text-2xl font-bold">One more thing 💡 :</h2>
      <p>
Раз мы заговорили про знаки. Закрывающие скобки в конце предложения - это не такой уж международный знак улыбки)). С иностранцами лучше использовать смайлик 😀 либо добавить больше символов =) ;-) 
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

// Reveal a blurred spoiler on click (Telegram style).
document.querySelector("#app").addEventListener("click", (event) => {
  const spoiler = event.target.closest(".spoiler");
  if (spoiler) spoiler.classList.toggle("revealed");
});
