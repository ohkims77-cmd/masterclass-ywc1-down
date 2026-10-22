import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Zap, Sparkles, Volume2, VolumeX, Plus, Crown, Wind } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { getBallHexColor, generateRandom6, generateBonusNumber } from '../utils/lotto';
import { soundManager } from '../utils/sound';
import { fireScreenFillingGoldenFireworks } from '../utils/goldenFireworks';

interface BallPhysics {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

interface GoldenAirParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

interface LottoMachineProps {
  onDrawComplete?: (numbers: number[], bonus?: number) => void;
  onSendToTicket?: (numbers: number[]) => void;
}

export const LottoMachine: React.FC<LottoMachineProps> = ({
  onDrawComplete,
  onSendToTicket,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | null>(null);
  const [includeBonus, setIncludeBonus] = useState(true);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [currentStepText, setCurrentStepText] = useState('황금 에어제트 추첨기 대기 중');
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);

  const ballsRef = useRef<BallPhysics[]>([]);
  const airParticlesRef = useRef<GoldenAirParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const targetNumbersRef = useRef<{ main: number[]; bonus: number } | null>(null);
  const drawTimerRef = useRef<number[]>([]);

  // Toggle Sound
  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
  };

  // Initialize 45 physics balls and air jet stream inside drum
  useEffect(() => {
    const balls: BallPhysics[] = [];
    const drumRadius = 145;
    const center = { x: 160, y: 160 };

    for (let i = 1; i <= 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (drumRadius - 32);
      balls.push({
        id: i,
        x: center.x + Math.cos(angle) * dist,
        y: center.y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 11,
        color: getBallHexColor(i),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
      });
    }
    ballsRef.current = balls;

    // Golden air-jet particles
    const airParticles: GoldenAirParticle[] = [];
    for (let i = 0; i < 70; i++) {
      airParticles.push({
        x: 160 + (Math.random() - 0.5) * 80,
        y: 270 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 3,
        vy: -(4 + Math.random() * 8),
        size: 1.5 + Math.random() * 2.5,
        alpha: Math.random(),
        maxLife: 40 + Math.random() * 40,
        life: Math.random() * 40,
      });
    }
    airParticlesRef.current = airParticles;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSoundTime = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = 160;
      const centerY = 160;
      const drumR = 145;

      // 1. Draw drum background with deep luxury dark blue & gold tint
      const bgGrad = ctx.createRadialGradient(centerX, centerY - 20, 10, centerX, centerY, drumR);
      bgGrad.addColorStop(0, 'rgba(26, 32, 53, 0.6)');
      bgGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.85)');
      bgGrad.addColorStop(1, 'rgba(7, 10, 20, 0.98)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, drumR, 0, Math.PI * 2);
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // 2. Bottom Golden Air-Jet Nozzles Graphics
      const nozzles = [115, 160, 205];
      nozzles.forEach((nx) => {
        // Nozzle housing
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(nx - 14, 275, 28, 25, [4, 4, 0, 0]);
        ctx.fill();

        const nozzleGrad = ctx.createLinearGradient(nx - 10, 275, nx + 10, 275);
        nozzleGrad.addColorStop(0, '#f59e0b');
        nozzleGrad.addColorStop(0.5, '#fef08a');
        nozzleGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = nozzleGrad;
        ctx.beginPath();
        ctx.roundRect(nx - 10, 277, 20, 12, [3, 3, 0, 0]);
        ctx.fill();

        // Pulsating golden jet glow when spinning
        if (isSpinning) {
          const jetPulse = Math.sin(time * 0.02 + nx) * 0.3 + 0.7;
          const beamGrad = ctx.createLinearGradient(nx, 275, nx, 100);
          beamGrad.addColorStop(0, `rgba(255, 220, 100, ${0.45 * jetPulse})`);
          beamGrad.addColorStop(0.4, `rgba(245, 158, 11, ${0.2 * jetPulse})`);
          beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(nx - 8, 275);
          ctx.lineTo(nx - 22, 100);
          ctx.lineTo(nx + 22, 100);
          ctx.lineTo(nx + 8, 275);
          ctx.closePath();
          ctx.fill();
        }
      });

      // 3. Golden Air-Jet Cyclone Vortex Lines & Swirl
      if (isSpinning) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.012);

        for (let a = 0; a < 8; a++) {
          ctx.beginPath();
          ctx.rotate(Math.PI / 4);
          const rGrad = ctx.createLinearGradient(0, 0, drumR * 0.85, 0);
          rGrad.addColorStop(0, 'rgba(255, 235, 150, 0.35)');
          rGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.15)');
          rGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.strokeStyle = rGrad;
          ctx.lineWidth = 3.5;
          ctx.moveTo(10, 0);
          ctx.quadraticCurveTo(drumR * 0.4, drumR * 0.35, drumR * 0.85, 0);
          ctx.stroke();
        }
        ctx.restore();

