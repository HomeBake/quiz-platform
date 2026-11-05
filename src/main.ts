import "./styles.css";
import "./data";
import { renderList } from "./app/list";
import { pstate, refreshPracticeMeter } from "./app/practice";
import { refreshProgress, renderKinds } from "./app/progress";
import { byId, drafts, save, shownOpts, state, view } from "./app/state";

/* ---------- init ---------- */
byId<HTMLInputElement>("only-open").addEventListener("change", (e) => {
  view.onlyOpen = (e.target as HTMLInputElement).checked;
  renderList();
});

const resetBtn = byId("reset");
let resetTimer: ReturnType<typeof setTimeout> | undefined;
resetBtn.addEventListener("click", () => {
  if (!resetBtn.classList.contains("armed")) {
    resetBtn.classList.add("armed");
    resetBtn.textContent = "Нажмите ещё раз, чтобы сбросить всё";
    resetTimer = setTimeout(() => {
      resetBtn.classList.remove("armed");
      resetBtn.textContent = "Сбросить прогресс";
    }, 4000);
    return;
  }
  clearTimeout(resetTimer);
  state.answers = {};
  state.code = {};
  state.solved = {};
  state.vars = {};
  Object.keys(pstate).forEach((k) => delete pstate[k]);
  Object.keys(drafts).forEach((k) => delete drafts[k]);
  Object.keys(shownOpts).forEach((k) => delete shownOpts[k]);
  save();
  resetBtn.classList.remove("armed");
  resetBtn.textContent = "Сбросить прогресс";
  renderList();
  refreshProgress();
  refreshPracticeMeter();
});

renderKinds();
renderList();
refreshProgress();
refreshPracticeMeter();
