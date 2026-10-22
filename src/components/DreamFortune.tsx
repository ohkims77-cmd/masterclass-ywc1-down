import React, { useState } from 'react';
import { DREAM_DATABASE, ZODIAC_DATA, DreamItem } from '../utils/lotto';
import { LottoBall } from './LottoBall';
import { Moon, Sparkles, Wand2, Calendar, Search } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface DreamFortuneProps {
  onApplyLuckyNumbers: (numbers: number[], label: string) => void;
}

export const DreamFortune: React.FC<DreamFortuneProps> = ({ onApplyLuckyNumbers }) => {
  const [activeTab, setActiveTab] = useState<'dream' | 'zodiac'>('dream');
  const [selectedDream, setSelectedDream] = useState<DreamItem>(DREAM_DATABASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [zodiacLucky, setZodiacLucky] = useState<number[]>([1, 7, 14, 23, 34, 45]);
  const [zodiacName, setZodiacName] = useState('염소자리');

  // Filter dreams by search query
  const filteredDreams = DREAM_DATABASE.filter(
    (d) =>
      d.title.includes(searchQuery) ||
      d.description.includes(searchQuery) ||
      d.category.includes(searchQuery)
  );

  // Calculate zodiac and fortune from birthdate
  const handleCalculateZodiac = () => {
    soundManager.playClick();
    if (!birthDate) return;
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let matched = ZODIAC_DATA[0];
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) matched = ZODIAC_DATA[0];
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) matched = ZODIAC_DATA[1];
    else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) matched = ZODIAC_DATA[2];
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) matched = ZODIAC_DATA[3];
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) matched = ZODIAC_DATA[4];
    else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) matched = ZODIAC_DATA[5];
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) matched = ZODIAC_DATA[6];
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) matched = ZODIAC_DATA[7];
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) matched = ZODIAC_DATA[8];
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) matched = ZODIAC_DATA[9];
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) matched = ZODIAC_DATA[10];
    else matched = ZODIAC_DATA[11];

    setZodiacName(matched.name);
    setZodiacLucky(matched.lucky);
  };

  const handleApplyDream = (dream: DreamItem) => {
    soundManager.playFanfare();
    // Fill remaining numbers if dream has 5
    const nums = [...dream.luckyNumbers];
    while (nums.length < 6) {
      const candidate = Math.floor(Math.random() * 45) + 1;
      if (!nums.includes(candidate)) nums.push(candidate);
    }
    nums.sort((a, b) => a - b);
    onApplyLuckyNumbers(nums, `${dream.title.split(' ')[0]} 행운수`);
  };

  const handleApplyZodiac = () => {
    soundManager.playFanfare();
    onApplyLuckyNumbers(zodiacLucky, `${zodiacName.split(' ')[0]} 운세수`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">꿈해몽 & 생년월일 운세수</h2>
            <p className="text-xs text-slate-400">한국 전통 길몽과 사주/별자리로 알아보는 이번 주 나만의 행운 번호</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('dream');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dream'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌙 꿈해몽
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('zodiac');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'zodiac'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⭐ 생년월일
          </button>
        </div>
      </div>

      {activeTab === 'dream' ? (
        <div className="space-y-4">
          {/* Dream Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="꾼 꿈의 키워드를 검색해보세요 (돼지, 용, 불, 똥, 조상 등)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Dream Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {filteredDreams.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedDream(item);
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedDream.id === item.id
                    ? 'bg-purple-950/70 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.symbol}</span>
                  <span className="text-[10px] text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full border border-purple-700/30">
                    {item.category}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-200 line-clamp-1">{item.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Dream Details & Numbers */}
          {selectedDream && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/50 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedDream.symbol}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedDream.title}</h3>
                    <p className="text-xs text-purple-300">{selectedDream.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Dream Lucky Numbers */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">추천 행운수:</span>
                  <div className="flex items-center gap-1.5">
                    {selectedDream.luckyNumbers.map((num) => (
                      <LottoBall key={`dream-${num}`} number={num} size="sm" />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyDream(selectedDream)}
                  className="w-full sm:w-auto py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>이 꿈 번호로 발권하기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Zodiac / Birthday Tab */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              생년월일을 입력해주세요
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleCalculateZodiac}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                별자리 분석
              </button>
            </div>
          </div>

          {/* Zodiac Results */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">{zodiacName} 맞춤 행운수</span>
              </div>
              <span className="text-xs text-purple-300">생년월일 기반 기운 분석</span>
            </div>

            <div className="flex items-center justify-center gap-2 py-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {zodiacLucky.map((n) => (
                <LottoBall key={`zodiac-${n}`} number={n} size="md" />
              ))}
            </div>

            <button
              onClick={handleApplyZodiac}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>별자리 행운수로 5게임 발권하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
