/**
 * 白天的 9 道反思题 — 对应原文 Part 2:
 *   6 个固定时间点(D1-D6) + 3 道通勤反思(W1-W3)。
 *
 * 文案以"温柔开场 + 一句口语化问题"为主,避免书面词。
 * 题干在 UI 与通知正文里都直接展示,所以一句话能读懂最重要。
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
    label: "D1 · 你在躲什么",
    question: "歇一下,你手头这件事,是不是其实在躲另一件?",
    helper: "停 30 秒。我们躲开的事,常常就是最该做的事。",
  },
  {
    key: "d2-1330",
    kind: "day",
    hour: 13,
    minute: 30,
    label: "D2 · 倒带看看",
    question: "过去两小时你都在干嘛?光看动作,你最想要的是什么?",
    helper: "用旁观者的角度看自己。身体诚实,嘴不诚实。",
  },
  {
    key: "d3-1515",
    kind: "day",
    hour: 15,
    minute: 15,
    label: "D3 · 朝哪边走",
    question: "你今天做的事,是在靠近想要的生活,还是离它越来越远?",
    helper: "二选一就好,不用找中间答案。",
    },
  {
    key: "d4-1700",
    kind: "day",
    hour: 17,
    minute: 0,
    label: "D4 · 心里那件事",
    question: "你嘴上说不重要,其实心里一直惦记的,是什么?",
    helper: "心里有那件事。把它写下来。",
  },
  {
    key: "d5-1930",
    kind: "day",
    hour: 19,
    minute: 30,
    label: "D5 · 真做还是怕被人说",
    question: "你今天做的事,有多少是为了不被人说,有多少是真的想做?",
    helper: "看清楚就行,不用立刻改。",
  },
  {
    key: "d6-2100",
    kind: "day",
    hour: 21,
    minute: 0,
    label: "D6 · 哪个时刻最来劲",
    question: "今天什么时候你最来劲?什么时候最没劲?",
    helper: "这两个时刻,会指向你真正的方向。",
  },
  {
    key: "w1-commute",
    kind: "commute",
    label: "W1 · 不被那样看以后",
    question: "如果别人不再把你看成那种人,你会变成什么样?",
    helper: "通勤、散步、发呆时慢慢想。",
  },
  {
    key: "w2-commute",
    kind: "commute",
    label: "W2 · 拿什么换什么",
    question: "你的生活里,哪一块是在用劲头换安心?",
    helper: "诚实写一个具体场景就够。",
  },
  {
    key: "w3-commute",
    kind: "commute",
    label: "W3 · 最小一步",
    question: "你想成为的那个人,明天能做出来的最小一步是什么?",
    helper: "一句话、一个动作、几分钟,就行。",
  },
];

export function findDayPrompt(key: string): DayPrompt | null {
  return dayPrompts.find((p) => p.key === key) ?? null;
}

/** 默认种子 — 用于 onboarding 一次性创建 6+3 条 ReminderRule */
export const defaultTimedDayPrompts = dayPrompts.filter((p) => p.kind === "day");
export const defaultCommuteDayPrompts = dayPrompts.filter((p) => p.kind === "commute");
