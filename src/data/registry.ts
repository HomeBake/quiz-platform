/**
 * Общие реестры и конструкторы данных. Файлы с контентом регистрируют сюда
 * тесты, задачи, документацию и варианты закрепления.
 */
import type { DocBlock, FixEntry, QuizItem, TaskItem, Variant } from "../types";

export const QUIZ: QuizItem[] = [];
export const TASKS: TaskItem[] = [];
export const DOCS: Record<string, DocBlock[]> = {};
export const VARS: Record<string, Variant[]> = {};
export const FIXES: [string, (FixEntry | null)[]][] = [];

// Ссылки на источники
export const MDN = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/";
export const JSI = "https://ru.javascript.info/";
export const SPEC = "https://tc39.es/ecma262/#";
export const RD = "https://react.dev/";

// Конструкторы блоков документации
export const H = (x: string): DocBlock => ({ t: "h", x });
export const P = (x: string): DocBlock => ({ t: "p", x });
export const C = (x: string): DocBlock => ({ t: "code", x });
export const UL = (...x: string[]): DocBlock => ({ t: "ul", x });
export const LK = (...x: [string, string][]): DocBlock => ({ t: "links", x });

/** Пул вариантов вопроса: [вопрос, код, варианты, ответ, разбор]. */
type VariantTuple = [
  q: string,
  code: string | null,
  options: string[],
  answer: number | number[],
  explain: string,
  ...rest: unknown[],
];
export const V = (id: string, list: VariantTuple[]): void => {
  VARS[id] = list.map(([q, code, options, answer, explain]) => ({ q, code, options, answer, explain }));
};

/** Переписанные варианты: F(id, [главный вопрос, вариант1..вариант6]). */
export const F = (id: string, list: (FixEntry | null)[]): void => {
  FIXES.push([id, list]);
};

interface FixSpec {
  M?: FixEntry;
  0?: FixEntry;
  1?: FixEntry;
  2?: FixEntry;
  3?: FixEntry;
  4?: FixEntry;
  5?: FixEntry;
}
export const G = (id: string, o: FixSpec): void => {
  F(id, [o.M || null, ...([0, 1, 2, 3, 4, 5] as const).map((k) => o[k] || null)]);
};

/* Применение переписанных вариантов с защитой от сдвига индексов:
   вариант с правкой переносится туда, к чему он по смыслу относится (по пересечению слов). */
const tokens = (s: string): Set<string> =>
  new Set(String(s).toLowerCase().match(/[a-zа-яё0-9_`]{3,}/g) || []);

const jaccard = (a: Set<string>, b: Set<string>): number => {
  let common = 0;
  for (const x of a) {
    if (b.has(x)) {
      common++;
    }
  }
  return common / (a.size + b.size - common || 1);
};

/** Применяет переписанные варианты ответов (вызывается после загрузки всего контента). */
export const applyFixes = (): void => {
  const origSig: Record<string, Set<string>[]> = {};
  Object.keys(VARS).forEach((id) => {
    origSig[id] = VARS[id].map((v) => tokens(v.options.join(" ") + " " + v.q));
  });

  FIXES.forEach(([id, list]) => {
    const [main, ...vs] = list;
    const q = QUIZ.find((x) => x.id === id);
    if (main && q) {
      q.options = main[0];
      if (main[1] !== null && main[1] !== undefined) {
        q.answer = main[1];
      }
    }
    vs.forEach((f, k) => {
      if (!f || !VARS[id] || !VARS[id][k]) {
        return;
      }
      const ft = tokens(f[0].join(" "));
      const scores = origSig[id].map((s) => jaccard(s, ft));
      let target = k;
      const best = scores.indexOf(Math.max(...scores));
      if (best !== k && scores[best] >= 0.2 && scores[best] > scores[k] + 0.1) {
        target = best;
      }
      VARS[id][target].options = f[0];
      VARS[id][target].answer = f[1] as number | number[];
    });
  });
};
