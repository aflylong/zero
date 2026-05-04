import { Compass } from 'lucide-react';

export default function PathScreen() {
  const proofRules = [
    '决定后5分钟内立即行动',
    '每天早上7点前完成锻炼',
    '每天帮助一个人，不求回报',
    '拒绝与愿景不符的事情',
    '每周直面一个恐惧'
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <Compass className="w-6 h-6 text-emerald-400" />
        <h1 className="text-zinc-100 text-2xl">你的道路</h1>
      </div>

      {/* Vision */}
      <div className="mb-10">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">愿景</p>
        <p className="text-zinc-50 text-2xl leading-relaxed">
          建立一个自由、有影响力、真实连接的人生。充满活力地醒来，帮助成千上万的人蜕变，全心全意陪伴所爱之人。
        </p>
      </div>

      {/* Identity Definition */}
      <div className="mb-10">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">身份</p>
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-800/30 rounded-2xl p-6">
          <p className="text-emerald-50 text-xl leading-relaxed">
            我是毫不犹豫采取大量行动的人
          </p>
        </div>
      </div>

      {/* Daily Proof Rules */}
      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">每日证明法则</p>
        <div className="space-y-3">
          {proofRules.map((rule, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-900/30 border border-emerald-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs">{idx + 1}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{rule}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
