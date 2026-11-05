import { C, H, LK, P, RD, UL } from "./registry";
import { K } from "./helpers";
/* ===================== TypeScript ===================== */
const TSD = "https://www.typescriptlang.org/docs/handbook/";
K("ts", [
{
  id: "q-ts-1",
  q: "Что можно сделать с `interface`, но нельзя с `type`?",
  o: ["Описать объединение (union) типов", "Объявить интерфейс с одним именем несколько раз, и объявления сольются (declaration merging)", "Описать кортеж", "Использовать mapped type"],
  a: 1,
  e: "Повторное объявление `interface` с тем же именем объединяет их члены. Повторное объявление `type` — ошибка. Объединения, кортежи, mapped и conditional types выражаются только через `type`.",
  d: [
    H("interface и type: что общего и в чём разница"),
    P("Для описания формы объекта оба подходят: на них можно ссылаться в аннотациях, их может реализовать класс (`implements`), оба расширяются. Различия возникают в деталях."),
    UL(
      "**Declaration merging**: одноимённые `interface` объединяются в один (так, например, расширяют глобальные типы вроде `Window` или `Express.Request`). Одноимённые `type` — ошибка `Duplicate identifier`.",
      "**Что умеет только `type`**: псевдонимы для примитивов и объединений, кортежи, mapped types, conditional types, template literal types. Каждый приём разобран ниже на примерах.",
      "**Расширение**: `interface B extends A` и пересечение `type B = A & {...}`. При конфликте свойств `extends` сразу даёт ошибку, а пересечение молча даёт тип свойства `never` (например, `number & string`).",
      "**Классы и `implements`**: класс может «подписаться» на контракт ключевым словом `implements`. Это можно делать и для `interface`, и для `type`, если он описывает объект. Нельзя — для `type`-объединения (подробнее ниже)."
    ),
    C(`interface Box { w: number }
interface Box { h: number }          // слияние: Box = { w: number; h: number }
const b: Box = { w: 1, h: 2 };

type T = { w: number };
// type T = { h: number };           // Duplicate identifier 'T'

interface A { x: number }
// interface B extends A { x: string }  // ошибка: несовместимое свойство
type C = A & { x: string };            // x: never, объект создать нельзя`),
    H("Что умеет только type: каждый приём по порядку"),
    P("**1. Псевдоним для примитива или объединения (union).** `interface` описывает только форму объекта. А `type` — это просто «имя для любого типа»: можно назвать `string | number` или набор допустимых строк. Объединение `A | B` значит «значение одного из этих типов»."),
    C(`type Id = string | number;                      // Id — либо строка, либо число
type Status = "idle" | "loading" | "error";     // литеральный union: допустимы только эти три строки
const s: Status = "idle";                        // "done" дало бы ошибку`),
    P("**2. Кортеж (tuple).** Массив фиксированной длины, где у каждой позиции свой тип. Обычный `string[]` — любая длина и один тип, а кортеж `[number, string]` — ровно два элемента: число, затем строка. Позициям можно дать подписи, а необязательные помечают `?`. Типичный пример — результат `useState`: `[value, setValue]`."),
    C(`type Point = [number, number];
type Row = [id: number, name: string, active?: boolean];
const p: Point = [10, 20];
const [x, y] = p;                                 // x: number, y: number`),
    P("**3. Mapped type (отображаемый тип).** Создаёт новый объектный тип, «пройдя циклом» по ключам другого типа или набора ключей: `{ [K in Keys]: ... }` читается как «для каждого ключа K из Keys задай такое-то свойство». Так устроены стандартные `Partial`, `Readonly`, `Pick`, `Record`. Модификаторы `?`, `readonly` можно добавлять и убирать (`-?`, `-readonly`)."),
    C(`type Keys = "name" | "age";
type Flags = { [K in Keys]: boolean };            // { name: boolean; age: boolean }

type User = { id: number; name: string };
type Nullable<T> = { [K in keyof T]: T[K] | null };   // у каждого поля добавили null
type ReadonlyUser = { readonly [K in keyof User]: User[K] };`),
    P("**4. Conditional type (условный тип).** Тип, выбираемый по условию — «тернарный оператор для типов»: `T extends U ? X : Y` означает «если T подходит под U, то X, иначе Y». Внутри условия `infer` достаёт часть типа в новую переменную. Если проверяемый тип — union, условие применяется к каждому его члену отдельно (distributive)."),
    C(`type Elem<T> = T extends (infer U)[] ? U : T;    // достаём тип элементов массива
type A = Elem<string[]>;                           // string
type B = Elem<number>;                             // number (это не массив → вернулся сам T)

type ToArray<T> = T extends unknown ? T[] : never;
type C = ToArray<string | number>;                 // string[] | number[] (по каждому члену отдельно)`),
    P("**5. Template literal type (тип шаблонной строки).** Строковый тип, собранный как шаблонная строка (в обратных кавычках), где вместо `${T}` подставляются другие строковые типы или числа. Если подставить union, получится union всех комбинаций. Есть встроенные помощники `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`."),
    C(`type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type E = EventName<"click" | "focus">;             // "onClick" | "onFocus"
type Route = \`/\${"users" | "posts"}/\${number}\`;
const r: Route = "/users/42";                      // "/users/abc" было бы ошибкой`),
    P("Все пять приёмов можно комбинировать: например, mapped type + template literal type создают набор обработчиков по именам событий. Но интерфейс так расширить нельзя, поэтому для таких конструкций всегда нужен `type`."),
    H("Что значит «класс реализует тип» (implements)"),
    P("`class X implements Контракт` — это обещание компилятору: «у моего класса есть все поля и методы из контракта». Если чего-то не хватает, будет ошибка. Контракт может быть `interface` или `type` объектной формы — разницы для `implements` нет."),
    C(`interface Printable { print(): void }
class A implements Printable { print() { console.log("A"); } }       // ок

type Shape = { area(): number };                                    // псевдоним объектного типа
class Square implements Shape {                                     // тоже ок
  constructor(private side: number) {}
  area() { return this.side ** 2; }
}

type WithName = { name: string };
type Both = Shape & WithName;                                       // пересечение объектных типов
class Named implements Both { name = "n"; area() { return 1; } }    // ок: форма известна заранее`),
    P("А вот union реализовать нельзя. Тип `Circle | Rect` значит «либо одно, либо другое», то есть у него нет единой определённой формы, которую класс мог бы гарантировать. Компилятор отвергает такой `implements`."),
    C(`type Circle = { r: number };
type Rect = { w: number; h: number };
type Figure = Circle | Rect;               // «либо круг, либо прямоугольник»

class C implements Figure { r = 1; }       // ошибка TS2422: класс может реализовать только объектный тип
                                           // или пересечение объектных типов с заранее известными членами`),
    P("Практический вывод: если нужен контракт для классов, описывайте его как объект (через `interface` или `type = { ... }`). Union удобен для значений (например, `Circle | Rect` в параметре функции), но не как контракт для `implements`."),
    P("Практическое правило: выбирайте один стиль и держитесь его. Часто `interface` берут для публичных контрактов объектов и классов (их можно расширять извне), а `type` — для всего остального."),
    LK(["TS Handbook: Everyday Types", TSD + "2/everyday-types.html"], ["TS Handbook: Object Types", TSD + "2/objects.html"], ["TS Handbook: Declaration Merging", TSD + "declaration-merging.html"])
  ],
  v: [
    ["Какую конструкцию нельзя выразить через `interface`?", null, ["Объект с методом", "`type Id = string | number`", "Объект с необязательным полем", "Объект с `readonly` полем"], 1, "Объединение — это не форма объекта, его описывают через `type`."],
    ["Что произойдёт?", "interface Box { w: number }\ninterface Box { h: number }\nconst b: Box = { w: 1 };", ["Ошибка: дубликат идентификатора", "Ошибка: в `b` не хватает свойства `h`", "Ошибки нет", "`b.h` будет `undefined` и ошибки не будет"], 1, "Интерфейсы слились, `Box` требует и `w`, и `h`."],
    ["Что произойдёт при повторном объявлении `type T`?", "type T = { w: number };\ntype T = { h: number };", ["Типы сольются", "Ошибка `Duplicate identifier`", "Победит последнее объявление", "Победит первое объявление"], 1, "Слияние — особенность `interface`. Псевдонимы типов не сливаются."],
    ["Чем становится свойство `x` в `type C = A & { x: string }`, если `A = { x: number }`?", null, ["`string`", "`number`", "`never` (пересечение `number & string`)", "`string | number`"], 2, "У пересечения свойство получает пересечение типов; у примитивов оно пусто, то есть `never`. `interface extends` дал бы ошибку сразу."],
    ["Что из этого выражается только через `type`?", null, ["Mapped type `{ [K in Keys]: boolean }`", "Кортеж `[string, number]`", "Объединение `'a' | 'b'`", "Объект с методом", "Conditional type `T extends U ? X : Y`"], [0, 1, 2, 4], "Всё, кроме обычного объекта с методом, нельзя записать как `interface`."],
    ["Можно ли классу сделать `implements` для `type Shape = { area(): number }`?", null, ["Нет, только для `interface`", "Да, для псевдонима объектного типа можно", "Только если тип экспортирован", "Только для абстрактного класса"], 1, "`implements` требует статически известную форму объекта. Псевдоним объединения использовать нельзя."]
  ]
},
{
  id: "q-ts-2",
  q: "Чем `unknown` безопаснее `any` и как с ним работать?",
  o: ["Ничем, это синонимы", "Значение `unknown` нельзя использовать, пока тип не сужен (typeof, instanceof, type guard); `any` отключает проверки", "`unknown` запрещает присваивать в него значения", "`unknown` работает только в `catch`"],
  a: 1,
  e: "В `unknown` можно положить что угодно, но читать его без сужения нельзя. `any` отключает проверку типов вокруг значения и «заражает» код.",
  d: [
    H("any, unknown, never и сужение типов"),
    UL(
      "**`any`**: «выключатель» проверок. С ним можно вызвать что угодно и присвоить куда угодно; ошибка вылезет в рантайме.",
      "**`unknown`**: безопасный «верхний» тип. Присвоить в него можно всё, но использовать нельзя, пока вы не сузили тип проверкой.",
      "**`never`**: тип пустого множества значений. У функции, которая всегда бросает, и у «невозможной» ветки после исчерпывающей проверки."
    ),
    H("Способы сужения (narrowing)"),
    UL(
      "`typeof x === 'string'`, `x instanceof Date`, проверка на `null`/`undefined`, `Array.isArray(x)`.",
      "Оператор `in`: `'radius' in shape`.",
      "**Дискриминируемые объединения** — общее литеральное поле: `{ kind: 'circle' } | { kind: 'square' }`; `switch (s.kind)` сужает тип в каждой ветке.",
      "Пользовательские type guards: `function isStr(x: unknown): x is string`. Assertion-функции: `asserts x is string`."
    ),
    C(`type Shape = { kind: "circle"; r: number } | { kind: "square"; a: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.a ** 2;
    default: {
      const _exhaustive: never = s; // ошибка, если добавили вид фигуры и забыли ветку
      return _exhaustive;
    }
  }
}

function parse(json: string) {
  const data: unknown = JSON.parse(json); // JSON.parse возвращает any, явно сужаем до unknown
  if (typeof data === "object" && data !== null && "id" in data) { /* ... */ }
}`),
    P("В `catch (e)` при включённом `strict` (опция `useUnknownInCatchVariables`) переменная `e` имеет тип `unknown`, поэтому перед чтением `e.message` нужна проверка `e instanceof Error`."),
    LK(["TS Handbook: Narrowing", TSD + "2/narrowing.html"], ["TS Handbook: Everyday Types", TSD + "2/everyday-types.html"])
  ],
  v: [
    ["Что произойдёт?", "const x: unknown = 'abc';\nx.toUpperCase();", ["Всё в порядке", "Ошибка компиляции: `x` имеет тип `unknown`", "Ошибка только в рантайме", "Вернёт `undefined`"], 1, "Перед использованием `unknown` нужно сузить: `typeof x === 'string'`."],
    ["Какой тип имеет `e` в `catch (e)` при `strict: true`?", null, ["`any`", "`Error`", "`unknown`", "`never`"], 2, "Опция `useUnknownInCatchVariables` входит в `strict`. Раньше было `any`."],
    ["Зачем нужна ветка `default` с присваиванием в `never` в `switch` по дискриминируемому объединению?", null, ["Для ускорения компиляции", "Компилятор сообщит об ошибке, если добавят новый вариант и забудут обработать его", "Чтобы скрыть предупреждение линтера", "Чтобы `switch` стал асинхронным"], 1, "После обработки всех вариантов в `default` остаётся `never`. Новый вариант в объединении перестанет присваиваться в `never` и вызовет ошибку."],
    ["Какая запись объявляет пользовательский type guard?", null, ["`function isStr(x: unknown): boolean`", "`function isStr(x: unknown): x is string`", "`function isStr(x: unknown): asserts string`", "`function isStr(x: unknown): typeof x`"], 1, "Предикат типа `x is string` сообщает компилятору, что при `true` значение — строка."],
    ["Что из этого сужает тип `x: string | number | Date`?", null, ["`typeof x === 'string'`", "`x instanceof Date`", "`x as string`", "`'getTime' in x` (для остальных типов — ошибка)", "`typeof x === 'number'`"], [0, 1, 4], "`as` — это утверждение типа, оно не проверяет значение. Оператор `in` в такой форме применим к объектам, а для примитивов в объединении даст ошибку."],
    ["Чем отличается `any` от `unknown` при присваивании `const s: string = value`?", null, ["`any` присвоится без ошибки, `unknown` — нет", "Оба присвоятся", "Оба дадут ошибку", "`unknown` присвоится, `any` — нет"], 0, "`any` совместим с чем угодно; `unknown` — только с `unknown` и `any`."]
  ]
},
{
  id: "q-ts-3",
  q: "Что означает ограничение `K extends keyof T` в сигнатуре `function get<T, K extends keyof T>(obj: T, key: K): T[K]`?",
  o: ["`K` должен быть значением, а не типом", "`K` может быть только одним из ключей `T`, и результат типизируется как `T[K]`", "`K` наследует от `T` как класс", "`K` обязан быть строкой"],
  a: 1,
  e: "`keyof T` — объединение имён ключей. Ограничение `K extends keyof T` не даёт передать несуществующий ключ, а `T[K]` (indexed access) возвращает точный тип свойства.",
  d: [
    H("Дженерики: параметры типов, ограничения, вывод"),
    P("Дженерик — это функция на уровне типов. Параметр типа заполняется либо явно (`get<User, 'id'>(...)`), либо **выводится** из аргументов. Ограничение `extends` задаёт, какие типы допустимы."),
    C(`function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { id: 1, name: "Ann" };
get(user, "name");   // string
// get(user, "age"); // ошибка: "age" не принадлежит keyof typeof user

// значение по умолчанию и ограничение
function wrap<T extends object = {}>(v: T) { return { v }; }

// const-параметр типа (TS 5.0): выводит литералы и readonly-кортежи
function tuple<const T extends readonly unknown[]>(x: T) { return x; }
tuple([1, "a"]); // readonly [1, "a"]`),
    UL(
      "`keyof T`: объединение ключей; `T[K]`: тип значения по ключу (**indexed access type**).",
      "Значение по умолчанию для параметра типа (`<T = string>`) используется, когда вывод невозможен и тип не указан.",
      "В `.tsx`-файлах стрелочный дженерик пишут `<T,>(x: T) => ...` или `<T extends unknown>`, иначе парсер примет `<T>` за JSX-тег.",
      "Не нужно усложнять: если параметр типа используется только один раз, он, скорее всего, лишний."
    ),
    LK(["TS Handbook: Generics", TSD + "2/generics.html"], ["TS Handbook: Keyof Types", TSD + "2/keyof-types.html"], ["TS Handbook: Indexed Access Types", TSD + "2/indexed-access-types.html"])
  ],
  v: [
    ["Что вернёт `get(user, 'name')` по типам, если `user = { id: 1, name: 'Ann' }`?", "function get<T, K extends keyof T>(o: T, k: K): T[K] {\n  return o[k];\n}", ["`string | number`", "`string`", "`'name'`", "`unknown`"], 1, "`K` выводится как `'name'`, `T['name']` — это `string`."],
    ["Почему вызов `get(user, 'age')` не скомпилируется?", null, ["`age` — зарезервированное слово", "`'age'` не входит в `keyof typeof user`", "Функцию нельзя вызывать с литералом", "Нужно явно указать `<any, any>`"], 1, "Ограничение `K extends keyof T` допускает только существующие ключи."],
    ["Что означает `T[K]`?", null, ["Массив значений `T`", "Тип свойства `K` в типе `T`", "Кортеж из `T` и `K`", "Функцию, принимающую `K`"], 1, "Это indexed access type."],
    ["Зачем в `.tsx` писать `<T,>(x: T) => x`?", null, ["Чтобы `T` стал необязательным", "Чтобы парсер не принял `<T>` за JSX-тег", "Для совместимости с ES5", "Чтобы вывод типа стал точнее"], 1, "Запятая или `extends` делает запись однозначной."],
    ["Что даёт модификатор `const` у параметра типа (TS 5.0)?", "function f<const T>(x: T) { return x; }\nf({ a: 1, b: ['x'] });", ["Выводится `{ a: number; b: string[] }`", "Выводится `{ readonly a: 1; readonly b: readonly ['x'] }`", "Тип параметра становится `unknown`", "Ничего, это ошибка синтаксиса"], 1, "`const T` ведёт себя как `as const` для аргумента: литеральные типы и `readonly`."],
    ["Какие утверждения верны?", null, ["Дженерик может иметь значение по умолчанию: `<T = string>`", "Параметр типа всегда нужно указывать явно", "`K extends keyof T` ограничивает `K` ключами `T`", "Дженерики существуют в рантайме и доступны через `typeof T`", "Если `T` используется один раз, возможно, он лишний"], [0, 2, 4], "Типы стираются при компиляции; в рантайме `T` недоступен. Параметры чаще всего выводятся из аргументов."]
  ]
},
{
  id: "q-ts-4",
  q: "Какой тип получится: `type ToArray<T> = T extends unknown ? T[] : never; type R = ToArray<string | number>`?",
  o: ["`(string | number)[]`", "`string[] | number[]`", "`never`", "`unknown[]`"],
  a: 1,
  e: "Conditional type над «голым» параметром типа **распределяется** по объединению: `ToArray<string> | ToArray<number>`. Чтобы отключить, оборачивают в кортеж: `[T] extends [unknown]`.",
  d: [
    H("Служебные типы, mapped и conditional types"),
    P("Встроенные utility types построены на mapped и conditional types. Знать, как они устроены, полезнее, чем помнить список."),
    C(`type Partial<T>  = { [K in keyof T]?: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Record<K extends keyof any, V> = { [P in K]: V };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T & {};
type ReturnType<F extends (...a: any) => any> = F extends (...a: any) => infer R ? R : any;`),
    UL(
      "**Distributive conditional types**: если проверяемый тип — «голый» параметр (`T extends ...`), то для объединения условие применяется к каждому члену отдельно. Так работают `Exclude` и `Extract`.",
      "Отключить распределение: `[T] extends [U] ? ... : ...`.",
      "**`infer`** вводит переменную типа внутри условия: `T extends Promise<infer U> ? U : T` (в стандартной библиотеке — `Awaited<T>`).",
      "Модификаторы mapped types: `?` и `readonly`, их снятие через `-?`/`-readonly`; переименование ключей через `as` (в том числе с шаблонными литеральными типами).",
      "`typeof` берёт тип значения, `keyof typeof obj` — ключи объекта-значения."
    ),
    LK(["TS Handbook: Utility Types", TSD + "utility-types.html"], ["TS Handbook: Conditional Types", TSD + "2/conditional-types.html"], ["TS Handbook: Mapped Types", TSD + "2/mapped-types.html"])
  ],
  v: [
    ["Что получится?", "type ToArray<T> = [T] extends [unknown] ? T[] : never;\ntype R = ToArray<string | number>;", ["`string[] | number[]`", "`(string | number)[]`", "`never`", "`unknown[]`"], 1, "Обёртка в кортеж отключает распределение по объединению."],
    ["Чему равно `Exclude<'a' | 'b' | 'c', 'a' | 'c'>`?", null, ["`'a' | 'c'`", "`'b'`", "`never`", "`'a' | 'b' | 'c'`"], 1, "`Exclude` распределяется и убирает из объединения члены, присваиваемые второму аргументу."],
    ["Чем `Omit<T, K>` отличается от `Pick<T, K>`?", null, ["Ничем", "`Pick` оставляет перечисленные ключи, `Omit` — убирает их", "`Omit` делает свойства необязательными", "`Pick` работает только с классами"], 1, "`Omit<T, K> = Pick<T, Exclude<keyof T, K>>`."],
    ["Что вернёт `ReturnType<typeof f>`, если `async function f() { return 1; }`?", null, ["`number`", "`Promise<number>`", "`Promise<any>`", "`void`"], 1, "Асинхронная функция возвращает промис. Чтобы получить `number`, используют `Awaited<ReturnType<typeof f>>`."],
    ["Какие утверждения о mapped types верны?", null, ["`-?` убирает необязательность", "`-readonly` снимает `readonly`", "Ключи можно переименовать через `as`", "Mapped type может быть описан через `interface`", "`Partial<T>` делает все свойства необязательными"], [0, 1, 2, 4], "Mapped types — это синтаксис `type`, через `interface` их записать нельзя."],
    ["Что делает `infer U` в `T extends Promise<infer U> ? U : T`?", null, ["Приводит `T` к промису", "Выводит тип, который лежит в промисе, в переменную `U`", "Объявляет рантайм-переменную", "Отключает distributive-поведение"], 1, "Так устроен тип `Awaited` (в упрощённом виде)."]
  ]
},
{
  id: "q-ts-5",
  q: "Что делает оператор `satisfies` (TS 4.9) и чем отличается от аннотации типа?",
  o: ["Приводит значение к типу в рантайме", "Проверяет, что выражение соответствует типу, но сохраняет более точный выведенный тип выражения", "То же, что `as`", "Заменяет `implements` у классов"],
  a: 1,
  e: "Аннотация `const x: T = ...` расширяет тип до `T`, `satisfies T` только проверяет совместимость и оставляет точный вывод (например, литералы и конкретные ключи).",
  d: [
    H("as const, satisfies, enum и утверждения типов"),
    C(`type Colors = Record<string, string | number[]>;

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Colors;

palette.red.map((x) => x * 2);   // известно, что это number[]
palette.green.toUpperCase();     // известно, что это string
// при аннотации const palette: Colors обе строки дали бы ошибку (union)

const dirs = ["up", "down"] as const;      // readonly ["up", "down"]
type Dir = (typeof dirs)[number];          // "up" | "down"`),
    UL(
      "**`as const`**: литеральные типы и `readonly` на всю глубину. Удобно для «объекта-перечисления» и кортежей.",
      "**`as T` (type assertion)**: заставляет компилятор поверить, ничего не проверяя в рантайме; слишком вольное использование прячет баги. Не путать с `satisfies`.",
      "**`enum`** компилируется в реальный объект (появляется код в бандле); числовой enum допускает присваивание произвольных чисел в старых версиях. Альтернатива: объединение литералов или `as const`-объект.",
      "**`erasableSyntaxOnly`** (TS 5.8) запрещает конструкции, которые нельзя просто стереть: `enum`, `namespace` с кодом, параметры-свойства конструктора. Это нужно, чтобы запускать `.ts` напрямую через стирание типов (например, в Node).",
      "Оператор `!` (non-null assertion) — тоже утверждение без проверки."
    ),
    LK(["TS Handbook: Everyday Types", TSD + "2/everyday-types.html"], ["TS 4.9: satisfies", "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html"], ["TS 5.8: erasableSyntaxOnly", "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html"])
  ],
  v: [
    ["В чём практическая разница между `const p: Colors = {...}` и `const p = {...} satisfies Colors`?", null, ["Нет разницы", "С `satisfies` сохраняются точные типы значений (`string`, `number[]`), с аннотацией — расширяются до типа аннотации", "`satisfies` работает в рантайме", "С аннотацией типы точнее"], 1, "`satisfies` проверяет, но не расширяет тип выражения."],
    ["Какой тип у `dirs[number]`, если `const dirs = ['up', 'down'] as const`?", null, ["`string`", "`'up' | 'down'`", "`readonly string[]`", "`never`"], 1, "`as const` делает элементы литералами; `(typeof dirs)[number]` собирает из них объединение."],
    ["Что делает `as` в рантайме?", "const el = document.getElementById('x') as HTMLInputElement;", ["Проверяет, что элемент — input, иначе бросает ошибку", "Ничего: это стирается, проверки нет", "Создаёт новый элемент", "Преобразует значение"], 1, "Утверждение типа существует только на уровне типов. Если элемента нет, `el` будет `null`."],
    ["Что генерирует компилятор для обычного `enum Color { Red, Green }`?", null, ["Ничего, он полностью стирается", "Объект в рантайме (в бандле появляется код)", "Только `.d.ts`", "Класс"], 1, "Поэтому `enum` не подпадает под «стираемый синтаксис» и запрещён при `erasableSyntaxOnly`."],
    ["Что запрещает `erasableSyntaxOnly`?", null, ["`enum`", "Параметры-свойства конструктора (`constructor(private x: number)`)", "`interface`", "`namespace` с рантайм-кодом", "Аннотации типов"], [0, 1, 3], "Разрешено всё, что можно просто вычеркнуть: аннотации, интерфейсы, псевдонимы типов."],
    ["Что лучше подходит как замена `enum` без рантайм-кода?", null, ["`const Dir = { Up: 'up', Down: 'down' } as const` плюс тип из значений", "Класс со статическими полями", "`Symbol`", "`any`"], 0, "Объект `as const` и объединение литералов — типичная замена."]
  ]
},
{
  id: "q-ts-6",
  q: "Какие опции `tsconfig` чаще всего включают для безопасности и совместимости с бандлерами?",
  o: ["Только `target`", "`strict`, `noUncheckedIndexedAccess`, `moduleResolution: bundler` (или `nodenext`), `verbatimModuleSyntax`/`isolatedModules`, `skipLibCheck`", "`allowJs` и `noEmit` — больше ничего не нужно", "`experimentalDecorators` и `target: es5`"],
  a: 1,
  e: "`strict` включает набор строгих проверок; `noUncheckedIndexedAccess` добавляет `undefined` к доступу по индексу; `moduleResolution` должен соответствовать способу загрузки модулей; `isolatedModules`/`verbatimModuleSyntax` нужны для транспиляторов, обрабатывающих файлы по одному.",
  d: [
    H("tsconfig, транспиляция и экосистема"),
    P("TypeScript — это **проверка типов + стирание типов**. Рантайм получает обычный JavaScript. Поэтому проверку (`tsc --noEmit`) и сборку (`esbuild`, `swc`, `babel`, Vite) нередко разделяют: сборщик только удаляет типы, ничего не проверяя."),
    UL(
      "**`strict`**: включает `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables` и др.",
      "**`noUncheckedIndexedAccess`** (не входит в `strict`): `arr[i]` и `obj[key]` получают тип `T | undefined`.",
      "**`moduleResolution`**: `bundler` для кода, который собирает бандлер; `nodenext` для кода, исполняемого напрямую в Node (тогда в импортах нужны расширения файлов).",
      "**`isolatedModules` / `verbatimModuleSyntax`**: запрещают конструкции, которые нельзя транспилировать по одному файлу, и требуют явного `import type` для типов.",
      "**`skipLibCheck`**: не проверять `.d.ts` зависимостей, ускоряет проверку.",
      "**`paths`**: псевдонимы только для проверки типов; рантайм-разрешение должен обеспечить бандлер или Node."
    ),
    H("TypeScript 7.0: нативный компилятор"),
    P("По анонсу команды TypeScript от июля 2026 года, версия 7.0 — **нативный порт компилятора на Go**. Команда по-прежнему `tsc`. Заявлено ускорение полной сборки примерно в 8–12 раз и меньшее потребление памяти; проверка, разбор и вывод идут параллельно (флаги `--checkers`, `--builders`, `--singleThreaded`). Новые умолчания: `strict: true`, `module: esnext`, `types: []`. Опции, объявленные устаревшими в 6.0, в 7.0 дают ошибку: `target: es5`, `moduleResolution: node10`, `baseUrl`, `module: amd/umd/systemjs`, `downlevelIteration`. Программного API в 7.0 нет (ожидается в 7.1), поэтому инструменты, встраивающие компилятор, пока работают на 6.0 (пакет `@typescript/typescript6` даёт `tsc6`). Это свежая информация: перед использованием проверьте актуальное состояние в официальном блоге."),
    LK(["TSConfig Reference", "https://www.typescriptlang.org/tsconfig/"], ["Анонс TypeScript 7.0", "https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/"], ["TS Handbook: Modules", TSD + "modules/introduction.html"])
  ],
  v: [
    ["Какую проверку добавляет `noUncheckedIndexedAccess`?", null, ["Запрещает `any`", "Тип `arr[i]` становится `T | undefined`", "Проверяет границы массива в рантайме", "Запрещает индексные сигнатуры"], 1, "Проверка статическая: компилятор заставит обработать `undefined`."],
    ["Что TypeScript делает с типами в итоговом коде?", null, ["Превращает в рантайм-проверки", "Стирает: в JavaScript они не попадают", "Сохраняет как комментарии", "Загружает отдельным файлом на клиент"], 1, "Поэтому данные из сети нужно валидировать отдельно (например, схемой)."],
    ["Какую команду обычно используют только для проверки типов без сборки?", null, ["`tsc --noEmit`", "`tsc --watch=false`", "`tsc --declaration`", "`tsc --init`"], 0, "Бандлер (Vite, esbuild) транспилирует, а `tsc --noEmit` проверяет типы, например, в CI."],
    ["Зачем `verbatimModuleSyntax` требует писать `import type`?", null, ["Для скорости парсера", "Чтобы транспилятор по одному файлу знал, какие импорты можно стереть без анализа типов", "Чтобы блокировать циклические зависимости", "Для поддержки CommonJS"], 1, "Без информации о типах нельзя понять, является ли импортируемое имя типом или значением."],
    ["Что верно про `paths` в `tsconfig`?", null, ["Это настоящие псевдонимы в рантайме", "Они влияют на проверку типов; для рантайма нужна настройка бандлера или загрузчика", "Работают только с `target: es5`", "Заменяют `package.json`"], 1, "Компилятор не переписывает пути импортов в вывод."],
    ["Что верно про TypeScript 7.0 (по анонсу июля 2026)?", null, ["Это нативный порт компилятора на Go, команда по-прежнему `tsc`", "Включает программный API, совместимый с 5.x", "Сохраняет поддержку `target: es5`", "Работает только в браузере", "Умолчание `strict` равно `true`"], [0, 4], "У 7.0 нет программного API (ожидается в 7.1), а `target: es5` и ряд других устаревших опций дают ошибку."]
  ]
},
]);

