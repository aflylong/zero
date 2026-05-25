/**
 * 语录库 — 为"一天重启人生"主题定制。
 *
 * 语气要求:锋利、行动导向、情绪上冷静但有力。
 * 禁止:鸡汤味的"加油!"、感叹号、emoji。
 */

export interface Quote {
  text: string;
  author?: string;
  /** 适合出现的时段 */
  slot?: "morning" | "daytime" | "night" | "setback" | "streak";
}

export const quotes: Quote[] = [
  // 早晨 — 点火
  { text: "每天醒来你都在投票:接下来要活成哪个版本的自己。", slot: "morning" },
  { text: "先做那件最不想做但最重要的事。剩下的一整天都会变轻。", slot: "morning" },
  { text: "别等状态来了再动。状态是行动的副产品,不是前提。", slot: "morning" },
  { text: "你不是缺动力,你是在等一个不会来的完美时机。", slot: "morning" },
  { text: "今天一个真实的小动作,比明天一个宏大的计划值钱十倍。", slot: "morning" },
  { text: "身份不是想出来的。它是你一个动作一个动作堆出来的。", slot: "morning" },

  // 白天 — 纠偏
  { text: "你现在做的这件事,像不像你给自己定义的那个人?", slot: "daytime" },
  { text: "分心是可以被识别的。识别之后,5 秒内离开它。", slot: "daytime" },
  { text: "把\"等会儿\"从你的词典里删掉。现在就是\"等会儿\"。", slot: "daytime" },
  { text: "你越不想做一件事,它越有可能正在塑造你。", slot: "daytime" },
  { text: "纪律不是惩罚。它是你送给未来自己的礼物。", slot: "daytime" },
  { text: "不舒服不是警报,是方向标。", slot: "daytime" },
  { text: "进度条不会自己涨。每一格都要你亲手填上去。", slot: "daytime" },
  { text: "别花时间优化你已经做对的事。去修那件你一直在回避的。", slot: "daytime" },

  // 夜晚 — 整合
  { text: "复盘不是挑错。它的作用是让明天更容易做对。", slot: "night" },
  { text: "今天赢在哪?偏在哪?明天怎么改?三个问题就够了。", slot: "night" },
  { text: "睡前给今天一个诚实的分数。醒来就知道从哪开始。", slot: "night" },
  { text: "连续的小改进,会在某个你想不到的日子里复利爆发。", slot: "night" },

  // 断链 — 重新站起来
  { text: "断了连续天数不是失败。放弃重建才是。", slot: "setback" },
  { text: "跌倒不是问题。躺着不起来才是。", slot: "setback" },
  { text: "昨天没做好?行,今天从一件最小的真实动作开始。", slot: "setback" },
  { text: "别用一次偏离惩罚自己一整周。", slot: "setback" },
  { text: "你和\"那个人\"之间的距离,就是下一个动作。", slot: "setback" },

  // 连续 — 保持节奏
  { text: "你已经证明过一次了。再证明一次,它就变成习惯。", slot: "streak" },
  { text: "坚持不是咬牙撑着,是让系统替你跑。", slot: "streak" },
  { text: "你坚持下来的每一天,都在给未来的你涨工资。", slot: "streak" },
  { text: "别破坏你已经建起来的连续性。它比你想的脆弱,也比你想的珍贵。", slot: "streak" },

  // 通用
  { text: "行动产生清晰。不是反过来。" },
  { text: "我是我做的事,不是我想的事。" },
  { text: "恐惧往往指向真正重要的方向。" },
  { text: "真正的自由,是每天都能按自己决定的方式度过。" },
  { text: "你不是要变成别人。你是要停止背叛自己。" },
  { text: "把今天当作你唯一拥有的一天去过。" },
  { text: "更好的版本不在未来。它在你下一个动作里。" },
  { text: "世界不奖励思考。它只奖励行动。" },
  { text: "等准备好再开始,等于永远不开始。" },
  { text: "你值得的不是安慰,是进步。" },
];

/**
 * 按日期和时段选一条语录。
 * 同一天同一时段打开多次看到的是同一条(确定性),不会每次刷新都换。
 */
export function pickDailyQuote(dateKey: string, slot?: Quote["slot"]): Quote {
  const pool = slot
    ? quotes.filter((q) => q.slot === slot || !q.slot)
    : quotes;
  const list = pool.length ? pool : quotes;
  const seed = dateKey.split("-").reduce((sum, part) => sum + Number(part), 0);
  const idx = Math.abs(seed + (slot?.length ?? 0)) % list.length;
  return list[idx];
}

/** 随机选一条,用于通知推送等场景。 */
export function pickRandomQuote(slot?: Quote["slot"]): Quote {
  const pool = slot ? quotes.filter((q) => q.slot === slot || !q.slot) : quotes;
  const list = pool.length ? pool : quotes;
  return list[Math.floor(Math.random() * list.length)];
}


/**
 * 原文权威引文 — 4 位作者作为各章锚点。
 * 这些不参与日常 quote 轮播,而是在对应章节 / 复盘场景里被显式调用。
 */
export interface AuthoritativeQuote extends Quote {
  /** 关联到 articleSections 的 id */
  sectionId: string;
}

export const authoritativeQuotes: AuthoritativeQuote[] = [
  {
    sectionId: "ch2-desire",
    text: "只相信行动。生活发生在事件层面,而非言语层面。",
    author: "阿尔弗雷德·阿德勒(Alfred Adler)",
  },
  {
    sectionId: "ch3-fear",
    text: "你也许从未见过职业催眠师,也许从未接受过正式催眠。但如果你接受了某个观念并且坚信它是真的,那么它对你的控制力,和催眠师的话对被催眠者的控制力是一样的。",
    author: "麦克斯韦·马尔茨(Maxwell Maltz)",
  },
  {
    sectionId: "ch5-intelligence",
    text: "衡量智力的唯一真正标准,就是你是否从生活中得到了你想要的东西。",
    author: "纳瓦尔·拉维坎特(Naval Ravikant)",
  },
  {
    sectionId: "ch7-gamify",
    text: "内在体验的最优状态,是意识中存在秩序的状态。当心理能量投入到现实可行的目标上,并且技能与行动机会相匹配时,这种状态就会发生。",
    author: "米哈里·契克森米哈赖(Mihaly Csikszentmihalyi)",
  },
];

export function findAuthoritativeQuote(sectionId: string): AuthoritativeQuote | null {
  return authoritativeQuotes.find((q) => q.sectionId === sectionId) ?? null;
}
