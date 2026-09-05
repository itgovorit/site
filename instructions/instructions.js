import "../src/style.css";
import { Header } from "../src/components/header.js";

const PAGE_TITLE = "Инструкции";

function Hero() {
  return `
    <section class="hero bg-base-200 py-20">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold">${PAGE_TITLE}</h1>
          <p class="pt-4 text-base-content/70">
              Как сказать коллегам, что им делать, и как понять, куда тебе идти
          </p>
        </div>
      </div>
    </section>
  `;
}

function Content() {
  return `
    <article class="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
      <h2 class="text-2xl font-bold">Scenario 4 😡</h2>
      <p>
        Ты на общем звонке с коллегами. И тебя все бесят . Один забыл раздать
        экран и что-то увлечённо показывает и рассказывает. У другого на фоне орёт
        кот, а третий забыл выключить камеру и ковыряется в носу. Твой выход:
      </p>
      <div class="chat chat-start">
        <div class="chat-bubble">
          Angela, share your screen. Oleg, mute your mic. OMG, John, turn off
          your camera
        </div>
      </div>
      <p class="text-center">The END 😌</p>

      <h2 class="pt-4 text-2xl font-bold">Объяснение 🧠</h2>
      <p>
        Давать инструкции (включая приказы и просьбы) на английском довольно
        просто. Отсутствие в английском уважительной формы (открой / откройте) и
        совершенной и несовершенной формы глаголов (открывать / открыть) упрощает
        нам жизнь — просто берём глагол из словаря — <strong>Open!</strong> Вот и
        готова самая минимальная инструкция. Конечно, часто надо уточнять что
        открывать, но об этом позже.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Экшены 🎬</h2>
      <p>
        Давай посмотрим на список глаголов которые могут пригодиться тебе на
        стандартном рабочем звонке.
      </p>
      <p>
        <a id="task1" href="/instructions-task1/" class="btn btn-secondary">Task #1</a>
      </p>

      <h2 class="pt-4 text-2xl font-bold">Запреты 🙅</h2>
      <p>
        Зачастую мы, конечно, хотим чтоб человек что-то <strong>НЕ</strong> делал.
        Для этого добавляем <code>do not</code> или (что чаще) краткую форму
        <code>don't</code>.
      </p>
      <ul class="space-y-2">
        <li><strong>Dig!</strong> — копай 🕳️</li>
        <li><strong>Don't dig</strong> — не копай! ❌🕳️</li>
        <li>🕺 — <strong>dance</strong></li>
        <li>❌🕺 — <strong>don't dance</strong></li>
      </ul>
      <p>
        <code>Don't</code> — слово маленькое, но с точки зрения произношения
        непростое для русскоговорящих. Часто его произносят как «донт».
      </p>
      <p>
        <strong>Во-первых:</strong> звук <em>/d/</em> — он звонкий напарник звука
        <em>/t/</em>, о котором мы говорили на прошлом уроке. То есть всё так же:
        язык к бугорочку, собираем энергию и высвобождаем её, но ещё и добавляем
        голос. В этом и вся разница между глухим и звонким звуком — включаешь ты
        голос или нет.
      </p>
      <p>
        <strong>Во-вторых,</strong> буква «o» даёт нам двойной звук — точно так же
        как мы произносим её в алфавите — <em>/oʊ/</em>.
      </p>
      <p class="font-medium">
        No, I know but don't go <span class="text-base-content/70">(Нет, я знаю,
        но не иди)</span>
      </p>
      <p>В этом странном предложении все буквы «o» произносятся одинаково.</p>
      <p>
        <strong>В-третьих,</strong> буква «t» в <code>don't</code> произносится
        менее энергично чем <em>/d/</em> — а зачастую в речи просто «съедается».
      </p>
      <p>
        Итак, с произношением закончили на сегодня. Главное запомнить, что это не
        «ленивый-переднеязычный», а очень энергичный-приподнято-язычный
        <em>/d/</em>. «Д» сына маминой подруги, так сказать. Не «донт» → «доунт», а
        точнее <em>/doʊnt/</em>.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Фразы 🔗</h2>
      <p>
        Исключая <code>zoom in/out</code> и <code>scroll up/down</code> —
        остальные глаголы из нашего списка обычно требуют уточнения: что конкретно
        открыть или закрыть. Например:
      </p>
      <p>
        <span id="task2" class="btn btn-secondary btn-disabled">Task #2 (скоро)</span>
      </p>
      <p>
        Также такую же простую структуру мы используем для создания git commit
        месседжей: «Сделай что-то» — <code>Fix bug</code> 😉
      </p>

      <h2 class="pt-4 text-2xl font-bold">Подача 😠🙂</h2>
      <p>
        Теперь давай поговорим о подаче инструкций. Главное правило: быть вежливым,
        ну или хотя бы казаться таковым. Например:
      </p>
      <p class="font-medium">Oleg, mute your mic!</p>
      <p>Это может звучать (да и звучит) грубо.</p>
      <p>
        Как вариант, можем добавить <code>please</code> в начале или в конце фразы:
      </p>
      <p class="font-medium">Oleg, mute your mic, please!</p>
      <p>
        Но от этого ваша инструкция не меняет форму. Предпочтительнее замаскировать
        вашу инструкцию под вопрос.
      </p>
      <ul class="space-y-2">
        <li>
          <strong>Oleg, can you mute your mic?</strong> — Олег, не можешь ли ты…
        </li>
        <li>
          <strong>Could you share your screen?</strong> — не мог бы ты…
        </li>
      </ul>
      <p>Можно и <code>please</code> докинуть в конце.</p>
      <p class="font-medium">Can you zoom in, please?</p>
      <p>
        Другой вариант, которым часто пользуются менеджеры — начать свою инструкцию
        с <code>Let's</code>. Это сокращение от <code>Let us</code> («позвольте
        нам»), но более точный перевод по духу — «А давайте-ка…».
      </p>
      <p>
        Если менеджер говорит <strong>Let's fix this bug today</strong> («А
        давайте-ка пофиксим этот баг сегодня») — он-то ничего с вами фиксить не
        будет. Это просто более вежливая форма для инструкции. В отличие от
        вопроса, это «авторитетный» вариант, так как не требует ответа.
      </p>
      <p>
        Но помните: в данном случае, <strong>КАК</strong> вы произносите что-то,
        гораздо важнее того, <strong>ЧТО</strong> вы произносите.
      </p>
      <p>
        Фраза «Turn on your camera, убл#%к, мать твою» с дружескими интонациями в
        голосе может звучать менее обидно, чем «Could you turn on your camera,
        please» с нотками раздражения и сарказма. Но это, конечно,
        общечеловеческое правило, работающее для всех языков.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Давайте подведём итог 📝</h2>
      <ul class="list-disc space-y-2 pl-6">
        <li>Дать инструкцию очень просто. Берём глагол и поехали.</li>
        <li>Если хотим чтоб что-то не делали — ставим <code>don't</code>.</li>
        <li>
          Хотим звучать более вежливо — превращаем в вопрос
          <code>can/could you</code>.
        </li>
        <li>Либо добавляем <code>Let's</code> для «смягчения» инструкции.</li>
      </ul>

      <h2 class="pt-4 text-2xl font-bold">Применение 💪</h2>
      <p>
        Проанализируй, какие фразы ты часто используешь на созвонах, и повтори их
        несколько раз (можешь прогнать через ИИшку, чтоб убедиться что всё
        правильно). Например:
      </p>
      <ul class="space-y-2">
        <li><strong>Can you open ticket 235?</strong></li>
        <li><strong>Can you select me in Jira?</strong></li>
        <li><strong>Let's talk about it after the call.</strong></li>
        <li><strong>Assign the ticket to me, please.</strong></li>
        <li><strong>Move the ticket to "Testing".</strong></li>
        <li><strong>Send the link in the chat, please.</strong></li>
      </ul>
      <p>
        Разговаривая на родном языке, мы не складываем речь из отдельных слов — мы
        оперируем смысловыми группами слов. Поэтому не ленимся запоминать вот такие
        фразы.
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