/* ===================== TypeScript, часть 2 ===================== */
K("ts", [
{
  id: "q-ts-7",
  q: "Как правильно типизировать пропсы кнопки-обёртки, которая принимает все нативные атрибуты `<button>` плюс собственный `variant`?",
  o: ["`interface Props { variant: string; [key: string]: any }`", "`type Props = React.ComponentProps<'button'> & { variant: 'primary' | 'ghost' }` и распылить остаток пропсов в `<button>`", "`type Props = HTMLButtonElement & { variant: string }`", "`type Props = { props: any }`"],
  a: 1,
  e: "`ComponentProps<'button'>` (или `ComponentPropsWithoutRef`) уже содержит все атрибуты и обработчики кнопки. Объединение с собственными пропсами сохраняет автодополнение и проверки. `HTMLButtonElement` — тип DOM-элемента, а не пропсов.",
  d: [
    H("TypeScript в React: пропсы, события, хуки, ref"),
    C(`import type { ComponentProps, ReactNode } from "react";

type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "ghost" };

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  return <button className={\`btn btn-\${variant} \${className ?? ""}\`} {...rest} />;
}

// обобщённый компонент
function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  return <ul>{items.map((it, i) => <li key={i}>{render(it)}</li>)}</ul>;
}

// события и состояние
const [user, setUser] = useState<User | null>(null);
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
const ref = useRef<HTMLDivElement>(null);`),
    UL(
      "**`ComponentProps<'tag' | typeof Component>`** извлекает пропсы элемента или компонента; `ComponentPropsWithoutRef` исключает `ref`.",
      "**`ReactNode`** — всё, что можно отрисовать (строки, числа, `null`, массивы, элементы); **`ReactElement`/`JSX.Element`** — только элемент. Для `children` и «слотов» используют `ReactNode`.",
      "**`React.FC`** не обязателен: обычная функция с типизированным параметром проще и не добавляет неявных свойств. Дженерик-компоненты с `FC` писать неудобно.",
      "**События**: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.FormEvent<HTMLFormElement>`; для встроенных обработчиков тип выводится из контекста.",
      "**`useState<User | null>(null)`**: без явного типа `useState(null)` выведет `null`.",
      "**`useRef<HTMLDivElement>(null)`** для DOM-ссылки; в типах React 19 аргумент обязателен, а тип ref — `RefObject<T | null>`.",
      "**ref как проп** в React 19: `forwardRef` больше не нужен для функциональных компонентов, достаточно принять `ref` в пропсах.",
      "**Дискриминируемые пропсы**: `type P = { as: 'a'; href: string } | { as: 'button'; onClick: () => void }` запрещают недопустимые сочетания."
    ),
    LK(["React: TypeScript", RD + "learn/typescript"], ["React TypeScript Cheatsheet", "https://react-typescript-cheatsheet.netlify.app/"])
  ],
  v: [
    ["Как получить тип пропсов нативного `<input>`?", null, ["`HTMLInputElement`", "`React.ComponentProps<'input'>`", "`React.InputProps`", "`JSX.Input`"], 1, "`HTMLInputElement` — тип DOM-узла, а не пропсов."],
    ["Чем `ReactNode` шире, чем `JSX.Element`?", null, ["Ничем", "`ReactNode` допускает также строки, числа, `null`, `undefined`, массивы и фрагменты", "`JSX.Element` допускает строки", "`ReactNode` — только для классов"], 1, "Поэтому `children` типизируют как `ReactNode`."],
    ["Какой тип выведется у `state`?", "const [state, setState] = useState(null);", ["`null`", "`any`", "`unknown`", "`undefined`"], 0, "Нужно писать `useState<User | null>(null)`, чтобы в состояние можно было записать пользователя."],
    ["Какой тип у обработчика изменения текстового поля?", null, ["`React.ChangeEvent<HTMLInputElement>`", "`React.Event`", "`InputEvent`", "`React.KeyboardEvent<HTMLInputElement>`"], 0, "Тип параметра событий в React — синтетические события."],
    ["Какие утверждения верны?", null, ["`React.FC` необязателен для типизации компонента", "`children` обычно типизируют как `ReactNode`", "`ComponentProps<'button'>` включает `onClick` и `disabled`", "`useRef<HTMLDivElement>(null)` подходит для ссылки на DOM-узел", "`ReactNode` не может быть строкой"], [0, 1, 2, 3], "Строки входят в `ReactNode`."],
    ["Для чего дискриминируемый тип пропсов?", null, ["Для скорости рендера", "Чтобы запретить недопустимые сочетания пропсов (например, `href` у кнопки)", "Для генерации тестов", "Для SSR"], 1, "Поле-дискриминатор (`as`) определяет остальные обязательные пропсы."]
  ]
},
{
  id: "q-ts-8",
  q: "Почему такая запись компилируется, и что значит возвращаемый тип `void` у типа функции?",
  code: "const handlers: (() => void)[] = [];\nhandlers.push(() => 42);\nhandlers.push(() => \"ok\");",
  o: ["Не компилируется: возвращается не `void`", "Компилируется: функция, назначаемая типу `() => void`, может возвращать любое значение — оно просто игнорируется вызывающим кодом", "Компилируется только без `strict`", "Компилируется, потому что `void` равен `any`"],
  a: 1,
  e: "Для типа функции `void` означает «результат использовать нельзя». Поэтому `[1, 2].forEach((x) => arr.push(x))` допустим, хотя `push` возвращает число. Но объявленная явно функция `function f(): void { return 1 }` — ошибка.",
  d: [
    H("Типы функций: void, перегрузки, вариантность параметров"),
    UL(
      "**`void` против `undefined`**: у типа функции `() => void` допустим любой результат; у объявления с аннотацией `: void` возвращать значение нельзя.",
      "**Перегрузки**: несколько сигнатур и одна реализация. Реализация не видна снаружи; порядок перегрузок важен — выбирается первая подходящая. Часто вместо них достаточно объединения типов или дженерика.",
      "**Вариантность параметров**: при `strictFunctionTypes` параметры функций контравариантны (функция, принимающая более широкий тип, годится туда, где ждут более узкий). **Методы** (запись `m(x): void` внутри интерфейса) остаются бивариантными, а свойства-функции (`m: (x) => void`) — строгими.",
      "**Меньше параметров — можно**: функцию с меньшим числом параметров можно присвоить типу с большим (`(a) => void` годится вместо `(a, b) => void`), обратное — ошибка.",
      "**`this`-параметр**: `function f(this: HTMLElement, e: Event)` проверяет контекст вызова и стирается при компиляции.",
      "**Необязательные параметры и rest**: `(a: number, b?: number, ...rest: string[])`; кортежи в rest (`...args: [string, number]`) точно типизируют сигнатуры.",
      "**Возвращаемый тип** лучше указывать у публичных функций: вывод может раскрыть детали реализации, а ошибки покажутся в месте использования."
    ),
    C(`function len(x: string): number;
function len(x: unknown[]): number;
function len(x: string | unknown[]): number { return x.length; }

interface A { on(cb: (x: string) => void): void }      // метод: бивариантность
interface B { on: (cb: (x: string) => void) => void }  // свойство: контравариантность`),
    LK(["TS Handbook: More on Functions", TSD + "2/functions.html"], ["TSConfig: strictFunctionTypes", "https://www.typescriptlang.org/tsconfig/#strictFunctionTypes"])
  ],
  v: [
    ["Скомпилируется ли код?", "const f: () => void = () => 42;\nconst n: number = 1;", ["Нет, возвращается не `void`", "Да: для типа функции `void` допускает любой результат", "Только с `noImplicitAny`", "Нет, нужен `as void`"], 1, "Результат просто нельзя использовать как значимый.", 'ts-ok'],
    ["Скомпилируется ли код?", "function f(): void {\n  return 1;\n}", ["Да", "Нет: у объявления с аннотацией `: void` возвращать значение нельзя", "Да, но предупреждение", "Зависит от `target`"], 1, "Правило мягкое только для типов функций, а не для объявлений.", 'ts-err'],
    ["Скомпилируется ли присваивание?", "const takesTwo: (a: number, b: number) => void = (a) => {};", ["Нет, не хватает параметра `b`", "Да: функция с меньшим числом параметров совместима", "Да, но `a` станет `any`", "Нет, нужен `?`"], 1, "Вызывающий код может передать лишние аргументы, функция их просто проигнорирует.", 'ts-ok'],
    ["Скомпилируется ли присваивание?", "const takesOne: (a: number) => void = (a: number, b: number) => {};", ["Да", "Нет: функция требует больше параметров, чем даст вызывающий код", "Да, `b` будет `undefined`", "Да, но с `any`"], 1, "Обратное направление совместимости недопустимо.", 'ts-err'],
    ["Какой тип у выбора перегрузки в `len('abc')` для перегрузок `(x: string)` и `(x: unknown[])`?", null, ["Сработает первая подходящая по порядку", "Выберется последняя", "Реализация видна снаружи и вызывается напрямую", "Ошибка компиляции"], 0, "Порядок перегрузок важен: сначала более специфичные."],
    ["Что верно про вариантность параметров?", null, ["При `strictFunctionTypes` параметры функций-свойств проверяются контравариантно", "Методы в интерфейсах остаются бивариантными", "`strictFunctionTypes` не входит в `strict`", "`this`-параметр остаётся в JavaScript после компиляции"], [0, 1], "`strictFunctionTypes` включён в `strict`, а `this`-параметр стирается."]
  ]
},
{
  id: "q-ts-9",
  q: "Что такое структурная типизация, и почему в этом коде одно присваивание допустимо, а другое — ошибка?",
  code: "type Point = { x: number; y: number };\nconst p3 = { x: 1, y: 2, z: 3 };\nconst a: Point = p3;                 // (1)\nconst b: Point = { x: 1, y: 2, z: 3 }; // (2)",
  o: ["Обе строки допустимы", "(1) допустима: совместимость определяется формой, лишние свойства разрешены; (2) ошибка: для «свежего» литерала действует проверка избыточных свойств (excess property check)", "(1) ошибка, (2) допустима", "Обе ошибки"],
  a: 1,
  e: "TypeScript сравнивает формы (structural typing), а не имена типов. Проверка избыточных свойств срабатывает только для свежих объектных литералов, чтобы ловить опечатки в именах полей.",
  d: [
    H("Структурная типизация, assignability и «номинальные» типы"),
    UL(
      "**Структурная совместимость**: значение подходит, если у него есть все нужные свойства совместимых типов. Имена типов не важны; классы без приватных членов тоже сравниваются по форме.",
      "**Excess property check**: проверка лишних свойств у свежего литерала при присваивании или передаче аргумента. Она не срабатывает для переменной.",
      "**`Object.keys(obj)` возвращает `string[]`**, а не `(keyof T)[]`: из-за структурной типизации у объекта могут быть дополнительные ключи. Для перебора с типами используют приведение или `Object.entries` с осторожностью.",
      "**Индексные сигнатуры**: `{ [key: string]: number }`, `Record<string, T>`; при `noUncheckedIndexedAccess` чтение даёт `T | undefined`.",
      "**Branded types** — имитация номинальных типов: `type UserId = string & { __brand: 'UserId' }`. Не позволяют передать произвольную строку туда, где ждут идентификатор пользователя, пока явно не создан через функцию-конструктор.",
      "**Классы с `private` членами** сравниваются номинально (совместимы только экземпляры того же объявления).",
      "**Слабые типы** (все поля необязательны) требуют хотя бы одного общего свойства, иначе ошибка."
    ),
    C(`type UserId = string & { readonly __brand: "UserId" };
const asUserId = (s: string) => s as UserId;

function load(id: UserId) {}
// load("abc");            // ошибка
load(asUserId("abc"));     // ок

const keys = Object.keys({ a: 1 });   // string[]`),
    LK(["TS Handbook: Type Compatibility", TSD + "type-compatibility.html"], ["TS Handbook: Object Types (excess property checks)", TSD + "2/objects.html#excess-property-checks"])
  ],
  v: [
    ["Скомпилируется ли код?", "type Point = { x: number; y: number };\nconst p3 = { x: 1, y: 2, z: 3 };\nconst a: Point = p3;", ["Нет, лишнее свойство `z`", "Да: проверка избыточных свойств применяется только к свежим литералам", "Да, но `z` будет удалён", "Нет, нужен `as Point`"], 1, "Присваивание переменной сравнивает только нужные поля.", 'ts-ok'],
    ["Скомпилируется ли код?", "type Point = { x: number; y: number };\nconst a: Point = { x: 1, y: 2, z: 3 };", ["Да", "Нет: лишнее свойство `z` в свежем литерале", "Да, но с предупреждением", "Зависит от `target`"], 1, "Проверка нужна для ловли опечаток.", 'ts-err'],
    ["Какой тип возвращает `Object.keys(obj)`?", null, ["`(keyof typeof obj)[]`", "`string[]`", "`unknown[]`", "`any[]`"], 1, "У объекта во время выполнения могут быть лишние ключи."],
    ["Скомпилируется ли код (branded type)?", "type UserId = string & { readonly __brand: 'UserId' };\nfunction load(id: UserId) {}\nload('abc');", ["Да", "Нет: обычная строка не имеет бренда", "Да, строка совместима с `UserId`", "Только в `strict: false`"], 1, "Чтобы получить `UserId`, нужен конструктор или приведение.", 'ts-err'],
    ["Какие утверждения верны?", null, ["Структурные типы сравниваются по форме", "Excess property check действует на свежие литералы", "Классы с `private` членами сравниваются номинально", "Имена типов определяют совместимость всегда", "`Record<string, T>` — индексная сигнатура"], [0, 1, 2, 4], "Имя типа само по себе совместимость не определяет."],
    ["Чем полезны branded types?", null, ["Ускоряют компиляцию", "Не дают перепутать значения одного примитивного типа с разным смыслом (`UserId` и `OrderId`)", "Включают рантайм-проверки", "Заменяют enum"], 1, "Бренд существует только на уровне типов."]
  ]
},
{
  id: "q-ts-10",
  q: "Чем `private` в TypeScript отличается от `#private` в JavaScript?",
  o: ["Ничем", "`private` — проверка только на этапе компиляции (в рантайме поле доступно); `#private` — настоящая приватность, обеспеченная движком (доступ извне невозможен даже через приведение типов)", "`#private` проверяется только компилятором", "`private` работает только со статическими полями"],
  a: 1,
  e: "Модификатор TypeScript стирается при компиляции: `obj['secret']` или приведение к `any` читает поле. Поля `#x` — часть языка JavaScript, недоступны вне класса и не видны при `JSON.stringify` и `Object.keys`.",
  d: [
    H("Классы в TypeScript"),
    C(`abstract class Shape {
  constructor(public readonly name: string, private id = Math.random()) {}  // свойства-параметры
  abstract area(): number;
  describe() { return \`\${this.name}: \${this.area()}\`; }
}

class Circle extends Shape implements Drawable {
  #radius: number;                      // настоящее приватное поле
  constructor(r: number) { super("circle"); this.#radius = r; }
  override area() { return Math.PI * this.#radius ** 2; }   // override проверяет наличие метода в родителе
  static unit() { return new Circle(1); }
}`),
    UL(
      "**Модификаторы доступа**: `public` (по умолчанию), `protected` (класс и наследники), `private` (только класс), все — только проверка компилятора.",
      "**`readonly`**: поле можно присвоить только при объявлении или в конструкторе.",
      "**Свойства-параметры**: `constructor(private x: number)` объявляет и инициализирует поле. Такой синтаксис требует генерации кода, поэтому запрещён при `erasableSyntaxOnly`.",
      "**`abstract`**: нельзя создать экземпляр; абстрактные методы обязаны реализовать наследники.",
      "**`implements`** проверяет соответствие интерфейсу, но не наследует реализацию; **`override`** (с `noImplicitOverride`) ловит опечатки в именах переопределяемых методов.",
      "**`this` в методах**: потеря контекста при передаче метода как колбэка; решают стрелочными полями (`handle = () => {}`) или `bind`.",
      "**`strictPropertyInitialization`** требует инициализации полей в конструкторе; `!` (definite assignment) — «я инициализирую позже».",
      "**Композиция против наследования**: в React-мире классы редки, но нужны в сервисах, Node, ORM и при работе с декораторами."
    ),
    LK(["TS Handbook: Classes", TSD + "2/classes.html"], ["MDN: Private elements", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements"])
  ],
  v: [
    ["Скомпилируется ли код?", "class A { private x = 1; }\nconst a = new A();\nconsole.log(a.x);", ["Да", "Нет: `x` приватное свойство", "Да, но `undefined`", "Зависит от `target`"], 1, "Ошибка при проверке типов.", 'ts-err'],
    ["Что выведет код после компиляции в JavaScript?", "class A { private x = 1; }\nconst a: any = new A();\nconsole.log(a.x);", ["undefined", "1", "Ошибка во время выполнения", "null"], 1, "Модификатор `private` TypeScript стирается, поле обычное.", false],
    ["Можно ли создать экземпляр `abstract class`?", null, ["Да", "Нет", "Только с `new`", "Только в `strict: false`"], 1, "Можно создавать только экземпляры наследников."],
    ["Зачем `override`?", null, ["Для скорости", "Компилятор сообщит, если в родителе нет такого метода (опечатка или переименование)", "Для приватности", "Для декораторов"], 1, "Включается проверка `noImplicitOverride`."],
    ["Что верно про поля `#x`?", null, ["Недоступны вне класса даже через `any`", "Настоящая приватность на уровне JavaScript", "Видны в `Object.keys`", "Стираются при компиляции"], [0, 1], "Они не являются обычными свойствами."],
    ["Как сохранить контекст `this` у метода-колбэка?", null, ["Использовать стрелочное поле класса или `bind`", "Ничего, `this` всегда сохраняется", "Добавить `static`", "Использовать `readonly`"], 0, "Метод, переданный отдельно, теряет контекст."]
  ]
},
{
  id: "q-ts-11",
  q: "Как расширить глобальный тип (например, добавить свойство в `Window`) и описать типы для JS-библиотеки без деклараций?",
  o: ["Изменить файлы в `node_modules`", "Написать `.d.ts`: `declare global { interface Window { analytics: Analytics } }` в файле-модуле (с `export {}`) и `declare module 'lib' { ... }` для библиотеки; либо поставить `@types/lib`", "Использовать `any` везде", "Нельзя"],
  a: 1,
  e: "Файл с `import`/`export` — модуль, поэтому глобальные расширения оборачивают в `declare global`. Слияние деклараций интерфейсов позволяет дополнять `Window`, `ProcessEnv` и типы сторонних библиотек (module augmentation).",
  d: [
    H("Файлы деклараций и модули"),
    C(`// global.d.ts
export {};
declare global {
  interface Window { analytics: { track(e: string): void } }
  namespace NodeJS { interface ProcessEnv { API_URL: string } }
}

// types/untyped-lib.d.ts
declare module "untyped-lib" {
  export function run(opts: { fast: boolean }): Promise<void>;
}

// стили и ресурсы
declare module "*.svg" { const url: string; export default url; }

// дополнение типов библиотеки
declare module "express-serve-static-core" {
  interface Request { user?: { id: string } }
}`),
    UL(
      "**`.d.ts`** содержит только типы (без кода). Генерируется компилятором (`declaration: true`) для библиотек.",
      "Пакеты `@types/…` — декларации для JS-пакетов из DefinitelyTyped. Пакеты со встроенными типами используют поле `types` в `package.json`.",
      "**Скрипт и модуль**: файл без `import`/`export` — глобальный скрипт, его объявления попадают в глобальную область. Добавление `export {}` превращает файл в модуль.",
      "**`import type` / `export type`** подчёркивают, что это только типы и они стираются; `typeof import('./a')` берёт тип модуля.",
      "**`types` и `typeRoots` в `tsconfig`** задают, какие глобальные пакеты `@types` подключать (в TS 6/7 по умолчанию `types: []`: глобальные типы нужно подключать явно, например `types: ['node']`).",
      "**`include`/`files`** определяют, какие файлы видны компилятору; `.d.ts` вне `include` не подхватится.",
      "**`resolveJsonModule`** позволяет импортировать JSON с выведением типов; **`declare const`** описывает глобальные переменные, подставляемые бандлером (`__APP_VERSION__`)."
    ),
    LK(["TS Handbook: Declaration Files", TSD + "declaration-files/introduction.html"], ["TS Handbook: Modules (augmentation)", TSD + "declaration-merging.html#module-augmentation"], ["DefinitelyTyped", "https://github.com/DefinitelyTyped/DefinitelyTyped"])
  ],
  v: [
    ["Почему в `global.d.ts` нужен `export {}`, если используется `declare global`?", null, ["Для скорости", "Чтобы файл стал модулем: `declare global` допустим только в модулях", "Для экспорта типов", "Без разницы"], 1, "В скрипте объявления и так глобальные, `declare global` не нужен."],
    ["Как описать импорт `*.svg`, возвращающий URL?", null, ["`declare module '*.svg' { const url: string; export default url; }`", "Нельзя", "`import svg from 'svg'`", "`type SVG = string`"], 0, "Шаблон в имени модуля покрывает все файлы с таким расширением."],
    ["Где искать типы для JS-пакета без встроенных деклараций?", null, ["`@types/пакет` (DefinitelyTyped)", "Только в исходниках пакета", "В `tsconfig.json`", "Нигде"], 0, "Если пакета `@types` нет, пишут свою декларацию."],
    ["Что делает `import type { A } from './a'`?", null, ["Импортирует значение", "Импортирует только тип, import стирается и не попадает в код", "Подключает JSON", "Работает только в `.d.ts`"], 1, "Помогает транспиляторам и избегает циклических рантайм-зависимостей."],
    ["Какие утверждения верны?", null, ["`.d.ts` не содержит исполняемого кода", "Слияние интерфейсов позволяет дополнять типы библиотек", "`declare global` допустим в файле без `import/export`", "Файл с `export {}` является модулем"], [0, 1, 3], "В скрипте `declare global` не нужен, в модуле обязателен для глобальных расширений."],
    ["Как типизировать переменные окружения `process.env.API_URL`?", null, ["Расширить `NodeJS.ProcessEnv` в `.d.ts`", "Использовать `as string` при каждом чтении без проверки", "Нельзя", "Только через `any`"], 0, "Но значение всё равно нужно валидировать при запуске: тип не гарантирует наличие переменной."]
  ]
},
{
  id: "q-ts-12",
  q: "Почему тип, полученный из `fetch`/`JSON.parse`, нельзя считать гарантией, и как обеспечить безопасность на границе приложения?",
  o: ["Можно: `as User` проверяет форму", "Типы стираются, а `as` ничего не проверяет; данные извне нужно валидировать в рантайме (схема zod/valibot, type guard) и выводить тип из схемы, либо генерировать клиент из контракта (OpenAPI, GraphQL codegen, tRPC)", "Достаточно `strict: true`", "Нужно использовать `any`"],
  a: 1,
  e: "Компилятор доверяет вашим утверждениям. Если сервер вернул другую форму, ошибка проявится позже и в другом месте. Валидация на границе превращает «непроверенные данные» в доверенный тип.",
  d: [
    H("Типобезопасность на границах: сеть, формы, окружение"),
    C(`import { z } from "zod";

const User = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
});
type User = z.infer<typeof User>;          // тип из схемы — один источник правды

async function getUser(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error(String(res.status));
  return User.parse(await res.json());     // бросит ошибку, если форма не совпала
}

// type guard вручную
function isUser(x: unknown): x is { id: number } {
  return typeof x === "object" && x !== null && typeof (x as any).id === "number";
}`),
    UL(
      "**Границы**: ответы API, `localStorage`, `postMessage`, `URLSearchParams`, переменные окружения, пользовательский ввод, JSON из файлов.",
      "**`response.json()`** возвращает `Promise<any>`; присвоение типа без проверки — это утверждение, а не гарантия.",
      "**Схемы** (zod, valibot, ArkType, io-ts) дают проверку и выводимый тип; `safeParse` возвращает результат без исключений.",
      "**Кодогенерация**: OpenAPI (openapi-typescript, orval), GraphQL (graphql-codegen), RPC с общими типами (tRPC) — типы клиента и сервера синхронизированы, но проверки в рантайме всё равно желательны для внешних источников.",
      "**Парсинг вместо валидации**: превращайте данные в более строгий тип (`string` → `Date`/`UserId`) на границе и дальше работайте с чистыми типами.",
      "**Ошибки**: `catch (e)` — `unknown`; проверяйте `e instanceof Error`.",
      "**`satisfies`** и **`as const`** помогают с конфигурациями; **`@ts-expect-error`** лучше `@ts-ignore`, так как сообщит, когда ошибка исчезла."
    ),
    LK(["Zod", "https://zod.dev/"], ["openapi-typescript", "https://openapi-ts.dev/"], ["tRPC", "https://trpc.io/docs"])
  ],
  v: [
    ["Что гарантирует `const user = (await res.json()) as User`?", null, ["Что данные имеют форму `User`", "Ничего: это утверждение типа без проверки", "Что `res.ok` истинно", "Что поля не `null`"], 1, "Компилятор поверит, рантайм ничего не проверит."],
    ["Как получить тип из схемы zod?", null, ["`z.infer<typeof schema>`", "`typeof schema`", "`schema.type`", "`z.type(schema)`"], 0, "Так схема и тип не расходятся."],
    ["Какой тип у `e` в `catch (e)` при `strict`?", null, ["`unknown`", "`any`", "`Error`", "`never`"], 0, "Нужна проверка `e instanceof Error`."],
    ["Чем `@ts-expect-error` лучше `@ts-ignore`?", null, ["Ничем", "Он сам даёт ошибку, если на следующей строке ошибки больше нет", "Он быстрее", "Он работает только в `.js`"], 1, "Так устаревшие подавления не остаются в коде."],
    ["Какие данные нужно проверять в рантайме?", null, ["Ответы внешних API", "Содержимое `localStorage`", "Параметры URL", "Константы в вашем же коде", "Переменные окружения при запуске"], [0, 1, 2, 4], "Константы проверяет компилятор."],
    ["Что значит «парсить, а не валидировать»?", null, ["Использовать регулярные выражения", "Превращать данные в более точный тип на границе и дальше работать только с ним", "Не проверять данные", "Проверять дважды"], 1, "Например, строку в `Date` или брендированный идентификатор."]
  ]
},
{
  id: "q-ts-13",
  q: "Что произойдёт с типом `Routes`: `type Routes = `/${'users' | 'posts'}/${number}``, и зачем нужны template literal types?",
  o: ["Будет `string`", "Получится объединение шаблонов `` `/users/${number}` | `/posts/${number}` ``: строки проверяются по форме, а из них можно выводить части (`infer`)", "Ошибка", "Это синтаксис только для JS"],
  a: 1,
  e: "Template literal types комбинируются с объединениями (декартово произведение), `infer` и `Capitalize`/`Uppercase`. На них строятся типобезопасные роуты, имена событий и CSS-значения.",
  d: [
    H("Продвинутые типы: шаблонные литералы, рекурсия, кортежи"),
    C(`type Route = \`/\${"users" | "posts"}/\${number}\`;
const r: Route = "/users/42";              // ок
// const bad: Route = "/users/abc";        // ошибка

// извлечение параметров из строки маршрута
type Params<S extends string> =
  S extends \`\${string}:\${infer P}/\${infer Rest}\` ? P | Params<\`/\${Rest}\`>
  : S extends \`\${string}:\${infer P}\` ? P
  : never;
type P = Params<"/users/:id/posts/:postId">;   // "id" | "postId"

// глубокий Partial (рекурсия)
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

// вариативные кортежи
type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];
type First<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;

// переименование ключей
type Getters<T> = { [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K] };`),
    UL(
      "**Template literal types** работают со строковыми литералами: комбинации выводятся автоматически, `infer` позволяет «разбирать» строки.",
      "**Рекурсивные условные типы** позволяют обходить структуры (`DeepPartial`, `DeepReadonly`), но имеют предел глубины; сложные типы замедляют компиляцию.",
      "**Variadic tuples** (`[...A, ...B]`) и `infer` в позициях кортежа описывают функции `curry`, `pipe`, `Promise.all`.",
      "**Key remapping (`as`)** переименовывает и фильтрует ключи в mapped types (`as never` убирает ключ).",
      "**`keyof typeof obj`** и **`(typeof arr)[number]`** производят типы из значений.",
      "**Типы-тесты**: проверки уровня типов (`Expect<Equal<A, B>>`) или `// @ts-expect-error` в тестах.",
      "**Когда не усложнять**: сложная типовая магия ухудшает читаемость и скорость; для публичных API она оправдана, для прикладного кода часто нет."
    ),
    LK(["TS Handbook: Template Literal Types", TSD + "2/template-literal-types.html"], ["TS Handbook: Mapped Types (key remapping)", TSD + "2/mapped-types.html#key-remapping-via-as"], ["type-challenges", "https://github.com/type-challenges/type-challenges"])
  ],
  v: [
    ["Скомпилируется ли код?", "type Route = `/${'users' | 'posts'}/${number}`;\nconst r: Route = '/users/42';", ["Да", "Нет", "Только с `as const`", "Нет, `number` нельзя в шаблоне"], 0, "42 соответствует шаблону `${number}`.", 'ts-ok'],
    ["Скомпилируется ли код?", "type Route = `/${'users' | 'posts'}/${number}`;\nconst r: Route = '/comments/42';", ["Да", "Нет: `comments` не входит в объединение", "Да, строка подходит", "Нет, нужен `as`"], 1, "Объединение раскрывается в два допустимых шаблона.", 'ts-err'],
    ["Скомпилируется ли присваивание (проверка вывода через `infer`)?", "type First<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;\nconst x: First<[string, number]> = 'a';", ["Да: `First<[string, number]>` — это `string`", "Нет", "Да, но тип `never`", "Нет, `infer` запрещён в кортежах"], 0, "`infer H` захватывает тип первого элемента.", 'ts-ok'],
    ["Скомпилируется ли присваивание?", "type First<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;\nconst x: First<[string, number]> = 1;", ["Да", "Нет: ожидается `string`", "Да, это `number`", "Только с `any`"], 1, "Первый элемент кортежа — `string`.", 'ts-err'],
    ["Какие утверждения верны?", null, ["Template literal types можно комбинировать с объединениями", "`infer` может разбирать строки в шаблонных типах", "Рекурсивные типы неограниченны по глубине", "Сложные условные типы могут замедлять компиляцию", "`as never` в mapped type убирает ключ"], [0, 1, 3, 4], "У рекурсии есть предел глубины."],
    ["Когда оправдана сложная типовая «магия»?", null, ["Всегда", "В публичных библиотеках и общих API, где она экономит ошибки многим пользователям", "Никогда", "Только в тестах"], 1, "В прикладном коде чаще достаточно простых типов."]
  ]
},
{
  id: "q-ts-14",
  q: "Почему этот код компилируется, но ломается в рантайме, и что такое ковариантность массивов?",
  code: "const names: string[] = ['a'];\nconst things: (string | number)[] = names;\nthings.push(42);\nconsole.log(names[1].toUpperCase());",
  o: ["Не компилируется: массивы инвариантны", "Компилируется: массивы в TypeScript ковариантны (`string[]` присваивается `(string | number)[]`) — это удобно, но небезопасно: через более широкий тип можно записать число, и `names[1]` в рантайме будет числом", "Компилируется и работает без ошибок", "Не компилируется из-за `push`"],
  a: 1,
  e: "Система типов TypeScript намеренно допускает некоторые небезопасные присваивания (unsoundness) ради удобства. Безопасный вариант — `readonly (string | number)[]` для параметров, которые только читаются.",
  d: [
    H("Вариантность и «дыры» системы типов"),
    UL(
      "**Ковариантность**: если `A` подтип `B`, то `A[]` считается подтипом `B[]`. Удобно, но допускает запись неверного типа через алиас.",
      "**Контравариантность**: параметры функций (при `strictFunctionTypes`): функция `(x: Animal) => void` годится как `(x: Dog) => void`, но не наоборот.",
      "**Инвариантность**: тип должен совпадать точно. TS 4.7 добавил аннотации `in`/`out` для параметров типов (`interface Producer<out T>`), которые документируют и проверяют вариантность.",
      "**`readonly`-массивы** (`readonly T[]`, `ReadonlyArray<T>`) ковариантны безопасно: записывать нельзя. Параметры, которые функция не меняет, лучше объявлять `readonly`.",
      "**Верхние и нижние типы**: `unknown` — верхний (в него присваивается всё), `never` — нижний (присваивается во всё). `any` ведёт себя как оба сразу и отключает проверки.",
      "**Объединения и пересечения**: `A | B` присваивается тому, чему присваиваются и `A`, и `B`; `A & B` присваивается и `A`, и `B`. Пересечение несовместимых примитивов даёт `never`.",
      "**Что ещё допускает unsoundness**: бивариантность методов, индексный доступ без `noUncheckedIndexedAccess`, утверждения `as`, `Object.assign`, мутации через алиасы."
    ),
    C(`function total(xs: readonly number[]) {      // обещает не изменять
  // xs.push(1);                              // ошибка
  return xs.reduce((a, b) => a + b, 0);
}
total([1, 2]);            // изменяемый массив подходит
// const m: number[] = ro; // ошибка: readonly нельзя присвоить изменяемому

interface Producer<out T> { get(): T }
interface Consumer<in T> { put(x: T): void }`),
    LK(["TS Handbook: Type Compatibility", TSD + "type-compatibility.html"], ["TS 4.7: variance annotations", "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html"])
  ],
  v: [
    ["Скомпилируется ли код?", "const names: string[] = ['a'];\nconst things: (string | number)[] = names;", ["Нет: массивы инвариантны", "Да: массивы ковариантны", "Да, но только `as`", "Нет, из-за `strict`"], 1, "Это известная небезопасность ради удобства.", 'ts-ok'],
    ["Скомпилируется ли код?", "const ro: readonly number[] = [1, 2];\nconst m: number[] = ro;", ["Да", "Нет: `readonly` нельзя присвоить изменяемому массиву", "Да, но `m` станет `readonly`", "Нет, из-за `number`"], 1, "Иначе можно было бы изменить данные через `m`.", 'ts-err'],
    ["Скомпилируется ли код?", "function total(xs: readonly number[]) {\n  return xs.reduce((a, b) => a + b, 0);\n}\ntotal([1, 2]);", ["Да: изменяемый массив подходит к `readonly`", "Нет", "Только с `as`", "Нет, массив изменяемый"], 0, "Приведение к более узкому интерфейсу безопасно.", 'ts-ok'],
    ["Что означает аннотация `out T` у параметра типа?", null, ["`T` только записывается", "Параметр ковариантен: `T` используется только в позициях вывода (возвращаемых значениях)", "Параметр инвариантен", "Параметр необязателен"], 1, "Для позиций ввода есть `in`."],
    ["Какие утверждения верны?", null, ["`unknown` — верхний тип", "`never` — нижний тип", "`any` отключает проверки", "`A & B` присваивается и `A`, и `B`", "`never` можно присвоить только `never`"], [0, 1, 2, 3], "`never` присваивается любому типу."],
    ["Почему параметры, которые функция не меняет, лучше объявлять `readonly`?", null, ["Для скорости", "Это документирует намерение, предотвращает случайные мутации и принимает как изменяемые, так и неизменяемые массивы", "Это требует `strict`", "Это включает кеш"], 1, "Контракт функции становится точнее."]
  ]
},
{
  id: "q-ts-15",
  q: "Почему `arr.filter(Boolean)` не сужает тип массива, и как правильно отфильтровать `undefined`?",
  o: ["Сужает всегда", "`Boolean` не является type guard: тип остаётся `(T | undefined)[]`. Нужен предикат `(x): x is T => x !== undefined` (TS 5.5+ умеет выводить такие предикаты для простых стрелочных функций)", "Нужно использовать `as`", "Это ошибка компилятора"],
  a: 1,
  e: "Чтобы `filter` вернул более узкий тип, колбэк должен быть type guard (`x is T`). С TS 5.5 компилятор выводит предикаты для функций вида `x => x !== undefined`, но `Boolean` как значение по-прежнему не сужает.",
  d: [
    H("Сужение типов: тонкие места"),
    C(`const xs: (string | undefined)[] = ["a", undefined];

const a = xs.filter(Boolean);                       // (string | undefined)[]
const b = xs.filter((x): x is string => x !== undefined);   // string[]
const c = xs.filter((x) => x !== undefined);        // string[] с TS 5.5 (выведенный предикат)

let value: string | number = Math.random() > 0.5 ? "a" : 1;
if (typeof value === "string") {
  [1].forEach(() => value.length);   // TS 5.4+ сохраняет сужение в замыканиях после последнего присваивания
}`),
    UL(
      "**Анализ потока управления (CFA)**: компилятор отслеживает присваивания, проверки `typeof`, `instanceof`, `in`, равенства, `if/switch`, раннние `return`/`throw`.",
      "**Сужение теряется** при изменяемых переменных между проверкой и использованием в колбэке (до TS 5.4) и при вызове функций, которые могут изменить объект (для свойств).",
      "**Дискриминируемые объединения** — самый надёжный способ: общее литеральное поле и `switch`.",
      "**Truthiness-сужение**: `if (x)` исключает `null`/`undefined`, но и `0`, `''`; для чисел и строк используйте явное сравнение (`x !== undefined`, `x != null`).",
      "**`Object.entries`/`Object.keys`** теряют точные ключи: возвращают `string`.",
      "**Утверждающие функции**: `function assert(x: unknown): asserts x` и `asserts x is T` сужают тип после вызова.",
      "**`in` сужает** объединения объектов: `'swim' in animal`.",
      "**Исчерпывающая проверка** с `never` в `default` предупреждает о новых вариантах."
    ),
    LK(["TS Handbook: Narrowing", TSD + "2/narrowing.html"], ["TS 5.5: inferred type predicates", "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html"], ["TS 5.4: closures after last assignments", "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html"])
  ],
  v: [
    ["Скомпилируется ли присваивание?", "const xs: (string | undefined)[] = ['a', undefined];\nconst r: string[] = xs.filter(Boolean);", ["Да, `filter(Boolean)` сужает", "Нет: `Boolean` не type guard, тип остаётся `(string | undefined)[]`", "Да, но `r` станет `any`", "Нет, нужен `as const`"], 1, "Нужен явный предикат типа.", 'ts-err'],
    ["Скомпилируется ли присваивание?", "const xs: (string | undefined)[] = ['a', undefined];\nconst r: string[] = xs.filter((x): x is string => x !== undefined);", ["Да", "Нет", "Только в `strict: false`", "Нет, нужен `Boolean`"], 0, "Предикат типа сужает результат `filter`.", 'ts-ok'],
    ["Скомпилируется ли код?", "function area(s: { kind: 'c'; r: number } | { kind: 's'; a: number }) {\n  if (s.kind === 'c') return s.r;\n  return s.a;\n}", ["Нет: `a` не существует", "Да: после ранней проверки в оставшейся ветке тип сужен до `kind: 's'`", "Да, но `a` будет `any`", "Нет: нужен `switch`"], 1, "Анализ потока управления учитывает ранний возврат.", 'ts-ok'],
    ["Что может пойти не так при `if (count)` для `count: number | undefined`?", null, ["Ничего", "При `count === 0` условие ложно, и значение 0 будет обработано как отсутствие", "Ошибка компиляции", "Тип станет `never`"], 1, "Для чисел лучше `count !== undefined`."],
    ["Какие способы сужают тип?", null, ["`typeof x === 'string'`", "`'swim' in animal`", "Предикат `x is T`", "Утверждение `x as T`", "`asserts x is T`"], [0, 1, 2, 4], "`as` не проверяет значение, а только заставляет компилятор поверить."],
    ["Что делает исчерпывающая проверка с `never`?", null, ["Ускоряет код", "Выдаёт ошибку компиляции, если добавили новый вариант объединения и не обработали его", "Включает `strict`", "Отключает проверки"], 1, "Переменная типа `never` не может получить значение необработанного варианта."]
  ]
},
{
  id: "q-ts-16",
  q: "Как типизировать `useReducer` и Context так, чтобы компилятор ловил забытые действия и использование вне провайдера?",
  o: ["Использовать `any` для action и значения контекста", "Описать действия дискриминируемым объединением с `switch` и проверкой на `never`, а контекст создать как `createContext<Value | undefined>(undefined)` и обернуть в хук, который бросает ошибку вне провайдера", "Хранить всё в `useState`", "Не типизировать"],
  a: 1,
  e: "Дискриминируемые действия дают точные типы `payload` и исчерпывающий `switch`. Контекст с `undefined` по умолчанию плюс хук-обёртка убирают проверку на `undefined` из каждого потребителя.",
  d: [
    H("Паттерны типизации: reducer, Context, кастомные хуки"),
    C(`type State = { items: string[]; status: "idle" | "loading" | "error" };
type Action =
  | { type: "add"; item: string }
  | { type: "remove"; index: number }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": return { ...state, items: [...state.items, action.item] };
    case "remove": return { ...state, items: state.items.filter((_, i) => i !== action.index) };
    case "reset": return { items: [], status: "idle" };
    default: { const _never: never = action; return state; }
  }
}

type Ctx = { state: State; dispatch: React.Dispatch<Action> };
const AppCtx = createContext<Ctx | undefined>(undefined);
export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp вне AppProvider");
  return v;
}

// обобщённый хук
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  // ...
  return { data };
}
const { data } = useFetch<User[]>("/api/users");`),
    UL(
      "**Дискриминируемое объединение действий**: каждый вариант имеет собственный `payload`, неверные сочетания невозможны.",
      "**Контекст**: тип значения + `undefined` в качестве начального; хук проверяет и сужает тип, поэтому в компонентах не нужно `!`.",
      "**Дженерик-хуки**: параметр типа передаёт тип данных (`useFetch<User[]>`); по возможности выводите тип из аргумента, а не требуйте его явно.",
      "**Типы для `dispatch`**: `React.Dispatch<Action>`; для вычисляемых создателей действий используйте функции-создатели, возвращающие типизированные действия.",
      "**`useCallback`/`useMemo`**: типы выводятся; явные аннотации нужны только при `any` в аргументах.",
      "**Server/Client границы**: типы пропсов серверных компонентов не должны содержать функции, если они передаются клиентским (сериализуемые данные); для действий (`use server`) параметры и результат должны быть сериализуемыми."
    ),
    LK(["React: useReducer (TypeScript)", RD + "learn/typescript#typing-usereducer"], ["React: Context (TypeScript)", RD + "learn/typescript#typing-usecontext"])
  ],
  v: [
    ["Скомпилируется ли код?", "type A = { type: 'add'; item: string } | { type: 'reset' };\nfunction f(a: A): number {\n  switch (a.type) {\n    case 'add': return a.item.length;\n    case 'reset': return 0;\n    default: { const n: never = a; return n; }\n  }\n}", ["Да: все варианты обработаны", "Нет: `item` не существует", "Нет, `never` нельзя использовать", "Да, но `n` станет `any`"], 0, "В `default` остаётся `never`.", 'ts-ok'],
    ["Скомпилируется ли код после добавления варианта `{ type: 'remove' }` и без ветки в `switch`?", "type A = { type: 'add' } | { type: 'reset' } | { type: 'remove' };\nfunction f(a: A): number {\n  switch (a.type) {\n    case 'add': return 1;\n    case 'reset': return 0;\n    default: { const n: never = a; return 2; }\n  }\n}", ["Да", "Нет: в `default` тип `{ type: 'remove' }` не присваивается `never`", "Да, но с предупреждением", "Нет, из-за `reset`"], 1, "Исчерпывающая проверка сообщает о забытом варианте.", 'ts-err'],
    ["Зачем `createContext<Ctx | undefined>(undefined)` и хук, бросающий ошибку?", null, ["Для скорости", "Чтобы не придумывать фиктивное значение по умолчанию и гарантировать, что потребитель использует контекст внутри провайдера", "Чтобы отключить рендер", "Это требование React"], 1, "Хук сужает тип до `Ctx` без проверки в каждом компоненте."],
    ["Как сделать, чтобы `useFetch<T>` не требовал явной передачи типа в простых случаях?", null, ["Нельзя", "Выводить `T` из параметра (например, функции-парсера или схемы), а не задавать вручную", "Использовать `any`", "Всегда использовать `unknown`"], 1, "Тогда тип данных определяется источником проверки."],
    ["Что верно?", null, ["Дискриминируемые действия дают точный `payload` в каждой ветке `switch`", "`React.Dispatch<Action>` — тип функции `dispatch`", "`createContext<Ctx>(undefined!)` безопаснее варианта с `undefined` и проверкой", "Исчерпывающая проверка использует `never`"], [0, 1, 3], "`undefined!` скрывает ошибку использования вне провайдера."],
    ["Что нужно помнить о пропсах, передаваемых от серверных компонентов клиентским?", null, ["Любые значения допустимы", "Они должны быть сериализуемыми (без функций, кроме Server Actions)", "Нужно использовать `any`", "Они копируются глубоким клонированием"], 1, "Граница серверной и клиентской частей проходит через сериализацию."]
  ]
},
]);
