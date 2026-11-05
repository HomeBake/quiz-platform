// @ts-nocheck — тела тестов выполняются в Web Worker как обычный JS и сериализуются через toString(), строгие типы здесь не нужны.
import { TASKS } from "./registry";

TASKS.push(
  {
    id: "t-once",
    topic: "closures",
    title: "once",
    fnName: "once",
    desc: "Реализуйте `once(fn)`. Возвращаемая функция вызывает `fn` только при первом вызове, а все следующие вызовы возвращают результат первого.",
    hint: "Нужны две переменные в замыкании: флаг «уже вызывали» и сохранённый результат. Не забудьте про `this` и аргументы.",
    starter: "function once(fn) {\n  // ваш код\n}\n",
    solution: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}
`,
    tests: [
      ["вызывает fn только один раз", (once, t) => {
        let n = 0;
        const f = once(() => ++n);
        f();
        f();
        f();
        t.eq(n, 1);
      }],
      ["возвращает результат первого вызова", (once, t) => {
        const f = once((a, b) => a + b);
        t.eq(f(1, 2), 3);
        t.eq(f(10, 20), 3);
      }],
      ["сохраняет this при вызове", (once, t) => {
        const o = { v: 5, f: once(function (x) { return this.v + x; }) };
        t.eq(o.f(1), 6);
      }],
      ["не вызывает fn повторно, если она вернула undefined", (once, t) => {
        let n = 0;
        const f = once(() => { n++; });
        f();
        f();
        t.eq(n, 1);
      }],
    ],
  },
  {
    id: "t-memoize",
    topic: "closures",
    title: "memoize",
    fnName: "memoize",
    desc: "Реализуйте `memoize(fn)`: функция кэширует результаты по набору аргументов и не вызывает `fn` повторно для тех же аргументов. Для ключа достаточно `JSON.stringify(args)`.",
    hint: "Хранилище — `Map` в замыкании. Проверяйте наличие ключа через `cache.has`, а не через truthy результата: функция может вернуть `0` или `undefined`.",
    starter: "function memoize(fn) {\n  // ваш код\n}\n",
    solution: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
`,
    tests: [
      ["кэширует результат по аргументу", (memoize, t) => {
        let n = 0;
        const sq = memoize((x) => { n++; return x * x; });
        t.eq(sq(4), 16);
        t.eq(sq(4), 16);
        t.eq(n, 1, "число вызовов fn");
        t.eq(sq(5), 25);
        t.eq(n, 2, "число вызовов fn после нового аргумента");
      }],
      ["учитывает все аргументы", (memoize, t) => {
        let n = 0;
        const add = memoize((a, b) => { n++; return a + b; });
        t.eq(add(1, 2), 3);
        t.eq(add(2, 1), 3);
        t.eq(add(1, 2), 3);
        t.eq(n, 2);
      }],
      ["кэширует falsy-результаты", (memoize, t) => {
        let n = 0;
        const zero = memoize(() => { n++; return 0; });
        zero();
        zero();
        t.eq(n, 1);
      }],
    ],
  },
  {
    id: "t-curry",
    topic: "arrays",
    title: "curry",
    fnName: "curry",
    desc: "Реализуйте `curry(fn)`. Каррированная функция принимает аргументы по одному или пачками и вызывает `fn`, когда набралось не меньше `fn.length` аргументов.",
    hint: "Если аргументов уже хватает, вызовите `fn`. Иначе верните новую функцию, которая добавит свои аргументы к накопленным и повторит проверку.",
    starter: "function curry(fn) {\n  // ваш код\n}\n",
    solution: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...next) => curried.apply(this, [...args, ...next]);
  };
}
`,
    tests: [
      ["curry(add)(1)(2)(3)", (curry, t) => {
        const add = (a, b, c) => a + b + c;
        t.eq(curry(add)(1)(2)(3), 6);
      }],
      ["curry(add)(1, 2)(3)", (curry, t) => {
        const add = (a, b, c) => a + b + c;
        t.eq(curry(add)(1, 2)(3), 6);
      }],
      ["curry(add)(1)(2, 3)", (curry, t) => {
        const add = (a, b, c) => a + b + c;
        t.eq(curry(add)(1)(2, 3), 6);
      }],
      ["curry(add)(1, 2, 3)", (curry, t) => {
        const add = (a, b, c) => a + b + c;
        t.eq(curry(add)(1, 2, 3), 6);
      }],
      ["промежуточную функцию можно переиспользовать", (curry, t) => {
        const add = (a, b, c) => a + b + c;
        const plus1 = curry(add)(1);
        t.eq(plus1(2)(3), 6);
        t.eq(plus1(5)(5), 11);
      }],
    ],
  },
  {
    id: "t-debounce",
    topic: "async",
    title: "debounce",
    fnName: "debounce",
    desc: "Реализуйте `debounce(fn, ms)`. Функция вызывается спустя `ms` миллисекунд после последнего обращения, с аргументами последнего обращения. Каждое новое обращение сбрасывает таймер.",
    hint: "Храните `timer` в замыкании. При каждом вызове сначала `clearTimeout(timer)`, потом новый `setTimeout`.",
    starter: "function debounce(fn, ms) {\n  // ваш код\n}\n",
    solution: `function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
