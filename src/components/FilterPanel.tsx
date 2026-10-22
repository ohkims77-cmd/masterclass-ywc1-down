import React, { useState } from 'react';
import { LottoFilterOptions } from '../types/lotto';
import { LottoBall } from './LottoBall';
import { Sliders, Sparkles, AlertCircle, RotateCcw, Check, Plus, Minus } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface FilterPanelProps {
  onGenerateWithFilters: (filters: LottoFilterOptions) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onGenerateWithFilters }) => {
  const [activeTab, setActiveTab] = useState<'include' | 'exclude'>('include');
  const [includeNumbers, setIncludeNumbers] = useState<number[]>([]);
  const [excludeNumbers, setExcludeNumbers] = useState<number[]>([]);
  const [oddEvenRatio, setOddEvenRatio] = useState<'any' | '3:3' | '4:2' | '2:4'>('3:3');
  const [sumRange, setSumRange] = useState<[number, number]>([100, 175]);
  const [avoidConsecutive3, setAvoidConsecutive3] = useState(true);

  // Toggle selection on 1~45 grid
  const handleToggleNumber = (num: number) => {
    soundManager.playClick();
    if (activeTab === 'include') {
      if (includeNumbers.includes(num)) {
        setIncludeNumbers(includeNumbers.filter((n) => n !== num));
      } else {
        if (includeNumbers.length >= 5) {
          alert('고정수는 최대 5개까지 선택할 수 있습니다 (6개 중 1개 이상은 랜덤 추출).');
          return;
        }
        // Remove from excludes if present
        setExcludeNumbers(excludeNumbers.filter((n) => n !== num));
        setIncludeNumbers([...includeNumbers, num].sort((a, b) => a - b));
      }
    } else {
      if (excludeNumbers.includes(num)) {
        setExcludeNumbers(excludeNumbers.filter((n) => n !== num));
      } else {
        if (excludeNumbers.length >= 25) {
          alert('제외수가 너무 많으면 번호 조합 생성이 어려울 수 있습니다.');
          return;
        }
        // Remove from includes if present
        setIncludeNumbers(includeNumbers.filter((n) => n !== num));
        setExcludeNumbers([...excludeNumbers, num].sort((a, b) => a - b));
      }
    }
  };

  const handleResetFilters = () => {
    soundManager.playClick();
    setIncludeNumbers([]);
    setExcludeNumbers([]);
    setOddEvenRatio('3:3');
    setSumRange([100, 175]);
    setAvoidConsecutive3(true);
  };

  const handleApply = () => {
    soundManager.playFanfare();
    onGenerateWithFilters({
      includeNumbers,
      excludeNumbers,
      oddEvenRatio,
      sumRange,
      avoidConsecutive3,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">조건별 맞춤 추첨기</h2>
            <p className="text-xs text-slate-400">고정수/제외수와 통계적 황금비율 필터를 지정하여 추첨합니다</p>
          </div>
        </div>

        <button
          onClick={handleResetFilters}
          className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>초기화</span>
        </button>
      </div>

      {/* Tabs: 고정수 vs 제외수 선택 */}
      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('include')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'include'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📌 반드시 포함할 고정수</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-950/20">
              {includeNumbers.length}/5
            </span>
          </button>

          <button
            onClick={() => setActiveTab('exclude')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'exclude'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚫 제외할 번호</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-950/20">
              {excludeNumbers.length}
            </span>
          </button>
        </div>

        {/* Selected numbers display chips */}
        <div className="min-h-[48px] p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center gap-1.5">
          {activeTab === 'include' ? (
            includeNumbers.length === 0 ? (
              <span className="text-xs text-slate-500 italic">
                아래 번호판에서 무조건 포함하고 싶은 번호를 1~5개 터치하세요.
              </span>
            ) : (
              includeNumbers.map((num) => (
                <div key={`inc-${num}`} className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 rounded-full pl-1 pr-2 py-0.5">
                  <LottoBall number={num} size="sm" />
                  <button
                    onClick={() => handleToggleNumber(num)}
                    className="text-amber-300 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ))
            )
          ) : excludeNumbers.length === 0 ? (
            <span className="text-xs text-slate-500 italic">
              아래 번호판에서 제외하고 싶은 번호를 터치하세요.
            </span>
          ) : (
            excludeNumbers.map((num) => (
              <div key={`exc-${num}`} className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 rounded-full pl-1 pr-2 py-0.5">
                <LottoBall number={num} size="sm" />
                <button
                  onClick={() => handleToggleNumber(num)}
                  className="text-rose-300 hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* 1 ~ 45 Number Selection Grid */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
          <div className="grid grid-cols-9 sm:grid-cols-9 gap-1.5 sm:gap-2 justify-items-center">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
              const isIncluded = includeNumbers.includes(num);
              const isExcluded = excludeNumbers.includes(num);

              return (
                <div key={`pick-${num}`} className="relative">
                  <LottoBall
                    number={num}
                    size="sm"
                    onClick={() => handleToggleNumber(num)}
                    selected={activeTab === 'include' ? isIncluded : isExcluded}
                    className={
                      isExcluded && activeTab !== 'exclude'
                        ? 'opacity-30 line-through'
                        : isIncluded && activeTab !== 'include'
                        ? 'ring-2 ring-amber-400'
                        : ''
                    }
                  />
                  {isIncluded && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center pointer-events-none shadow">
                      ✓
                    </span>
                  )}
                  {isExcluded && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center pointer-events-none shadow">
                      ✕
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistical Constraints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Odd / Even Ratio */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300">홀짝 황금비율</span>
              <p className="text-[11px] text-slate-500 mt-0.5">역대 당첨 75% 이상이 3:3 또는 4:2 비율</p>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              {[
                { id: '3:3', label: '3:3 (최다)' },
                { id: '4:2', label: '홀4:짝2' },
                { id: '2:4', label: '홀2:짝4' },
                { id: 'any', label: '무관' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundManager.playClick();
                    setOddEvenRatio(opt.id as any);
                  }}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition-all ${
                    oddEvenRatio === opt.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sum Range & Consecutive */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">번호 총합 구간</span>
                <span className="text-xs font-black text-amber-400">
                  {sumRange[0]} ~ {sumRange[1]}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">황금 합계 구간 100~175 범위 필터링</p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidConsecutive3}
                  onChange={(e) => setAvoidConsecutive3(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>3연속 번호 제외 (예: 11,12,13)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleApply}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl hover:shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>설정된 맞춤 조건으로 5게임 영수증 생성</span>
        </button>
      </div>
    </div>
  );
};
