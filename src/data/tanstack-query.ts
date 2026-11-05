import { C, H, LK, P, UL } from "./registry";
import { K } from "./helpers";
/* ===================== TanStack Query ===================== */
const TQD = "https://tanstack.com/query/latest/docs/framework/react/";
K("tq", [
{
  id: "q-tq-1",
  q: "В чём разница между `staleTime` и `gcTime` (в v4 — `cacheTime`) в TanStack Query?",
  o: ["Это синонимы", "`staleTime` — сколько данные считаются свежими и не перезапрашиваются (по умолчанию 0); `gcTime` — сколько неиспользуемый (inactive) кеш хранится до удаления (по умолчанию 5 минут)", "`staleTime` — время удаления, `gcTime` — время запроса", "`staleTime` работает только на сервере"],
  a: 1,
  e: "Свежие данные берутся из кеша без запроса. Устаревшие (stale) показываются сразу, но перезапрашиваются в фоне при триггерах: монтирование компонента, возврат фокуса окна, восстановление сети. `gcTime` отсчитывается с момента, когда на запрос не осталось подписчиков.",
  d: [
    H("Кеш TanStack Query: ключи, свежесть, сборка мусора"),
    P("Запрос идентифицируется **`queryKey`** (массив, сериализуемый в хеш). Одинаковый ключ — общий кеш и **дедупликация** одновременных запросов. Все переменные, от которых зависит `queryFn`, должны входить в ключ."),
    C(`const { data, isPending, isFetching, error } = useQuery({
  queryKey: ["todos", { status, page }],   // зависимости в ключе
  queryFn: ({ signal }) => fetchTodos({ status, page, signal }),
  staleTime: 60_000,   // 1 минута свежих данных
  gcTime: 10 * 60_000, // 10 минут хранить без подписчиков
});`),
    UL(
      "**fresh → stale**: по умолчанию `staleTime = 0`, поэтому данные сразу считаются устаревшими, и при каждом монтировании идёт фоновый перезапрос.",
      "**active / inactive**: у активных запросов есть подписчики (компоненты); у неактивных — нет, и по истечении `gcTime` они удаляются.",
      "**Триггеры рефетча** (для stale): `refetchOnMount`, `refetchOnWindowFocus`, `refetchOnReconnect`, `refetchInterval`.",
      "**Повторы**: по умолчанию 3 попытки с экспоненциальной задержкой при ошибке (настраивается `retry`/`retryDelay`).",
      "Сигнал отмены `signal` передаётся в `queryFn` для `fetch`/axios.",
      "Ключ с объектом сравнивается структурно (порядок свойств в объекте не важен, порядок элементов массива важен)."
    ),
    LK(["Important Defaults", TQD + "guides/important-defaults"], ["Query Keys", TQD + "guides/query-keys"], ["Caching", TQD + "guides/caching"])
  ],
  v: [
    ["Какое значение `staleTime` по умолчанию?", null, ["5 минут", "0 — данные сразу считаются устаревшими", "Бесконечность", "1 секунда"], 1, "Поэтому при монтировании по умолчанию идёт фоновый рефетч."],
    ["Что происходит, когда все компоненты, использовавшие запрос, размонтированы?", null, ["Кеш удаляется мгновенно", "Запрос становится inactive и удаляется после `gcTime` (по умолчанию 5 минут)", "Запрос повторяется каждую секунду", "Кеш сохраняется навсегда"], 1, "Если компонент вернётся раньше, данные покажутся мгновенно."],
    ["Что нужно добавить в `queryKey`, если `queryFn` использует `userId`?", null, ["Ничего", "Сам `userId`: `['user', userId]`", "Только строку `'user'`", "Результат запроса"], 1, "Иначе разные пользователи будут делить кеш, и данные перепутаются."],
    ["Что значит дедупликация запросов?", null, ["Несколько компонентов с одним ключом вызывают одну сетевую загрузку", "Удаление дубликатов из массива", "Отключение кеша", "Повтор запроса при ошибке"], 0, "Ключ — идентификатор кеша."],
    ["Какие события могут вызвать фоновый рефетч stale-данных?", null, ["Монтирование компонента", "Возврат фокуса на окно", "Восстановление сети", "Перерисовка без изменений props", "Интервал `refetchInterval`"], [0, 1, 2, 4], "Простая перерисовка рефетча не вызывает."],
    ["Как называется параметр хранения неиспользуемого кеша в v5?", null, ["`cacheTime`", "`gcTime`", "`staleTime`", "`keepTime`"], 1, "В v5 `cacheTime` переименован в `gcTime`."]
  ]
},
{
  id: "q-tq-2",
  q: "Что означают `isPending`, `isFetching` и `isLoading` в v5, и почему `isPending` — не то же самое, что «идёт запрос»?",
  o: ["Это одно и то же", "`isPending` — в кеше ещё нет данных (status === 'pending'); `isFetching` — идёт запрос (в том числе фоновый); `isLoading = isPending && isFetching` — первая загрузка", "`isPending` — идёт фоновое обновление", "`isLoading` — ошибка"],
  a: 1,
  e: "`status` (pending / error / success) говорит о наличии данных; `fetchStatus` (fetching / paused / idle) — об активности запроса. Отключённый (`enabled: false`) запрос без данных имеет `isPending: true`, но `isFetching: false`.",
  d: [
    H("Состояния запроса и миграция v4 → v5"),
    UL(
      "**`status`**: `pending` (данных нет), `error`, `success`.",
      "**`fetchStatus`**: `fetching`, `paused` (нет сети), `idle`.",
      "**`isFetching`** — фоновые обновления тоже; **`isLoading`** (v5) — `isFetching && isPending`.",
      "**`enabled: false`**: запрос не выполняется; без данных `isPending` будет `true`. Для зависимых запросов используют `enabled: !!id` (или `skipToken` в TypeScript).",
      "**`data` типизируется** как `T | undefined` до успеха; после проверки `isSuccess` — как `T`."
    ),
    H("Главные изменения v5"),
    UL(
      "Единственная сигнатура: `useQuery({ queryKey, queryFn })` (раньше допускались позиционные аргументы).",
      "`isLoading` → `isPending` (статус), `cacheTime` → `gcTime`, `keepPreviousData` → `placeholderData: keepPreviousData`.",
      "Из `useQuery` удалены колбэки `onSuccess`/`onError`/`onSettled` (оставлены в мутациях); побочные эффекты делают в `useEffect` или на уровне `QueryCache`.",
      "`useErrorBoundary` → `throwOnError`; `suspense: true` → отдельные `useSuspenseQuery`, `useSuspenseInfiniteQuery`.",
      "`useInfiniteQuery` требует `initialPageParam`.",
      "Минимальная версия React для v5 — 18 (используется `useSyncExternalStore`)."
    ),
    LK(["Queries", TQD + "guides/queries"], ["Migrating to v5", TQD + "guides/migrating-to-v5"], ["Disabling queries", TQD + "guides/disabling-queries"])
  ],
  v: [
    ["Что верно для запроса с `enabled: false`, у которого нет данных?", null, ["`isPending: true`, `isFetching: false`", "`isPending: false`, `isFetching: true`", "`isError: true`", "`isSuccess: true`"], 0, "Данных нет, поэтому статус `pending`, но запрос не идёт."],
    ["Какой флаг подходит для показа спиннера только при первой загрузке?", null, ["`isFetching`", "`isLoading` (в v5: `isFetching && isPending`)", "`isSuccess`", "`isStale`"], 1, "`isFetching` включится и при фоновых обновлениях."],
    ["Что заменило `keepPreviousData: true` в v5?", null, ["`placeholderData: keepPreviousData` (функция из пакета)", "`staleTime: Infinity`", "`initialData`", "Ничего, функция удалена"], 0, "Показывается прошлая страница, пока грузится следующая."],
    ["Куда делись `onSuccess` и `onError` из `useQuery` в v5?", null, ["Остались без изменений", "Удалены: используют `useEffect` или глобальный `QueryCache`", "Переименованы в `onDone`", "Перенесены в `queryKey`"], 1, "Они вызывались у каждого наблюдателя и приводили к сложностям."],
    ["Что нужно указать в `useInfiniteQuery` v5, чего не требовала v4?", null, ["`initialPageParam`", "`gcTime`", "`select`", "`placeholderData`"], 0, "Первое значение параметра страницы задаётся явно."],
    ["Что верно?", null, ["`fetchStatus: 'paused'` — запрос ждёт сети", "`status` отвечает за наличие данных", "`isFetching` включает фоновые обновления", "`isPending` означает «идёт сетевой запрос»"], [0, 1, 2], "`isPending` говорит только об отсутствии данных."]
  ]
},
{
  id: "q-tq-3",
  q: "Как правильно реализовать оптимистичное обновление в `useMutation` и откатить его при ошибке?",
  o: ["Изменить `data` напрямую", "В `onMutate` отменить текущие запросы (`cancelQueries`), сохранить прежнее значение и записать новое через `setQueryData`; в `onError` откатить из контекста; в `onSettled` вызвать `invalidateQueries`", "Только вызвать `refetch()`", "Использовать `useState` вместо кеша"],
  a: 1,
  e: "`cancelQueries` не даёт устаревшему ответу перезаписать оптимистичное значение; контекст из `onMutate` нужен для отката; в конце инвалидация синхронизирует с сервером.",
  d: [
    H("Мутации, инвалидация и оптимистичный UI"),
    C(`const qc = useQueryClient();

const toggle = useMutation({
  mutationFn: (todo) => api.patchTodo(todo.id, { done: !todo.done }),
  onMutate: async (todo) => {
    await qc.cancelQueries({ queryKey: ["todos"] });
    const prev = qc.getQueryData(["todos"]);
    qc.setQueryData(["todos"], (old) => old.map((t) => t.id === todo.id ? { ...t, done: !t.done } : t));
    return { prev };                                     // контекст для отката
  },
  onError: (_e, _todo, ctx) => qc.setQueryData(["todos"], ctx.prev),
  onSettled: () => qc.invalidateQueries({ queryKey: ["todos"] }),
});`),
    UL(
      "**`mutate`** вызывает мутацию без возврата промиса; **`mutateAsync`** возвращает промис (нужно ловить ошибки).",
      "**`invalidateQueries({ queryKey })`** помечает совпавшие по **префиксу** ключи устаревшими и перезапрашивает активные. `exact: true` — только точное совпадение.",
      "**Альтернатива в v5** — оптимистичный UI без отката кеша: показать `mutation.variables` в списке, пока `mutation.isPending`.",
      "**`setQueryData`** обновляет кеш без запроса — полезно, когда ответ мутации уже содержит новую сущность.",
      "Состояние мутации: `idle → pending → success | error`; повторные попытки для мутаций по умолчанию отключены (`retry: 0`)."
    ),
    LK(["Mutations", TQD + "guides/mutations"], ["Optimistic Updates", TQD + "guides/optimistic-updates"], ["Invalidations from Mutations", TQD + "guides/invalidations-from-mutations"])
  ],
  v: [
    ["Зачем вызывать `cancelQueries` в `onMutate`?", null, ["Чтобы ускорить запрос", "Чтобы устаревший ответ уже идущего запроса не перезаписал оптимистичное значение", "Чтобы очистить кеш", "Чтобы отменить мутацию"], 1, "Без этого возможны «мигающие» откаты."],
    ["Что ИНВАЛИДИРУЕТ вызов `invalidateQueries({ queryKey: ['todos'] })`?", null, ["Только `['todos']`", "Все запросы, ключ которых начинается с `['todos']`, например `['todos', 1]`", "Все запросы", "Ничего, пока не вызван `refetch`"], 1, "Совпадение по префиксу; `exact: true` ограничивает точным."],
    ["Как откатить оптимистичное обновление при ошибке?", null, ["Использовать значение, сохранённое в контексте `onMutate`, внутри `onError`", "Перезагрузить страницу", "Вызвать `reset()` у формы", "Ничего не нужно"], 0, "Контекст из `onMutate` приходит третьим аргументом в `onError`."],
    ["Чем `mutateAsync` отличается от `mutate`?", null, ["Ничем", "`mutateAsync` возвращает промис, ошибки нужно обработать", "`mutate` выполняется на сервере", "`mutateAsync` не обновляет кеш"], 1, "Без `catch` отклонённый промис приведёт к необработанной ошибке."],
    ["Какой вариант позволяет показать «ожидающий» элемент без ручной правки кеша (v5)?", null, ["Использовать `mutation.variables` и `isPending` в UI", "Использовать `localStorage`", "Использовать `setTimeout`", "Невозможно"], 0, "Элемент отображается из переменных мутации, пока она в ожидании."],
    ["Что верно про мутации?", null, ["По умолчанию не повторяются при ошибке", "Хранятся в кеше запросов `queryKey`", "Имеют `onMutate`, `onError`, `onSuccess`, `onSettled`", "Автоматически вызываются при монтировании"], [0, 2], "Мутации вызываются явно, у них нет `queryKey` и кеша по ключу."]
  ]
},
{
  id: "q-tq-4",
  q: "Чем `initialData` отличается от `placeholderData`?",
  o: ["Ничем", "`initialData` записывается в кеш и считается реальными данными (подчиняется `staleTime`); `placeholderData` — временная подмена, в кеш не попадает, статус остаётся `pending`", "`placeholderData` сохраняется в кеше", "`initialData` работает только на сервере"],
  a: 1,
  e: "`initialData` — «настоящие» данные в кеше (с `dataUpdatedAt`), поэтому при `staleTime > 0` рефетча не будет. `placeholderData` лишь показывается, пока идёт первая загрузка (`isPlaceholderData: true`).",
  d: [
    H("Зависимые запросы, select, prefetch, placeholder"),
    UL(
      "**`enabled`**: запрос ждёт условия (`enabled: !!userId`) — так строят цепочки зависимых запросов.",
      "**`select`**: преобразование или выборка части данных; компонент перерисовывается только когда меняется результат `select`. Функцию лучше сделать стабильной (вынести или `useCallback`).",
      "**`initialData`** (в кеше, вместе с `initialDataUpdatedAt`) и **`placeholderData`** (только отображение).",
      "**`queryClient.prefetchQuery`**: заранее положить данные в кеш (при наведении на ссылку, в загрузчике маршрута).",
      "**`queryOptions({...})`**: хелпер, который объединяет `queryKey` и `queryFn` для переиспользования в `useQuery`, `prefetchQuery`, `getQueryData` с корректными типами.",
      "**Дедупликация и общие подписки**: несколько компонентов с одним ключом создают один запрос."
    ),
    C(`const todoOptions = (id) => queryOptions({
  queryKey: ["todo", id],
  queryFn: () => api.getTodo(id),
});

const { data: todo } = useQuery(todoOptions(id));
const { data: author } = useQuery({
  queryKey: ["user", todo?.authorId],
  queryFn: () => api.getUser(todo.authorId),
  enabled: !!todo,                      // зависимый запрос
});

// предзагрузка при наведении
onMouseEnter={() => qc.prefetchQuery(todoOptions(nextId))}`),
    LK(["Dependent Queries", TQD + "guides/dependent-queries"], ["Initial Query Data", TQD + "guides/initial-query-data"], ["Placeholder Query Data", TQD + "guides/placeholder-query-data"], ["Query Options", TQD + "guides/query-options"])
  ],
  v: [
    ["Какой из параметров записывает данные в кеш как настоящие?", null, ["`placeholderData`", "`initialData`", "`select`", "`enabled`"], 1, "`initialData` создаёт запись в кеше, поэтому учитывается `staleTime`."],
    ["Как построить запрос, который зависит от результата другого?", null, ["Вызвать `refetch` в `useEffect`", "Передать `enabled: !!firstResult` во второй запрос", "Использовать `async` в `queryKey`", "Нельзя"], 1, "Запрос стартует, как только условие истинно."],
    ["Для чего нужен `select`?", null, ["Для выбора запроса", "Для преобразования данных: компонент перерисуется, только если результат изменился", "Для сортировки в базе", "Для выбора ключа"], 1, "Удобно извлекать часть данных или вычислять производные значения."],
    ["Что такое `queryOptions`?", null, ["Хук", "Хелпер для объединения `queryKey` и `queryFn` с типами для повторного использования", "Параметр компонента", "Устаревший API"], 1, "Объект можно передавать в `useQuery`, `prefetchQuery`, `ensureQueryData` и др."],
    ["Что верно про `placeholderData`?", null, ["Не попадает в кеш", "Данные отображаются, а `isPlaceholderData` равен `true`", "Статус запроса сразу становится `success`", "Позволяет показывать данные предыдущей страницы"], [0, 1, 3], "Статус остаётся `pending`, пока нет реальных данных."],
    ["Зачем `prefetchQuery` при наведении на ссылку?", null, ["Для SEO", "Чтобы данные следующего экрана уже лежали в кеше к моменту перехода", "Чтобы отключить кеш", "Для обработки ошибок"], 1, "Переход выглядит мгновенным."]
  ]
},
{
  id: "q-tq-5",
  q: "Как работает `useInfiniteQuery` в v5 и что хранится в `data`?",
  o: ["`data` — плоский массив всех элементов", "`data = { pages: [...], pageParams: [...] }`; следующий параметр вычисляет `getNextPageParam(lastPage, allPages)`; стартовый задаёт `initialPageParam`", "`data` — только последняя страница", "Запросы страниц выполняются параллельно при монтировании"],
  a: 1,
  e: "Каждая загруженная страница лежит в `data.pages`. Чтобы получить плоский список, используют `data.pages.flatMap(p => p.items)`. `fetchNextPage()` грузит следующую; если `getNextPageParam` вернул `undefined`, `hasNextPage` станет `false`.",
  d: [
    H("Пагинация и бесконечные списки"),
    C(`const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ["feed"],
  queryFn: ({ pageParam }) => api.getFeed({ cursor: pageParam }),
  initialPageParam: null,
  getNextPageParam: (last) => last.nextCursor ?? undefined, // undefined → страниц больше нет
});
const items = data?.pages.flatMap((p) => p.items) ?? [];

// обычная пагинация без накопления
const { data: page, isPlaceholderData } = useQuery({
  queryKey: ["items", pageNumber],
  queryFn: () => api.getPage(pageNumber),
  placeholderData: keepPreviousData,   // не мигать пустотой при смене страницы
});`),
    UL(
      "Для **постраничной** навигации ключ содержит номер страницы, а `keepPreviousData` как `placeholderData` сохраняет прежний экран до загрузки нового.",
      "Для **бесконечной ленты** используют `useInfiniteQuery`; при инвалидации перезапрашиваются **все** загруженные страницы последовательно. Поэтому ограничивают их число (`maxPages`).",
      "**Курсорная** пагинация надёжнее `offset`: при добавлении записей не возникает дубликатов и пропусков.",
      "Чтобы подгружать по скроллу, часто используют `IntersectionObserver` и вызывают `fetchNextPage`.",
      "`isFetchingNextPage` отличает подгрузку от фонового обновления."
    ),
    LK(["Infinite Queries", TQD + "guides/infinite-queries"], ["Paginated Queries", TQD + "guides/paginated-queries"])
  ],
  v: [
    ["Что вернёт `getNextPageParam`, если страниц больше нет?", null, ["`null` либо `undefined` — `hasNextPage` станет `false`", "`0`", "Пустой массив", "Ошибку"], 0, "В v5 для остановки возвращают `undefined` (или `null`)."],
    ["Как получить плоский список элементов?", null, ["`data.flat()`", "`data.pages.flatMap(p => p.items)`", "`data.items`", "`data.pageParams`"], 1, "`data` содержит `pages` и `pageParams`."],
    ["Что происходит при `invalidateQueries` бесконечного списка?", null, ["Перезагружается только последняя страница", "Перезапрашиваются все загруженные страницы последовательно", "Ничего", "Список очищается"], 1, "Поэтому длинные ленты ограничивают через `maxPages`."],
    ["Почему курсор лучше смещения (`offset`)?", null, ["Он проще", "При вставке или удалении записей смещение даёт дубликаты и пропуски, курсор — нет", "Он быстрее на клиенте", "Он нужен только в GraphQL"], 1, "Курсор привязан к конкретной записи."],
    ["Как не показывать пустой экран при смене номера страницы?", null, ["`placeholderData: keepPreviousData`", "`staleTime: 0`", "`enabled: false`", "`retry: false`"], 0, "`isPlaceholderData` подскажет, что показываются старые данные."],
    ["Что верно про `fetchNextPage`?", null, ["Загружает следующую страницу и добавляет её в `data.pages`", "Заменяет данные первой страницы", "Использует `getNextPageParam` для вычисления параметра", "Вызывается автоматически при монтировании"], [0, 2], "Автоматически подгружается только первая страница."]
  ]
},
{
  id: "q-tq-6",
  q: "Как использовать TanStack Query с SSR/Next.js App Router и какая главная ловушка?",
  o: ["Создать один глобальный `QueryClient` на модуль для всех пользователей", "Создавать `QueryClient` на каждый запрос на сервере, предзагружать данные (`prefetchQuery`), передавать через `dehydrate` и `HydrationBoundary`; выставить `staleTime > 0`, чтобы клиент не перезапрашивал сразу", "Вообще не использовать на сервере", "Всегда оставлять `staleTime: 0`"],
  a: 1,
  e: "Глобальный клиент на сервере делит кеш между пользователями (утечка данных). Предзагрузка и регидратация позволяют клиенту сразу получить данные; при `staleTime: 0` клиент после монтирования всё равно выполнит рефетч.",
  d: [
    H("Зачем нужна отдельная настройка для SSR"),
    P("Хук `useQuery` на сервере **не выполняет запрос**: при серверном рендеринге данные из сети не ждут, и компонент отрисуется в состоянии `pending`. Если ничего не сделать, пользователь получит HTML со спиннером, а данные загрузятся уже в браузере после гидратации. Получается «водопад»: HTML → JS → запрос → данные. Цель настройки — **выполнить запрос на сервере, положить результат в кеш и передать этот кеш клиенту**, чтобы страница пришла с готовыми данными, а `useQuery` в браузере сразу их увидел."),
    C(`Без предзагрузки:     сервер → HTML со спиннером → JS → запрос с клиента → данные   (медленно)
С prefetch + dehydrate: сервер → запрос → HTML с данными + дамп кеша → JS → кеш восстановлен → данные уже есть`),

    H("Шаг 1. Общая функция получения QueryClient"),
    P("Главное правило: **на сервере — новый `QueryClient` на каждый запрос, в браузере — один на всё приложение**."),
    C(`// lib/get-query-client.ts
import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },   // см. ловушку №2 ниже
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return makeQueryClient();                    // новый для каждого запроса
  if (!browserQueryClient) browserQueryClient = makeQueryClient();  // один в браузере
  return browserQueryClient;
}`),
    C(`// app/providers.tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// app/layout.tsx (серверный)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body><Providers>{children}</Providers></body></html>;
}`),
    P("Почему в браузере не `useState(() => new QueryClient())`? Тоже работает, но если компонент приостановится (Suspense) до первого завершённого рендера, React выбросит состояние, и клиент создастся заново. Модульная переменная этого избегает. Главное — не создавать клиент в теле компонента без защиты: он пересоздаётся при каждой перерисовке, и кеш теряется."),

    H("Шаг 2. Предзагрузка на сервере и передача кеша"),
    C(`// lib/queries.ts — общее описание запроса, чтобы ключ и функция совпадали
import { queryOptions } from "@tanstack/react-query";
export const postsQuery = () =>
  queryOptions({ queryKey: ["posts"], queryFn: getPosts });

// app/posts/page.tsx — СЕРВЕРНЫЙ компонент
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { postsQuery } from "@/lib/queries";
import { Posts } from "./posts";

export default async function Page() {
  const queryClient = getQueryClient();                      // новый на запрос (мы на сервере)
  await queryClient.prefetchQuery(postsQuery());             // выполнить запрос и положить в кеш
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>      {/* дамп кеша для клиента */}
      <Posts />
    </HydrationBoundary>
  );
}

// app/posts/posts.tsx — КЛИЕНТСКИЙ компонент
"use client";
import { useQuery } from "@tanstack/react-query";
import { postsQuery } from "@/lib/queries";

export function Posts() {
  const { data, isFetching } = useQuery(postsQuery());       // данные уже в кеше, спиннера нет
  return <ul>{data?.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}`),
    P("Что происходит по шагам:"),
    UL(
      "**1.** Серверный компонент `Page` создаёт `QueryClient` и **ждёт** `prefetchQuery`: запрос выполняется на сервере, результат попадает в кеш под ключом `['posts']`.",
      "**2.** `dehydrate(queryClient)` превращает кеш в сериализуемый объект (ключи, данные, время получения). `HydrationBoundary` передаёт его клиентскому компоненту через RSC payload.",
      "**3.** Клиентский `Posts` при SSR уже находит данные в кеше (кеш восстановлен до рендера) и отрисовывает список в HTML.",
      "**4.** В браузере после гидратации `HydrationBoundary` вливает тот же дамп в браузерный `QueryClient`. `useQuery(['posts'])` видит свежие данные и **не делает запрос**, пока они не устарели (`staleTime`).",
      "**5.** Дальше `useQuery` работает как обычно: рефетч при фокусе, инвалидация, мутации, фоновое обновление."
    ),

    H("Вариант с потоковой отдачей (streaming)"),
    P("`await prefetchQuery` заставляет сервер ждать самый медленный запрос, прежде чем отправить хоть что-то. В TanStack Query v5 можно **не ждать**: страница отправляется сразу, а данные «довозятся» по мере готовности (вместе с `<Suspense>`)."),
    C(`// get-query-client.ts: разрешить передавать запросы в состоянии pending
import { QueryClient, defaultShouldDehydrateQuery, isServer } from "@tanstack/react-query";
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (q) => defaultShouldDehydrateQuery(q) || q.state.status === "pending",
      },
    },
  });
}

// page.tsx (серверный) — БЕЗ await
export default function Page() {
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(postsQuery());                  // запрос стартовал, но мы не ждём
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton />}>
        <Posts />                                           {/* внутри useSuspenseQuery(postsQuery()) */}
      </Suspense>
    </HydrationBoundary>
  );
}`),
    P("Как это работает: в дамп попадает **ещё не завершённый** запрос вместе с промисом, а React Server Components умеют отправлять промисы клиенту. Клиентский `useSuspenseQuery` подхватывает этот промис, показывает `fallback`, а когда данные приходят, сервер дошлёт HTML. `await` перед `prefetchQuery` оставляют, если данные нужны сразу и без скелетона."),

    H("Главные ловушки"),
    UL(
      "**№1. Один глобальный `QueryClient` на сервере.** Если создать клиент на уровне модуля (`const queryClient = new QueryClient()`), он живёт всё время работы процесса и **один и тот же** обслуживает всех пользователей. Данные одного пользователя (например, его профиль) попадут в ответ другому, кеш будет расти. Поэтому на сервере клиент создаётся **на каждый запрос**.",
      "**№2. `staleTime: 0` (по умолчанию).** Данные, пришедшие с сервера, считаются устаревшими сразу. После гидратации `useQuery` немедленно перезапросит их, и вы получите **двойной запрос**: на сервере и в браузере. Поэтому для SSR задают `staleTime` хотя бы 30–60 секунд.",
      "**№3. Разные ключи.** Если на сервере `prefetchQuery({ queryKey: ['posts'] })`, а в компоненте `useQuery({ queryKey: ['posts', 'all'] })`, кеш не совпадёт, и данные будут грузиться заново. Выносите описание в общую функцию `queryOptions`.",
      "**№4. Несериализуемые данные.** Данные передаются через дамп, поэтому они должны быть сериализуемыми. Экземпляры классов, функции и подобные значения не дойдут. Приводите ответ к простым объектам в `queryFn`.",
      "**№5. Данные пользователя в `queryFn` на сервере.** Серверный `fetch` не знает cookie браузера. Нужно передать их явно (`cookies()` / `headers()` из Next.js), иначе запрос уйдёт без авторизации.",
      "**№6. Хуки в серверных компонентах.** `useQuery` можно вызывать только в клиентских компонентах. В серверном компоненте используют `prefetchQuery`/`fetchQuery`.",
      "**№7. Ошибки предзагрузки.** Упавший `prefetchQuery` не попадает в дамп по умолчанию, поэтому клиент попробует загрузить данные сам. Это нормально, но учитывайте, что ошибка проявится позже и в браузере."
    ),

    H("Когда TanStack Query на сервере не нужен"),
    UL(
      "Если данные нужны **только серверному компоненту**, достаточно `await fetch(...)` (или запроса в БД) прямо в компоненте: Next.js сам кеширует и дедуплицирует `fetch`.",
      "TanStack Query нужен, когда есть **интерактивные клиентские данные**: фильтры, пагинация, бесконечные списки, оптимистичные мутации, фоновое обновление, рефетч при фокусе.",
      "Часто используют комбинацию: первая загрузка предзагружается на сервере (чтобы не было спиннера), дальнейшие изменения управляются `useQuery` на клиенте."
    ),

    H("Мутации и обновление данных"),
    C(`"use client";
const qc = useQueryClient();
const m = useMutation({
  mutationFn: createPost,
  onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),   // клиентский кеш
});

// если параллельно используются серверные компоненты Next.js:
// после мутации вызовите router.refresh() — он перезапросит серверные компоненты (но не кеш Query)`),
    P("Помните: есть **два кеша** — кеш Next.js для серверных данных (`revalidatePath`, `revalidateTag`) и кеш TanStack Query в браузере (`invalidateQueries`). Для одних и тех же данных стоит выбрать главный источник и не дублировать обновления."),

    H("Как проверить, что всё работает"),
    UL(
      "Откройте **View Source** страницы: список должен присутствовать прямо в HTML, а не только спиннер.",
      "На вкладке **Network** при первой загрузке не должно быть запроса за теми же данными (если `staleTime` ещё не истёк).",
      "В React Query Devtools запрос будет в статусе `fresh`, а не `fetching`.",
      "Если запрос дублируется, проверьте `staleTime` и совпадение `queryKey`."
    ),
    LK(["Advanced SSR", TQD + "guides/advanced-ssr"], ["Hydration", TQD + "reference/hydration"], ["Suspense", TQD + "guides/suspense"], ["queryOptions", TQD + "reference/queryOptions"])
  ],
  v: [
    ["Где надо создавать `QueryClient` в клиентском провайдере?", null, ["В теле компонента без обёртки", "Через `useState(() => new QueryClient())`", "В `useEffect`", "В `localStorage`"], 1, "Иначе клиент (и кеш) пересоздаётся при каждой перерисовке провайдера."],
    ["Почему нельзя использовать один `QueryClient` на модуль при SSR?", null, ["Это работает быстрее", "Кеш общий для всех запросов сервера, данные одного пользователя могут попасть другому", "Нет такой проблемы", "Запрещает TypeScript"], 1, "На сервере клиент создаётся на каждый запрос."],
    ["Зачем нужны `dehydrate` и `HydrationBoundary`?", null, ["Для стилей", "Передать серверный кеш на клиент, чтобы данные сразу были в `useQuery`", "Для тестов", "Для сжатия JSON"], 1, "Клиентский компонент получает данные без нового запроса (если они свежие)."],
    ["Почему при SSR полезно поставить `staleTime > 0`?", null, ["Ускоряет сборку", "Иначе клиент сразу после гидратации перезапросит только что полученные данные", "Это обязательное требование React", "Включает Suspense"], 1, "При `staleTime: 0` данные немедленно считаются устаревшими."],
    ["Когда TanStack Query на странице App Router не нужен?", null, ["Когда данные нужны только серверному компоненту и достаточно `fetch`", "Когда нужен рефетч при фокусе окна", "Когда нужна оптимистичная мутация", "Когда нужна бесконечная лента с кешем"], 0, "Query полезен для интерактивных клиентских данных."],
    ["Что верно?", null, ["`useSuspenseQuery` не требует проверки `data` на `undefined`", "`dehydrate` сериализует кеш", "`prefetchQuery` возвращает данные запроса", "Серверный компонент может вызывать `useQuery`"], [0, 1], "`prefetchQuery` ничего не возвращает (есть `fetchQuery`), а хуки в серверных компонентах недоступны."]
  ]
},
]);

