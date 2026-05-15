// Types
export * from "./types/app";

// Pure utilities
export * from "./services/date";

// Runtime boundaries (host apps must register adapters before using the store)
export * from "./services/storage";
export * from "./services/notification";

// Static content
export { articleTitle, articleSourceUrl, articleSections } from "./content/article";
export { quotes, pickDailyQuote, pickRandomQuote } from "./content/quotes";
export type { Quote } from "./content/quotes";

// Store
export { useAppStore } from "./stores/useAppStore";
export type { AppStore } from "./stores/useAppStore";

// Design tokens
export * as tokens from "./design/tokens";
