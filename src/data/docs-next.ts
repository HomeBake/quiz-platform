import { C, DOCS, H, LK, P, UL } from "./registry";
/* ===================== Next.js: документация ===================== */
const NX = "https://nextjs.org/docs/app/";

/* ===== App Router: маршруты и файлы ===== */
DOCS["q-nx-1"] = [
  H("Файловая маршрутизация и особые файлы"),
  P("В App Router маршрут задаёт **структура папок** внутри `app/`, а UI сегмента описывают файлы с зарезервированными именами. Папка становится URL-сегментом, но маршрутом (доступным по адресу) она станет, только если в ней есть `page.tsx` или `route.ts`."),
  C(`app/
├─ layout.tsx          корневой layout (обязателен): <html>, <body>
├─ page.tsx            страница /
├─ dashboard/
│  ├─ layout.tsx       общая обёртка для /dashboard/*
│  ├─ template.tsx     как layout, но пересоздаётся при каждой навигации
│  ├─ loading.tsx      Suspense-fallback для сегмента
│  ├─ error.tsx        Error Boundary сегмента ('use client')
│  ├─ not-found.tsx    UI для notFound()
│  ├─ page.tsx         /dashboard
│  └─ [id]/page.tsx    /dashboard/:id`),

  H("layout против template"),
  UL(
    "**`layout.tsx`**: оборачивает дочерние сегменты. При навигации между детьми **не перерисовывается и не теряет состояние** (частичный рендеринг: на сервер запрашивается только изменившаяся часть). Подходит для навигации, боковых панелей, провайдеров.",
    "**`template.tsx`**: тоже оборачивает детей, но для каждого дочернего сегмента создаёт **новый экземпляр**: состояние сбрасывается, эффекты запускаются заново, DOM пересоздаётся. Нужен для анимаций входа/выхода, логирования просмотров через `useEffect`, сброса формы при смене страницы.",
    "Layout **не получает** `searchParams` (он не перерисовывается при смене параметров запроса). Для них используйте страницу или клиентский `useSearchParams`."
  ),
  P("Корневой `layout.tsx` обязателен, и именно он отдаёт теги `<html>` и `<body>`. Вложенные layout-ы выстраиваются в цепочку, и каждый получает `children`."),

  H("Иерархия специальных файлов"),
  C(`<Layout>
  <Template>
    <ErrorBoundary fallback={<Error />}>      // error.tsx
      <Suspense fallback={<Loading />}>       // loading.tsx
        <ErrorBoundary fallback={<NotFound />}>   // not-found.tsx
          <Page />
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  </Template>
</Layout>`),
  P("Из этой иерархии вытекает важная деталь: `error.tsx` **не ловит** ошибки в `layout.tsx` того же сегмента (он находится внутри layout). Для этого нужен `error.tsx` на уровне выше или `global-error.tsx` для корневого layout."),
  LK(["Next.js: Layouts and Pages", NX + "getting-started/layouts-and-pages"], ["Next.js: Project structure", NX + "getting-started/project-structure"], ["Next.js: Error handling", NX + "getting-started/error-handling"]),
];

DOCS["q-nx-2"] = [
  H("Динамические сегменты"),
  C(`app/blog/[slug]/page.tsx         /blog/hello         params = { slug: "hello" }
app/shop/[...slug]/page.tsx       /shop/a/b/c         params = { slug: ["a","b","c"] }  (но не /shop)
app/docs/[[...slug]]/page.tsx     /docs, /docs/a/b    params = { slug: undefined } или ["a","b"]`),
  UL(
    "`[name]`: **ровно один** сегмент.",
    "`[...name]` (catch-all): **один и больше**, значение — массив строк. Совпадение с корнем (`/shop`) не происходит, нужна отдельная `page.tsx`.",
    "`[[...name]]` (optional catch-all): **ноль и больше**; для корня параметр отсутствует (`undefined`).",
    "Catch-all допустим только последним сегментом пути."
  ),

  H("params и searchParams — промисы"),
  P("Начиная с Next.js 15 `params` и `searchParams` (в `page`, `layout`, `route`, `generateMetadata`) — **асинхронные**, в 16 синхронный доступ удалён. Причина — подготовить рендеринг без ожидания запроса: пока вы не обратились к значению, Next.js не знает, зависит ли от него страница, и может подготовить остальное заранее."),
  C(`// Серверный компонент
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <h1>{slug}</h1>;
}

// Клиентский компонент: хук use() из React
"use client";
import { use } from "react";
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  ...
}`),
  P("В TypeScript для типизации есть вспомогательные типы `PageProps<'/blog/[slug]'>` и `LayoutProps<...>` (генерируются Next.js). `searchParams` доступен только странице, а в клиентских компонентах используют `useSearchParams()` (его нужно оборачивать в `<Suspense>`, иначе статическая сборка страницы завершится ошибкой)."),

  H("Сборка и динамические параметры"),
  P("`generateStaticParams` перечисляет значения параметров, которые нужно отрендерить на сборке: `export async function generateStaticParams() { return posts.map((p) => ({ slug: p.slug })); }`. Остальные значения рендерятся по первому запросу (или дают 404, если `dynamicParams = false`)."),
  LK(["Next.js: Dynamic routes", NX + "getting-started/layouts-and-pages#dynamic-segments"], ["Next.js: generateStaticParams", NX + "api-reference/functions/generate-static-params"], ["Next.js 15: Async Request APIs", "https://nextjs.org/blog/next-15#async-request-apis-breaking-change"]),
];

