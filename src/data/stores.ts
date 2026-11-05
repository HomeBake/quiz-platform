import { C, H, LK, P, RD, UL } from "./registry";
import { K } from "./helpers";
/* ===================== Сторы ===================== */
K("state", [
{
  id: "q-st-1",
  q: "Почему в `createSlice` из Redux Toolkit можно писать `state.count += 1`, хотя редьюсеры в Redux обязаны быть чистыми и не мутировать состояние?",
  o: ["Redux Toolkit отключает проверку иммутабельности", "Внутри редьюсера `state` — это Immer-черновик (draft): мутации записываются, а результат — новый неизменяемый объект", "Redux Toolkit хранит состояние в `Proxy` и мутирует его по-настоящему", "Это ошибка, так писать нельзя"],
  a: 1,
  e: "RTK использует Immer: `state` — прокси-черновик; по окончании редьюсера Immer создаёт новое состояние с общими неизменёнными частями. Внутри одного редьюсера нельзя одновременно мутировать черновик и возвращать новое значение.",
  d: [
    H("Redux: принципы и Redux Toolkit"),
    P("Redux строится на трёх идеях: **единое хранилище**, состояние **меняется только через action** (описание события), а новое состояние вычисляет **чистый редьюсер** `(state, action) => newState`. Отсюда предсказуемость, time-travel в DevTools и лёгкое тестирование."),
    C(`import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const fetchUser = createAsyncThunk("user/fetch", async (id) => {
  const res = await fetch("/api/users/" + id);
  return res.json();                   // станет action.payload у fulfilled
});

const userSlice = createSlice({
  name: "user",
  initialState: { entity: null, status: "idle" },
  reducers: {
    renamed(state, action) { state.entity.name = action.payload; }, // «мутация» черновика Immer
  },
  extraReducers: (b) => b
    .addCase(fetchUser.pending,   (s) => { s.status = "loading"; })
    .addCase(fetchUser.fulfilled, (s, a) => { s.status = "ok"; s.entity = a.payload; })
    .addCase(fetchUser.rejected,  (s) => { s.status = "error"; }),
});

export const store = configureStore({ reducer: { user: userSlice.reducer } });`),
    UL(
      "**`configureStore`** по умолчанию подключает thunk-middleware, Redux DevTools и dev-проверки на мутации и несериализуемые значения.",
      "**Immer**: можно либо мутировать `state`, либо **вернуть** новое значение, но не оба варианта сразу.",
      "**`createAsyncThunk`** генерирует действия `pending/fulfilled/rejected`.",
      "**RTK Query** — часть Toolkit для серверных данных (кеш, инвалидация), аналог TanStack Query.",
      "Нужно держать в сторе **сериализуемые** данные: функции, `Promise`, `Map` и классы туда класть не принято."
    ),
    LK(["Redux: Three Principles", "https://redux.js.org/understanding/thinking-in-redux/three-principles"], ["Redux Toolkit: createSlice", "https://redux-toolkit.js.org/api/createSlice"], ["Redux Toolkit: configureStore", "https://redux-toolkit.js.org/api/configureStore"])
  ],
  v: [
    ["Что выведет код (чистый редьюсер без мутаций)?", "const reducer = (s = { n: 0 }, a) => a.type === 'inc' ? { ...s, n: s.n + 1 } : s;\nconst s0 = reducer(undefined, { type: '@@init' });\nconst s1 = reducer(s0, { type: 'inc' });\nconst s2 = reducer(s1, { type: 'other' });\nconsole.log(s0 === s1, s1 === s2, s1.n);", ["true true 1", "false true 1", "false false 1", "false true 0"], 1, "`inc` создаёт новый объект, неизвестное действие возвращает то же состояние — это основа сравнения по ссылке.", true],
    ["Что делает `createSlice`?", null, ["Только создаёт хранилище", "Генерирует редьюсер и action creators по описанию редьюсеров", "Подключает React", "Заменяет middleware"], 1, "Из `reducers` формируются `slice.actions` и `slice.reducer`."],
    ["Что нельзя делать внутри редьюсера `createSlice`?", null, ["Мутировать черновик `state`", "Одновременно мутировать черновик и возвращать новое значение", "Возвращать новое значение без мутаций", "Использовать `switch`"], 1, "Immer выбросит ошибку: нужно выбрать один из способов."],
    ["Какую роль в Redux играют middleware?", null, ["Заменяют редьюсеры", "Перехватывают action между отправкой и редьюсером (асинхронность, логирование)", "Хранят данные", "Рендерят компоненты"], 1, "Thunk, saga и другие расширяют `dispatch`."],
    ["Какие побочные эффекты допустимы в самом редьюсере?", null, ["Запрос на сервер", "`Date.now()` для метки времени", "Никакие: он должен быть чистой функцией", "Запись в `localStorage`"], 2, "Время и случайные значения генерируют до `dispatch` (например, `prepare` callback), а эффекты выносят в thunk/middleware."],
    ["Что верно про Redux Toolkit?", null, ["`configureStore` включает DevTools и thunk по умолчанию", "RTK Query умеет кешировать серверные данные", "В сторе рекомендуется хранить несериализуемые значения", "`createAsyncThunk` генерирует `pending/fulfilled/rejected`"], [0, 1, 3], "Несериализуемые данные ломают DevTools и персист, dev-проверка предупреждает об этом."]
  ]
},
{
  id: "q-st-2",
  q: "Почему селектор `useStore((s) => ({ a: s.a, b: s.b }))` в Zustand плох, и как это исправить?",
  o: ["Селекторы нельзя возвращать объектами вообще", "Каждый вызов создаёт новый объект, значит сравнение по ссылке всегда «не равно» (лишние рендеры; в Zustand v5 возможен бесконечный цикл) — нужен `useShallow` или отдельные селекторы", "Нужно подписаться на весь стор", "Нужно обернуть селектор в `useEffect`"],
  a: 1,
  e: "Подписка сравнивает результат селектора через `Object.is`. Новый объект при каждом вызове приводит к лишним перерисовкам, а в Zustand v5 — к ошибке «Maximum update depth exceeded». Решение: `useShallow`, отдельные селекторы для каждого поля или стабильные ссылки.",
  d: [
    H("Селекторы и лишние рендеры в сторах"),
    P("Любой стор с подпиской в React (Redux `useSelector`, Zustand `useStore`) работает одинаково: после изменения состояния вызывается ваш селектор, и компонент перерисовывается, если результат изменился по `Object.is`. Поэтому важно возвращать **примитив или стабильную ссылку**."),
    C(`// плохо: новый объект каждый раз
const { a, b } = useStore((s) => ({ a: s.a, b: s.b }));

// хорошо 1: отдельные подписки
const a = useStore((s) => s.a);
const b = useStore((s) => s.b);

// хорошо 2: shallow-сравнение результата
import { useShallow } from "zustand/react/shallow";
const { a, b } = useStore(useShallow((s) => ({ a: s.a, b: s.b })));

// Redux: мемоизированный селектор
import { createSelector } from "@reduxjs/toolkit";
const selectVisible = createSelector(
  [(s) => s.todos, (s) => s.filter],
  (todos, filter) => todos.filter((t) => t.status === filter)
);`),
    UL(
      "**Redux `useSelector`**: так же сравнивает по ссылке; `createSelector` (reselect) пересчитывает значение, только когда изменились входы.",
      "**Подписка на весь стор** (`useStore()` без селектора) вызывает перерисовку при любом изменении.",
      "Производные данные (фильтрация, сортировка) лучше считать в мемоизированном селекторе или `useMemo`, а не хранить копией в состоянии.",
      "Действия (`actions`) в Zustand можно брать селектором: ссылки на функции в сторе стабильны."
    ),
    LK(["Zustand: useShallow", "https://zustand.docs.pmnd.rs/hooks/use-shallow"], ["Redux: Deriving Data with Selectors", "https://redux.js.org/usage/deriving-data-selectors"])
  ],
  v: [
    ["Как Zustand решает, нужно ли перерисовать компонент?", null, ["Глубоким сравнением состояния", "Сравнением результата селектора через `Object.is`", "Всегда перерисовывает", "Сравнением по JSON"], 1, "Результат селектора сравнивается по ссылке/значению (`Object.is`)."],
    ["Какой вариант не вызовет лишних рендеров при изменении поля `c`, если компоненту нужны только `a` и `b`?", null, ["`useStore()` без селектора", "`useStore((s) => ({ a: s.a, b: s.b }))`", "`useStore(useShallow((s) => ({ a: s.a, b: s.b })))`", "`useStore((s) => [s.a, s.b])`"], 2, "Остальные варианты либо подписываются на всё, либо возвращают новую ссылку при каждом вызове."],
    ["Для чего `createSelector` из reselect?", null, ["Для запросов на сервер", "Для мемоизации производных данных: пересчёт только при смене входных значений", "Для создания стора", "Для подписки на DOM"], 1, "Если входы не изменились, возвращается прежняя ссылка на результат."],
    ["Что получится?", "const sel = (s) => ({ a: s.a });\nconst s = { a: 1 };\nconsole.log(Object.is(sel(s), sel(s)));", ["true", "false", "undefined", "Ошибка"], 1, "Каждый вызов создаёт новый объект, и подписка видит «изменение».", true],
    ["Почему в стор не стоит дублировать производные данные (например, `filteredList`)?", null, ["Это запрещено синтаксисом", "Их легко рассинхронизировать с источником; лучше вычислять в селекторе", "Это замедлит DevTools", "Нет причин, это просто стиль"], 1, "Единственный источник истины и вычисление «на лету» уменьшают количество багов."],
    ["Что верно про подписку на весь стор (`useStore()` без селектора)?", null, ["Перерисовка при любом изменении стора", "Это самый эффективный способ", "Подходит для редко меняющихся маленьких сторов", "Запрещена в TypeScript"], [0, 2], "Для больших сторов лучше подписываться на нужные части."]
  ]
},
{
  id: "q-st-3",
  q: "Что делает `set` в Zustand и нужен ли `Provider`?",
  o: ["`set` полностью заменяет состояние, `Provider` обязателен", "`set` поверхностно (shallow) сливает переданный объект с состоянием, `Provider` не нужен — стор это хук/объект вне React", "`set` вызывает `useEffect`, `Provider` нужен для SSR", "`set` работает только внутри компонентов"],
  a: 1,
  e: "`set(partial)` объединяет с текущим состоянием на один уровень (вложенные объекты нужно копировать вручную или через `immer`). Второй аргумент `true` заменяет состояние целиком. Стор создаётся вне React, доступен через хук и через `store.getState()`.",
  d: [
    H("Zustand: устройство и типичные приёмы"),
    C(`import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface CounterState { count: number; inc: () => void; reset: () => void }

export const useCounter = create<CounterState>()(           // «карринг» нужен для TS
  devtools(persist((set, get) => ({
    count: 0,
    inc: () => set((s) => ({ count: s.count + 1 })),
    reset: () => set({ count: 0 }),
  }), { name: "counter" }))
);

useCounter.getState().inc();                    // вне React
useCounter.subscribe((s) => console.log(s.count));`),
    UL(
      "**Нет Provider**: хук подписывается на модуль-синглтон. При SSR (Next.js) глобальный стор общий для всех запросов — для данных пользователя создают стор на запрос и передают через контекст.",
      "**`set` сливает на один уровень**: `set({ user: { name } })` заменит весь объект `user`.",
      "**Middleware**: `persist` (localStorage и др.), `devtools`, `immer`, `subscribeWithSelector`.",
      "**`get()`** читает актуальное состояние внутри действий, в том числе в асинхронных.",
      "Состояние обновляется синхронно; React-подписчики уведомляются через `useSyncExternalStore`."
    ),
    LK(["Zustand: Introduction", "https://zustand.docs.pmnd.rs/"], ["Zustand: persist", "https://zustand.docs.pmnd.rs/middlewares/persist"], ["Zustand: Next.js", "https://zustand.docs.pmnd.rs/guides/nextjs"])
  ],
  v: [
    ["Что будет в состоянии после вызова?", "const state = { a: 1, nested: { x: 1, y: 2 } };\nconst set = (p) => Object.assign(state, p);\nset({ nested: { x: 5 } });\nconsole.log(JSON.stringify(state));", ["{\"a\":1,\"nested\":{\"x\":5,\"y\":2}}", "{\"a\":1,\"nested\":{\"x\":5}}", "{\"nested\":{\"x\":5}}", "{\"a\":1,\"nested\":{\"y\":2}}"], 1, "Слияние поверхностное: вложенный объект заменяется целиком. Так же работает `set` в Zustand.", true],
    ["Зачем в TypeScript пишут `create<State>()(...)`?", null, ["Для скорости", "Из-за ограничений вывода типов в связке с middleware", "Для SSR", "Чтобы отключить DevTools"], 1, "Двойной вызов — приём для частичной передачи параметров типа."],
    ["Как прочитать состояние Zustand вне компонента React?", null, ["Невозможно", "`useStore.getState()`", "`useContext`", "Через `window`"], 1, "Стор — отдельный объект; `getState`, `setState` и `subscribe` доступны напрямую."],
    ["В чём риск глобального стора Zustand при SSR?", null, ["Нет риска", "Модульный синглтон общий для всех запросов на сервере, возможна утечка данных между пользователями", "Он не работает с `fetch`", "Хуки запрещены на сервере"], 1, "Решение: создавать стор на запрос и передавать его через контекст."],
    ["Что делает middleware `persist`?", null, ["Сохраняет состояние в хранилище (по умолчанию `localStorage`) и восстанавливает его", "Отправляет состояние на сервер", "Замораживает состояние", "Включает режим только для чтения"], 0, "Есть опции `name`, `partialize`, `storage`, `version`/`migrate`."],
    ["Какие утверждения верны?", null, ["`set` по умолчанию сливает объекты на один уровень", "Provider в Zustand обязателен", "`get()` возвращает текущее состояние", "`set(state, true)` заменяет состояние целиком", "Подписка внутри React использует `useSyncExternalStore`"], [0, 2, 3, 4], "Provider не нужен, если стор — глобальный модуль."]
  ]
},
{
  id: "q-st-4",
  q: "Как MobX понимает, какие компоненты перерисовывать, и зачем оборачивать компонент в `observer`?",
  o: ["Сравнивает props глубоко", "Во время рендера `observer` отслеживает прочитанные observable-поля и подписывает компонент именно на них (fine-grained reactivity)", "Использует виртуальный DOM вместо React", "Подписывает все компоненты на весь стор"],
  a: 1,
  e: "`observer` оборачивает рендер в реакцию (`Reaction`): всё прочитанное observable записывается как зависимость, и при изменении именно этих значений компонент перерисовывается. Без `observer` компонент не отслеживает изменений.",
  d: [
    H("MobX: observable, action, computed"),
    C(`import { makeAutoObservable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";

class TodoStore {
  todos = [];
  filter = "all";
  constructor() { makeAutoObservable(this); }      // поля → observable, геттеры → computed, методы → action

  get active() { return this.todos.filter((t) => !t.done); }   // computed (кешируется)
  add(title) { this.todos.push({ title, done: false }); }       // action
  async load() {
    const res = await fetch("/api/todos");
    const data = await res.json();
    runInAction(() => { this.todos = data; });   // после await — отдельный action
  }
}
export const store = new TodoStore();

const Count = observer(() => <b>{store.active.length}</b>);`),
    UL(
      "**observable**: отслеживаемое состояние (на Proxy, поддерживает объекты, массивы, Map и Set).",
      "**computed**: производное значение, кешируется и пересчитывается лениво только при изменении зависимостей.",
      "**action**: единственное «правильное» место для изменений (включён `enforceActions` — мутации вне action вызывают предупреждение).",
      "**reaction/autorun/when**: побочные эффекты, реагирующие на изменения.",
      "Типичные ошибки: забыть `observer`, прочитать значение вне рендера (например, в колбэке до рендера), разыменовать `const { count } = store` вне отслеживания и потерять реактивность, изменять состояние после `await` вне `runInAction`."
    ),
    P("Модель отличается от Redux: изменяемое состояние плюс автоматическое отслеживание зависимостей против неизменяемого состояния плюс явные селекторы. MobX проще для сложных графов объектов и форм, Redux — для строгой предсказуемости и истории действий."),
    LK(["MobX: The gist of MobX", "https://mobx.js.org/the-gist-of-mobx.html"], ["MobX: React integration", "https://mobx.js.org/react-integration.html"])
  ],
  v: [
    ["Что произойдёт при изменении `store.filter`, если компонент без `observer` читает `store.filter` в рендере?", null, ["Перерисуется автоматически", "Не перерисуется: без `observer` зависимости не отслеживаются", "Ошибка компиляции", "Перерисуются все компоненты"], 1, "Отслеживание включается только внутри реакции, которую создаёт `observer`."],
    ["Что делает `computed`?", null, ["Выполняет побочный эффект", "Кеширует производное значение и пересчитывает при смене зависимостей", "Хранит значения в `localStorage`", "Создаёт копию состояния"], 1, "Геттер класса при `makeAutoObservable` становится `computed`."],
    ["Зачем после `await` внутри async-метода MobX нужен `runInAction`?", null, ["Для скорости", "Код после `await` уже вне исходного action, и без `runInAction` мутации вызовут предупреждение `enforceActions`", "Чтобы отменить запрос", "Это нужно только в тестах"], 1, "Action распространяется только на синхронную часть."],
    ["Что с реактивностью в этом компоненте?", "const Counter = observer(() => {\n  const { count } = store; // читаем в рендере\n  return <b>{count}</b>;\n});", ["Реактивности нет совсем", "Чтение в рендере внутри `observer` отслеживается, всё работает", "Работает только с `useEffect`", "Ошибка компиляции"], 1, "Разыменование внутри рендера `observer` — это чтение, оно отслеживается. Потеря реактивности возникает при чтении вне отслеживаемого контекста, например в обработчике."],
    ["Чем MobX принципиально отличается от Redux?", null, ["Состояние изменяемое, зависимости отслеживаются автоматически", "Нужны action-объекты и редьюсеры", "Единый стор обязателен", "Состояние иммутабельно и сравнивается по ссылке", "Можно иметь несколько сторов-классов"], [0, 4], "MobX позволяет мутировать observable и сам рассчитывает, что перерисовывать."],
    ["Что делает `makeAutoObservable(this)` в конструкторе?", null, ["Превращает поля в observable, геттеры в computed, методы в action", "Запускает рендер", "Создаёт копию класса", "Подключает DevTools"], 0, "Для тонкой настройки есть `makeObservable` с явными аннотациями."]
  ]
},
{
  id: "q-st-5",
  q: "Из каких основных единиц состоит Effector и как их соединяют?",
  o: ["Только store и reducer, соединяются через `dispatch`", "Event, Store, Effect (юниты) соединяются декларативно: `store.on(event, reducer)`, `sample`, `forward`/`sample` с `target`", "Только Effect и Promise", "Классы с декораторами"],
  a: 1,
  e: "Effector — граф юнитов: `createEvent`, `createStore`, `createEffect`. Связи объявляются через `.on`, `sample`, `attach`. Асинхронность оборачивает `Effect`, у которого есть `.done`, `.fail`, `.pending`.",
  d: [
    H("Effector: событийная модель"),
    C(`import { createEvent, createStore, createEffect, sample } from "effector";
import { useUnit } from "effector-react";

const inc = createEvent();
const $count = createStore(0).on(inc, (n) => n + 1);       // стор реагирует на событие

const loadUserFx = createEffect(async (id) => (await fetch("/api/u/" + id)).json());
const $user = createStore(null).on(loadUserFx.doneData, (_, user) => user);
const $loading = loadUserFx.pending;

const idSubmitted = createEvent();
sample({ clock: idSubmitted, target: loadUserFx });         // событие запускает эффект

function View() {
  const [count, onInc] = useUnit([$count, inc]);
  return <button onClick={onInc}>{count}</button>;
}`),
    UL(
      "**Event**: «что-то произошло». **Store** (`$`-префикс по соглашению): хранит значение и обновляется по событиям. **Effect**: оболочка над побочным действием (с `pending`, `done`, `fail`, `finally`).",
      "**`sample({ clock, source, filter, fn, target })`** — основная операция: по триггеру `clock` взять данные из `source`, при необходимости отфильтровать/преобразовать и отправить в `target`.",
      "**`useUnit`** (effector-react) подписывает компонент на юниты и привязывает события к scope.",
      "**Scope / `fork` / `allSettled`** — изоляция состояния для SSR и тестов (без глобального синглтона).",
      "**Domain** группирует юниты; **`attach`** создаёт эффект с данными из стора.",
      "Логика живёт вне компонентов, а компонент только вызывает события — удобно тестировать и переиспользовать."
    ),
    LK(["Effector: документация", "https://effector.dev/"], ["Effector: sample", "https://effector.dev/en/api/effector/sample/"])
  ],
  v: [
    ["Как принято обозначать сторы в Effector?", null, ["Префикс `$` (`$count`)", "Суффикс `Store`", "Префикс `_`", "Никак"], 0, "Эффекты принято называть с суффиксом `Fx` (`loadUserFx`)."],
    ["Что делает `sample({ clock: idSubmitted, target: loadUserFx })`?", null, ["Создаёт стор", "При каждом срабатывании `idSubmitted` запускает эффект `loadUserFx` с данными события", "Блокирует событие", "Подписывает компонент"], 1, "Это декларативное соединение юнитов."],
    ["Что содержит `loadUserFx.pending`?", null, ["Результат запроса", "Стор-флаг: выполняется ли эффект", "Событие ошибки", "Промис"], 1, "Также доступны `done`, `doneData`, `fail`, `failData`, `finally`."],
    ["Для чего нужны `fork` и `scope`?", null, ["Для CSS", "Для изолированных экземпляров состояния (SSR, тесты) вместо глобального синглтона", "Для hot reload", "Для типизации"], 1, "`allSettled(event, { scope })` выполняет событие и ждёт завершения эффектов."],
    ["Что верно про `.on` у стора?", null, ["Редьюсер получает текущее значение и данные события и возвращает новое", "Если вернуть `undefined`, обновления не будет", "Нужно мутировать значение стора", "Через `.on` можно подписать стор на несколько событий"], [0, 1, 3], "Значения иммутабельны: редьюсер возвращает новое состояние."],
    ["Что делает `useUnit`?", null, ["Создаёт юнит", "Подписывает React-компонент на сторы и привязывает события", "Запускает эффекты при монтировании", "Заменяет `sample`"], 1, "Именно через него компонент читает значения и вызывает события."]
  ]
},
{
  id: "q-st-6",
  q: "Когда достаточно `useState`/Context, когда нужен внешний стор, а когда — TanStack Query?",
  o: ["Всегда нужен Redux", "Локальное состояние — `useState`, редкие глобальные значения — Context, сложное клиентское состояние — стор, серверные данные — Query/RTK Query", "Context заменяет любой стор без последствий", "Серверные данные надо хранить в Redux вручную"],
  a: 1,
  e: "Разделяйте состояние по природе: серверное (кеш запросов), клиентское (UI, формы, фильтры), URL (параметры), локальное. Context перерисовывает всех потребителей при смене значения и не имеет селекторов.",
  d: [
    H("Выбор подхода к состоянию"),
    UL(
      "**Локальное состояние** (`useState`, `useReducer`): состояние одного компонента или поддерева. Начинайте с него.",
      "**Подъём состояния**: общий родитель держит состояние и передаёт вниз. Если слишком много уровней — Context или стор.",
      "**Context**: хорош для редко меняющихся значений (тема, локаль, текущий пользователь). Все потребители перерисовываются при смене `value`, **селекторов нет**; часто разбивают на несколько контекстов или мемоизируют `value`.",
      "**Клиентский стор** (Redux Toolkit, Zustand, MobX, Effector): когда много компонентов читают и меняют состояние, нужна история, сложная логика, доступ вне React или тонкие подписки.",
      "**Серверное состояние** (TanStack Query, RTK Query, SWR): данные с сервера — это кеш с инвалидацией, повторами, дедупликацией. Хранить их в обычном сторе вручную значит переписывать эти механизмы.",
      "**URL как состояние**: фильтры, страница, вкладка — в `searchParams` (можно делиться ссылкой, работают назад/вперёд).",
      "**Форма**: отдельные библиотеки (React Hook Form) вместо общего стора.",
      "**Server Components** уменьшают количество клиентского состояния: данные приходят с сервера готовыми."
    ),
    P("Критерии выбора: размер команды и соглашения, потребность в DevTools и time-travel (Redux), «минимум церемоний» (Zustand), множество связанных объектов и вычислений (MobX), событийная модель и явный граф (Effector)."),
    LK(["React: Choosing the State Structure", RD + "learn/choosing-the-state-structure"], ["React: Scaling Up with Reducer and Context", RD + "learn/scaling-up-with-reducer-and-context"])
  ],
  v: [
    ["Какие данные лучше отдать TanStack Query, а не Redux?", null, ["Состояние открытой модалки", "Список товаров, загружаемый с API", "Значение поля ввода", "Выбранная тема оформления"], 1, "Это серверные данные: кеш, повторные запросы, инвалидация."],
    ["Что происходит при смене `value` в Context?", null, ["Перерисовывается только компонент, читающий изменившееся поле", "Перерисовываются все потребители этого контекста", "Ничего", "Перезагружается страница"], 1, "Частичных подписок на поля в Context нет."],
    ["Где логично хранить номер страницы и фильтры таблицы?", null, ["В `searchParams` URL", "В глобальной переменной", "В cookie без необходимости", "В `useRef`"], 0, "Ссылку можно скопировать, кнопка «назад» работает."],
    ["Как уменьшить лишние рендеры у потребителей Context?", null, ["Делить контекст на части и мемоизировать `value`", "Передавать новый объект в `value` на каждом рендере", "Использовать `key` на провайдере", "Хранить всё в одном огромном объекте"], 0, "Новый объект в `value` на каждом рендере заставляет всех потребителей перерисовываться."],
    ["Что из перечисленного относится к клиентскому (не серверному) состоянию?", null, ["Открыта ли боковая панель", "Выбранная вкладка", "Список заказов с сервера", "Черновик формы", "Профиль пользователя из API"], [0, 1, 3], "Серверное состояние живёт на сервере, а в клиенте — только его кеш."],
    ["Какой сценарий оправдывает внешний стор?", null, ["Счётчик в одном компоненте", "Корзина, к которой обращаются десятки компонентов и код вне React", "Состояние поля ввода", "Один флаг в одном компоненте"], 1, "Если состояние делят далёкие компоненты или нужна логика вне React, стор удобнее."]
  ]
},
]);

