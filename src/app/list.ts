import { GROUPS, TOPICS } from "../data";
import { favItems, isDone, isFav, isQuizItem, itemsOf, topicMatches } from "./progress";
import { renderQuiz } from "./quiz";
import { byId, h, view } from "./state";
import { renderTask } from "./task";

/* ---------- list ---------- */
export const renderList = (): void => {
  const box = byId("list");
  const groups: HTMLElement[] = [];
  for (const topic of TOPICS) {
    if (!topicMatches(topic)) {
      continue;
    }
    let items = itemsOf(topic.id);
    if (view.kind === "quiz") {
      items = items.filter(isQuizItem);
    } else if (view.kind === "task") {
      items = items.filter((i) => !isQuizItem(i));
    }
    if (view.onlyOpen) {
      items = items.filter((i) => !isDone(i));
    }
    if (view.topic === "fav") {
      items = items.filter(isFav);
    }
    if (items.length === 0) {
      continue;
    }
    const done = items.filter(isDone).length;
    const groupTitle = GROUPS.find((g) => g.id === topic.group)?.title ?? "";
    groups.push(
      h(
        "section",
        { class: "group" },
        h(
          "h2",
          {},
          view.topic === "all" || view.topic === "fav" || view.topic.startsWith("g:")
            ? h("span", { class: "gtag", text: groupTitle })
            : null,
          topic.title,
          h("small", { text: done + " из " + items.length })
        ),
        h("div", { class: "cards" }, items.map((i) => (isQuizItem(i) ? renderQuiz(i) : renderTask(i))))
      )
    );
  }
  if (groups.length === 0) {
    const emptyFav = view.topic === "fav" && favItems().length === 0;
    box.replaceChildren(
      h("p", {
        class: "empty",
        text: emptyFav
          ? "В избранном пока пусто. Нажмите ☆ в правом верхнем углу любого вопроса или задачи, и он появится здесь."
          : "По этим фильтрам ничего нет. Снимите «Только нерешённые» или выберите другую тему.",
      })
    );
    return;
  }
  box.replaceChildren(...groups);
};
