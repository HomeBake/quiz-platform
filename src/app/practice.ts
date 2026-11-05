import { VARS } from "../data";
import type { Item, VariantProgress } from "../types";
import { answerList, byId, h, hiddenNote, isNode, LETTERS, optsToggle, rich, save, state } from "./state";

/* ---------- practice block ---------- */
interface PracticeState {
  k: number;
  perm: number[];
  draft: number[];
  sel: number[] | null;
  /** Показаны ли варианты ответа (до ответа скрыты). */
  show?: boolean;
}
export const pstate: Record<string, PracticeState> = {};
export const vstate = (id: string): VariantProgress => {
  if (!state.vars[id]) {
    state.vars[id] = { done: [], tries: 0, last: -1 };
  }
  return state.vars[id];
};
export const shuffled = (n: number): number[] => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const practiceTotals = () => {
  let total = 0;
  let done = 0;
  for (const id of Object.keys(VARS)) {
    total += VARS[id].length;
    const vs = state.vars[id];
    if (vs) {
      done += VARS[id].filter((_, i) => vs.done[i]).length;
    }
  }
  return { total, done };
};
export const refreshPracticeMeter = (): void => {
  const { total, done } = practiceTotals();
  byId("pmeter-num").textContent = done + " / " + total;
};
export const openVariant = (id: string, k: number): PracticeState => {
  const pool = VARS[id];
  return { k, perm: shuffled(pool[k].options.length), draft: [], sel: null };
};

export const renderPractice = (item: Item): HTMLElement | null => {
  const pool = VARS[item.id];
  if (!pool) {
    return null;
  }
  const root = h("section", { class: "practice", id: "pr-" + item.id, "aria-label": "Закрепление по теме" });

  const draw = (): void => {
    const vs = vstate(item.id);
    const ps = pstate[item.id];
    const doneCount = pool.filter((_, i) => vs.done[i]).length;
    const nodes: (HTMLElement | null)[] = [
      h(
        "div",
        { class: "p-head" },
        h("strong", { text: "Закрепление: другие вопросы по этой документации" }),
        h("span", { class: "p-count", text: "освоено " + doneCount + " из " + pool.length }),
        h("span", { class: "p-dots", "aria-hidden": "true" }, pool.map((_, i) => h("i", { class: vs.done[i] ? "on" : "" })))
      ),
    ];

    nodes.push(
      h(
        "div",
        { class: "seg p-seg", role: "group", "aria-label": "Выбор варианта вопроса" },
        pool.map((_, i) =>
          h("button", {
            type: "button",
            text: "Вариант " + (i + 1) + (vs.done[i] ? " ✓" : ""),
            "aria-pressed": ps && ps.k === i ? "true" : "false",
            onclick: () => {
              pstate[item.id] = openVariant(item.id, i);
              draw();
            },
          })
        )
      )
    );

    if (!ps) {
      nodes.push(
        h("p", {
          class: "p-note",
          text: "Перечитайте документацию выше и выберите вариант вопроса. Галочка означает, что вариант уже решён верно; к любому можно вернуться снова.",
        })
      );
      root.replaceChildren(...nodes.filter(isNode));
      return;
    }

    const qn = pool[ps.k];
    const multi = Array.isArray(qn.answer);
    const right = answerList(qn.answer);
    const sel = ps.sel;
    const answered = sel !== null;
    const isRightAt = (j: number): boolean => right.includes(ps.perm[j]);
    const picked = sel ?? ps.draft;
    const ok = sel !== null && sel.length === right.length && sel.every((j) => isRightAt(j));

    const finish = (sel: number[]): void => {
      ps.sel = sel;
      const good = sel.length === right.length && sel.every((j) => isRightAt(j));
      const v = vstate(item.id);
      v.tries += 1;
      v.last = ps.k;
      if (good) {
        v.done[ps.k] = true;
      }
      save();
      refreshPracticeMeter();
      draw();
    };

    const opts = ps.perm.map((orig, j) => {
      let cls = "opt";
      let mark = "";
      if (sel !== null) {
        const chosen = sel.includes(j);
        if (isRightAt(j) && chosen) {
          cls += " ok";
          mark = "верно";
        } else if (isRightAt(j)) {
          cls += " missed";
          mark = "верный вариант";
        } else if (chosen) {
          cls += " bad";
          mark = "неверно";
        }
      } else if (ps.draft.includes(j)) {
        cls += " picked";
      }
      return h(
        "button",
        {
          type: "button",
          class: cls,
          disabled: answered,
          "aria-pressed": answered ? null : picked.includes(j) ? "true" : "false",
          onclick: () => {
            if (multi) {
              const at = ps.draft.indexOf(j);
              if (at === -1) {
                ps.draft.push(j);
              } else {
                ps.draft.splice(at, 1);
              }
              draw();
              return;
            }
            finish([j]);
          },
        },
        h("span", { class: "letter", text: LETTERS[j] }),
        h("span", { html: rich(qn.options[orig]) }),
        h("span", { class: "mark", text: mark })
      );
    });

    const actions: HTMLElement[] = [];
    if (!answered && multi) {
      actions.push(h("button", {
        type: "button",
        class: "btn primary",
        text: "Проверить",
        disabled: ps.draft.length === 0,
        onclick: () => finish([...ps.draft].sort((a, b) => a - b)),
      }));
    }
    if (answered) {
      actions.push(h("button", {
        type: "button",
        class: "btn primary",
        text: ps.k + 1 < pool.length ? "Следующий вариант" : "Начать с варианта 1",
        onclick: () => {
          pstate[item.id] = openVariant(item.id, (ps.k + 1) % pool.length);
          draw();
        },
      }), h("button", {
        type: "button",
        class: "btn",
        text: "Повторить этот вариант",
        onclick: () => {
          pstate[item.id] = openVariant(item.id, ps.k);
          draw();
        },
      }));
    }

    nodes.push(
      h("div", { class: "card-head" },
        h("span", { class: "kind", text: multi ? "Вопрос · несколько ответов" : "Вопрос" }),
        answered ? h("span", { class: "chip " + (ok ? "ok" : "bad"), text: ok ? "Верно" : "Неверно" }) : null
      ),
      h("h3", { class: "q", html: rich(qn.q) }),
      qn.code ? h("pre", { class: "code" }, h("code", { text: qn.code })) : null,
      answered || ps.show
        ? h("div", { class: "opts", role: "group", "aria-label": "Варианты ответа" }, opts)
        : hiddenNote(),
      !answered
        ? optsToggle(Boolean(ps.show), () => {
            ps.show = !ps.show;
            draw();
          })
        : null,
      answered ? h("div", { class: "explain" }, h("b", { text: "Разбор" }), h("span", { html: rich(qn.explain) })) : null,
      actions.length ? h("div", { class: "actions" }, actions) : null
    );
    root.replaceChildren(...nodes.filter(isNode));
  };

  draw();
  return root;
};