DOCS["q-nx-3"] = [
  H("Организация без влияния на URL"),
  UL(
    "**Группы маршрутов `(name)`**: папка в скобках не попадает в URL. Применения: логически сгруппировать разделы (`(marketing)`, `(shop)`), дать им разные layout-ы (в том числе **несколько корневых layout-ов**), общий `loading.tsx` для части маршрутов.",
    "**Приватные папки `_name`**: исключены из маршрутизации. Туда кладут компоненты и утилиты рядом со страницей (`_components`, `_lib`). Любая папка без `page.tsx` и `route.ts` тоже не станет маршрутом, так что префикс `_` — явное намерение.",
    "**Colocation**: в `app/` можно хранить не только страницы; публичным маршрут становится только при наличии `page`/`route`."
  ),
  C(`app/
├─ (marketing)/
│  ├─ layout.tsx          // layout только для маркетинговых страниц
│  ├─ about/page.tsx      // /about
│  └─ pricing/page.tsx    // /pricing
├─ (shop)/
│  ├─ layout.tsx
│  └─ products/page.tsx   // /products
└─ _components/           // не маршрут`),
  P("Две страницы из разных групп не должны давать один и тот же URL (`(a)/about` и `(b)/about`): это ошибка сборки."),

  H("Параллельные маршруты (parallel routes): зачем и как"),
  P("Обычно один URL показывает одну страницу (`children`). **Параллельные маршруты** позволяют на **одном URL** одновременно отрисовать несколько независимых «областей» страницы. Каждая область — отдельная папка со **слотом** `@имя`. Слот **не добавляет сегмент в URL**: `app/@analytics/page.tsx` относится к тому же адресу `/`, что и `app/page.tsx`."),
  C(`app/dashboard/
├─ layout.tsx          // получает { children, analytics, team }
├─ page.tsx            // слот children (неявный @children)
├─ default.tsx         // запасное содержимое для children
├─ @analytics/
│  ├─ page.tsx         // график
│  ├─ loading.tsx      // свой скелет
│  ├─ error.tsx        // своя ошибка
│  └─ default.tsx
└─ @team/
   ├─ page.tsx
   └─ default.tsx

// app/dashboard/layout.tsx
export default function Layout({ children, analytics, team }: {
  children: React.ReactNode; analytics: React.ReactNode; team: React.ReactNode;
}) {
  return (
    <div className="grid">
      <main>{children}</main>
      <section>{analytics}</section>
      <aside>{team}</aside>
    </div>
  );
}`),
  P("Зачем это нужно:"),
  UL(
    "**Независимая загрузка и ошибки.** У каждого слота свои `loading.tsx` и `error.tsx`: медленный график не блокирует остальную страницу, а упавший виджет не ломает соседние (это те же Suspense boundary и Error Boundary, но заданные структурой папок).",
    "**Условный рендеринг по ролям.** В `layout` решают, что показывать: `return role === 'admin' ? admin : user;`. Каждый вариант остаётся отдельным кодом со своими данными.",
    "**Вкладки с собственной навигацией.** Слот может иметь вложенные страницы (`@team/members/page.tsx`), и они переключаются независимо от основной области.",
    "**Модальные окна** (вместе с перехватывающими маршрутами, см. ниже)."
  ),
  H("Как слоты ведут себя при навигации и обновлении"),
  UL(
    "**Мягкая навигация** (клик по `<Link>`, `router.push`): Next.js обновляет только изменившиеся слоты, а остальные продолжают показывать своё прежнее состояние, даже если для нового URL в них нет подходящей страницы.",
    "**Жёсткая навигация** (обновление страницы, переход по прямой ссылке): Next.js не может восстановить «прежнее состояние» слота, которого нет на сервере. Для слотов, у которых нет страницы под этот URL, показывается `default.tsx` (если его нет, будет 404).",
    "**`default.tsx` обязателен** для слота при таком сценарии (в Next.js 16 сборка требует его для всех слотов). Обычно он возвращает `null`.",
    "Слот — это не сегмент пути: через `useSelectedLayoutSegment('analytics')` можно узнать, какая страница открыта в слоте."
  ),

  H("Перехватывающие маршруты (intercepting routes): зачем и как"),
  P("Обычный `<Link href=\"/photo/42\">` открывает отдельную страницу `/photo/42`. **Перехватывающий маршрут** позволяет при **клике внутри приложения** показать этот же адрес «в контексте» текущей страницы, например как модальное окно поверх ленты, **не уходя со страницы**. При этом URL всё равно меняется на `/photo/42`, поэтому ссылкой можно поделиться. Если открыть этот адрес напрямую (вставить в адресную строку или обновить страницу), перехвата нет, и рендерится полноценная страница `/photo/42`."),
  P("Отсюда «зачем»: пользователь в ленте кликает на фото и видит быстрый предпросмотр с сохранением позиции скролла, а тот же адрес остаётся рабочей самостоятельной страницей для поисковиков, прямых ссылок и обновления."),
  C(`app/
├─ layout.tsx                    // { children, modal }
├─ feed/page.tsx                 // лента со ссылками <Link href="/photo/42">
├─ photo/[id]/page.tsx           // полноценная страница /photo/42 (прямой заход)
└─ @modal/
   ├─ default.tsx                // return null — модалки нет
   ├─ [...catchAll]/page.tsx     // return null — закрывает модалку при уходе на другие адреса
   └─ (.)photo/[id]/page.tsx     // перехваченная версия: показывается как модалка

// app/layout.tsx
export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return <html><body>{children}{modal}</body></html>;
}

// app/@modal/(.)photo/[id]/page.tsx
export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Modal><Photo id={id} /></Modal>;   // Modal — клиентский компонент
}

// Modal.tsx
"use client";
export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return <dialog open onClose={() => router.back()}>{children}</dialog>;   // закрыть = вернуться назад
}`),
  H("Что означают (.), (..), (..)(..), (...)"),
  P("Соглашение описывает, **на каком уровне маршрутов** лежит перехватываемый адрес относительно папки с перехватом. Считаются **сегменты маршрута**, а не папки файловой системы: слоты `@modal` и группы `(group)` в счёт не входят."),
  UL(
    "`(.)` — тот же уровень сегментов (`app/feed/(.)photo` перехватывает `/feed/photo`; `app/@modal/(.)photo` лежит на уровне корня и перехватывает `/photo`).",
    "`(..)` — на один уровень выше; `(..)(..)` — на два уровня выше.",
    "`(...)` — от корня приложения `app`, независимо от глубины.",
  ),
  H("Типичные применения и подводные камни"),
  UL(
    "**Применения:** модалка с фото или товаром над списком, быстрый просмотр (quick view), окно входа `/login` поверх текущей страницы, боковая панель с деталями записи в таблице.",
    "**Закрытие:** `router.back()` возвращает к предыдущему URL; кнопка «назад» в браузере тоже закрывает модалку.",
    "**Слот остаётся в старом состоянии** при мягкой навигации на другой адрес, поэтому добавляют `[...catchAll]/page.tsx` с `return null` (или закрывают модалку явно), иначе она «залипает» на экране.",
    "**Перехват работает только при мягкой навигации** (`<Link>`, `router.push`). Обычный `<a href>` или обновление страницы дают полную загрузку и открывают настоящую страницу.",
    "**Не забудьте про обе версии:** модальная (в `@modal/(.)photo`) и полноценная (`photo/[id]/page.tsx`) должны получать данные одинаково, лучше вынести общий компонент.",
    "**SEO и доступность:** индексируется настоящая страница; в модалке нужен фокус внутри, закрытие по Esc и возврат фокуса (подойдёт нативный `<dialog>`)."
  ),
  LK(["Next.js: Route groups", NX + "api-reference/file-conventions/route-groups"], ["Next.js: Parallel Routes", NX + "api-reference/file-conventions/parallel-routes"], ["Next.js: Intercepting Routes", NX + "api-reference/file-conventions/intercepting-routes"]),
];

