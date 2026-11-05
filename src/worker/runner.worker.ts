/// <reference lib="webworker" />
/* Воркер: прогон тестов задач и свободный запуск кода. Выполняется вне основного потока. */
import type { LogLevel, TestApi, WorkerMessage, WorkerRequest } from "../types";

declare const self: DedicatedWorkerGlobalScope;

const MAX_LOGS = 200;
const TEST_TIMEOUT = 1500;

const send = (msg: WorkerMessage): void => self.postMessage(msg);

const format = (value: unknown): string => {
  if (typeof value === "function") {
    return "ƒ " + (value.name || "anonymous");
  }
  if (typeof value === "undefined") {
    return "undefined";
  }
  if (typeof value === "symbol") {
    return value.toString();
  }
  if (typeof value === "bigint") {
    return value + "n";
  }
  if (value instanceof Error) {
    return value.name + ": " + value.message;
  }
  try {
    return JSON.stringify(value, (_key, item: unknown) => {
      if (typeof item === "number" && !Number.isFinite(item)) {
        return String(item);
      }
      if (typeof item === "undefined") {
        return "undefined";
      }
      if (typeof item === "function") {
        return "ƒ " + (item.name || "anonymous");
      }
      return item;
    });
  } catch {
    return String(value);
  }
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b || (a !== a && b !== b)) {
    return true;
  }
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(objB, key) && deepEqual(objA[key], objB[key])
  );
};

const t: TestApi = {
  eq(actual, expected, label) {
    if (!deepEqual(actual, expected)) {
      const prefix = label ? label + ": " : "";
      throw new Error(prefix + "ожидалось " + format(expected) + ", получено " + format(actual));
    }
  },
  ok(condition, label) {
    if (!condition) {
      throw new Error(label || "условие не выполнено");
    }
  },
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

const withTimeout = <T>(promise: Promise<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("тест не завершился за " + TEST_TIMEOUT + " мс")),
      TEST_TIMEOUT
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });

const errorText = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

if (typeof self.addEventListener === "function") {
  self.addEventListener("unhandledrejection", (event) => event.preventDefault());
}

type SandboxConsole = Record<LogLevel, (...args: unknown[]) => void>;
type TimerFn = (...args: unknown[]) => unknown;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

// Свободный запуск: выполняет код как есть и ждёт, пока завершатся таймеры.
const runFree = async (
  code: string,
  sandboxConsole: SandboxConsole,
  reportError: (err: unknown) => void
): Promise<void> => {
  const realSetTimeout = self.setTimeout.bind(self);
  const pending = new Set<number>();
  const guard = (fn: unknown, args: unknown[]): void => {
    try {
      const out = typeof fn === "function" ? (fn as TimerFn)(...args) : undefined;
      if (out && typeof (out as Promise<unknown>).then === "function") {
        (out as Promise<unknown>).then(undefined, reportError);
      }
    } catch (err) {
      reportError(err);
    }
  };
  const sandboxSetTimeout = (fn: unknown, ms?: number, ...args: unknown[]): number => {
    const id = realSetTimeout(() => {
      pending.delete(id);
      guard(fn, args);
    }, ms);
    pending.add(id);
    return id;
  };
  const sandboxSetInterval = (fn: unknown, ms?: number, ...args: unknown[]): number => {
    const id = self.setInterval(() => guard(fn, args), ms);
    pending.add(id);
    return id;
  };
  const sandboxClear = (id: number): void => {
    pending.delete(id);
    self.clearTimeout(id);
    self.clearInterval(id);
  };

  let body: (...args: unknown[]) => Promise<unknown>;
  try {
    body = new AsyncFunction(
      "console",
      "setTimeout",
      "setInterval",
      "clearTimeout",
      "clearInterval",
      code
    );
  } catch (err) {
    reportError(err);
    return;
  }
  try {
    await body(sandboxConsole, sandboxSetTimeout, sandboxSetInterval, sandboxClear, sandboxClear);
  } catch (err) {
    reportError(err);
  }
  // даём отработать микрозадачам и дожидаемся таймеров (интервалы остановит общий таймаут)
  await new Promise((resolve) => realSetTimeout(resolve, 0));
  while (pending.size > 0) {
    await new Promise((resolve) => realSetTimeout(resolve, 10));
  }
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  let logged = 0;
  const makeLog =
    (level: LogLevel) =>
    (...args: unknown[]): void => {
      if (logged >= MAX_LOGS) {
        return;
      }
      logged += 1;
      const line = args.map((a) => (typeof a === "string" ? a : format(a))).join(" ");
      send({ type: "log", level, line });
    };
  const sandboxConsole: SandboxConsole = {
    log: makeLog("log"),
    info: makeLog("info"),
    warn: makeLog("warn"),
    error: makeLog("error"),
    debug: makeLog("debug"),
  };

  if (request.mode === "run") {
    const reportError = (err: unknown): void => {
      const named = err as { name?: string; message?: string } | null;
      const text = named && named.name ? named.name + ": " + named.message : "Uncaught " + format(err);
      sandboxConsole.error(text);
    };
    self.addEventListener("unhandledrejection", (e) => reportError(e.reason));
    await runFree(request.code, sandboxConsole, reportError);
    send({ type: "done" });
    return;
  }

  const { code, fnName, tests } = request;
  let target: unknown;
  try {
    const body =
      code + "\n;return typeof " + fnName + ' === "undefined" ? undefined : ' + fnName + ";";
    target = new Function("console", body)(sandboxConsole);
  } catch (err) {
    const named = err as { name?: string; message?: string } | null;
    send({
      type: "fatal",
      message: "Ошибка в коде: " + (named && named.name) + ": " + (named && named.message),
    });
    return;
  }
  if (target === undefined) {
    send({
      type: "fatal",
      message: "Не найдена функция «" + fnName + "». Не переименовывайте её.",
    });
    return;
  }

  for (let i = 0; i < tests.length; i++) {
    const source = tests[i][1];
    try {
      const testFn = new Function("return " + source)() as (target: unknown, t: TestApi) => unknown;
      await withTimeout(Promise.resolve(testFn(target, t)));
      send({ type: "result", index: i, ok: true });
    } catch (err) {
      send({ type: "result", index: i, ok: false, error: errorText(err) });
    }
  }
  send({ type: "done" });
};
