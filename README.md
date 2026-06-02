# 归零 RE:ZERO 项目说明

更新时间: 2026-06-01

## 项目定位

`归零 RE:ZERO` 是一个个人成长/自我校准工具，核心文案和流程来自文章《如何在一天内重塑你的人生》。应用把一套“一天内重启”的流程拆成可操作的产品体验:

- 早晨: 15 道“心理开掘”问题，先看清不满、反愿景和最小愿景。
- 白天: 6 个固定时间点 + 3 个通勤/散步反思题，用提醒打断自动驾驶。
- 晚上: 轻量 3 件事回顾，必要时展开完整 5 步校准。
- 日常: 用“每日动作”、今日观察、提醒处理和记录页形成持续反馈。

项目目前是一个 pnpm monorepo，包含共享核心包、Tauri 桌面端和 uni-app 小程序端。

## 技术栈

- 包管理: `pnpm@11.1.1`
- 前端框架: Vue 3 + TypeScript + SCSS
- 桌面端: Tauri 2 + Vite 6 + Vue Router + lucide-vue-next
- 小程序端: uni-app + Vite 5
- 共享核心: `packages/core`，暴露类型、内容、状态 store、设计 token 和运行时 adapter 边界

## 目录结构

```text
.
├─ package.json
├─ pnpm-workspace.yaml
├─ packages/
│  └─ core/
│     ├─ src/types/app.ts
│     ├─ src/stores/useAppStore.ts
│     ├─ src/services/
│     ├─ src/content/
│     └─ src/design/tokens.ts
├─ apps/
│  ├─ desktop/
│  │  ├─ src/
│  │  └─ src-tauri/
│  └─ wechat-uniapp/
│     └─ src/
└─ scripts/
```

核心职责:

- `packages/core/src/types/app.ts`: 全局业务数据结构，几乎所有页面都围绕这里的类型工作。
- `packages/core/src/stores/useAppStore.ts`: 桌面端共享业务状态和动作，包含初始化、迁移、持久化、提醒刷新、记录统计、导入导出等。
- `packages/core/src/content`: 原文、早晨问题、白天问题、引语内容库。
- `packages/core/src/services/storage.ts`: 运行时无关的 storage adapter 边界。
- `packages/core/src/services/notification.ts`: 运行时无关的 notification adapter 边界。
- `packages/core/src/design/tokens.ts`: 桌面端 CSS 变量来源。
- `apps/desktop/src`: 桌面端 Vue 应用。
- `apps/desktop/src-tauri`: Tauri 配置、Rust 壳、权限和图标。
- `apps/wechat-uniapp/src`: 小程序端 uni-app 应用。
- `scripts/rename-text.ps1`: v0.3.0 术语批量替换脚本，会跳过原文 `article.ts`。

## 运行命令

在项目根目录执行:

```bash
pnpm install
pnpm dev:desktop
pnpm build:desktop
pnpm tauri:dev
pnpm tauri:build
pnpm build:core
pnpm typecheck
```

桌面端单独执行:

```bash
pnpm --filter @guiling/desktop dev
pnpm --filter @guiling/desktop build
pnpm --filter @guiling/desktop tauri:dev
pnpm --filter @guiling/desktop tauri:build
```

小程序端单独执行:

```bash
pnpm --filter guiling-miniapp dev:h5
pnpm --filter guiling-miniapp dev:mp-weixin
pnpm --filter guiling-miniapp build:mp-weixin
pnpm --filter guiling-miniapp type-check
```

## 架构总览

### 共享 core

`@guiling/core` 是桌面端的业务核心。它不直接依赖 Tauri、浏览器 localStorage 或 uni API，而是通过 adapter 注入宿主能力。

启动顺序:

1. `apps/desktop/src/main.ts` 调用 `installAdapters()`。
2. `installAdapters()` 初始化 Tauri storage，并注册 storage / notification adapter。
3. Vue app 挂载。
4. 页面或路由首次调用 `useAppStore()` 时，store 从 adapter 读取 `guiling:v1` 数据。

store 内部状态:

- `ready`: 是否已完成初始化。
- `data`: 完整 AppData。
- `activeDateKey`: 当前日期，格式 `YYYY-MM-DD`。
- `pendingReminderPrompts`: 当前已到期但还未处理的提醒。
- `recordWindowEndDateKey`: 记录页热力图/窗口统计的结束日期。

### 桌面端

桌面端使用 `@guiling/core`，并提供 Tauri/Web fallback adapter。

