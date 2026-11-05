import { DOCS, GROUPS, QUIZ, TASKS, TOPICS } from "../data";
import type { Item, QuizItem, Topic } from "../types";
import { renderList } from "./list";
import { byId, docOpen, h, rich, save, state, view } from "./state";

export const isQuizItem = (item: Item): item is QuizItem => "options" in item;

/* ---------- progress ---------- */
export const quizResult = (q: QuizItem) => {
  const sel = state.answers[q.id];
  if (!sel) {
    return null;
  }
  const right = Array.isArray(q.answer) ? q.answer : [q.answer];
  const ok = sel.length === right.length && right.every((i) => sel.includes(i));
  return { sel, right, ok };
};
export const isDone = (item: Item): boolean => {
  if (isQuizItem(item)) {
    const res = quizResult(item);
    return Boolean(res && res.ok);
  }
  return Boolean(state.solved[item.id]);
};
export const itemsOf = (topicId: string): Item[] => [
  ...QUIZ.filter((q) => q.topic === topicId),
  ...TASKS.filter((t) => t.topic === topicId),
];
export const topicsOfGroup = (gid: string): Topic[] => TOPICS.filter((tp) => tp.group === gid);
export const itemsOfGroup = (gid: string): Item[] =>
  topicsOfGroup(gid).flatMap((tp) => itemsOf(tp.id));
export const topicMatches = (tp: Topic): boolean =>
  view.topic === "all" ||
  view.topic === tp.id ||
  (view.topic === "fav" && itemsOf(tp.id).some(isFav)) ||
  (view.topic.startsWith("g:") && view.topic === "g:" + tp.group);

/* ---------- favorites ---------- */
export const isFav = (item: Item): boolean => Boolean(state.favs[item.id]);
export const favItems = (): Item[] => [...QUIZ, ...TASKS].filter(isFav);

/** Кнопка-звёздочка «в избранное». */
export const favBtn = (id: string): HTMLButtonElement => {
  const btn = h("button", { type: "button", class: "fav-btn" });
  const paint = (): void => {
    const on = Boolean(state.favs[id]);
    btn.textContent = on ? "★" : "☆";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Убрать из избранного" : "Добавить в избранное");
    btn.title = on ? "Убрать из избранного" : "Добавить в избранное";
  };
  paint();
  btn.addEventListener("click", () => {
    if (state.favs[id]) {
      delete state.favs[id];
    } else {
      state.favs[id] = true;
    }
    save();
    paint();
    renderTopics();
    if (view.topic === "fav") {
      renderList();
    }
  });
  return btn;
};

export const refreshProgress = (): void => {
  const all: Item[] = [...QUIZ, ...TASKS];
  const done = all.filter(isDone).length;
  byId("meter-num").textContent = done + " / " + all.length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const bar = byId("meter-bar");
  bar.setAttribute("aria-valuenow", String(pct));
  (bar.firstElementChild as HTMLElement).style.width = pct + "%";
  renderTopics();
};

/* ---------- topics + filters ---------- */
export const renderTopics = (): void => {
  const box = byId("topics");
  const all: Item[] = [...QUIZ, ...TASKS];
  const mk = (id: string, title: string, items: Item[], extra?: string) => {
    const done = items.filter(isDone).length;
    return h(
      "button",
      {
        type: "button",
        class: "topic" + (extra ? " " + extra : ""),
        "aria-current": view.topic === id ? "true" : "false",
        onclick: () => {
          view.topic = id;
          renderTopics();
          renderList();
        },
      },
      h("span", { text: title }),
      h("span", { class: "cnt", text: done + "/" + items.length })
    );
  };
  box.replaceChildren(
    h("p", { class: "side-title", text: "Темы" }),
    mk("all", "Все темы", all),
    h(
      "button",
      {
        type: "button",
        class: "topic fav",
        id: "fav-topic",
        "aria-current": view.topic === "fav" ? "true" : "false",
        onclick: () => {
          view.topic = "fav";
          renderTopics();
          renderList();
        },
      },
      h("span", { text: "★ Избранное" }),
      h("span", { class: "cnt", text: String(favItems().length) })
    ),
    ...GROUPS.map((g) =>
      h(
        "div",
        { class: "tgroup", role: "group", "aria-label": g.title },
        mk("g:" + g.id, g.title, itemsOfGroup(g.id), "grp"),
        ...(topicsOfGroup(g.id).length > 1 ? topicsOfGroup(g.id).map((tp) => mk(tp.id, tp.title, itemsOf(tp.id), "sub")) : [])
      )
    )
  );
};

export const renderKinds = (): void => {
  const box = byId("kinds");
  const defs: [string, string][] = [
    ["all", "Все"],
    ["quiz", "Тесты"],
    ["task", "Задачи"],
  ];
  box.replaceChildren(
    ...defs.map(([id, label]) =>
      h("button", {
        type: "button",
        text: label,
        "aria-pressed": view.kind === id ? "true" : "false",
        onclick: () => {
          view.kind = id;
          renderKinds();
          renderList();
        },
      })
    )
  );
};

/* ---------- documentation block ---------- */
export const renderDoc = (id: string, label: string, hint?: string): HTMLElement | null => {
  const blocks = DOCS[id];
  if (!blocks) {
    return null;
  }
  const body = blocks.map((b) => {
    if (b.t === "h") {
      return h("h4", { class: "doc-h", html: rich(b.x) });
    }
    if (b.t === "p") {
      return h("p", { html: rich(b.x) });
    }
    if (b.t === "code") {
      return h("pre", { class: "code" }, h("code", { text: b.x }));
    }
    if (b.t === "ul") {
      return h("ul", {}, b.x.map((item) => h("li", { html: rich(item) })));
    }
    if (b.t === "links") {
      return h(
        "div",
        { class: "doc-links" },
        h("h4", { class: "doc-h", text: "Источники и что почитать дальше" }),
        h(
          "ul",
          {},
          b.x.map(([title, url]) =>
            h("li", {}, h("a", { href: url, target: "_blank", rel: "noopener noreferrer", text: title }))
          )
        )
      );
    }
    return null;
  });
  const det = h(
    "details",
    { class: "doc" },
    h("summary", {}, label, hint ? h("span", { class: "doc-hint", text: " · " + hint }) : null),
    h("div", { class: "doc-body" }, body)
  );
  det.open = Boolean(docOpen[id]);
  det.addEventListener("toggle", () => {
    docOpen[id] = det.open;
  });
  return det;
};
