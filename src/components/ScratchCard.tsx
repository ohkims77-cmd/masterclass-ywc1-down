import React, { useRef, useEffect, useState } from 'react';
import { LottoBall } from './LottoBall';
import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { generateRandom6 } from '../utils/lotto';
import { soundManager } from '../utils/sound';
import { fireScreenFillingGoldenFireworks } from '../utils/goldenFireworks';

interface ScratchCardProps {
  onApplyLuckyNumbers?: (numbers: number[]) => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onApplyLuckyNumbers }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const isDrawingRef = useRef(false);

  // Initialize random hidden numbers
  const initCard = () => {
    soundManager.playClick();
    const nums = generateRandom6();
    setLuckyNumbers(nums);
    setIsRevealed(false);
    setScratchPercent(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';

    // Draw metallic gold/silver scratch coating
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#d4af37');
    grad.addColorStop(0.25, '#f5e79e');
    grad.addColorStop(0.5, '#c59b27');
    grad.addColorStop(0.75, '#fae17d');
    grad.addColorStop(1, '#aa7c11');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scratch pattern text & sparkles
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.font = 'bold 15px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ 마우스나 손가락으로 긁어보세요! ✨', canvas.width / 2, canvas.height / 2 - 12);

    ctx.font = '12px Pretendard, sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillText('숨겨진 즉석 행운 번호 6개', canvas.width / 2, canvas.height / 2 + 14);
  };

  useEffect(() => {
    initCard();
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    soundManager.playBallClick(1.4);

    // Sample pixels occasionally to check revealed ratio
    if (Math.random() < 0.2 && !isRevealed) {
      checkPercent();
    }
  };

  const checkPercent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let transparentCount = 0;

    for (let i = 3; i < data.length; i += 16) {
      if (data[i] === 0) transparentCount++;
    }

    const pct = Math.round((transparentCount / (data.length / 16)) * 100);
    setScratchPercent(pct);

    if (pct > 40 && !isRevealed) {
      setIsRevealed(true);
      soundManager.playMajesticBrassFanfare();
      fireScreenFillingGoldenFireworks();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    checkPercent();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      isDrawingRef.current = true;
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || e.touches.length === 0) return;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <div className="w-full max-w-md mx-auto glass-panel rounded-3xl p-5 border border-slate-800 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>즉석 스크래치 행운 복권</span>
        </div>
        <div className="text-slate-400">
          개봉률: <span className="font-bold text-amber-300">{scratchPercent}%</span>
        </div>
      </div>

      {/* Scratch Canvas Container */}
      <div className="relative w-full max-w-[340px] h-[160px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-inner bg-slate-950 flex items-center justify-center select-none">
        {/* Hidden Content Underneath */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="text-[11px] font-bold text-amber-300 mb-2">🎉 축하합니다! 이번 주 비밀 행운수</div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {luckyNumbers.map((num) => (
              <LottoBall key={`scratch-${num}`} number={num} size="sm" />
            ))}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">대박의 기운이 깃든 숫자입니다</div>
        </div>

        {/* Scratch Canvas Layer */}
        <canvas
          ref={canvasRef}
          width={340}
          height={160}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`absolute inset-0 w-full h-full cursor-pointer touch-none transition-opacity duration-500 ${
            isRevealed && scratchPercent > 70 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      {/* Control Buttons */}
      <div className="w-full flex gap-2 mt-4">
        <button
          onClick={initCard}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>새 복권 긁기</span>
        </button>

        {onApplyLuckyNumbers && (
          <button
            onClick={() => {
              soundManager.playFanfare();
              onApplyLuckyNumbers(luckyNumbers);
            }}
            disabled={!isRevealed && scratchPercent < 30}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>이 번호로 5게임 발권</span>
          </button>
        )}
      </div>
    </div>
  );
};