`,
    tests: [
      ["не вызывает fn сразу", async (debounce, t) => {
        const calls = [];
        const d = debounce((x) => calls.push(x), 50);
        d(1);
        t.eq(calls.length, 0);
        await t.sleep(120);
      }],
      ["вызывает fn один раз с последними аргументами", async (debounce, t) => {
        const calls = [];
        const d = debounce((x) => calls.push(x), 50);
        d(1);
        d(2);
        d(3);
        await t.sleep(130);
        t.eq(calls, [3]);
      }],
      ["каждое обращение сбрасывает таймер", async (debounce, t) => {
        const calls = [];
        const d = debounce((x) => calls.push(x), 100);
        d(1);
        await t.sleep(40);
        d(2);
        await t.sleep(40);
        d(3);
        t.eq(calls.length, 0, "вызовов до паузы");
        await t.sleep(200);
        t.eq(calls, [3]);
      }],
      ["разнесённые во времени обращения срабатывают по отдельности", async (debounce, t) => {
        const calls = [];
        const d = debounce((x) => calls.push(x), 40);
        d("a");
        await t.sleep(100);
        d("b");
        await t.sleep(100);
        t.eq(calls, ["a", "b"]);
      }],
    ],
  },
  {
    id: "t-flatten",
    topic: "arrays",
    title: "flatten",
    fnName: "flatten",
    desc: "Реализуйте `flatten(arr)`: разворачивает массив любой вложенности в плоский. Исходный массив менять нельзя. Без `Array.prototype.flat`.",
    hint: "Рекурсия: если элемент — массив, разверните его и добавьте результат, иначе добавьте сам элемент. Проверка — `Array.isArray`.",
    starter: "function flatten(arr) {\n  // ваш код\n}\n",
    solution: `function flatten(arr) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return acc.concat(flatten(item));
    }
    acc.push(item);
    return acc;
  }, []);
}
`,
    tests: [
      ["разворачивает вложенные массивы", (flatten, t) => {
        t.eq(flatten([1, [2, [3, [4]]]]), [1, 2, 3, 4]);
      }],
      ["пустые массивы исчезают", (flatten, t) => {
        t.eq(flatten([[], [[]], 1]), [1]);
      }],
      ["не трогает объекты", (flatten, t) => {
        t.eq(flatten([{ a: 1 }, [2, { b: [3] }]]), [{ a: 1 }, 2, { b: [3] }]);
      }],
      ["не мутирует исходный массив", (flatten, t) => {
        const src = [1, [2, [3]]];
        flatten(src);
        t.eq(src, [1, [2, [3]]]);
      }],
    ],
  },
  {
    id: "t-isequal",
    topic: "types",
    title: "isEqual",
    fnName: "isEqual",
    desc: "Реализуйте `isEqual(a, b)` — глубокое сравнение значений. Должны поддерживаться примитивы, `NaN`, вложенные массивы и объекты. Порядок ключей в объекте не важен, порядок элементов в массиве важен.",
    hint: "Сначала быстрые случаи: `a === b` и оба `NaN`. Затем отсеките не-объекты и `null`, сравните тип «массив или объект» и количество ключей, после этого рекурсивно сравните значения.",
    starter: "function isEqual(a, b) {\n  // ваш код\n}\n",
    solution: `function isEqual(a, b) {
  if (a === b || (a !== a && b !== b)) {
    return true;
  }
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(b, key) && isEqual(a[key], b[key])
  );
}
`,
    tests: [
      ["примитивы", (isEqual, t) => {
        t.eq(isEqual(1, 1), true);
        t.eq(isEqual("a", "a"), true);
        t.eq(isEqual(1, "1"), false);
        t.eq(isEqual(null, undefined), false);
      }],
      ["NaN равен NaN", (isEqual, t) => {
        t.eq(isEqual(NaN, NaN), true);
      }],
      ["вложенные объекты", (isEqual, t) => {
        t.eq(isEqual({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 }), true);
        t.eq(isEqual({ a: { b: 1 } }, { a: { b: 2 } }), false);
      }],
      ["порядок элементов в массиве важен", (isEqual, t) => {
        t.eq(isEqual([1, 2, 3], [1, 2, 3]), true);
        t.eq(isEqual([1, 2, 3], [3, 2, 1]), false);
      }],
      ["лишние ключи", (isEqual, t) => {
        t.eq(isEqual({ a: 1 }, { a: 1, b: undefined }), false);
        t.eq(isEqual({ a: 1, b: 2 }, { a: 1 }), false);
      }],
      ["массив и объект — разные вещи", (isEqual, t) => {
        t.eq(isEqual([], {}), false);
        t.eq(isEqual(null, {}), false);
      }],
    ],
  },
  {
    id: "t-promiseall",
    topic: "async",
    title: "promiseAll",
    fnName: "promiseAll",
    desc: "Реализуйте `promiseAll(items)` — аналог `Promise.all` для массива. Результат — промис с массивом значений в исходном порядке. При первой ошибке промис отклоняется. В массиве могут быть не только промисы. Использовать `Promise.all` нельзя.",
    hint: "Оберните всё в `new Promise`. Заведите счётчик оставшихся. Каждое значение оберните в `Promise.resolve`, результат пишите по индексу, а не через `push`.",
    starter: "function promiseAll(items) {\n  // ваш код\n}\n",
    solution: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = [];
    let left = items.length;
    if (left === 0) {
      resolve(results);
      return;
    }
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;
        left -= 1;
        if (left === 0) {
          resolve(results);
        }
      }, reject);
    });
  });
}
`,
    tests: [
      ["возвращает промис", (promiseAll, t) => {
        t.ok(promiseAll([]) instanceof Promise, "результат должен быть Promise");
      }],
      ["пустой массив даёт []", async (promiseAll, t) => {
        t.eq(await promiseAll([]), []);
      }],
      ["сохраняет порядок, а не порядок завершения", async (promiseAll, t) => {
        const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
        t.eq(await promiseAll([delay(40, "a"), delay(5, "b"), "c"]), ["a", "b", "c"]);
      }],
      ["отклоняется при первой ошибке", async (promiseAll, t) => {
        const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
        let message = "промис не был отклонён";
        try {
          await promiseAll([delay(30, 1), Promise.reject(new Error("boom"))]);
        } catch (err) {
          message = err.message;
        }
        t.eq(message, "boom");
      }],
    ],
  },
  {
    id: "t-mybind",
    topic: "this",
    title: "myBind",
    fnName: "myBind",
    desc: "Реализуйте `myBind(fn, context, ...preset)` — аналог `fn.bind(context, ...preset)`. Возвращает функцию, которая вызывает `fn` с нужным `this` и аргументами `preset`, к которым добавлены новые.",
    hint: "Верните обычную функцию, внутри вызовите `fn.apply(context, [...preset, ...args])`.",
    starter: "function myBind(fn, context, ...preset) {\n  // ваш код\n}\n",
    solution: `function myBind(fn, context, ...preset) {
  return function (...args) {
    return fn.apply(context, [...preset, ...args]);
  };
}
`,
    tests: [
      ["привязывает this", (myBind, t) => {
        function getX() { return this.x; }
        t.eq(myBind(getX, { x: 7 })(), 7);
      }],
      ["частичное применение аргументов", (myBind, t) => {
        function sum(a, b, c) { return a + b + c; }
        t.eq(myBind(sum, null, 1, 2)(3), 6);
      }],
      ["call и apply не перебивают контекст", (myBind, t) => {
        function getX() { return this.x; }
        const bound = myBind(getX, { x: 1 });
        t.eq(bound.call({ x: 2 }), 1);
      }],
    ],
  },
  {
    id: "t-groupby",
    topic: "arrays",
    title: "groupBy",
    fnName: "groupBy",
    desc: "Реализуйте `groupBy(arr, keyFn)`. Возвращает объект, где ключ — результат `keyFn(item)`, а значение — массив элементов с этим ключом в исходном порядке.",
    hint: "`reduce` с пустым объектом в качестве начального значения. Если массива для ключа ещё нет — создайте.",
    starter: "function groupBy(arr, keyFn) {\n  // ваш код\n}\n",
    solution: `function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}
`,
    tests: [
      ["группирует числа по целой части", (groupBy, t) => {
        t.eq(groupBy([1.2, 1.5, 2.1], Math.floor), { 1: [1.2, 1.5], 2: [2.1] });
      }],
      ["группирует строки по длине", (groupBy, t) => {
        t.eq(groupBy(["a", "bb", "c", "dd", "eee"], (s) => s.length), {
          1: ["a", "c"],
          2: ["bb", "dd"],
          3: ["eee"],
        });
      }],
      ["пустой массив даёт {}", (groupBy, t) => {
        t.eq(groupBy([], (x) => x), {});
      }],
      ["работает с объектами", (groupBy, t) => {
        const users = [
          { name: "A", role: "dev" },
          { name: "B", role: "qa" },
          { name: "C", role: "dev" },
        ];
        t.eq(groupBy(users, (u) => u.role), {
          dev: [users[0], users[2]],
          qa: [users[1]],
        });
      }],
    ],
  },
  {
    id: "t-retry",
    topic: "async",
    title: "retry",
    fnName: "retry",
    desc: "Реализуйте `retry(fn, attempts)`. `fn` возвращает промис. Функция вызывает `fn` до успеха, но не больше `attempts` раз. Если все попытки неудачны, промис отклоняется с последней ошибкой.",
    hint: "Цикл `for` по числу попыток, внутри `try { return await fn() } catch`. Последнюю ошибку запоминайте и бросайте после цикла.",
    starter: "async function retry(fn, attempts) {\n  // ваш код\n}\n",
    solution: `async function retry(fn, attempts) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
`,
    tests: [
      ["успех с первой попытки", async (retry, t) => {
        let n = 0;
        const result = await retry(async () => { n++; return "ok"; }, 3);
        t.eq(result, "ok");
        t.eq(n, 1, "число вызовов fn");
      }],
      ["повторяет до успеха", async (retry, t) => {
        let n = 0;
        const result = await retry(async () => {
          n++;
          if (n < 3) {
            throw new Error("fail" + n);
          }
          return "done";
        }, 5);
        t.eq(result, "done");
        t.eq(n, 3, "число вызовов fn");
      }],
      ["после всех неудач отклоняется последней ошибкой", async (retry, t) => {
        let n = 0;
        let message = "промис не был отклонён";
        try {
          await retry(async () => { n++; throw new Error("e" + n); }, 3);
        } catch (err) {
          message = err.message;
        }
        t.eq(message, "e3");
        t.eq(n, 3, "число вызовов fn");
      }],
    ],
  },
  {
    id: "t-emitter",
    topic: "proto",
    title: "EventEmitter",
    fnName: "EventEmitter",
    desc: "Реализуйте класс `EventEmitter` с методами `on(event, handler)`, `off(event, handler)`, `once(event, handler)` и `emit(event, ...args)`. Обработчики вызываются в порядке подписки.",
    hint: "Храните `Map` из имени события в массив обработчиков. Для `once` подпишите обёртку, которая сначала отписывает себя, а потом вызывает исходный обработчик. Чтобы `off` умел снимать такой обработчик, запомните оригинал в свойстве обёртки.",
    starter: `class EventEmitter {
  on(event, handler) {}
  off(event, handler) {}
  once(event, handler) {}
  emit(event, ...args) {}
}
`,
    solution: `class EventEmitter {
  constructor() {
    this.handlers = new Map();
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
    return this;
  }

  off(event, handler) {
    const list = this.handlers.get(event) || [];
    this.handlers.set(
      event,
      list.filter((h) => h !== handler && h.original !== handler)
    );
    return this;
  }

  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    wrapper.original = handler;
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    const list = this.handlers.get(event) || [];
    [...list].forEach((handler) => handler(...args));
    return this;
  }
}
`,
    tests: [
      ["on + emit передают аргументы", (EventEmitter, t) => {
        const e = new EventEmitter();
        const got = [];
        e.on("x", (a, b) => got.push([a, b]));
        e.emit("x", 1, 2);
        t.eq(got, [[1, 2]]);
      }],
      ["обработчики вызываются в порядке подписки", (EventEmitter, t) => {
        const e = new EventEmitter();
        const order = [];
        e.on("x", () => order.push("first"));
        e.on("x", () => order.push("second"));
        e.emit("x");
        t.eq(order, ["first", "second"]);
      }],
      ["off снимает обработчик", (EventEmitter, t) => {
        const e = new EventEmitter();
        let n = 0;
        const h = () => n++;
        e.on("x", h);
        e.emit("x");
        e.off("x", h);
        e.emit("x");
        t.eq(n, 1);
      }],
      ["once срабатывает один раз", (EventEmitter, t) => {
        const e = new EventEmitter();
        let n = 0;
        e.once("x", () => n++);
        e.emit("x");
        e.emit("x");
        t.eq(n, 1);
      }],
      ["off снимает once-обработчик до срабатывания", (EventEmitter, t) => {
        const e = new EventEmitter();
        let n = 0;
        const h = () => n++;
        e.once("x", h);
        e.off("x", h);
        e.emit("x");
        t.eq(n, 0);
      }],
      ["emit без подписчиков не падает", (EventEmitter, t) => {
        const e = new EventEmitter();
        e.emit("nobody", 1, 2, 3);
        t.ok(true);
      }],
    ],
  },
  {
    id: "t-balanced",
    topic: "algo",
    title: "isBalanced",
    fnName: "isBalanced",
    desc: "Реализуйте `isBalanced(str)`: проверяет, что скобки `()`, `[]`, `{}` в строке расставлены правильно: каждая открывающая закрыта той же парой и в правильном порядке. Остальные символы игнорируются.",
    hint: "Стек. Открывающую скобку кладём, на закрывающей снимаем верхушку и сверяем пару. В конце стек должен быть пуст.",
    starter: "function isBalanced(str) {\n  // ваш код\n}\n",
    solution: `function isBalanced(str) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of str) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (stack.pop() !== pairs[ch]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}
`,
    tests: [
      ["корректные последовательности", (isBalanced, t) => {
        t.eq(isBalanced("()[]{}"), true);
        t.eq(isBalanced("{[()]}"), true);
      }],
      ["пустая строка", (isBalanced, t) => {
        t.eq(isBalanced(""), true);
      }],
      ["неверный порядок закрытия", (isBalanced, t) => {
        t.eq(isBalanced("([)]"), false);
      }],
      ["не хватает закрывающей", (isBalanced, t) => {
        t.eq(isBalanced("(("), false);
      }],
      ["лишняя закрывающая", (isBalanced, t) => {
        t.eq(isBalanced("())"), false);
        t.eq(isBalanced("]"), false);
      }],
      ["другие символы игнорируются", (isBalanced, t) => {
        t.eq(isBalanced("a(b[c]{d})e"), true);
        t.eq(isBalanced("a(b[c)]"), false);
      }],
    ],
  },
);