DOCS["q-nx-4"] = [
  H("Pages Router и App Router: соответствие"),
  P("Next.js поддерживает два роутера. **Pages Router** (`pages/`): каждый файл — страница, данные приходят через `getStaticProps`/`getServerSideProps`, всё рендерится как клиентские компоненты. **App Router** (`app/`): основан на React Server Components, вложенных layout-ах, потоковой передаче и Server Actions. В новых проектах используют App Router; Pages Router продолжает поддерживаться, и их можно использовать в одном проекте при миграции."),
  C(`Pages Router                       →  App Router
pages/index.tsx                    →  app/page.tsx
pages/_app.tsx, _document.tsx      →  app/layout.tsx
getStaticProps                     →  async серверный компонент + кэш / generateStaticParams
getServerSideProps                 →  async компонент, использующий cookies()/headers() или без кэша
getStaticPaths                     →  generateStaticParams
revalidate в getStaticProps (ISR)  →  кэш с временем жизни (cacheLife) / revalidate
pages/api/*                        →  app/api/*/route.ts (Route Handlers)
next/head                          →  Metadata API (metadata, generateMetadata)
next/router (useRouter)            →  next/navigation (useRouter, usePathname, useSearchParams)
_error.tsx, 404.tsx                →  error.tsx, not-found.tsx
getInitialProps                    →  нет аналога (устарел)`),

  H("Что принципиально меняется"),
  UL(
    "**Серверные компоненты по умолчанию.** Данные читаются внутри компонента, а не передаются через `props` функцией-загрузчиком.",
    "**Вложенные layout-ы** сохраняют состояние между переходами. В Pages Router нужна обёртка в `_app` или `getLayout`.",
    "**Гибридный рендеринг на уровне компонента**, а не страницы: статическая оболочка + динамические части.",
    "**Хуки навигации** другие: `useRouter` из `next/navigation` не содержит `query`/`pathname`, для них отдельные хуки.",
    "**Мутации** через Server Actions вместо `pages/api` + `fetch`."
  ),
  P("Типичные вопросы: «когда ещё нужен Pages Router?» (старый код, библиотеки, не готовые к RSC), «как мигрировать?» (поэтапно: сначала `app/` для новых страниц, перенос `_app` в layout, замена API-хуков, затем остальное)."),
  LK(["Next.js: App Router migration", NX + "guides/migrating/app-router-migration"], ["Next.js: Server and Client Components", NX + "getting-started/server-and-client-components"]),
];

/* ===== Рендеринг и кэш ===== */
DOCS["q-nx-5"] = [
  H("Cache Components: явный кэш"),
  P("До Next.js 16 кэширование в App Router было неявным и запутанным (кэш запросов `fetch`, полный кэш маршрута, кэш на клиенте). В 15 значения по умолчанию сделали некэшируемыми, а в **16 появилась новая модель — Cache Components**. Её суть: **весь динамический код выполняется на запросе по умолчанию**, а кэшировать вы просите явно директивой `'use cache'`."),
  C(`// next.config.ts
const nextConfig = { cacheComponents: true };
export default nextConfig;

// Кэш на уровне данных
import { cacheLife, cacheTag } from "next/cache";
export async function getUsers() {
  "use cache";
  cacheLife("hours");        // как долго данные считаются свежими
  cacheTag("users");         // тег для точечной инвалидации
  return db.query("SELECT * FROM users");
}

// Кэш на уровне UI: компонент или страница
export default async function Page() {
  "use cache";
  cacheLife("hours");
  ...
}
// "use cache" в начале файла кэширует все экспортируемые функции файла`),

  H("Ключ кэша"),
  P("Ключ строит компилятор из **идентификатора функции, аргументов и значений, захваченных из внешних областей**. Разные аргументы дают отдельные записи. Аргументы и результат должны быть сериализуемыми. Поэтому внутри кэшируемой функции нельзя напрямую читать runtime-API: значения из `cookies()` или `headers()` извлекают снаружи и передают как аргументы (они попадут в ключ)."),

  H("Три «уровня» хранения и варианты директивы"),
  UL(
    "`'use cache'`: результат попадает в **статическую оболочку** (если время жизни достаточно большое) и в кэш в памяти экземпляра сервера (на serverless он не переживает запросы).",
    "`'use cache: remote'`: долговременный общий кэш через cache handler: сетевой вызов, оправдан при высокой доле попаданий.",
    "`'use cache: private'`: допускает чтение cookies/headers/searchParams внутри; результат живёт только в браузере и участвует в prefetch."
  ),
  P("Всё это привязано к конкретному деплою: ключ включает идентификатор сборки, так что после нового деплоя записи не переносятся."),

  H("cacheLife"),
  P("`cacheLife('hours')` выбирает профиль (`seconds`, `minutes`, `hours`, `days`, `weeks`, `max`) или принимает объект `{ stale, revalidate, expire }`. `stale` — сколько клиент может использовать результат без обращения к серверу, `revalidate` — когда сервер начнёт обновлять запись в фоне, `expire` — после какого времени без обращения запись считается просроченной. Рекомендуется всегда указывать `cacheLife`: без него действует профиль `default`."),
  LK(["Next.js: Caching", NX + "getting-started/caching"], ["Next.js: use cache", NX + "api-reference/directives/use-cache"], ["Next.js: cacheLife", NX + "api-reference/functions/cacheLife"], ["Next.js: cacheComponents config", NX + "api-reference/config/next-config-js/cacheComponents"]),
];

DOCS["q-nx-6"] = [
  H("Четыре способа сказать «данные устарели»"),
  C(`import { revalidatePath, revalidateTag, updateTag, refresh } from "next/cache";

revalidatePath("/posts");           // по пути: инвалидирует кэш конкретной страницы
revalidateTag("posts", "max");       // по тегу, stale-while-revalidate (профиль обязателен)
updateTag("posts");                  // по тегу, read-your-writes (только Server Actions)
refresh();                           // обновить только НЕкэшированные данные (только Server Actions)`),
  UL(
    "**`revalidateTag(tag, profile)`**: помечает записи с тегом устаревшими. Следующий запрос получит **закэшированные** данные сразу, а обновление пойдёт в фоне (stale-while-revalidate). Профиль (`'max'`, `'hours'`, `{ expire: 3600 }`) — второй аргумент, в Next.js 16 однопараметрическая форма считается устаревшей. Вызывается в Server Actions и Route Handlers.",
    "**`updateTag(tag)`**: **сразу** истекает кэш и читает свежие данные в том же запросе. Решает проблему «я сохранил профиль, а на странице старые данные». Работает только в Server Actions.",
    "**`refresh()`**: обновляет только то, что **не кэшируется** (счётчик уведомлений в шапке), кэш не трогает. Дополняет `router.refresh()` на клиенте.",
    "**`revalidatePath(path)`**: инвалидация по маршруту, а не по данным. Проще, но грубее: затрагивает всё, что отрисовано на этом пути."
  ),

  H("Что выбрать"),
  C(`Форма изменила данные и пользователь должен увидеть результат сразу  → updateTag
Контент может чуть подождать (посты, каталог), важна скорость            → revalidateTag(..., 'max')
Нужно обновить «живые» части, кэш не затрагивая                          → refresh
Не хочется размечать теги                                                → revalidatePath`),
  P("`revalidateTag` и `revalidatePath` нельзя вызывать **во время рендера** (это даёт ошибку с 15-й версии): только в Server Actions и Route Handlers. После `redirect()` в Server Action ревалидация применяется корректно."),
  LK(["Next.js 16: Improved caching APIs", "https://nextjs.org/blog/next-16#improved-caching-apis"], ["Next.js: Revalidating", NX + "getting-started/revalidating"]),
];