/* ===================== Сторы, часть 2 ===================== */
K("state", [
{
  id: "q-st-7",
  q: "Опишите поток данных в Redux: что такое action, reducer, store, middleware и почему поток называют однонаправленным?",
  o: ["Компонент напрямую меняет `store.state`, а reducer только логирует", "Компонент делает `dispatch(action)`, middleware может перехватить, reducer возвращает новое состояние, store уведомляет подписчиков", "Reducer вызывает компонент, компонент вызывает middleware", "Store хранит функции, которые сам перерисовывают компоненты"],
  a: 1,
  e: "Action — простой объект с `type`. Reducer — чистая функция `(state, action) => newState`. Middleware встраивается между `dispatch` и reducer и нужен для асинхронности, логов и аналитики. Поток всегда идёт в одну сторону: UI → action → reducer → store → UI.",
  d: [
    H("Redux: модель"),
    C(`// «голый» Redux
function counter(state = { n: 0 }, action) {
  switch (action.type) {
    case "inc": return { ...state, n: state.n + 1 };
    default: return state;
  }
}
const logger = (api) => (next) => (action) => {
  console.log("dispatch", action);
  const result = next(action);
  console.log("state", api.getState());
  return result;
};
const store = createStore(counter, applyMiddleware(logger)); // сегодня — configureStore из RTK`),
    UL(
      "**Три принципа**: единый источник правды, состояние только для чтения (меняется через action), изменения делают чистые функции.",
      "**Чистый reducer**: без запросов, `Math.random`, `Date.now`, мутаций аргументов.",
      "**Middleware** — каррированная функция `store => next => action`; именно так работают thunk, saga, listener middleware.",
      "**Подписка**: `store.subscribe` вызывается после каждого dispatch; React Redux использует `useSyncExternalStore`.",
      "**DevTools** воспроизводят историю action, поэтому состояние должно быть сериализуемым."
    ),
    LK(["Redux Fundamentals", "https://redux.js.org/tutorials/fundamentals/part-1-overview"], ["Redux Toolkit", "https://redux-toolkit.js.org/"])
  ],
  v: [
    ["Что обязан делать reducer?", null, ["Возвращать новое состояние без побочных эффектов", "Делать запросы", "Менять DOM", "Вызывать `dispatch`"], 0, "Он должен быть чистым."],
    ["Что такое action?", null, ["Объект, описывающий событие, с полем `type`", "Функция-компонент", "Подписка", "Кеш"], 0, "Остальные поля — payload."],
    ["Где в цепочке находится middleware?", null, ["Между `dispatch` и reducer", "После рендера", "Внутри DOM", "Перед созданием store"], 0, "Оно видит action до reducer."],
    ["Почему поток данных называют однонаправленным?", null, ["UI порождает action, а состояние течёт обратно в UI только через store", "Данные хранятся в одном файле", "Есть только один reducer", "Нельзя иметь несколько компонентов"], 0, "Нет двусторонней привязки."],
    ["Почему состояние Redux должно быть сериализуемым?", null, ["Для DevTools, персистентности и воспроизводимости", "Для работы TypeScript", "Для ускорения CSS", "Для HTTP/2"], 0, "RTK предупреждает о несериализуемых значениях."],
    ["Какие из утверждений верны для чистого reducer?", null, ["Не мутирует аргументы", "Не использует `Date.now()`", "Может выполнять fetch", "Возвращает то же состояние для неизвестного action", "Меняет глобальные переменные"], [0, 1, 3], "Побочных эффектов быть не должно."]
  ]
},
{
  id: "q-st-8",
  q: "Как в Redux Toolkit устроены `createAsyncThunk` и `extraReducers`, и какие состояния нужно обрабатывать?",
  o: ["Thunk возвращает синхронный action, а `extraReducers` игнорируется", "Thunk создаёт три action (`pending`, `fulfilled`, `rejected`), а `extraReducers` в slice реагирует на них", "Thunk автоматически сохраняет данные в `localStorage`", "`extraReducers` нужен только для TypeScript"],
  a: 1,
  e: "`createAsyncThunk('user/fetch', fn)` порождает функцию-thunk и три типа action. В slice состояния запроса (`idle/loading/succeeded/failed`) переключают в `extraReducers`. Для кеша серверных данных чаще берут RTK Query.",
  d: [
    H("Асинхронность в RTK"),
    C(`const fetchUser = createAsyncThunk("user/fetch", async (id, { rejectWithValue, signal }) => {
  const res = await fetch("/api/users/" + id, { signal });
  if (!res.ok) return rejectWithValue(res.status);
  return res.json();
});

const slice = createSlice({
  name: "user",
  initialState: { data: null, status: "idle", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchUser.pending, (s) => { s.status = "loading"; })
     .addCase(fetchUser.fulfilled, (s, a) => { s.status = "succeeded"; s.data = a.payload; })
     .addCase(fetchUser.rejected, (s, a) => { s.status = "failed"; s.error = a.payload ?? a.error.message; });
  },
});`),
    UL(
      "**`rejectWithValue`** передаёт типизированную ошибку в `payload`.",
      "**`condition`** в опциях предотвращает дубль запроса.",
      "**`signal`** и `promise.abort()` отменяют запрос.",
      "**`unwrap()`** на результате `dispatch` превращает action в Promise, который бросает при `rejected`.",
      "**`createEntityAdapter`** хранит нормализованные коллекции и даёт готовые селекторы.",
      "**Listener middleware** и `createListenerMiddleware` — современная замена saga для простых эффектов."
    ),
    LK(["createAsyncThunk", "https://redux-toolkit.js.org/api/createAsyncThunk"], ["RTK Query", "https://redux-toolkit.js.org/rtk-query/overview"])
  ],
  v: [
    ["Сколько типов action порождает `createAsyncThunk`?", null, ["3: pending, fulfilled, rejected", "1", "2", "5"], 0, "По одному на каждую фазу."],
    ["Для чего нужен `rejectWithValue`?", null, ["Передать данные ошибки в `payload`", "Повторить запрос", "Отменить запрос", "Очистить стор"], 0, "Иначе остаётся только сообщение `error`."],
    ["Что делает `unwrap()`?", null, ["Превращает результат dispatch в Promise, который бросает при ошибке", "Удаляет состояние", "Отписывает компонент", "Сериализует state"], 0, "Удобно с `try/catch`."],
    ["Где обрабатывают action из thunk?", null, ["В `extraReducers`", "В `reducers`", "В `devTools`", "В `preloadedState`"], 0, "`reducers` генерирует собственные action."],
    ["Чем занимается `createEntityAdapter`?", null, ["Нормализует коллекции и даёт готовые редьюсеры и селекторы", "Делает запросы", "Шифрует состояние", "Рисует таблицы"], 0, "Данные хранятся как `ids` и `entities`."],
    ["Какой инструмент RTK подходит для кеша серверных данных?", null, ["RTK Query", "createSelector", "createAction", "configureStore"], 0, "Он похож на TanStack Query."]
  ]
},
{
  id: "q-st-9",
  q: "Зачем нужны селекторы и `reselect`/`createSelector`, и как не вызвать лишние перерисовки в `useSelector`?",
  o: ["Селекторы нужны только для именования, на производительность они не влияют", "`useSelector` перерисовывает при изменении возвращённого значения (по `===`); `createSelector` мемоизирует производные данные и возвращает ту же ссылку", "`useSelector` всегда сравнивает по глубокому равенству", "Селекторы обязательно создают новый массив"],
  a: 1,
  e: "Если селектор возвращает новый объект/массив на каждый вызов (`state.items.filter(...)`), `useSelector` считает значение изменившимся и перерисовывает компонент. Мемоизация по входным аргументам сохраняет ссылку, пока входы не поменялись.",
  d: [
    H("Селекторы"),
    C(`const selectItems = (s) => s.todos.items;
const selectFilter = (s) => s.todos.filter;

export const selectVisible = createSelector([selectItems, selectFilter], (items, filter) =>
  items.filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done)),
);

const visible = useSelector(selectVisible); // тот же массив, пока входы не менялись

// плохо: новая ссылка на каждый вызов
const bad = useSelector((s) => s.todos.items.filter((t) => t.done));`),
    UL(
      "**Сравнение по ссылке** (`===`) — поведение `useSelector` по умолчанию; второй аргумент позволяет задать `shallowEqual`.",
      "**Один экземпляр на параметр**: селектор с аргументом создают через фабрику или `createSelector` с входом-параметром.",
      "**Нормализация** упрощает селекторы и обновления по id.",
      "**Не хранить производные данные** в стейте — вычислять селекторами.",
      "**В dev-режиме** reselect предупреждает о нестабильных входных селекторах."
    ),
    LK(["Using Redux: Deriving Data with Selectors", "https://redux.js.org/usage/deriving-data-selectors"], ["Reselect", "https://github.com/reduxjs/reselect"])
  ],
  v: [
    ["Как `useSelector` решает, что нужно перерисовать компонент?", null, ["Сравнивает результат селектора по `===`", "Глубоко сравнивает все поля", "Перерисовывает на каждый dispatch", "Смотрит на ключи"], 0, "Поэтому важна стабильная ссылка."],
    ["Почему `useSelector(s => s.items.filter(...))` приводит к лишним рендерам?", null, ["Создаёт новый массив при каждом вызове", "Слишком быстрый", "Не работает без reselect", "Мутирует состояние"], 0, "Ссылки отличаются."],
    ["Что делает `createSelector`?", null, ["Мемоизирует результат по входным значениям", "Создаёт action", "Отправляет запрос", "Сериализует state"], 0, "Результат пересчитывается только при смене входов."],
    ["Что лучше хранить в состоянии?", null, ["Исходные данные, а производные вычислять селекторами", "Все вычисленные значения", "Только функции", "Только строки"], 0, "Иначе легко получить рассинхрон."],
    ["Какой второй аргумент ослабит сравнение в `useSelector`?", null, ["`shallowEqual`", "`deepEqual`", "`Object.is`", "`structuredClone`"], 0, "Применим для объектов с примитивами."],
    ["Зачем нужна нормализация состояния?", null, ["Для быстрого доступа по id и простых обновлений", "Для шифрования", "Для сжатия", "Для SSR"], 0, "`ids` и `entities`."]
  ]
},
{
  id: "q-st-10",
  q: "Как устроены middleware и подходы к побочным эффектам: thunk, saga, listener middleware, observable?",
  o: ["Все они делают одно и то же и взаимозаменяемы без последствий", "Thunk — функции в dispatch; saga — генераторы с эффектами и отменой; listener — реакция на action; выбор зависит от сложности потока", "Saga выполняется только на сервере", "Thunk запрещён в RTK"],
  a: 1,
  e: "Thunk идёт в RTK по умолчанию и покрывает большинство задач. Saga полезна для сложных долгоживущих сценариев (гонки, отмены, `takeLatest`). Listener middleware — декларативные реакции вида «при action X сделай Y» без генераторов.",
  d: [
    H("Побочные эффекты в Redux"),
    C(`// thunk
const load = () => async (dispatch, getState) => {
  dispatch({ type: "load/start" });
  const data = await api.get();
  dispatch({ type: "load/done", payload: data });
};

// saga
function* watch() { yield takeLatest("search/changed", function* (a) {
  yield delay(300);
  const res = yield call(api.search, a.payload);
  yield put({ type: "search/done", payload: res });
}); }

// listener middleware
listener.startListening({ actionCreator: queryChanged, effect: async (a, api) => {
  await api.delay(300);
  api.dispatch(searchRequested(a.payload));
} });`),
    UL(
      "**Thunk**: простой, есть `getState`, подходит для запросов.",
      "**Saga**: тестируется как чистая последовательность эффектов, но увеличивает порог входа.",
      "**Listener**: встроен в RTK, поддерживает debounce, отмену, ожидание action.",
      "**Эффекты вне стора**: React Query и RTK Query забирают большую часть сетевой логики."
    ),
    LK(["Redux Thunk", "https://redux.js.org/usage/writing-logic-thunks"], ["Listener Middleware", "https://redux-toolkit.js.org/api/createListenerMiddleware"])
  ],
  v: [
    ["Что получает thunk вторым аргументом после `dispatch`?", null, ["`getState`", "`request`", "`window`", "`props`"], 0, "Также можно передать extra argument."],
    ["Зачем используют `takeLatest` в saga?", null, ["Чтобы отменить предыдущую задачу при новом action", "Для сортировки", "Для логирования", "Для SSR"], 0, "Типично для поиска."],
    ["Что умеет listener middleware?", null, ["Реагировать на action с debounce и отменой", "Рисовать UI", "Создавать БД", "Компилировать TS"], 0, "Без генераторов."],
    ["Что подходит для простых запросов в RTK?", null, ["`createAsyncThunk`/RTK Query", "Redux-Saga обязательно", "Observable", "XHR вручную"], 0, "Они встроены."],
    ["Почему saga легко тестировать?", null, ["Она описывает эффекты как данные", "Она работает быстрее", "Она не требует store", "Она без побочных эффектов"], 0, "Эффекты сравнивают как объекты."],
    ["Какие утверждения верны для middleware?", null, ["Получает `dispatch` и `getState`", "Может не пропускать action дальше", "Может заменить reducer", "Вызывается после рендера", "Может отправлять новые action"], [0, 1, 4], "Reducer и рендер тут не заменяются."]
  ]
},
{
  id: "q-st-11",
  q: "Какие middleware есть в Zustand (`persist`, `devtools`, `immer`) и как делить стор на slices?",
  o: ["В Zustand нельзя добавлять middleware", "Оборачивают создатель стора: `create(devtools(persist(immer(fn))))`; крупный стор делят на функции-slices, объединяя через spread", "`persist` нужен только для SSR", "`devtools` заменяет Redux Toolkit"],
  a: 1,
  e: "Middleware в Zustand — высшие функции над создателем состояния. `persist` сохраняет часть состояния в `localStorage`, `devtools` подключает Redux DevTools, `immer` позволяет мутирующий синтаксис.",
  d: [
    H("Zustand: middleware и slices"),
    C(`const createUserSlice = (set) => ({ user: null, login: (u) => set({ user: u }) });
const createCartSlice = (set, get) => ({
  items: [],
  add: (it) => set((s) => ({ items: [...s.items, it] })),
  total: () => get().items.reduce((a, i) => a + i.price, 0),
});

export const useStore = create(
  devtools(
    persist(
      (...a) => ({ ...createUserSlice(...a), ...createCartSlice(...a) }),
      { name: "app", partialize: (s) => ({ user: s.user }), version: 1 },
    ),
  ),
);

useStore.getState().login(u);          // вне React
const unsub = useStore.subscribe((s) => console.log(s.items));`),
    UL(
      "**`partialize`** выбирает, что сохранять; **`version` + `migrate`** — миграции схемы.",
      "**SSR/гидратация**: `persist` читает хранилище на клиенте, поэтому возможен mismatch; используют `skipHydration` и ручную гидратацию.",
      "**Вне React**: `getState`, `setState`, `subscribe` работают без хуков.",
      "**Тесты**: сбрасывать стор между тестами (`setState(initial, true)`).",
      "**Контекст на запрос** (`createStore` + Provider) нужен в SSR, чтобы не делить синглтон между пользователями."
    ),
    LK(["Zustand docs", "https://zustand.docs.pmnd.rs/"])
  ],
  v: [
    ["Что делает `persist`?", null, ["Сохраняет состояние в хранилище (по умолчанию `localStorage`)", "Подключает DevTools", "Делает мутации", "Создаёт slices"], 0, "Часть полей можно исключить."],
    ["Что делает `partialize`?", null, ["Выбирает сохраняемые поля", "Делит стор на части", "Удаляет состояние", "Отписывает компоненты"], 0, "Остальное остаётся только в памяти."],
    ["Зачем указывать `version` в `persist`?", null, ["Для миграции сохранённых данных при смене схемы", "Для включения SSR", "Для DevTools", "Для кеша"], 0, "С функцией `migrate`."],
    ["Как вызвать действие стора вне компонента?", null, ["`useStore.getState().action()`", "`useStore().action()` вне React", "`window.store`", "Невозможно"], 0, "Стор — обычный объект."],
    ["Почему на сервере нельзя использовать глобальный синглтон-стор?", null, ["Состояние смешается между пользователями", "Он слишком медленный", "Не поддерживается Node", "Нужен Redux"], 0, "Создают стор на запрос."],
    ["Как разделить крупный стор?", null, ["На функции-slices, объединяемые в одном `create`", "На несколько приложений", "Нельзя", "Только через Context"], 0, "Slices разделяют ответственность."]
  ]
},
{
  id: "q-st-12",
  q: "Что такое `useSyncExternalStore` и почему именно он нужен внешним стором, а не `useEffect` + `useState`?",
  o: ["Это просто обёртка над `useState`", "Хук для подписки на внешний источник: безопасен при конкурентном рендеринге, избегает tearing и поддерживает серверный снапшот", "Он отключает рендер на сервере", "Он нужен только для localStorage"],
  a: 1,
  e: "При конкурентном рендере разные части дерева могли бы прочитать разные версии внешнего состояния (tearing). `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` гарантирует согласованное чтение, поэтому Redux, Zustand и другие библиотеки построены на нём.",
  d: [
    H("useSyncExternalStore"),
    C(`function useOnline() {
  return useSyncExternalStore(
    (cb) => { addEventListener("online", cb); addEventListener("offline", cb);
      return () => { removeEventListener("online", cb); removeEventListener("offline", cb); }; },
    () => navigator.onLine,     // getSnapshot — должен возвращать одно значение, пока данные не менялись
    () => true,                 // getServerSnapshot для SSR и гидратации
  );
}`),
    UL(
      "**`getSnapshot` обязан быть стабильным**: возвращать ту же ссылку, если состояние не менялось, иначе будет бесконечный рендер.",
      "**tearing**: визуальная рассинхронизация, когда компоненты показывают разные версии одного состояния.",
      "**Мини-стор**: объект с `state`, `listeners` и методами `subscribe/getSnapshot` — основа Zustand.",
      "**Context** при изменении значения перерисует всех потребителей, внешний стор с селекторами — только затронутых."
    ),
    LK(["useSyncExternalStore", "https://react.dev/reference/react/useSyncExternalStore"])
  ],
  v: [
    ["Что такое tearing?", null, ["Разные части UI показывают разные версии состояния", "Разрыв соединения", "Ошибка типов", "Лишний рендер"], 0, "Особенно при конкурентном рендере."],
    ["Что должен возвращать `getSnapshot`?", null, ["Одну и ту же ссылку, пока данные не менялись", "Новый объект каждый раз", "Promise", "Функцию"], 0, "Иначе бесконечные рендеры."],
    ["Для чего нужен третий аргумент?", null, ["Серверный снапшот для SSR и гидратации", "Отмена подписки", "Сравнение значений", "Кеш"], 0, "Должен совпадать с начальным клиентским."],
    ["Какие библиотеки используют этот хук?", null, ["React Redux, Zustand, Jotai", "Только Sass", "Только Jest", "Webpack"], 0, "Он стал стандартом для внешних сторов."],
    ["Что вернёт подписка (`subscribe`)?", null, ["Функцию отписки", "Состояние", "Promise", "Ничего"], 0, "React вызывает её при размонтировании."],
    ["Почему Context плохо подходит для часто меняющихся данных?", null, ["Все потребители перерисовываются при смене значения", "Context не поддерживает объекты", "Он асинхронный", "Нет TypeScript"], 0, "Нужны селекторы или разделение контекстов."]
  ]
},
{
  id: "q-st-13",
  q: "MobX: чем отличаются `observable`, `computed`, `action`, `autorun`/`reaction` и как работает `makeAutoObservable`?",
  o: ["Все эти функции делают одно и то же", "`observable` — отслеживаемое состояние, `computed` — кешируемое производное, `action` — изменение состояния, `reaction/autorun` — побочные эффекты при изменениях", "`computed` меняет состояние, `action` читает его", "`autorun` нужен только на сервере"],
  a: 1,
  e: "Граф зависимостей строится автоматически: чтение observable внутри computed/reaction/observer создаёт подписку. Computed пересчитывается лениво и кешируется, пока его зависимости не менялись. Изменения делают внутри action, они группируются в транзакцию.",
  d: [
    H("MobX"),
    C(`class CartStore {
  items = [];
  constructor() { makeAutoObservable(this); }   // поля → observable, геттеры → computed, методы → action
  get total() { return this.items.reduce((s, i) => s + i.price, 0); }
  add(item) { this.items.push(item); }
}
const cart = new CartStore();

const Total = observer(() => <b>{cart.total}</b>);

reaction(() => cart.items.length, (n) => analytics.track("cart", n));`),
    UL(
      "**`enforceActions`** предупреждает об изменениях вне action.",
      "**`flow`** или `runInAction` нужен после `await`, потому что код после await уже вне action.",
      "**Деструктуризация** observable-полей в `observer` теряет реактивность: читайте поля внутри.",
      "**Минимальная перерисовка**: observer перерисует компонент только если изменилось прочитанное.",
      "**Против Redux**: меньше шаблонного кода, но менее строгая предсказуемость и историю action нужно строить отдельно."
    ),
    LK(["MobX Docs", "https://mobx.js.org/README.html"])
  ],
  v: [
    ["Что кеширует `computed`?", null, ["Производное значение, пока зависимости не менялись", "Ответ сервера", "DOM", "Action"], 0, "Пересчёт ленивый."],
    ["Для чего нужен `reaction`?", null, ["Для побочного эффекта при изменении отслеживаемого значения", "Для рендера", "Для сериализации", "Для типов"], 0, "Например, аналитика."],
    ["Что делает `makeAutoObservable(this)`?", null, ["Помечает поля observable, геттеры computed, методы action", "Создаёт БД", "Включает SSR", "Фиксирует объект"], 0, "Это самый короткий способ."],
    ["Почему после `await` нужен `runInAction`?", null, ["Код после await уже вне action", "Для ускорения", "Для типов", "Для SSR"], 0, "Или используйте `flow`."],
    ["Почему деструктуризация в observer опасна?", null, ["Значение читается раньше подписки и реактивность теряется", "Она медленная", "Она не поддерживается", "Она мутирует стор"], 0, "Читайте поля в месте использования."],
    ["Что нужно для реактивного компонента?", null, ["Обернуть в `observer`", "Вызвать `forceUpdate`", "Использовать `useEffect`", "Подключить Redux"], 0, "Он подписывает на прочитанные observable."]
  ]
},
{
  id: "q-st-14",
  q: "Effector: как работают `sample`, `combine`, `fork`/`allSettled` и зачем нужны scope при SSR и тестах?",
  o: ["`sample` создаёт компонент, `combine` — стили", "`sample` связывает события и сторы по условию, `combine` объединяет сторы в производный, `fork` создаёт изолированный scope для SSR/тестов", "`fork` форкает процесс Node", "`allSettled` перезагружает страницу"],
  a: 1,
  e: "Эффектор строится вокруг декларативных связей: события и эффекты запускают друг друга, сторы реагируют на события. Scope изолирует состояние, поэтому на сервере разные запросы не делят данные, а тесты не влияют друг на друга.",
  d: [
    H("Effector: связи и scope"),
    C(`const submitted = createEvent();
const $name = createStore("").on(nameChanged, (_, v) => v);
const saveFx = createEffect((name) => api.save(name));

sample({ clock: submitted, source: $name, filter: (n) => n.length > 0, target: saveFx });

const $disabled = combine($name, saveFx.pending, (n, p) => !n || p);

// тест / SSR
const scope = fork({ values: [[$name, "Ada"]] });
await allSettled(submitted, { scope });
expect(scope.getState($name)).toBe("Ada");`),
    UL(
      "**`sample`**: `clock` — когда, `source` — что взять, `filter` — условие, `fn` — преобразование, `target` — куда отправить.",
      "**Эффекты** имеют `pending`, `done`, `fail`, `finally`.",
      "**`useUnit`** (effector-react) подключает сторы и события к компоненту.",
      "**Babel/SWC-плагин** даёт sid для сериализации сторов между сервером и клиентом."
    ),
    LK(["Effector docs", "https://effector.dev/"])
  ],
  v: [
    ["Что делает `sample`?", null, ["Передаёт данные между юнитами по триггеру", "Рисует UI", "Создаёт БД", "Запускает сервер"], 0, "Это основной оператор связей."],
    ["Что делает `combine`?", null, ["Объединяет сторы в производный стор", "Склеивает файлы", "Склеивает события", "Создаёт scope"], 0, "Результат пересчитывается."],
    ["Зачем `fork`?", null, ["Создать изолированный scope", "Создать поток", "Отменить эффект", "Подключить React"], 0, "Нужен для SSR и тестов."],
    ["Что содержит `fx.pending`?", null, ["Стор с флагом выполнения эффекта", "Список ошибок", "Результат", "Таймер"], 0, "Булево значение."],
    ["Что такое sid?", null, ["Стабильный идентификатор юнита для сериализации", "Идентификатор сессии", "Название файла", "Тип TS"], 0, "Добавляется плагином сборки."],
    ["Какой хук подключает юниты к компоненту?", null, ["`useUnit`", "`useEffect`", "`useStore`", "`useScope`"], 0, "В новых версиях заменил отдельные хуки."]
  ]
},
{
  id: "q-st-15",
  q: "Почему React Context + `useReducer` не всегда заменяет внешний стор, и как уменьшить лишние рендеры контекста?",
  o: ["Context не поддерживает обновления состояния", "Любое изменение значения контекста перерисовывает всех потребителей; помогает разделение контекстов, мемоизация значения и селекторы во внешнем сторе", "Context работает только для темы", "`useReducer` нельзя использовать с Context"],
  a: 1,
  e: "Потребители Context не имеют селекторов: смена `value` перерисовывает всех. Решения — разнести состояние и dispatch по разным контекстам, мемоизировать значение, дробить на несколько провайдеров или использовать стор с подпиской на срез.",
  d: [
    H("Context и производительность"),
    C(`const StateCtx = createContext(null);
const DispatchCtx = createContext(null);

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);
  return (
    <DispatchCtx.Provider value={dispatch}>   {/* стабильный, не вызывает рендеры */}
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}`),
    UL(
      "**Стабильность `value`**: объект, созданный в рендере, каждый раз новый — оберните в `useMemo`.",
      "**`React.memo`** не защищает от обновления контекста, на который компонент подписан.",
      "**React Compiler** уменьшает ручную мемоизацию, но не добавляет селекторы к Context.",
      "**Когда достаточно Context**: редко меняющиеся значения (тема, локаль, текущий пользователь).",
      "**Когда внешний стор**: частые обновления, много подписчиков, нужен доступ вне React."
    ),
    LK(["Scaling Up with Reducer and Context", "https://react.dev/learn/scaling-up-with-reducer-and-context"])
  ],
  v: [
    ["Что происходит при смене `value` контекста?", null, ["Перерисовываются все потребители", "Только один", "Ничего", "Только родитель"], 0, "У контекста нет селекторов."],
    ["Зачем разделять state и dispatch по разным контекстам?", null, ["dispatch стабилен и не вызывает рендеры", "Для скорости сборки", "Чтобы добавить типы", "Для SSR"], 0, "Компонентам с кнопками не нужны данные."],
    ["Помогает ли `React.memo` от обновления контекста?", null, ["Нет, если компонент читает этот контекст", "Да, всегда", "Только в продакшене", "Только с `useCallback`"], 0, "Memo влияет на пропсы."],
    ["Для каких данных Context подходит лучше всего?", null, ["Редко меняющиеся: тема, локаль, пользователь", "Позиция мыши", "Координаты анимации", "Ввод пользователя"], 0, "Частые обновления дорогие."],
    ["Что нужно сделать с объектом в `value`?", null, ["Мемоизировать через `useMemo`", "Клонировать", "Заморозить", "Сериализовать"], 0, "Иначе новая ссылка каждый рендер."],
    ["Что даёт внешний стор с селекторами?", null, ["Перерисовку только затронутых компонентов", "Отключение React", "Автоматическую валидацию", "Генерацию CSS"], 0, "Подписка идёт на срез."]
  ]
}
]);