- `apps/desktop/src/main.ts`: 注入 adapter，挂载 Vue。
- `apps/desktop/src/App.vue`: 左侧导航 + 主内容区 + 全局 in-app banner，并启动提醒调度。
- `apps/desktop/src/router/index.ts`: hash 路由和首次启动软引导。
- `apps/desktop/src/adapters/tauriStorage.ts`: Tauri AppData JSON 持久化，浏览器开发时回退到 localStorage。
- `apps/desktop/src/adapters/tauriNotification.ts`: Tauri OS 通知、Web Notification fallback、铃声和窗口抢焦点。
- `apps/desktop/src/services/reminderScheduler.ts`: 每 30 秒扫描到期提醒，并用 `notifiedReminderIds` 做当天去重。

### 小程序端

小程序端不是直接引用 `@guiling/core`，而是在 `apps/wechat-uniapp/src` 下维护了一套本地副本:

- `apps/wechat-uniapp/src/stores/useAppStore.ts`: core store 的小程序版副本。
- `apps/wechat-uniapp/src/types/app.ts`: 类型副本。
- `apps/wechat-uniapp/src/static/content`: 内容库副本。
- `apps/wechat-uniapp/src/services/storage.ts`: 使用 `uni.getStorageSync` / `uni.setStorageSync`。

这意味着改业务模型、内容题库、store 行为时，需要同时检查桌面端 core 和小程序端副本是否要同步。

## 关键数据模型

主数据对象是 `AppData`，持久化键为 `guiling:v1`。

主要字段:

- `onboardingCompleted`: 是否做过快速设置。
- `journeyCompleted`: 是否完整跑过“一天流程”。
- `articleProgress`: 原文阅读进度和章节笔记。
- `morningExcavation`: 早晨 15 题进度与答案。
- `nightSynthesisByDate`: 按日期保存的晚上回顾/完整校准。
- `visionProfile`: 愿景、反愿景、一年方向、月项目、约束。
- `identityProfile`: 身份声明、旧身份、原则、身份阶段。
- `proofRules`: 每日动作。
- `reminderRules`: 提醒规则。
- `dailyPlans`: 每天生成的方向快照。
- `dailySnapshots`: 每日完成情况、今日观察、提醒处理、白天回答。
- `actionLogs`: 行为日志。
- `goalHistory`: 已结束的一年目标/月项目记录。
- `notificationPreferences`: 通知、铃声、抢前台、in-app banner 偏好。

重要派生逻辑:

- `ensureDay(dateKey)`: 确保某天存在 `DailyPlan` 和 `DailySnapshot`。
- `autoAlignment(dateKey)`: 自动计算“今日推进度”。
- `refreshReminderPrompts(now)`: 计算当前到期提醒。
- `getRecordWindow()` / `getRecordSummary()` / `getRecordDetail()`: 记录页数据。
- `saveNightSynthesis()`: 保存轻量或完整晚上回顾。
- `promoteTomorrowBlocks()`: 把晚上回顾里的明日时间段升格成每日动作。
- `mergeWithDefaults()`: 数据迁移和默认值补齐。

推进度计算:

- 50% 来自每日动作完成比例。
- 30% 来自启用提醒中已处理比例，`complete` 和 `skip` 都算“看见过”。
- 10% 来自今日观察是否填写。
- 10% 来自当日晚上回顾是否有实质内容。

## 业务流程

### 首次进入

桌面端路由守卫采用“软引导”:

- 如果没有做过 onboarding、没有完成 journey、也没有启动过早晨问题，则跳到 `welcome`。
- 已经开始过任一流程后，不再被 welcome 拦截。
- 原文阅读、隐私页和 journey 页面可以在首次状态下访问。

小程序端对应入口是 `pages/start/index`。

### 快速设置 onboarding

位置:

- 桌面端: `apps/desktop/src/pages/OnboardingPage.vue`
- 小程序端: `apps/wechat-uniapp/src/pages/onboarding/index.vue`

作用:

- 收集愿景/反愿景、身份/旧身份、一年方向、月项目。
- 生成默认每日动作。
- 生成默认提醒规则，包括白天 6 题和通勤 3 题。
- 调用 `store.completeOnboarding()` 标记完成。

### 一天流程 journey

早晨:

- 桌面端: `JourneyMorningPage.vue`
- 小程序端: `journey-morning/index.vue`
- 内容来自 `excavationQuestions`，共 15 题。
- Q5/Q6/Q7 会回写反愿景叙事字段。
- Q12/Q14 会回写愿景字段。
- Q13 会回写身份声明。
- 全部 15 题完成后，`journeyCompleted = true`，身份阶段可从 `dissonance` 推进到 `uncertainty`。

白天:

- 桌面端: `JourneyDayPage.vue`
- 小程序端: `journey-day/index.vue`
- 内容来自 `dayPrompts`，共 9 题。
- 回答保存到当天 `dailySnapshots[dateKey].dayPromptResponses`。

晚上:

