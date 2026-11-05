import type { Answer, AppState } from "../types";

export const STORE_KEY = "frontend-trainer-v1";
export const LETTERS = ["А", "Б", "В", "Г", "Д", "Е", "Ж"];
export const RUN_TIMEOUT = 5000;

export const state: AppState = { answers: {}, code: {}, solved: {}, vars: {}, favs: {} };
try {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    Object.assign(state, JSON.parse(raw));
  }
} catch {
  // хранилище недоступно, работаем без сохранения
}
state.vars = state.vars || {};
state.favs = state.favs || {};

export const save = (): void => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

export const view = { topic: "all", kind: "all", onlyOpen: false };
export const drafts: Record<string, number[]> = {};
/** Для каких тестов показаны варианты ответа (до ответа они скрыты). */
export const shownOpts: Record<string, boolean> = {};
/** Какие блоки документации раскрыты (чтобы не схлопывались при перерисовке). */
export const docOpen: Record<string, boolean> = {};

/* ---------- helpers ---------- */
export const isNode = <T extends Node>(n: T | null): n is T => n !== null;
export const answerList = (a: Answer): number[] => (Array.isArray(a) ? a : [a]);

export const byId = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error("Не найден элемент #" + id);
  }
  return el as T;
};

export const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const rich = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

type Props = Record<string, unknown>;
export type Kid = Node | string | null | undefined | false | Kid[];

/** Мини-хелпер создания DOM-узлов: h("div", { class: "x", onclick }, ...children). */
export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...kids: Kid[]
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }
    if (key === "class") {
      node.className = String(value);
    } else if (key === "html") {
      node.innerHTML = String(value);
    } else if (key === "text") {
      node.textContent = String(value);
    } else if (key.startsWith("on")) {
      node.addEventListener(key.slice(2), value as EventListener);
    } else {
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  const add = (kid: Kid): void => {
    if (kid === null || kid === undefined || kid === false) {
      return;
    }
    if (Array.isArray(kid)) {
      kid.forEach(add);
    } else if (typeof kid === "string") {
      node.appendChild(document.createTextNode(kid));
    } else {
      node.appendChild(kid);
    }
  };
  kids.forEach(add);
  return node;
};

/** Кнопка «Показать/Скрыть варианты ответа». */
export const optsToggle = (shown: boolean, onToggle: () => void): HTMLButtonElement =>
  h("button", {
    type: "button",
    class: "btn opts-toggle",
    "aria-expanded": shown ? "true" : "false",
    text: shown ? "Скрыть варианты ответа" : "Показать варианты ответа",
    onclick: onToggle,
  });

export const hiddenNote = (): HTMLElement =>
  h("p", {
    class: "opts-hidden",
    text: "Варианты скрыты: сначала подумайте над ответом, потом нажмите кнопку.",
  });
