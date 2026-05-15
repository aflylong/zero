/**
 * Injects core design tokens into the document as CSS custom properties.
 * Runs once at module load so every component can consume them via `var(--si-...)`.
 */
import { tokens } from "@guiling/core";

function injectTokens() {
  if (typeof document === "undefined") return;
  const vars = tokens.buildCssVariables();
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

injectTokens();
