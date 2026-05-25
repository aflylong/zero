/**
 * 投递通道 — 微信小程序端保留 wechat-subscribe(订阅消息)+ in-app。
 */
export type DeliveryMode = "in-app" | "wechat-subscribe";
export type SubscriptionStatus = "unknown" | "pending" | "accepted" | "declined";

/**
 * 提醒类型 — 与原文一天流程的三段对齐:
 *   morning  · 早晨开掘的入口提醒
 *   day      · 白天 6 个时间点中断
 *   commute  · 通勤/散步反思(原文 Part 2 后段 3 题)
 *   night    · 夜间综合复盘
 */
export type ReminderKind = "morning" | "day" | "commute" | "night";
export type ReminderAction = "complete" | "snooze" | "skip";
export type ActionLogType =
  | "proof-complete"
  | "proof-reset"
  | "reminder-complete"
  | "reminder-snooze"
  | "reminder-skip"
  | "note-updated"
  | "principle-added"
  | "principle-removed"
  | "goal-completed"
  | "goal-habituated"
  | "goal-abandoned"
  | "goal-created"
  | "excavation-saved"
  | "day-prompt-answered"
  | "synthesis-saved"
  | "tomorrow-block-promoted";

export interface ArticleParagraph {
  id: string;
  type: "paragraph" | "quote" | "bullet";
  text: string;
}

export interface ArticleSection {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  paragraphs: ArticleParagraph[];
  accent: string;
}

export interface ArticleProgress {
  currentSectionId: string;
  completedSectionIds: string[];
  lastOpenedAt: string | null;
  /** 章节 ID -> 用户在该章节写下的笔记 */
  notes: Record<string, string>;
}

/** 早晨心理开掘 — 对应原文 Part 1 的 11 道核心问题 + 4 道 MVP 落地 */
export interface MorningExcavation {
  startedAt: string | null;
  excavationCompletedAt: string | null;
  completedAt: string | null;
  responses: Record<string, string>;
  currentQuestionKey: string;
}

/** 白天打断作答 */
export interface DayPromptResponse {
  promptKey: string;
  answer: string;
  answeredAt: string;
}

/** 夜晚综合 — 对应原文 Part 3 的 5 步 */
export interface NightSynthesis {
  dateKey: string;
  stuckReason: string;
  enemyName: string;
  antiVisionMantra: string;
  visionMantra: string;
  yearLens: string;
  monthLens: string;
  tomorrowBlocks: TomorrowBlock[];
  updatedAt: string;
}

export interface TomorrowBlock {
  id: string;
  title: string;
  timeHint: string;
  promotedToProofRule: boolean;
}

export type IdentityStage = "dissonance" | "uncertainty" | "discovery";

export interface VisionProfile {
  visionText: string;
  antiVisionText: string;

  /** 反愿景三段叙事 */
  fiveYearTuesday: string;
  tenYearTuesday: string;
  endOfLife: string;

  /** 愿景叙事 */
  threeYearTuesday: string;
  oneThingThisWeek: string;

  yearGoal: string;
  yearGoalDescription: string;

  monthProject: string;
  monthProjectDescription: string;
  monthProjectDeadline: string | null;

  constraints: string[];
}

export interface IdentityProfile {
  statement: string;
  antiIdentityText: string;
  /** 你愿意反复执行的原则(旧字段 beliefs 已迁入此处) */
  principles: string[];
  stage: IdentityStage;
}

export interface ProofRule {
  id: string;
  title: string;
  description: string;
  cadence: "daily" | "weekly";
  active: boolean;
  sortOrder: number;
  linkedYearGoal?: boolean;
  linkedMonthProject?: boolean;
  fromTomorrowBlockId?: string;
  createdAt?: string;
}

