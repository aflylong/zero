import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { installAdapters } from "./adapters";
// Inject design tokens as CSS custom properties BEFORE stylesheets are loaded
// so `var(--si-...)` is already resolvable.
import "./styles/tokens";
import "./styles/global.scss";

async function bootstrap() {
  // Register runtime adapters (Tauri fs + notifications) BEFORE mounting,
  // so the shared store reads from the correct storage on first touch.
  await installAdapters();

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount("#app");
}

void bootstrap();
