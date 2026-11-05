import type { TaskItem } from "../types";
import { renderPractice } from "./practice";
import { favBtn, refreshProgress, renderDoc } from "./progress";
import { renderOutcome, renderRunOutcome, runFreeCode, runTests, type RunHandle } from "./runner";
import { h, isNode, rich, save, state } from "./state";

/* ---------- task card ---------- */
export const renderTask = (task: TaskItem): HTMLElement => {
  const card = h("article", { class: "card task" + (state.solved[task.id] ? " is-ok" : ""), id: task.id });
  const chipSlot = h("span");
  const resultSlot = h("div");
  const extraSlot = h("div");

  const setChip = () => {
    chipSlot.replaceChildren();
    if (state.solved[task.id]) {
      chipSlot.appendChild(h("span", { class: "chip ok", text: "Решено" }));
    }
  };
  setChip();

  const startLines = (state.code[task.id] ?? task.starter).split("\n").length;
  const editor = h("textarea", {
    class: "editor",
    id: "ed-" + task.id,
    spellcheck: "false",
    autocapitalize: "off",
    autocomplete: "off",
    rows: String(Math.max(8, startLines + 1)),
    "aria-label": "Редактор решения: " + task.title,
  });
  editor.value = state.code[task.id] ?? task.starter;

  let escaped = false;
  editor.addEventListener("input", () => {
    state.code[task.id] = editor.value;
    save();
  });
  editor.addEventListener("blur", () => {
    escaped = false;
  });
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      escaped = true;
      return;
    }
    if (e.key === "Tab" && !e.shiftKey && !escaped) {
      e.preventDefault();
      editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
      editor.dispatchEvent(new Event("input"));
      return;
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        run();
      } else {
        runCode();
      }
    }
  });

  const runBtn = h("button", { type: "button", class: "btn", text: "Запустить тесты", onclick: () => run() });
  const runCodeBtn = h("button", { type: "button", class: "btn primary", text: "▶ Запустить код", onclick: () => runCode() });
  const stopBtn = h("button", { type: "button", class: "btn", text: "■ Стоп", hidden: true });
  let activeRun: RunHandle | null = null;

  // Свободный запуск: выполняет код из редактора как есть и показывает вывод console.*.
  async function runCode(): Promise<void> {
    if (activeRun) {
      return;
    }
    const handle = runFreeCode(editor.value);
    activeRun = handle;
    runCodeBtn.disabled = true;
    runCodeBtn.textContent = "Выполняется…";
    stopBtn.hidden = false;
    stopBtn.onclick = () => handle.stop();
    const outcome = await handle.promise;
    activeRun = null;
    runCodeBtn.disabled = false;
    runCodeBtn.textContent = "▶ Запустить код";
    stopBtn.hidden = true;
    resultSlot.replaceChildren(renderRunOutcome(outcome));
  }

  async function run(): Promise<void> {
    runBtn.disabled = true;
    runBtn.textContent = "Выполняется…";
    const outcome = await runTests(task, editor.value);
    runBtn.disabled = false;
    runBtn.textContent = "Запустить тесты";
    const { allOk, panel } = renderOutcome(task, outcome);
    resultSlot.replaceChildren(panel);
    if (allOk && !state.solved[task.id]) {
      state.solved[task.id] = true;
      save();
      card.classList.add("is-ok");
      setChip();
      refreshProgress();
    }
  }

  const toggle = (label: string, build: () => HTMLElement) => {
    let open = false;
    const btn = h("button", {
      type: "button",
      class: "btn",
      text: label,
      "aria-expanded": "false",
      onclick: () => {
        open = !open;
        btn.setAttribute("aria-expanded", String(open));
        if (open) {
          btn.textContent = "Скрыть " + label.toLowerCase();
          extraSlot.replaceChildren(build());
        } else {
          btn.textContent = label;
          extraSlot.replaceChildren();
        }
      },
    });
    return btn;
  };

  const hintBtn = toggle("Подсказка", () =>
    h("div", { class: "panel" }, h("h4", { text: "Подсказка" }), h("span", { html: rich(task.hint) }))
  );
  const solutionBtn = toggle("Решение", () =>
    h("div", { class: "panel" }, h("h4", { text: "Эталонное решение" }), h("pre", { class: "code" }, h("code", { text: task.solution })))
  );
  const resetBtn = h("button", {
    type: "button",
    class: "btn",
    text: "Сбросить код",
    onclick: () => {
      editor.value = task.starter;
      delete state.code[task.id];
      save();
      resultSlot.replaceChildren();
    },
  });

  card.append(
    h(
      "div",
      { class: "card-head" },
      h("span", { class: "kind", text: "Задача · live coding" }),
      h("span", { class: "head-r" }, favBtn(task.id), chipSlot)
    ),
    renderDoc(task.id, "Документация и разбор решения", "внутри есть эталонное решение") ?? "",
    h("h3", {}, h("code", { text: task.title })),
    h("p", { class: "desc", html: rich(task.desc) }),
    h("div", { class: "sig" }, h("span", { text: "Тестов: " + task.tests.length }), h("span", { text: "Имя «" + task.fnName + "» менять нельзя" })),
    editor,
    h("div", { class: "actions" }, runCodeBtn, stopBtn, runBtn, hintBtn, solutionBtn, resetBtn, h("span", { class: "kbd", text: "⌘/Ctrl + Enter — запуск кода · +Shift — тесты · Esc, затем Tab выходит из редактора" })),
    extraSlot,
    resultSlot,
    ...[renderPractice(task)].filter(isNode)
  );
  return card;
};
