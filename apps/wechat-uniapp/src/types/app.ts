export type DeliveryMode = "in-app" | "wechat-subscribe";
export type SubscriptionStatus = "unknown" | "pending" | "accepted" | "declined";
export type ReminderKind = "morning" | "day" | "night";
export type ReminderAction = "complete" | "snooze" | "skip";
export type ActionLogType =
  | "proof-complete"
  | "proof-reset"
  | "reminder-complete"
  | "reminder-snooze"
  | "reminder-skip"
  | "note-updated"
  | "review-saved"
  | "belief-added"
  | "belief-removed"
  | "goal-completed"
  | "goal-habituated"
  | "goal-abandoned"
  | "goal-created";

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
}

export interface VisionProfile {
  visionText: string;
  antiVisionText: string;
  whyChangeText: string;

  /** 一年目标(主线任务) */
  yearGoal: string;
  yearGoalDescription: string;

  /** 一月项目(Boss 战) */
  monthProject: string;
  monthProjectDescription: string;
  monthProjectDeadline: string | null;

  /** 约束 */
  constraints: string[];

  /** @deprecated 向后兼容 */
  mainQuestTitle: string;
  mainQuestDescription: string;
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

export interface IdentityProfile {
  statement: string;
  antiIdentityText: string;
  beliefs: string[];
}

export interface ProofRule {
  id: string;
  title: string;
  description: string;
  cadence: "daily" | "weekly";
  active: boolean;
  sortOrder: number;
}

export interface ReminderRule {
  id: string;
  kind: ReminderKind;
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
  mainQuestTitle: string;
  mainQuestDescription: string;
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
  alignmentScore: number;
  reminderActions: ReminderActionRecord[];
  lastUpdatedAt: string;
}

export interface NightReview {
  dateKey: string;
  alignmentScore: number;
  winsText: string;
  missesText: string;
  reflectionText: string;
  tomorrowFixesText: string;
  updatedAt: string;
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
  mainQuestTitle: string;
  mainQuestDescription: string;
  focusTheme: string;
  winsText: string;
  missesText: string;
  reflectionText: string;
  tomorrowFixesText: string;
  actionLogs: ActionLog[];
  lastUpdatedAt: string | null;
  prevDateKey: string | null;
  nextDateKey: string | null;
}

export interface AppData {
  onboardingCompleted: boolean;
  articleProgress: ArticleProgress;
  visionProfile: VisionProfile;
  identityProfile: IdentityProfile;
  proofRules: ProofRule[];
  reminderRules: ReminderRule[];
  dailyPlans: Record<string, DailyPlan>;
  dailySnapshots: Record<string, DailySnapshot>;
  nightReviews: Record<string, NightReview>;
  actionLogs: ActionLog[];
  goalHistory: GoalRecord[];
}

export interface ReminderPrompt {
  ruleId: string;
  kind: ReminderKind;
  label: string;
  message: string;
  dueAtLabel: string;
}

export interface OnboardingPayload {
  visionProfile: VisionProfile;
  identityProfile: IdentityProfile;
  proofRules: ProofRule[];
  reminderRules: ReminderRule[];
}