DOCS["q-nx-7"] = [
  H("История кэширования App Router"),
  P("Модель кэширования Next.js менялась в каждой из трёх последних мажорных версий, и часто возникает вопрос «почему у меня раньше было закэшировано, а теперь нет»."),
  C(`Next.js 13–14 (неявный кэш):
  • fetch() кэшировался по умолчанию (force-cache)
  • GET Route Handlers кэшировались, если не использовали динамические функции
  • Client Router Cache: динамические страницы ~30 с, статические ~5 мин
  • Full Route Cache: статически отрендеренные маршруты хранились на сервере
  • Data Cache + Request Memoization (дедупликация одинаковых fetch в одном рендере)

Next.js 15 (по умолчанию не кэшируем):
  • fetch() не кэшируется по умолчанию; кэш включается явно
    (cache: "force-cache" или next: { revalidate })
  • GET Route Handlers не кэшируются по умолчанию (force-static — явно)
  • Client Router Cache: staleTime страниц = 0 (общие layout-ы, back/forward — из кэша)
  • async cookies(), headers(), params, searchParams

Next.js 16 (явная модель Cache Components):
  • cacheComponents: true; кэш только через "use cache" (+ cacheLife, cacheTag)
  • вместо флага PPR: статическая оболочка + стриминг динамического
  • новые API: updateTag, refresh; revalidateTag с профилем`),

  H("Практические выводы"),
  UL(
    "Старые статьи про `revalidate: 60` в `fetch` и «Full Route Cache» относятся к предыдущей модели. Проверяйте версию и включён ли `cacheComponents`.",
    "Дедупликация одинаковых запросов внутри одного рендера никуда не делась (используйте `React.cache` для функций доступа к данным).",
    "Если страница по какой-то причине стала «слишком динамичной», найдите, какой runtime-API (cookies, headers, searchParams) или некэшированный запрос в неё попал: вся ветка до ближайшего `Suspense` становится динамической."
  ),
  P("Следует отличать **кэш данных** (результат `fetch`/функции), **кэш рендера** (результат компонента: RSC payload, HTML) и **клиентский кэш маршрутизатора** (в браузере, для мгновенной навигации и prefetch). С Cache Components всё это связано `cacheLife` одной записи."),
  LK(["Next.js 15 release: Caching semantics", "https://nextjs.org/blog/next-15#caching-semantics"], ["Next.js 16 release", "https://nextjs.org/blog/next-16"], ["Next.js: Caching", NX + "getting-started/caching"]),
];

DOCS["q-nx-8"] = [
  H("Partial Prerendering: статическая оболочка плюс стриминг"),
  P("С Cache Components каждый маршрут при сборке превращается в **статическую оболочку** (static shell): HTML и RSC-payload, которые можно отдавать с CDN мгновенно. Динамические части страницы **не блокируют** оболочку: на их месте лежит fallback из ближайшего `<Suspense>`, а сами они достримливаются на запросе. Этот подход называется **Partial Prerendering (PPR)**."),
  C(`export default function BlogPage() {
  return (
    <>
      <Header />                              {/* статика: попадает в оболочку */}
      <BlogPosts />                           {/* "use cache": тоже в оболочке */}
      <Suspense fallback={<p>Loading…</p>}>
        <UserPreferences />                   {/* cookies(): стримится на запросе */}
      </Suspense>
    </>
  );
}`),

  H("Что как обрабатывается при сборке"),
  UL(
    "**Предсказуемые значения** (импорт модулей, синхронное чтение файлов, чистые вычисления): выполняются при сборке и попадают в оболочку автоматически.",
    "**`'use cache'`**: результат кэшируется и попадает в оболочку, если время жизни достаточно велико.",
    "**Runtime-API** (`cookies()`, `headers()`, `searchParams`, динамические `params`) и **некэшированные запросы**: нужно обернуть в `<Suspense>` либо закэшировать.",
    "**Случайные значения и время** (`Math.random()`, `Date.now()`, `crypto.randomUUID()`): либо `await connection()` + `<Suspense>` (значение на каждый запрос), либо `'use cache'` (общее значение до ревалидации)."
  ),
  P("Если что-то из этого оказывается вне `Suspense`, dev-оверлей сообщает об ошибке (blocking route/prerender) с вариантами исправления. Так фреймворк заставляет каждую страницу иметь статическую оболочку."),

  H("Практика: чем глубже await, тем больше статики"),
  P("Если на верхнем уровне `layout` выполнить `await params`, динамический параметр сделает **весь layout** нединамическим. Лучше передать промис ниже и дождаться его внутри `Suspense`, тогда остальная часть layout останется в оболочке. Аналогично с `cookies()` и запросами данных: сдвигайте ожидание вглубь дерева."),
  C(`// Вместо  const { slug } = await params;  на верхнем уровне layout
<Suspense fallback={<h1>Loading…</h1>}>
  {params.then(({ slug }) => <SlugHeading slug={slug} />)}
</Suspense>`),
  P("Старый подход (до 16) — страница либо полностью статическая, либо динамическая целиком, как только использовала `cookies()`. Теперь динамическая только та часть, которая действительно зависит от запроса."),
  LK(["Next.js: Caching — Prerendering", NX + "getting-started/caching#prerendering"], ["Next.js: Streaming", NX + "guides/streaming"]),
];

