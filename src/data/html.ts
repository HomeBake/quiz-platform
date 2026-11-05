import { C, H, LK, UL } from "./registry";
import { K } from "./helpers";
/* ===================== HTML ===================== */
const HD = "https://developer.mozilla.org/en-US/docs/Web/HTML/";
K("html", [
{
  id: "q-html-1",
  q: "Почему `<button>` предпочтительнее `<div onclick>` с `role=\"button\"`?",
  o: ["Нет разницы, это вопрос стиля", "У `<button>` из коробки есть фокус, активация клавишами Enter/Space, правильная роль и состояния для вспомогательных технологий; у `div` всё это нужно реализовывать вручную", "`<div>` нельзя кликать", "`<button>` быстрее рендерится"],
  a: 1,
  e: "Первое правило ARIA: если есть нативный элемент с нужной семантикой, используйте его. Нативный `button` даёт клавиатурную доступность, `disabled`, участие в форме и корректное объявление скринридером.",
  d: [
    H("Семантическая вёрстка и доступность"),
    UL(
      "**Ориентиры (landmarks)**: `header`, `nav`, `main` (один на страницу), `aside`, `footer`, `section` (с заголовком), `article` (самостоятельный блок). По ним пользователи скринридеров быстро перемещаются.",
      "**Заголовки** `h1`–`h6` задают структуру документа и не должны выбираться по размеру шрифта; уровни не пропускают.",
      "**Нативные элементы вместо `div`**: `button` для действий, `a href` для навигации, `input`/`select`/`textarea`, `ul/ol` для списков, `table` для таблиц.",
      "**Подписи**: у каждого поля формы должен быть `label` (`<label for=\"id\">` либо обёртка). `placeholder` не заменяет подпись.",
      "**Изображения**: `alt` описывает смысл; для декоративных картинок `alt=\"\"` (скринридер пропустит).",
      "**ARIA** дополняет, а не заменяет семантику: `aria-label`, `aria-labelledby`, `aria-expanded`, `aria-live` для динамических сообщений. Плохой ARIA хуже отсутствия ARIA.",
      "**Фокус**: видимый индикатор (`:focus-visible`), логичный порядок табуляции (без `tabindex` больше 0), управление фокусом в модальных окнах.",
      "**Язык**: `<html lang=\"ru\">` влияет на произношение и переносы."
    ),
    C(`<!-- плохо -->
<div class="btn" onclick="save()">Сохранить</div>

<!-- хорошо -->
<button type="button" onclick="save()">Сохранить</button>

<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" required>

<img src="chart.png" alt="Рост выручки с 2022 по 2025 год">
<img src="divider.svg" alt="">`),
    LK(["MDN: Semantic HTML", "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html"], ["MDN: ARIA", "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA"], ["WAI: ARIA Authoring Practices", "https://www.w3.org/WAI/ARIA/apg/"])
  ],
  v: [
    ["Какой элемент нужно использовать для перехода на другую страницу?", null, ["`<button>`", "`<a href>`", "`<div onclick>`", "`<span>`"], 1, "Ссылка даёт открытие в новой вкладке, контекстное меню и правильную роль `link`."],
    ["Как правильно обозначить декоративное изображение?", null, ["Без атрибута `alt`", "`alt=\"\"`", "`alt=\"image\"`", "`alt=\"картинка\"`"], 1, "Пустой `alt` говорит скринридеру, что изображение декоративное. Отсутствие `alt` приведёт к чтению имени файла."],
    ["Что верно про `placeholder`?", null, ["Заменяет `label`", "Не заменяет `label`: исчезает при вводе и плохо читается скринридерами", "Всегда доступен всем", "Нужен для валидации"], 1, "Подпись должна быть постоянной."],
    ["Сколько элементов `main` допускается на странице?", null, ["Любое количество", "Один видимый", "Два", "Ни одного"], 1, "`main` содержит основное содержимое страницы."],
    ["Что верно про ARIA?", null, ["Сначала нужно использовать нативные элементы", "ARIA делает элемент кликабельным сама по себе", "`aria-label` задаёт доступное имя", "`aria-live` помогает озвучивать динамические обновления", "`role=\"button\"` добавляет обработку клавиши Enter"], [0, 2, 3], "ARIA меняет только описание для вспомогательных технологий, но не поведение."],
    ["Зачем указывать `lang` у `<html>`?", null, ["Для SEO только", "Для правильного произношения скринридером, переносов и проверки орфографии", "Для включения перевода", "Это не влияет ни на что"], 1, "Атрибут также помогает браузерам предлагать перевод."]
  ]
},
{
  id: "q-html-2",
  q: "Чем отличаются `<\script defer>` и `<\script async>`?",
  o: ["Ничем", "`defer` загружается параллельно и выполняется после разбора документа (до `DOMContentLoaded`) в порядке подключения; `async` выполняется сразу после загрузки, в любом порядке, и может прервать разбор HTML", "`async` сохраняет порядок, `defer` нет", "`defer` блокирует разбор HTML"],
  a: 1,
  e: "Обычный `<\script>` блокирует разбор. `defer` и `async` загружаются параллельно. `defer` — для скриптов, зависящих от DOM и друг от друга; `async` — для независимых (аналитика). `type=\"module\"` по умолчанию ведёт себя как `defer`.",
  d: [
    H("Загрузка ресурсов и критический путь рендеринга"),
    UL(
      "**Обычный `<\script src>`**: останавливает разбор HTML до загрузки и выполнения.",
      "**`defer`**: загрузка параллельно, выполнение после разбора документа, **по порядку**, перед `DOMContentLoaded`.",
      "**`async`**: загрузка параллельно, выполнение сразу после загрузки (порядок не гарантируется).",
      "**`type=\"module\"`**: отложен по умолчанию; `async` на нём делает выполнение немедленным после загрузки.",
      "**CSS блокирует рендеринг** (браузер ждёт CSSOM), а также блокирует выполнение скриптов, идущих после него. Критический CSS можно встраивать, остальное загружать отдельно.",
      "**`<link rel=\"preload\">`** загружает ресурс с высоким приоритетом (шрифты — нужен `crossorigin`), **`prefetch`** — заранее для следующей навигации, **`preconnect`** — устанавливает соединение с другим origin, **`dns-prefetch`** — только DNS.",
      "**Шрифты**: `font-display: swap` избегает невидимого текста.",
      "**Метрики**: LCP (самый большой контент), INP (отзывчивость), CLS (смещение макета)."
    ),
    C(`<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/app.css">
  <\script src="/app.js" defer><\/script>
  <\script src="https://analytics.example.com/a.js" async><\/script>
</head>`),
    LK(["MDN: script", HD + "Reference/Elements/script"], ["web.dev: Critical rendering path", "https://web.dev/learn/performance/understanding-the-critical-path"], ["MDN: rel=preload", HD + "Reference/Attributes/rel/preload"])
  ],
  v: [
    ["Какой атрибут сохраняет порядок выполнения нескольких скриптов?", null, ["`async`", "`defer`", "Оба", "Ни один"], 1, "`defer`-скрипты выполняются в порядке следования в документе."],
    ["Когда выполняется `defer`-скрипт?", null, ["До начала разбора HTML", "После окончания разбора документа, перед `DOMContentLoaded`", "После `load` картинок", "Сразу после загрузки"], 1, "Поэтому он может безопасно обращаться к DOM."],
    ["Какой скрипт лучше подключать с `async`?", null, ["Зависящий от других скриптов", "Независимый, например, аналитика", "Код, который работает с DOM сразу", "Любой"], 1, "Порядок выполнения не гарантируется."],
    ["Как по умолчанию ведёт себя `<\script type=\"module\">`?", null, ["Как обычный блокирующий", "Как `defer`", "Как `async`", "Не выполняется"], 1, "Модули откладываются автоматически."],
    ["Что верно про CSS и рендеринг?", null, ["CSS блокирует рендеринг страницы", "`preload` загружает ресурс с высоким приоритетом", "`preconnect` устанавливает соединение с другим origin заранее", "Таблицы стилей никогда не влияют на скрипты", "Шрифты в `preload` требуют `crossorigin`"], [0, 1, 2, 4], "Таблица стилей перед скриптом задерживает его выполнение."],
    ["Что измеряет CLS?", null, ["Время ответа сервера", "Неожиданные смещения макета при загрузке", "Размер бандла", "Время до первого байта"], 1, "Чтобы снизить CLS, задавайте размеры изображений и резервируйте место."]
  ]
},
{
  id: "q-html-3",
  q: "Что произойдёт при нажатии на `<button>` без атрибута `type` внутри `<form>`?",
  o: ["Ничего", "Форма отправится: по умолчанию `type=\"submit\"`", "Форма сбросится", "Кнопка будет отключена"],
  a: 1,
  e: "Значение `type` по умолчанию у `button` — `submit`. Для кнопок, которые не должны отправлять форму, задают `type=\"button\"`. Это частая причина «внезапной» перезагрузки страницы.",
  d: [
    H("Формы: отправка, валидация и атрибуты"),
    UL(
      "**`type` кнопки**: `submit` (по умолчанию), `button`, `reset`.",
      "**Что попадает в отправку**: только поля с атрибутом `name` и не `disabled`. `readonly` поле отправляется, `disabled` — нет. Невыбранные чекбоксы и радиокнопки не отправляются.",
      "**Встроенная валидация**: `required`, `pattern`, `min`/`max`, `minlength`/`maxlength`, `type=\"email\"|\"url\"|\"number\"`, `step`. Событие `submit` не наступит, пока форма не пройдёт проверку (если нет `novalidate`). Состояние читается через `input.validity`, сообщение — через `setCustomValidity`.",
      "**Типы полей** подсказывают мобильную клавиатуру (`type=\"tel\"`, `inputmode=\"numeric\"`), а `autocomplete` (`email`, `one-time-code`, `current-password`) включает автозаполнение.",
      "**`FormData`**: `new FormData(form)` собирает значения; `Object.fromEntries(formData)` превращает в объект (повторяющиеся имена теряются).",
      "**`method` и `enctype`**: `GET` кладёт данные в URL, `POST` — в тело; для файлов нужен `multipart/form-data`.",
      "**Атрибут `form`** позволяет привязать элемент вне тега `<form>`; **`<fieldset>` и `<legend>`** группируют поля.",
      "**Контролируемые и неконтролируемые** поля в React отражают то же: значение живёт в DOM или в состоянии."
    ),
    C(`<form id="login" method="post" action="/login">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email">

  <label for="pwd">Пароль</label>
  <input id="pwd" name="password" type="password" minlength="8" required autocomplete="current-password">

  <button type="submit">Войти</button>
  <button type="button" id="toggle">Показать пароль</button>   <!-- не отправляет форму -->
</form>`),
    LK(["MDN: Client-side form validation", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation"], ["MDN: button", HD + "Reference/Elements/button"], ["MDN: FormData", "https://developer.mozilla.org/en-US/docs/Web/API/FormData"])
  ],
  v: [
    ["Какое значение `type` у `<button>` по умолчанию?", null, ["`button`", "`submit`", "`reset`", "Нет значения"], 1, "Поэтому в формах кнопкам-действиям пишут `type=\"button\"`."],
    ["Какие поля попадут в данные отправки?", null, ["Без `name`", "С `name` и без `disabled`", "Любые `readonly` без `name`", "Все поля"], 1, "Поле без `name` не отправляется."],
    ["Чем `readonly` отличается от `disabled`?", null, ["Ничем", "`readonly` отправляется с формой и фокусируется, `disabled` не отправляется и не фокусируется", "`disabled` отправляется", "`readonly` скрывает поле"], 1, "У `disabled` также нет событий нажатия."],
    ["Что делает `novalidate` у формы?", null, ["Отключает встроенную валидацию браузера при отправке", "Отключает JavaScript", "Запрещает отправку", "Включает серверную валидацию"], 0, "Тогда валидацию выполняет ваш код."],
    ["Какие утверждения верны?", null, ["`type=\"email\"` проверяет формат адреса в браузере", "Невыбранный чекбокс не попадает в `FormData`", "`autocomplete=\"one-time-code\"` помогает подставить код из SMS", "Поле `<input>` без `name` отправится на сервер", "Для загрузки файлов нужно `enctype=\"multipart/form-data\"`"], [0, 1, 2, 4], "Без `name` данные не отправляются."],
    ["Как привязать кнопку вне формы к форме с `id=\"login\"`?", null, ["Нельзя", "`<button form=\"login\">`", "`<button for=\"login\">`", "`<button target=\"login\">`"], 1, "Атрибут `form` принимает `id` формы."]
  ]
},
{
  id: "q-html-4",
  q: "Как адаптивные изображения и ленивая загрузка влияют на производительность, и почему LCP-картинку нельзя загружать с `loading=\"lazy\"`?",
  o: ["Ленивая загрузка всегда ускоряет любую картинку", "`srcset`/`sizes` дают браузеру выбрать подходящий размер, `lazy` откладывает загрузку изображений вне экрана; но главное изображение первого экрана (LCP) должно грузиться сразу, иначе LCP ухудшится", "`lazy` блокирует рендеринг", "`srcset` скачивает все варианты"],
  a: 1,
  e: "Ленивая загрузка предназначена для изображений вне первого экрана. Для LCP-изображения используют обычную загрузку и `fetchpriority=\"high\"`. Атрибуты `width`/`height` резервируют место и защищают от смещения (CLS).",
  d: [
    H("Изображения и медиа"),
    C(`<img
  src="/img/hero-800.jpg"
  srcset="/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1600.jpg 1600w"
  sizes="(min-width: 1024px) 50vw, 100vw"
  width="1600" height="900"
  alt="Команда в офисе"
  fetchpriority="high">

<picture>
  <source type="image/avif" srcset="/img/a.avif">
  <source type="image/webp" srcset="/img/a.webp">
  <img src="/img/a.jpg" alt="..." loading="lazy" decoding="async" width="600" height="400">
</picture>`),
    UL(
      "**`srcset` + `sizes`**: браузер сам выбирает файл исходя из ширины слота и плотности пикселей. `w`-дескрипторы нужны вместе с `sizes`.",
      "**`<picture>`**: подмена формата (AVIF/WebP/JPEG) или разные кадры (art direction) по медиазапросам.",
      "**`loading=\"lazy\"`**: загрузка при приближении к области просмотра; не применять к изображению первого экрана.",
      "**`width`/`height`**: браузер вычисляет `aspect-ratio` до загрузки, макет не прыгает (CLS). В CSS обычно `max-width: 100%; height: auto`.",
      "**`fetchpriority=\"high\"`** для LCP-изображения, **`decoding=\"async\"`** для декодирования без блокировки.",
      "**SVG** для иконок и иллюстраций; встроенный SVG стилизуется CSS, `img` с SVG — нет.",
      "**Видео**: `preload`, `poster`, `playsinline`, `muted autoplay` (автовоспроизведение со звуком блокируется браузерами).",
      "**Next.js `next/image`** автоматизирует `srcset`, форматы и ленивую загрузку (`priority` для LCP)."
    ),
    LK(["MDN: Responsive images", "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images"], ["web.dev: Optimize LCP", "https://web.dev/articles/optimize-lcp"], ["MDN: img loading", HD + "Reference/Elements/img#loading"])
  ],
  v: [
    ["К какому изображению не стоит применять `loading=\"lazy\"`?", null, ["Картинки в конце страницы", "Главное изображение первого экрана (LCP)", "Картинки в карточках внизу", "Иконки в футере"], 1, "Отложенная загрузка ухудшит LCP."],
    ["Зачем указывать `width` и `height` у `<img>`?", null, ["Для SEO", "Чтобы браузер заранее зарезервировал место и не было сдвига макета (CLS)", "Чтобы отключить кеш", "Для сжатия"], 1, "Современные браузеры используют их для вычисления `aspect-ratio`."],
    ["Для чего нужен `sizes`?", null, ["Для размера файла", "Чтобы сообщить браузеру ширину слота картинки при выборе из `srcset`", "Для границ", "Для высоты"], 1, "Без `sizes` браузер предполагает 100vw."],
    ["Какой элемент позволяет отдать AVIF с запасным вариантом JPEG?", null, ["`<picture>` с `<source type>`", "`<img srcset>` без типов", "`<object>`", "`<canvas>`"], 0, "Браузер выбирает первый подходящий формат."],
    ["Что верно?", null, ["`fetchpriority=\"high\"` повышает приоритет загрузки", "`decoding=\"async\"` разрешает декодировать без блокировки", "Автовоспроизведение видео со звуком обычно блокируется", "`lazy` ускоряет LCP", "`w`-дескрипторы в `srcset` используются вместе с `sizes`"], [0, 1, 2, 4], "Ленивая загрузка LCP-картинки вредит."],
    ["Чем встроенный `<svg>` отличается от `<img src=\"a.svg\">`?", null, ["Ничем", "Встроенный SVG стилизуется CSS и скриптами, а `img` — как растровая картинка", "`img` быстрее всегда", "SVG нельзя встроить"], 1, "Зато `img` кешируется как отдельный файл."]
  ]
},
{
  id: "q-html-5",
  q: "Какие преимущества у нативного `<dialog>` с `showModal()` по сравнению с самодельной модалкой?",
  o: ["Никаких", "Встроенные поведения: верхний слой (top layer), `::backdrop`, блокировка остальной страницы (inert), ловушка фокуса, закрытие по Esc, возврат фокуса", "Только красивее", "Он работает только в Chrome"],
  a: 1,
  e: "`showModal()` помещает диалог в top layer и делает остальной документ неинтерактивным. `show()` открывает немодальный диалог. Закрытие — `close()` или форма с `method=\"dialog\"`.",
  d: [
    H("Современные нативные элементы и API"),
    C(`<dialog id="dlg">
  <form method="dialog">
    <h2>Удалить?</h2>
    <button value="cancel">Отмена</button>
    <button value="ok">Удалить</button>
  </form>
</dialog>
<\script>
  dlg.addEventListener("close", () => console.log(dlg.returnValue));
  openBtn.onclick = () => dlg.showModal();
<\/script>

<details name="faq"><summary>Вопрос</summary>Ответ</details>
<button popovertarget="menu">Меню</button>
<div id="menu" popover>...</div>`),
    UL(
      "**`<dialog>`**: `showModal()` (модальное, `::backdrop`, Esc закрывает), `show()` (немодальное), `close(returnValue)`.",
      "**`<details>`/`<summary>`**: раскрывающийся блок без JavaScript; атрибут `name` объединяет в «аккордеон».",
      "**Атрибут `popover`**: всплывающие панели в top layer с закрытием по клику снаружи и Esc; управление через `popovertarget`.",
      "**`inert`**: отключает фокус и взаимодействие с поддеревом (полезно при модальных окнах).",
      "**`<template>`** хранит неотрисованную разметку для клонирования; **Custom Elements** и **Shadow DOM** — основа веб-компонентов.",
      "**`DOCTYPE`**: `<!DOCTYPE html>` включает стандартный режим; без него — режим совместимости (quirks mode) со странной раскладкой.",
      "**Пользовательские атрибуты `data-…`** доступны через `element.dataset` (`data-user-id` → `dataset.userId`).",
      "**`<meta charset>`** должен быть в первых 1024 байтах документа; **`<meta name=\"viewport\">`** нужен для адаптивности на мобильных.",
      "**Хранилища**: `localStorage` (постоянное, синхронное, ~5 МБ), `sessionStorage` (на вкладку), cookies (отправляются с запросами), IndexedDB (асинхронное, большие объёмы)."
    ),
    LK(["MDN: dialog", HD + "Reference/Elements/dialog"], ["MDN: Popover API", "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API"], ["MDN: inert", HD + "Reference/Global_attributes/inert"])
  ],
  v: [
    ["Какой метод открывает диалог как модальный?", null, ["`dialog.show()`", "`dialog.showModal()`", "`dialog.open()`", "`dialog.popup()`"], 1, "`show()` открывает немодальный диалог."],
    ["Как закрыть `<dialog>` без JavaScript?", null, ["Нельзя", "Кнопкой внутри `<form method=\"dialog\">`", "Атрибутом `autoclose`", "Ссылкой `#close`"], 1, "Форма закрывает диалог и записывает `value` кнопки в `returnValue`."],
    ["Что делает `<!DOCTYPE html>`?", null, ["Подключает стили", "Включает стандартный режим рендеринга (без режима совместимости)", "Задаёт кодировку", "Включает HTTPS"], 1, "Без него браузер работает в quirks mode."],
    ["Как в JavaScript прочитать `data-user-id`?", null, ["`el.dataset.userId`", "`el.data.userId`", "`el.dataset['user-id']`", "`el.getData('userId')`"], 0, "Дефисы превращаются в camelCase."],
    ["Какие утверждения верны?", null, ["`inert` отключает взаимодействие с поддеревом", "`popover` закрывается по Esc и клику снаружи", "`localStorage` синхронный", "`sessionStorage` общий для всех вкладок", "`<details>` работает без JavaScript"], [0, 1, 2, 4], "`sessionStorage` изолирован по вкладкам."],
    ["Для чего нужен `<template>`?", null, ["Для вывода на экран", "Для хранения неотрисованной разметки, которую можно клонировать скриптом", "Для SEO", "Для стилей"], 1, "Содержимое не рендерится и не загружает ресурсы, пока не вставлено в документ."]
  ]
},
]);

/* ===================== HTML, часть 2 ===================== */
K("html", [
{
  id: "q-html-6",
  q: "Какие семантические элементы и ландмарки нужны странице и как они помогают доступности и SEO?",
  o: ["Достаточно `div` с классами, браузер всё поймёт", "`header`, `nav`, `main`, `article`, `section`, `aside`, `footer` задают структуру и ландмарки для скринридеров и поисковиков; на странице один `main`", "Семантика нужна только для стилей", "Заголовки `h1`–`h6` можно выбирать по размеру шрифта"],
  a: 1,
  e: "Скринридеры позволяют переходить по ландмаркам и заголовкам. Заголовки образуют иерархию (не пропускать уровни и не использовать их ради размера). Элементы вроде `nav` и `main` дают роль без ARIA.",
  d: [
    H("Семантическая разметка"),
    C(`<body>
  <header><nav aria-label="Основная навигация">…</nav></header>
  <main>
    <h1>Заголовок страницы</h1>
    <article>
      <h2>Статья</h2>
      <p>…</p>
      <figure><img src="a.jpg" alt="График продаж"><figcaption>Продажи за 2026</figcaption></figure>
    </article>
    <aside aria-label="Связанное">…</aside>
  </main>
  <footer>…</footer>
</body>`),
    UL(
      "**Первое правило ARIA**: если есть нативный элемент с нужной семантикой — используйте его.",
      "**`section`** без названия не создаёт ландмарк; ландмарком он становится с `aria-label`/`aria-labelledby`.",
      "**Списки** (`ul/ol/dl`), таблицы (`th`, `scope`, `caption`) несут структуру для ассистивных технологий.",
      "**`alt`**: информативный текст для смысловых картинок и пустой `alt=\"\"` для декоративных.",
      "**`time`**, **`address`**, **`mark`**, **`abbr`** добавляют значение.",
      "**Skip link** («Перейти к содержимому») помогает клавиатурным пользователям."
    ),
    LK(["Semantic HTML", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_text_fundamentals"], ["ARIA landmarks", "https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/"])
  ],
  v: [
    ["Сколько `<main>` должно быть на странице?", null, ["Один видимый", "Сколько угодно", "Не менее двух", "Ни одного"], 0, "Основное содержимое одно."],
    ["Какой `alt` у декоративной картинки?", null, ["Пустой `alt=\"\"`", "Без атрибута", "`alt=\"image\"`", "Имя файла"], 0, "Скринридер пропустит её."],
    ["Когда `section` становится ландмарком?", null, ["Когда у него есть доступное имя", "Всегда", "Никогда", "Если он внутри `main`"], 0, "Например, `aria-label`."],
    ["Какое правило ARIA главное?", null, ["Использовать нативный элемент, если он есть", "Добавлять роль к каждому элементу", "Избегать `button`", "Использовать `div` везде"], 0, "Нативная семантика надёжнее."],
    ["Зачем нужен skip link?", null, ["Быстро перейти к основному содержимому с клавиатуры", "Для SEO", "Для скорости", "Для печати"], 0, "Пропускает повторяющуюся навигацию."],
    ["Можно ли выбирать `h3` вместо `h1` ради меньшего шрифта?", null, ["Нет, размер задают CSS, а уровень — структура", "Да", "Только в `footer`", "Только мобильных"], 0, "Иерархия важна для навигации."]
  ]
},
{
  id: "q-html-7",
  q: "Какие типы `input` и атрибуты валидации есть в HTML, и как связать `label` с полем?",
  o: ["`label` нужен только для вёрстки", "`<label for>` или вложенный `label` даёт имя и расширяет область клика; `type`, `required`, `pattern`, `min/max`, `autocomplete` включают нативную валидацию и подсказки", "Атрибут `placeholder` заменяет `label`", "Валидация в HTML работает только после JS"],
  a: 1,
  e: "Нативные ограничения дают мгновенную проверку и корректную клавиатуру на мобильных. Но клиентская валидация не защищает: сервер проверяет всё заново.",
  d: [
    H("Формы"),
    C(`<form>
  <label for="email">Почта</label>
  <input id="email" name="email" type="email" required autocomplete="email" inputmode="email">

  <label>Возраст <input type="number" name="age" min="18" max="120"></label>

  <input type="text" name="zip" pattern="[0-9]{6}" title="6 цифр">
  <button>Отправить</button>
</form>`),
    UL(
      "**`autocomplete`** помогает менеджерам паролей и автозаполнению (`one-time-code`, `new-password`).",
      "**`inputmode`** и `type` определяют экранную клавиатуру.",
      "**Constraint Validation API**: `input.validity`, `setCustomValidity()`, `form.checkValidity()`, событие `invalid`.",
      "**`novalidate`** на форме отключает нативные подсказки, когда проверка выполняется своим кодом.",
      "**Ошибки**: связать через `aria-describedby` и `aria-invalid`.",
      "**`fieldset`/`legend`** группируют связанные поля (радио)."
    ),
    LK(["Client-side form validation", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation"], ["autocomplete", "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete"])
  ],
  v: [
    ["Как связать `label` с полем?", null, ["Атрибут `for` с id поля или вложение", "Классом", "Рядом в DOM", "Через `name`"], 0, "Клик по label фокусирует поле."],
    ["Заменяет ли `placeholder` `label`?", null, ["Нет", "Да", "Только на мобильных", "Только для email"], 0, "Он исчезает при вводе и плохо доступен."],
    ["Для чего `autocomplete=\"one-time-code\"`?", null, ["Подсказка для автозаполнения кодов из SMS", "Отключает кеш", "Скрывает поле", "Включает пароль"], 0, "Улучшает UX."],
    ["Как задать кастомное сообщение валидации?", null, ["`input.setCustomValidity(msg)`", "`input.error = msg`", "`alert`", "`input.title`"], 0, "Пустая строка снимает ошибку."],
    ["Что делает `novalidate`?", null, ["Отключает нативную валидацию при отправке", "Включает серверную проверку", "Удаляет форму", "Блокирует отправку"], 0, "Свою проверку делает код."],
    ["Достаточно ли клиентской валидации?", null, ["Нет, сервер должен проверять данные", "Да", "Только для email", "Только с `pattern`"], 0, "Клиент можно обойти."]
  ]
},
{
  id: "q-html-8",
  q: "Что такое ARIA и когда нужны `role`, `aria-label`, `aria-live`, `aria-expanded`? Как управлять фокусом в модалке и меню?",
  o: ["ARIA добавляет новое поведение элементам автоматически", "ARIA только описывает семантику и состояние для ассистивных технологий, поведение (клавиатура, фокус) нужно реализовать самому", "Атрибуты ARIA нужны каждому элементу", "ARIA заменяет `alt`"],
  a: 1,
  e: "`role=\"button\"` не делает `div` кликабельным или фокусируемым. `aria-expanded` сообщает состояние, но менять его должен ваш код. `aria-live` объявляет динамические сообщения. Для модалки нужны ловушка фокуса, возврат фокуса и закрытие по Esc.",
  d: [
    H("ARIA и фокус"),
    C(`<button aria-expanded="false" aria-controls="menu" id="b">Меню</button>
<ul id="menu" hidden>…</ul>

<div role="status" aria-live="polite">Сохранено</div>

<\script>
b.addEventListener("click", () => {
  const open = b.getAttribute("aria-expanded") === "true";
  b.setAttribute("aria-expanded", String(!open));
  menu.hidden = open;
});
<\/script>`),
    UL(
      "**`aria-label` / `aria-labelledby`** задают имя; **`aria-describedby`** — описание.",
      "**`aria-live`**: `polite` — после завершения речи, `assertive` — немедленно (для критичных ошибок).",
      "**`aria-hidden=\"true\"`** скрывает от ассистивных технологий, но не от глаз; не ставить на фокусируемые элементы.",
      "**Фокус в модалке**: переместить внутрь при открытии, удерживать (focus trap) или использовать `<dialog>`/`inert` на остальном содержимом, вернуть на триггер при закрытии.",
      "**`tabindex`**: `0` — в порядок табуляции, `-1` — программный фокус, положительные значения не использовать.",
      "**Контраст**: не менее 4.5:1 для обычного текста по WCAG AA."
    ),
    LK(["ARIA Authoring Practices", "https://www.w3.org/WAI/ARIA/apg/"], ["MDN: ARIA", "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA"])
  ],
  v: [
    ["Делает ли `role=\"button\"` элемент фокусируемым?", null, ["Нет", "Да", "Только `div`", "Только с `href`"], 0, "Нужен `tabindex` и обработка клавиш."],
    ["Какое значение `aria-live` для некритичных обновлений?", null, ["`polite`", "`assertive`", "`off` всегда", "`strong`"], 0, "Не прерывает речь."],
    ["Что сообщает `aria-expanded`?", null, ["Раскрыт ли управляемый элемент", "Размер", "Видимость кнопки", "Язык"], 0, "Значение нужно обновлять в коде."],
    ["Куда возвращают фокус после закрытия модалки?", null, ["На элемент, открывший её", "В начало страницы", "На `body`", "Никуда"], 0, "Сохраняется контекст пользователя."],
    ["Почему не стоит использовать положительный `tabindex`?", null, ["Он ломает естественный порядок табуляции", "Он медленный", "Он устарел в CSS", "Он скрывает элемент"], 0, "Порядок задаёт DOM."],
    ["Какой минимальный контраст по WCAG AA для обычного текста?", null, ["4.5:1", "2:1", "3.5:1", "10:1"], 0, "Для крупного текста — 3:1."]
  ]
},
{
  id: "q-html-9",
  q: "Какие `<meta>` и `<link>` важны в `<head>` (viewport, charset, canonical, Open Graph, `rel=preload/preconnect`)?",
  o: ["`<head>` не влияет на поведение страницы", "Нужны `charset`, `viewport`, `title`, `description`, `canonical`, OG-теги для превью, а `preconnect/preload/prefetch` управляют загрузкой ресурсов", "`preload` загружает любой ресурс как можно позже", "`canonical` ускоряет рендер"],
  a: 1,
  e: "`<meta charset>` должен быть в первых 1024 байтах. `viewport` нужен для мобильной вёрстки. `canonical` указывает основной URL при дублях. `preload` — ресурс, нужный на этой странице; `prefetch` — вероятный на следующей; `preconnect` — ранняя установка соединения.",
  d: [
    H("Head"),
    C(`<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Каталог — Магазин</title>
<meta name="description" content="Каталог товаров…">
<link rel="canonical" href="https://example.com/catalog">
<meta property="og:title" content="Каталог">
<meta property="og:image" content="https://example.com/og.png">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">`),
    UL(
      "**`preload` шрифтов** требует `crossorigin` даже для того же origin.",
      "**`rel=modulepreload`** для ES-модулей.",
      "**`fetchpriority=\"high\"`** у LCP-картинки.",
      "**`robots`**: `noindex` исключает страницу из индекса; `robots.txt` лишь управляет обходом.",
      "**`theme-color`**, **`color-scheme`** влияют на интерфейс браузера и формы.",
      "**`hreflang`** связывает языковые версии."
    ),
    LK(["Preload", "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload"], ["Open Graph", "https://ogp.me/"])
  ],
  v: [
    ["Для чего `rel=preconnect`?", null, ["Заранее открыть соединение с хостом", "Загрузить страницу", "Кешировать HTML", "Сжать трафик"], 0, "DNS, TCP и TLS заранее."],
    ["Чем `preload` отличается от `prefetch`?", null, ["Preload — для текущей страницы, prefetch — для будущей", "Ничем", "Prefetch блокирует рендер", "Preload только для картинок"], 0, "Приоритеты различаются."],
    ["Зачем `canonical`?", null, ["Указать основной URL среди дублей", "Ускорить загрузку", "Отключить индексацию", "Сменить язык"], 0, "Для поисковиков."],
    ["Что нужно при `preload` шрифта?", null, ["`crossorigin`", "`defer`", "`async`", "`integrity`"], 0, "Шрифты загружаются в CORS-режиме."],
    ["Что делает `noindex`?", null, ["Просит не включать страницу в поисковый индекс", "Блокирует доступ", "Ускоряет", "Удаляет страницу"], 0, "Это не защита."],
    ["Где должен находиться `<meta charset>`?", null, ["Среди первых 1024 байтов документа", "В конце `body`", "В CSS", "В заголовке JS"], 0, "Иначе браузер может угадать кодировку."]
  ]
},
{
  id: "q-html-10",
  q: "Как работает критический путь рендеринга: от HTML до первого кадра, и что блокирует рендер?",
  o: ["Браузер сразу рисует страницу, не дожидаясь CSS", "HTML → DOM, CSS → CSSOM, вместе → render tree → layout → paint → composite; CSS блокирует рендер, синхронный JS блокирует разбор HTML", "JavaScript никогда не блокирует разбор", "CSSOM строится после отрисовки"],
  a: 1,
  e: "Таблицы стилей блокируют отрисовку (чтобы не было «вспышки» без стилей), а синхронные скрипты останавливают парсер, поэтому их выносят вниз, откладывают `defer`/`async` или грузят как модули.",
  d: [
    H("Critical rendering path"),
    UL(
      "**DOM** строится потоково по мере получения HTML; **CSSOM** — из всех таблиц стилей.",
      "**Render tree** содержит только видимые узлы (`display: none` в него не попадает).",
      "**Layout (reflow)** вычисляет геометрию, **paint** рисует слои, **composite** собирает их.",
      "**Preload scanner** заранее находит ресурсы в разметке, но не видит те, что подставляются JS.",
      "**Метрики**: FCP, LCP, CLS, INP, TTFB.",
      "**Как ускорить**: критический CSS, `defer`, сжатие, кеш, CDN, HTTP/2–3, `fetchpriority`, ленивая загрузка вне экрана, размеры у медиа.",
      "**`content-visibility: auto`** откладывает рендер невидимых секций."
    ),
    C(`<link rel="stylesheet" href="/app.css">     <\!-- блокирует рендер -->
<\script src="/vendor.js"><\/script>              <\!-- блокирует парсер -->
<\script src="/app.js" defer><\/script>           <\!-- не блокирует -->`),
    LK(["Critical rendering path", "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path"], ["Core Web Vitals", "https://web.dev/articles/vitals"])
  ],
  v: [
    ["Что блокирует отрисовку?", null, ["CSS в `<head>`", "Атрибут `alt`", "Комментарии", "Мета-теги"], 0, "Без стилей рендер не начинается."],
    ["Что блокирует парсинг HTML?", null, ["Синхронный `<\script>` без атрибутов", "`defer`-скрипт", "`async`-скрипт", "Картинка"], 0, "Парсер ждёт загрузки и исполнения."],
    ["Какие узлы попадают в render tree?", null, ["Только видимые", "Все узлы DOM", "Только текст", "Только блоки"], 0, "Узлы с `display: none` не попадают."],
    ["Что делает layout?", null, ["Вычисляет размеры и позиции", "Рисует пиксели", "Загружает сеть", "Парсит JS"], 0, "Затем идёт paint."],
    ["Что видит preload scanner?", null, ["Ресурсы, явно указанные в разметке", "Ресурсы, созданные в JS", "Только CSS", "Только шрифты"], 0, "Динамические подключения он пропускает."],
    ["Что такое LCP?", null, ["Время отрисовки самого крупного элемента", "Задержка ввода", "Накопленный сдвиг", "Время ответа сервера"], 0, "Основная метрика загрузки."]
  ]
},
{
  id: "q-html-11",
  q: "Какие есть способы хранения на клиенте (cookies, `localStorage`, `sessionStorage`, IndexedDB) и чем они отличаются по безопасности?",
  o: ["Все хранилища одинаково безопасны и общие для всех сайтов", "Cookies уходят на сервер и имеют флаги (`HttpOnly`, `Secure`, `SameSite`), Web Storage синхронный и доступен JS, IndexedDB — асинхронное хранилище больших структур", "`localStorage` защищён от XSS", "`sessionStorage` общее для всех вкладок"],
  a: 1,
  e: "Данные в `localStorage` читаются любым скриптом страницы, поэтому токены доступа уязвимы к XSS. `HttpOnly` cookie недоступна JS, а `SameSite` снижает риск CSRF. `sessionStorage` живёт в рамках вкладки.",
  d: [
    H("Хранилища"),
    C(`localStorage.setItem("theme", "dark");           // синхронно, строки, ~5 МБ
sessionStorage.setItem("draft", text);            // до закрытия вкладки
document.cookie = "a=1; Max-Age=3600; Secure; SameSite=Lax";  // HttpOnly из JS не поставить

// Set-Cookie от сервера
// Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`),
    UL(
      "**Cookies**: ~4 КБ, отправляются с каждым запросом домена, поэтому раздувают трафик.",
      "**Web Storage**: синхронный API блокирует основной поток; не доступен в Web Worker.",
      "**IndexedDB**: асинхронный, транзакционный, хранит объекты и Blob; удобно через обёртки (idb).",
      "**Cache Storage / Service Worker** — офлайн и кеш запросов.",
      "**Изоляция по origin**: схема + хост + порт.",
      "**Квоты и приватный режим**: запись может бросать `QuotaExceededError` — оборачивайте в `try/catch`."
    ),
    LK(["Web Storage API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API"], ["Cookies", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies"])
  ],
  v: [
    ["Кто может прочитать `HttpOnly` cookie?", null, ["Только сервер (браузер отправляет её с запросами)", "Любой JS", "Только расширения", "Никто"], 0, "JS её не видит."],
    ["Какой флаг снижает риск CSRF?", null, ["`SameSite`", "`HttpOnly`", "`Path`", "`Domain`"], 0, "Ограничивает отправку при кросс-сайтовых запросах."],
    ["Живёт ли `sessionStorage` между вкладками?", null, ["Нет, у каждой вкладки свой", "Да", "Только в Chrome", "Только для одного домена"], 0, "Данные удаляются с закрытием вкладки."],
    ["Какое хранилище асинхронно?", null, ["IndexedDB", "`localStorage`", "`sessionStorage`", "Cookies"], 0, "Не блокирует основной поток."],
    ["Почему токены нежелательно хранить в `localStorage`?", null, ["Их может прочитать XSS-скрипт", "Они сжимаются", "Они удаляются при загрузке", "Это запрещено стандартом"], 0, "Нет защиты от скриптов страницы."],
    ["Что может бросить `localStorage.setItem`?", null, ["`QuotaExceededError`", "`TypeError` всегда", "`SyntaxError`", "Ничего"], 0, "Например, при переполнении или в приватном режиме."]
  ]
},
{
  id: "q-html-12",
  q: "Как безопасно встраивать содержимое: `iframe` с `sandbox`, `rel=\"noopener\"`, CSP и защита от XSS?",
  o: ["Достаточно `<iframe src>` без дополнительных атрибутов", "`sandbox` ограничивает iframe, `rel=noopener` отрывает связь с `window.opener`, CSP ограничивает источники скриптов, а вывод пользовательских данных экранируется", "CSP делает XSS невозможным без других мер", "`target=\"_blank\"` всегда безопасен"],
  a: 1,
  e: "Современные браузеры по умолчанию дают `noopener` для `_blank`, но явная запись не повредит. XSS закрывают экранированием по контексту, санитайзером (DOMPurify, Trusted Types) и CSP как дополнительным слоем.",
  d: [
    H("Безопасность HTML"),
    C(`<iframe src="https://widget.example" sandbox="allow-scripts" referrerpolicy="no-referrer" loading="lazy" title="Виджет"></iframe>
<a href="https://ext.com" target="_blank" rel="noopener noreferrer">Ссылка</a>

<\!-- заголовок -->
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; frame-ancestors 'none'`),
    UL(
      "**React экранирует** строки в JSX; опасны `dangerouslySetInnerHTML`, `href=\"javascript:…\"` и вставка в `innerHTML`.",
      "**`frame-ancestors`** / `X-Frame-Options` защищают от кликджекинга.",
      "**Subresource Integrity (`integrity`)** проверяет хеш внешнего скрипта.",
      "**Trusted Types** запрещают небезопасные присваивания в DOM sink’и.",
      "**`allow-same-origin` + `allow-scripts`** вместе в sandbox позволяют скрипту снять ограничения для своего origin.",
      "**CORS** — не защита от атакующего, а разрешение для чтения ответов другим origin."
    ),
    LK(["Content Security Policy", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP"], ["iframe sandbox", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox"])
  ],
  v: [
    ["Что делает `sandbox` без значений?", null, ["Накладывает максимальные ограничения на iframe", "Ничего", "Разрешает всё", "Отключает показ"], 0, "Разрешения добавляют по списку."],
    ["От чего защищает `rel=noopener`?", null, ["От доступа к `window.opener` из открытой страницы", "От XSS", "От CSRF", "От кеша"], 0, "Предотвращает reverse tabnabbing."],
    ["Что опасно в React?", null, ["`dangerouslySetInnerHTML` с пользовательским HTML", "Интерполяция строки в JSX", "Пропсы", "Ключи"], 0, "Нужен санитайзер."],
    ["Для чего нужен `frame-ancestors`?", null, ["Запретить встраивание страницы в чужие фреймы", "Разрешить скрипты", "Подключить шрифты", "Сменить кодировку"], 0, "Защита от кликджекинга."],
    ["Заменяет ли CSP экранирование?", null, ["Нет, это дополнительный слой", "Да", "Только для inline-скриптов", "Только в React"], 0, "Основа — безопасный вывод данных."],
    ["Что проверяет атрибут `integrity`?", null, ["Хеш загруженного ресурса", "Размер файла", "Время загрузки", "Кодировку"], 0, "Subresource Integrity."]
  ]
},
{
  id: "q-html-13",
  q: "Что такое Web Components (Custom Elements, Shadow DOM, `<template>`/`<slot>`) и когда они уместны рядом с React?",
  o: ["Это альтернативное название React-компонентов", "Нативный набор: Custom Elements регистрируют теги, Shadow DOM изолирует DOM и стили, `template/slot` описывают разметку и проекцию содержимого", "Shadow DOM виден глобальным CSS-селекторам", "Web Components работают только в Chrome"],
  a: 1,
  e: "Web Components независимы от фреймворков и хорошо подходят для дизайн-систем и виджетов, встраиваемых в разные приложения. Нюансы: передача объектов через свойства, события и SSR.",
  d: [
    H("Web Components"),
    C(`class UserCard extends HTMLElement {
  static observedAttributes = ["name"];
  connectedCallback() {
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>b{color:teal}</style><b></b><slot></slot>";
    this.render();
  }
  attributeChangedCallback() { this.render(); }
  render() { this.shadowRoot && (this.shadowRoot.querySelector("b").textContent = this.getAttribute("name")); }
}
customElements.define("user-card", UserCard);   // имя обязательно с дефисом`),
    UL(
      "**Жизненный цикл**: `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`.",
      "**CSS изолирован** от страницы, но наследуются свойства вроде `color`, а кастомизация идёт через CSS-переменные, `::part()` и `::slotted()`.",
      "**События** из Shadow DOM всплывают; для выхода за границу нужен `composed: true`.",
      "**React и custom elements**: свойства/события в React 19 поддерживаются нативно, ранее приходилось использовать `ref`.",
      "**Lit** — лёгкая библиотека для написания таких компонентов."
    ),
    LK(["Web Components", "https://developer.mozilla.org/en-US/docs/Web/API/Web_components"], ["Lit", "https://lit.dev/"])
  ],
  v: [
    ["Каким должно быть имя custom element?", null, ["Содержать дефис", "Начинаться с цифры", "В верхнем регистре", "Без символов"], 0, "Например, `user-card`."],
    ["Что изолирует Shadow DOM?", null, ["DOM и стили компонента", "Сеть", "JS-переменные", "Cookies"], 0, "Внешний CSS не проникает внутрь."],
    ["Для чего `<slot>`?", null, ["Проецировать содержимое снаружи внутрь компонента", "Хранить данные", "Делать запросы", "Подключать стили"], 0, "Аналог children."],
    ["Как стилизовать часть Shadow DOM снаружи?", null, ["`::part()` и CSS-переменные", "Любым селектором потомка", "Через `!important`", "Нельзя"], 0, "Автор компонента выставляет части."],
    ["Что нужно событию, чтобы выйти из Shadow DOM?", null, ["`composed: true`", "`passive: true`", "`once: true`", "`capture: true`"], 0, "И `bubbles: true` для всплытия."],
    ["Где уместны Web Components?", null, ["Дизайн-системы и виджеты для разных фреймворков", "Только SSR", "Только игры", "Только email"], 0, "Они не привязаны к React."]
  ]
},
{
  id: "q-html-14",
  q: "Как работают `<template>`, `data-*`, `contenteditable`, `hidden`, `inert` и `popover`? Приведите примеры применения.",
  o: ["Это устаревшие атрибуты без применения", "`template` хранит неактивную разметку, `data-*` — пользовательские данные, `hidden` скрывает, `inert` отключает взаимодействие, `popover` даёт нативные всплывающие слои", "`inert` скрывает элемент визуально", "`hidden` не влияет на доступность"],
  a: 1,
  e: "`inert` делает поддерево недоступным для фокуса, кликов и ассистивных технологий, поэтому им закрывают фон за модалкой. `popover` с `popovertarget` открывает подсказки и меню без JS и сам обрабатывает Esc и закрытие по клику снаружи.",
  d: [
    H("Современные атрибуты"),
    C(`<button popovertarget="tip">Подсказка</button>
<div id="tip" popover>Нативный popover</div>

<main inert>…фон под модалкой…</main>

<template id="row"><tr><td class="name"></td></tr></template>
<\script>
  const node = row.content.cloneNode(true);
  node.querySelector(".name").textContent = "Ada";
  tbody.append(node);
  el.dataset.userId = "7";      // data-user-id
<\/script>`),
    UL(
      "**`dataset`** преобразует `data-user-id` в `dataset.userId`; значения всегда строки.",
      "**`hidden=\"until-found\"`** разрешает поиск по странице внутри скрытого блока.",
      "**`<details>/<summary>`** — нативный аккордеон.",
      "**`contenteditable`** редактирует элемент, но вставка HTML и undo ведут себя неоднородно; для сложных редакторов берут ProseMirror/Lexical/Tiptap.",
      "**`loading=\"lazy\"`**, **`decoding=\"async\"`**, **`fetchpriority`** управляют загрузкой изображений."
    ),
    LK(["Popover API", "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API"], ["inert", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert"])
  ],
  v: [
    ["Что делает `inert`?", null, ["Отключает взаимодействие и доступность поддерева", "Скрывает визуально", "Блокирует сеть", "Меняет цвет"], 0, "Фокус и клики не работают."],
    ["Как прочитать `data-user-id` в JS?", null, ["`el.dataset.userId`", "`el.data.userId`", "`el.userId`", "`el.getData()`"], 0, "Значение — строка."],
    ["Для чего `<template>`?", null, ["Хранить неотрисованную разметку для клонирования", "Подключать стили", "Рендерить на сервере", "Для SEO"], 0, "Содержимое не выполняется."],
    ["Что умеет атрибут `popover`?", null, ["Показывать слой поверх с закрытием по Esc", "Блокировать скролл", "Запрашивать данные", "Менять цвет"], 0, "Без JS."],
    ["Какой элемент даёт нативный аккордеон?", null, ["`<details>`", "`<dialog>`", "`<menu>`", "`<aside>`"], 0, "С `summary` как заголовком."],
    ["Какого типа значения `dataset`?", null, ["Строки", "Числа", "Булевы", "Объекты"], 0, "Остальное преобразуйте вручную."]
  ]
},
{
  id: "q-html-15",
  q: "Что нужно знать про изображения и медиа: форматы (WebP, AVIF, SVG), `video`, `preload`, субтитры и автоплей?",
  o: ["Формат изображения не влияет на скорость страницы", "AVIF/WebP сжимают лучше JPEG/PNG, SVG подходит для иконок, у `video` важны `poster`, `preload`, `playsinline`, `muted` для автоплея и `track` для субтитров", "Автовоспроизведение со звуком разрешено всегда", "Все браузеры одинаково поддерживают все кодеки"],
  a: 1,
  e: "Браузеры блокируют автоплей со звуком, поэтому для фоновых видео используют `muted autoplay loop playsinline`. Для видео важны субтитры (`<track kind=\"captions\">`) и запасные источники в разных форматах.",
  d: [
    H("Медиа"),
    C(`<picture>
  <source type="image/avif" srcset="a.avif">
  <source type="image/webp" srcset="a.webp">
  <img src="a.jpg" alt="Описание" width="800" height="450" loading="lazy" decoding="async">
</picture>

<video controls preload="metadata" poster="poster.jpg" playsinline>
  <source src="v.webm" type="video/webm">
  <source src="v.mp4" type="video/mp4">
  <track kind="captions" src="ru.vtt" srclang="ru" label="Русский" default>
</video>`),
    UL(
      "**SVG**: масштабируется без потерь, стилизуется CSS; из внешнего файла (`<img>`) не получает стили страницы.",
      "**`preload=\"none|metadata|auto\"`** балансирует трафик и мгновенный старт.",
      "**Адаптивные изображения**: `srcset`, `sizes`, `<picture>`.",
      "**HLS/DASH** и MSE для стриминга; `<video>` из коробки поддерживает прогрессивную загрузку.",
      "**`prefers-reduced-motion`** — не запускать автоплей анимаций, если пользователь отключил движение."
    ),
    LK(["Video and audio", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio"], ["Image formats", "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types"])
  ],
  v: [
    ["Какие атрибуты нужны для фонового автоплея видео?", null, ["`muted autoplay loop playsinline`", "`controls` только", "`preload=none`", "`poster`"], 0, "Звук блокируется политикой браузеров."],
    ["Для чего элемент `<track>`?", null, ["Субтитры и описания", "Загрузка видео", "Скорость", "Цвет"], 0, "Важно для доступности."],
    ["Какой формат обычно сжимает лучше JPEG?", null, ["AVIF/WebP", "BMP", "GIF", "TIFF"], 0, "Но нужен запасной вариант."],
    ["Для чего `preload=\"metadata\"`?", null, ["Загрузить только метаданные видео", "Полностью скачать файл", "Не загружать ничего", "Загрузить субтитры"], 0, "Экономит трафик."],
    ["Можно ли стилизовать SVG, подключённый через `<img>`, стилями страницы?", null, ["Нет", "Да", "Только `fill`", "Только размеры"], 0, "Нужен встроенный `<svg>` или `<object>`."],
    ["Зачем указывать `width` и `height` у изображения?", null, ["Резервирует место и снижает CLS", "Сжимает файл", "Включает кеш", "Переключает формат"], 0, "Браузер вычисляет соотношение сторон."]
  ]
}
]);
