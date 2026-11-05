import { C, H, LK, UL } from "./registry";
import { K } from "./helpers";
/* ===================== React Hook Form ===================== */
const RHFD = "https://react-hook-form.com/docs/";
K("rhf", [
{
  id: "q-rhf-1",
  q: "Почему React Hook Form при вводе в поле, как правило, не перерисовывает всю форму?",
  o: ["Использует `React.memo` для всех полей", "Поля работают как неконтролируемые: значения читаются из DOM через `ref`, а состояние формы хранится вне `useState` и подписки включаются только на нужные части", "Хранит значения в Context", "Обновляет DOM напрямую без React"],
  a: 1,
  e: "`register` возвращает `onChange`, `onBlur`, `name`, `ref`. Значения живут в DOM и во внутреннем хранилище формы; перерисовка происходит только если вы подписались на состояние через `watch`, `formState` и т. п.",
  d: [
    H("React Hook Form: неконтролируемый подход"),
    C(`const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  defaultValues: { email: "", age: 18 },
});

<form onSubmit={handleSubmit(onValid, onInvalid)}>
  <input {...register("email", { required: "Нужен email", pattern: { value: /\\S+@\\S+/, message: "Неверный формат" } })} />
  {errors.email && <p>{errors.email.message}</p>}
  <input type="number" {...register("age", { valueAsNumber: true, min: 18 })} />
  <button disabled={isSubmitting}>Отправить</button>
</form>`),
    UL(
      "**`register(name, rules)`** возвращает `{ onChange, onBlur, name, ref }`. Через `ref` библиотека читает и записывает значение прямо в DOM-элемент.",
      "**`watch('field')`** подписывает **всю** форму (компонент с `useForm`) на перерисовку при изменении; **`useWatch({ control, name })`** изолирует перерисовку в компоненте, где вызван.",
      "**`formState`** — прокси: библиотека включает подписку на `isDirty`, `errors`, `isValid` и др., только если вы прочитали их в рендере.",
      "`valueAsNumber`/`valueAsDate` преобразуют строку из `input` при чтении.",
      "`getValues()` читает значения без подписки и перерисовки."
    ),
    LK(["RHF: useForm", RHFD + "useform"], ["RHF: register", RHFD + "useform/register"], ["RHF: watch / useWatch", RHFD + "usewatch"])
  ],
  v: [
    ["Что возвращает `register('email')`?", null, ["Только значение поля", "Объект `{ onChange, onBlur, name, ref }` для передачи в input", "Промис", "Компонент"], 1, "Его распыляют в элемент: `<input {...register('email')} />`."],
    ["Чем `useWatch` отличается от `watch`?", null, ["Ничем", "`useWatch` ограничивает перерисовку компонентом, где вызван; `watch` перерисовывает компонент с `useForm`", "`useWatch` не работает с вложенными полями", "`watch` работает только асинхронно"], 1, "Для тяжёлых форм подписки на значения выносят в дочерние компоненты."],
    ["Когда `formState.isDirty` начинает обновляться?", null, ["Всегда", "Когда это свойство прочитано в рендере (подписка через прокси)", "Только после `submit`", "Только в `onBlur`"], 1, "Если не прочитать, подписки нет — экономия рендеров."],
    ["Как получить текущие значения без перерисовок?", null, ["`watch()`", "`getValues()`", "`useState`", "`reset()`"], 1, "`getValues` читает один раз, подписки не создаёт."],
    ["Что верно про `register`?", null, ["Работает с нативными `input`, `select`, `textarea`", "Не умеет в `valueAsNumber`", "Подходит для элементов, которые передают `ref` на DOM-узел", "Заменяет `useState` для значения поля внутри компонента"], [0, 2, 3], "`valueAsNumber` поддерживается. Кастомные UI-компоненты без `ref` нужно подключать через `Controller`."],
    ["Что делает `handleSubmit(onValid, onInvalid)`?", null, ["Отправляет форму на сервер", "Проверяет значения и вызывает `onValid` с данными или `onInvalid` с ошибками", "Сбрасывает форму", "Валидирует только по `onBlur`"], 1, "HTTP-запрос вы пишете сами внутри `onValid`."]
  ]
},
{
  id: "q-rhf-2",
  q: "Когда нужен `Controller`/`useController` вместо `register`?",
  o: ["Всегда, `register` устарел", "Для контролируемых компонентов UI-библиотек (MUI Select, DatePicker, кастомные компоненты), которые не отдают `ref` на DOM-элемент и работают через `value`/`onChange`", "Только для чекбоксов", "Только для `fieldArray`"],
  a: 1,
  e: "`Controller` оборачивает контролируемый компонент и связывает `value`/`onChange`/`onBlur` с формой через `field` и `fieldState`.",
  d: [
    H("Controller и интеграция с UI-библиотеками"),
    C(`import { Controller, useForm } from "react-hook-form";

const { control, handleSubmit } = useForm({ defaultValues: { country: null } });

<Controller
  name="country"
  control={control}
  rules={{ required: "Выберите страну" }}
  render={({ field, fieldState }) => (
    <Select {...field} options={countries} error={fieldState.error?.message} />
  )}
/>`),
    UL(
      "`field` содержит `value`, `onChange`, `onBlur`, `name`, `ref`; `fieldState` — `error`, `invalid`, `isTouched`, `isDirty`.",
      "`useController` — тот же механизм хуком для кастомных компонентов.",
      "`Controller` перерисовывает свой компонент при изменении поля — это цена за контролируемость.",
      "`onChange` принимает как событие, так и готовое значение (это удобно для кастомных компонентов).",
      "С React 19 `ref` передаётся как обычный проп, поэтому часть кастомных компонентов можно подключить через `register`."
    ),
    LK(["RHF: Controller", RHFD + "usecontroller/controller"], ["RHF: useController", RHFD + "usecontroller"])
  ],
  v: [
    ["Для какого случая `register` не подходит?", null, ["Нативный `input`", "Компонент `Select` из UI-библиотеки с пропсами `value`/`onChange` и без ref на DOM", "`textarea`", "`select`"], 1, "Для таких компонентов используют `Controller`."],
    ["Что приходит в `render` у `Controller`?", null, ["`{ field, fieldState, formState }`", "Только `value`", "Только `register`", "`event`"], 0, "`field` передают в UI-компонент, `fieldState` — для отображения ошибки."],
    ["Что делает `field.onChange(value)`?", null, ["Только вызывает `console.log`", "Записывает значение в форму и запускает валидацию по режиму", "Сбрасывает форму", "Отправляет форму"], 1, "Можно передавать не только событие, но и готовое значение."],
    ["Где задаются правила валидации для `Controller`?", null, ["В свойстве `rules`", "В `register`", "Только в схеме", "Нигде"], 0, "Можно и через resolver со схемой."],
    ["Что верно про `useController`?", null, ["Это хук для создания собственных полей", "Возвращает `field` и `fieldState`", "Работает только внутри `Controller`", "Требует `control` либо `FormProvider`"], [0, 1, 3], "Хук используется отдельно от компонента `Controller`."],
    ["Почему контролируемое поле может вызывать больше перерисовок?", null, ["Баг библиотеки", "Компонент подписан на значение и перерисовывается при каждом изменении", "Из-за Strict Mode", "Из-за `defaultValues`"], 1, "Это цена за контролируемость."]
  ]
},
{
  id: "q-rhf-3",
  q: "Как работают режимы валидации `mode` и `reValidateMode` и зачем нужен resolver?",
  o: ["Режимы задают только стили", "`mode` определяет, когда валидировать до первой отправки (по умолчанию `onSubmit`), `reValidateMode` — после (по умолчанию `onChange`); resolver подключает схему (zod, yup) для единой валидации", "Resolver нужен только для серверной валидации", "`mode` определяет тип поля"],
  a: 1,
  e: "`mode`: `onSubmit` (по умолчанию), `onBlur`, `onChange`, `onTouched`, `all`. После первой отправки действует `reValidateMode` (по умолчанию `onChange`). Resolver (`@hookform/resolvers`) сопоставляет схему и ошибки формы.",
  d: [
    H("Валидация: встроенная и через схему"),
    C(`import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Неверный email"),
  age: z.coerce.number().int().min(18, "Нужно 18+"),
});
type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  mode: "onBlur",              // валидировать при уходе с поля
  defaultValues: { email: "", age: 18 },
});

// ошибка с сервера
form.setError("email", { type: "server", message: "Email занят" });`),
    UL(
      "**`mode`**: `onSubmit`, `onBlur`, `onChange` (дороже по рендерам), `onTouched` (первый раз по blur, затем по change), `all`.",
      "**Схема и тип в одном месте**: `z.infer<typeof schema>` избавляет от дублирования типа формы.",
      "**Асинхронная валидация**: в `validate` можно вернуть промис (например, проверка уникальности).",
      "**`trigger()`** запускает валидацию вручную; **`setError`/`clearErrors`** — для ошибок сервера.",
      "Ошибки вложенных полей лежат по пути: `errors.address?.city?.message`.",
      "Валидация на клиенте — для удобства, а не безопасности: сервер всё равно проверяет данные."
    ),
    LK(["RHF: Resolvers", "https://github.com/react-hook-form/resolvers"], ["RHF: useForm (mode)", RHFD + "useform"], ["RHF: setError", RHFD + "useform/seterror"])
  ],
  v: [
    ["Какой `mode` у `useForm` по умолчанию?", null, ["`onChange`", "`onSubmit`", "`onBlur`", "`all`"], 1, "После первой отправки действует `reValidateMode` (по умолчанию `onChange`)."],
    ["Что делает `mode: 'onTouched'`?", null, ["Валидирует при каждом нажатии", "Первый раз валидирует при blur, дальше при каждом изменении", "Валидирует только при submit", "Отключает валидацию"], 1, "Часто используется для удобного UX."],
    ["Как показать ошибку, пришедшую с сервера, под полем `email`?", null, ["`setError('email', { message })`", "`reset()`", "`register('email')`", "Только через `alert`"], 0, "Ошибка попадёт в `formState.errors.email`."],
    ["Зачем `zodResolver`?", null, ["Чтобы шифровать данные", "Чтобы валидировать значения формы схемой zod и получать типы через `z.infer`", "Чтобы заменить `register`", "Чтобы отправлять данные на сервер"], 1, "Схема — единый источник правил и типов."],
    ["Почему клиентской валидации недостаточно?", null, ["Это неправда", "Её можно обойти, сервер обязан проверять данные сам", "Она запрещена браузерами", "Она не работает с TypeScript"], 1, "Клиентская валидация — часть UX."],
    ["Что верно?", null, ["`trigger()` запускает валидацию вручную", "`mode: 'onChange'` может чаще перерисовывать форму", "После первой отправки валидация идёт по `reValidateMode`", "`mode` и `reValidateMode` — одно и то же"], [0, 1, 2], "Это два разных параметра."]
  ]
},
{
  id: "q-rhf-4",
  q: "Почему в `useFieldArray` в качестве `key` нужно использовать `field.id`, а не индекс?",
  o: ["Индекс нельзя использовать в JSX", "`field.id` — стабильный идентификатор элемента: при вставке, удалении и перестановке React правильно сопоставляет строки и не путает введённые значения", "`field.id` быстрее", "Индекс не поддерживается TypeScript"],
  a: 1,
  e: "`useFieldArray` добавляет каждому элементу уникальный `id` (по умолчанию в поле `id`). Ключ по индексу при удалении или перемещении приводит к тому, что состояние неконтролируемых `input` переезжает на соседнюю строку.",
  d: [
    H("Динамические списки полей и жизненный цикл формы"),
    C(`const { control, register } = useForm({
  defaultValues: { items: [{ name: "" }] },
});
const { fields, append, remove, move } = useFieldArray({ control, name: "items" });

{fields.map((field, index) => (
  <div key={field.id}>                       {/* не index! */}
    <input {...register(\`items.\${index}.name\`)} />
    <button type="button" onClick={() => remove(index)}>×</button>
  </div>
))}
<button type="button" onClick={() => append({ name: "" })}>Добавить</button>`),
    UL(
      "**`defaultValues`** кешируются при первом рендере. Чтобы подставить данные, пришедшие позже, используйте `reset(data)` или `values` — иначе форма останется пустой.",
      "**`isDirty`** сравнивается с `defaultValues`; после `reset(newValues)` эти значения становятся новой базой.",
      "**`setValue(name, value, { shouldDirty, shouldValidate })`** записывает значение программно.",
      "**`FormProvider` + `useFormContext`** передают форму вглубь без пробрасывания пропсов.",
      "**`shouldUnregister`**: по умолчанию значение скрытого (размонтированного) поля сохраняется; при `true` оно удаляется.",
      "Методы `useFieldArray`: `append`, `prepend`, `insert`, `remove`, `swap`, `move`, `update`, `replace`."
    ),
    LK(["RHF: useFieldArray", RHFD + "usefieldarray"], ["RHF: reset", RHFD + "useform/reset"], ["RHF: FormProvider", RHFD + "formprovider"])
  ],
  v: [
    ["Почему форма остаётся пустой, если данные пользователя пришли после первого рендера?", "const { register } = useForm({ defaultValues: user }); // user пока undefined", ["Баг React", "`defaultValues` читаются при инициализации; нужно `reset(user)` или опция `values`", "Нужен `key` на форме", "Нужен `mode: 'onChange'`"], 1, "Это одна из самых частых ошибок."],
    ["Что нужно использовать как `key` в `fields.map`?", null, ["`index`", "`field.id`", "`field.name`", "`Math.random()`"], 1, "`field.id` генерирует `useFieldArray`."],
    ["Что делает `reset(values)`?", null, ["Только очищает ошибки", "Сбрасывает форму и делает `values` новыми значениями по умолчанию", "Отправляет форму", "Отключает валидацию"], 1, "После этого `isDirty` считается относительно новых значений."],
    ["Зачем `FormProvider`?", null, ["Для стилей", "Чтобы вложенные компоненты использовали форму через `useFormContext` без передачи `control` пропсами", "Для SSR", "Для валидации схемой"], 1, "Удобно для больших форм из многих компонентов."],
    ["Какие методы есть у `useFieldArray`?", null, ["`append`", "`remove`", "`move`", "`dispatch`", "`swap`"], [0, 1, 2, 4], "Есть также `prepend`, `insert`, `update`, `replace`."],
    ["Что делает `setValue('name', 'x', { shouldValidate: true })`?", null, ["Записывает значение и запускает валидацию поля", "Только валидирует", "Сбрасывает значение", "Ничего без `register`"], 0, "`shouldDirty` и `shouldTouch` обновляют соответствующие флаги."]
  ]
},
]);

