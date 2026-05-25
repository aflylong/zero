/**
 * 投递通道 — 桌面端只用 in-app 与 system-notification。
 * 旧的 wechat-subscribe 已随 wechat-uniapp 一起移除。
 */
export type DeliveryMode = "in-app" | "system-notification";
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
  /** 章节 ID -> 用户在该章节写下的笔记(对应原文「值得收藏、做笔记」指令) */
  notes: Record<string, string>;
}

/**
 * 早晨心理开掘 — 对应原文 Part 1 的 11 道核心问题 + 4 道 MVP 落地。
 * 每条 response 用 questionKey 作为索引,详见 content/excavationQuestions.ts。
 */
export interface MorningExcavation {
  /** 第一次启动这套流程的日期 */
  startedAt: string | null;
  /** 全部 11 道开掘题答完的日期 */
  excavationCompletedAt: string | null;
  /** 全部 15 题(含 MVP 落地)答完的日期 */
  completedAt: string | null;
  /** key (q1..q15) -> 用户答案 */
  responses: Record<string, string>;
  /** 当前停留的题号(支持中途离开再回来) */
  currentQuestionKey: string;
}

/**
 * 白天打断作答 — 每个时间点的题干来自 content/dayPrompts.ts。
 * 同一个 promptKey 在同一天只保留最后一次回答。
 */
export interface DayPromptResponse {
  /** 题目唯一键(如 "d1-1100" / "w1-commute") */
  promptKey: string;
  answer: string;
  answeredAt: string;
}

/**
 * 夜晚综合 — 对应原文 Part 3 的 5 步。
 * 这套结构会在保存时把 N3/N4 回写到 visionProfile,实现"洞见固化"。
 */
export interface NightSynthesis {
  dateKey: string;
  /** N1 卡住的真正原因 */
  stuckReason: string;
  /** N2 命名敌人 — 不是环境/别人,是内在模式或信念 */
  enemyName: string;
  /** N3 一句话压缩反愿景 */
  antiVisionMantra: string;
  /** N4 一句话压缩愿景 MVP */
  visionMantra: string;
  /** N5.L1 一年透镜 */
  yearLens: string;
  /** N5.L2 一月透镜 */
  monthLens: string;
  /** N5.L3 明天 2-3 个 timeblock 行动 */
  tomorrowBlocks: TomorrowBlock[];
  updatedAt: string;
}

export interface TomorrowBlock {
  id: string;
  title: string;
  /** 可选时间提示,如 "9:00-10:30" */
  timeHint: string;
  /** 是否已被推升为下一日的 ProofRule(每日杠杆) */
  promotedToProofRule: boolean;
}

/**
 * 身份翻转 3 阶段(原文 ch6 中段)。
 *   dissonance  · 失调:对当前生活厌倦
 *   uncertainty · 不确定:还在实验
 *   discovery   · 发现:清晰到分心不再有分量
 */
export type IdentityStage = "dissonance" | "uncertainty" | "discovery";

export interface VisionProfile {
  /** 愿景概述(原文 K2 / Q12 三年后周二) */
  visionText: string;
  /** 反愿景概述(原文 K1) */
  antiVisionText: string;

  // —— 反愿景三段叙事(原文 Q5/Q6/Q7)——
  /** Q5 5 年后无变化的普通周二 */
  fiveYearTuesday: string;
  /** Q6 10 年后周二 */
  tenYearTuesday: string;
  /** Q7 人生尽头 */
  endOfLife: string;

  // —— 愿景叙事(原文 Q12 / Q14)——
  /** Q12 三年后理想周二 */
  threeYearTuesday: string;
  /** Q14 这周会做的一件事 */
  oneThingThisWeek: string;

  /** 一年目标 — 原文称"主线任务(mission)" */
  yearGoal: string;
  yearGoalDescription: string;

  /** 一月项目 — 原文称"Boss 战" */
  monthProject: string;
  monthProjectDescription: string;
  monthProjectDeadline: string | null;

  /** 约束 — 为了实现愿景,你绝不愿意牺牲的东西 */
  constraints: string[];
}