DOCS["q-nx-9"] = [
  H("Состояния загрузки, ошибки и «не найдено»"),
  UL(
    "**`loading.tsx`**: автоматически оборачивает `page` (и вложенные сегменты) в `<Suspense fallback={<Loading />}>`. Мгновенный отклик при навигации: пользователь сразу видит скелетон, пока сервер готовит данные. Для более тонкого контроля используйте собственные `<Suspense>` внутри страницы.",
    "**`error.tsx`**: Error Boundary для сегмента и его детей. Должен быть клиентским компонентом (`'use client'`), получает `error` и функцию повторной попытки/сброса. Не ловит ошибки в `layout.tsx` того же сегмента.",
    "**`global-error.tsx`**: ловит ошибки корневого layout, должен сам отрисовать `<html>` и `<body>`.",
    "**`not-found.tsx`**: UI для функции `notFound()` (из `next/navigation`) и для необработанных URL (корневой файл). `notFound()` ещё и отдаёт статус 404."
  ),
  C(`// app/dashboard/error.tsx
"use client";
export default function Error({ error, reset }) {
  return (
    <div>
      <p>Что-то пошло не так</p>
      <button onClick={() => reset()}>Повторить</button>
    </div>
  );
}

// app/posts/[id]/page.tsx
import { notFound } from "next/navigation";
export default async function Page({ params }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();          // бросает специальное исключение
  return <Post post={post} />;
}`),

  H("Ожидаемые и неожиданные ошибки"),
  P("Ожидаемые ошибки (неверный ввод формы, «не найден») в Server Actions возвращайте как **значения** (`useActionState`), а не бросайте. Неожиданные (баг, недоступна БД) бросайте и обрабатывайте Error Boundary (`error.tsx`). Как и в React, Error Boundary не ловит ошибки в обработчиках событий и асинхронном коде вне рендера."),
  P("Отдельная функция `catchError` (в новых версиях) создаёт Error Boundary на уровне компонента. Для логирования ошибок сервера используют `instrumentation.ts` с `onRequestError`."),
  LK(["Next.js: Error Handling", NX + "getting-started/error-handling"], ["Next.js: loading.js", NX + "api-reference/file-conventions/loading"], ["Next.js: error.js", NX + "api-reference/file-conventions/error"]),
];

/* ===== Данные, Actions, Route Handlers ===== */
DOCS["q-nx-10"] = [
  H("Server Actions в Next.js"),
  P("Server Action — асинхронная функция с `'use server'`, которую вызывают из форм (`<form action={fn}>`) или обработчиков. Next.js превращает её в **HTTP POST-точку** с идентификатором. В Next.js 15 идентификаторы стали непредсказуемыми, а неиспользуемые действия вырезаются из сборки, но это снижает случайную экспозицию, а не заменяет защиту."),
  C(`"use server";
import { z } from "zod";
import { updateTag } from "next/cache";

const Schema = z.object({ id: z.string().uuid() });

export async function deletePost(formData: FormData) {
  const session = await getSession();                // 1. аутентификация
  if (!session) throw new Error("Unauthorized");

  const { id } = Schema.parse({ id: formData.get("id") });   // 2. валидация

  const post = await db.posts.find(id);
  if (post?.authorId !== session.userId)             // 3. авторизация (владелец?)
    throw new Error("Forbidden");

  await db.posts.delete(id);
  updateTag("posts");                                // 4. свежие данные сразу
}`),

  H("Что важно помнить"),
  UL(
    "**Всегда три шага**: кто вызывает (сессия), что передал (валидация), можно ли ему это (права на ресурс).",
    "**Не доверяйте скрытым полям формы** и значениям, пришедшим с клиента, включая замкнутые переменные (Next.js шифрует захваченные значения, но данные всё равно нужно проверять).",
    "**Последовательное выполнение**: на клиенте Server Actions отправляются по очереди (одна за другой), поэтому они не подходят для параллельной загрузки данных. Для чтения данных используйте серверные компоненты или Route Handlers.",
    "После мутации обновите кэш: `updateTag`, `revalidateTag`, `revalidatePath` или `refresh`.",
    "`useActionState(action, initialState)` даёт состояние, флаг `isPending` и работает без JS (прогрессивное улучшение).",
    "Cookies в Server Actions и Route Handlers можно **устанавливать** (`(await cookies()).set(...)`), а в серверных компонентах только читать."
  ),
  P("Хорошая практика: держать операции доступа к данным в отдельном слое (Data Access Layer), где проверки прав встроены в функции (`getPostForViewer`), а не размазаны по компонентам и действиям."),
  LK(["Next.js: Mutating data", NX + "getting-started/mutating-data"], ["Next.js: Data security", NX + "guides/data-security"], ["Next.js blog: Security for Server Components and Actions", "https://nextjs.org/blog/security-nextjs-server-components-actions"]),
];

DOCS["q-nx-11"] = [
  H("Как работают redirect и notFound"),
  P("`redirect(url)`, `permanentRedirect(url)` и `notFound()` из `next/navigation` реализованы через **специальные исключения**, которые Next.js перехватывает выше по стеку и превращает в ответ (302/307/308 или 404). Поэтому после вызова они ничего не возвращают (тип `never`), а код после них не выполняется."),
  C(`// ❌ catch перехватит служебное исключение, перенаправления не будет
try {
  await db.save(data);
  redirect("/done");
} catch (e) {
  return { error: "Не удалось" };
}

// ✅ redirect после try/catch
try {
  await db.save(data);
} catch (e) {
  return { error: "Не удалось" };
}
redirect("/done");

// ✅ или пробросить служебные ошибки
import { unstable_rethrow } from "next/navigation";
try { ... redirect("/done"); } catch (e) { unstable_rethrow(e); return { error: "..." }; }`),
  UL(
    "`redirect` можно вызывать в серверных компонентах, Server Actions и Route Handlers; в клиентских компонентах — только при рендере, в обработчиках используйте `router.push`.",
    "В Server Action `redirect()` обычно идёт **последним**, после мутации и ревалидации: ревалидация применится корректно.",
    "Если обернуть вызов в `try/catch` нужно, а ошибки базы данных — отдельно, лучше выносить ограниченный блок `try` только вокруг рискованной части."
  ),

  H("Редиректы на уровне конфигурации"),
  P("Статические редиректы и rewrites задаются в `next.config.ts` (`redirects()`, `rewrites()`), условные по запросу — в `proxy.ts`. Для уже существующих URL, чьи адреса изменились (SEO), используйте постоянный код (`permanent: true` → 308); для временных ситуаций — 307."),
  LK(["Next.js: redirect", NX + "api-reference/functions/redirect"], ["Next.js: unstable_rethrow", NX + "api-reference/functions/unstable_rethrow"], ["Next.js: Redirecting", NX + "guides/redirecting"]),
];