        // Golden air particles physics
        airParticlesRef.current.forEach((p) => {
          p.life++;
          if (p.life >= p.maxLife || p.y < 35) {
            // Respawn at bottom nozzle
            p.x = 160 + (Math.random() - 0.5) * 85;
            p.y = 270 + Math.random() * 15;
            p.vx = (Math.random() - 0.5) * 5;
            p.vy = -(6 + Math.random() * 9);
            p.life = 0;
            p.alpha = Math.random();
          }

          // Agitated by cyclone torque
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          p.vx += -dy * 0.008;
          p.vy += dx * 0.008 - 0.15; // upward lift

          p.x += p.vx;
          p.y += p.vy;

          // Render golden sparkle particle
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 230, 120, ${0.4 + (1 - p.life / p.maxLife) * 0.5})`;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        });
      }

      // 4. Physics update for 45 official balls (Yellow, Blue, Red, Slate, Green)
      const balls = ballsRef.current;

      balls.forEach((ball) => {
        if (isSpinning) {
          const dx = ball.x - centerX;
          const dy = ball.y - centerY;

          // High-pressure upward jet blast at bottom half
          if (ball.y > 190) {
            const nozzleBoost = 2.8 + Math.random() * 3.5;
            ball.vy -= nozzleBoost;
            ball.vx += (Math.random() - 0.5) * 4.5;
          }

          // Centrifugal cyclone torque & chaotic air agitation
          ball.vx += (-dy * 0.024 + (Math.random() - 0.5) * 3.0);
          ball.vy += (dx * 0.024 + (Math.random() - 0.5) * 3.0);

          ball.rotSpeed += (Math.random() - 0.5) * 0.08;
        } else {
          // Gentle settle gravity & dampening
          ball.vy += 0.12;
          ball.vx *= 0.985;
          ball.vy *= 0.985;
          ball.rotSpeed *= 0.98;
        }

        // Limit velocity
        const maxV = isSpinning ? 18 : 3.5;
        const currentV = Math.hypot(ball.vx, ball.vy);
        if (currentV > maxV) {
          ball.vx = (ball.vx / currentV) * maxV;
          ball.vy = (ball.vy / currentV) * maxV;
        }

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.rotation += ball.rotSpeed;

        // Boundary collision with drum circle
        const dx = ball.x - centerX;
        const dy = ball.y - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist + ball.radius > drumR) {
          const normalX = dx / dist;
          const normalY = dy / dist;

          // Reposition to edge
          ball.x = centerX + normalX * (drumR - ball.radius);
          ball.y = centerY + normalY * (drumR - ball.radius);

          // Elastic bounce
          const dot = ball.vx * normalX + ball.vy * normalY;
          ball.vx = (ball.vx - 2 * dot * normalX) * (isSpinning ? 0.92 : 0.85);
          ball.vy = (ball.vy - 2 * dot * normalY) * (isSpinning ? 0.92 : 0.85);

          // Sound clatter trigger throttle
          if (isSpinning && time - lastSoundTime > 65) {
            soundManager.playBallClick(0.75 + Math.random() * 0.6);
            lastSoundTime = time;
          }
        }

        // Draw Ball on canvas
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.rotation);

        // Ball shadow / motion trail if spinning fast
        if (isSpinning && currentV > 10) {
          ctx.beginPath();
          ctx.arc(-ball.vx * 0.8, -ball.vy * 0.8, ball.radius * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);

        // 3D sphere gradient on 2D canvas
        const ballGrad = ctx.createRadialGradient(
          -ball.radius * 0.35,
          -ball.radius * 0.35,
          ball.radius * 0.08,
          0,
          0,
          ball.radius
        );
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.3, ball.color);
        ballGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
        ctx.fillStyle = ballGrad;
        ctx.fill();

        // Ball number label
        ctx.fillStyle = ball.color === '#f59e0b' ? '#111827' : '#ffffff';
        ctx.font = 'bold 9.5px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.id.toString(), 0, 0.5);

        ctx.restore();
      });

      // 5. Draw Glass Sphere 3D Rim & Golden Accent Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, drumR, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      const ringGrad = ctx.createLinearGradient(0, 0, 320, 320);
      ringGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      ringGrad.addColorStop(0.35, 'rgba(255, 215, 0, 0.7)');
      ringGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.4)');
      ringGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.strokeStyle = ringGrad;
      ctx.shadowColor = isSpinning ? '#ffd700' : 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = isSpinning ? 20 : 10;
      ctx.stroke();

      // Top glass sheen highlight
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - drumR * 0.48, drumR * 0.68, drumR * 0.28, 0, 0, Math.PI * 2);
      const sheenGrad = ctx.createLinearGradient(0, centerY - drumR * 0.7, 0, centerY);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning]);

  // Clean up timers & air jet audio on unmount
  useEffect(() => {
    return () => {
      drawTimerRef.current.forEach(clearTimeout);
      soundManager.stopAirJetSound();
    };
  }, []);

  // Trigger Realistic Dynamic Golden Air-Jet Draw
  const startDraw = () => {
    if (isSpinning) return;

    soundManager.playClick();
    soundManager.startAirJetSound(); // Continuous pneumatic turbulence
    drawTimerRef.current.forEach(clearTimeout);
    drawTimerRef.current = [];

    // Pre-calculate target winning numbers
    const main6 = generateRandom6();
    const bonus = generateBonusNumber(main6);
    targetNumbersRef.current = { main: main6, bonus };

    setIsSpinning(true);
    setShowCelebrationBanner(false);
    setDrawnNumbers([]);
    setBonusNumber(null);
    setCurrentStepText('🌪️ 황금 에어제트 분사 가동! 행운볼이 역동적으로 교반됩니다');

    // Sequential ball reveal
    main6.forEach((num, index) => {
      const delay = 1300 + index * 950;
      const t = window.setTimeout(() => {
        soundManager.playBallDraw(index);
        setDrawnNumbers((prev) => [...prev, num]);
        setCurrentStepText(`🌪️ [ ${index + 1}구 추출 ] 황금 에어제트가 번호 ${num}번을 쏘아올렸습니다!`);
      }, delay);
      drawTimerRef.current.push(t);
    });

    const totalMainTime = 1300 + main6.length * 950;

    // Bonus ball reveal if enabled
    if (includeBonus) {
      const tBonus = window.setTimeout(() => {
        soundManager.playBonusBall();
        setBonusNumber(bonus);
        setCurrentStepText(`👑 2등 결정 보너스 번호: [ ${bonus} ]!`);
      }, totalMainTime + 850);
      drawTimerRef.current.push(tBonus);
    }

    // GRAND FINALE: Stop air-jet, trigger Majestic Brass Fanfare and Screen-Filling Golden Fireworks!
    const completionDelay = includeBonus ? totalMainTime + 1800 : totalMainTime + 900;
    const tComplete = window.setTimeout(() => {
      setIsSpinning(false);
      soundManager.stopAirJetSound();

      // Royal Brass Fanfare with trumpets & golden chimes
      soundManager.playMajesticBrassFanfare();

      // Screen-filling dazzling Golden Fireworks
      fireScreenFillingGoldenFireworks();

      setShowCelebrationBanner(true);
      setCurrentStepText('🎺 화려한 금관 빵빠레! 1등 황금 대박을 기원합니다! 👑');

      if (onDrawComplete) {
        onDrawComplete(main6, includeBonus ? bonus : undefined);
      }
    }, completionDelay);
    drawTimerRef.current.push(tComplete);
  };

  // Instant Draw with Fanfare & Fireworks
  const instantDraw = () => {
    soundManager.playClick();
    soundManager.stopAirJetSound();
    drawTimerRef.current.forEach(clearTimeout);
    drawTimerRef.current = [];

    const main6 = generateRandom6();
    const bonus = generateBonusNumber(main6);

    setIsSpinning(false);
    setDrawnNumbers(main6);
    setBonusNumber(includeBonus ? bonus : null);
    setShowCelebrationBanner(true);
    setCurrentStepText('⚡ 즉시 추첨 완료! 🎺 황금 빵빠레와 폭죽이 울려 퍼집니다!');

    soundManager.playMajesticBrassFanfare();
    fireScreenFillingGoldenFireworks();

    if (onDrawComplete) {
      onDrawComplete(main6, includeBonus ? bonus : undefined);
    }
  };

  // Reset
  const resetMachine = () => {
    soundManager.playClick();
    soundManager.stopAirJetSound();
    drawTimerRef.current.forEach(clearTimeout);
    drawTimerRef.current = [];
    setIsSpinning(false);
    setShowCelebrationBanner(false);
    setDrawnNumbers([]);
    setBonusNumber(null);
    setCurrentStepText('황금 에어제트 추첨기 대기 중');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Sound & Mode header controls */}
      <div className="w-full flex items-center justify-between px-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Wind className="w-3.5 h-3.5 mr-1 text-amber-400 animate-pulse" />
            황금 에어제트 교반식 드럼
          </span>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60 hover:bg-slate-800">
            <input
              type="checkbox"
              checked={includeBonus}
              onChange={(e) => setIncludeBonus(e.target.checked)}
              className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
            />
            보너스 번호 포함
          </label>
        </div>

        <button
          onClick={toggleSound}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 transition-colors"
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isMuted ? '소리 끔' : '금관 빵빠레 켬'}</span>
        </button>
      </div>

      {/* Main Machine Container */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-3xl p-5 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col items-center overflow-hidden">
        {/* Glow backdrop rays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Status ticker */}
        <div className="w-full text-center py-2 px-3 mb-3 rounded-full bg-slate-950/90 border border-amber-500/30 text-xs sm:text-sm font-bold text-amber-300 shadow-inner flex items-center justify-center gap-1.5">
          {isSpinning && <Wind className="w-4 h-4 text-amber-400 animate-spin" />}
          <span>{currentStepText}</span>
        </div>

        {/* Physics Drum Canvas with Golden Air-Jet Nozzles */}
        <div className="relative flex items-center justify-center my-1">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
          />

          {/* Machine top extraction chute tube decoration */}
          <div className="absolute -top-3 w-16 h-8 bg-gradient-to-b from-amber-400/50 via-slate-700 to-transparent border-t-2 border-x-2 border-amber-400 rounded-t-lg pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
        </div>

        {/* Celebration Announcement Banner */}
        {showCelebrationBanner && (
          <div className="w-full mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/60 shadow-[0_0_25px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 animate-bounce">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
            <div className="text-center">
              <div className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
                🎺 당첨 완료! 황금 빵빠레 & 폭죽 축제 👑
              </div>
              <div className="text-[10px] text-amber-200/80 font-medium">
                화면 가득 울려 퍼지는 1등 황금 대박 기운을 담았습니다!
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
          </div>
        )}

        {/* Winning Ball Extraction Tray */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <span>황금 에어제트로 추출된 행운 번호</span>
            <span className="text-amber-400 font-bold">
              ({drawnNumbers.length}/6{includeBonus ? ' + 보너스' : ''})
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 min-h-[58px]">
            {drawnNumbers.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-3 text-center">
                [황금 추첨 시작]을 누르면 강력한 에어제트 기류가 공을 회전시킵니다.
              </div>
            ) : (
              <>
                {drawnNumbers.map((num, idx) => (
                  <LottoBall
                    key={`drawn-${num}-${idx}`}
                    number={num}
                    size="lg"
                    animate={idx === drawnNumbers.length - 1}
                  />
                ))}

                {bonusNumber !== null && (
                  <>
                    <span className="text-slate-500 font-black text-xl px-1">
                      <Plus className="w-5 h-5 text-amber-400 inline" />
                    </span>
                    <LottoBall number={bonusNumber} size="lg" isBonus animate />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
          <button
            onClick={startDraw}
            disabled={isSpinning}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm shadow-xl transition-all ${
              isSpinning
                ? 'bg-amber-600/40 text-amber-200 cursor-not-allowed opacity-75 ring-2 ring-amber-500/50'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 cursor-pointer ring-2 ring-yellow-300/60'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? '황금 에어제트 가동 중...' : '황금 추첨 시작'}
          </button>

          <button
            onClick={instantDraw}
            disabled={isSpinning}
            className="flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            즉시 빵빠레
          </button>

          <button
            onClick={resetMachine}
            disabled={isSpinning}
            className="flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>
        </div>

        {/* Action button if drawn */}
        {drawnNumbers.length === 6 && onSendToTicket && (
          <div className="w-full mt-3">
            <button
              onClick={() => onSendToTicket(drawnNumbers)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>🎟️ 이 황금 번호로 영수증 티켓(5게임) 즉시 발권</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