TASKS.push(
  {
    id: "t-reconcile",
    topic: "rrender",
    title: "reconcile",
    fnName: "reconcile",
    desc: "Реализуйте `reconcile(prev, next)`: `prev` и `next` — массивы объектов с полем `key`. Верните объект `{ created, removed, kept }`, где каждое поле — массив ключей. `created` — ключи, которых нет в `prev` (в порядке `next`), `removed` — ключи, которых нет в `next` (в порядке `prev`), `kept` — ключи, которые есть в обоих списках (в порядке `next`). Если в одном из списков есть повторяющийся ключ, бросьте `Error` с сообщением `Duplicate key: <ключ>`. Так React решает, что создать, что удалить, а что переиспользовать.",
    hint: "Постройте `Set` ключей для каждого списка (заодно проверьте дубликаты), затем три раза отфильтруйте списки.",
    starter: "function reconcile(prev, next) {\n  // ваш код\n}\n",
    solution: `function reconcile(prev, next) {
  const collect = (list) => {
    const keys = new Set();
    for (const { key } of list) {
      if (keys.has(key)) {
        throw new Error("Duplicate key: " + key);
      }
      keys.add(key);
    }
    return keys;
  };
  const prevKeys = collect(prev);
  const nextKeys = collect(next);
  return {
    created: next.filter((item) => !prevKeys.has(item.key)).map((item) => item.key),
    removed: prev.filter((item) => !nextKeys.has(item.key)).map((item) => item.key),
    kept: next.filter((item) => prevKeys.has(item.key)).map((item) => item.key),
  };
}
`,
    tests: [
      ["создание, удаление и сохранение", (reconcile, t) => {
        const prev = [{ key: "a" }, { key: "b" }, { key: "c" }];
        const next = [{ key: "b" }, { key: "c" }, { key: "d" }];
        t.eq(reconcile(prev, next), { created: ["d"], removed: ["a"], kept: ["b", "c"] });
      }],
      ["kept идёт в порядке next, removed в порядке prev", (reconcile, t) => {
        const prev = [{ key: "a" }, { key: "b" }, { key: "c" }];
        const next = [{ key: "c" }, { key: "a" }];
        t.eq(reconcile(prev, next), { created: [], removed: ["b"], kept: ["c", "a"] });
      }],
      ["пустые списки", (reconcile, t) => {
        t.eq(reconcile([], [{ key: 1 }, { key: 2 }]), { created: [1, 2], removed: [], kept: [] });
        t.eq(reconcile([{ key: 1 }], []), { created: [], removed: [1], kept: [] });
        t.eq(reconcile([], []), { created: [], removed: [], kept: [] });
      }],
      ["индексы в роли ключей: удаляется последняя позиция, а не первый элемент", (reconcile, t) => {
        const prev = [{ key: 0, v: "A" }, { key: 1, v: "B" }, { key: 2, v: "C" }];
        const next = [{ key: 0, v: "B" }, { key: 1, v: "C" }];
        t.eq(reconcile(prev, next), { created: [], removed: [2], kept: [0, 1] });
      }],
      ["дубликаты ключей — ошибка", (reconcile, t) => {
        let message = "ошибка не была брошена";
        try {
          reconcile([], [{ key: "x" }, { key: "x" }]);
        } catch (err) {
          message = err.message;
        }
        t.eq(message, "Duplicate key: x");
        message = "ошибка не была брошена";
        try {
          reconcile([{ key: 7 }, { key: 7 }], []);
        } catch (err) {
          message = err.message;
        }
        t.eq(message, "Duplicate key: 7");
      }],
    ],
  },
  {
    id: "t-batch",
    topic: "rstate",
    title: "createBatcher",
    fnName: "createBatcher",
    desc: "Реализуйте `createBatcher(initial, onRender)` — упрощённую модель батчинга состояния. Функция возвращает `{ get, set }`. `set(update)` принимает значение или функцию-обновлятор `(prev) => next`. Обновления не применяются сразу: они копятся, а в микрозадаче применяются по порядку к последнему отрендеренному состоянию, и `onRender` вызывается **один раз** с итоговым значением. Если итог равен предыдущему по `Object.is`, `onRender` не вызывается. `get()` возвращает последнее отрендеренное состояние (как значение `state` внутри обработчика: оно «снимок», а не живое).",
    hint: "Нужны очередь обновлений, флаг «флаш уже запланирован» и `queueMicrotask`. В флаше пройдите по очереди через `reduce`-подобный цикл, различая функции и значения.",
    starter: "function createBatcher(initial, onRender) {\n  // ваш код\n}\n",
    solution: `function createBatcher(initial, onRender) {
  let committed = initial;
  let queue = [];
  let scheduled = false;

  function flush() {
    scheduled = false;
    const updates = queue;
    queue = [];
    let next = committed;
    for (const update of updates) {
      next = typeof update === "function" ? update(next) : update;
    }
    if (Object.is(next, committed)) {
      return;
    }
    committed = next;
    onRender(committed);
  }

  return {
    get: () => committed,
    set(update) {
      queue.push(update);
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(flush);
      }
    },
  };
}
`,
    tests: [
      ["три обновления подряд дают один рендер", async (createBatcher, t) => {
        const renders = [];
        const b = createBatcher(0, (v) => renders.push(v));
        b.set((x) => x + 1);
        b.set((x) => x + 1);
        b.set((x) => x + 1);
        await t.sleep(0);
        t.eq(renders, [3]);
        t.eq(b.get(), 3);
      }],
      ["onRender не вызывается синхронно", async (createBatcher, t) => {
        const renders = [];
        const b = createBatcher(0, (v) => renders.push(v));
        b.set(5);
        t.eq(renders.length, 0, "рендеров сразу после set");
        t.eq(b.get(), 0, "get до рендера");
        await t.sleep(0);
        t.eq(renders, [5]);
      }],
      ["set(get() + 1) трижды даёт 1: get возвращает «снимок»", async (createBatcher, t) => {
        const renders = [];
        const b = createBatcher(0, (v) => renders.push(v));
        b.set(b.get() + 1);
        b.set(b.get() + 1);
        b.set(b.get() + 1);
        await t.sleep(0);
        t.eq(renders, [1]);
      }],
      ["значения и функции применяются по порядку", async (createBatcher, t) => {
        const renders = [];
        const b = createBatcher(0, (v) => renders.push(v));
        b.set(5);
        b.set((x) => x * 2);
        await t.sleep(0);
        b.set(100);
        b.set((x) => x + 1);
        await t.sleep(0);
        t.eq(renders, [10, 101]);
      }],
      ["равное состояние не вызывает рендер", async (createBatcher, t) => {
        const renders = [];
        const b = createBatcher(7, (v) => renders.push(v));
        b.set(7);
        b.set((x) => x);
        await t.sleep(0);
        t.eq(renders.length, 0);
      }],
      ["разные «тики» — разные рендеры", async (createBatcher, t) => {
        const renders = [];
        const b = createBatcher("a", (v) => renders.push(v));
        b.set("b");
        await t.sleep(0);
        b.set("c");
        await t.sleep(0);
        t.eq(renders, ["b", "c"]);
      }],
    ],
  },
  {
    id: "t-shallow",
    topic: "rmemo",
    title: "shallowEqual",
    fnName: "shallowEqual",
    desc: "Реализуйте `shallowEqual(a, b)` — поверхностное сравнение, как у `React.memo` для props. Значения равны, если совпадают по `Object.is`, либо это два объекта с одинаковым набором собственных ключей и значениями, равными по `Object.is`. Вложенные объекты рекурсивно **не** сравниваются. `null` и не-объекты сравниваются только через `Object.is`.",
    hint: "Сначала `Object.is(a, b)`. Затем отсеките не-объекты и `null`. Сравните количество ключей и для каждого ключа проверьте наличие в `b` и `Object.is` значений.",
    starter: "function shallowEqual(a, b) {\n  // ваш код\n}\n",
    solution: `function shallowEqual(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(b, key) && Object.is(a[key], b[key])
  );
}
`,
    tests: [
      ["примитивы сравниваются через Object.is", (shallowEqual, t) => {
        t.eq(shallowEqual(1, 1), true);
        t.eq(shallowEqual(1, 2), false);
        t.eq(shallowEqual(NaN, NaN), true);
        t.eq(shallowEqual(0, -0), false);
        t.eq(shallowEqual("a", "a"), true);
      }],
      ["порядок ключей не важен", (shallowEqual, t) => {
        t.eq(shallowEqual({ a: 1, b: "x" }, { b: "x", a: 1 }), true);
      }],
      ["разные значения или число ключей", (shallowEqual, t) => {
        t.eq(shallowEqual({ a: 1 }, { a: 2 }), false);
        t.eq(shallowEqual({ a: 1 }, { a: 1, b: 2 }), false);
        t.eq(shallowEqual({ a: 1, b: 2 }, { a: 1 }), false);
      }],
      ["ключ со значением undefined — не то же, что отсутствие ключа", (shallowEqual, t) => {
        t.eq(shallowEqual({ a: 1 }, { a: 1, b: undefined }), false);
        t.eq(shallowEqual({ a: 1, b: undefined }, { a: 1, c: undefined }), false);
      }],
      ["вложенные объекты сравниваются по ссылке", (shallowEqual, t) => {
        const inner = { x: 1 };
        t.eq(shallowEqual({ a: inner }, { a: inner }), true);
        t.eq(shallowEqual({ a: { x: 1 } }, { a: { x: 1 } }), false);
      }],
      ["null и не-объекты", (shallowEqual, t) => {
        t.eq(shallowEqual(null, null), true);
        t.eq(shallowEqual(null, {}), false);
        t.eq(shallowEqual({}, null), false);
        t.eq(shallowEqual(1, {}), false);
      }],
    ],
  },
  {
    id: "t-memoone",
    topic: "rmemo",
    title: "memoizeOne",
    fnName: "memoizeOne",
    desc: "Реализуйте `memoizeOne(fn)`: функция запоминает **только последний** вызов. Если количество аргументов и сами аргументы (каждый через `Object.is`) совпали с прошлым вызовом, верните прошлый результат, не вызывая `fn`. Иначе вызовите `fn`, запомните аргументы и результат. Так устроены `useMemo`, селекторы `reselect` и проверка зависимостей хуков.",
    hint: "Храните в замыкании последние аргументы, последний результат и флаг «уже вызывали»: результат может быть `undefined`. Сравнение: одинаковая длина и `every` с `Object.is`.",
    starter: "function memoizeOne(fn) {\n  // ваш код\n}\n",
    solution: `function memoizeOne(fn) {
  let hasLast = false;
  let lastArgs;
  let lastResult;
  return function (...args) {
    if (
      hasLast &&
      args.length === lastArgs.length &&
      args.every((arg, i) => Object.is(arg, lastArgs[i]))
    ) {
      return lastResult;
    }
    lastResult = fn.apply(this, args);
    lastArgs = args;
    hasLast = true;
    return lastResult;
  };
}
`,
    tests: [
      ["одинаковые аргументы не вызывают fn повторно", (memoizeOne, t) => {
        let n = 0;
        const sq = memoizeOne((x) => { n++; return x * x; });
        t.eq(sq(4), 16);
        t.eq(sq(4), 16);
        t.eq(n, 1);
      }],
      ["кэш хранит только последний вызов", (memoizeOne, t) => {
        let n = 0;
        const sq = memoizeOne((x) => { n++; return x * x; });
        sq(2);
        sq(3);
        sq(2);
        t.eq(n, 3, "число вызовов fn");
      }],
      ["учитывает порядок и количество аргументов", (memoizeOne, t) => {
        let n = 0;
        const f = memoizeOne((a, b) => { n++; return [a, b]; });
        f(1, 2);
        f(2, 1);
        t.eq(n, 2, "после смены порядка");
        f(2, 1, 3);
        t.eq(n, 3, "после добавления аргумента");
        f(1);
        f(1, undefined);
        t.eq(n, 5, "f(1) и f(1, undefined) — разные вызовы");
      }],
      ["объекты сравниваются по ссылке", (memoizeOne, t) => {
        let n = 0;
        const f = memoizeOne((o) => { n++; return o.a; });
        const o = { a: 1 };
        f(o);
        f(o);
        t.eq(n, 1, "та же ссылка");
        f({ a: 1 });
        f({ a: 1 });
        t.eq(n, 3, "новые литералы");
      }],
      ["NaN равен NaN, результат undefined тоже кэшируется", (memoizeOne, t) => {
        let n = 0;
        const f = memoizeOne(() => { n++; });
        f(NaN);
        f(NaN);
        t.eq(n, 1);
      }],
      ["передаёт this", (memoizeOne, t) => {
        const o = { k: 2, f: memoizeOne(function (x) { return this.k * x; }) };
        t.eq(o.f(5), 10);
      }],
    ],
  },
  {
    id: "t-store",
    topic: "rcontext",
    title: "createStore",
    fnName: "createStore",
    desc: "Реализуйте `createStore(reducer, initialState)` в духе Redux. Возвращает `{ getState, dispatch, subscribe }`. `dispatch(action)` вычисляет новое состояние как `reducer(state, action)`, сохраняет его и вызывает всех подписчиков (без аргументов, в порядке подписки), но **только если** состояние изменилось по `Object.is`. `dispatch` возвращает переданный `action`. `subscribe(listener)` возвращает функцию отписки. Именно такой контракт нужен `useSyncExternalStore`.",
    hint: "Храните `state` и массив `listeners`. При рассылке итерируйтесь по копии массива, чтобы отписка во время рассылки не нарушала обход.",
    starter: "function createStore(reducer, initialState) {\n  // ваш код\n}\n",
    solution: `function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = [];

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      const next = reducer(state, action);
      if (!Object.is(next, state)) {
        state = next;
        [...listeners].forEach((listener) => listener());
      }
      return action;
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
  };
}
`,
    tests: [
      ["начальное состояние и dispatch", (createStore, t) => {
        const reducer = (s, a) => (a.type === "inc" ? s + 1 : s);
        const store = createStore(reducer, 0);
        t.eq(store.getState(), 0);
        store.dispatch({ type: "inc" });
        store.dispatch({ type: "inc" });
        t.eq(store.getState(), 2);
      }],
      ["dispatch возвращает action", (createStore, t) => {
        const store = createStore((s) => s, 0);
        const action = { type: "x" };
        t.ok(store.dispatch(action) === action, "dispatch должен вернуть тот же action");
      }],
      ["подписчики вызываются в порядке подписки и видят новое состояние", (createStore, t) => {
        const store = createStore((s, a) => s + a.by, 0);
        const seen = [];
        store.subscribe(() => seen.push("first:" + store.getState()));
        store.subscribe(() => seen.push("second:" + store.getState()));
        store.dispatch({ by: 5 });
        t.eq(seen, ["first:5", "second:5"]);
      }],
      ["если состояние не изменилось, подписчики не вызываются", (createStore, t) => {
        const store = createStore((s, a) => (a.type === "noop" ? s : { ...s, n: s.n + 1 }), { n: 0 });
        let calls = 0;
        store.subscribe(() => calls++);
        store.dispatch({ type: "noop" });
        t.eq(calls, 0, "после noop");
        store.dispatch({ type: "inc" });
        t.eq(calls, 1, "после inc");
      }],
      ["отписка работает", (createStore, t) => {
        const store = createStore((s) => s + 1, 0);
        let calls = 0;
        const off = store.subscribe(() => calls++);
        store.dispatch({});
        off();
        store.dispatch({});
        t.eq(calls, 1);
      }],
      ["отписка во время рассылки не пропускает остальных", (createStore, t) => {
        const store = createStore((s) => s + 1, 0);
        const seen = [];
        const off = store.subscribe(() => {
          seen.push("a");
          off();
        });
        store.subscribe(() => seen.push("b"));
        store.dispatch({});
        store.dispatch({});
        t.eq(seen, ["a", "b", "b"]);
      }],
    ],
  },
  {
    id: "t-hooks",
    topic: "rhooks",
    title: "createComponent",
    fnName: "createComponent",
    desc: "Реализуйте `createComponent(renderFn)` — мини-модель хуков. `renderFn(useState)` получает функцию `useState` и возвращает результат рендера. `createComponent` возвращает `{ render, getOutput, getRenders }`. `render()` вызывает `renderFn` заново (сбросив счётчик хуков), запоминает результат и увеличивает счётчик рендеров. `useState(initial)` хранит состояние **по порядку вызова** (индекс слота), поддерживает ленивый инициализатор-функцию и возвращает `[value, setValue]`, где `setValue` принимает значение или функцию-обновлятор и, если значение изменилось по `Object.is`, синхронно перерисовывает компонент; `setValue` стабильна между рендерами. Если при повторном рендере вызвано больше хуков, чем в первом, бросьте `Error('Rendered more hooks than during the previous render.')`, а если меньше — `Error('Rendered fewer hooks than expected.')`.",
    hint: "Нужны массив слотов и переменная-индекс, обнуляемая в начале `render`. Количество хуков первого рендера запомните. Сеттер создавайте один раз при создании слота и замыкайте на нём.",
    starter: "function createComponent(renderFn) {\n  // ваш код\n}\n",
    solution: `function createComponent(renderFn) {
  const slots = [];
  let index = 0;
  let output;
  let renders = 0;
  let hookCount = null;

  function useState(initial) {
    const i = index++;
    if (i >= slots.length) {
      if (hookCount !== null) {
        throw new Error("Rendered more hooks than during the previous render.");
      }
      const slot = {
        value: typeof initial === "function" ? initial() : initial,
      };
      slot.set = (update) => {
        const next = typeof update === "function" ? update(slot.value) : update;
        if (Object.is(next, slot.value)) {
          return;
        }
        slot.value = next;
        render();
      };
      slots.push(slot);
    }
    return [slots[i].value, slots[i].set];
  }

  function render() {
    index = 0;
    renders += 1;
    output = renderFn(useState);
    if (hookCount === null) {
      hookCount = index;
    } else if (index < hookCount) {
      throw new Error("Rendered fewer hooks than expected.");
    }
    return output;
  }

  return {
    render,
    getOutput: () => output,
    getRenders: () => renders,
  };
}
`,
    tests: [
      ["первый рендер и начальное состояние", (createComponent, t) => {
        const c = createComponent((useState) => {
          const [n] = useState(0);
          return { n };
        });
        c.render();
        t.eq(c.getOutput(), { n: 0 });
        t.eq(c.getRenders(), 1);
      }],
      ["setValue перерисовывает компонент", (createComponent, t) => {
        let setN;
        const c = createComponent((useState) => {
          const [n, set] = useState(0);
          setN = set;
          return n;
        });
        c.render();
        setN(5);
        t.eq(c.getOutput(), 5);
        t.eq(c.getRenders(), 2);
      }],
      ["функциональное обновление", (createComponent, t) => {
        let setN;
        const c = createComponent((useState) => {
          const [n, set] = useState(0);
          setN = set;
          return n;
        });
        c.render();
        setN((x) => x + 1);
        setN((x) => x + 1);
        t.eq(c.getOutput(), 2);
      }],
      ["слоты определяются порядком вызова и независимы", (createComponent, t) => {
        let setA;
        let setB;
        const c = createComponent((useState) => {
          const [a, sa] = useState("a");
          const [b, sb] = useState("b");
          setA = sa;
          setB = sb;
          return a + b;
        });
        c.render();
        setA("x");
        t.eq(c.getOutput(), "xb");
        setB("y");
        t.eq(c.getOutput(), "xy");
      }],
      ["то же значение не вызывает рендер, setValue стабильна", (createComponent, t) => {
        const setters = [];
        const c = createComponent((useState) => {
          const [n, set] = useState(1);
          setters.push(set);
          return n;
        });
        c.render();
        setters[0](1);
        t.eq(c.getRenders(), 1, "после set того же значения");
        c.render();
        t.ok(setters[0] === setters[1], "setValue должна быть той же функцией");
      }],
      ["ленивый инициализатор вызывается один раз", (createComponent, t) => {
        let calls = 0;
        const c = createComponent((useState) => {
          const [n] = useState(() => {
            calls++;
            return 42;
          });
          return n;
        });
        c.render();
        c.render();
        c.render();
        t.eq(calls, 1, "вызовов инициализатора");
        t.eq(c.getOutput(), 42);
      }],
      ["нарушение порядка хуков — ошибка", (createComponent, t) => {
        let cond = false;
        const c = createComponent((useState) => {
          useState(0);
          if (cond) {
            useState(1);
          }
          return null;
        });
        c.render();
        cond = true;
        let message = "ошибка не была брошена";
        try {
          c.render();
        } catch (err) {
          message = err.message;
        }
        t.eq(message, "Rendered more hooks than during the previous render.");

        let cond2 = true;
        const d = createComponent((useState) => {
          useState(0);
          if (cond2) {
            useState(1);
          }
          return null;
        });
        d.render();
        cond2 = false;
        message = "ошибка не была брошена";
        try {
          d.render();
        } catch (err) {
          message = err.message;
        }
        t.eq(message, "Rendered fewer hooks than expected.");
      }],
    ],
  }
);

