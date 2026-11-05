import { C, H, LK, P, UL } from "./registry";
import { K } from "./helpers";
/* ===================== Node.js ===================== */
const NDD = "https://nodejs.org/docs/latest/api/";
K("node", [
{
  id: "q-node-1",
  q: "В каком порядке выведется текст в Node.js (CommonJS-модуль)?",
  code: "console.log('A');\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('promise'));\nprocess.nextTick(() => console.log('tick'));\nconsole.log('B');",
  o: ["A B timeout promise tick", "A B tick promise timeout", "A B promise tick timeout", "A tick promise B timeout"],
  a: 1,
  e: "Сначала выполняется синхронный код (A, B). Затем очередь `process.nextTick`, потом микрозадачи промисов, и только после этого цикл событий доходит до таймеров.",
  d: [
    H("Event loop в Node.js: фазы и очереди"),
    P("Код JavaScript выполняется в одном потоке, а ввод-вывод делегируется ОС и пулу потоков **libuv**. Цикл событий проходит фазы по кругу:"),
    UL(
      "**timers**: колбэки `setTimeout`/`setInterval`, чей срок наступил.",
      "**pending callbacks**: отложенные системные колбэки (некоторые ошибки TCP и др.).",
      "**idle, prepare**: внутренние.",
      "**poll**: получение новых событий ввода-вывода и выполнение их колбэков; здесь цикл может ждать, если больше нечего делать.",
      "**check**: колбэки `setImmediate`.",
      "**close callbacks**: например, `socket.on('close')`."
    ),
    P("Между каждым колбэком (и после каждой фазы) Node очищает две очереди: сначала **`process.nextTick`**, затем **микрозадачи** (`Promise.then`, `queueMicrotask`). Поэтому `nextTick` выполняется раньше промисов (в CommonJS-модуле; в ESM-модуле верхнего уровня промисы идут раньше `nextTick`, так как модуль выполняется внутри промиса)."),
    UL(
      "**`setTimeout(fn, 0)` против `setImmediate`** из главного модуля: порядок не гарантирован (зависит от нагрузки процесса). Внутри колбэка ввода-вывода или таймера `setImmediate` всегда раньше нового таймера.",
      "**Пул потоков** (по умолчанию 4, `UV_THREADPOOL_SIZE`) обслуживает `fs`, `dns.lookup`, `crypto` (pbkdf2, scrypt), `zlib`; сетевые сокеты работают через epoll/kqueue/IOCP без пула.",
      "**Рекурсивный `process.nextTick`** может «заморить» ввод-вывод (очередь не опустеет). `setImmediate` такого не делает.",
      "**Блокировка цикла**: тяжёлые синхронные вычисления, `fs.readFileSync` на горячем пути, огромный `JSON.parse`, регулярные выражения с катастрофическим откатом."
    ),
    LK(["Node.js: The Event Loop", "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick"], ["Node.js: process.nextTick", NDD + "process.html#processnexttickcallback-args"])
  ],
  v: [
    ["Что выведет код?", "setTimeout(() => {\n  setTimeout(() => console.log('timeout'), 0);\n  setImmediate(() => console.log('immediate'));\n}, 0);", ["timeout immediate", "immediate timeout", "Порядок не определён", "Ничего"], 1, "Внутри колбэка таймера следующая фаза после timers — check, поэтому `setImmediate` идёт раньше нового таймера.", 'node'],
    ["Что выведет код?", "Promise.resolve().then(() => console.log('p1'));\nprocess.nextTick(() => {\n  console.log('t1');\n  process.nextTick(() => console.log('t2'));\n});", ["p1 t1 t2", "t1 p1 t2", "t1 t2 p1", "t1 t2"], 2, "Очередь `nextTick` опустошается целиком (включая добавленные внутри) до очереди промисов.", 'node'],
    ["Что выведет код?", "queueMicrotask(() => console.log('qm'));\nPromise.resolve().then(() => console.log('then'));\nprocess.nextTick(() => console.log('tick'));\nconsole.log('sync');", ["sync tick qm then", "sync qm then tick", "tick sync qm then", "sync then qm tick"], 0, "Сначала синхронный код, затем `nextTick`, затем микрозадачи в порядке постановки.", 'node'],
    ["Что выведет код?", "const p = new Promise((resolve) => {\n  console.log('executor');\n  resolve();\n});\np.then(() => console.log('then'));\nconsole.log('end');", ["executor then end", "executor end then", "end executor then", "then executor end"], 1, "Функция-исполнитель промиса выполняется синхронно, а `then` — в микрозадаче.", 'node'],
    ["Какие операции используют пул потоков libuv?", null, ["`fs.readFile`", "`crypto.pbkdf2`", "`zlib.gzip`", "Сетевое соединение через `net.Socket`", "`dns.lookup`"], [0, 1, 2, 4], "Сокеты работают через системные механизмы уведомлений, не через пул."],
    ["Что может заблокировать цикл событий?", null, ["Бесконечный синхронный цикл", "Огромный `JSON.parse`", "`await fetch(...)`", "Регулярное выражение с катастрофическим откатом", "`setTimeout` с большим временем"], [0, 1, 3], "`await` освобождает цикл на время ожидания."]
  ]
},
{
  id: "q-node-2",
  q: "Что происходит при циклической зависимости модулей в CommonJS (`a.js` требует `b.js`, а `b.js` требует `a.js`)?",
  o: ["Бросается ошибка при запуске", "`b.js` получит уже заполненную только частично копию `exports` модуля `a.js` (на момент вызова `require`)", "Модули загрузятся бесконечно", "`require` вернёт `null`"],
  a: 1,
  e: "Node кеширует модуль в `require.cache` до окончания его выполнения. Повторный `require` во время загрузки возвращает текущий (неполный) объект `module.exports`. Если `a.js` переопределит `module.exports = ...` позже, `b.js` останется со старым объектом.",
  d: [
    H("Модули: CommonJS и ES Modules"),
    UL(
      "**CommonJS**: `require()` синхронный, исполняет файл и кеширует `module.exports` по абсолютному пути. Экспорты — обычные значения (копия ссылки на момент присваивания).",
      "**`exports` и `module.exports`**: `exports` — лишь начальная ссылка на `module.exports`. Присваивание `exports = {...}` ничего не экспортирует.",
      "**ES Modules**: статические `import`/`export`, анализируются до выполнения (tree-shaking), **живые привязки** (live bindings): импортируемое значение отражает изменения экспортера. Поддерживается top-level `await`.",
      "**Выбор формата**: расширения `.mjs`/`.cjs` или поле `\"type\": \"module\"` в `package.json`.",
      "**В ESM нет** `__dirname`, `__filename`, `require`: используют `import.meta.url` (а в новых версиях Node — `import.meta.dirname` и `import.meta.filename`).",
      "**Взаимодействие**: ESM может импортировать CJS (как `default`); `require()` ES-модуля поддерживается в современных версиях Node (включено по умолчанию, начиная с 22.12 и 20.19), если в графе нет top-level `await`; динамический `import()` работает везде.",
      "**Циклы в ESM** обрабатываются через живые привязки: обращение к экспорту до его инициализации даёт ошибку TDZ (как у `let`/`const`)."
    ),
    C(`// a.js
exports.done = false;
const b = require("./b");   // b увидит a.done === false
exports.done = true;

// b.js
const a = require("./a");   // частично заполненный exports
console.log("in b, a.done =", a.done);   // false`),
    LK(["Node.js: Modules (CommonJS)", NDD + "modules.html"], ["Node.js: ES modules", NDD + "esm.html"], ["Node.js: require(esm)", NDD + "modules.html#loading-ecmascript-modules-using-require"])
  ],
  v: [
    ["Что экспортирует модуль?", "exports = { value: 1 };", ["`{ value: 1 }`", "Пустой объект `{}`", "`undefined`", "Ошибка"], 1, "Присваивание локальной переменной `exports` не меняет `module.exports`."],
    ["Почему `__dirname` недоступен в ES-модуле?", null, ["Это баг", "В ESM нет оболочки модуля CommonJS; используют `import.meta.url` или `import.meta.dirname` в новых версиях", "Он удалён из Node навсегда", "Он доступен через `global`"], 1, "Оболочка CJS передаёт `__dirname`, `require`, `module`, `exports`."],
    ["Что такое живые привязки (live bindings) в ESM?", null, ["Копии значений", "Импортируемое имя ссылается на переменную экспортера, и изменения видны импортёру", "Асинхронный `import`", "Кеш браузера"], 1, "В CommonJS при `const x = require(...).x` вы получаете копию значения на этот момент."],
    ["Как загрузить ES-модуль из CommonJS в любой версии Node?", null, ["`require('./m.mjs')` всегда", "Динамический `import('./m.mjs')`, который возвращает промис", "Нельзя", "`import` внутри функции"], 1, "`require(esm)` включён только в новых версиях и ограничен модулями без top-level await."],
    ["Что верно про `require.cache`?", null, ["Модули кешируются по абсолютному пути файла", "Повторный `require` исполняет файл заново", "Можно удалить запись для перезагрузки модуля", "Кеш общий для всех процессов"], [0, 2], "Повторный `require` отдаёт объект из кеша; кеш свой в каждом процессе."],
    ["Где в проекте включается формат ES-модулей для `.js`-файлов?", null, ["`\"type\": \"module\"` в `package.json`", "В `tsconfig.json`", "Флагом `--esm` обязательно", "Нельзя, только `.mjs`"], 0, "Расширения `.mjs`/`.cjs` задают формат для отдельных файлов."]
  ]
},
{
  id: "q-node-3",
  q: "Что такое backpressure в потоках Node.js и как его учитывать?",
  o: ["Ошибка сети", "Механизм, при котором быстрый источник замедляется, пока медленный получатель не обработает данные: `writable.write()` возвращает `false`, и нужно дождаться события `drain`; `pipe` и `pipeline` делают это сами", "Сжатие данных", "Шифрование потока"],
  a: 1,
  e: "Без учёта backpressure данные накапливаются во внутренних буферах, и память растёт. Надёжный способ — `stream.pipeline()` (или `stream/promises`), который также корректно закрывает потоки и пробрасывает ошибки.",
  d: [
    H("Потоки (streams) и буферы"),
    UL(
      "**Четыре вида**: `Readable`, `Writable`, `Duplex` (читает и пишет), `Transform` (преобразует). Режимы: поток данных (`data`) или пауза (`read()`).",
      "**Зачем**: обрабатывать данные частями (файлы, HTTP, сжатие) без загрузки всего в память; `fs.readFile` загрузит файл целиком, а `fs.createReadStream` — кусками (по умолчанию 64 КБ).",
      "**`highWaterMark`** — размер внутреннего буфера, после которого `write()` вернёт `false`.",
      "**`pipeline`** предпочтительнее `pipe`: `pipe` не закрывает потоки при ошибке.",
      "**Асинхронная итерация**: `for await (const chunk of readable)` читает с учётом backpressure.",
      "**Web Streams** (`ReadableStream` и др.) — стандартный API, доступный и в браузере, и в Node; есть адаптеры `Readable.fromWeb`, `Readable.toWeb`.",
      "**`Buffer`** — массив байтов фиксированного размера (подкласс `Uint8Array`). Кодировки: `utf8`, `base64`, `hex`. Не склеивайте строки из кусков: многобайтовый символ может быть разрезан между кусками (используйте `StringDecoder` или `setEncoding`)."
    ),
    C(`import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

await pipeline(
  createReadStream("big.log"),
  createGzip(),
  createWriteStream("big.log.gz"),
);   // backpressure и закрытие ресурсов — автоматически`),
    LK(["Node.js: Stream", NDD + "stream.html"], ["Node.js: Backpressuring in Streams", "https://nodejs.org/en/learn/modules/backpressuring-in-streams"])
  ],
  v: [
    ["Что означает `false`, возвращённый `writable.write(chunk)`?", null, ["Ошибка записи", "Внутренний буфер заполнен; нужно подождать событие `drain`", "Поток закрыт", "Данные потеряны"], 1, "Данные принимаются, но источник должен приостановиться."],
    ["Почему `pipeline` лучше `pipe`?", null, ["Он быстрее", "Он закрывает все потоки при ошибке и пробрасывает её", "Он шифрует данные", "Нет различий"], 1, "`pipe` оставляет потоки открытыми при ошибке, из-за чего возможны утечки."],
    ["Какой вид потока преобразует данные «на лету» (например, gzip)?", null, ["Readable", "Writable", "Transform", "Server"], 2, "`Transform` — подкласс `Duplex`."],
    ["Почему для файла в несколько гигабайт `fs.readFile` — плохой выбор?", null, ["Нельзя читать файлы", "Он загружает файл целиком в память", "Он синхронный", "Он не поддерживает UTF-8"], 1, "Потоки читают файл частями."],
    ["Как безопасно собрать текст из чанков с многобайтовыми символами?", null, ["`chunk.toString()` для каждого чанка и конкатенация", "Использовать `setEncoding('utf8')` или `StringDecoder`", "Склеить массивами строк", "Никак"], 1, "Символ может быть разрезан между чанками."],
    ["Что верно?", null, ["`for await (const chunk of readable)` учитывает backpressure", "`Buffer` является подклассом `Uint8Array`", "`Duplex` может читать и писать", "`Readable` умеет только писать"], [0, 1, 2], "Readable только читается."]
  ]
},
{
  id: "q-node-4",
  q: "Как в Node.js выполнять тяжёлые CPU-вычисления, не блокируя обработку запросов?",
  o: ["Использовать `async/await`: он делает код параллельным", "Вынести вычисления в `worker_threads` (или отдельный процесс/сервис); для масштабирования на ядра запускать несколько процессов (`cluster`, PM2, контейнеры)", "Увеличить `UV_THREADPOOL_SIZE`", "Использовать `setTimeout(fn, 0)`"],
  a: 1,
  e: "`async/await` не добавляет потоков: он лишь освобождает цикл при ожидании. CPU-bound код в основном потоке блокирует все запросы. `worker_threads` запускают отдельные изолированные экземпляры V8 с обменом сообщениями (и общей памятью через `SharedArrayBuffer`).",
  d: [
    H("Параллелизм: worker_threads, cluster, child_process"),
    UL(
      "**`worker_threads`**: потоки с собственным event loop и V8-изолятом; обмен через `postMessage` (копирование/передача `ArrayBuffer`) и `SharedArrayBuffer` + `Atomics`. Подходит для CPU-задач (хеширование, парсинг, сжатие).",
      "**`child_process`** (`spawn`, `exec`, `fork`): отдельные процессы, в том числе другие программы.",
      "**`cluster`**: несколько процессов Node, слушающих один порт; ОС или мастер распределяют соединения. Сегодня чаще масштабируют контейнерами/оркестратором.",
      "**Состояние в памяти процесса** (кеши, сессии, счётчики) не делится между процессами: вынести в Redis/БД.",
      "**Таймауты и отмена**: `AbortController` и `AbortSignal.timeout(ms)` отменяют `fetch`, таймеры и потоки.",
      "**Graceful shutdown**: на `SIGTERM` перестать принимать соединения (`server.close()`), дождаться текущих запросов, закрыть БД и выйти с кодом 0. Это нужно для корректных деплоев в Kubernetes.",
      "**Нагрузка**: измеряйте задержку цикла событий (`perf_hooks.monitorEventLoopDelay`), используйте профилировщик `--cpu-prof`."
    ),
    C(`import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

if (isMainThread) {
  const w = new Worker(new URL(import.meta.url), { workerData: { n: 42 } });
  w.on("message", (r) => console.log("result", r));
} else {
  parentPort.postMessage(fib(workerData.n));
}

process.on("SIGTERM", () => server.close(() => process.exit(0)));`),
    LK(["Node.js: Worker threads", NDD + "worker_threads.html"], ["Node.js: Cluster", NDD + "cluster.html"], ["Node.js: Don't Block the Event Loop", "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop"])
  ],
  v: [
    ["Ускорит ли `async` перед функцией цикл `for (let i = 0; i < 1e10; i++) {}`?", null, ["Да, станет параллельным", "Нет, цикл всё равно выполнится в основном потоке и заблокирует его", "Да, выполнится в пуле потоков", "Выполнится в другом процессе"], 1, "`async` не создаёт потоков."],
    ["Как обмениваться данными между воркером и основным потоком?", null, ["Общие глобальные переменные", "`postMessage` и `SharedArrayBuffer`", "`localStorage`", "`require.cache`"], 1, "У воркера своя изолированная среда."],
    ["Что нужно сделать при получении `SIGTERM` в сервисе?", null, ["Сразу `process.exit(1)`", "Перестать принимать соединения, дождаться текущих запросов, закрыть ресурсы и завершиться", "Игнорировать сигнал", "Перезапустить цикл событий"], 1, "Так выкладка не обрывает запросы пользователей."],
    ["Почему кеш в памяти процесса проблематичен при нескольких инстансах?", null, ["Он быстрее", "У каждого процесса свой кеш, данные рассинхронизируются", "Процессы делят кеш автоматически", "Нет проблемы"], 1, "Общее состояние хранят во внешнем хранилище."],
    ["Какие инструменты помогут масштабироваться на несколько ядер?", null, ["`cluster`", "Несколько контейнеров или процессов за балансировщиком", "`worker_threads` для CPU-задач", "Увеличение `setTimeout`"], [0, 1, 2], "Таймеры не добавляют параллелизма."],
    ["Что делает `AbortSignal.timeout(5000)`?", null, ["Создаёт сигнал отмены, срабатывающий через 5 секунд", "Ставит задержку 5 секунд", "Закрывает процесс", "Ничего"], 0, "Сигнал передают в `fetch` или другие API."]
  ]
},
{
  id: "q-node-5",
  q: "Какие возможности «из коробки» в современном Node.js заменяют популярные сторонние пакеты?",
  o: ["Никакие", "Глобальный `fetch`, встроенный тест-раннер (`node:test`, `node --test`), режим `--watch`, `--env-file`, `util.parseArgs`, `node:sqlite` и др.", "Только `fs` и `http`", "Только npm"],
  a: 1,
  e: "Современные версии Node включают `fetch` (на базе undici), `node:test` и `node:assert`, `--watch` (замена nodemon), `--env-file` (замена dotenv), `AbortController`, `structuredClone`, `crypto.randomUUID()` и другое. Можно запускать TypeScript с удалением типов (type stripping) в новых версиях.",
  d: [
    H("Современный Node.js: возможности и поддержка версий"),
    UL(
      "**`fetch`**, `Request`, `Response`, `Headers`, `FormData`, `AbortController`, `structuredClone`, `URL`, `TextEncoder`, `BroadcastChannel` — глобальные веб-API.",
      "**`node --test`**: встроенный раннер (`describe`/`it`, моки, покрытие `--experimental-test-coverage`).",
      "**`node --watch`** перезапускает процесс при изменении файлов; **`node --env-file=.env`** загружает переменные окружения.",
      "**`node:util` `parseArgs`**, **`node:readline/promises`**, **`fs/promises`**, **`timers/promises`** (`setTimeout` как промис).",
      "**Permission Model** (флаг `--permission`) позволяет ограничить доступ процесса к файловой системе, дочерним процессам и воркерам.",
      "**Запуск `.ts`**: в новых версиях Node может выполнять TypeScript-файлы, просто стирая аннотации типов (type stripping), без проверки типов и без поддержки синтаксиса, требующего генерации кода (поэтому `erasableSyntaxOnly`). Проверьте поддержку в вашей версии.",
      "**Версии и LTS**: чётные версии становятся LTS (Active, затем Maintenance), нечётные — только Current. По данным на октябрь 2026 года: Node 24 — LTS, Node 22 — LTS (поддержка короче), Node 26 — Current с переходом в LTS осенью 2026; актуальное расписание смотрите на nodejs.org. В продакшене используют только LTS."
    ),
    C(`// package.json
{
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.js",
    "test": "node --test"
  }
}`),
    LK(["Node.js: Releases", "https://nodejs.org/en/about/previous-releases"], ["Node.js: Test runner", NDD + "test.html"], ["Node.js: Command-line options", NDD + "cli.html"])
  ],
  v: [
    ["Чем заменяется `nodemon` в современном Node?", null, ["`node --watch`", "`node --reload`", "`node --nodemon`", "Ничем"], 0, "Режим слежения за файлами встроен."],
    ["Как загрузить `.env` без `dotenv`?", null, ["`node --env-file=.env app.js`", "`node --dotenv app.js`", "`require('env')`", "Нельзя"], 0, "Флаг появился в версии 20.6."],
    ["Какие версии Node обычно используют в продакшене?", null, ["Любые нечётные", "LTS (чётные версии в фазах Active/Maintenance)", "Только последнюю Current", "Только старейшие"], 1, "LTS получают исправления безопасности и стабильные обновления."],
    ["Что делает type stripping в Node при запуске `.ts`?", null, ["Проверяет типы", "Удаляет аннотации типов и запускает JavaScript без проверки типов", "Компилирует в WebAssembly", "Включает `strict`"], 1, "Типы проверяют отдельно, например, `tsc --noEmit`."],
    ["Какие из этих API входят в Node без пакетов?", null, ["`fetch`", "`node:test`", "`structuredClone`", "`express`", "`AbortController`"], [0, 1, 2, 4], "`express` — сторонний пакет."],
    ["Для чего Permission Model (`--permission`)?", null, ["Для управления правами пользователей приложения", "Для ограничения доступа процесса Node к файловой системе, воркерам и дочерним процессам", "Для HTTPS", "Для логов"], 1, "Это ограничения для самого процесса, а не пользователей приложения."]
  ]
},
{
  id: "q-node-6",
  q: "Что происходит в Node.js (с версии 15) при необработанном отклонении промиса (`unhandledRejection`)?",
  o: ["Ничего, выводится предупреждение", "По умолчанию процесс падает с ошибкой, если нет обработчика `process.on('unhandledRejection')`", "Промис автоматически перезапускается", "Исключение молча игнорируется"],
  a: 1,
  e: "Режим по умолчанию `--unhandled-rejections=throw`: необработанное отклонение превращается в `uncaughtException`. Если и его никто не обработал, процесс завершается с ненулевым кодом.",
  d: [
    H("Ошибки в Node.js"),
    UL(
      "**Колбэки error-first**: `(err, data) => {}`; `util.promisify` превращает такие функции в промисы.",
      "**`uncaughtException`**: после него состояние процесса неопределено. Правильно — залогировать, закрыть ресурсы и завершить процесс (оркестратор перезапустит), а не «продолжать работу».",
      "**`unhandledRejection`**: забытый `await`/`catch`. Ошибка внутри `async`-функции без `await` у вызывающего становится необработанным отклонением.",
      "**`EventEmitter` и событие `'error'`**: если `emit('error', err)` вызван без подписчика, ошибка бросается как исключение.",
      "**Операционные ошибки** (нет файла, таймаут сети) и **ошибки программиста** (TypeError) обрабатывают по-разному: первые ожидаемы, вторые указывают на баг.",
      "**`Error.cause`**: `new Error('Не удалось сохранить', { cause: err })` сохраняет первопричину.",
      "**Express 5** сам пробрасывает отклонённые промисы из обработчиков в обработчик ошибок; в Express 4 нужен `try/catch` или обёртка.",
      "**`process.exit()`** обрывает работу сразу, не дожидаясь асинхронных операций; лучше выставить `process.exitCode` и дать циклу завершиться."
    ),
    C(`process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandled rejection");
  process.exitCode = 1;           // дадим закончить текущие операции
  server.close(() => process.exit());
});

try {
  await save(data);
} catch (err) {
  throw new Error("Не удалось сохранить заказ", { cause: err });
}`),
    LK(["Node.js: Process events", NDD + "process.html#event-unhandledrejection"], ["Node.js: Errors", NDD + "errors.html"], ["MDN: Error.cause", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause"])
  ],
  v: [
    ["Что произойдёт?", "const { EventEmitter } = require('node:events');\ntry {\n  new EventEmitter().emit('error', new Error('boom'));\n} catch (e) {\n  console.log(e.message);\n}", ["Ничего", "boom", "undefined", "Ошибка не выбрасывается, процесс продолжает работать"], 1, "Событие `'error'` без подписчиков превращается в исключение.", 'node'],
    ["Что выведет код?", "async function f() {\n  throw new Error('x');\n}\nf().catch((e) => console.log('caught', e.message));", ["caught x", "x", "Ничего", "Процесс упадёт"], 0, "Исключение в `async`-функции превращается в отклонённый промис, который здесь обработан.", 'node'],
    ["Что лучше сделать в обработчике `uncaughtException`?", null, ["Продолжить работу как ни в чём не бывало", "Залогировать, закрыть ресурсы и завершить процесс", "Вызвать ту же функцию ещё раз", "Ничего"], 1, "Состояние приложения может быть повреждено."],
    ["Зачем нужен `cause` в `new Error(msg, { cause })`?", null, ["Для стилизации", "Чтобы сохранить исходную ошибку при оборачивании", "Для совместимости с Express", "Чтобы отключить стек"], 1, "Цепочка причин удобна для диагностики."],
    ["Какие утверждения верны?", null, ["Необработанное отклонение промиса по умолчанию завершает процесс", "`util.promisify` преобразует error-first колбэки в промисы", "`process.exit()` ждёт завершения асинхронных операций", "`'error'` у EventEmitter без подписчика бросает исключение"], [0, 1, 3], "`process.exit()` обрывает работу сразу."],
    ["Как отличить операционную ошибку от ошибки программиста?", null, ["Нельзя", "Операционные ожидаемы (сеть, ввод-вывод, пользовательский ввод), ошибки программиста — баги вроде `TypeError`", "Операционные всегда фатальны", "По длине сообщения"], 1, "Подход к обработке разный: повтор и сообщение пользователю против исправления кода."]
  ]
},
]);

/* ===================== Node.js, часть 2 ===================== */
K("node", [
{
  id: "q-node-7",
  q: "Чем модули ES (ESM) отличаются от CommonJS в Node.js и как они взаимодействуют?",
  o: ["Различий нет: `import` — это синтаксический сахар над `require`", "CommonJS грузится синхронно через `require`, ESM — статически и асинхронно (`import`, top-level `await`, `import.meta`), без `__dirname`; формат определяют `\"type\": \"module\"` или расширения `.mjs`/`.cjs`", "ESM нельзя использовать в Node.js", "`require` работает в ESM без ограничений"],
  a: 1,
  e: "ESM-граф анализируется до выполнения, поэтому импорты статичны, а привязки — «живые» (live bindings). В CommonJS экспортируется копия значения на момент `require`. Из ESM можно импортировать CommonJS; `require` ESM-модуля поддерживается в новых версиях Node ограниченно (для модулей без top-level await).",
  d: [
    H("CommonJS и ESM"),
    C(`// CommonJS
const fs = require("node:fs");
module.exports = { read };
console.log(__dirname, __filename);

// ESM (package.json: { "type": "module" })
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
export function read() {}
const data = await fetch(url).then((r) => r.json());   // top-level await
const cjs = await import("./legacy.cjs");              // динамический import доступен везде`),
    UL(
      "**Определение формата**: `type` в ближайшем `package.json`, расширения `.mjs` (ESM) и `.cjs` (CommonJS).",
      "**Относительные импорты в ESM требуют расширение**: `./utils.js`.",
      "**Нет `__dirname`, `require`, `module`** в ESM: используйте `import.meta.url`, `import.meta.dirname` (Node 20.11+/21.2+), `createRequire`.",
      "**Live bindings**: изменённый в модуле экспорт виден импортёрам.",
      "**Циклические зависимости** в ESM работают через привязки, а до инициализации возникает TDZ-ошибка.",
      "**`exports` в package.json** задаёт публичные точки входа и условные экспорты (`import`/`require`).",
      "**TypeScript**: `module`/`moduleResolution` (`nodenext`) должны совпадать с реальным поведением Node."
    ),
    LK(["Node.js: ES modules", "https://nodejs.org/api/esm.html"], ["Node.js: packages", "https://nodejs.org/api/packages.html"])
  ],
  v: [
    ["Как включить ESM для всех `.js` в пакете?", null, ["`\"type\": \"module\"` в package.json", "Расширение `.es`", "Флаг `--esm` обязателен", "Переименовать в `.json`"], 0, "Иначе используйте `.mjs`."],
    ["Доступен ли `__dirname` в ESM?", null, ["Нет, используют `import.meta.url`/`import.meta.dirname`", "Да", "Только в Windows", "Только в `.mjs`"], 0, "Переменные CommonJS отсутствуют."],
    ["Что такое top-level await?", null, ["`await` на верхнем уровне ESM-модуля", "`await` внутри цикла", "Флаг компиляции", "Метод Promise"], 0, "В CommonJS не работает."],
    ["Что нужно в относительном импорте в ESM?", null, ["Расширение файла", "Ничего", "Символ `@`", "Кавычки обратные"], 0, "Например, `./utils.js`."],
    ["Что такое live binding?", null, ["Импорт отражает текущее значение экспорта", "Копия значения при импорте", "Динамический `require`", "Горячая перезагрузка"], 0, "В CommonJS экспортируется копия."],
    ["Как из ESM получить `require`?", null, ["`createRequire(import.meta.url)`", "`import require`", "`global.require`", "Нельзя"], 0, "Из модуля `node:module`."]
  ]
},
{
  id: "q-node-8",
  q: "Из каких фаз состоит цикл событий Node.js и где находятся `process.nextTick`, промисы, `setTimeout` и `setImmediate`?",
  o: ["Цикл событий состоит из одной очереди колбэков", "Фазы: timers → pending → poll (I/O) → check (`setImmediate`) → close; `process.nextTick` и микрозадачи промисов выполняются между операциями, причём nextTick раньше промисов", "`setImmediate` всегда выполняется позже `setTimeout(0)`", "Промисы выполняются в фазе timers"],
  a: 1,
  e: "После каждой операции Node освобождает очередь `nextTick`, затем очередь микрозадач промисов. Из основного модуля порядок `setTimeout(0)` и `setImmediate` не определён, а внутри I/O-колбэка `setImmediate` всегда раньше.",
  d: [
    H("Event loop в Node.js"),
    C(`console.log("A");
process.nextTick(() => console.log("B"));
Promise.resolve().then(() => console.log("C"));
console.log("F");
// A F B C

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));   // внутри I/O всегда первым
});`),
    UL(
      "**timers**: колбэки `setTimeout`/`setInterval` по истечении времени (точность не гарантируется).",
      "**poll**: ожидание и обработка I/O.",
      "**check**: `setImmediate`.",
      "**close callbacks**: `socket.on('close')`.",
      "**nextTick** обладает самым высоким приоритетом; рекурсивные `nextTick` могут «заморозить» цикл.",
      "**libuv**: кроссплатформенный слой; пул потоков (по умолчанию 4) обслуживает `fs`, `crypto`, `dns.lookup`, `zlib`.",
      "**Блокировка цикла**: тяжёлый синхронный код (большой `JSON.parse`, `crypto.pbkdf2Sync`, регулярка с катастрофическим откатом) останавливает все запросы."
    ),
    LK(["Node.js: Event Loop", "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick"])
  ],
  v: [
    ["Каков вывод кода?", "console.log('A');\nprocess.nextTick(() => console.log('B'));\nPromise.resolve().then(() => console.log('C'));\nconsole.log('F');", ["A F C B", "A F B C", "A B C F", "A C B F"], 1, "Сначала синхронный код, затем `nextTick`, затем промисы.", 'node'],
    ["Что выведется первым внутри I/O-колбэка?", "require('fs').readFile('/etc/hostname', () => {\n  setTimeout(() => console.log('timeout'), 0);\n  setImmediate(() => console.log('immediate'));\n});", ["timeout immediate", "immediate timeout", "Порядок случайный", "Выведется только immediate"], 1, "После poll идёт фаза check.", 'node'],
    ["В какой фазе выполняется `setImmediate`?", null, ["check", "timers", "poll", "close"], 0, "Сразу после poll."],
    ["Какой пул потоков обслуживает `fs` и `crypto` в libuv?", null, ["Пул потоков (по умолчанию 4)", "Один главный поток", "GPU", "Процессы ОС"], 0, "Размер задаётся `UV_THREADPOOL_SIZE`."],
    ["Чем опасен рекурсивный `process.nextTick`?", null, ["Может заблокировать цикл событий", "Ничем", "Удаляет промисы", "Включает режим отладки"], 0, "Очередь nextTick обрабатывается до перехода к следующей фазе."],
    ["Что блокирует event loop?", null, ["Долгий синхронный код", "`await` на промисе", "`fetch`", "`setTimeout`"], 0, "Нужно выносить в воркеры или разбивать."]
  ]
},
{
  id: "q-node-9",
  q: "Как корректно завершать Node.js-сервис (graceful shutdown): сигналы, закрытие соединений, коды выхода?",
  o: ["Достаточно вызвать `process.exit(0)` при любой ошибке", "Слушать `SIGTERM`/`SIGINT`, перестать принимать новые соединения (`server.close()`), дождаться завершения текущих запросов и закрыть БД/очереди, затем выйти с кодом; жёсткий таймаут как страховка", "Сигналы в Node.js игнорируются", "Контейнеры сами ждут завершения запросов"],
  a: 1,
  e: "Оркестратор (Kubernetes, Docker) шлёт `SIGTERM`, а через `grace period` — `SIGKILL`. Если не обработать сигнал, активные запросы оборвутся. `process.exit` завершает процесс немедленно, поэтому вызывать его нужно после очистки.",
  d: [
    H("Graceful shutdown"),
    C(`const server = http.createServer(app).listen(3000);
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(signal + ": завершение");
  const force = setTimeout(() => process.exit(1), 10_000);   // страховка
  force.unref();
  server.close(async () => {                                 // дождаться активных запросов
    await db.end();
    process.exit(0);
  });
  server.closeIdleConnections?.();                           // закрыть простаивающие keep-alive
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));`),
    UL(
      "**`SIGTERM`** — вежливая просьба завершиться, **`SIGKILL`** перехватить нельзя.",
      "**Health/readiness**: после начала остановки отвечать «не готов», чтобы балансировщик убрал инстанс.",
      "**Коды выхода**: 0 — успех, ненулевые — ошибка; `process.exitCode = 1` позволяет завершиться естественно.",
      "**`uncaughtException`/`unhandledRejection`**: логировать и перезапускать процесс, состояние после них ненадёжно.",
      "**Таймеры и дескрипторы**: `unref()` не удерживает процесс живым.",
      "**PID 1 в контейнере**: используйте `tini` или `--init`, иначе сигналы могут не доходить."
    ),
    LK(["Node.js: process events", "https://nodejs.org/api/process.html#process-signal-events"], ["Kubernetes: Pod termination", "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination"])
  ],
  v: [
    ["Какой сигнал обычно шлёт оркестратор для остановки?", null, ["SIGTERM", "SIGKILL", "SIGSEGV", "SIGHUP только"], 0, "SIGKILL перехватить нельзя."],
    ["Что делает `server.close()`?", null, ["Перестаёт принимать новые соединения", "Немедленно рвёт все запросы", "Перезапускает сервер", "Очищает кеш"], 0, "Активные запросы дорабатывают."],
    ["Почему нужен таймаут завершения?", null, ["Соединения могут не закрыться", "Чтобы ускорить сборку", "Для кеша", "Для логов"], 0, "Иначе процесс зависнет до `SIGKILL`."],
    ["Что делает `timer.unref()`?", null, ["Не даёт таймеру удерживать процесс живым", "Отменяет таймер", "Повторяет таймер", "Ускоряет таймер"], 0, "Процесс завершится, если больше нет работы."],
    ["Что лучше делать после `uncaughtException`?", null, ["Залогировать и перезапустить процесс", "Игнорировать и работать дальше", "Включить режим отладки", "Вызвать `gc()`"], 0, "Состояние может быть повреждено."],
    ["Зачем `tini` или `--init` в контейнере?", null, ["Корректно пересылать сигналы и убирать зомби-процессы", "Ускорять Node", "Шифровать трафик", "Сжимать образ"], 0, "PID 1 ведёт себя особенно."]
  ]
},
{
  id: "q-node-10",
  q: "Чем отличаются `worker_threads`, `child_process` и `cluster`, и как масштабировать Node.js-приложение?",
  o: ["Это три названия одного механизма", "`worker_threads` — потоки в одном процессе с общей памятью (`SharedArrayBuffer`), `child_process` — отдельные процессы и команды ОС, `cluster` — несколько процессов, делящих один порт; горизонтально масштабируют ещё и контейнерами за балансировщиком", "`cluster` создаёт потоки в одном процессе", "Node.js нельзя масштабировать"],
  a: 1,
  e: "Для CPU-тяжёлых задач подходят воркеры. Для масштабирования HTTP по ядрам — несколько процессов (`cluster`, PM2 или контейнеры). Состояние (сессии, кеш) выносят из памяти процесса во внешнее хранилище, иначе разные инстансы будут видеть разные данные.",
  d: [
    H("Масштабирование"),
    C(`// worker_threads
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
if (isMainThread) {
  const w = new Worker(new URL(import.meta.url), { workerData: { n: 40 } });
  w.on("message", (r) => console.log(r));
} else {
  parentPort.postMessage(fib(workerData.n));
}

// child_process
import { execFile } from "node:child_process";
execFile("ffmpeg", ["-i", "in.mp4", "out.webm"], (err) => {});`),
    UL(
      "**Worker**: у каждого свой event loop и V8-изолят; обмен через `postMessage` (структурное клонирование), передача `ArrayBuffer` без копирования (`transfer`).",
      "**Пул воркеров** (Piscina) вместо создания воркера на каждый запрос.",
      "**`child_process`**: `spawn` (поток вывода), `exec` (буфер, через shell — осторожно с внедрением команд), `execFile`, `fork` (Node-процесс с IPC).",
      "**`cluster`**: основной процесс раздаёт соединения рабочим; сегодня чаще заменяется контейнерами и оркестратором.",
      "**Stateless-сервис**: сессии и кеш в Redis, файлы в объектном хранилище.",
      "**Очереди** (BullMQ, RabbitMQ) отделяют фоновую работу от запросов."
    ),
    LK(["Node.js: worker_threads", "https://nodejs.org/api/worker_threads.html"], ["Node.js: cluster", "https://nodejs.org/api/cluster.html"])
  ],
  v: [
    ["Что делает `worker_threads`?", null, ["Запускает потоки в том же процессе", "Запускает команды ОС", "Дублирует сервер", "Шифрует данные"], 0, "Подходит для CPU-задач."],
    ["Как воркеры обмениваются данными?", null, ["`postMessage` и общая память `SharedArrayBuffer`", "Через глобальные переменные", "Через DOM", "Через `localStorage`"], 0, "Данные клонируются или передаются."],
    ["Чем `execFile` безопаснее `exec`?", null, ["Не использует shell, аргументы передаются массивом", "Быстрее", "Возвращает поток", "Работает без Node"], 0, "Снижает риск внедрения команд."],
    ["Почему сервис должен быть stateless при горизонтальном масштабировании?", null, ["Запросы попадают на разные инстансы", "Так быстрее компилируется", "Это требует npm", "Для логов"], 0, "Состояние хранят во внешних сервисах."],
    ["Зачем пул воркеров?", null, ["Не создавать воркер на каждую задачу", "Для шифрования", "Для кеша", "Для логов"], 0, "Создание потока дорого."],
    ["Что такое `fork` в `child_process`?", null, ["Запуск нового Node-процесса с каналом IPC", "Копия массива", "Ветка Git", "Метод потока"], 0, "Обмен через `process.send`."]
  ]
},
{
  id: "q-node-11",
  q: "Как обрабатывать ошибки в асинхронном коде Node.js и Express/Fastify: `try/catch`, обработчик ошибок, `async` middleware?",
  o: ["Исключения в `async`-обработчиках Express 4 всегда перехватываются автоматически", "В Express 4 отклонённые промисы нужно передавать в `next(err)` (обёртка), в Express 5 и Fastify они обрабатываются автоматически; ошибки собирает централизованный обработчик с 4 аргументами `(err, req, res, next)`", "Ошибки нужно только логировать в консоль", "Ошибка в одном запросе всегда роняет весь сервер без последствий"],
  a: 1,
  e: "Необработанное отклонение промиса в Node.js (с версии 15) завершает процесс. В Express 4 `async`-функция, бросившая ошибку, не вызывает обработчик ошибок, поэтому нужна обёртка. Операционные ошибки (клиент прислал неверные данные) отличают от программных (баги).",
  d: [
    H("Ошибки в Node.js"),
    C(`const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);   // Express 4

app.get("/users/:id", wrap(async (req, res) => {
  const user = await db.find(req.params.id);
  if (!user) throw new HttpError(404, "Пользователь не найден");
  res.json(user);
}));

app.use((err, req, res, next) => {                // обработчик ошибок: 4 аргумента
  const status = err.status ?? 500;
  if (status >= 500) logger.error({ err, reqId: req.id });
  res.status(status).json({ message: status >= 500 ? "Внутренняя ошибка" : err.message });
});`),
    UL(
      "**Операционные ошибки** (таймаут, 404, невалидный ввод) обрабатывают и возвращают клиенту; **программные** (TypeError) логируют и чинят.",
      "**Свои классы ошибок** (`HttpError`, `ValidationError`) с кодом и статусом.",
      "**`Error.cause`** хранит исходную ошибку при оборачивании.",
      "**Таймауты и отмена**: `AbortSignal.timeout(5000)` в `fetch`.",
      "**`Promise.allSettled`** вместо `Promise.all`, когда падение одной задачи не должно отменять остальные.",
      "**Логи**: структурные (JSON) с `requestId`, уровень, без секретов."
    ),
    LK(["Express: error handling", "https://expressjs.com/en/guide/error-handling.html"], ["Node.js: errors", "https://nodejs.org/api/errors.html"])
  ],
  v: [
    ["Сколько аргументов у обработчика ошибок Express?", null, ["Четыре: `err, req, res, next`", "Два", "Три", "Один"], 0, "По числу аргументов Express распознаёт его."],
    ["Что происходит в Node.js 15+ при необработанном отклонении промиса?", null, ["Процесс завершается с ошибкой", "Оно игнорируется", "Выводится предупреждение и работа продолжается", "Промис повторяется"], 0, "По умолчанию режим `throw`."],
    ["Зачем `Error.cause`?", null, ["Сохранить исходную ошибку при оборачивании", "Задать статус", "Отключить стек", "Повторить действие"], 0, "Цепочка причин видна в логах."],
    ["Когда использовать `Promise.allSettled`?", null, ["Когда результаты нужны независимо от падения отдельных задач", "Всегда вместо `Promise.all`", "Для таймеров", "Для потоков"], 0, "`all` отклоняется при первой ошибке."],
    ["Чем операционная ошибка отличается от программной?", null, ["Ожидаемый сбой окружения/ввода против бага в коде", "Ничем", "Первая только в Express", "Вторая только в Jest"], 0, "Реакция разная."],
    ["Как ограничить время запроса `fetch`?", null, ["`signal: AbortSignal.timeout(ms)`", "`timeout: ms` в опциях", "`setTimeout` без отмены", "Никак"], 0, "У `fetch` собственного таймаута нет."]
  ]
},
{
  id: "q-node-12",
  q: "Какие уязвимости типичны для Node.js-приложений (prototype pollution, SSRF, ReDoS, внедрение команд, секреты) и как их предотвращать?",
  o: ["Node.js не подвержен уязвимостям, поскольку работает на V8", "Проверять и ограничивать ввод (схемы), избегать `eval`/shell-команд из пользовательских данных, не мерджить недоверенные объекты рекурсивно, ограничивать исходящие запросы, хранить секреты вне кода и обновлять зависимости", "Достаточно использовать HTTPS", "Достаточно запускать приложение от root"],
  a: 1,
  e: "Основные риски лежат в коде приложения и в зависимостях. Prototype pollution позволяет подменить `Object.prototype` через ключ `__proto__`. SSRF заставляет сервер обращаться во внутреннюю сеть. ReDoS — регулярка с катастрофическим откатом, блокирующая event loop.",
  d: [
    H("Безопасность Node.js"),
    UL(
      "**Валидация ввода** схемой (Zod, Ajv) на границе приложения.",
      "**Prototype pollution**: небезопасный `merge`/`set` с ключом `__proto__`; защита — `Object.create(null)`, проверка ключей, актуальные библиотеки.",
      "**SSRF**: фильтрация URL/хостов, запрет внутренних адресов, отдельная сеть для исходящих запросов.",
      "**ReDoS**: избегать вложенных квантификаторов, ограничивать длину ввода, использовать безопасные движки (RE2).",
      "**Внедрение команд**: `execFile` с массивом аргументов вместо `exec` со строкой.",
      "**SQL/NoSQL-инъекции**: параметризованные запросы; в Mongo — проверка типов (`{ $ne: null }`).",
      "**Заголовки безопасности**: `helmet`; CORS по allowlist; cookie `HttpOnly/Secure/SameSite`.",
      "**Зависимости**: lock-файл, `npm audit`, ограничение скриптов установки, подпись и provenance пакетов.",
      "**Секреты** — в менеджере секретов и переменных окружения, не в репозитории.",
      "**Модель разрешений Node.js** (`--permission`) ограничивает доступ к ФС, сети и дочерним процессам."
    ),
    C(`import { execFile } from "node:child_process";
// плохо: exec("convert " + userInput + " out.png")   → внедрение команд
execFile("convert", [userInput, "out.png"], cb);       // аргументы не интерпретируются shell`),
    LK(["Node.js: security best practices", "https://nodejs.org/en/learn/getting-started/security-best-practices"], ["OWASP Node.js", "https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html"])
  ],
  v: [
    ["Что такое prototype pollution?", null, ["Изменение `Object.prototype` через недоверенные ключи", "Утечка памяти", "Ошибка типов", "Сбой кеша"], 0, "Например, ключ `__proto__` при merge."],
    ["Что такое SSRF?", null, ["Заставить сервер сделать запрос по адресу атакующего", "Кража cookie", "Подмена DNS у клиента", "Переполнение буфера"], 0, "Часто целятся во внутреннюю сеть."],
    ["Чем опасен ReDoS?", null, ["Регулярка с катастрофическим откатом блокирует event loop", "Утечка токена", "Падение БД", "Подмена кода"], 0, "Одна строка может заблокировать сервис."],
    ["Что безопаснее для запуска внешней команды с пользовательским вводом?", null, ["`execFile` с массивом аргументов", "`exec` со строкой", "`eval`", "`new Function`"], 0, "Не вызывает shell."],
    ["Для чего `helmet`?", null, ["Ставит защитные HTTP-заголовки", "Шифрует БД", "Сжимает ответы", "Тестирует код"], 0, "Часть базовой гигиены."],
    ["Что делает `npm audit`?", null, ["Показывает известные уязвимости зависимостей", "Удаляет пакеты", "Обновляет Node", "Собирает проект"], 0, "Проверять нужно регулярно."]
  ]
},
{
  id: "q-node-13",
  q: "Как искать утечки памяти и проблемы производительности в Node.js (heap snapshot, `--inspect`, профайлер, метрики event loop)?",
  o: ["Рост памяти всегда означает утечку, и его нужно игнорировать", "Подключить `--inspect`, сделать несколько heap snapshot в Chrome DevTools и сравнить, найти удерживающие ссылки; использовать CPU profile, `--heap-prof`, метрики `process.memoryUsage()` и задержки event loop", "Единственное средство — перезапуск процесса по расписанию", "Сборщик мусора в Node.js выключается вручную"],
  a: 1,
  e: "Типичные причины: глобальные кеши без ограничения, незакрытые подписки и слушатели событий, замыкания, удерживающие большие объекты, таймеры без `clearInterval`, накапливающиеся промисы. Рост heap между GC-циклами — норма, постоянный рост после полного GC — подозрение.",
  d: [
    H("Диагностика"),
    C(`node --inspect server.js          # DevTools: chrome://inspect → Memory → Take heap snapshot
node --heap-prof server.js         # профиль памяти в файл
node --cpu-prof server.js          # CPU-профиль для flame graph
node --max-old-space-size=2048 server.js

setInterval(() => {
  const m = process.memoryUsage();
  console.log({ rss: m.rss, heapUsed: m.heapUsed });
}, 10_000).unref();

// задержка event loop
import { monitorEventLoopDelay } from "node:perf_hooks";
const h = monitorEventLoopDelay(); h.enable();`),
    UL(
      "**Сравнение snapshot**: «Comparison» показывает, какие объекты прибавились между двумя снимками.",
      "**Источники утечек**: ограниченные кеши (LRU, `WeakMap`), слушатели `emitter.on` без `off`, глобальные массивы, незакрытые соединения.",
      "**`MaxListenersExceededWarning`** — сигнал о возможной утечке слушателей.",
      "**Flame graph** (`0x`, `clinic`) показывает горячие функции.",
      "**Мониторинг в production**: RSS, heap, GC-паузы, event loop lag, число открытых дескрипторов.",
      "**Лимиты контейнера** и `--max-old-space-size` должны согласовываться."
    ),
    LK(["Node.js: diagnostics", "https://nodejs.org/en/learn/diagnostics/memory"], ["Chrome DevTools: memory", "https://developer.chrome.com/docs/devtools/memory-problems"])
  ],
  v: [
    ["Что сравнивают при поиске утечки?", null, ["Несколько heap snapshot во времени", "Размеры файлов", "Версии npm", "Логи nginx"], 0, "Смотрят, какие объекты накапливаются."],
    ["Какой флаг включает отладчик для DevTools?", null, ["`--inspect`", "`--debug-gc`", "`--dev`", "`--trace`"], 0, "Далее `chrome://inspect`."],
    ["Какая структура позволяет не удерживать ключи от сборки мусора?", null, ["`WeakMap`", "`Map`", "`Array`", "`Set`"], 0, "Запись исчезает вместе с ключом."],
    ["О чём говорит `MaxListenersExceededWarning`?", null, ["О большом числе слушателей одного события", "О нехватке диска", "О медленной сети", "О TLS"], 0, "Часто признак утечки."],
    ["Что показывает flame graph?", null, ["Где процессор тратит время", "Сколько памяти свободно", "Список зависимостей", "Версии пакетов"], 0, "Ширина блока — доля времени."],
    ["Что такое event loop lag?", null, ["Задержка выполнения колбэков из-за занятого потока", "Время ответа БД", "Размер очереди", "Потеря пакетов"], 0, "Рост означает блокировку."]
  ]
},
{
  id: "q-node-14",
  q: "Что нужно знать о npm и `package.json`: semver, `^` и `~`, lock-файл, `dependencies`/`devDependencies`/`peerDependencies`, `exports`, workspaces?",
  o: ["`^1.2.3` разрешает только версию 1.2.3", "`^1.2.3` допускает обновления до `<2.0.0`, `~1.2.3` — до `<1.3.0`; lock-файл фиксирует точное дерево, `peerDependencies` требует, чтобы потребитель предоставил пакет (например, `react`)", "`devDependencies` попадают в production-бандл автоматически", "Lock-файл не нужно хранить в репозитории"],
  a: 1,
  e: "Semver: `MAJOR.MINOR.PATCH`. `npm ci` ставит строго по lock-файлу (для CI), `npm install` может его обновить. Для библиотек `react` указывают в `peerDependencies`, чтобы не дублировать экземпляр React.",
  d: [
    H("package.json"),
    C(`{
  "name": "@acme/ui",
  "version": "2.1.0",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" },
    "./button": "./dist/button.js"
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": { "react": "^18 || ^19" },
  "devDependencies": { "typescript": "^5.6.0" },
  "scripts": { "build": "tsup", "test": "jest" },
  "engines": { "node": ">=20" }
}`),
    UL(
      "**Semver**: major — ломающие изменения, minor — новые возможности, patch — исправления.",
      "**Lock-файл** (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) коммитят для воспроизводимых сборок.",
      "**`exports`** ограничивает внутренние файлы и поддерживает условные экспорты; **`sideEffects: false`** помогает tree shaking.",
      "**Workspaces** (npm, pnpm, Yarn) — монорепозиторий с общими зависимостями; pnpm использует жёсткие ссылки и строгую структуру `node_modules`.",
      "**`overrides`/`resolutions`** принудительно меняют версию транзитивной зависимости.",
      "**Скрипты жизненного цикла** (`postinstall`) выполняют код при установке — риск цепочки поставок.",
      "**`npx`/`pnpm dlx`** запускают пакет без глобальной установки."
    ),
    LK(["npm docs: package.json", "https://docs.npmjs.com/cli/configuring-npm/package-json"], ["semver", "https://semver.org/lang/ru/"])
  ],
  v: [
    ["До какой версии допускает обновление `^1.2.3`?", null, ["Ниже `2.0.0`", "Ниже `1.3.0`", "Только `1.2.3`", "Любой"], 0, "Каретка фиксирует major."],
    ["А `~1.2.3`?", null, ["Ниже `1.3.0`", "Ниже `2.0.0`", "Любая minor", "Только `1.2.3`"], 0, "Тильда фиксирует minor."],
    ["Чем `npm ci` отличается от `npm install`?", null, ["Ставит строго по lock-файлу и очищает `node_modules`", "Быстрее обновляет версии", "Работает только локально", "Ничем"], 0, "Предназначен для CI."],
    ["Куда указывают `react` в библиотеке компонентов?", null, ["В `peerDependencies`", "В `dependencies` только", "В `scripts`", "В `files`"], 0, "Чтобы не было двух копий React."],
    ["Что даёт поле `exports`?", null, ["Ограничивает публичные точки входа пакета", "Экспортирует переменные окружения", "Добавляет тесты", "Ускоряет установку"], 0, "Внутренние файлы недоступны."],
    ["Чем опасен `postinstall` в зависимостях?", null, ["Выполняет произвольный код при установке", "Замедляет сборку", "Ломает lock", "Ничем"], 0, "Отключают `--ignore-scripts` для недоверенных."]
  ]
},
{
  id: "q-node-15",
  q: "Как писать HTTP-клиент и сервер на встроенных средствах Node.js: `fetch`, `http`, потоки, `AbortController`, таймауты и keep-alive?",
  o: ["В Node.js нет встроенного `fetch`, нужен `axios`", "`fetch` встроен (Undici), сервер строится на `node:http`; ответы можно читать потоком, таймауты и отмену задают `AbortSignal`, а keep-alive и пул соединений настраивает агент/`undici`", "Серверы на Node.js не умеют отдавать потоки", "Запросы нельзя отменять"],
  a: 1,
  e: "Глобальный `fetch` доступен с Node 18 и стабилен в современных версиях. Для больших ответов используют потоки (`response.body`, `pipeline`), чтобы не держать всё в памяти. Соединения переиспользуются, если включён keep-alive.",
  d: [
    H("Встроенные HTTP-средства"),
    C(`import http from "node:http";
import { pipeline } from "node:stream/promises";
import { createReadStream } from "node:fs";

const server = http.createServer(async (req, res) => {
  if (req.url === "/file") {
    res.setHeader("Content-Type", "application/octet-stream");
    await pipeline(createReadStream("big.bin"), res);          // поток с backpressure
    return;
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true }));
});
server.keepAliveTimeout = 65_000;
server.listen(3000);

const res = await fetch("https://api.example.com/data", { signal: AbortSignal.timeout(5000) });
if (!res.ok) throw new Error("HTTP " + res.status);
const data = await res.json();`),
    UL(
      "**`fetch` не бросает** при 4xx/5xx, проверяйте `res.ok`.",
      "**Потоковая отдача** экономит память; **`stream/promises.pipeline`** корректно закрывает потоки при ошибке.",
      "**`headersTimeout`/`requestTimeout`/`keepAliveTimeout`** сервера защищают от медленных клиентов (Slowloris).",
      "**Повторное использование соединений**: `undici.Agent` с `keepAliveTimeout`, `connections`.",
      "**Фреймворки** (Express, Fastify, Hono, NestJS) добавляют маршрутизацию и middleware; Fastify быстрее за счёт схем и сериализации.",
      "**Прокси и `keepAliveTimeout`**: значение сервера должно быть больше, чем у балансировщика, иначе возможны 502."
    ),
    LK(["Node.js: http", "https://nodejs.org/api/http.html"], ["Undici", "https://undici.nodejs.org/"])
  ],
  v: [
    ["Бросает ли `fetch` исключение на ответ 500?", null, ["Нет, нужно проверить `res.ok`", "Да", "Только на 404", "Только в браузере"], 0, "Исключение — только при сетевой ошибке."],
    ["Зачем `pipeline` вместо `.pipe()`?", null, ["Корректно обрабатывает ошибки и закрывает потоки", "Работает быстрее всегда", "Шифрует данные", "Удаляет заголовки"], 0, "`.pipe()` не обрабатывает ошибки."],
    ["Как задать таймаут `fetch` в Node?", null, ["`AbortSignal.timeout(ms)`", "Опция `timeout`", "`setTimeout(fetch)`", "Невозможно"], 0, "Сигнал отменит запрос."],
    ["От какой атаки защищают `requestTimeout` и `headersTimeout`?", null, ["Медленные клиенты (Slowloris)", "XSS", "SQL-инъекция", "CSRF"], 0, "Они ограничивают время приёма запроса."],
    ["Почему `keepAliveTimeout` сервера должен быть больше, чем у балансировщика?", null, ["Иначе соединение закроется во время запроса, будут 502", "Для ускорения TLS", "Это требует HTTP/3", "Для логов"], 0, "Балансировщик закрывает первым."],
    ["Что быстрее встроенного `http` по функциям?", null, ["Фреймворк (Fastify) добавляет удобство, а не скорость", "Нет разницы вообще", "Express всегда быстрее", "Ничто"], 0, "Фреймворки дают структуру и middleware."]
  ]
},
{
  id: "q-node-16",
  q: "Как организовать конфигурацию, логирование и тестирование Node.js-сервиса (12-factor, `process.env`, pino, `node:test`)?",
  o: ["Конфигурацию лучше хранить в коде вместе с секретами, логи — через `console.log` строкой", "Конфигурацию берут из переменных окружения с валидацией на старте, логи — структурные JSON с уровнями и `requestId`, тесты — быстрые изолированные (`node:test`, Jest, Vitest) с моками внешних сервисов", "Конфигурацию определяют по имени хоста", "Тесты в Node.js невозможны без браузера"],
  a: 1,
  e: "Принцип 12-factor: конфигурация в окружении, одна кодовая база — много окружений, логи пишутся в stdout, а их сбором занимается платформа. Валидация env на старте (Zod) даёт быстрый отказ вместо странных ошибок позже.",
  d: [
    H("Конфиг, логи, тесты"),
    C(`// config.ts
import { z } from "zod";
export const config = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
}).parse(process.env);

// логирование
import pino from "pino";
export const logger = pino({ level: process.env.LOG_LEVEL ?? "info", redact: ["req.headers.authorization"] });
logger.info({ reqId, userId }, "заказ создан");

// node:test
import test from "node:test";
import assert from "node:assert/strict";
test("sum", () => assert.equal(sum(1, 2), 3));`),
    UL(
      "**`.env`** только для локальной разработки (`--env-file=.env` в современных версиях Node), в production переменные задаёт платформа.",
      "**Секреты** не логировать: `redact` в pino.",
      "**Уровни логов**: `error`, `warn`, `info`, `debug`; корреляция по `requestId`/`traceId` (OpenTelemetry).",
      "**Тесты**: юнит (чистые функции), интеграционные (с тестовой БД в контейнере), контрактные; моки сети — nock/MSW/undici MockAgent.",
      "**`node --test`** запускает встроенный раннер; `--watch` перезапускает тесты.",
      "**Health-check** `/healthz` и `/readyz` для оркестратора."
    ),
    LK(["The Twelve-Factor App", "https://12factor.net/ru/"], ["Node.js: test runner", "https://nodejs.org/api/test.html"], ["pino", "https://getpino.io/"])
  ],
  v: [
    ["Где хранят конфигурацию по 12-factor?", null, ["В переменных окружения", "В исходниках", "В базе кода репозитория", "В HTML"], 0, "Код один, окружений много."],
    ["Зачем валидировать env на старте?", null, ["Быстрый отказ при неверной конфигурации", "Для ускорения", "Для кеша", "Для логов"], 0, "Лучше упасть сразу."],
    ["Какой формат логов удобнее собирать?", null, ["Структурный JSON", "Свободный текст", "Картинки", "XML-документы без схемы"], 0, "Легко фильтровать и агрегировать."],
    ["Как не вывести токен в логах?", null, ["Опция `redact`", "Ничего не нужно", "Вывод в консоль", "Хранение в логе"], 0, "Скрываются указанные поля."],
    ["Какой встроенный запуск тестов есть в Node?", null, ["`node --test`", "`node --jest`", "`node --spec`", "`npm check`"], 0, "Модуль `node:test`."],
    ["Для чего `/readyz`?", null, ["Сообщить, что сервис готов принимать трафик", "Показать версию", "Очистить кеш", "Закрыть соединения"], 0, "Используется балансировщиком."]
  ]
}
]);