DOCS["q-nx-12"] = [
  H("Route Handlers"),
  P("Файл `route.ts` в папке сегмента объявляет HTTP-обработчики: экспортируйте функции `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. Они работают на стандартных `Request`/`Response` (`NextRequest`/`NextResponse` добавляют удобства: куки, `nextUrl`)."),
  C(`// app/api/posts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const posts = await db.posts.list(searchParams.get("tag"));
  return Response.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await db.posts.create(body);
  return Response.json(post, { status: 201 });
}

// app/api/posts/[id]/route.ts: params — промис
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  ...
}`),
  UL(
    "`route.ts` **нельзя** разместить в одном сегменте с `page.tsx`.",
    "С Next.js 15 `GET`-обработчики **не кэшируются** по умолчанию. Кэшировать можно явно (`export const dynamic = 'force-static'`), а с Cache Components `GET`-обработчики подчиняются той же модели предрендеринга, что и страницы.",
    "Подходят для вебхуков (Stripe, GitHub), публичного REST API, прокси к сторонним сервисам, отдачи файлов, мобильных и внешних клиентов."
  ),

  H("Route Handler или Server Action"),
  C(`                     Server Action               Route Handler
вызывается из       вашего React-интерфейса      любого HTTP-клиента
метод               только POST                   любой
интеграция          формы, useActionState,        нет
                    прогрессивное улучшение
типичные случаи     мутации из UI                 вебхуки, API для сторонних клиентов
чтение данных       нет (последовательные)         да (GET)`),
  P("Для чтения данных на странице обычно не нужен ни тот ни другой: серверный компонент читает данные напрямую. Лишний слой `fetch('/api/...')` внутри собственного серверного компонента — частая ошибка: запрос идёт к самому себе по сети, хотя можно вызвать функцию доступа к данным."),
  LK(["Next.js: Route Handlers", NX + "getting-started/route-handlers"], ["Next.js: route.js", NX + "api-reference/file-conventions/route"]),
];

DOCS["q-nx-13"] = [
  H("proxy.ts (раньше middleware.ts)"),
  P("Код в `proxy.ts` выполняется **до** обработки запроса маршрутизатором и позволяет изменить запрос или ответ: перенаправить, переписать URL (rewrite), добавить заголовки и cookies. В Next.js 16 файл `middleware.ts` переименован в `proxy.ts`, а экспортируемая функция — в `proxy`; он работает в среде **Node.js**. `middleware.ts` остаётся для Edge-случаев, но объявлен устаревшим."),
  C(`// proxy.ts (в корне проекта или в src/)
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],     // не запускать на каждый запрос, включая статику
};`),
  UL(
    "Хорошо подходит для: перенаправления неавторизованных, локализации (выбор языка), A/B-тестов, заголовков безопасности, rewrites.",
    "Плохо подходит для: тяжёлых запросов к БД, полной проверки прав доступа, бизнес-логики. Он выполняется на каждый подходящий запрос, и задержки добавляются ко всем страницам.",
    "Всегда ограничивайте `matcher`, чтобы не запускать прокси на статике (`_next/static`, изображения)."
  ),

  H("Авторизация: где проверять"),
  P("Прокси можно использовать как **быструю предварительную проверку** (есть ли cookie сессии), но настоящую проверку прав выполняйте **рядом с данными**: в слое доступа к данным, серверных компонентах, Server Actions и Route Handlers. Причины: прокси не видит всех путей к данным (Server Actions вызываются по POST с других URL), его конфигурация легко ломается, а в 2025 году в Next.js находили уязвимость обхода middleware по специальному заголовку (исправлена в обновлениях), поэтому он не должен быть единственным слоем."),
  P("Пример структуры: `verifySession()` (читает cookie, проверяет подпись, кэшируется через `React.cache`), которая вызывается в каждой защищённой странице и каждом действии. Ограничения на уровне прокси — только UX."),
  LK(["Next.js: proxy.ts", NX + "getting-started/proxy"], ["Next.js: Authentication", NX + "guides/authentication"], ["Next.js 16: proxy.ts", "https://nextjs.org/blog/next-16#proxyts-formerly-middlewarets"]),
];

/* ===== Оптимизации, настройка, миграция ===== */
DOCS["q-nx-14"] = [
  H("next/image"),
  P("Компонент `<Image>` расширяет `<img>`: автоматически подбирает размеры и современный формат (WebP/AVIF), лениво загружает изображения вне экрана, резервирует место и предотвращает сдвиг макета (CLS). Оптимизация выполняется сервером Next.js (или внешним loader) по запросу и кэшируется."),
  C(`import Image from "next/image";

// Локальный файл: размеры известны из импорта
import hero from "./hero.png";
<Image src={hero} alt="Hero" />

// Внешний URL: размеры обязательны (или fill)
<Image src="https://cdn.example.com/a.jpg" alt="" width={800} height={600} />

// Контейнер задаёт размер
<div style={{ position: "relative", height: 300 }}>
  <Image src={url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
</div>

// next.config.ts
images: { remotePatterns: [{ protocol: "https", hostname: "cdn.example.com" }] }`),
  UL(
    "**`remotePatterns`** (а не устаревший `images.domains`) ограничивает хосты, чтобы сервер не превратился в открытый прокси оптимизации.",
    "**`sizes`** помогает браузеру выбрать нужный размер из `srcset`; без него для `fill` может загружаться лишнее.",
    "**Изображение LCP** должно загружаться с приоритетом (проп `priority`; в самых новых версиях проверяйте актуальное название в документации) и не быть ленивым.",
    "В Next.js 16 изменены значения по умолчанию: `minimumCacheTTL` 4 часа, `qualities` `[75]`, ограничение редиректов и блокировка локальных IP."
  ),

  H("Другие встроенные оптимизации"),
  UL(
    "**`next/font`**: скачивает шрифты на этапе сборки и раздаёт с вашего домена, без запросов к Google в браузере; автоматически подбирает fallback с теми же метриками (нет сдвига при загрузке).",
    "**`next/link`**: клиентская навигация и prefetch видимых ссылок. В 16 prefetch стал инкрементальным: общий layout скачивается один раз, а запросы отменяются, когда ссылка уходит из области видимости.",
    "**`next/script`**: стратегии загрузки сторонних скриптов (`afterInteractive`, `lazyOnload`, `worker`).",
    "**Metadata API**: `export const metadata` или `generateMetadata` для `title`, `description`, Open Graph, а также файлы `opengraph-image`, `sitemap.ts`, `robots.ts`.",
    "**`next/dynamic`** и `React.lazy`: разбиение клиентского кода."
  ),
  LK(["Next.js: Images", NX + "getting-started/images"], ["Next.js: Fonts", NX + "getting-started/fonts"], ["Next.js: Metadata and OG images", NX + "getting-started/metadata-and-og-images"]),
];

