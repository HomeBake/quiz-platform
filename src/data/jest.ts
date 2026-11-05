import { C, H, LK, UL } from "./registry";
import { K } from "./helpers";
/* ===================== Jest ===================== */
const JD = "https://jestjs.io/docs/";
K("jest", [
{
  id: "q-jest-1",
  q: "Чем `toBe`, `toEqual` и `toStrictEqual` отличаются в Jest?",
  o: ["Ничем", "`toBe` сравнивает через `Object.is` (ссылки/примитивы), `toEqual` — рекурсивно по значению (игнорирует `undefined`-свойства и разреженность массивов), `toStrictEqual` дополнительно проверяет типы/классы и `undefined`-свойства", "`toBe` для объектов, `toEqual` для примитивов", "`toStrictEqual` сравнивает по ссылке"],
  a: 1,
  e: "Для объектов и массивов обычно нужен `toEqual`; для примитивов и проверки идентичности ссылки — `toBe`. `toStrictEqual` строже: `{a: undefined, b: 2}` не равен `{b: 2}`, и экземпляр класса не равен простому объекту с теми же полями.",
  d: [
    H("Структура тестов и матчеры"),
    C(`describe("sum", () => {
  beforeEach(() => { /* подготовка */ });

  it("складывает числа", () => {
    expect(sum(1, 2)).toBe(3);
  });

  it.each([[1, 1, 2], [2, 3, 5]])("sum(%i, %i) = %i", (a, b, r) => {
    expect(sum(a, b)).toBe(r);
  });

  it("бросает ошибку", () => {
    expect(() => parse("")).toThrow("empty");   // функцию нужно обернуть!
  });

  it("асинхронный", async () => {
    await expect(fetchUser(1)).resolves.toMatchObject({ id: 1 });
    await expect(fetchUser(-1)).rejects.toThrow("not found");
  });
});`),
    UL(
      "**`toBe`** → `Object.is`: `expect(0.1 + 0.2).toBe(0.3)` падает; для дробей — `toBeCloseTo`.",
      "**`toEqual`** рекурсивно сравнивает значения и игнорирует свойства со значением `undefined`; **`toStrictEqual`** их учитывает и проверяет типы объектов.",
      "**`toMatchObject`** — частичное совпадение объекта; **`expect.objectContaining`**, **`expect.any(Number)`** — асимметричные матчеры.",
      "**`toThrow`** требует передать функцию, а не результат вызова, иначе исключение произойдёт до `expect`.",
      "**Асинхронность**: возвращайте промис, используйте `async/await` или `.resolves/.rejects`. Забытый `await` перед `expect(...).resolves` приведёт к зелёному тесту, который ничего не проверил.",
      "**`expect.assertions(n)`** проверяет, что выполнено ровно n проверок (защита от пропущенных ассертов в async-коде).",
      "**Хуки**: `beforeAll`, `beforeEach`, `afterEach`, `afterAll`; `describe` создаёт область видимости хуков."
    ),
    LK(["Jest: Expect", JD + "expect"], ["Jest: Using Matchers", JD + "using-matchers"], ["Jest: Testing Asynchronous Code", JD + "asynchronous"])
  ],
  v: [
    ["Пройдёт ли проверка?", "expect({ a: 1, b: undefined }).toEqual({ a: 1 });", ["Да, `toEqual` игнорирует свойства со значением `undefined`", "Нет, объекты разные", "Нет, `toEqual` сравнивает по ссылке", "Выбросит синтаксическую ошибку"], 0, "Для строгого сравнения нужен `toStrictEqual`."],
    ["Пройдёт ли проверка?", "expect({ a: 1, b: undefined }).toStrictEqual({ a: 1 });", ["Да", "Нет: `toStrictEqual` учитывает свойства со значением `undefined`", "Да, но с предупреждением", "Зависит от порядка ключей"], 1, "Строгое сравнение требует идентичной структуры."],
    ["Почему этот тест не проверяет исключение?", "it('throws', () => {\n  expect(parse('')).toThrow();\n});", ["Всё верно", "`parse('')` вызывается до `expect` и бросает исключение прямо в тесте; нужно `expect(() => parse('')).toThrow()`", "`toThrow` не существует", "Нужен `await`"], 1, "Матчер должен вызвать функцию внутри себя, чтобы перехватить ошибку."],
    ["Что опасно в этом тесте?", "it('loads', () => {\n  expect(fetchUser(1)).resolves.toEqual({ id: 1 });\n});", ["Ничего", "Промис не возвращён и не ожидается: тест может завершиться раньше проверки и пройти ложно", "`resolves` запрещён", "Нужно `done`"], 1, "Нужно `return expect(...)` либо `await expect(...)`."],
    ["Как сравнить `0.1 + 0.2` и `0.3`?", null, ["`toBe(0.3)`", "`toBeCloseTo(0.3)`", "`toEqual(0.3)`", "`toStrictEqual(0.3)`"], 1, "Из-за двоичной арифметики числа отличаются на малую величину."],
    ["Для чего `expect.assertions(2)`?", null, ["Ограничивает количество тестов", "Проверяет, что в тесте выполнилось ровно две проверки (особенно полезно для колбэков и промисов)", "Включает снапшоты", "Задаёт таймаут"], 1, "Если код в `catch` не выполнится, тест упадёт."]
  ]
},
{
  id: "q-jest-2",
  q: "Что произойдёт с вызовом `jest.mock('./api')`, написанным ниже импортов?",
  o: ["Мок применится только после `import`", "Вызовы `jest.mock` поднимаются (hoisting) на начало файла транспилятором (babel-plugin-jest-hoist / ts-jest), поэтому модуль будет подменён до выполнения импортов", "Ничего не изменится", "Будет ошибка синтаксиса"],
  a: 1,
  e: "`jest.mock` с литеральным путём поднимается выше `import`. Поэтому фабрика мока не может ссылаться на внешние переменные (кроме имён с префиксом `mock`) — они ещё не инициализированы.",
  d: [
    H("Моки, шпионы и очистка"),
    C(`import { getUser } from "./api";
jest.mock("./api");                 // автомок: все экспорты → jest.fn()

// или с фабрикой
jest.mock("./api", () => ({ getUser: jest.fn() }));

test("показывает имя", async () => {
  getUser.mockResolvedValueOnce({ name: "Ann" });
  // ...
  expect(getUser).toHaveBeenCalledWith(1);
  expect(getUser).toHaveBeenCalledTimes(1);
});

const spy = jest.spyOn(console, "error").mockImplementation(() => {});
spy.mockRestore();`),
    UL(
      "**`jest.fn()`**: функция-заглушка с учётом вызовов (`mock.calls`, `mock.results`). `mockReturnValue`, `mockResolvedValue`, `mockImplementation`, варианты `...Once`.",
      "**`jest.spyOn(obj, 'method')`** оборачивает существующий метод (по умолчанию вызывает оригинал) и позволяет восстановить его через `mockRestore()`.",
      "**`jest.mock(path)`** подменяет весь модуль (автомок или фабрика). Частичный мок: `jest.requireActual`.",
      "**Очистка**: `mockClear()` — сбросить `calls/results`; `mockReset()` — плюс сбросить реализацию; `mockRestore()` — плюс вернуть оригинал (для spyOn). Конфиг: `clearMocks`, `resetMocks`, `restoreMocks`.",
      "**ESM**: `jest.mock` не поднимается так же; используют `jest.unstable_mockModule` и динамический `import`.",
      "**Что мокать**: границы системы (сеть, время, файловая система, случайность), а не внутренние детали собственного кода. Чрезмерные моки делают тесты хрупкими.",
      "**Сетевые запросы в UI-тестах** удобнее перехватывать на уровне сети (MSW), чем мокать `fetch` в каждом тесте."
    ),
    LK(["Jest: Mock Functions", JD + "mock-functions"], ["Jest: Manual / ES6 Class Mocks", JD + "es6-class-mocks"], ["Jest: jest object", JD + "jest-object"])
  ],
  v: [
    ["Почему в фабрике `jest.mock` нельзя ссылаться на обычную внешнюю переменную?", "const data = { id: 1 };\njest.mock('./api', () => ({ get: () => data }));", ["Можно без ограничений", "`jest.mock` поднимается выше объявления `data`; разрешены имена с префиксом `mock`", "Фабрики запрещены", "Нужен `async`"], 1, "Babel-плагин проверяет такие ссылки и сообщает об ошибке."],
    ["Чем `mockReset` отличается от `mockClear`?", null, ["Ничем", "`mockClear` сбрасывает историю вызовов, `mockReset` ещё и убирает заданную реализацию", "`mockClear` восстанавливает оригинал", "`mockReset` работает только для `spyOn`"], 1, "Оригинальный метод восстанавливает `mockRestore`."],
    ["Что делает `jest.spyOn(obj, 'method')` по умолчанию?", null, ["Заменяет метод пустой функцией", "Оборачивает метод, продолжая вызывать оригинал, и записывает вызовы", "Удаляет метод", "Мокает весь модуль"], 1, "Заглушку нужно добавить явно через `mockImplementation`."],
    ["Как проверить, что функция вызвана один раз с аргументом 5?", null, ["`expect(fn).toHaveBeenCalledWith(5)` и `toHaveBeenCalledTimes(1)`", "`expect(fn).toBe(5)`", "`expect(fn(5)).toCalled()`", "`expect(fn).toReturn(5)`"], 0, "Эти матчеры работают с моками `jest.fn()` и шпионами."],
    ["Что стоит мокать в юнит-тестах?", null, ["Границы: сеть, время, ФС, случайность", "Собственную чистую функцию, которую тест должен проверять", "Всё подряд", "Только типы"], 0, "Мокирование собственной логики лишает тест смысла."],
    ["Что верно?", null, ["`jest.mock` поднимается транспилятором выше импортов", "`mockResolvedValue(x)` эквивалентен `mockImplementation(() => Promise.resolve(x))`", "`mockRestore` возвращает исходный метод у шпиона", "`jest.fn()` вызывает оригинальный модуль"], [0, 1, 2], "`jest.fn()` — самостоятельная заглушка."]
  ]
},
{
  id: "q-jest-3",
  q: "Как протестировать код с `setTimeout`/`setInterval`, не ожидая реального времени?",
  o: ["Использовать `await new Promise(r => setTimeout(r, 5000))`", "Включить `jest.useFakeTimers()` и управлять временем через `jest.advanceTimersByTime(ms)`, `runOnlyPendingTimers()`, `runAllTimers()`", "Нельзя", "Увеличить таймаут теста до бесконечности"],
  a: 1,
  e: "Поддельные таймеры заменяют `setTimeout`, `setInterval`, `Date` (при современных fake timers) и др. Для кода, где таймеры переплетены с промисами, используют асинхронные версии: `await jest.advanceTimersByTimeAsync(ms)`.",
  d: [
    H("Таймеры, время и асинхронные тесты"),
    C(`beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("debounce вызывает функцию один раз", () => {
  const fn = jest.fn();
  const d = debounce(fn, 300);
  d(); d(); d();
  jest.advanceTimersByTime(299);
  expect(fn).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("polling с промисами", async () => {
  const p = poll();
  await jest.advanceTimersByTimeAsync(1000);   // продвигает таймеры и дожидается микрозадач
  await expect(p).resolves.toBe("done");
});`),
    UL(
      "**`advanceTimersByTime(ms)`** выполняет таймеры, которые должны сработать за интервал; **`runOnlyPendingTimers()`** — только уже запланированные (безопасно для `setInterval`); **`runAllTimers()`** — все, включая вновь созданные (бесконечный интервал зациклит тест).",
      "**`jest.setSystemTime(date)`** фиксирует `Date.now()` при включённых fake timers.",
      "**Микрозадачи** (промисы) не продвигаются синхронными методами таймеров; нужны `await` или асинхронные версии.",
      "**Колбэк `done`** (устаревший способ) нужно вызвать вручную, а если вернуть промис, `done` использовать нельзя.",
      "**Таймаут теста** по умолчанию 5 секунд; меняется третьим аргументом `test(name, fn, ms)` или `jest.setTimeout`.",
      "**Утечки**: незавершённые таймеры и открытые соединения мешают Jest завершиться (флаг `--detectOpenHandles`)."
    ),
    LK(["Jest: Timer Mocks", JD + "timer-mocks"], ["Jest: jest.useFakeTimers", JD + "jest-object#jestusefaketimersfaketimersconfig"])
  ],
  v: [
    ["Что произойдёт?", "jest.useFakeTimers();\nconst fn = jest.fn();\nsetTimeout(fn, 1000);\njest.advanceTimersByTime(999);\nexpect(fn).toHaveBeenCalled();", ["Тест пройдёт", "Тест упадёт: прошло 999 мс из 1000", "Функция вызовется дважды", "Ошибка синтаксиса"], 1, "Нужно ещё продвинуть время минимум на 1 мс."],
    ["Какой метод безопасен для `setInterval`, чтобы не зациклить тест?", null, ["`runAllTimers()`", "`runOnlyPendingTimers()`", "`useRealTimers()`", "`clearAllMocks()`"], 1, "`runAllTimers` будет выполнять новые интервалы бесконечно."],
    ["Зачем нужны `advanceTimersByTimeAsync` и подобные?", null, ["Для скорости", "Когда таймеры связаны с промисами: они дожидаются микрозадач между срабатываниями", "Для работы с `Date`", "Для снапшотов"], 1, "Синхронные методы не успевают выполнить цепочки промисов."],
    ["Как зафиксировать `Date.now()` в тесте?", null, ["`jest.setSystemTime(new Date('2025-01-01'))` при включённых fake timers", "`Date.now = 5`", "`jest.freeze()`", "Нельзя"], 0, "Современные fake timers подменяют `Date`."],
    ["Какая ошибка в тесте приведёт к ложно зелёному результату?", null, ["Забыть `await` перед `expect(...).resolves`", "Не вернуть промис из теста", "Вызвать `done()` дважды", "Использовать `beforeEach`"], [0, 1], "Тест завершается, не дожидаясь проверки."],
    ["Какое значение таймаута теста по умолчанию?", null, ["1 секунда", "5 секунд", "30 секунд", "Без ограничений"], 1, "Меняется третьим аргументом или `jest.setTimeout`."]
  ]
},
{
  id: "q-jest-4",
  q: "Какой подход Testing Library рекомендует для выбора элементов и почему `userEvent` предпочтительнее `fireEvent`?",
  o: ["Искать по CSS-классам и вызывать `fireEvent`", "Искать так, как видит пользователь: приоритет `getByRole` (с `name`), затем `getByLabelText`, `getByText`, и лишь потом `getByTestId`; `userEvent` имитирует полную последовательность событий (фокус, нажатия, ввод), а `fireEvent` отправляет одно событие", "Искать по внутренним состояниям компонента", "Тестировать приватные методы"],
  a: 1,
  e: "Тесты, привязанные к ролям и тексту, проверяют поведение и доступность, а не реализацию. `userEvent` ближе к реальному взаимодействию.",
  d: [
    H("React Testing Library вместе с Jest"),
    C(`import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("отправляет форму", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "a@b.co");
  await user.click(screen.getByRole("button", { name: /войти/i }));

  expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.co" });
  expect(await screen.findByText(/добро пожаловать/i)).toBeInTheDocument();  // ждёт появления
});`),
    UL(
      "**Три семейства запросов**: `getBy*` (бросает, если нет; синхронно), `queryBy*` (возвращает `null`, для проверки отсутствия), `findBy*` (асинхронно ждёт, использует `waitFor`).",
      "**Приоритет**: `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText` → `getByDisplayValue` → `getByAltText`/`getByTitle` → `getByTestId` (последний вариант).",
      "**`waitFor`** повторяет проверку до успеха или таймаута. Не кладите внутрь побочные эффекты (клики).",
      "**`act`**: оборачивает обновления состояния; RTL делает это автоматически. Предупреждение «not wrapped in act» обычно говорит о том, что тест не дождался асинхронного обновления.",
      "**Окружение**: `testEnvironment: 'jsdom'` для компонентов (имитация DOM), `node` для серверного кода.",
      "**Сеть**: Mock Service Worker (MSW) перехватывает запросы на уровне сети, а компонент использует реальный `fetch`.",
      "**Что не тестировать**: детали реализации (имена внутренних функций, состояние `useState`), сторонние библиотеки; тестируйте поведение, видимое пользователю.",
      "**Снапшоты** подходят для небольших стабильных структур; большие снапшоты компонентов часто «обновляют не глядя»."
    ),
    LK(["Testing Library: Queries", "https://testing-library.com/docs/queries/about/"], ["Testing Library: user-event", "https://testing-library.com/docs/user-event/intro"], ["MSW", "https://mswjs.io/"])
  ],
  v: [
    ["Как проверить, что элемента нет на странице?", null, ["`expect(screen.getByText('x')).toBeNull()`", "`expect(screen.queryByText('x')).not.toBeInTheDocument()`", "`expect(screen.findByText('x')).toBe(false)`", "`expect(getByText('x')).toBe(undefined)`"], 1, "`getBy*` бросит ошибку, если элемента нет."],
    ["Какой запрос ждёт появления элемента?", null, ["`getByText`", "`queryByText`", "`findByText`", "`allByText`"], 2, "`findBy*` — это `getBy*` внутри `waitFor`."],
    ["Какой запрос предпочтительнее по руководству Testing Library?", null, ["`getByTestId`", "`getByRole('button', { name: /войти/i })`", "`container.querySelector('.btn')`", "`getByClassName`"], 1, "Роль и доступное имя проверяют и доступность."],
    ["Чем `userEvent.type` отличается от `fireEvent.change`?", null, ["Ничем", "`userEvent` посылает последовательность событий (фокус, keydown, input, keyup) для каждого символа, `fireEvent.change` — только одно событие", "`fireEvent` медленнее", "`userEvent` работает только в браузере"], 1, "Это ближе к реальному вводу."],
    ["Что нежелательно проверять в тестах компонентов?", null, ["Текст, видимый пользователю", "Внутреннее состояние хука `useState`", "Вызов переданного колбэка", "Доступность элемента"], 1, "Тест должен переживать рефакторинг, пока поведение не меняется."],
    ["Что верно про окружение `jsdom`?", null, ["Это имитация DOM для Node", "В нём нет реальной вёрстки и layout", "Это настоящий браузер", "Нужно для тестов серверного кода"], [0, 1], "Для проверки внешнего вида нужны браузерные тесты (Playwright, Cypress)."]
  ]
},
{
  id: "q-jest-5",
  q: "За что отвечают `transform`, `testEnvironment` и `moduleNameMapper` в конфигурации Jest?",
  o: ["Только за вывод отчёта", "`transform` — как преобразовывать файлы (babel-jest, ts-jest, @swc/jest); `testEnvironment` — среда выполнения (`node`, `jsdom`); `moduleNameMapper` — подмена путей (алиасы, стили, картинки)", "Они задают порядок тестов", "Они включают покрытие"],
  a: 1,
  e: "Jest сам не понимает TypeScript, JSX и CSS. Нужен трансформер и «заглушки» для статики (`identity-obj-proxy`, файловые моки).",
  d: [
    H("Конфигурация, покрытие и скорость"),
    C(`// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  transform: { "^.+\\\\.(t|j)sx?$": ["@swc/jest"] },
  moduleNameMapper: {
    "\\\\.(css|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],   // jest-dom, MSW и т. д.
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  coverageThreshold: { global: { branches: 80, lines: 80 } },
};`),
    UL(
      "**Трансформеры**: `babel-jest` (по умолчанию), `ts-jest` (проверяет типы, медленнее), `@swc/jest` или `esbuild-jest` (быстро, без проверки типов).",
      "**Покрытие** (`--coverage`): statements, branches, functions, lines. 100% покрытия не гарантируют качества: важны осмысленные проверки.",
      "**Параллелизм**: Jest запускает файлы тестов в воркерах; внутри файла тесты идут последовательно. `--runInBand` — последовательно (удобно для отладки), `--maxWorkers`.",
      "**Изоляция**: каждый файл тестов получает собственный контекст модулей; состояние между файлами не делится.",
      "**Умные запуски**: `--watch`, `--onlyChanged`, `-t 'имя'` по шаблону названия.",
      "**Снапшоты** (`toMatchSnapshot`, `toMatchInlineSnapshot`) фиксируют вывод; обновление — `-u`. Проверяйте diff при ревью.",
      "**Альтернативы**: Vitest (совместимый API, нативная поддержка ESM и Vite), `node:test`. В проектах на Vite часто выбирают Vitest."
    ),
    LK(["Jest: Configuration", JD + "configuration"], ["Jest: Code Transformation", JD + "code-transformation"], ["Jest: Snapshot Testing", JD + "snapshot-testing"])
  ],
  v: [
    ["Зачем `moduleNameMapper` для CSS-файлов?", null, ["Чтобы тесты рендерили стили", "Чтобы импорт `.css` не ломал тест: подставляется заглушка (например, `identity-obj-proxy`)", "Для автопрефиксов", "Для SSR"], 1, "Jest не умеет парсить CSS как JavaScript."],
    ["Какая среда нужна для тестов React-компонентов?", null, ["`node`", "`jsdom`", "`browser`", "`edge`"], 1, "Она предоставляет `document`, `window`."],
    ["Что делает `--runInBand`?", null, ["Ускоряет тесты", "Запускает тесты последовательно в одном процессе", "Включает покрытие", "Обновляет снапшоты"], 1, "Полезно для отладки и на слабых CI-машинах."],
    ["Что верно про покрытие кода?", null, ["100% покрытие гарантирует отсутствие багов", "Покрытие показывает, какие строки и ветки исполнялись, а не проверялись ли они осмысленно", "Покрытие нужно только для бэкенда", "`coverageThreshold` может валить сборку"], [1, 3], "Метрика полезна как сигнал, а не цель."],
    ["Чем `ts-jest` отличается от `@swc/jest`?", null, ["`ts-jest` проверяет типы и работает медленнее; `@swc/jest` только транспилирует и быстрее", "Они идентичны", "`@swc/jest` проверяет типы", "`ts-jest` — только для JavaScript"], 0, "Проверку типов в таком случае выносят в `tsc --noEmit`."],
    ["Когда стоит рассмотреть Vitest вместо Jest?", null, ["В проекте на Vite с нативным ESM и желанием общего конфига", "Всегда, это обязательно", "Когда нет `package.json`", "Никогда"], 0, "API в значительной степени совместим с Jest."]
  ]
},
]);

