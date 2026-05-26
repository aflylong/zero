/**
 * 早晨心理开掘 — 严格对应原文 Part 1 的 15 道题
 * (11 题挖痛 + 4 题落地 MVP)。
 *
 * 题干按"先一句直接问到点子上,再分行展开"组织。
 * helper 给一些手感与例子,不是答案。
 * 换行(\n)在 UI 里会被保留(white-space: pre-line)。
 */

export type ExcavationStage =
  | "discomfort" // Q1-Q4 看见钝感不满与真相
  | "anti-vision" // Q5-Q11 反愿景三段叙事 + 必须放弃
  | "vision-mvp"; // Q12-Q15 愿景 MVP + 落地

export interface ExcavationQuestion {
  key: string;
  index: number; // 1..15
  stage: ExcavationStage;
  /** 用作 UI 上的小标签 */
  kicker: string;
  question: string;
  helper: string;
  placeholder: string;
  /** 写回 visionProfile / identityProfile 的字段名(可选) */
  bindTo?:
    | "antiVisionText"
    | "fiveYearTuesday"
    | "tenYearTuesday"
    | "endOfLife"
    | "threeYearTuesday"
    | "oneThingThisWeek"
    | "identityStatement"
    | "antiIdentityText";
  /** 长文本 vs 短句 */
  long?: boolean;
}

