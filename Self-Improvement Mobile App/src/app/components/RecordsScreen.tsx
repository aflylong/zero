import { Flame } from 'lucide-react';

export default function RecordsScreen() {
  const currentStreak = 12;

  // Calendar data - last 35 days
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (34 - i));
    const alignment = i < 32 ? (Math.random() > 0.3 ? Math.floor(Math.random() * 40 + 60) : Math.floor(Math.random() * 50 + 20)) : null;
    return {
      date,
      alignment,
      state: alignment === null ? 'today' : alignment >= 60 ? 'aligned' : 'off-track'
    };
  });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 pb-24">
      <h1 className="text-zinc-100 text-2xl mb-8">记录</h1>

      {/* Streak */}
      <div className="mb-10 bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-800/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Flame className="w-7 h-7 text-orange-400" />
          <p className="text-zinc-400 text-sm">当前连续打卡</p>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-6xl text-orange-50 font-light">{currentStreak}</p>
          <p className="text-zinc-500 text-xl mb-1">天</p>
        </div>
        <p className="text-zinc-500 text-sm mt-3">继续前进。你正在证明你是谁。</p>
      </div>

      {/* Calendar */}
      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">身份一致性历史</p>

        {/* Week day labels */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day, idx) => (
            <div key={idx} className="text-center text-zinc-600 text-xs">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            let bgColor = 'bg-zinc-900/40 border-zinc-800/50';

            if (day.state === 'aligned') {
              bgColor = 'bg-emerald-900/30 border-emerald-700/40';
            } else if (day.state === 'off-track') {
              bgColor = 'bg-zinc-800/40 border-zinc-700/40';
            } else if (day.state === 'today') {
              bgColor = 'bg-zinc-800/60 border-zinc-600';
            }

            return (
              <div
                key={idx}
                className={`aspect-square rounded-lg border ${bgColor} flex items-center justify-center relative group`}
              >
                <span className="text-zinc-500 text-xs">
                  {day.date.getDate()}
                </span>
                {day.alignment !== null && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg">
                    <span className="text-zinc-300 text-xs">{day.alignment}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-900/30 border border-emerald-700/40" />
            <span className="text-zinc-500 text-xs">一致</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-zinc-800/40 border border-zinc-700/40" />
            <span className="text-zinc-500 text-xs">偏离</span>
          </div>
        </div>
      </div>
    </div>
  );
}