/* ===================== TanStack Query, часть 2 ===================== */
K("tq", [
{
  id: "q-tq-7",
  q: "Как организовать `queryKey` в большом приложении и как инвалидация по префиксу работает?",
  o: ["Ключи — произвольные строки, инвалидация ищет их по подстроке", "Иерархические массивы (фабрика ключей): `['todos','list',filters]`; `invalidateQueries({queryKey:['todos']})` затрагивает все ключи с таким префиксом", "Один глобальный ключ на всё приложение, остальное — через `select`", "Ключ — это ссылка на объект, поэтому его нужно мемоизировать"],
  a: 1,
  e: "Совпадение идёт по префиксу массива (если не указан `exact: true`). Фабрика ключей держит их в одном месте, а иерархия позволяет сбросить сразу список и детали сущности.",
  d: [
    H("Фабрика ключей и инвалидация"),
    C(`const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: Filters) => [...todoKeys.lists(), filters] as const,
  detail: (id: number) => [...todoKeys.all, "detail", id] as const,
};

useQuery({ queryKey: todoKeys.detail(id), queryFn: () => getTodo(id) });

// после мутации
queryClient.invalidateQueries({ queryKey: todoKeys.lists() });   // только списки
queryClient.invalidateQueries({ queryKey: todoKeys.all });       // всё про todos`),
    UL(
      "**`invalidateQueries`** помечает запросы устаревшими (`stale`) и сразу перезапрашивает **активные**; неактивные обновятся при следующем использовании.",
      "**`exact: true`** — только точное совпадение ключа; **`predicate`** — произвольный фильтр.",
      "**`setQueryData`** обновляет кеш без сети; **`removeQueries`** удаляет; **`resetQueries`** возвращает к начальному состоянию.",
      "Ключ сериализуется структурно: `{a:1,b:2}` и `{b:2,a:1}` равны, а порядок элементов массива важен.",
      "В ключе не должно быть функций, классов и недетерминированных значений (даты лучше в ISO-строке)."
    ),
    LK(["Query Invalidation", TQD + "guides/query-invalidation"], ["Query Keys", TQD + "guides/query-keys"], ["Updates from Mutations", TQD + "guides/updates-from-mutations-responses"])
  ],
  v: [
    ["Что делает `invalidateQueries({ queryKey: ['todos'] })`?", null, ["Удаляет все запросы с этим ключом из кеша", "Помечает совпавшие по префиксу запросы устаревшими и перезапрашивает активные", "Обновляет только ключ ровно `['todos']`", "Отключает запросы до перезагрузки страницы"], 1, "Совпадение по префиксу, перезапрос только для активных."],
    ["Какой параметр ограничивает инвалидацию ровно одним ключом?", null, ["`strict: true`", "`exact: true`", "`only: true`", "`single: true`"], 1, "Без `exact` работает сопоставление по префиксу."],
    ["Равны ли ключи `['u', {a:1,b:2}]` и `['u', {b:2,a:1}]`?", null, ["Да, порядок свойств объекта не важен", "Нет, порядок свойств сравнивается", "Равны только при `exact: true`", "Равны только в v4"], 0, "Объекты сравниваются структурно после стабильной сериализации."],
    ["Что произойдёт с неактивным запросом при инвалидации?", null, ["Он будет перезапрошен сразу", "Помечается устаревшим и обновится при следующем использовании", "Будет удалён из кеша", "Выбросит ошибку"], 1, "Сразу перезапрашиваются только активные запросы."],
    ["Чем `setQueryData` отличается от `invalidateQueries`?", null, ["Ничем", "`setQueryData` записывает данные в кеш без сети, `invalidateQueries` помечает устаревшими", "`setQueryData` запускает запрос на сервер", "`invalidateQueries` обновляет данные без сети"], 1, "Первое — прямое обновление кеша, второе — сигнал на перезагрузку."],
    ["Что нельзя класть в `queryKey`?", null, ["Строки и числа", "Функции и недетерминированные значения", "Объекты с фильтрами", "Идентификаторы сущностей"], 1, "Ключ должен сериализоваться стабильно."]
  ]
},
{
  id: "q-tq-8",
  q: "Как построить зависимые и параллельные запросы, и когда использовать `useQueries`, `enabled` и `skipToken`?",
  o: ["Зависимые запросы нельзя, нужно вкладывать `await` в один `queryFn`", "Зависимый запрос: `enabled: !!userId` (или `skipToken`); набор запросов неизвестной длины — `useQueries`", "Параллельные запросы возможны только в `useEffect`", "Для зависимости достаточно одного общего ключа"],
  a: 1,
  e: "Несколько вызовов `useQuery` в одном компоненте идут параллельно. Если один запрос нужен другому, второй включают через `enabled`. Динамический список запросов (по массиву ids) делает `useQueries`, потому что число хуков нельзя менять от рендера к рендеру.",
  d: [
    H("Параллельные и зависимые запросы"),
    C(`const user = useQuery({ queryKey: ["user", email], queryFn: () => getUser(email) });
const userId = user.data?.id;

// зависимый: не выполняется, пока нет userId
const projects = useQuery({
  queryKey: ["projects", userId],
  queryFn: userId ? () => getProjects(userId) : skipToken,
});

// переменное число запросов
const results = useQueries({
  queries: ids.map((id) => ({ queryKey: ["post", id], queryFn: () => getPost(id) })),
  combine: (rs) => ({ data: rs.map((r) => r.data), pending: rs.some((r) => r.isPending) }),
});`),
    UL(
      "**`enabled: false`** оставляет запрос в `pending` без выполнения; `skipToken` делает то же и ещё сужает типы в TypeScript.",
      "**Waterfall**: цепочка зависимых запросов растёт по времени — лучше отдавать с бэкенда агрегированный эндпоинт.",
      "**`combine`** в `useQueries` уменьшает перерисовки и собирает результат.",
      "**Suspense**: несколько `useSuspenseQuery` в одном компоненте выполняются последовательно, поэтому используют `useSuspenseQueries`."
    ),
    LK(["Dependent Queries", TQD + "guides/dependent-queries"], ["Parallel Queries", TQD + "guides/parallel-queries"], ["useQueries", TQD + "reference/useQueries"])
  ],
  v: [
    ["Что делает `enabled: false`?", null, ["Удаляет запрос из кеша", "Запрос не выполняется автоматически", "Запрос выполняется один раз", "Запрос становится ошибочным"], 1, "Выполнить можно вручную через `refetch`."],
    ["Когда нужен `useQueries`?", null, ["Когда число запросов определяется данными и меняется", "Когда запрос один", "Когда нужен рефетч по таймеру", "Всегда вместо `useQuery`"], 0, "Нельзя вызывать `useQuery` в цикле с переменной длиной."],
    ["Что значит термин waterfall применительно к запросам?", null, ["Запросы идут последовательно из-за зависимостей", "Запросы идут параллельно", "Кеш очищается каскадом", "Данные приходят потоком"], 0, "Каждый следующий ждёт предыдущий."],
    ["Зачем нужен `skipToken` вместо `enabled`?", null, ["Он быстрее", "Он сужает типы: `queryFn` не вызывается и не требует `undefined`", "Он включает кеш", "Он отключает повторы"], 1, "Для TypeScript это удобнее, чем `userId!`."],
    ["Выполняются ли два `useQuery` в одном компоненте параллельно?", null, ["Да, если они независимы", "Нет, только по очереди", "Только с `useQueries`", "Только при `suspense`"], 0, "Запросы запускаются сразу при монтировании."],
    ["Для чего служит `combine` в `useQueries`?", null, ["Для объединения кеша", "Для преобразования массива результатов в нужную форму", "Для слияния ключей", "Для отмены запросов"], 1, "Результат также стабилен по ссылке и вызывает меньше рендеров."]
  ]
},
{
  id: "q-tq-9",
  q: "Как в TanStack Query обрабатывать ошибки: повторы, `throwOnError`, глобальный обработчик и границы ошибок?",
  o: ["Ошибки нужно ловить в каждом `queryFn` и возвращать `null`", "`retry`/`retryDelay` для повторов, `throwOnError` для передачи в Error Boundary, глобальный `QueryCache({ onError })` для логов и тостов", "Ошибки в запросах всегда игнорируются библиотекой", "Единственный способ — колбэк `onError` в `useQuery`"],
  a: 1,
  e: "`queryFn` должен бросать исключение (для `fetch` нужно проверять `response.ok`). Тогда библиотека повторит запрос, переведёт его в `error` и при `throwOnError` пробросит ошибку в ближайшую Error Boundary. Колбэки `onError` у `useQuery` убраны в v5, глобальная обработка живёт в `QueryCache`.",
  d: [
    H("Ошибки и повторы"),
    C(`const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) toast.error("Не удалось обновить: " + error.message);
    },
  }),
  defaultOptions: { queries: { retry: (count, err) => count < 2 && !(err instanceof AuthError) } },
});

async function getTodos() {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new HttpError(res.status);   // fetch сам не бросает на 4xx/5xx
  return res.json();
}

useQuery({ queryKey: ["todos"], queryFn: getTodos, throwOnError: (e) => e.status >= 500 });`),
    UL(
      "**По умолчанию 3 повтора** с экспоненциальной паузой; в тестах обычно ставят `retry: false`.",
      "**`throwOnError: true`** + `QueryErrorResetBoundary` даёт кнопку «повторить» в Error Boundary.",
      "**Не повторять** ошибки 4xx (особенно 401/403/404) — настраивается функцией в `retry`.",
      "**Фоновая ошибка**: если данные уже есть, они остаются в `data`, а статус может быть `error` — решайте, показывать ли тост.",
      "**`onError` у мутаций** остаётся и подходит для локальных реакций."
    ),
    LK(["Query Retries", TQD + "guides/query-retries"], ["QueryErrorResetBoundary", TQD + "reference/QueryErrorResetBoundary"], ["Testing", TQD + "guides/testing"])
  ],
  v: [
    ["Бросает ли `fetch` ошибку при ответе 404?", null, ["Да, всегда", "Нет, нужно проверить `response.ok` и бросить самому", "Только в браузере Safari", "Только с заголовком `Accept`"], 1, "Сетевая ошибка бросает исключение, HTTP-статус — нет."],
    ["Сколько повторов по умолчанию делает `useQuery` при ошибке?", null, ["0", "1", "3", "10"], 2, "С растущей экспоненциальной задержкой."],
    ["Как передать ошибку запроса в Error Boundary?", null, ["Опция `throwOnError`", "Вызвать `alert`", "Опция `boundary: true`", "Через `onSuccess`"], 0, "В v4 она называлась `useErrorBoundary`."],
    ["Где в v5 удобно настроить глобальный тост на ошибки запросов?", null, ["В `onError` каждого `useQuery`", "В `new QueryCache({ onError })`", "В `useEffect` корня", "В `QueryClient.mount`"], 1, "Колбэки на уровне `useQuery` убрали."],
    ["Зачем в тестах ставят `retry: false`?", null, ["Чтобы ошибка проявилась сразу, а не после нескольких пауз", "Чтобы отключить кеш", "Чтобы ускорить сборку", "Чтобы мок работал"], 0, "Иначе тест ждёт три повтора."],
    ["Что сохраняется в `data`, если фоновый рефетч упал с ошибкой?", null, ["`data` очищается", "Последние успешные данные остаются", "Значение `null`", "Пустой массив"], 1, "Поэтому состояние ошибки и наличие данных проверяют отдельно."]
  ]
},
{
  id: "q-tq-10",
  q: "Что делают опции `select` и структурное разделение (structural sharing) и как они сокращают лишние рендеры?",
  o: ["`select` меняет данные в кеше, а structural sharing копирует их глубоко", "`select` преобразует данные для конкретного наблюдателя без изменения кеша; structural sharing сохраняет прежние ссылки на неизменившиеся части", "Обе опции отключают рендер при любом изменении", "`select` обязателен для TypeScript"],
  a: 1,
  e: "Кеш хранит исходный ответ, а `select` вычисляет производное значение для компонента. Компонент перерисуется только если результат `select` изменился (сравнение по ссылке после structural sharing). Вычисление можно стабилизировать, вынеся функцию из рендера или обернув в `useCallback`.",
  d: [
    H("select и перерисовки"),
    C(`// компонент перерисуется только при изменении числа выполненных задач
const done = useQuery({
  queryKey: ["todos"],
  queryFn: getTodos,
  select: (todos) => todos.filter((t) => t.done).length,
});

// notifyOnChangeProps: подписка только на нужные поля результата
const { data } = useQuery({ queryKey: ["todos"], queryFn: getTodos, notifyOnChangeProps: ["data"] });`),
    UL(
      "**Structural sharing**: после рефетча одинаковые поддеревья остаются прежними ссылками, поэтому `React.memo` и зависимости хуков не срабатывают зря.",
      "**`select` выполняется** при изменении данных и при смене самой функции, поэтому лучше выносить её за компонент.",
      "**Tracked properties** (по умолчанию): компонент перерисовывается только при изменении тех полей результата, которые он реально читает (`data`, `isFetching`…).",
      "**Объекты с датами и классами** не поддаются structural sharing — отключайте `structuralSharing: false` при необходимости."
    ),
    LK(["Render Optimizations", TQD + "guides/render-optimizations"], ["Query Options", TQD + "reference/useQuery"])
  ],
  v: [
    ["Меняет ли `select` данные, хранящиеся в кеше?", null, ["Да", "Нет, только вид данных для компонента", "Только при `exact`", "Только в v4"], 1, "Кеш содержит исходный ответ."],
    ["Что сохраняет structural sharing?", null, ["Ссылки на неизменившиеся части данных", "Кеш в `localStorage`", "Порядок ключей", "Историю запросов"], 0, "Это снижает число перерисовок."],
    ["Что нужно сделать, чтобы `select` не пересчитывался на каждый рендер?", null, ["Ничего", "Вынести функцию за компонент или стабилизировать через `useCallback`", "Добавить `enabled`", "Заменить на `useEffect`"], 1, "Новая ссылка на функцию заставляет пересчитать."],
    ["Какие поля результата заставляют компонент перерисоваться по умолчанию?", null, ["Все", "Только те, которые компонент прочитал", "Только `data`", "Ни одно"], 1, "Это tracked properties."],
    ["Для чего служит `notifyOnChangeProps`?", null, ["Для ограничения полей результата, при смене которых идёт рендер", "Для логирования", "Для отмены запроса", "Для смены ключа"], 0, "Тонкая настройка перерисовок."],
    ["Когда стоит отключить `structuralSharing`?", null, ["Если данные содержат классы или Date и сравнение неудобно", "Всегда", "Никогда", "Если запрос один"], 0, "Это экзотический случай."]
  ]
},
{
  id: "q-tq-11",
  q: "Как работают мутации (`useMutation`) и чем `mutate` отличается от `mutateAsync`?",
  o: ["`mutate` возвращает Promise, `mutateAsync` — нет", "`mutate` не возвращает результата и не бросает наружу, обработка идёт колбэками; `mutateAsync` возвращает Promise и требует `try/catch`", "Они полностью одинаковы", "`mutateAsync` работает только с GET"],
  a: 1,
  e: "`mutate` — «выстрелить и забыть» с колбэками `onSuccess/onError/onSettled`. `mutateAsync` возвращает Promise, его удобно `await`-ить в последовательной логике, но тогда ошибку нужно ловить самому, иначе будет unhandled rejection.",
  d: [
    H("Мутации"),
    C(`const m = useMutation({
  mutationFn: (input: NewTodo) => api.post("/todos", input),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
});

m.mutate({ title: "купить хлеб" }, { onError: (e) => toast.error(e.message) });

// последовательная логика
try {
  const created = await m.mutateAsync({ title: "..." });
  navigate("/todos/" + created.id);
} catch (e) { /* обработка */ }`),
    UL(
      "**Статусы**: `idle`, `pending`, `error`, `success`; флаг `isPending`.",
      "**Колбэки**: на уровне хука выполняются всегда, колбэки второго аргумента `mutate` — только если компонент ещё смонтирован.",
      "**Повторы** у мутаций по умолчанию отключены, потому что операция может быть не идемпотентной.",
      "**`mutationKey` + `useMutationState`** позволяют показать состояние мутации в другом месте интерфейса.",
      "**Оффлайн**: мутации ставятся на паузу (`networkMode`) и выполняются при возвращении сети."
    ),
    LK(["Mutations", TQD + "guides/mutations"], ["useMutation", TQD + "reference/useMutation"])
  ],
  v: [
    ["Что возвращает `mutateAsync`?", null, ["`void`", "Promise с результатом мутации", "Объект состояния", "Функцию отмены"], 1, "Ошибку нужно ловить самостоятельно."],
    ["Повторяет ли `useMutation` запрос по умолчанию?", null, ["Да, 3 раза", "Нет", "Только на 5xx", "Только при потере сети"], 1, "Не всякая операция идемпотентна."],
    ["Где лучше инвалидировать кеш после успешной мутации?", null, ["В `onSuccess` мутации", "Перед вызовом `mutate`", "В рендере компонента", "В `queryFn`"], 0, "Тогда обновление выполняется после подтверждения сервера."],
    ["Какой хук показывает состояние мутаций по всему приложению?", null, ["`useIsMutating`/`useMutationState`", "`useMutations`", "`useQueryState`", "`useGlobalMutation`"], 0, "Работает через `mutationKey`."],
    ["Что будет, если вызвать `mutateAsync` без `try/catch` и сервер вернёт ошибку?", null, ["Ошибка будет проглочена", "Появится unhandled promise rejection", "Запрос повторится", "Компонент перемонтируется"], 1, "Поэтому чаще используют `mutate`."],
    ["Какие статусы бывают у мутации?", null, ["`idle`, `pending`, `error`, `success`", "`stale`, `fresh`", "`fetching`, `paused`", "`open`, `closed`"], 0, "В v5 вместо `loading` — `pending`."]
  ]
},
{
  id: "q-tq-12",
  q: "Что такое prefetching и как избежать лишних запросов при навигации (hover, роутер, `ensureQueryData`)?",
  o: ["Prefetching нужен только в SSR", "Предзагрузка данных до рендера: `prefetchQuery` при hover/в loader, `ensureQueryData` вернёт кеш или загрузит", "Prefetching отключает кеш", "Это то же самое, что `initialData`"],
  a: 1,
  e: "`prefetchQuery` кладёт данные в кеш заранее, поэтому следующий `useQuery` с тем же ключом получает их мгновенно, а свежесть определяет `staleTime`. `ensureQueryData` подходит для loader’ов роутера: возвращает кеш, если он есть, без лишней сети.",
  d: [
    H("Prefetch и роутинг"),
    C(`// при наведении на ссылку
<Link to={"/post/" + id} onMouseEnter={() => queryClient.prefetchQuery({
  queryKey: ["post", id], queryFn: () => getPost(id), staleTime: 60_000,
})} />

// loader в React Router
export const loader = (qc: QueryClient) => async ({ params }: LoaderFunctionArgs) =>
  qc.ensureQueryData(postQuery(params.id!));

// переиспользуемое описание запроса
export const postQuery = (id: string) => queryOptions({ queryKey: ["post", id], queryFn: () => getPost(id) });`),
    UL(
      "**`queryOptions`** объединяет ключ и функцию, поэтому их используют и в `useQuery`, и в `prefetchQuery`, и в loader’ах.",
      "**`staleTime` в prefetch** важен: при нуле данные сразу устареют и будут перезапрошены.",
      "**Рендер-водопад**: загрузка начинается в loader’е, а не после монтирования компонента.",
      "**`placeholderData`** из списка для детальной страницы показывает быстрый скелет."
    ),
    LK(["Prefetching & Router Integration", TQD + "guides/prefetching"], ["queryOptions", TQD + "reference/queryOptions"])
  ],
  v: [
    ["Что делает `prefetchQuery`?", null, ["Загружает данные в кеш без подписки компонента", "Подписывает компонент", "Удаляет кеш", "Блокирует рендер"], 0, "Следующий `useQuery` возьмёт данные из кеша."],
    ["Чем `ensureQueryData` отличается от `fetchQuery`?", null, ["Возвращает кеш, если он есть, не делая запрос", "Всегда делает запрос", "Ничем", "Работает только на сервере"], 0, "Учитывается наличие данных, а не только их свежесть."],
    ["Зачем указывать `staleTime` в `prefetchQuery`?", null, ["Чтобы данные не считались устаревшими сразу и не перезапрашивались", "Для включения повторов", "Для смены ключа", "Для отмены"], 0, "По умолчанию данные устаревают сразу."],
    ["Что даёт `queryOptions`?", null, ["Единое переиспользуемое описание запроса с типами", "Ускорение сети", "Отключение повторов", "Автоматические мутации"], 0, "Ключ и функция не расходятся между местами использования."],
    ["Когда начинать загрузку, чтобы избежать водопада?", null, ["До монтирования компонента: в loader’е или при hover", "После `useEffect`", "После всех картинок", "Только по таймеру"], 0, "Тогда данные приходят параллельно с кодом."],
    ["Что показывает `placeholderData` на странице детали?", null, ["Временные данные (например, из списка) пока грузится полная версия", "Ошибку", "Кеш другого пользователя", "Пустой экран"], 0, "В отличие от `initialData`, не записывается в кеш."]
  ]
},
{
  id: "q-tq-13",
  q: "Как работают фоновые обновления: `refetchInterval`, `refetchOnWindowFocus`, `focusManager`, `onlineManager` и `networkMode`?",
  o: ["Это настройки браузера, библиотека на них не влияет", "Библиотека подписана на фокус окна и статус сети; поллинг задаётся `refetchInterval`, оффлайн-поведение — `networkMode`", "Фоновых обновлений в TanStack Query нет", "Рефетч идёт только вручную"],
  a: 1,
  e: "`focusManager` и `onlineManager` дают библиотеке события; при возврате фокуса или сети устаревшие запросы перезапрашиваются. Поллинг делают через `refetchInterval` (можно функцией), а в React Native эти менеджеры подключают вручную.",
  d: [
    H("Фоновые обновления"),
    C(`useQuery({
  queryKey: ["status"],
  queryFn: getStatus,
  refetchInterval: (query) => (query.state.data?.done ? false : 2000), // поллинг до готовности
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: "always",
  networkMode: "online",  // 'always' | 'offlineFirst'
});`),
    UL(
      "**`refetchOnWindowFocus`**: по умолчанию `true`, только для устаревших данных; `'always'` — всегда.",
      "**`refetchInterval`** остановится, когда вкладка скрыта, если не включён `refetchIntervalInBackground`.",
      "**`networkMode`**: `online` (пауза без сети), `always` (игнорировать статус сети), `offlineFirst` (первая попытка, потом пауза).",
      "**React Native**: нужно связать `focusManager` с `AppState`, а `onlineManager` — с NetInfo.",
      "**WebSocket/SSE**: данные из потока записывают через `setQueryData`, а не через поллинг."
    ),
    LK(["Window Focus Refetching", TQD + "guides/window-focus-refetching"], ["Network Mode", TQD + "guides/network-mode"], ["Polling", TQD + "reference/useQuery"])
  ],
  v: [
    ["Какой флаг включает поллинг?", null, ["`refetchInterval`", "`pollEvery`", "`staleTime`", "`gcTime`"], 0, "Значение — миллисекунды или функция."],
    ["Как остановить поллинг, когда нужное состояние достигнуто?", null, ["Вернуть `false` из функции `refetchInterval`", "Удалить компонент", "Поставить `gcTime: 0`", "Вызвать `reset`"], 0, "Функция получает запрос и решает."],
    ["Какие данные перезапрашиваются при возврате фокуса окна по умолчанию?", null, ["Только устаревшие", "Все", "Никакие", "Только с ошибкой"], 0, "Свежие данные остаются как есть."],
    ["Что делает `networkMode: 'always'`?", null, ["Игнорирует статус сети и запускает запросы всегда", "Ставит запросы на паузу", "Отключает кеш", "Включает WebSocket"], 0, "Полезно для локальных ресурсов."],
    ["Что нужно подключить в React Native для событий фокуса?", null, ["`focusManager` с `AppState`", "`window.onfocus`", "Ничего", "`document.visibilityState`"], 0, "В RN нет событий окна браузера."],
    ["Как записать данные из WebSocket в кеш?", null, ["`queryClient.setQueryData` по ключу", "Через `refetchInterval`", "Через `localStorage`", "Изменить объект напрямую"], 0, "Затем подписанные компоненты перерисуются."]
  ]
},
{
  id: "q-tq-14",
  q: "Когда TanStack Query лучше RTK Query, SWR или самописных `useEffect`, и что он НЕ заменяет?",
  o: ["Он заменяет любой клиентский стор, включая состояние UI", "Он управляет серверным состоянием (кеш, дедупликация, фоновые обновления); клиентское состояние (модалки, формы, тема) остаётся в других инструментах", "Он нужен только для GraphQL", "Он заменяет бэкенд"],
  a: 1,
  e: "Серверное состояние асинхронно, принадлежит не вам и может устареть, поэтому ему нужны кеш, инвалидация и повторы. RTK Query решает то же внутри Redux, SWR — проще, но с меньшим числом возможностей (мутации, офлайн, инфинити-запросы устроены легче).",
  d: [
    H("Выбор инструмента для данных с сервера"),
    UL(
      "**Самописный `useEffect`+`fetch`**: легко получить гонки, дубли запросов, отсутствие кеша и отмены.",
      "**TanStack Query**: не зависит от фреймворка и клиента HTTP, богатый API (мутации, infinite, prefetch, SSR, devtools).",
      "**RTK Query**: хорош, если уже используется Redux Toolkit; кеш лежит в сторе, эндпоинты описываются декларативно, можно генерировать из OpenAPI.",
      "**SWR**: меньше API (`useSWR`, `mutate`), удобен для простых сценариев.",
      "**Server Components / `use`**: часть чтений переезжает на сервер, но клиентский кеш для интерактивных частей всё равно нужен.",
      "**Не заменяет**: состояние форм, UI-состояние и данные, принадлежащие клиенту."
    ),
    P("Типичная архитектура: серверные данные — в TanStack Query, локальное состояние — в `useState`/Zustand, форма — в React Hook Form, а результат валидации схемой (Zod) используется и в форме, и в `queryFn`."),
    LK(["Overview", "https://tanstack.com/query/latest/docs/framework/react/overview"], ["Comparison", "https://tanstack.com/query/latest/docs/framework/react/comparison"])
  ],
  v: [
    ["Что такое серверное состояние?", null, ["Данные, хранящиеся на сервере и кешируемые на клиенте", "Состояние компонента", "Тема приложения", "Данные формы"], 0, "Оно асинхронно и может устареть."],
    ["Что остаётся вне TanStack Query?", null, ["Состояние модалок и тема", "Ответы API", "Пагинация", "Кеширование"], 0, "Клиентское состояние — задача других инструментов."],
    ["Какую проблему создаёт простой `useEffect` с `fetch`?", null, ["Гонки ответов, дубли и отсутствие кеша", "Слишком быстрые запросы", "Нельзя использовать async", "Работает только в SSR"], 0, "Нужны отмена и управление жизненным циклом."],
    ["Когда разумно взять RTK Query?", null, ["Когда в проекте уже есть Redux Toolkit", "Когда нет React", "Когда нужен только GraphQL", "Никогда"], 0, "Тогда не придётся вводить вторую библиотеку."],
    ["Что общего у SWR и TanStack Query?", null, ["Подход stale-while-revalidate", "Хранение в `localStorage`", "Серверный рендеринг без кода", "Генерация SQL"], 0, "Сначала показывают кеш, затем обновляют."],
    ["Можно ли использовать TanStack Query вместе с Server Components?", null, ["Да: часть данных грузится на сервере, интерактивные запросы остаются на клиенте", "Нет, они несовместимы", "Только в Pages Router", "Только с Redux"], 0, "Разделение зависит от интерактивности."]
  ]
},
{
  id: "q-tq-15",
  q: "Как тестировать компоненты с TanStack Query (изоляция кеша, моки сети, `waitFor`)?",
  o: ["Общий `QueryClient` для всех тестов, чтобы кеш ускорял прогон", "Новый `QueryClient` с `retry: false` на каждый тест + мок сети (MSW) и ожидание через `findBy*`/`waitFor`", "Мокать сам `useQuery` во всех тестах", "Тестировать только снимками"],
  a: 1,
  e: "Общий кеш делает тесты зависимыми друг от друга. Мок сети (например, MSW) проверяет реальный путь `queryFn` → кеш → UI. Асинхронные состояния ожидают через `findBy*` или `waitFor`.",
  d: [
    H("Тесты"),
    C(`function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

test("показывает задачи", async () => {
  server.use(http.get("/api/todos", () => HttpResponse.json([{ id: 1, title: "A" }])));
  renderWithClient(<Todos />);
  expect(await screen.findByText("A")).toBeInTheDocument();
});`),
    UL(
      "**Чистый клиент на каждый тест** — изоляция.",
      "**`retry: false`** — иначе ошибка проявится только через несколько повторов.",
      "**MSW** проверяет интеграцию; мок `useQuery` скрывает ошибки конфигурации.",
      "**Хуки**: `renderHook` с `wrapper`, затем `waitFor(() => expect(result.current.isSuccess).toBe(true))`.",
      "**`gcTime: Infinity`** (или 0 для строгих тестов) избегает предупреждений о таймерах."
    ),
    LK(["Testing", TQD + "guides/testing"])
  ],
  v: [
    ["Зачем создавать новый `QueryClient` для каждого теста?", null, ["Для изоляции кеша между тестами", "Для ускорения", "Для включения повторов", "Для devtools"], 0, "Иначе результаты влияют друг на друга."],
    ["Почему в тестах ставят `retry: false`?", null, ["Чтобы не ждать повторов при ошибках", "Чтобы отключить сеть", "Чтобы включить SSR", "Чтобы очистить кеш"], 0, "Ошибка появляется сразу."],
    ["Какой запрос из RTL ждёт появления элемента?", null, ["`findBy*`", "`getBy*`", "`queryBy*`", "`allBy*`"], 0, "Он возвращает Promise."],
    ["Что проверяет мок сети (MSW) в отличие от мока `useQuery`?", null, ["Реальный путь через `queryFn`", "Только сигнатуру хука", "Только стили", "Только типы"], 0, "Включая обработку ошибок."],
    ["Как протестировать пользовательский хук с `useQuery`?", null, ["`renderHook` с обёрткой `QueryClientProvider`", "Вызвать как обычную функцию", "Через `setTimeout`", "Невозможно"], 0, "Хуки нуждаются в контексте."],
    ["Что делает `waitFor`?", null, ["Повторяет проверку, пока она не пройдёт или не истечёт таймаут", "Блокирует поток", "Очищает DOM", "Перезапускает тест"], 0, "Удобно для асинхронных обновлений."]
  ]
},
{
  id: "q-tq-16",
  q: "Что такое `useSuspenseQuery` и как он меняет работу с загрузкой и ошибками?",
  o: ["Это тот же `useQuery`, просто с другим названием", "`data` всегда определена, загрузка выражается через `Suspense`, ошибки — через Error Boundary", "Он отключает кеш", "Он работает только на сервере"],
  a: 1,
  e: "`useSuspenseQuery` выбрасывает Promise во время загрузки (ловит `<Suspense>`) и ошибку (ловит Error Boundary), поэтому тип `data` не содержит `undefined`. Опций `enabled` и `placeholderData` у него нет.",
  d: [
    H("Suspense"),
    C(`function Profile({ id }: { id: string }) {
  const { data } = useSuspenseQuery(userQuery(id)); // data: User, не undefined
  return <h1>{data.name}</h1>;
}

<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Skeleton />}>
    <Profile id="1" />
  </Suspense>
</ErrorBoundary>`),
    UL(
      "**Нет `enabled`**: условная загрузка решается условным рендером компонента.",
      "**Водопад**: несколько `useSuspenseQuery` подряд в одном компоненте идут последовательно, используйте `useSuspenseQueries` или prefetch.",
      "**`useTransition`/`startTransition`** позволяют не показывать fallback повторно при смене ключа.",
      "**SSR/streaming**: с `HydrationBoundary` и `prefetchQuery` данные можно стримить."
    ),
    LK(["Suspense", TQD + "guides/suspense"])
  ],
  v: [
    ["Содержит ли тип `data` в `useSuspenseQuery` значение `undefined`?", null, ["Нет", "Да", "Только при ошибке", "Только на сервере"], 0, "Компонент рендерится только когда данные есть."],
    ["Кто обрабатывает загрузку при `useSuspenseQuery`?", null, ["`<Suspense>`", "Сам хук через `isPending`", "Роутер", "Redux"], 0, "Хук выбрасывает Promise."],
    ["Кто обрабатывает ошибку?", null, ["Error Boundary", "`Suspense`", "`QueryClient`", "Никто"], 0, "Ошибка выбрасывается при рендере."],
    ["Какой опции нет у `useSuspenseQuery`?", null, ["`enabled`", "`queryKey`", "`staleTime`", "`select`"], 0, "Условность делают рендером."],
    ["Как избежать последовательной загрузки нескольких suspense-запросов?", null, ["`useSuspenseQueries` или prefetch", "Больше `useEffect`", "Увеличить `gcTime`", "Никак"], 0, "Они стартуют параллельно."],
    ["Как не показывать fallback при смене ключа?", null, ["Оборачивать обновление в `startTransition`", "Удалить `Suspense`", "Поставить `retry: 0`", "Использовать `localStorage`"], 0, "React удерживает прошлый UI."]
  ]
}
]);
