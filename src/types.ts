export interface Group {
  id: string;
  title: string;
}

export interface Topic {
  id: string;
  group: string;
  title: string;
}

/** Индекс правильного ответа или массив индексов (несколько ответов). */
export type Answer = number | number[];

export interface QuizItem {
  id: string;
  topic: string;
  q: string;
  code?: string;
  options: string[];
  answer: Answer;
  explain: string;
}

/** Утилиты теста, доступные внутри кода тестов (выполняются в воркере). */
export interface TestApi {
  eq(actual: unknown, expected: unknown, label?: string): void;
  ok(condition: unknown, label?: string): void;
  sleep(ms: number): Promise<void>;
}

// Тесты выполняются в воркере и сериализуются через toString(), поэтому типы свободные.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Проверяемая функция/класс: аргументы типизируем свободно, но колбэки получают контекстный тип.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => any;
type TestArg = Callback | string | number | boolean | bigint | symbol | object | null | undefined;
export interface TestTarget {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: TestArg[]): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: TestArg[]): any;
}
export type TestFn = (target: TestTarget, t: TestApi) => void | Promise<void>;
export type TestCase = [name: string, fn: TestFn];

export interface TaskItem {
  id: string;
  topic: string;
  title: string;
  fnName: string;
  desc: string;
  hint: string;
  starter: string;
  solution: string;
  tests: TestCase[];
}

export type Item = QuizItem | TaskItem;

export type DocBlock =
  | { t: "h"; x: string }
  | { t: "p"; x: string }
  | { t: "code"; x: string }
  | { t: "ul"; x: string[] }
  | { t: "links"; x: [string, string][] };

/** Вариант вопроса в блоке «Закрепление». */
export interface Variant {
  q: string;
  code?: string | null;
  options: string[];
  answer: Answer;
  explain: string;
}

/** Переписанные варианты ответов: [варианты, индекс ответа] или null. */
export type FixEntry = [options: string[], answer: Answer | null] | null;

/** Состояние освоения вариантов по заданию. */
export interface VariantProgress {
  done: boolean[];
  tries: number;
  last: number;
}

export interface AppState {
  answers: Record<string, number[]>;
  code: Record<string, string>;
  solved: Record<string, boolean>;
  vars: Record<string, VariantProgress>;
  /** Избранные тесты и задачи. */
  favs: Record<string, boolean>;
}

export type LogLevel = "log" | "info" | "warn" | "error" | "debug";

export interface LogEntry {
  level: LogLevel;
  line: string;
}

export interface TestResult {
  type: "result";
  index: number;
  ok: boolean;
  error?: string;
}

export interface RunOutcome {
  results: TestResult[];
  logs: LogEntry[];
  fatal: string | null;
  timedOut: boolean;
  stopped: boolean;
}

export type WorkerRequest =
  | { mode: "run"; code: string }
  | { mode: "test"; code: string; fnName: string; tests: [string, string][] };

export type WorkerMessage =
  | { type: "log"; level?: LogLevel; line: string }
  | { type: "result"; index: number; ok: boolean; error?: string }
  | { type: "fatal"; message: string }
  | { type: "done" };
