import React, { useState } from 'react';
import { HISTORICAL_STATS, checkLottoRank, generateRandom6, generateBonusNumber } from '../utils/lotto';
import { LottoBall } from './LottoBall';
import { BarChart3, Flame, Snowflake, Trophy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { fireScreenFillingGoldenFireworks } from '../utils/goldenFireworks';

interface StatisticsViewProps {
  currentTestNumbers?: number[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ currentTestNumbers }) => {
  const [activeTab, setActiveTab] = useState<'hotcold' | 'simulator'>('hotcold');

  // Simulation state
  const [simTargetNumbers, setSimTargetNumbers] = useState<number[]>(
    currentTestNumbers && currentTestNumbers.length === 6 ? currentTestNumbers : [3, 11, 23, 27, 34, 45]
  );
  const [simWinningNumbers, setSimWinningNumbers] = useState<number[]>([4, 12, 23, 27, 34, 40]);
  const [simBonusNumber, setSimBonusNumber] = useState<number>(45);
  const [simResult, setSimResult] = useState<{
    rank: number;
    matchedCount: number;
    matchedBonus: boolean;
    prizeName: string;
  } | null>(null);

  const top10 = [...HISTORICAL_STATS].sort((a, b) => b.count - a.count).slice(0, 10);
  const cold10 = [...HISTORICAL_STATS].sort((a, b) => a.count - b.count).slice(0, 10);

  // Group distribution stats
  const colorGroups = [
    { name: '1~10번 (노랑)', color: '#f59e0b', range: '1-10', total: 1720, pct: '22.4%' },
    { name: '11~20번 (파랑)', color: '#0284c7', range: '11-20', total: 1754, pct: '22.8%' },
    { name: '21~30번 (빨강)', color: '#e11d48', range: '21-30', total: 1680, pct: '21.9%' },
    { name: '31~40번 (회색)', color: '#64748b', range: '31-40', total: 1735, pct: '22.6%' },
    { name: '41~45번 (초록)', color: '#84cc16', range: '41-45', total: 785, pct: '10.3%' }, // 5 numbers only
  ];

  // Run Simulation
  const handleRunSimulation = () => {
    soundManager.playClick();
    const winning = generateRandom6();
    const bonus = generateBonusNumber(winning);
    setSimWinningNumbers(winning);
    setSimBonusNumber(bonus);

    const result = checkLottoRank(simTargetNumbers, winning, bonus);
    setSimResult(result);

    if (result.rank > 0 && result.rank <= 3) {
      soundManager.playMajesticBrassFanfare();
      fireScreenFillingGoldenFireworks();
    } else {
      soundManager.playBallDraw(2);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">역대 통계 & 당첨 시뮬레이터</h2>
            <p className="text-xs text-slate-400">1회차부터 누적된 실제 통계 트렌드와 가상 당첨 테스트</p>
          </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('hotcold');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hotcold' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 빈출 통계
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('simulator');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'simulator' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 당첨 시뮬레이터
          </button>
        </div>
      </div>

      {activeTab === 'hotcold' ? (
        <div className="space-y-6">
          {/* Top 10 Hot Numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <Flame className="w-4 h-4" />
                <span>역대 최다 출현 HOT 10</span>
              </div>
              <span className="text-[11px] text-slate-400">누적 당첨 횟수 기준</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              {top10.map((item, idx) => (
                <div key={`hot-${item.num}`} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-400 mb-1">#{idx + 1}</span>
                  <LottoBall number={item.num} size="sm" />
                  <span className="text-[10px] text-slate-300 font-bold mt-1.5">{item.count}회</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 10 Cold Numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Snowflake className="w-4 h-4" />
                <span>최근 출현 빈도 낮은 COLD 10</span>
              </div>
              <span className="text-[11px] text-slate-400">장기 미출현 및 최소 빈출</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              {cold10.map((item, idx) => (
                <div key={`cold-${item.num}`} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">#{idx + 1}</span>
                  <LottoBall number={item.num} size="sm" />
                  <span className="text-[10px] text-slate-400 font-semibold mt-1.5">{item.count}회</span>
                </div>
              ))}
            </div>
          </div>

          {/* Color Section Proportions */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2.5">색상별 출현 점유율</div>
            <div className="space-y-2">
              {colorGroups.map((group) => (
                <div key={group.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                    <span className="text-slate-300">{group.name}</span>
                  </div>
                  <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: group.pct, backgroundColor: group.color }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono font-bold text-slate-300">{group.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Virtual Winning Simulator */
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-2">내가 테스트할 번호 6개:</div>
            <div className="flex items-center justify-center gap-2 py-2">
              {simTargetNumbers.map((n) => (
                <LottoBall key={`test-${n}`} number={n} size="md" />
              ))}
            </div>
          </div>

          {/* Simulated Round Reveal */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-semibold mb-3">가상 추첨 당첨 번호 + 보너스:</div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {simWinningNumbers.map((n) => {
                const isMatched = simTargetNumbers.includes(n);
                return (
                  <div key={`sim-win-${n}`} className="relative">
                    <LottoBall number={n} size="md" />
                    {isMatched && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}

              <span className="text-slate-500 font-black text-lg mx-1">+</span>

              <div className="relative">
                <LottoBall number={simBonusNumber} size="md" isBonus />
                {simTargetNumbers.includes(simBonusNumber) && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                    ✓
                  </span>
                )}
              </div>
            </div>

            {simResult && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className={`text-base font-black ${simResult.rank > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {simResult.prizeName}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  일치한 번호: <span className="font-bold text-white">{simResult.matchedCount}개</span>
                  {simResult.matchedBonus ? ' + 보너스 번호 일치!' : ''}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRunSimulation}
            className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>새 가상 회차로 당첨 여부 시뮬레이션 돌리기</span>
          </button>
        </div>
      )}
    </div>
  );
};