export const excavationQuestions: ExcavationQuestion[] = [
  {
    key: "q1",
    index: 1,
    stage: "discomfort",
    kicker: "Q1 · 那种说不出的不舒服",
    question:
      "你心里那个一直没解决、却被你忍下来的不舒服,是什么?\n\n不一定是大痛苦。可能只是一种持续的、闷闷的、说不上来的不对劲。",
    helper:
      "如果你不讨厌它,你早就忍下去了。把那个最容易被自己说成「也还行吧」的东西写出来就行。",
    placeholder:
      "例如:每天下班瘫在沙发上刷手机两小时,我已经习惯了,但其实很讨厌这种状态。",
    long: true,
  },
  {
    key: "q2",
    index: 2,
    stage: "discomfort",
    kicker: "Q2 · 抱怨清单",
    question:
      "过去一年,你嘴上反复说、却始终没改的事,是哪三条?\n\n挑你最常抱怨的三件——对工作、对关系、对自己,都行。",
    helper:
      "三条就好。一时凑不齐就翻翻最近的聊天记录,你最常发牢骚的那几句往往一抓一个准。",
    placeholder:
      "1. 工作没意思,但又不知道换什么\n2. 总说要运动,从来没坚持\n3. 跟伴侣老在为同一件小事吵",
    long: true,
  },
  {
    key: "q3",
    index: 3,
    stage: "discomfort",
    kicker: "Q3 · 看看你做了什么",
    question:
      "假设有人不听你说什么,只看你这一年做了什么——他会觉得你「真正想要」的是什么?\n\n对 Q2 写下的每条抱怨,都试着这样反过来推一下。",
    helper:
      "这一题最锋利。你嘴上要的,和身体实际选的,常常不是同一件事——身体选的那个,才是真目标。",
    placeholder:
      "嘴上说想换工作,但行为上一直在守着「不被评判的安全感」。\n嘴上说想运动,但每次都把时间让给手机。",
    long: true,
  },
  {
    key: "q4",
    index: 4,
    stage: "discomfort",
    kicker: "Q4 · 不敢说出口的事",
    question:
      "关于你现在的生活,有没有一件事——你没法坦然告诉那个你最尊敬的人?\n\n不需要分享给任何人,这一格只写给你自己看。",
    helper:
      "诚实写下来,你才开始真正拥有它。否则它会一直藏在角落里,替你做决定。",
    placeholder: "",
    long: true,
  },
  {
    key: "q5",
    index: 5,
    stage: "anti-vision",
    kicker: "Q5 · 5 年后的周二",
    question:
      "假设接下来五年什么都不变,描述一个普通的周二:\n\n· 你在哪里醒来?\n· 第一个念头是什么?\n· 身体是什么感觉?\n· 谁在你身边?\n· 早 9 点到晚 6 点你在做什么?\n· 晚上 10 点躺在床上,你是什么感觉?",
    helper:
      "不要写「我会很糟糕」这种抽象的话。写到能看见画面、闻到气味、听到声音——那才能真正撼动你。",
    placeholder: "",
    bindTo: "fiveYearTuesday",
    long: true,
  },
  {
    key: "q6",
    index: 6,
    stage: "anti-vision",
    kicker: "Q6 · 10 年后的周二",
    question:
      "用同样的方式,描述十年后的周二:\n\n· 你错过了什么?\n· 哪些机会已经永远关上了?\n· 谁已经不再相信你?\n· 当你不在场时,身边人会怎么评价你?",
    helper:
      "把代价写到具体的人、具体的事、具体的房间里。越具体,越有画面感。",
    placeholder: "",
    bindTo: "tenYearTuesday",
    long: true,
  },
  {
    key: "q7",
    index: 7,
    stage: "anti-vision",
    kicker: "Q7 · 人生尽头",
    question:
      "你走到人生尽头。这一辈子,你都选了「安全的版本」,从未真的打破过模式。\n\n· 你为此付出了什么?\n· 你从未允许自己去感受、去尝试、去成为的,是什么?",
    helper:
      "这一题会让你不舒服。不舒服就对了——这股劲儿会被引到正向上去。",
    placeholder: "",
    bindTo: "endOfLife",
    long: true,
  },
  {
    key: "q8",
    index: 8,
    stage: "anti-vision",
    kicker: "Q8 · 你身边的他/她",
    question:
      "你身边有没有这样一个人——比你早 5 年、10 年、20 年,已经走在你刚才描述的那条轨迹上?\n\n想到他/她时,你心里是什么感觉?",
    helper:
      "脑子里浮现一个具体的人就够了。名字写不写都行,关键是你心里那一下。",
    placeholder: "",
    long: true,
  },
  {
    key: "q9",
    index: 9,
    stage: "anti-vision",
    kicker: "Q9 · 要丢掉的旧自己",
    question:
      "想要真正改变,你必须放弃什么样的「自我标签」?\n\n用「我是那种会……的人」的句式写下来。\n\n再问自己一句:在朋友、家人、同事眼里,不再做那种人,你会失去什么?",
    helper:
      "代价是真实的——可能是某段关系、某个标签、某种舒服的位置。看清楚它,反而比硬扛着容易多了。",
    placeholder:
      "我必须放弃「我是那种永远很忙、看起来很努力、却从来没有进展的人」。",
    bindTo: "antiIdentityText",
    long: true,
  },
  {
    key: "q10",
    index: 10,
    stage: "anti-vision",
    kicker: "Q10 · 最不愿承认的原因",
    question:
      "你没有改变,真正最尴尬的原因是什么?\n\n不是「我太忙了」「条件还没成熟」这种听起来很合理的解释——而是那个让你脸有点热、不太愿意承认的原因。",
    helper: "脸热的那个,通常才是真的。写出来反而会轻松。",
    placeholder: "",
    long: true,
  },
  {
    key: "q11",
    index: 11,
    stage: "anti-vision",
    kicker: "Q11 · 你在保护什么",
    question:
      "如果你现在的行为,是一种自我保护——\n\n· 你到底在保护什么?\n· 这种保护,正在让你付出什么代价?",
    helper: "保护本身没错。但你得看清这张「保护」的价签是多少,值不值。",
    placeholder: "",
    long: true,
  },
  {
    key: "q12",
    index: 12,
    stage: "vision-mvp",
    kicker: "Q12 · 三年后理想的周二",
    question:
      "先把「现实不现实」放一边。\n\n如果你能打个响指,三年后就过上你真心想要的生活——不是「在现实里能做到的」,是你真心想要的——那会是什么样?\n\n描述一个普通的周二:\n\n· 醒来的地点\n· 第一个念头\n· 9 点到 18 点在做什么\n· 晚上是什么状态",
    helper: "用 Q5 / Q6 同样的颗粒度。具体到画面,愿景才有拉力。",
    placeholder: "",
    bindTo: "threeYearTuesday",
    long: true,
  },
  {
    key: "q13",
    index: 13,
    stage: "vision-mvp",
    kicker: "Q13 · 写一句:我是谁",
    question:
      "你要如何看待自己,才能让 Q12 那种生活感觉自然——而不是「硬撑出来」的?\n\n用一句话写下:「我是那种……的人」。",
    helper:
      "一句话,锋利、能驱动你今天就动手。不是口号,是你愿意按它行动的话。",
    placeholder: "我是那种想到就动、绝不拖到明天的人。",
    bindTo: "identityStatement",
    long: false,
  },
  {
    key: "q14",
    index: 14,
    stage: "vision-mvp",
    kicker: "Q14 · 这周的一件事",
    question:
      "如果你已经是 Q13 写下的那种人——\n\n这一周,你会做的一件事是什么?",
    helper: "一件事就好。具体到能动手、能在日历上画上时间。",
    placeholder: "周三晚上 8 点之前,把那篇拖了三周的稿子发出去。",
    bindTo: "oneThingThisWeek",
    long: false,
  },
  {
    key: "q15",
    index: 15,
    stage: "vision-mvp",
    kicker: "Q15 · 给自己一个承诺",
    question:
      "原文要求这套题在一天内跑完。\n\n如果今天没答完——你愿不愿意承诺自己:明早起床第一件事,就是坐下来把剩下的题答完?",
    helper:
      "把承诺写成你自己的话。这道题不是判断题,而是给自己一个郑重的开始。",
    placeholder:
      "明早起床,我会先坐下来把今天没答完的题写完,再做别的。",
    long: false,
  },
];

export function findExcavationQuestion(key: string): ExcavationQuestion | null {
  return excavationQuestions.find((q) => q.key === key) ?? null;
}
