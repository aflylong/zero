import { useState } from 'react';
import { Calendar, Compass, Sparkles, Sun } from 'lucide-react';
import TodayScreen from './components/TodayScreen';
import PathScreen from './components/PathScreen';
import RecordsScreen from './components/RecordsScreen';
import IdentityScreen from './components/IdentityScreen';

type Tab = 'today' | 'path' | 'records' | 'identity';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');

  const tabs = [
    { id: 'today' as Tab, label: '今日', icon: Sun },
    { id: 'path' as Tab, label: '道路', icon: Compass },
    { id: 'records' as Tab, label: '记录', icon: Calendar },
    { id: 'identity' as Tab, label: '身份', icon: Sparkles },
  ];

  return (
    <div className="size-full bg-black flex flex-col max-w-md mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'path' && <PathScreen />}
        {activeTab === 'records' && <RecordsScreen />}
        {activeTab === 'identity' && <IdentityScreen />}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-black border-t border-zinc-900 px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1.5 py-2 px-3 rounded-lg transition-all"
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`}
                />
                <span className={`text-[10px] ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}