DOCS["q-nx-15"] = [
  H("Переменные окружения"),
  P("Next.js читает `.env`, `.env.local`, `.env.development`, `.env.production` (локальные файлы не коммитят). Значения доступны в `process.env` на сервере. В клиентский код попадают **только** переменные с префиксом `NEXT_PUBLIC_`, и их значения **подставляются во время сборки** (встраиваются в бандл). Поэтому изменить такую переменную после сборки без пересборки нельзя."),
  C(`# .env.local
DATABASE_URL=postgres://…           # только сервер
STRIPE_SECRET_KEY=sk_live_…         # только сервер
NEXT_PUBLIC_API_BASE=https://api.x  # попадёт в браузер`),
  UL(
    "Для настроек, которые должны различаться между окружениями **без пересборки** образа (Docker), читайте переменные на сервере в рантайме и передавайте клиенту как данные (пропсы, `fetch` конфигурации), а не через `NEXT_PUBLIC_`.",
    "С Cache Components чтение `process.env` на сервере при предрендеринге фиксирует значение в статической оболочке: учитывайте, когда значение должно быть динамическим.",
    "Утечка секрета через пропс клиентскому компоненту так же опасна, как `NEXT_PUBLIC_`. Используйте пакет `server-only`, чтобы файл с секретами не попал в клиентский импорт.",
    "Валидируйте окружение при старте (например, zod-схема в одном модуле), чтобы сбой был сразу понятным."
  ),

  H("Конфигурация"),
  UL(
    "`next.config.ts`: типизированный конфиг (`NextConfig`).",
    "`output: 'standalone'`: минимальная сборка для Docker (только нужные файлы `node_modules`).",
    "`serverExternalPackages`: пакеты, которые не нужно бандлить на сервере.",
    "`reactCompiler: true`: включает React Compiler (стабильная опция, по умолчанию выключена, так как использует Babel и замедляет сборку).",
    "`cacheComponents: true`: включает новую модель кэширования."
  ),
  LK(["Next.js: Environment Variables", NX + "guides/environment-variables"], ["Next.js: next.config.js", NX + "api-reference/config/next-config-js"]),
];

DOCS["q-nx-16"] = [
  H("Что нужно знать при обновлении до Next.js 16"),
  P("Из официального объявления (октябрь 2025) и руководства по обновлению. Автоматизирует часть работы codemod: `npx @next/codemod@canary upgrade latest`."),
  C(`Требования:   Node.js 20.9+, TypeScript 5.1+, современные браузеры (Chrome/Edge/Firefox 111+, Safari 16.4+)

Асинхронные API (синхронный доступ удалён):
  await params, await searchParams, await cookies(), await headers(), await draftMode()

Переименования и новые файлы:
  middleware.ts → proxy.ts (функция proxy), работает на Node.js
  experimental.dynamicIO → cacheComponents; experimental.ppr и route-level experimental_ppr удалены
  experimental.turbopack → turbopack (верхний уровень)

Кэширование:
  revalidateTag(tag) → revalidateTag(tag, profile)  (одноаргументная форма устарела)
  новые updateTag(tag) и refresh() для Server Actions

Сборка:
  Turbopack — сборщик по умолчанию (webpack: next dev --webpack / next build --webpack)
  next lint удалён (используйте ESLint или Biome напрямую); next build больше не запускает линтер
  AMP, serverRuntimeConfig / publicRuntimeConfig удалены

Маршрутизация:
  параллельным маршрутам нужен явный default.js (иначе ошибка сборки)
  новый prefetch: дедупликация layout, инкрементальный prefetch

Изображения:
  images.domains устарел (используйте remotePatterns), новые значения по умолчанию`),

  H("Как отвечать на вопрос «как мигрировали бы проект»"),
  UL(
    "Обновить зависимости codemod-ом, прогнать тесты, исправить синхронные обращения к `params`/`cookies`.",
    "Переименовать `middleware.ts` → `proxy.ts` (если не нужен Edge).",
    "Пересмотреть кэширование: убрать зависимость от неявного кэша `fetch`, добавить `'use cache'` и теги там, где нужно.",
    "Проверить сборку Turbopack на кастомных webpack-плагинах (при необходимости оставить `--webpack`).",
    "Включать `cacheComponents` отдельным этапом: это изменение модели, а не просто обновление."
  ),
  P("Версии и новые функции быстро меняются (к моменту этого тренажёра актуальна ветка 16.4). Перед применением сверяйтесь с официальным блогом и документацией."),
  LK(["Next.js 16 release", "https://nextjs.org/blog/next-16"], ["Upgrading to version 16", NX + "guides/upgrading/version-16"]),
];

DOCS["q-nx-17"] = [
  H("Статическая генерация динамических маршрутов"),
  P("Для маршрута `app/blog/[slug]/page.tsx` Next.js не знает заранее, какие значения `slug` существуют. `generateStaticParams` возвращает список параметров, для которых нужно сгенерировать страницы **на сборке**:"),
  C(`export async function generateStaticParams() {
  const posts = await db.posts.list();
  return posts.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = true;   // по умолчанию: остальные значения рендерятся по запросу
// export const dynamicParams = false;  // остальные значения → 404`),
  UL(
    "С `dynamicParams = true` (по умолчанию) неизвестный `slug` будет отрендерен при первом обращении и закэширован (аналог ISR).",
    "С `dynamicParams = false` страницы для значений вне списка отдают 404.",
    "Функция выполняется на сборке и может быть вложенной: дочерний `generateStaticParams` получает `params` родителя.",
    "С Cache Components, если параметры известны, оболочка содержит конкретный контент; неизвестные параметры получают общую **App Shell**, которая затем уточняется в фоне и кэшируется для следующих посетителей (ISR с Cache Components)."
  ),

  H("Статическое, динамическое и инкрементальная генерация"),
  C(`SSG   страница строится на сборке и отдаётся с CDN
ISR   страница строится на сборке/по первому запросу и пересоздаётся по расписанию или по тегу
SSR   страница строится на каждый запрос (используются cookies(), headers() и т. п.)
PPR   (Cache Components) статическая оболочка + динамические дырки через Suspense`),
  P("В новых версиях выбор «страница статическая или динамическая» заменён **выбором на уровне компонента**: что можно предрендерить, лежит в оболочке; что зависит от запроса, стримится. Но `generateStaticParams` по-прежнему определяет, какие URL предрендерены на сборке."),
  P("Типичные вопросы: «как сделать, чтобы список из 10 000 статей не собирался целиком?» → `generateStaticParams` возвращает топ N, остальные по запросу; «как обновить статью после правки в CMS?» → тег + `revalidateTag` из вебхука (Route Handler)."),
  LK(["Next.js: generateStaticParams", NX + "api-reference/functions/generate-static-params"], ["Next.js: ISR with Cache Components", NX + "guides/incremental-static-regeneration-cache-components"]),
];

