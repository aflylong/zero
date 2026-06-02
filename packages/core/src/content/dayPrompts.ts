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
    question: "你现在做的这件事,和你的年度目标有什么关系?如果没关系,你是在保护什么?",
    helper: "别急着解释。看一眼目标,再看一眼手上的动作。",
  },
  {
    key: "d2-1330",
    kind: "day",
    hour: 13,
    minute: 30,
    label: "D2 · 倒带看看",
    question: "过去两小时如果被录屏,你会相信这个人真的想改变吗?",
    helper: "行动是证据。别听自己怎么说,只看刚才怎么做。",
  },
  {
    key: "d3-1515",
    kind: "day",
    hour: 15,
    minute: 15,
    label: "D3 · 朝哪边走",
    question: "你今天最重要的事推进了吗?如果没有,今晚你准备拿什么借口安慰自己?",
    helper: "选一个能留下证据的动作,现在补一小步。",
    },
  {
    key: "d4-1700",
    kind: "day",
    hour: 17,
    minute: 0,
    label: "D4 · 心里那件事",
    question: "今天快结束了,你还在假装哪件事“不重要”?",
    helper: "那个一直被你压下去的事,通常才是今天该面对的事。",
  },
  {
    key: "d5-1930",
    kind: "day",
    hour: 19,
    minute: 30,
    label: "D5 · 真做还是怕被人说",
    question: "你今天有多少行为是在维护旧身份,而不是建设新身份?",
    helper: "旧身份会要求你安全,新身份会要求你留下证据。",
  },
  {
    key: "d6-2100",
    kind: "day",
    hour: 21,
    minute: 0,
    label: "D6 · 哪个时刻最来劲",
    question: "今天哪一刻让你像个活人?哪一刻让你像在消耗人生?",
    helper: "晚上综合前先看清这两刻,它们会告诉你方向。",
  },
  {
    key: "w1-commute",
    kind: "commute",
    label: "W1 · 不被那样看以后",
    question: "如果一年后你还是这样,你最该羞愧的是哪件事?",
    helper: "通勤、散步、发呆时慢慢想。别把答案磨圆。",
  },
  {
    key: "w2-commute",
    kind: "commute",
    label: "W2 · 拿什么换什么",
    question: "你正在用什么换安全感?这个交易真的值得吗?",
    helper: "诚实写一个具体场景就够。安全感也有价格。",
  },
  {
    key: "w3-commute",
    kind: "commute",
    label: "W3 · 最小一步",
    question: "明天哪一个具体动作,能证明你不是只会想?",
    helper: "一句话、一个动作、几分钟,但必须能留下证据。",
  },
];

export function findDayPrompt(key: string): DayPrompt | null {
  return dayPrompts.find((p) => p.key === key) ?? null;
}

/** 默认种子 — 用于 onboarding 一次性创建 6+3 条 ReminderRule */
export const defaultTimedDayPrompts = dayPrompts.filter((p) => p.kind === "day");
export const defaultCommuteDayPrompts = dayPrompts.filter((p) => p.kind === "commute");
