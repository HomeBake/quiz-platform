# Frontend тренажёр

SPA на Vite + TypeScript: тесты с разбором, документация, «Закрепление» (6 вариантов на вопрос) и live-coding задачи с запуском кода.

## Команды

```bash
npm install
npm run dev        # dev-сервер, http://localhost:5173
npm run build      # проверка типов + production-сборка в dist/
npm run preview    # просмотр собранной версии, http://localhost:4173
npm run typecheck  # только tsc --noEmit
```

## Редактор кода

- **▶ Запустить код** (⌘/Ctrl + Enter) выполняет код из редактора как есть, показывает вывод `console.log/info/warn/error/debug`, ошибки, ждёт `setTimeout` и промисы. Поддерживается top-level `await`. **■ Стоп** прерывает выполнение, общий лимит — 5 с.
- **Запустить тесты** (⌘/Ctrl + Shift + Enter) прогоняет тесты задачи; при успехе задача отмечается решённой.

Код выполняется в Web Worker, доступа к DOM нет.

## Структура

```
index.html                 разметка-каркас
src/main.ts                точка входа
src/styles.css             стили
src/types.ts               общие типы
src/data/                  контент
  registry.ts              реестры QUIZ/TASKS/DOCS/VARS, конструкторы H/P/C/UL/LK/V/F/G, applyFixes
  helpers.ts               компактный формат K(topic, items)
  topics.ts                группы и темы
  quizzes.ts, tasks.ts     тесты и задачи (tasks.ts под @ts-nocheck: тела тестов — JS для воркера)
  docs-*.ts, practice-*.ts документация и пулы вариантов закрепления
  typescript.ts … cicd.ts  тематические блоки
  index.ts                 порядок загрузки данных
src/app/                   приложение: state, progress, practice, quiz, task, list, runner
src/worker/runner.worker.ts воркер: прогон тестов и свободный запуск
```

Прогресс хранится в `localStorage` под ключом `frontend-trainer-v1`.

## Как добавить контент

- Тест: добавить объект в `QUIZ.push(...)` в `src/data/quizzes.ts`, документацию — в `DOCS["id"]` в `docs-*.ts`, варианты закрепления — `V("id", [...])` в `practice-*.ts`.
- Задача: добавить в `TASKS.push(...)` в `src/data/tasks.ts` (поля `fnName`, `starter`, `solution`, `tests`).
- Тематический блок целиком (тест + документация + 6 вариантов) — через `K(topic, items)` как в `typescript.ts`.
- Новый файл данных нужно подключить в `src/data/index.ts`; порядок импортов важен.