/* ===================== React Hook Form, часть 2 ===================== */
K("rhf", [
{
id: "q-rhf-5",
  q: "Как разбить большую форму на компоненты: `FormProvider`, `useFormContext` и типизация вложенных полей?",
  o: ["Каждый вложенный компонент создаёт свой `useForm`, а значения потом склеивают вручную", "Родитель вызывает `useForm` и оборачивает дерево в `FormProvider`; вложенные компоненты берут `register`, `control` через `useFormContext`", "Все поля формы обязаны находиться в одном компоненте", "Форму можно разбить только через Redux"],
  a: 1,
  e: "`FormProvider` кладёт методы формы в контекст. Это удобно для секций и переиспользуемых полей. Но контекст не даёт оптимизаций сам по себе: для точечных подписок используют `useWatch` и `useFormState`.",
  d: [
    H("Разбиение формы"),
    C(`function Page() {
  const methods = useForm<Values>({ defaultValues });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(save)}>
        <Address />
        <button>Сохранить</button>
      </form>
    </FormProvider>
  );
}

function Address() {
  const { register, formState: { errors } } = useFormContext<Values>();
  return <input {...register("address.city", { required: true })} />;
}`),
    UL(
      "**Вложенные имена**: `address.city`, `items.0.title` — значения собираются в объект.",
      "**Обобщённое поле**: компонент `TextField name=\"address.city\"` использует `useController` и принимает `name` пропсом.",
      "**Типизация путей**: тип `Path<Values>` ограничивает допустимые имена полей.",
      "**Один `useForm` на форму**: несколько экземпляров — это разные формы со своим состоянием.",
      "**Перерисовки**: изменение `formState` в контексте перерисует читающие его компоненты, поэтому читайте только нужное."
    ),
    LK(["FormProvider", "https://react-hook-form.com/docs/formprovider"], ["useFormContext", "https://react-hook-form.com/docs/useformcontext"])
  ],
  v: [
    ["Что делает `FormProvider`?", null, ["Передаёт методы формы вложенным компонентам через контекст", "Отправляет форму", "Валидирует схему", "Сбрасывает форму"], 0, "Нужен для `useFormContext`."],
    ["Сколько раз вызывают `useForm` для одной формы?", null, ["Один раз в родителе", "В каждом поле", "В каждой секции отдельно", "Ни разу"], 0, "Остальные берут методы из контекста."],
    ["Как записывается путь к вложенному полю?", null, ["`address.city`", "`address/city`", "`address->city`", "`address[city]`"], 0, "Для массивов — `items.0.title`."],
    ["Для чего тип `Path<Values>`?", null, ["Ограничить имена полей допустимыми путями", "Описать маршрут страницы", "Задать значения по умолчанию", "Подключить схему"], 0, "Опечатки в именах ловятся компилятором."],
    ["Как сделать переиспользуемое поле?", null, ["Компонент с пропсом `name` и `useController`", "Копировать поле в каждую форму", "Использовать глобальную переменную", "Хранить значение в `window`"], 0, "Тогда он подходит к любой форме."],
    ["Что вызовет перерисовку читателя `formState` из контекста?", null, ["Изменение прочитанных им свойств состояния", "Любое нажатие клавиши в любом поле", "Размер окна", "Ничего"], 0, "Подписка идёт на прочитанные свойства."]
  ]
},
{
id: "q-rhf-6",
  q: "Какие встроенные правила валидации есть у `register` и как сделать асинхронную проверку (`validate`) и зависимые поля (`deps`, `trigger`)?",
  o: ["Встроенных правил нет, нужна внешняя схема", "`required`, `min/max`, `minLength/maxLength`, `pattern`, `validate` (в том числе async); `deps` и `trigger()` перепроверяют связанные поля", "Валидация возможна только при отправке формы", "Async-проверки не поддерживаются"],
  a: 1,
  e: "`validate` принимает функцию (или объект функций) и возвращает `true` либо текст ошибки. Для проверки «пароль совпадает с подтверждением» поле зависит от другого, поэтому указывают `deps` или вызывают `trigger('confirm')`.",
  d: [
    H("Встроенная валидация"),
    C(`<input {...register("username", {
  required: "Обязательное поле",
  minLength: { value: 3, message: "Минимум 3 символа" },
  validate: async (v) => (await isFree(v)) || "Имя занято",   // асинхронная проверка
})} />

<input {...register("password")} />
<input {...register("confirm", {
  deps: ["password"],                                         // перепроверить при изменении password
  validate: (v, form) => v === form.password || "Пароли не совпадают",
})} />

await trigger(["username"]);                                  // ручной запуск проверки`),
    UL(
      "**Async-проверки** лучше защищать debounce, иначе на каждый символ уйдёт запрос.",
      "**`validate` с объектом**: `{ notEmpty: v => ..., unique: v => ... }` — ключ становится `error.type`.",
      "**`pattern`** задаётся регулярным выражением; сообщение — через объект `{ value, message }`.",
      "**`disabled` поля** исключает его из результата и валидации.",
      "**Для сложных правил** удобнее схема через `resolver`, особенно если она общая с сервером."
    ),
    LK(["register: правила", "https://react-hook-form.com/docs/useform/register"], ["trigger", "https://react-hook-form.com/docs/useform/trigger"])
  ],
  v: [
    ["Что возвращает функция `validate` при успехе?", null, ["`true`", "`false`", "`undefined` всегда", "Объект"], 0, "При ошибке — текст сообщения или `false`."],
    ["Что делает `trigger('field')`?", null, ["Вручную запускает проверку поля", "Отправляет форму", "Сбрасывает поле", "Фокусирует поле"], 0, "Можно передать массив имён."],
    ["Для чего опция `deps`?", null, ["Перепроверить зависимые поля при изменении этого", "Подключить зависимость npm", "Задать значение", "Отключить проверку"], 0, "Нужна для «пароль/подтверждение»."],
    ["Что стоит добавить к async-проверке «имя занято»?", null, ["Debounce, чтобы не запрашивать сервер на каждый символ", "Ничего", "`setTimeout(0)`", "`required`"], 0, "Иначе лишняя нагрузка."],
    ["Как задать сообщение для `minLength`?", null, ["`minLength: { value: 3, message: '…' }`", "`minLength: 3, text: '…'`", "`message: '…'`", "Нельзя"], 0, "Формат объекта работает для встроенных правил."],
    ["Что происходит с полем с `disabled: true` в `register`?", null, ["Оно исключается из значений и валидации", "Остаётся в значениях", "Удаляется из DOM", "Становится обязательным"], 0, "Значение будет `undefined`."]
  ]
},
{
id: "q-rhf-7",
  q: "Что такое `watch`, `useWatch` и `getValues`, и как не вызвать лишние перерисовки формы?",
  o: ["Все три метода одинаково перерисовывают форму при каждом вводе", "`watch` подписывает на изменения и перерисовывает компонент с `useForm`, `useWatch` локализует подписку в дочернем компоненте, `getValues` читает значения без подписки", "`getValues` вызывает валидацию", "`watch` работает только после отправки формы"],
  a: 1,
  e: "Форма на `register` не перерисовывается при вводе, пока вы сами не подписались. `watch` на верхнем уровне подписывает весь компонент; `useWatch({ control, name })` в маленьком компоненте ограничивает рендеры им одним; `getValues()` подходит для разового чтения в обработчике.",
  d: [
    H("Подписки на значения"),
    C(`function Total({ control }: { control: Control<FormValues> }) {
  const price = useWatch({ control, name: "price" });   // перерисуется только Total
  const qty = useWatch({ control, name: "qty" });
  return <b>{price * qty}</b>;
}

const onClick = () => {
  const values = getValues();   // без подписки, без рендера
};

const sub = watch((value, { name }) => analytics.track(name));  // колбэк-подписка
useEffect(() => () => sub.unsubscribe(), [watch]);`),
    UL(
      "**`formState`** — это Proxy: подписка есть только на те поля (`errors`, `isDirty`, `isValid`…), которые вы прочитали при рендере.",
      "**`isValid`** включает проверку при каждом изменении, поэтому читайте его, только когда он нужен.",
      "**`useFormState({ control })`** выносит чтение состояния формы в отдельный компонент.",
      "**`shouldUnregister`** удаляет значения скрытых полей из результата.",
      "**Большие формы**: делить на под-компоненты с `useWatch`, использовать `FormProvider` и `useFormContext`."
    ),
    LK(["useWatch", "https://react-hook-form.com/docs/usewatch"], ["Performance", "https://react-hook-form.com/advanced-usage#FormPerformance"])
  ],
  v: [
    ["Что делает `getValues()`?", null, ["Читает текущие значения без подписки на изменения", "Подписывается на все поля", "Запускает валидацию", "Сбрасывает форму"], 0, "Удобно в обработчиках."],
    ["Чем `useWatch` лучше `watch` на верхнем уровне?", null, ["Перерисовывает только компонент, где вызван", "Работает быстрее всех", "Не требует `control`", "Валидирует поле"], 0, "Подписка локальная."],
    ["Почему `formState` описывают как Proxy?", null, ["Подписка создаётся только на прочитанные свойства", "Он хранит значения полей", "Он меняет DOM", "Он отправляет форму"], 0, "Так форма не рендерится зря."],
    ["Чем опасно постоянное чтение `isValid`?", null, ["Включает проверку при каждом изменении", "Блокирует отправку формы", "Очищает ошибки", "Отключает `register`"], 0, "Читайте только если нужно."],
    ["Как отписаться от `watch(callback)`?", null, ["Вызвать `unsubscribe()` у возвращённого объекта", "Удалить поле", "Вызвать `reset()`", "Нельзя"], 0, "Обычно в cleanup эффекта."],
    ["Зачем нужен `FormProvider`?", null, ["Передать `control` и методы вложенным компонентам без пропсов", "Подключить схему", "Отправить форму", "Включить SSR"], 0, "Дочерние компоненты читают через `useFormContext`."]
  ]
},
{
id: "q-rhf-8",
  q: "Как тестировать формы на React Hook Form: что и как проверять через Testing Library и `userEvent`?",
  o: ["Тестировать внутренности RHF: вызовы `register` и `formState`", "Проверять поведение глазами пользователя: ввести значения через `userEvent`, нажать кнопку, дождаться ошибок или вызова `onSubmit` через `findBy*`/`waitFor`", "Использовать снимок (snapshot) всего DOM", "Мокать `useForm`"],
  a: 1,
  e: "Нужно проверять результат для пользователя: сообщения об ошибках, блокировку кнопки, вызов обработчика с корректными данными. Внутренности библиотеки не тестируют. Валидация и отправка асинхронны, поэтому используют `await` и `findBy*`.",
  d: [
    H("Тесты формы"),
    C(`test("показывает ошибку и отправляет валидную форму", async () => {
  const onSave = jest.fn();
  const user = userEvent.setup();
  render(<SignupForm onSave={onSave} />);

  await user.click(screen.getByRole("button", { name: /отправить/i }));
  expect(await screen.findByText("Введите почту")).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText(/почта/i), "ada@example.com");
  await user.click(screen.getByRole("button", { name: /отправить/i }));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith({ email: "ada@example.com" }));
});`),
    UL(
      "**Запросы по роли и label**: `getByRole`, `getByLabelText` ближе к тому, как пользуется человек, и заодно проверяют доступность.",
      "**`userEvent`** эмулирует полноценные действия (фокус, ввод, blur), а `fireEvent` — одно событие.",
      "**Асинхронность**: `findBy*` = `getBy*` + ожидание; `waitFor` повторяет проверку до успеха.",
      "**Моки сети**: MSW или мок API-функции.",
      "**Не тестировать**: что `register` вызван, какой `mode` выставлен — это детали реализации."
    ),
    LK(["Testing Library: queries", "https://testing-library.com/docs/queries/about"], ["user-event", "https://testing-library.com/docs/user-event/intro"])
  ],
  v: [
    ["Как найти поле так, как это делает пользователь?", null, ["`getByLabelText`", "`querySelector('input')`", "По имени класса", "По индексу"], 0, "Заодно проверяется связь label и поля."],
    ["Чем `userEvent` лучше `fireEvent`?", null, ["Эмулирует последовательность реальных действий пользователя", "Быстрее всех", "Не требует `await`", "Работает без DOM"], 0, "Фокус, ввод, blur."],
    ["Что ждёт появления элемента?", null, ["`findBy*`", "`getBy*`", "`queryBy*`", "`allBy*`"], 0, "Возвращает Promise."],
    ["Что не нужно тестировать?", null, ["Какие функции RHF вызваны внутри", "Сообщение об ошибке", "Вызов `onSubmit`", "Блокировку кнопки"], 0, "Это детали реализации."],
    ["Почему важен `await` перед `user.click`?", null, ["Действия и валидация асинхронны", "Для типизации", "Иначе `jest` упадёт", "Для скорости"], 0, "Иначе проверка выполнится раньше обновления."],
    ["Чем мокают сетевые запросы формы?", null, ["MSW или заменой функции API", "Реальным сервером", "Снимками", "`localStorage`"], 0, "Тест не должен ходить в сеть."]
  ]
},
{
id: "q-rhf-9",
  q: "Что означают `isDirty`, `dirtyFields`, `touchedFields`, `isSubmitting`, `isSubmitSuccessful` и как правильно делать `reset` после отправки?",
  o: ["`isDirty` всегда `true`, если пользователь нажал на поле", "`isDirty` — значения отличаются от `defaultValues`, `touchedFields` — поле теряло фокус, `isSubmitting` — идёт async-обработчик; после успеха вызывают `reset(newDefaults)`", "`isSubmitting` включается при вводе каждого символа", "`reset` нельзя вызывать после отправки"],
  a: 1,
  e: "Dirty считается относительно `defaultValues`, поэтому после сохранения на сервере надо вызвать `reset(savedValues)`, чтобы новые значения стали эталоном. Вызывать `reset` лучше в `useEffect` по `isSubmitSuccessful` либо прямо после успешного запроса.",
  d: [
    H("Состояние формы"),
    C(`const { handleSubmit, reset, formState: { isDirty, isSubmitting, dirtyFields, errors } } = useForm({ defaultValues });

const onSubmit = handleSubmit(async (values) => {
  const saved = await api.save(values);     // handleSubmit ждёт Promise
  reset(saved);                              // новое «исходное» состояние, isDirty = false
});

<button disabled={!isDirty || isSubmitting}>Сохранить</button>`),
    UL(
      "**`dirtyFields`** помогает отправлять на сервер только изменённые поля (PATCH).",
      "**`touchedFields`** — поля, которые теряли фокус.",
      "**`isSubmitted`**, **`submitCount`**, **`isSubmitSuccessful`** описывают результат отправки.",
      "**`handleSubmit(onValid, onInvalid)`**: второй колбэк вызывается при ошибках валидации, например, чтобы прокрутить к первому полю.",
      "**`shouldFocusError`** автоматически ставит фокус на первое поле с ошибкой.",
      "**Загрузка данных**: передавайте `values` в `useForm` либо вызывайте `reset(data)`, когда данные пришли."
    ),
    LK(["formState", "https://react-hook-form.com/docs/useform/formstate"], ["reset", "https://react-hook-form.com/docs/useform/reset"])
  ],
  v: [
    ["Относительно чего считается `isDirty`?", null, ["`defaultValues`", "Значений на сервере", "Первого символа ввода", "`localStorage`"], 0, "Поэтому после сохранения нужен `reset`."],
    ["Что делает `reset(values)`?", null, ["Сбрасывает форму и делает `values` новыми значениями по умолчанию", "Только очищает ошибки", "Отправляет форму", "Удаляет поля"], 0, "`isDirty` станет `false`."],
    ["Когда `isSubmitting` равен `true`?", null, ["Пока выполняется асинхронный обработчик `handleSubmit`", "Пока пользователь вводит текст", "Пока загружается страница", "Всегда"], 0, "Нужен `async` и возврат Promise."],
    ["Для чего второй аргумент `handleSubmit`?", null, ["Обработать невалидную отправку", "Задать схему", "Отключить фокус", "Сбросить поля"], 0, "Например, прокрутить к ошибке."],
    ["Как отправить на сервер только изменённые поля?", null, ["Использовать `dirtyFields`", "Использовать `touchedFields`", "Использовать `errors`", "Невозможно"], 0, "Они отмечают изменения относительно значений по умолчанию."],
    ["Как заполнить форму данными, загруженными с сервера?", null, ["Передать `values` в `useForm` или вызвать `reset(data)`", "Изменить `defaultValues` напрямую", "Вызвать `register(data)`", "Перемонтировать `window`"], 0, "Изменение объекта `defaultValues` форму не обновляет."]
  ]
},
{
id: "q-rhf-10",
  q: "Как RHF сочетается с Server Actions и серверной валидацией в Next.js (`useActionState`, `action` формы)?",
  o: ["RHF нельзя использовать с Server Actions", "Клиентская проверка (RHF + схема) улучшает UX, а сервер обязан повторно проверить данные тем же схемой; результат Action (ошибки) можно записать в форму через `setError`", "Серверная валидация не нужна, если есть клиентская", "Server Actions принимают только JSON-объекты, а не `FormData`"],
  a: 1,
  e: "Клиенту нельзя доверять: проверка в браузере обходится. Общая схема (Zod) вызывается на клиенте для подсказок и на сервере для безопасности. Ошибки, вернувшиеся из Action, показывают через `setError` или `useActionState`.",
  d: [
    H("RHF и Server Actions"),
    C(`// actions.ts
"use server";
export async function signup(input: unknown) {
  const parsed = schema.safeParse(input);           // повторная проверка на сервере
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  await db.users.create(parsed.data);
  return { ok: true };
}

// form.tsx
const onSubmit = handleSubmit(async (values) => {
  const res = await signup(values);
  if (!res.ok) Object.entries(res.errors).forEach(([k, m]) => setError(k as any, { message: m?.[0] }));
});`),
    UL(
      "**Серверная проверка обязательна**: Server Action — это публичная HTTP-точка.",
      "**Общая схема** в отдельном модуле без серверных зависимостей.",
      "**Без JS**: форма с `action={serverAction}` работает как обычная HTML-форма, RHF добавляет клиентские улучшения.",
      "**`useActionState`** хранит результат Action и флаг `isPending` для простых форм без RHF.",
      "**CSRF**: Server Actions в Next.js принимают только POST и сверяют Origin, но авторизацию проверяйте внутри каждого Action."
    ),
    LK(["Next.js: Forms", "https://nextjs.org/docs/app/guides/forms"], ["React: useActionState", "https://react.dev/reference/react/useActionState"])
  ],
  v: [
    ["Почему нужна проверка на сервере, если она есть на клиенте?", null, ["Клиентскую проверку можно обойти", "Клиент не умеет проверять", "Сервер быстрее", "Это требует TypeScript"], 0, "Запрос можно отправить напрямую."],
    ["Как удобно переиспользовать правила проверки?", null, ["Общая схема в отдельном модуле", "Копировать правила в два места", "Хранить в cookie", "Отдавать с API при каждой проверке"], 0, "Одна схема — и клиент, и сервер."],
    ["Что вернёт `schema.safeParse` при ошибке?", null, ["Объект с `success: false` и ошибками", "Исключение", "`null`", "`undefined`"], 0, "В отличие от `parse`, не бросает."],
    ["Что нужно проверять внутри Server Action помимо данных?", null, ["Авторизацию пользователя", "Размер экрана", "Версию React", "Язык браузера"], 0, "Action доступен как HTTP-эндпоинт."],
    ["Как показать серверную ошибку у поля в RHF?", null, ["`setError(name, { message })`", "`reset(error)`", "`watch(error)`", "`getValues(error)`"], 0, "Ошибка появится в `formState.errors`."],
    ["Что даёт `useActionState` без RHF?", null, ["Результат Action и флаг ожидания", "Только валидацию", "Только кеш", "Маршрутизацию"], 0, "Подходит для простых форм."]
  ]
},
{
id: "q-rhf-11",
  q: "Как сделать форму доступной: связь с `label`, `aria-invalid`, `aria-describedby`, фокус на первой ошибке и роль `alert`?",
  o: ["Достаточно показать сообщение красным цветом", "Привязать `label`, выставить `aria-invalid` и `aria-describedby` на поле с ошибкой, вывести сообщение в `role=\"alert\"` и вернуть фокус к первой ошибке", "Доступность нужна только в публичных формах", "Для доступности достаточно `placeholder`"],
  a: 1,
  e: "Цвет не может быть единственным способом передать ошибку. Скринридеру нужны программная связь поля и текста ошибки и объявление при появлении. RHF сам ставит фокус на первое невалидное поле при `shouldFocusError: true`.",
  d: [
    H("Доступные формы с RHF"),
    C(`<label htmlFor="email">Почта</label>
<input
  id="email"
  type="email"
  aria-invalid={errors.email ? "true" : "false"}
  aria-describedby={errors.email ? "email-error" : undefined}
  {...register("email", { required: "Введите почту" })}
/>
{errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}`),
    UL(
      "**`role=\"alert\"`** (или `aria-live`) заставляет скринридер озвучить сообщение сразу.",
      "**Обязательные поля**: `required` и пометка в тексте, а не только звёздочка.",
      "**Группы** (радио, чекбоксы) оборачивают в `fieldset` с `legend`.",
      "**Кнопка отправки** не должна быть `disabled` без объяснения: пользователю нужно увидеть причину.",
      "**`autocomplete`** уменьшает усилия при вводе."
    ),
    LK(["WAI: Forms", "https://www.w3.org/WAI/tutorials/forms/"], ["RHF: Accessibility", "https://react-hook-form.com/advanced-usage#AccessibilityA11y"])
  ],
  v: [
    ["Для чего `aria-describedby` у поля?", null, ["Связать поле с текстом ошибки или подсказки", "Задать размер", "Скрыть поле", "Подключить схему"], 0, "Скринридер прочитает описание."],
    ["Что делает `role=\"alert\"`?", null, ["Объявляет сообщение при появлении", "Скрывает элемент", "Блокирует форму", "Фокусирует поле"], 0, "Аналог `aria-live=\"assertive\"`."],
    ["Достаточно ли выделить ошибку красным?", null, ["Нет, нужен текст и программная связь", "Да", "Только на десктопе", "Только с иконкой"], 0, "Цвет недоступен части пользователей."],
    ["Чем обернуть группу радио-кнопок?", null, ["`fieldset` с `legend`", "`div` с классом", "`span`", "`section`"], 0, "Так группа получает имя."],
    ["Какой параметр RHF ставит фокус на первое поле с ошибкой?", null, ["`shouldFocusError`", "`autoFocus`", "`focusFirst`", "`mode`"], 0, "По умолчанию включён."],
    ["Заменяет ли `placeholder` метку поля?", null, ["Нет", "Да", "Только для email", "Только на мобильных"], 0, "Он исчезает при вводе."]
  ]
},
{
id: "q-rhf-12",
  q: "Когда стоит выбрать React Hook Form, а когда обойтись `useState`, Formik, TanStack Form или нативной формой с `FormData`?",
  o: ["Для всех форм подходит только React Hook Form", "RHF — для форм со многими полями и валидацией, где важна производительность; для 1–2 полей хватит `useState`, для простых — нативная форма с `FormData` и Server Actions", "Formik — единственный вариант для TypeScript", "`useState` всегда быстрее RHF на больших формах"],
  a: 1,
  e: "У controlled-форм на `useState` каждый ввод перерисовывает компонент. RHF основан на uncontrolled-полях и подписках. Для простой формы библиотека — лишняя зависимость; нативные `FormData`, `required` и серверная проверка часто достаточны.",
  d: [
    H("Выбор подхода"),
    UL(
      "**`useState`**: 1–3 поля, простая логика.",
      "**Нативная форма + `FormData`**: отправка на сервер, Server Actions, progressive enhancement.",
      "**React Hook Form**: много полей, динамические массивы, интеграция со схемами, минимум рендеров.",
      "**Formik**: controlled-подход, проще ментально, но больше рендеров и меньше развивается.",
      "**TanStack Form**: типобезопасный, headless, с акцентом на асинхронную валидацию и фреймворк-независимость.",
      "**Критерии выбора**: размер формы, требования к производительности, схема валидации, SSR и опыт команды."
    ),
    C(`// нативный вариант
async function action(formData: FormData) {
  "use server";
  const email = String(formData.get("email"));
  // проверка и сохранение
}
<form action={action}><input name="email" type="email" required /><button>Отправить</button></form>`),
    LK(["React Hook Form", "https://react-hook-form.com/"], ["TanStack Form", "https://tanstack.com/form/latest"])
  ],
  v: [
    ["Что обычно подходит для формы из двух полей?", null, ["`useState` или нативная форма", "Огромная библиотека форм", "Redux", "GraphQL"], 0, "Не усложняйте без нужды."],
    ["В чём основная идея RHF для производительности?", null, ["Uncontrolled-поля и подписки вместо рендера на каждый ввод", "Кеш в `localStorage`", "Виртуальный DOM", "Серверный рендеринг"], 0, "Поэтому форма не рендерится зря."],
    ["Что такое `FormData`?", null, ["Нативный объект с полями формы", "Хук React", "Класс Zod", "Тип TypeScript"], 0, "Получается из `<form>` и подходит для отправки."],
    ["Какая библиотека форм основана на controlled-подходе?", null, ["Formik", "RHF", "Нативная форма", "Ни одна"], 0, "Он перерисовывает чаще."],
    ["Что важно при выборе библиотеки форм?", null, ["Размер формы, схема валидации, производительность", "Цвет логотипа", "Популярность в соцсетях", "Название"], 0, "Критерии практические."],
    ["Можно ли отправить форму без JS?", null, ["Да, с нативным `action` и серверной обработкой", "Нет", "Только с RHF", "Только с Formik"], 0, "Это progressive enhancement."]
  ]
}
]);
