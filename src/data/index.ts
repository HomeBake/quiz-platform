/**
 * Точка входа данных. Порядок импортов важен: сначала темы, тесты и задачи,
 * затем документация и пулы вариантов, затем тематические блоки; в конце применяются
 * переписанные варианты ответов.
 */
import { applyFixes, DOCS, QUIZ, TASKS, VARS } from "./registry";

import "./quizzes";
import "./tasks";
import "./docs-js";
import "./docs-react";
import "./docs-next";
import "./practice-js";
import "./practice-react";
import "./practice-next";
import "./typescript";
import "./stores";
import "./react-hook-form";
import "./tanstack-query";
import "./rest";
import "./graphql";
import "./nodejs";
import "./jest";
import "./html";
import "./css";
import "./cicd";

applyFixes();

export { GROUPS, TOPICS } from "./topics";
export { DOCS, QUIZ, TASKS, VARS };