/* ===== Задачи ===== */
DOCS["t-nx-match"] = [
  H("Как Next.js сопоставляет URL и папки"),
  P("Next.js собирает дерево маршрутов из файловой структуры `app/` и при запросе находит самый подходящий. Задача моделирует упрощённое сопоставление одного шаблона с путём. Реальная реализация сложнее (приоритеты между статическими и динамическими маршрутами, параллельные и перехватывающие маршруты), но основа та же: **разбить пути на сегменты и пройти по ним**."),
  C(`/blog/[slug]          /blog/hello         → { slug: "hello" }
/docs/[...slug]        /docs/a/b/c         → { slug: ["a","b","c"] }
/docs/[[...slug]]      /docs               → { slug: [] }
/(marketing)/about     /about              → {}`),

  H("Разбор решения"),
  C(`function matchRoute(pattern, path) {
  const split = (s) => s.split("/").filter(Boolean);                 // пустые сегменты отбрасываем
  const patternSegs = split(pattern).filter((seg) => !/^\\(.*\\)$/.test(seg)); // (group) вне URL
  const pathSegs = split(path);
  const params = {};

  for (let i = 0; i < patternSegs.length; i++) {
    const seg = patternSegs[i];

    // [[...name]]: забираем весь остаток (возможно, пустой) и выходим
    const optional = seg.match(/^\\[\\[\\.\\.\\.(\\w+)\\]\\]$/);
    if (optional) { params[optional[1]] = pathSegs.slice(i); return params; }

    // [...name]: остаток обязан быть непустым
    const catchAll = seg.match(/^\\[\\.\\.\\.(\\w+)\\]$/);
    if (catchAll) {
      const rest = pathSegs.slice(i);
      if (rest.length === 0) return null;
      params[catchAll[1]] = rest;
      return params;
    }

    if (i >= pathSegs.length) return null;                           // путь короче шаблона

    const dynamic = seg.match(/^\\[(\\w+)\\]$/);
    if (dynamic) params[dynamic[1]] = pathSegs[i];                    // [name]: один сегмент
    else if (seg !== pathSegs[i]) return null;                       // статика: совпадение буквально
  }
  return pathSegs.length === patternSegs.length ? params : null;     // путь не длиннее шаблона
}`),
  UL(
    "**Порядок проверок важен**: сначала `[[...x]]`, затем `[...x]` и только потом `[x]`. Все три начинаются с `[`, и проверка «просто скобка» перепутала бы их.",
    "**Catch-all завершает сопоставление**: после него не может быть других сегментов, поэтому `return` внутри цикла корректен.",
    "**Длина пути**: без итоговой проверки `/about/team` совпал бы с `/about`.",
    "**Группы `(group)`** удаляются из шаблона до сопоставления: в URL их нет."
  ),

  H("Чего в модели нет"),
  UL(
    "Приоритетов: Next.js предпочитает статический маршрут динамическому, а динамический `[x]` — catch-all.",
    "Декодирования URL (`%20`), чувствительности к регистру и нормализации.",
    "Параллельных (`@slot`) и перехватывающих маршрутов, `basePath`, i18n."
  ),
  LK(["Next.js: Dynamic routes", NX + "getting-started/layouts-and-pages#dynamic-segments"], ["Next.js: Route groups", NX + "api-reference/file-conventions/route-groups"]),
];

DOCS["t-nx-cache"] = [
  H("Что моделирует задача"),
  P("`createCache` соединяет четыре понятия Cache Components в одну маленькую реализацию:"),
  UL(
    "`'use cache'` и **ключ**: результат функции хранится под ключом; повторный вызов с тем же ключом не вызывает функцию.",
    "`cacheLife` (**`revalidate`** в секундах): запись живёт ограниченное время, потом считается просроченной.",
    "`cacheTag` и `revalidateTag`: записи с тегом можно массово удалить.",
    "**Дедупликация** параллельных запросов: два компонента, одновременно запросивших одно и то же, не должны вызвать функцию дважды (в React для этого `cache()`)."
  ),

  H("Разбор решения"),
  C(`function createCache(now = Date.now) {
  const entries = new Map();    // key → { value, tags, expires }
  const inflight = new Map();   // key → Promise (выполняющиеся сейчас вызовы)
  const isValid = (e) => e.expires > now();

  async function get(key, loader, options = {}) {
    const hit = entries.get(key);
    if (hit) {
      if (isValid(hit)) return hit.value;     // 1. попадание
      entries.delete(key);                    //    запись просрочена
    }
    if (inflight.has(key)) return inflight.get(key);   // 2. уже грузится: присоединяемся

    const { revalidate, tags = [] } = options;
    const promise = Promise.resolve()
      .then(loader)                           // 3. вызов loader (ошибки тоже становятся промисом)
      .then((value) => {
        entries.set(key, { value, tags,
          expires: revalidate === undefined ? Infinity : now() + revalidate * 1000 });
        return value;
      })
      .finally(() => inflight.delete(key));   // 4. в любом случае освобождаем слот
    inflight.set(key, promise);
    return promise;
  }
  ...
}`),
  UL(
    "**`expires > now()`**: запись действует строго до момента `сохранение + время жизни`, а в этот момент уже просрочена (граничный случай в тестах).",
    "**`Promise.resolve().then(loader)`**: если `loader` бросит исключение синхронно, оно превратится в отклонённый промис, а не сломает `get` до того, как мы запишем промис в `inflight`.",
    "**`finally`** снимает запись из `inflight` и при успехе, и при ошибке; ошибочный результат в `entries` не попадает, поэтому следующий вызов попробует снова.",
    "**Инъекция времени `now`**: так код тестируется без реальных задержек (в Next.js подобного нет, но это стандартный приём для тестов кэшей)."
  ),

  H("Чем отличается от реального Next.js"),
  UL(
    "Настоящий кэш использует **stale-while-revalidate**: просроченная запись сразу отдаётся, а обновление идёт в фоне. Здесь просроченная запись удаляется и загружается заново.",
    "Ключ строится компилятором автоматически (аргументы + замыкания). В задаче ключ передаётся явно.",
    "Хранение в нескольких местах (память сервера, удалённый cache handler, браузер) и `cacheLife` с тремя значениями (`stale`, `revalidate`, `expire`).",
    "Инвалидация во время выполнения запроса: если `revalidateTag` вызван, пока `loader` ещё выполняется, результат в этой модели всё равно будет сохранён."
  ),
  LK(["Next.js: use cache", NX + "api-reference/directives/use-cache"], ["Next.js: cacheTag", NX + "api-reference/functions/cacheTag"], ["Next.js: revalidateTag", NX + "api-reference/functions/revalidateTag"]),
];