- 桌面端: `JourneyNightPage.vue`
- 小程序端: `journey-night/index.vue`
- 默认是轻量回顾，保存 `dailyHighlight`、`dailySummary`、`tomorrowBlocks`。
- 完整校准会保存 N1-N5，回写愿景/反愿景，可能推进身份阶段到 `discovery`。
- `tomorrowBlocks` 可通过 `promoteTomorrowBlocks()` 转成每日动作。

### 今日页

位置:

- 桌面端: `apps/desktop/src/pages/TodayPage.vue`
- 小程序端: `apps/wechat-uniapp/src/pages/today/index.vue`

职责:

- 展示当天身份、方向、阶段、连续记录、最近记录。
- 完成/撤销每日动作。
- 处理到期提醒: 完成、稍后、跳过。
- 进入今日观察、提醒设置、原文阅读和三段 journey。
- 判断是否需要完整校准。

### 道路页

位置:

- 桌面端: `PathPage.vue` / `PathEditorPage.vue`
- 小程序端: `path/index.vue` / `path-editor/index.vue`

职责:

- 展示和编辑 `visionProfile`。
- 管理一年方向、月项目、约束、愿景/反愿景叙事。
- 桌面端编辑页支持结束一年目标或月项目，写入 `goalHistory`。

### 身份页

位置:

- 桌面端: `IdentityPage.vue` / `IdentityEditorPage.vue`
- 小程序端: `identity/index.vue` / `identity-editor/index.vue`

职责:

- 展示和编辑 `identityProfile`。
- 管理原则和每日动作。
- 手动推进身份阶段: `dissonance` → `uncertainty` → `discovery`。

### 记录页

位置:

- 桌面端: `RecordsPage.vue` / `RecordDetailPage.vue`
- 小程序端: `records/index.vue` / `record-detail/index.vue`

职责:

- 查看记录窗口、热力图、趋势、连续天数、平均推进度。
- 查看某日详情，包括每日动作、提醒处理、白天回答、晚上回顾和 action logs。
- 记录窗口默认 35 天，详情页可看前后日期。

### 设置页

桌面端有较完整的 `SettingsPage.vue`:

- 通知偏好。
- 铃声音量测试。
- 数据导出。
- 数据导入。
- 隐私页入口。

小程序端目前主要有隐私页和提醒设置页，没有同等完整的数据导入导出入口。

## 提醒系统

提醒规则类型:

- `morning`: 早晨入口提醒。
- `day`: 白天固定时间点提醒。
- `commute`: 通勤/散步反思。
- `night`: 晚上回顾提醒。

触发逻辑:

- 所有提醒都按 `hour` / `minute` 判断是否到期。
- `daysOfWeek` 为空表示每天触发；非空表示只在指定星期触发。
- 如果当天已记录 `complete` 或 `skip`，不再出现在 pending 列表。
- 如果 `snoozedUntil` 晚于当前时间，暂不出现。
- 桌面端 scheduler 每 30 秒刷新一次，并用 `notifiedReminderIds` 避免重启后重复推送同一条系统通知。

通知偏好:

- `desktopNotification`: 是否发系统通知。
- `sound`: 是否播放铃声。
- `soundVolume`: 0-100。
- `focusWindow`: 是否抢前台。
- `inAppBanner`: 是否显示应用内浮层。

## 持久化

共享 key:

```text
guiling:v1
```

桌面端:

- Tauri 环境下保存到 AppData 下的 `guiling/state.json`。
- Web/Vite 开发环境下保存到 `window.localStorage`。
- Tauri fs 是异步 API，但 core store 要同步读写，所以桌面 adapter 启动时先预加载到内存，再防抖写盘。

小程序端:

- 通过 `uni.getStorageSync` 和 `uni.setStorageSync` 直接同步读写。

数据迁移:

- `mergeWithDefaults()` 会补齐新增字段。
- 旧字段 `identityProfile.beliefs` 会并入 `identityProfile.principles`。
- 旧字段 `visionProfile.mainQuestTitle` / `mainQuestDescription` 会映射到一年方向。
- 旧 `wechat-subscribe` delivery mode 在 core 里会改成 `system-notification`。
- 通勤提醒旧时间 `00:00` 会按默认值修正。

## 页面地图

