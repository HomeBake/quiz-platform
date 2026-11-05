import RunnerWorker from "../worker/runner.worker?worker";
import type { LogEntry, RunOutcome, TaskItem, WorkerMessage, WorkerRequest } from "../types";
import { h, RUN_TIMEOUT } from "./state";

/* ---------- запуск кода в Web Worker ---------- */

export interface RunHandle {
  promise: Promise<RunOutcome>;
  stop: () => void;
}

/**
 * Запускает воркер с заданной нагрузкой. Возвращает { promise, stop }:
 * promise всегда выполняется (не отклоняется) и отдаёт outcome, stop() прерывает работу.
 */
export const execInWorker = (payload: WorkerRequest, timeoutMs: number): RunHandle => {
  const outcome: RunOutcome = { results: [], logs: [], fatal: null, timedOut: false, stopped: false };
  let stop = (): void => {};
  const promise = new Promise<RunOutcome>((resolve) => {
    let worker: Worker;
    try {
      worker = new RunnerWorker();
    } catch (err) {
      outcome.fatal = "Web Worker недоступен в этом окружении: " + (err as Error).message;
      resolve(outcome);
      return;
    }
    let finished = false;
    const finish = (): void => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(outcome);
    };
    const timer = setTimeout(() => {
      outcome.timedOut = true;
      finish();
    }, timeoutMs);
    stop = () => {
      outcome.stopped = true;
      finish();
    };
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      if (msg.type === "result") {
        outcome.results[msg.index] = { type: "result", index: msg.index, ok: msg.ok, error: msg.error };
      } else if (msg.type === "log") {
        outcome.logs.push({ level: msg.level || "log", line: msg.line });
      } else if (msg.type === "fatal") {
        outcome.fatal = msg.message;
        finish();
      } else if (msg.type === "done") {
        finish();
      }
    };
    worker.onerror = (event) => {
      outcome.fatal = "Ошибка выполнения: " + (event.message || "неизвестная ошибка");
      finish();
    };
    worker.postMessage(payload);
  });
  return { promise, stop: () => stop() };
};

/** Прогон тестов задачи. */
export const runTests = (task: TaskItem, code: string): Promise<RunOutcome> =>
  execInWorker(
    {
      mode: "test",
      code,
      fnName: task.fnName,
      tests: task.tests.map(([name, fn]) => [name, fn.toString()]),
    },
    RUN_TIMEOUT
  ).promise;

/** Свободный запуск кода (как в консоли): без тестов, с выводом console.*. */
export const runFreeCode = (code: string): RunHandle =>
  execInWorker({ mode: "run", code }, RUN_TIMEOUT);

/** Вывод console.* с подсветкой уровней. */
export const renderLogs = (logs: LogEntry[], title: string): HTMLElement[] | null => {
  if (!logs.length) {
    return null;
  }
  return [
    h("h4", { text: title }),
    h(
      "pre",
      { class: "logs" },
      logs.map((entry) => h("span", { class: "log-line log-" + entry.level, text: entry.line + "\n" }))
    ),
  ];
};

export const renderOutcome = (
  task: TaskItem,
  outcome: RunOutcome
): { allOk: boolean; panel: HTMLElement } => {
  const total = task.tests.length;
  const passed = outcome.results.filter((r) => r && r.ok).length;
  const allOk = !outcome.fatal && !outcome.timedOut && passed === total;
  const nodes: (HTMLElement | HTMLElement[] | null)[] = [];

  if (outcome.fatal) {
    nodes.push(h("p", { class: "fatal", text: outcome.fatal }));
  }
  if (outcome.timedOut) {
    nodes.push(
      h("p", {
        class: "fatal",
        text:
          "Время вышло (" +
          RUN_TIMEOUT / 1000 +
          " с). Возможно, бесконечный цикл или промис, который никогда не завершается.",
      })
    );
  }
  if (!outcome.fatal) {
    nodes.push(
      h("p", {
        class: "summary " + (allOk ? "ok" : "bad"),
        text: allOk ? "Все тесты пройдены: " + passed + " из " + total : "Пройдено " + passed + " из " + total,
      })
    );
    nodes.push(
      h(
        "ul",
        { class: "tests" },
        task.tests.map(([name], i) => {
          const r = outcome.results[i];
          if (!r) {
            return h(
              "li",
              { class: "skip" },
              h("span", { class: "ic", text: "–" }),
              h("span", { text: name + " (не выполнен)" })
            );
          }
          if (r.ok) {
            return h("li", { class: "pass" }, h("span", { class: "ic", text: "✓" }), h("span", { text: name }));
          }
          return h(
            "li",
            { class: "fail" },
            h("span", { class: "ic", text: "✗" }),
            h("span", {}, name, h("span", { class: "err", text: r.error ?? "" }))
          );
        })
      )
    );
  }
  nodes.push(renderLogs(outcome.logs, "console"));
  return { allOk, panel: h("div", { class: "panel", "aria-live": "polite" }, nodes.flat()) };
};

/** Панель результата свободного запуска. */
export const renderRunOutcome = (outcome: RunOutcome): HTMLElement => {
  const nodes: (HTMLElement | HTMLElement[])[] = [];
  if (outcome.fatal) {
    nodes.push(h("p", { class: "fatal", text: outcome.fatal }));
  }
  if (outcome.timedOut) {
    nodes.push(
      h("p", {
        class: "fatal",
        text:
          "Остановлено по таймауту (" +
          RUN_TIMEOUT / 1000 +
          " с): бесконечный цикл, активный setInterval или промис, который не завершается.",
      })
    );
  }
  if (outcome.stopped) {
    nodes.push(h("p", { class: "fatal", text: "Выполнение остановлено." }));
  }
  const logs = renderLogs(outcome.logs, "Вывод кода");
  if (logs) {
    nodes.push(logs);
  } else if (!outcome.fatal && !outcome.timedOut && !outcome.stopped) {
    nodes.push(
      h("p", {
        class: "p-note",
        text: "Код выполнен, вывода нет. Добавьте console.log(...) или вызовите свою функцию, чтобы увидеть результат.",
      })
    );
  }
  return h("div", { class: "panel", "aria-live": "polite" }, nodes.flat());
};
