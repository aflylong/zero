// Types
export * from "./types/app";

// Pure utilities
export * from "./services/date";

// Runtime boundaries (host apps must register adapters before using the store)
export * from "./services/storage";
export * from "./services/notification";

// Static content
export { articleTitle, articleSourceUrl, articleSections } from "./content/article";
export {
  quotes,
  pickDailyQuote,
  pickRandomQuote,
  authoritativeQuotes,
  findAuthoritativeQuote,
} from "./content/quotes";
export type { Quote, AuthoritativeQuote } from "./content/quotes";
export {
  excavationQuestions,
  findExcavationQuestion,
} from "./content/excavationQuestions";
export type {
  ExcavationQuestion,
  ExcavationStage,
} from "./content/excavationQuestions";
export {
  dayPrompts,
  findDayPrompt,
  defaultTimedDayPrompts,
  defaultCommuteDayPrompts,
} from "./content/dayPrompts";
export type { DayPrompt, DayPromptKind } from "./content/dayPrompts";

// Store
export { useAppStore } from "./stores/useAppStore";
export type { AppStore } from "./stores/useAppStore";

// Design tokens
export * as tokens from "./design/tokens";