export interface ReminderRule {
  id: string;
  kind: ReminderKind;
  /** 关联到 dayPrompts.ts 中的 promptKey */
  promptKey?: string;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
  deliveryMode: DeliveryMode;
  subscriptionStatus: SubscriptionStatus;
  message: string;
  snoozedUntil: string | null;
}

export interface DailyPlan {
  dateKey: string;
  focusTheme: string;
  yearGoalTitle: string;
  yearGoalDescription: string;
  reminderHeadline: string;
}

export interface ReminderActionRecord {
  reminderId: string;
  action: ReminderAction;
  actedAt: string;
}

export interface DailySnapshot {
  dateKey: string;
  completedProofRuleIds: string[];
  todayNote: string;
  /** 今日推进度,0/1-39/40-69/70+ 四档梯度 */
  alignmentScore: number;
  reminderActions: ReminderActionRecord[];
  dayPromptResponses: DayPromptResponse[];
  lastUpdatedAt: string;
}

export interface ActionLog {
  id: string;
  dateKey: string;
  createdAt: string;
  type: ActionLogType;
  label: string;
  detail?: string;
  refId?: string;
}

export interface RecordDay {
  dateKey: string;
  label: string;
  weekday: string;
  alignmentScore: number | null;
  completedProofCount: number;
  note: string;
  hasNightReview: boolean;
}

export interface RecordSummary {
  currentStreak: number;
  bestStreak: number;
  averageAlignment: number;
  completedDays: number;
  trackedDays: number;
}

export interface RecordWindow {
  startDateKey: string;
  endDateKey: string;
  spanDays: number;
  days: RecordDay[];
  hasPrevWindow: boolean;
  hasNextWindow: boolean;
}

export interface RecordDetail {
  dateKey: string;
  label: string;
  weekday: string;
  alignmentScore: number | null;
  completedProofCount: number;
  totalProofCount: number;
  todayNote: string;
  hasNightReview: boolean;
  reminderActions: ReminderActionRecord[];
  completedProofRuleTitles: string[];
  yearGoalTitle: string;
  yearGoalDescription: string;
  focusTheme: string;
  synthesis: NightSynthesis | null;
  dayPromptResponses: DayPromptResponse[];
  actionLogs: ActionLog[];
  lastUpdatedAt: string | null;
  prevDateKey: string | null;
  nextDateKey: string | null;
}

/**
 * 通知体验偏好。微信小程序端只用 inAppBanner / sound;
 * desktopNotification 与 focusWindow 在小程序端没有对应能力,字段保留以便跨端数据互通。
 */
export interface NotificationPreferences {
  desktopNotification: boolean;
  sound: boolean;
  focusWindow: boolean;
  inAppBanner: boolean;
}

export interface AppData {
  onboardingCompleted: boolean;
  journeyCompleted: boolean;
  articleProgress: ArticleProgress;
  morningExcavation: MorningExcavation;
  nightSynthesisByDate: Record<string, NightSynthesis>;
  visionProfile: VisionProfile;
  identityProfile: IdentityProfile;
  proofRules: ProofRule[];
  reminderRules: ReminderRule[];
  dailyPlans: Record<string, DailyPlan>;
  dailySnapshots: Record<string, DailySnapshot>;
  actionLogs: ActionLog[];
  goalHistory: GoalRecord[];
  notificationPreferences: NotificationPreferences;
}

export type GoalStatus = "active" | "completed" | "habituated" | "abandoned";

export interface GoalRecord {
  id: string;
  type: "year" | "month";
  title: string;
  description: string;
  createdAt: string;
  endedAt: string | null;
  status: GoalStatus;
  reflection: string;
}

export interface ReminderPrompt {
  ruleId: string;
  kind: ReminderKind;
  label: string;
  message: string;
  question: string;
  promptKey: string;
  dueAtLabel: string;
}

export interface OnboardingPayload {
  visionProfile: VisionProfile;
  identityProfile: IdentityProfile;
  proofRules: ProofRule[];
  reminderRules: ReminderRule[];
}