TASKS.push(
  {
    id: "t-nx-match",
    topic: "nrouting",
    title: "matchRoute",
    fnName: "matchRoute",
    desc: "Реализуйте `matchRoute(pattern, path)` — упрощённую модель файловой маршрутизации Next.js. `pattern` — путь к папке маршрута, например `/blog/[slug]`, `/docs/[...slug]`, `/docs/[[...slug]]`, `/(marketing)/about`. Верните объект с параметрами, если путь подходит, иначе `null`. Правила: статический сегмент должен совпасть буквально; `[name]` совпадает ровно с одним сегментом и даёт строку; `[...name]` совпадает с одним и более сегментами (массив строк), `[[...name]]` — с нулём и более (массив, возможно пустой). Catch-all может быть только последним сегментом. Сегменты в круглых скобках `(group)` в URL не участвуют и игнорируются в `pattern`. Начальный и конечный `/` не важны. Для статического маршрута вернуть `{}`.",
    hint: "Разбейте оба пути по `/`, отфильтруйте пустые строки, из `pattern` уберите сегменты вида `(...)`. Затем идите по сегментам шаблона: для catch-all заберите весь остаток пути и завершите сопоставление.",
    starter: "function matchRoute(pattern, path) {\n  // ваш код\n}\n",
    solution: `function matchRoute(pattern, path) {
  const split = (s) => s.split("/").filter(Boolean);
  const patternSegs = split(pattern).filter((seg) => !/^\\(.*\\)$/.test(seg));
  const pathSegs = split(path);
  const params = {};

  for (let i = 0; i < patternSegs.length; i++) {
    const seg = patternSegs[i];

    const optionalCatchAll = seg.match(/^\\[\\[\\.\\.\\.(\\w+)\\]\\]$/);
    if (optionalCatchAll) {
      params[optionalCatchAll[1]] = pathSegs.slice(i);
      return params;
    }

    const catchAll = seg.match(/^\\[\\.\\.\\.(\\w+)\\]$/);
    if (catchAll) {
      const rest = pathSegs.slice(i);
      if (rest.length === 0) {
        return null;
      }
      params[catchAll[1]] = rest;
      return params;
    }

    if (i >= pathSegs.length) {
      return null;
    }

    const dynamic = seg.match(/^\\[(\\w+)\\]$/);
    if (dynamic) {
      params[dynamic[1]] = pathSegs[i];
    } else if (seg !== pathSegs[i]) {
      return null;
    }
  }

  return pathSegs.length === patternSegs.length ? params : null;
}
`,
    tests: [
      ["статический маршрут", (matchRoute, t) => {
        t.eq(matchRoute("/about", "/about"), {});
        t.eq(matchRoute("/about", "/contact"), null);
        t.eq(matchRoute("/", "/"), {});
        t.eq(matchRoute("/about/team", "/about"), null);
        t.eq(matchRoute("/about", "/about/team"), null);
      }],
      ["динамический сегмент [slug]", (matchRoute, t) => {
        t.eq(matchRoute("/blog/[slug]", "/blog/hello"), { slug: "hello" });
        t.eq(matchRoute("/blog/[slug]", "/blog"), null);
        t.eq(matchRoute("/blog/[slug]", "/blog/a/b"), null);
        t.eq(matchRoute("/blog/[slug]", "/news/hello"), null);
      }],
      ["несколько динамических сегментов", (matchRoute, t) => {
        t.eq(matchRoute("/shop/[category]/[id]", "/shop/shoes/42"), { category: "shoes", id: "42" });
        t.eq(matchRoute("/shop/[category]/[id]", "/shop/shoes"), null);
      }],
      ["catch-all [...slug] требует один и более сегментов", (matchRoute, t) => {
        t.eq(matchRoute("/docs/[...slug]", "/docs/a/b/c"), { slug: ["a", "b", "c"] });
        t.eq(matchRoute("/docs/[...slug]", "/docs/a"), { slug: ["a"] });
        t.eq(matchRoute("/docs/[...slug]", "/docs"), null);
      }],
      ["optional catch-all [[...slug]] принимает ноль сегментов", (matchRoute, t) => {
        t.eq(matchRoute("/docs/[[...slug]]", "/docs"), { slug: [] });
        t.eq(matchRoute("/docs/[[...slug]]", "/docs/a/b"), { slug: ["a", "b"] });
        t.eq(matchRoute("/docs/[[...slug]]", "/other"), null);
      }],
      ["группы маршрутов (group) не участвуют в URL", (matchRoute, t) => {
        t.eq(matchRoute("/(marketing)/about", "/about"), {});
        t.eq(matchRoute("/(shop)/products/[id]", "/products/7"), { id: "7" });
      }],
      ["слэши в начале и в конце не важны", (matchRoute, t) => {
        t.eq(matchRoute("blog/[slug]/", "/blog/post/"), { slug: "post" });
      }],
    ],
  },
  {
    id: "t-nx-cache",
    topic: "nrender",
    title: "createCache",
    fnName: "createCache",
    desc: "Реализуйте `createCache(now)` — модель кэша Next.js: `use cache` + `cacheLife` + `cacheTag` + `revalidateTag`. `now` — функция, возвращающая текущее время в миллисекундах (по умолчанию `Date.now`). Возвращается объект `{ get, revalidateTag, size }`. `get(key, loader, options)` — асинхронная функция: если для `key` есть действующая запись, вернуть её значение, не вызывая `loader`; иначе вызвать `loader()`, сохранить результат и вернуть. `options.revalidate` — время жизни в **секундах** (если не задано, запись не истекает), `options.tags` — массив тегов. Запись истекает, когда `now()` достигает момента сохранения плюс время жизни. Параллельные вызовы `get` для одного ключа должны вызвать `loader` **один раз** и вернуть один результат. Если `loader` отклонён, результат не кэшируется, а ошибка пробрасывается. `revalidateTag(tag)` удаляет все записи с этим тегом. `size()` — число действующих (не истёкших) записей.",
    hint: "Нужны две Map: записи (`value`, `tags`, `expires`) и текущие ожидающие промисы (`inflight`). Запись действует, пока `expires > now()`. Чтобы запуск `loader` не сломал `inflight` при синхронной ошибке, создавайте промис через `Promise.resolve().then(loader)`.",
    starter: "function createCache(now = Date.now) {\n  // ваш код\n}\n",
    solution: `function createCache(now = Date.now) {
  const entries = new Map();
  const inflight = new Map();

  const isValid = (entry) => entry.expires > now();

  async function get(key, loader, options = {}) {
    const hit = entries.get(key);
    if (hit) {
      if (isValid(hit)) {
        return hit.value;
      }
      entries.delete(key);
    }
    if (inflight.has(key)) {
      return inflight.get(key);
    }
    const { revalidate, tags = [] } = options;
    const promise = Promise.resolve()
      .then(loader)
      .then((value) => {
        entries.set(key, {
          value,
          tags,
          expires: revalidate === undefined ? Infinity : now() + revalidate * 1000,
        });
        return value;
      })
      .finally(() => {
        inflight.delete(key);
      });
    inflight.set(key, promise);
    return promise;
  }

  function revalidateTag(tag) {
    for (const [key, entry] of entries) {
      if (entry.tags.includes(tag)) {
        entries.delete(key);
      }
    }
  }

  function size() {
    let count = 0;
    for (const entry of entries.values()) {
      if (isValid(entry)) {
        count += 1;
      }
    }
    return count;
  }

  return { get, revalidateTag, size };
}
`,
    tests: [
      ["второй вызов берёт значение из кэша", async (createCache, t) => {
        let calls = 0;
        const cache = createCache(() => 0);
        const loader = async () => { calls++; return "data"; };
        t.eq(await cache.get("k", loader), "data");
        t.eq(await cache.get("k", loader), "data");
        t.eq(calls, 1);
      }],
      ["разные ключи — разные записи", async (createCache, t) => {
        const cache = createCache(() => 0);
        t.eq(await cache.get("a", async () => 1), 1);
        t.eq(await cache.get("b", async () => 2), 2);
        t.eq(await cache.get("a", async () => 99), 1);
        t.eq(cache.size(), 2);
      }],
      ["время жизни (revalidate, в секундах)", async (createCache, t) => {
        let time = 0;
        let calls = 0;
        const cache = createCache(() => time);
        const loader = async () => ++calls;
        t.eq(await cache.get("k", loader, { revalidate: 10 }), 1);
        time = 9999;
        t.eq(await cache.get("k", loader, { revalidate: 10 }), 1, "за миллисекунду до конца");
        time = 10000;
        t.eq(await cache.get("k", loader, { revalidate: 10 }), 2, "ровно в момент истечения");
      }],
      ["без revalidate запись не истекает", async (createCache, t) => {
        let time = 0;
        let calls = 0;
        const cache = createCache(() => time);
        await cache.get("k", async () => ++calls);
        time = 1e12;
        await cache.get("k", async () => ++calls);
        t.eq(calls, 1);
      }],
      ["revalidateTag удаляет только записи с этим тегом", async (createCache, t) => {
        const counts = { posts1: 0, posts2: 0, users: 0 };
        const cache = createCache(() => 0);
        const mk = (name) => async () => ++counts[name];
        await cache.get("p1", mk("posts1"), { tags: ["posts"] });
        await cache.get("p2", mk("posts2"), { tags: ["posts", "home"] });
        await cache.get("u", mk("users"), { tags: ["users"] });
        cache.revalidateTag("posts");
        t.eq(cache.size(), 1, "после инвалидации");
        await cache.get("p1", mk("posts1"), { tags: ["posts"] });
        await cache.get("p2", mk("posts2"), { tags: ["posts", "home"] });
        await cache.get("u", mk("users"), { tags: ["users"] });
        t.eq(counts, { posts1: 2, posts2: 2, users: 1 });
      }],
      ["параллельные вызовы выполняют loader один раз", async (createCache, t) => {
        let calls = 0;
        const cache = createCache(() => 0);
        const loader = async () => { calls++; await t.sleep(5); return "x"; };
        const results = await Promise.all([cache.get("k", loader), cache.get("k", loader), cache.get("k", loader)]);
        t.eq(results, ["x", "x", "x"]);
        t.eq(calls, 1);
      }],
      ["ошибка loader не кэшируется", async (createCache, t) => {
        let calls = 0;
        const cache = createCache(() => 0);
        const loader = async () => {
          calls++;
          if (calls === 1) {
            throw new Error("fail");
          }
          return "ok";
        };
        let message = "ошибка не была брошена";
        try {
          await cache.get("k", loader);
        } catch (err) {
          message = err.message;
        }
        t.eq(message, "fail");
        t.eq(cache.size(), 0, "размер после ошибки");
        t.eq(await cache.get("k", loader), "ok");
        t.eq(calls, 2);
      }],
      ["size не считает истёкшие записи", async (createCache, t) => {
        let time = 0;
        const cache = createCache(() => time);
        await cache.get("a", async () => 1, { revalidate: 1 });
        await cache.get("b", async () => 2);
        t.eq(cache.size(), 2);
        time = 1000;
        t.eq(cache.size(), 1);
      }],
    ],
  }
);
