/**
 * 白天打断作答 — 严格对应原文 Part 2:
 *   6 个固定时间点(D1-D6) + 3 道通勤反思(W1-W3)。
 *
 * 题干尽量贴原文。每条带建议时间(用于 onboarding 默认种子),
 * 用户可以在「提醒设置」页里改。
 */

export type DayPromptKind = "day" | "commute";

export interface DayPrompt {
  key: string;
  kind: DayPromptKind;
  /** 建议小时(0-23);commute 题不带固定小时 */
  hour?: number;
  /** 建议分钟 */
  minute?: number;
  /** 简短标签,用作 reminder.label */
  label: string;
  /** 完整题干,用于 UI / 通知正文 */
  question: string;
  /** 简短引导 */
  helper: string;
}

export const dayPrompts: DayPrompt[] = [
  {
    key: "d1-1100",
    kind: "day",
    hour: 11,
    minute: 0,
    label: "D1 · 我在回避什么",
    question: "我现在正在用我正在做的事来回避什么?",
    helper: "停 30 秒。回避的对象往往就是你最该做的事。",
  },
  {
    key: "d2-1330",
    kind: "day",
    hour: 13,
    minute: 30,
    label: "D2 · 行为录像",
    question:
      "如果有人拍下我过去两小时的行为,他们会得出结论:我想从人生里得到什么?",
    helper: "用第三人称看自己。身体诚实,嘴不诚实。",
  },
  {
    key: "d3-1515",
    kind: "day",
    hour: 15,
    minute: 15,
    label: "D3 · 朝哪边走",
    question: "我是在朝我讨厌的生活走,还是朝我想要的生活走?",
    helper: "二选一。不要找中间答案。",
  },
  {
    key: "d4-1700",
    kind: "day",
    hour: 17,
    minute: 0,
    label: "D4 · 假装不重要",
    question: "我在假装「并不重要」的、最重要的事情是什么?",
    helper: "你心里有那件事。写下它。",
  },
  {
    key: "d5-1930",
    kind: "day",
    hour: 19,
    minute: 30,
    label: "D5 · 身份保护 vs 真实欲望",
    question: "我今天有多少行为是出于身份保护,而不是真实欲望?",
    helper: "提示:大多数事情都是。这不是审判,是看清。",
  },
  {
    key: "d6-2100",
    kind: "day",
    hour: 21,
    minute: 0,
    label: "D6 · 生命力 vs 像死了",
    question: "我今天什么时候最有生命力?什么时候最像死了一样?",
    helper: "这两个时刻指向你真正的方向。",
  },
  {
    key: "w1-commute",
    kind: "commute",
    label: "W1 · 不再被那样看",
    question:
      "如果我不再需要别人把我看作 [Q10 写下的那种身份],会发生什么变化?",
    helper: "通勤、散步、发呆时想这条。",
  },
  {
    key: "w2-commute",
    kind: "commute",
    label: "W2 · 生命力换安全感",
    question: "我人生的哪个地方正在用「生命力」交换「安全感」?",
    helper: "诚实写一个具体场景。",
  },
  {
    key: "w3-commute",
    kind: "commute",
    label: "W3 · 最小版本",
    question: "我明天就能成为的、「我想成为的那个人」的最小版本是什么?",
    helper: "最小是几分钟、一句话、一个动作。",
  },
];

export function findDayPrompt(key: string): DayPrompt | null {
  return dayPrompts.find((p) => p.key === key) ?? null;
}

/** 默认种子 — 用于 onboarding 一次性创建 6+3 条 ReminderRule */
export const defaultTimedDayPrompts = dayPrompts.filter((p) => p.kind === "day");
export const defaultCommuteDayPrompts = dayPrompts.filter((p) => p.kind === "commute");