/* ===================== Jest и тестирование, часть 2 ===================== */
K("jest", [
{
  id: "q-jest-6",
  q: "Чем `jest.fn()`, `jest.spyOn()` и `jest.mock()` отличаются, и в чём разница между `clearAllMocks`, `resetAllMocks` и `restoreAllMocks`?",
  o: ["Это три названия одной функции", "`fn` создаёт мок-функцию, `spyOn` оборачивает существующий метод и позволяет его восстановить, `mock` подменяет модуль; `clear` сбрасывает историю вызовов, `reset` ещё и реализацию, `restore` возвращает оригинал для spy", "`restoreAllMocks` очищает DOM", "`clearAllMocks` удаляет моки навсегда"],
  a: 1,
  e: "Моки хранят историю вызовов (`mock.calls`) и реализацию. Забытый сброс — частая причина зависимости тестов друг от друга. В конфигурации можно включить `clearMocks`, `resetMocks` или `restoreMocks`, чтобы это происходило автоматически между тестами.",
  d: [
    H("Моки и шпионы"),
    C(`const cb = jest.fn().mockReturnValueOnce(1).mockReturnValue(2);
cb(); cb(); cb();                          // 1, 2, 2
expect(cb).toHaveBeenCalledTimes(3);

const spy = jest.spyOn(api, "get").mockResolvedValue({ id: 1 });
await service.load();
expect(spy).toHaveBeenCalledWith("/users/1");
spy.mockRestore();                         // вернуть оригинальный api.get

afterEach(() => jest.restoreAllMocks());`),
    UL(
      "**`mockClear`**: сбрасывает `mock.calls` и `mock.results`.",
      "**`mockReset`**: то же + удаляет заданные реализации (мок возвращает `undefined`).",
      "**`mockRestore`**: то же + возвращает оригинал (только для `spyOn`).",
      "**Реализации**: `mockReturnValue`, `mockResolvedValue`, `mockRejectedValue`, `mockImplementation`, `...Once`.",
      "**Проверки**: `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenLastCalledWith`, `toHaveBeenNthCalledWith`.",
      "**Что мокать**: границы системы (сеть, время, случайность, файловая система); не мокать то, что тестируется, и простые чистые функции."
    ),
    LK(["Jest: Mock Functions", "https://jestjs.io/docs/mock-functions"], ["Jest: Mock API", "https://jestjs.io/docs/mock-function-api"])
  ],
  v: [
    ["Что делает `jest.spyOn(obj, 'method')`?", null, ["Оборачивает метод, сохраняя возможность вернуть оригинал", "Создаёт новый объект", "Удаляет метод", "Блокирует вызовы"], 0, "По умолчанию вызывает оригинальную реализацию."],
    ["Что сбрасывает `mockClear`?", null, ["Историю вызовов", "Реализацию и историю", "Оригинал функции", "Таймеры"], 0, "Реализация остаётся."],
    ["Что делает `mockRestore`?", null, ["Возвращает оригинальную реализацию для spy", "Очищает DOM", "Создаёт мок", "Запускает тест заново"], 0, "Для `jest.fn()` оригинала нет."],
    ["Как мок вернёт промис с данными?", null, ["`mockResolvedValue(data)`", "`mockReturn(data)`", "`mockAsync(data)`", "`mockPromise`"], 0, "Есть и `mockRejectedValue`."],
    ["Чем плохо мокать тестируемую функцию?", null, ["Тест проверяет мок, а не код", "Это замедляет тесты", "Jest запрещает", "Нет типов"], 0, "Мокают зависимости."],
    ["Что включает опция `restoreMocks: true`?", null, ["Автоматический `restoreAllMocks` перед каждым тестом", "Запуск в браузере", "Сохранение снимков", "Снижение лога"], 0, "Тесты не влияют друг на друга."]
  ]
},
{
  id: "q-jest-7",
  q: "Как правильно писать асинхронные тесты в Jest: `async/await`, `resolves/rejects`, `done`, и почему тест может «пройти», хотя проверка не выполнялась?",
  o: ["Для асинхронного кода достаточно синхронного теста", "Тест должен вернуть Promise или быть `async`; иначе Jest завершит его раньше колбэка, и `expect` внутри не повлияет на результат. Для ошибок используют `await expect(p).rejects.toThrow()`", "Колбэк `done` обязателен в каждом тесте", "`expect.assertions` применять нельзя"],
  a: 1,
  e: "Если не вернуть и не дождаться промис, Jest считает тест выполненным сразу после синхронной части. Защищаются `expect.assertions(n)` или `expect.hasAssertions()`, а также линтером (`jest/valid-expect`, `no-floating-promises`).",
  d: [
    H("Асинхронные тесты"),
    C(`// плохо: промис не ждут, тест проходит всегда
test("bad", () => {
  fetchUser().then((u) => expect(u.id).toBe(2));
});

// хорошо
test("loads user", async () => {
  await expect(fetchUser()).resolves.toMatchObject({ id: 1 });
});

test("fails", async () => {
  expect.assertions(1);
  await expect(fetchBroken()).rejects.toThrow("not found");
});

test("callback", (done) => {
  subscribe((v) => { expect(v).toBe(1); done(); });
});`),
    UL(
      "**`resolves`/`rejects`** разворачивают Promise в проверку, но `await` перед `expect` обязателен.",
      "**`done`** подходит для колбэков, но при ошибке внутри без `try/catch` тест зависнет до таймаута.",
      "**Таймаут** по умолчанию 5 секунд; `jest.setTimeout(ms)` или третий аргумент `test`.",
      "**React Testing Library**: `findBy*`, `waitFor`, `await user.click(...)`; предупреждение `act(...)` означает, что обновление состояния произошло вне ожидаемого окна.",
      "**Таймеры**: при fake timers нужны `await jest.advanceTimersByTimeAsync(...)` либо `runAllTimersAsync` для промисов.",
      "**Утечки**: незавершённые таймеры, соединения и открытые дескрипторы удерживают процесс (`--detectOpenHandles`)."
    ),
    LK(["Jest: Testing Asynchronous Code", "https://jestjs.io/docs/asynchronous"], ["eslint-plugin-jest", "https://github.com/jest-community/eslint-plugin-jest"])
  ],
  v: [
    ["Почему тест `() => { p.then(check) }` ненадёжен?", null, ["Промис не возвращён, Jest не ждёт `check`", "Слишком много кода", "Нет моков", "Нет импорта"], 0, "Нужно `return` или `await`."],
    ["Что делает `expect.assertions(1)`?", null, ["Требует ровно одну выполненную проверку", "Ограничивает время", "Отключает моки", "Запускает один тест"], 0, "Защищает от пропущенных проверок."],
    ["Как проверить, что промис отклонён с ошибкой?", null, ["`await expect(p).rejects.toThrow('msg')`", "`expect(p).toThrow()`", "`try { p }`", "`expect(p).toBe(Error)`"], 0, "Важно ждать результат."],
    ["Когда нужен `done`?", null, ["Для проверки колбэков без промисов", "Для каждого теста", "Для снимков", "Для моков модулей"], 0, "Иначе используйте `async`."],
    ["Что означает предупреждение `not wrapped in act(...)`?", null, ["Обновление состояния произошло вне ожидаемого окна", "Тест слишком быстрый", "Нет `jest.fn`", "Ошибка синтаксиса"], 0, "Дождитесь появления результата через `findBy*`."],
    ["Какой флаг показывает незакрытые ресурсы?", null, ["`--detectOpenHandles`", "`--coverage`", "`--watchAll`", "`--silent`"], 0, "Помогает найти зависшие таймеры и сокеты."]
  ]
},
{
  id: "q-jest-8",
  q: "Когда уместны snapshot-тесты, а когда они вредны? Чем inline snapshots отличаются от файловых?",
  o: ["Снимки лучше всего подходят для проверки любой логики", "Снимки полезны для небольших стабильных структур (сериализованный вывод, конфиги, сообщения), но в крупных и часто меняющихся снимках их бездумно обновляют, и они перестают находить ошибки", "Снимок нельзя обновить", "Inline snapshots хранятся в отдельной папке"],
  a: 1,
  e: "Snapshot фиксирует вывод, но не объясняет, что именно должно быть верным. Огромные снимки компонентов шумят при каждом изменении разметки, а ревьюеры привыкают нажимать `-u`. Лучше точечные проверки и небольшие inline snapshots.",
  d: [
    H("Snapshot-тесты"),
    C(`test("format", () => {
  expect(formatPrice(1234.5)).toMatchInlineSnapshot(\`"1 234,50 ₽"\`);
});

test("config", () => {
  expect(buildConfig("prod")).toMatchSnapshot();    // файл __snapshots__/*.snap
});

// стабилизация динамических значений
expect(user).toMatchSnapshot({ id: expect.any(String), createdAt: expect.any(Date) });`),
    UL(
      "**Файловые снимки** (`__snapshots__`) попадают в репозиторий и проверяются на ревью.",
      "**Inline-снимки** лежат в тесте — видно ожидаемое значение прямо в коде.",
      "**Обновление**: `jest -u`; устаревшие снимки показывает `--ci`/отчёт.",
      "**Проблемы**: нестабильные значения (даты, id), слишком большие снимки, отсутствие смысла проверки.",
      "**Альтернативы для UI**: проверки по роли и тексту (Testing Library), визуальные тесты (Playwright, Chromatic).",
      "**Property matchers**: `expect.any`, `expect.stringContaining` для динамических полей."
    ),
    LK(["Jest: Snapshot Testing", "https://jestjs.io/docs/snapshot-testing"])
  ],
  v: [
    ["Какой снимок виден прямо в коде теста?", null, ["`toMatchInlineSnapshot`", "`toMatchSnapshot`", "`toEqualSnapshot`", "`toBeSnapshot`"], 0, "Остальные пишут в файл."],
    ["Чем вредят огромные снимки?", null, ["Их бездумно обновляют и они перестают находить ошибки", "Они медленно запускаются только в CI", "Они запрещены в Jest", "Они ломают TypeScript"], 0, "Нет явного смысла проверки."],
    ["Как обновить снимки?", null, ["`jest -u`", "`jest --fix`", "`jest --reset`", "`jest --snap`"], 0, "Результат нужно проверять в diff."],
    ["Как справиться с динамическими полями?", null, ["Property matchers: `expect.any(String)`", "Игнорировать тесты", "Удалять поля", "Перезапускать тест"], 0, "Остальная структура фиксируется."],
    ["Что лучше для проверки интерфейса?", null, ["Запросы по роли и тексту (Testing Library)", "Огромный snapshot DOM", "Сравнение строк HTML", "Скриншот в `console.log`"], 0, "Проверяют поведение пользователя."],
    ["Где хранятся файловые снимки?", null, ["`__snapshots__`", "`node_modules`", "`dist`", "`.cache`"], 0, "И коммитятся."]
  ]
},
{
  id: "q-jest-9",
  q: "Как тестировать React-компоненты и хуки: `render`, `renderHook`, провайдеры, роутер, формы, и что считается деталью реализации?",
  o: ["Нужно проверять внутреннее состояние компонента через его поля", "Рендерить компонент с нужными провайдерами и проверять то, что видит и делает пользователь (роли, текст, события), а хуки тестировать через `renderHook`; детали вроде `useState`, имён внутренних функций проверять не нужно", "Лучше всего тестировать только снимками", "Компоненты нельзя тестировать без браузера"],
  a: 1,
  e: "Тест, привязанный к реализации, ломается при рефакторинге, хотя поведение не изменилось. Testing Library поощряет запросы через доступные роли и тексты: так тесты ближе к реальному использованию и заодно проверяют доступность.",
  d: [
    H("Компоненты и хуки"),
    C(`function renderWithProviders(ui, { route = "/" } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

test("счётчик увеличивается", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole("button", { name: "Прибавить" }));
  expect(screen.getByText("Счётчик: 1")).toBeInTheDocument();
});

test("useCounter", () => {
  const { result } = renderHook(() => useCounter(1));
  act(() => result.current.inc());
  expect(result.current.value).toBe(2);
});`),
    UL(
      "**Приоритет запросов**: `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText` → `getByTestId` (последний вариант).",
      "**`getBy`** бросает ошибку, если нет; **`queryBy`** возвращает `null` (для проверки отсутствия); **`findBy`** ждёт появления.",
      "**`within(element)`** сужает область поиска.",
      "**jest-dom**: `toBeInTheDocument`, `toBeDisabled`, `toHaveValue`, `toHaveAccessibleName`.",
      "**Что не проверять**: вызовы `setState`, внутренние хуки, структуру дочерних компонентов.",
      "**Server Components и Next.js**: тестируют отдельные функции и клиентские компоненты, остальное покрывают e2e."
    ),
    LK(["Testing Library: React", "https://testing-library.com/docs/react-testing-library/intro/"], ["Guiding principles", "https://testing-library.com/docs/guiding-principles"])
  ],
  v: [
    ["Какой запрос имеет высший приоритет?", null, ["`getByRole`", "`getByTestId`", "`container.querySelector`", "`getByClassName`"], 0, "Он ближе всего к восприятию пользователя."],
    ["Как проверить отсутствие элемента?", null, ["`queryBy*` вернёт `null`", "`getBy*` внутри `try`", "`findBy*` без `await`", "`getAllBy*`"], 0, "`getBy*` бросит ошибку."],
    ["Что такое `renderHook`?", null, ["Рендер хука в тестовом компоненте", "Рендер DOM в консоль", "Мок хука", "Снимок хука"], 0, "Возвращает `result.current`."],
    ["Что считается деталью реализации?", null, ["Внутреннее состояние и структура дочерних компонентов", "Текст кнопки", "Роль элемента", "Результат клика"], 0, "Пользователь их не видит."],
    ["Зачем оборачивать тестируемый компонент в провайдеры?", null, ["Дать ему контекст, роутер, кеш как в приложении", "Ускорить тест", "Скрыть ошибки", "Включить snapshot"], 0, "Часто делают функцию `renderWithProviders`."],
    ["Для чего `within`?", null, ["Ограничить поиск конкретным контейнером", "Ожидать появление", "Сделать мок", "Запустить таймер"], 0, "Удобно для таблиц и списков."]
  ]
},
{
  id: "q-jest-10",
  q: "Как мокать модули в Jest: ручные моки `__mocks__`, `jest.requireActual`, частичные моки, ESM и `jest.unstable_mockModule`?",
  o: ["Моки модулей невозможно настроить для отдельных функций", "Фабрика `jest.mock(path, () => ({...}))` подменяет модуль, `requireActual` позволяет оставить часть реальных функций, папка `__mocks__` хранит ручные моки; для нативного ESM нужен `unstable_mockModule`", "`jest.mock` в ESM работает так же, как в CommonJS, без ограничений", "Моки всегда нужно писать в отдельном процессе"],
  a: 1,
  e: "`jest.mock` поднимается (hoisting) Babel/ts-jest выше `import`, поэтому подмена применяется до загрузки модуля. В нативном ESM `import` выполняется раньше любого кода, поэтому нужен динамический импорт после `unstable_mockModule` либо Vitest с `vi.mock`.",
  d: [
    H("Мокирование модулей"),
    C(`jest.mock("./api");                                      // автомок: все функции → jest.fn()
jest.mock("./config", () => ({ API_URL: "http://test" })); // фабрика

jest.mock("./utils", () => ({
  ...jest.requireActual("./utils"),                        // оставить реальные функции
  nowIso: jest.fn(() => "2026-01-01T00:00:00Z"),           // подменить одну
}));

import { get } from "./api";
(get as jest.Mock).mockResolvedValue({ ok: true });

// ESM
jest.unstable_mockModule("./api.js", () => ({ get: jest.fn() }));
const { get } = await import("./api.js");`),
    UL(
      "**Hoisting**: вызовы `jest.mock` переносятся вверх; переменные из внешней области в фабрике должны начинаться с `mock` или быть импортированы внутри.",
      "**Ручные моки**: файл `__mocks__/axios.ts` рядом с `node_modules` подменяет пакет автоматически.",
      "**`jest.isolateModules` / `jest.resetModules`**: чистый кеш модулей для теста.",
      "**Мок класса**: `jest.mock('./Mailer')` создаёт автомок; `Mailer.mock.instances`.",
      "**Альтернативы мокам**: внедрение зависимостей параметром, MSW для сети — тест остаётся ближе к реальности.",
      "**Типы**: `jest.mocked(fn)` даёт корректные типы вместо приведения `as jest.Mock`."
    ),
    LK(["Jest: Manual Mocks", "https://jestjs.io/docs/manual-mocks"], ["Jest: ECMAScript Modules", "https://jestjs.io/docs/ecmascript-modules"])
  ],
  v: [
    ["Что делает `jest.requireActual`?", null, ["Загружает реальный модуль, минуя мок", "Загружает мок", "Очищает кеш", "Создаёт автомок"], 0, "Нужен для частичных моков."],
    ["Где хранится ручной мок пакета `axios`?", null, ["`__mocks__/axios.js` рядом с `node_modules`", "`node_modules/axios/mock`", "`dist/axios`", "`src/mock`"], 0, "Подхватывается автоматически."],
    ["Что такое hoisting у `jest.mock`?", null, ["Перенос вызова выше импортов", "Кеш результата", "Удаление мока", "Сортировка тестов"], 0, "Выполняется Babel/ts-jest."],
    ["Какой префикс разрешён у внешних переменных в фабрике?", null, ["`mock`", "`test`", "`jest`", "`spy`"], 0, "Иначе ошибка при hoisting."],
    ["Чем заменить мок сети, чтобы тест был ближе к реальности?", null, ["MSW", "`setTimeout`", "`localStorage`", "Реальный сервер в тесте"], 0, "Он перехватывает запросы на уровне сети."],
    ["Для чего `jest.mocked(fn)`?", null, ["Получить корректный тип мока", "Создать мок", "Отключить мок", "Запустить функцию"], 0, "Лучше, чем `as jest.Mock`."]
  ]
},
{
  id: "q-jest-11",
  q: "Как проектировать надёжные тесты: AAA, изоляция, детерминизм, борьба с flaky-тестами и осмысленное покрытие?",
  o: ["Чем выше процент покрытия, тем лучше качество, поэтому нужно стремиться к 100% любой ценой", "Структура Arrange–Act–Assert, независимость тестов, управление временем и случайностью, отказ от sleep и от внешних зависимостей; покрытие показывает непроверенный код, но не гарантирует качество", "Flaky-тесты нужно просто перезапускать", "Тесты должны зависеть друг от друга для скорости"],
  a: 1,
  e: "Нестабильные тесты разрушают доверие. Причины: гонки, реальное время, общий изменяемый стейт, порядок выполнения, сеть, часовые пояса. Покрытие строк можно получить, ничего не проверяя (нет `expect`), поэтому метрику используют как подсказку.",
  d: [
    H("Качество тестов"),
    C(`test("применяет скидку к заказу", () => {
  // Arrange
  const order = makeOrder({ items: [{ price: 100, qty: 2 }], coupon: "SALE10" });
  // Act
  const total = calcTotal(order);
  // Assert
  expect(total).toBe(180);
});

beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date("2026-01-01T00:00:00Z")); });
afterEach(() => { jest.useRealTimers(); });`),
    UL(
      "**Один тест — одно поведение**; название описывает сценарий и ожидание.",
      "**Фабрики данных** (`makeOrder`) вместо копирования огромных фикстур.",
      "**Детерминизм**: фиксировать время (`setSystemTime`), зерно случайности, часовой пояс (`TZ=UTC`).",
      "**Не использовать `sleep`**: ждать событие или состояние (`findBy*`, fake timers).",
      "**Пирамида тестов**: много быстрых юнит-тестов, меньше интеграционных, мало e2e; «трофей тестирования» (Kent C. Dodds) делает упор на интеграцию.",
      "**Покрытие**: пороги в `coverageThreshold` как защита от деградации, branch-покрытие информативнее строк; мутационное тестирование (Stryker) проверяет качество проверок.",
      "**Flaky**: найти причину, изолировать, при необходимости карантин с задачей на починку, повторы только как временная мера."
    ),
    LK(["Testing Trophy", "https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications"], ["Jest: coverage", "https://jestjs.io/docs/configuration#collectcoverage-boolean"])
  ],
  v: [
    ["Что означает AAA?", null, ["Arrange, Act, Assert", "Async, Await, Assert", "Always, After, All", "Add, Apply, Approve"], 0, "Подготовка, действие, проверка."],
    ["Что такое flaky-тест?", null, ["Тест, дающий разный результат без изменений кода", "Очень медленный тест", "Тест без проверок", "Тест на TypeScript"], 0, "Доверие к набору тестов падает."],
    ["Как зафиксировать текущее время?", null, ["`jest.useFakeTimers().setSystemTime(date)`", "`Date.now = 1`", "`sleep(1000)`", "Невозможно"], 0, "И вернуть `useRealTimers`."],
    ["Гарантирует ли 100% покрытие корректность?", null, ["Нет, строки могут выполняться без проверок", "Да", "Только branch", "Только для TypeScript"], 0, "Нужны осмысленные проверки."],
    ["Что проверяет мутационное тестирование?", null, ["Ловят ли тесты искусственно внесённые ошибки", "Скорость тестов", "Размер бандла", "Стиль кода"], 0, "Например, Stryker."],
    ["Чем заменить `sleep(500)` в тесте?", null, ["Ожиданием события или состояния", "Большим числом повторов", "`console.log`", "Отключением теста"], 0, "Иначе тест медленный и нестабильный."]
  ]
},
{
  id: "q-jest-12",
  q: "Чем Vitest отличается от Jest и когда стоит выбрать `node:test`?",
  o: ["Vitest нельзя использовать в проектах на React", "Vitest использует Vite и нативный ESM/TypeScript, почти совместим по API (`vi` вместо `jest`), быстрее стартует; Jest зрелее и распространён в старых проектах; `node:test` подходит для библиотек и сервисов без зависимостей", "Vitest не поддерживает моки", "`node:test` умеет только снимки"],
  a: 1,
  e: "Если проект собирается Vite, Vitest использует тот же конфиг и трансформации, поэтому не нужен отдельный Babel/ts-jest. Миграция с Jest обычно сводится к замене `jest.*` на `vi.*`, настройке окружения и импортам глобалей.",
  d: [
    H("Выбор раннера"),
    C(`// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "jsdom", setupFiles: ["./setup.ts"], globals: true, coverage: { provider: "v8" } },
});

// тест
import { describe, it, expect, vi } from "vitest";
const spy = vi.spyOn(api, "get").mockResolvedValue({ ok: true });
vi.useFakeTimers();`),
    UL(
      "**Jest**: зрелый, большая экосистема, `jest-environment-jsdom`, мощные моки; ESM поддерживается экспериментально.",
      "**Vitest**: быстрый watch (на графе модулей Vite), нативные ESM и TypeScript, совместимые матчеры (`expect`), встроенный UI и type-тесты.",
      "**`node:test`**: без зависимостей, подходит для серверного кода и библиотек; для UI-тестов нужен jsdom/happy-dom вручную.",
      "**Playwright Test / Cypress**: e2e и компонентные тесты в реальном браузере.",
      "**Критерии**: сборщик проекта, ESM/TypeScript, экосистема матчеров, скорость CI, поддержка команды.",
      "**Окружения**: `jsdom` и `happy-dom` эмулируют DOM; они не заменяют реальный браузер (layout, CSS, `IntersectionObserver` требуют моков)."
    ),
    LK(["Vitest", "https://vitest.dev/guide/"], ["Migrating from Jest", "https://vitest.dev/guide/migration.html#migrating-from-jest"])
  ],
  v: [
    ["Чем в Vitest заменяют объект `jest`?", null, ["`vi`", "`vt`", "`mock`", "`test`"], 0, "Например, `vi.fn()`."],
    ["Какой сборщик лежит в основе Vitest?", null, ["Vite", "Webpack", "Rollup только", "Parcel"], 0, "Конфиг общий с проектом."],
    ["Когда подходит `node:test`?", null, ["Серверный код и библиотеки без зависимостей", "Тесты React без настройки", "Визуальные тесты", "Только браузер"], 0, "Встроен в Node.js."],
    ["Заменяет ли jsdom реальный браузер?", null, ["Нет, layout и часть API отсутствуют", "Да", "Только для CSS", "Только для событий"], 0, "Для этого нужен e2e."],
    ["Что нужно при миграции с Jest на Vitest?", null, ["Заменить `jest.*` на `vi.*` и настроить окружение", "Переписать все тесты", "Сменить язык", "Ничего"], 0, "API в основном совместим."],
    ["Какие инструменты выполняют e2e в браузере?", null, ["Playwright, Cypress", "Prettier", "ESLint", "Babel"], 0, "Проверяют приложение целиком."]
  ]
},
{
  id: "q-jest-13",
  q: "Как тестировать работу с сетью: MSW против моков `fetch`, контрактные тесты и e2e-тесты (Playwright)?",
  o: ["Для сети достаточно проверять, что вызван `fetch`", "MSW перехватывает запросы на уровне сети и отдаёт заданные ответы, поэтому код клиента проверяется целиком; контрактные тесты фиксируют форму API, а e2e (Playwright) проверяют критичные пользовательские сценарии на реальном стенде", "Реальный API во всех юнит-тестах — лучший вариант", "Моки сети не нужны в e2e"],
  a: 1,
  e: "Мок функции `fetch` проверяет лишь вызовы и легко расходится с реальным поведением. MSW работает с настоящими `Request/Response`, и те же обработчики можно использовать в тестах и в разработке. Для надёжности API добавляют контрактные тесты (Pact, схемы OpenAPI).",
  d: [
    H("Тесты сети"),
    C(`import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/users/:id", ({ params }) => HttpResponse.json({ id: params.id, name: "Ada" })),
);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("ошибка сервера", async () => {
  server.use(http.get("/api/users/1", () => HttpResponse.json({ message: "boom" }, { status: 500 })));
  render(<Profile id="1" />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось загрузить");
});

// Playwright
test("оформление заказа", async ({ page }) => {
  await page.goto("/cart");
  await page.getByRole("button", { name: "Оплатить" }).click();
  await expect(page.getByText("Заказ создан")).toBeVisible();
});`),
    UL(
      "**`onUnhandledRequest: 'error'`** не даёт тестам незаметно ходить в реальную сеть.",
      "**Playwright**: авто-ожидания, параллельность, трассировка (`trace viewer`), встроенный мок сети `page.route`.",
      "**Контрактные тесты**: потребитель описывает ожидания, поставщик их проверяет (Pact); альтернативы — генерация типов из OpenAPI.",
      "**Что идёт в e2e**: вход, оплата, ключевые пути; остальное покрывается быстрее на нижних уровнях.",
      "**Тестовые данные**: изолированные аккаунты, сброс состояния БД между тестами.",
      "**Стабильность e2e**: ролевые локаторы, отказ от фиксированных пауз, повторный запуск только для диагностики."
    ),
    LK(["MSW", "https://mswjs.io/docs/"], ["Playwright", "https://playwright.dev/docs/intro"], ["Pact", "https://docs.pact.io/"])
  ],
  v: [
    ["На каком уровне MSW перехватывает запросы?", null, ["На сетевом уровне (Service Worker/Node interceptors)", "Подменяет React", "Правит DOM", "Работает как прокси ОС"], 0, "Код клиента остаётся неизменным."],
    ["Что делает `onUnhandledRequest: 'error'`?", null, ["Падает на запросах без обработчика", "Игнорирует их", "Логирует тихо", "Повторяет"], 0, "Так видно непокрытые вызовы."],
    ["Чем плох мок самой функции `fetch`?", null, ["Расходится с реальным поведением и проверяет лишь вызовы", "Он медленный", "Он запрещён", "Он не работает в Node"], 0, "MSW ближе к реальности."],
    ["Что фиксируют контрактные тесты?", null, ["Форму взаимодействия между клиентом и API", "Цвета интерфейса", "Версию Node", "Размер бандла"], 0, "Например, Pact."],
    ["Что стоит проверять в e2e?", null, ["Критичные пользовательские сценарии", "Каждую функцию", "Каждый стиль", "Тип данных"], 0, "Они дорогие и медленные."],
    ["Как делать e2e-локаторы стабильными?", null, ["Через роли и доступные имена", "Через nth-child", "Через длинные CSS-пути", "Через координаты"], 0, "`getByRole`."]
  ]
},
{
  id: "q-jest-14",
  q: "Как использовать `test.each`, `describe`, хуки `beforeAll/beforeEach/afterEach/afterAll` и в каком порядке они выполняются?",
  o: ["Хуки выполняются в произвольном порядке", "`beforeAll` один раз перед группой, `beforeEach` перед каждым тестом (внешние раньше внутренних), `afterEach` после (внутренние раньше внешних), `afterAll` один раз в конце; `test.each` параметризует один сценарий таблицей данных", "`test.each` запускает один и тот же тест по таймеру", "`afterEach` вызывается только при ошибке"],
  a: 1,
  e: "Параметризованные тесты уменьшают дублирование и делают граничные случаи наглядными. Общее изменяемое состояние между тестами нужно создавать в `beforeEach`, а не в теле `describe` (оно выполняется один раз при сборе тестов).",
  d: [
    H("Структура тестов"),
    C(`describe("calcDiscount", () => {
  let cart;
  beforeAll(() => { /* дорогая общая подготовка, один раз */ });
  beforeEach(() => { cart = makeCart(); });         // свежее состояние перед каждым тестом
  afterEach(() => { jest.restoreAllMocks(); });

  test.each([
    [0, 100, 100],
    [10, 100, 90],
    [100, 100, 0],
  ])("скидка %i%% к %i даёт %i", (percent, price, expected) => {
    expect(applyDiscount(price, percent)).toBe(expected);
  });

  test.each([
    { input: -1, error: "negative" },
    { input: 101, error: "too big" },
  ])("отклоняет $input", ({ input, error }) => {
    expect(() => applyDiscount(100, input)).toThrow(error);
  });
});`),
    UL(
      "**Порядок**: внешний `beforeAll` → внешний `beforeEach` → внутренний `beforeEach` → тест → внутренний `afterEach` → внешний `afterEach` → … → `afterAll`.",
      "**`test.only` / `describe.skip` / `test.todo`** управляют набором тестов; `only` не должен попадать в коммит (линтер).",
      "**Код в теле `describe`** выполняется на этапе сбора, а не при запуске тестов.",
      "**Форматы `each`**: массив массивов, массив объектов, табличный шаблонный литерал.",
      "**Изоляция файлов**: каждый тестовый файл запускается в отдельном контексте; между файлами состояние не делится.",
      "**Параллельность**: файлы выполняются параллельно воркерами; `--runInBand` запускает последовательно (удобно для отладки и общей БД)."
    ),
    LK(["Jest: Setup and Teardown", "https://jestjs.io/docs/setup-teardown"], ["Jest: test.each", "https://jestjs.io/docs/api#testeachtablename-fn-timeout"])
  ],
  v: [
    ["Сколько раз выполняется `beforeAll` в `describe`?", null, ["Один раз", "Перед каждым тестом", "Дважды", "Не выполняется"], 0, "`beforeEach` — перед каждым."],
    ["В каком порядке выполняются `afterEach` вложенных блоков?", null, ["Сначала внутренний, затем внешний", "Сначала внешний", "Одновременно", "Случайно"], 0, "Обратный порядок относительно `beforeEach`."],
    ["Для чего `test.each`?", null, ["Параметризовать один сценарий таблицей данных", "Запускать тест по таймеру", "Пропускать тесты", "Мокать функции"], 0, "Меньше дублирования."],
    ["Когда выполняется код в теле `describe`?", null, ["При сборе тестов, один раз", "Перед каждым тестом", "После тестов", "Никогда"], 0, "Состояние лучше готовить в `beforeEach`."],
    ["Что делает `--runInBand`?", null, ["Запускает тесты последовательно в одном процессе", "Увеличивает параллелизм", "Включает покрытие", "Отключает моки"], 0, "Удобно при отладке."],
    ["Чем опасен `test.only` в коммите?", null, ["Остальные тесты не запускаются", "Он ускоряет всё", "Он ломает типы", "Ничем"], 0, "Нужен линтер `no-focused-tests`."]
  ]
}
]);