export interface IdentityProfile {
  /** Q13 「我是那种会……的人」 */
  statement: string;
  /** Q9 必须放弃的旧身份 + 社交代价 */
  antiIdentityText: string;
  /** 你愿意反复执行的原则(旧字段 beliefs 已在数据迁移中并入此处) */
  principles: string[];
  /** 当前所处的身份翻转阶段 */
  stage: IdentityStage;
}

/**
 * 每日杠杆(原文 K5)。优先级最高、真正"推动指标"的任务。
 * linkedYearGoal/linkedMonthProject 让这条法则与目标层级显式绑定,
 * 形成原文第七章"同心圆"的内层联动。
 */
export interface ProofRule {
  id: string;
  title: string;
  description: string;
  cadence: "daily" | "weekly";
  active: boolean;
  sortOrder: number;
  /** 关联到一年目标(可选) */
  linkedYearGoal?: boolean;
  /** 关联到一月项目(可选) */
  linkedMonthProject?: boolean;
  /** 来自夜晚综合 N5.L3 的 tomorrowBlock id(被升格而来) */
  fromTomorrowBlockId?: string;
  /** 创建时间(ISO) */
  createdAt?: string;
}

export interface ReminderRule {
  id: string;
  kind: ReminderKind;
  /**
   * 关联到 dayPrompts.ts 中的 promptKey;
   * 触发时 UI 拉这条 prompt 的题干而不是 message 单句。
   */
  promptKey?: string;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
  deliveryMode: DeliveryMode;
  subscriptionStatus: SubscriptionStatus;
  /** 旁白文案;promptKey 的题干优先 */
  message: string;
  snoozedUntil: string | null;
}

export interface DailyPlan {
  dateKey: string;
  focusTheme: string;
  /** 来自 visionProfile.yearGoal */
  yearGoalTitle: string;
  yearGoalDescription: string;
  /** 按 journey 进度 / 身份阶段动态生成的引导句 */
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
  /** "今日推进度" — 不再用 60 分阈值二分;0 / 1-39 / 40-69 / 70+ 四档梯度 */
  alignmentScore: number;
  reminderActions: ReminderActionRecord[];
  /** 当天对各时间点 prompt 的回答(同一 key 后写覆盖前) */
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
  /** 夜晚综合 — 对应原文 Part 3 的 5 步 */
  synthesis: NightSynthesis | null;
  /** 当天 dayPrompt 回答 */
  dayPromptResponses: DayPromptResponse[];
  actionLogs: ActionLog[];
  lastUpdatedAt: string | null;
  prevDateKey: string | null;
  nextDateKey: string | null;
}

/**
 * 通知体验偏好 — 决定提醒响起时是否同步发声 / 强抢窗口 / 显示弹层。
 * 全部默认开启,用户可以在「提醒设置」里逐项关闭。
 */
export interface NotificationPreferences {
  /** OS 桌面通知本身 */
  desktopNotification: boolean;
  /** 提醒到达时播放一声短促铃声 */
  sound: boolean;
  /** 把窗口拉到前台抢焦点 */
  focusWindow: boolean;
  /** 在窗口内弹出一个全局浮层(应用未在前台时静默,在前台时强提示) */
  inAppBanner: boolean;
}

export interface AppData {
  onboardingCompleted: boolean;
  /**
   * 是否完整跑完过原文「一天流程」(11+9+5 题)。
   * 这是产品的"灵魂指标"—— onboardingCompleted 只代表填过表,
   * journeyCompleted 才代表真的答完 22 题。
   */
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
  /** 结束时用户写的反思 */
  reflection: string;
}

export interface ReminderPrompt {
  ruleId: string;
  kind: ReminderKind;
  label: string;
  message: string;
  /** 拉到的题干(若 promptKey 命中题库,则填充) */
  question: string;
  /** 题目唯一键 */
  promptKey: string;
  dueAtLabel: string;
}

export interface OnboardingPayload {
  visionProfile: VisionProfile;
  identityProfile: IdentityProfile;
  proofRules: ProofRule[];
  reminderRules: ReminderRule[];
}