桌面端路由:

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/welcome` | `WelcomePage.vue` | 首次选择入口 |
| `/onboarding` | `OnboardingPage.vue` | 快速设置 |
| `/journey/morning` | `JourneyMorningPage.vue` | 早晨 15 题 |
| `/journey/day` | `JourneyDayPage.vue` | 白天 9 题 |
| `/journey/night` | `JourneyNightPage.vue` | 晚上回顾/完整校准 |
| `/today` | `TodayPage.vue` | 今日主页面 |
| `/today/note` | `TodayNotePage.vue` | 今日观察 |
| `/today/review` | `NightReviewPage.vue` | 旧复盘入口，跳转到新版 |
| `/today/reminders` | `ReminderSettingsPage.vue` | 提醒设置 |
| `/path` | `PathPage.vue` | 道路展示 |
| `/path/edit` | `PathEditorPage.vue` | 道路编辑 |
| `/path/article` | `ArticleReaderPage.vue` | 原文阅读 |
| `/records` | `RecordsPage.vue` | 记录总览 |
| `/records/:dateKey` | `RecordDetailPage.vue` | 单日详情 |
| `/identity` | `IdentityPage.vue` | 身份展示 |
| `/identity/edit` | `IdentityEditorPage.vue` | 身份/每日动作编辑 |
| `/settings` | `SettingsPage.vue` | 设置 |
| `/settings/privacy` | `PrivacyPage.vue` | 隐私政策 |

小程序端页面在 `apps/wechat-uniapp/src/pages.json` 中声明，主要与桌面端页面一一对应。tabBar 包含:

- 今日: `pages/today/index`
- 道路: `pages/path/index`
- 记录: `pages/records/index`
- 身份: `pages/identity/index`

## 内容库

核心内容:

- `packages/core/src/content/article.ts`: 原文阅读章节。
- `packages/core/src/content/excavationQuestions.ts`: 早晨 15 题。
- `packages/core/src/content/dayPrompts.ts`: 白天 9 题。
- `packages/core/src/content/quotes.ts`: 页面和通知里的引语。

小程序端内容副本:

- `apps/wechat-uniapp/src/static/content/article.ts`
- `apps/wechat-uniapp/src/static/content/excavationQuestions.ts`
- `apps/wechat-uniapp/src/static/content/dayPrompts.ts`
- `apps/wechat-uniapp/src/static/content/quotes.ts`

注意: 如果改题库、原文、引语，通常要同步 core 和小程序副本。

## 视觉和样式

桌面端:

- 设计 token 在 `packages/core/src/design/tokens.ts`。
- `apps/desktop/src/styles/tokens.ts` 会把 token 注入为 `--si-*` CSS 变量。
- 全局样式拆在 `reset.scss`、`global.scss`、`base.scss`、`cards.scss`、`buttons.scss`、`forms.scss`。
- 主视觉是黑色背景、玻璃卡片、绿色品牌色 `#34d399`，辅以 info/warning/danger 状态色。

小程序端:

- 主题样式主要在 `apps/wechat-uniapp/src/styles/theme.scss`。
- `apps/wechat-uniapp/src/uni.scss` 保留 uni-app 默认变量。

## 常见修改入口

改数据结构:

- 先改 `packages/core/src/types/app.ts`。
- 再改 `packages/core/src/stores/useAppStore.ts` 的默认值和 `mergeWithDefaults()`。
- 如果小程序也要跟进，同步改 `apps/wechat-uniapp/src/types/app.ts` 和 `apps/wechat-uniapp/src/stores/useAppStore.ts`。

改今日页逻辑:

- 桌面端优先看 `apps/desktop/src/pages/TodayPage.vue`。
- 小程序端对应 `apps/wechat-uniapp/src/pages/today/index.vue`。
- 共用业务逻辑尽量放进 store，减少页面里重复判断。

改提醒:

- 题库改 `dayPrompts.ts`。
- 默认创建逻辑看 `OnboardingPage.vue`。
- 到期计算看 `refreshReminderPrompts()`。
- 桌面系统通知看 `reminderScheduler.ts` 和 `tauriNotification.ts`。

改晚上回顾:

- 页面看 `JourneyNightPage.vue` / `journey-night/index.vue`。
- 保存逻辑看 `saveNightSynthesis()`。
- 明日时间段升格看 `promoteTomorrowBlocks()`。

改原文阅读:

- 内容看 `content/article.ts`。
- 页面看 `ArticleReaderPage.vue` / `article-reader/index.vue`。
- 阅读进度和笔记看 `articleProgress` 相关 store 方法。

改设计风格:

- 桌面端先改 `packages/core/src/design/tokens.ts` 和 `apps/desktop/src/styles`。
- 小程序端先改 `apps/wechat-uniapp/src/styles/theme.scss`。

## 当前需要特别留意的点

- 桌面端和小程序端 store/类型/内容有重复实现，跨端需求要同步两份，否则行为会漂移。
- `NightReviewPage.vue` 是旧入口，实际已经升级到 `JourneyNightPage.vue`。
- 桌面端导入导出能力在 core store 中存在，小程序端 store 副本当前没有暴露 `exportData` / `importData`。
- 文案批量替换脚本会改很多页面文件，使用前要确认映射表和目标目录。
- 项目中文内容较多，读写文件时应使用 UTF-8，避免 PowerShell 默认编码导致显示乱码。

