import React from 'react';
import { LottoDrawHistory } from '../types/lotto';
import { LottoBall } from './LottoBall';
import { X, Trash2, Copy, Check, Bookmark, Calendar } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  histories: LottoDrawHistory[];
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  histories,
  onDeleteHistory,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyHistory = (hist: LottoDrawHistory) => {
    soundManager.playClick();
    const text = [
      `[로또 6/45 보관 번호 - ${hist.drawDate}]`,
      ...hist.games.map(
        (g) => `${g.label} [${g.mode}] ${g.numbers.map((n) => n.toString().padStart(2, '0')).join(' ')}`
      ),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(hist.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">내 로또 번호 보관함</h3>
              <p className="text-xs text-slate-400">저장된 티켓 총 {histories.length}개</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {histories.length > 0 && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (confirm('저장된 모든 로또 번호를 삭제하시겠습니까?')) {
                    onClearAll();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-colors"
              >
                전체 비우기
              </button>
            )}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {histories.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
              <Bookmark className="w-8 h-8 text-slate-600 stroke-[1.5]" />
              <p>아직 보관된 로또 번호가 없습니다.</p>
              <p className="text-xs text-slate-600">
                발권된 티켓에서 [보관함] 버튼을 누르면 여기에 영구 보관됩니다.
              </p>
            </div>
          ) : (
            histories.map((hist) => (
              <div
                key={hist.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{hist.drawDate}</span>
                    {hist.roundNumber && (
                      <span className="text-amber-400 font-bold ml-1">제 {hist.roundNumber}회</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyHistory(hist)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                      title="텍스트 복사"
                    >
                      {copiedId === hist.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onDeleteHistory(hist.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Games */}
                <div className="space-y-1.5">
                  {hist.games.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/60 text-xs"
                    >
                      <div className="flex items-center gap-1.5 w-16">
                        <span className="font-bold text-amber-400">{g.label}</span>
                        <span className="text-[10px] text-slate-400">({g.mode})</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {g.numbers.map((n) => (
                          <LottoBall key={`${g.id}-${n}`} number={n} size="sm" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
