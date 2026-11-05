/* ===== Компактный формат: вопрос + документация + 6 вариантов в одном объекте ===== */
import type { Answer, DocBlock } from "../types";
import { DOCS, QUIZ, V } from "./registry";

type VariantTuple = Parameters<typeof V>[1][number];

interface CompactItem {
  id: string;
  q: string;
  code?: string;
  /** Варианты ответов (порядок перемешивается детерминированно по id). */
  o: string[];
  /** Правильный ответ по исходному порядку `o`. */
  a: Answer;
  /** Разбор. */
  e: string;
  /** Документация. */
  d: DocBlock[];
  /** Пул вариантов закрепления. */
  v: VariantTuple[];
}

const kbPerm = (id: string, n: number): number[] => {
  let h = 2166136261;
  for (const ch of id) {
    h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  }
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx; // новая позиция i берёт старый вариант idx[i]
};

export const K = (topic: string, items: CompactItem[]): void =>
  items.forEach((it) => {
    const p = kbPerm(it.id, it.o.length);
    const options = p.map((old) => it.o[old]);
    const mapAns = (a: Answer): Answer =>
      Array.isArray(a) ? a.map((x) => p.indexOf(x)).sort((x, y) => x - y) : p.indexOf(a);
    QUIZ.push({ id: it.id, topic, q: it.q, code: it.code, options, answer: mapAns(it.a), explain: it.e });
    DOCS[it.id] = it.d;
    V(it.id, it.v);
  });
