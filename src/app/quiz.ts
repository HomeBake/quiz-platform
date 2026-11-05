import type { QuizItem } from "../types";
import { favBtn, quizResult, refreshProgress, renderDoc } from "./progress";
import { renderPractice } from "./practice";
import {
  answerList,
  byId,
  drafts,
  h,
  hiddenNote,
  LETTERS,
  optsToggle,
  rich,
  save,
  shownOpts,
  state,
} from "./state";

/* ---------- quiz card ---------- */
export const renderQuiz = (q: QuizItem): HTMLElement => {
  const multi = Array.isArray(q.answer);
  const res = quizResult(q);
  const right = answerList(q.answer);
  if (!drafts[q.id]) {
    drafts[q.id] = [];
  }
  const draft = drafts[q.id];

  const rerender = (): void => {
    byId(q.id).replaceWith(renderQuiz(q));
    refreshProgress();
  };

  const opts = q.options.map((text, i) => {
    let cls = "opt";
    let mark = "";
    if (res) {
      const chosen = res.sel.includes(i);
      const isRight = right.includes(i);
      if (isRight && chosen) {
        cls += " ok";
        mark = "верно";
      } else if (isRight) {
        cls += " missed";
        mark = "верный вариант";
      } else if (chosen) {
        cls += " bad";
        mark = "неверно";
      }
    } else if (draft.includes(i)) {
      cls += " picked";
    }
    return h(
      "button",
      {
        type: "button",
        class: cls,
        disabled: Boolean(res),
        "aria-pressed": res ? null : draft.includes(i) ? "true" : "false",
        onclick: () => {
          if (multi) {
            const at = draft.indexOf(i);
            if (at === -1) {
              draft.push(i);
            } else {
              draft.splice(at, 1);
            }
            rerender();
            return;
          }
          state.answers[q.id] = [i];
          save();
          rerender();
        },
      },
      h("span", { class: "letter", text: LETTERS[i] }),
      h("span", { html: rich(text) }),
      h("span", { class: "mark", text: mark })
    );
  });

  let chip = null;
  if (res) {
    chip = h("span", { class: "chip " + (res.ok ? "ok" : "bad"), text: res.ok ? "Верно" : "Неверно" });
  }

  const actions = [];
  if (!res && multi) {
    actions.push(
      h("button", {
        type: "button",
        class: "btn primary",
        text: "Проверить",
        disabled: draft.length === 0,
        onclick: () => {
          state.answers[q.id] = [...draft].sort((a, b) => a - b);
          save();
          rerender();
        },
      })
    );
  }
  if (res) {
    actions.push(
      h("button", {
        type: "button",
        class: "btn",
        text: "Ещё раз",
        onclick: () => {
          delete state.answers[q.id];
          delete shownOpts[q.id];
          drafts[q.id] = [];
          save();
          rerender();
        },
      })
    );
  }

  return h(
    "article",
    { class: "card" + (res ? (res.ok ? " is-ok" : " is-bad") : ""), id: q.id },
    h(
      "div",
      { class: "card-head" },
      h("span", { class: "kind", text: multi ? "Тест · несколько ответов" : "Тест" }),
      h("span", { class: "head-r" }, favBtn(q.id), chip)
    ),
    renderDoc(q.id, "Документация: как это работает и почему", "можно прочитать до ответа"),
    h("h3", { class: "q", html: rich(q.q) }),
    q.code ? h("pre", { class: "code" }, h("code", { text: q.code })) : null,
    res || shownOpts[q.id]
      ? h("div", { class: "opts", role: "group", "aria-label": "Варианты ответа" }, opts)
      : hiddenNote(),
    !res
      ? optsToggle(Boolean(shownOpts[q.id]), () => {
          shownOpts[q.id] = !shownOpts[q.id];
          rerender();
        })
      : null,
    res ? h("div", { class: "explain" }, h("b", { text: "Разбор" }), h("span", { html: rich(q.explain) })) : null,
    actions.length ? h("div", { class: "actions" }, actions) : null,
    res ? renderPractice(q) : null
  );
};
