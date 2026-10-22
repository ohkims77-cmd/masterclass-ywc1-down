/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bookmark,
  Receipt,
  CircleDot,
  Sliders,
  Moon,
  BarChart3,
  Flame,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react';
import { LottoMachine } from './components/LottoMachine';
import { TicketSlip } from './components/TicketSlip';
import { FilterPanel } from './components/FilterPanel';
import { DreamFortune } from './components/DreamFortune';
import { StatisticsView } from './components/StatisticsView';
import { ScratchCard } from './components/ScratchCard';
import { HistoryModal } from './components/HistoryModal';
import { LottoGame, LottoDrawHistory, LottoFilterOptions } from './types/lotto';
import {
  generate5Games,
  generateRandom6,
  calculateCurrentLottoRound,
} from './utils/lotto';
import { soundManager } from './utils/sound';

type ActiveTab = 'machine' | 'ticket' | 'filter' | 'fortune' | 'stats' | 'scratch';

export default function App() {
  const [currentRound] = useState(() => calculateCurrentLottoRound());
  const [activeTab, setActiveTab] = useState<ActiveTab>('machine');
  const [currentGames, setCurrentGames] = useState<LottoGame[]>(() => generate5Games());
  const [isSaved, setIsSaved] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // LocalStorage saved histories
  const [histories, setHistories] = useState<LottoDrawHistory[]>(() => {
    try {
      const saved = localStorage.getItem('lotto_histories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lotto_histories', JSON.stringify(histories));
    } catch {
      // Ignore
    }
  }, [histories]);

  // Handle draw complete from machine
  const handleMachineDrawComplete = (main6: number[], bonus?: number) => {
    // Also update Game A of the slip with the drawn 6
    const updatedGames: LottoGame[] = [
      {
        id: `${Date.now()}-0`,
        label: 'A',
        numbers: [...main6].sort((a, b) => a - b),
        mode: '수동',
        createdAt: Date.now(),
      },
      ...generate5Games().slice(1),
    ];
    setCurrentGames(updatedGames);
    setIsSaved(false);
  };

  const handleSendToTicket = (main6: number[]) => {
    soundManager.playClick();
    const updatedGames: LottoGame[] = [
      {
        id: `${Date.now()}-0`,
        label: 'A',
        numbers: [...main6].sort((a, b) => a - b),
        mode: '수동',
        createdAt: Date.now(),
      },
      ...generate5Games().slice(1),
    ];
    setCurrentGames(updatedGames);
    setIsSaved(false);
    setActiveTab('ticket');
  };

  // Re-generate fresh 5 games on the slip
  const handleRefreshTicket = () => {
    setCurrentGames(generate5Games());
    setIsSaved(false);
  };

  // Generate 5 games with custom filter
  const handleGenerateWithFilters = (filters: LottoFilterOptions) => {
    const games = generate5Games(filters);
    setCurrentGames(games);
    setIsSaved(false);
    setActiveTab('ticket');
  };

  // Apply lucky numbers from dream or zodiac
  const handleApplyLuckyNumbers = (numbers: number[], label = '행운수') => {
    const updatedGames: LottoGame[] = [
      {
        id: `${Date.now()}-0`,
        label: 'A',
        numbers: [...numbers].sort((a, b) => a - b),
        mode: '행운수',
        createdAt: Date.now(),
      },
      ...generate5Games().slice(1),
    ];
    setCurrentGames(updatedGames);
    setIsSaved(false);
    setActiveTab('ticket');
  };

  // Save to History
  const handleSaveToHistory = (gamesToSave: LottoGame[]) => {
    const newEntry: LottoDrawHistory = {
      id: `hist-${Date.now()}`,
      drawDate: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
      roundNumber: currentRound,
      games: gamesToSave,
    };
    setHistories((prev) => [newEntry, ...prev]);
    setIsSaved(true);
  };

  const handleDeleteHistory = (id: string) => {
    setHistories((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistories([]);
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-purple-600/5 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Round info */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl lotto-ball-1-10 flex items-center justify-center font-black text-slate-950 text-sm shadow-lg ring-2 ring-amber-400/50">
              6/45
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1">
                  로또 6/45 행운 추첨기
                </h1>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  제 {currentRound}회 대비
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                실감나는 공기 회전 추첨 & 영수증 발권 시뮬레이터
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setIsHistoryOpen(true);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors text-xs font-semibold shadow-sm"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>보관함</span>
              {histories.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {histories.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <nav className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'machine', label: '볼 추첨기', icon: CircleDot, badge: '실시간' },
            { id: 'ticket', label: '5게임 영수증', icon: Receipt },
            { id: 'filter', label: '맞춤 필터', icon: Sliders },
            { id: 'fortune', label: '꿈해몽/운세', icon: Moon },
            { id: 'stats', label: '역대 통계', icon: BarChart3 },
            { id: 'scratch', label: '즉석 스크래치', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as ActiveTab);
                }}
                className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-5 flex flex-col items-center">
        {activeTab === 'machine' && (
          <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <LottoMachine
              onDrawComplete={handleMachineDrawComplete}
              onSendToTicket={handleSendToTicket}
            />

            {/* Quick mini slip preview under machine */}
            <div className="w-full max-w-md pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
                <span>현재 발권표 미리보기</span>
                <button
                  onClick={() => setActiveTab('ticket')}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  영수증 전체보기 &gt;
                </button>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                {currentGames.slice(0, 3).map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-amber-400 w-12">{g.label} ({g.mode})</span>
                    <div className="flex items-center gap-1.5">
                      {g.numbers.map((n) => (
                        <span
                          key={`${g.id}-${n}`}
                          className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px]"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ticket' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            <TicketSlip
              games={currentGames}
              roundNumber={currentRound}
              onRefresh={handleRefreshTicket}
              onSaveToHistory={handleSaveToHistory}
              isSaved={isSaved}
            />
          </div>
        )}

        {activeTab === 'filter' && (
          <div className="w-full animate-in fade-in duration-200">
            <FilterPanel onGenerateWithFilters={handleGenerateWithFilters} />
          </div>
        )}

        {activeTab === 'fortune' && (
          <div className="w-full animate-in fade-in duration-200">
            <DreamFortune onApplyLuckyNumbers={handleApplyLuckyNumbers} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="w-full animate-in fade-in duration-200">
            <StatisticsView currentTestNumbers={currentGames[0]?.numbers} />
          </div>
        )}

        {activeTab === 'scratch' && (
          <div className="w-full animate-in fade-in duration-200">
            <ScratchCard onApplyLuckyNumbers={handleApplyLuckyNumbers} />
          </div>
        )}
      </main>

      {/* History Modal Drawer */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        histories={histories}
        onDeleteHistory={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-3xl mx-auto space-y-1.5">
          <p className="font-semibold text-slate-400">
            로또 6/45 행운 추첨기 • 대한민국 동행복권 6/45 규칙 및 공식 볼 색상 준수
          </p>
          <p className="text-[11px] text-slate-600">
            본 서비스는 확률 기반 번호 생성 및 통계 시뮬레이션을 제공하며, 실제 당첨을 보장하지 않습니다. 복권 과몰입을 예방하고 건전하게 즐기세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
