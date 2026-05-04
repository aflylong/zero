import { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

export default function IdentityScreen() {
  const [showAntiVision, setShowAntiVision] = useState(false);

  const beliefs = [
    '行动创造清晰',
    '不适即成长',
    '我由所做之事定义，而非所想之事',
    '恐惧是指向重要事物的指南针',
    '每日小行动累积成身份'
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 pb-24">
      <div className="flex items-center gap-3 mb-10">
        <Sparkles className="w-6 h-6 text-emerald-400" />
        <h1 className="text-zinc-100 text-2xl">身份</h1>
      </div>

      {/* Identity Statement */}
      <div className="mb-10">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">你是谁</p>
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-800/30 rounded-2xl p-8">
          <p className="text-emerald-50 text-3xl leading-tight">
            我是毫不犹豫采取大量行动的人
          </p>
        </div>
      </div>

      {/* Anti-Vision (Collapsible) */}
      <div className="mb-10">
        <button
          onClick={() => setShowAntiVision(!showAntiVision)}
          className="w-full flex items-center justify-between mb-3"
        >
          <p className="text-zinc-500 text-xs uppercase tracking-wider">你正在抛弃的</p>
          <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${showAntiVision ? 'rotate-180' : ''}`} />
        </button>

        {showAntiVision && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 leading-relaxed italic">
              那个拖延、等待完美时机、让恐惧主导决定、安于平庸的人。那个只会谈论改变却从不行动的人。
            </p>
          </div>
        )}
      </div>

      {/* Vision */}
      <div className="mb-10">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">你要去向何方</p>
        <p className="text-zinc-100 text-xl leading-relaxed">
          建立一个自由、有影响力、真实连接的人生。充满活力地醒来，帮助成千上万的人蜕变，全心全意陪伴所爱之人。
        </p>
      </div>

      {/* Beliefs */}
      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">核心信念</p>
        <div className="space-y-3">
          {beliefs.map((belief, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0" />
                <p className="text-zinc-300 leading-relaxed">{belief}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
