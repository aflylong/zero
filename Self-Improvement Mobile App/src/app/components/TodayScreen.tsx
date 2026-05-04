import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown } from 'lucide-react';

export default function TodayScreen() {
  const [proofs, setProofs] = useState([
    { id: 1, text: '早上6点完成锻炼', completed: true },
    { id: 2, text: '拒绝了让我分心的事情', completed: false },
    { id: 3, text: '帮助他人而不求回报', completed: true },
  ]);
  const [showAntiVision, setShowAntiVision] = useState(false);
  const [reflection, setReflection] = useState('');

  const toggleProof = (id: number) => {
    setProofs(proofs.map(proof =>
      proof.id === id ? { ...proof, completed: !proof.completed } : proof
    ));
  };

  const completedCount = proofs.filter(p => p.completed).length;
  const alignment = Math.round((completedCount / proofs.length) * 100);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 pb-24">
      {/* Identity Statement */}
      <div className="mb-8">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">你是</p>
        <h1 className="text-zinc-50 text-3xl leading-tight">
          毫不犹豫采取大量行动的人
        </h1>
      </div>

      {/* Anti-Vision Reminder */}
      <button
        onClick={() => setShowAntiVision(!showAntiVision)}
        className="w-full mb-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
      >
        <span className="text-zinc-500 text-sm">你正在抛弃的旧自己</span>
        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${showAntiVision ? 'rotate-180' : ''}`} />
      </button>

      {showAntiVision && (
        <div className="mb-8 -mt-6 bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5">
          <p className="text-zinc-400 text-sm leading-relaxed italic">
            那个拖延、等待完美时机、让恐惧主导决定的人。
          </p>
        </div>
      )}

      {/* Proof of Identity */}
      <div className="mb-8">
        <h2 className="text-zinc-300 text-lg mb-4">身份证明</h2>
        <div className="space-y-3">
          {proofs.map(proof => (
            <button
              key={proof.id}
              onClick={() => toggleProof(proof.id)}
              className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 flex items-start gap-4 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all"
            >
              {proof.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-6 h-6 text-zinc-700 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-left ${proof.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                {proof.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Identity Alignment */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-zinc-400 text-sm">身份一致性</span>
          <span className="text-emerald-400 text-2xl font-light">{alignment}%</span>
        </div>
        <div className="w-full bg-zinc-900/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${alignment}%` }}
          />
        </div>
      </div>

      {/* Reflection Question */}
      <div>
        <p className="text-zinc-400 mb-3 leading-relaxed">
          今天的你，像那个人吗？
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="对自己诚实..."
          className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 text-zinc-200 placeholder:text-zinc-700 resize-none focus:outline-none focus:border-zinc-700 focus:bg-zinc-900/60 transition-all"
          rows={4}
        />
      </div>
    </div>
  );
}
