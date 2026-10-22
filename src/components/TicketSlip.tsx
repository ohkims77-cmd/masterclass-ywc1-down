import React, { useState } from 'react';
import { LottoGame } from '../types/lotto';
import { LottoBall } from './LottoBall';
import { Copy, Check, Bookmark, Printer, RefreshCw, Share2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface TicketSlipProps {
  games: LottoGame[];
  roundNumber: number;
  drawDate?: string;
  onRefresh?: () => void;
  onSaveToHistory?: (games: LottoGame[]) => void;
  isSaved?: boolean;
}

export const TicketSlip: React.FC<TicketSlipProps> = ({
  games,
  roundNumber,
  drawDate = '매주 토요일 20:35 추첨',
  onRefresh,
  onSaveToHistory,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedLocal, setSavedLocal] = useState(isSaved);

  const issueTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const serialNum = `${roundNumber} - ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;

  // Copy plain text formatted lotto slip
  const handleCopy = () => {
    soundManager.playClick();
    const lines = [
      `[로또 6/45 제 ${roundNumber}회 추천 번호]`,
      `발행일시: ${issueTime}`,
      '--------------------------------',
      ...games.map(
        (g) => `${g.label} [${g.mode}] ${g.numbers.map((n) => n.toString().padStart(2, '0')).join(' ')}`
      ),
      '--------------------------------',
      '행운 가득한 한 주 되세요! 🍀',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    soundManager.playClick();
    if (onSaveToHistory) {
      onSaveToHistory(games);
      setSavedLocal(true);
    }
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 px-1 text-xs">
        <span className="text-slate-400 font-medium">로또 복권 슬립 (5게임)</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="텍스트 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '번호 복사'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={savedLocal}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg border transition-colors shadow-sm ${
              savedLocal
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedLocal ? 'fill-current text-amber-400' : ''}`} />
            <span>{savedLocal ? '보관됨' : '보관함'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="영수증 인쇄"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">인쇄</span>
          </button>

          {onRefresh && (
            <button
              onClick={() => {
                soundManager.playClick();
                setSavedLocal(false);
                onRefresh();
              }}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors shadow-sm"
              title="새 번호 자동 생성"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>재발권</span>
            </button>
          )}
        </div>
      </div>

      {/* Ticket Body (Stylized as Authentic Korean Lotto Slip) */}
      <div className="relative w-full receipt-paper rounded-2xl p-5 sm:p-6 border border-slate-300/80 shadow-2xl overflow-hidden font-mono select-none">
        {/* Subtle top barcode watermark header */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-slate-400/60 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">로또 6/45</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">
                제 {roundNumber} 회
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-sans mt-0.5">
              발행일시: {issueTime}
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              추첨일: {drawDate}
            </div>
          </div>

          {/* Stylized QR Code Mock */}
          <div className="w-14 h-14 bg-white p-1 rounded border border-slate-400 flex flex-col items-center justify-center shadow-sm">
            <div className="grid grid-cols-4 gap-0.5 w-full h-full p-0.5 bg-slate-100">
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-200" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-200" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-200" />
              <div className="bg-slate-200" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-200" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-200" />
              <div className="bg-slate-900 rounded-[1px]" />
              <div className="bg-slate-900 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* 5 Games (A, B, C, D, E) */}
        <div className="space-y-3.5 my-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/90 hover:bg-amber-50/60 transition-colors"
            >
              <div className="flex items-center gap-1.5 shrink-0 mr-1">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  {game.label}
                </span>
                <span className="text-[10px] font-sans font-bold px-1 py-0.5 rounded bg-slate-200 text-slate-700">
                  {game.mode}
                </span>
              </div>

              {/* 6 Lotto Balls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {game.numbers.map((num) => (
                  <LottoBall key={`${game.id}-${num}`} number={num} size="sm" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom separator */}
        <div className="border-t-2 border-dashed border-slate-400/60 pt-3 mt-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-sans">
            <span className="font-semibold">발권 금액</span>
            <span className="font-black text-rose-600 text-sm">5,000 원</span>
          </div>

          <div className="mt-2 text-[10px] text-slate-500 text-center tracking-widest font-mono">
            {serialNum}
          </div>

          {/* Barcode graphic */}
          <div className="mt-2 flex justify-center items-center h-7 gap-0.5 px-4 overflow-hidden opacity-85">
            {[4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 3, 2, 6, 4, 2, 5, 1, 3, 6, 2, 4, 2, 5, 3, 6, 1, 4, 2, 5].map(
              (w, i) => (
                <div
                  key={`bar-${i}`}
                  className="bg-slate-900 h-full"
                  style={{ width: `${w * 1.5}px` }}
                />
              )
            )}
          </div>

          <div className="text-[10px] text-slate-400 text-center font-sans mt-1.5">
            동행복권 6/45 형식 기반 자동 생성표 • 행운을 빕니다!
          </div>
        </div>
      </div>
    </div>
  );
};
