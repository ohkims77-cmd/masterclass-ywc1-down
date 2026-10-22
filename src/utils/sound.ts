/**
 * Web Audio API based Sound Synthesizer for Lotto Machine.
 * High-fidelity brass fanfare, air-jet vortex stream, and ball physics audio.
 */

class SoundPlayer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private airJetGain: GainNode | null = null;
  private airJetSource: AudioBufferSourceNode | null = null;

  constructor() {}

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAirJetSound();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Continuous Golden Air-Jet Stream sound (wind / pneumatic blower turbulence)
   */
  public startAirJetSound() {
    const ctx = this.getContext();
    if (!ctx || this.airJetGain) return;

    try {
      // Generate 2 seconds of pink/brownish noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.12;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter to simulate hollow air-chamber resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      // Low frequency hum for blower motor
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, ctx.currentTime);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(oscGain);

      const masterAirGain = ctx.createGain();
      masterAirGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterAirGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.6);

      whiteNoise.connect(filter);
      filter.connect(masterAirGain);
      oscGain.connect(masterAirGain);
      masterAirGain.connect(ctx.destination);

      whiteNoise.start();
      osc.start();

      this.airJetSource = whiteNoise;
      this.airJetGain = masterAirGain;
    } catch {
      // Audio fallback
    }
  }

  public stopAirJetSound() {
    if (!this.airJetGain || !this.ctx) return;
    try {
      this.airJetGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      const gain = this.airJetGain;
      const src = this.airJetSource;
      setTimeout(() => {
        try {
          src?.stop();
          gain?.disconnect();
        } catch {
          // ignore
        }
      }, 350);
    } catch {
      // ignore
    } finally {
      this.airJetGain = null;
      this.airJetSource = null;
    }
  }

  /**
   * Sound of lotto balls colliding in the drum
   */
  public playBallClick(pitchModifier = 1) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const freq = (340 + Math.random() * 280) * pitchModifier;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.35, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * Chute suction & ejection pop sound
   */
  public playBallDraw(index: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const baseFreqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 1046.50]; // C5 to C6
      const freq = baseFreqs[Math.min(index, baseFreqs.length - 1)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.75, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.07);
      osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Ignore
    }
  }

  /**
   * Bonus ball sparkle chime
   */
  public playBonusBall() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [783.99, 987.77, 1318.51, 1567.98].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Majestic Royal Brass Fanfare (화려한 금관 빵빠레)
   * Multi-voice detuned sawtooth brass with lowpass envelope and triumphant royal chords.
   */
  public playMajesticBrassFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Brass voice synthesizer helper
      const playBrassNote = (freq: number, startTime: number, duration: number, volume = 0.18) => {
        // Dual detuned oscillators for rich brass chorus
        [-2.5, 2.5].forEach((detune) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + startTime);
          osc.detune.setValueAtTime(detune, now + startTime);

          // Brass filter sweep envelope (quick attack to bright high frequencies, sustained body, decay)
          filter.type = 'lowpass';
          filter.Q.setValueAtTime(3.5, now + startTime);
          filter.frequency.setValueAtTime(600, now + startTime);
          filter.frequency.exponentialRampToValueAtTime(3800, now + startTime + 0.06);
          filter.frequency.exponentialRampToValueAtTime(2200, now + startTime + duration);

          // Volume ADSR
          gain.gain.setValueAtTime(0.001, now + startTime);
          gain.gain.linearRampToValueAtTime(volume, now + startTime + 0.04);
          gain.gain.setValueAtTime(volume * 0.85, now + startTime + duration * 0.7);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startTime + duration + 0.12);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + startTime);
          osc.stop(now + startTime + duration + 0.15);
        });
      };

      // Triumphant Fanfare Sequence (Key of C / G triumph)
      // Call: G4 - C5 - E5 - G5
      playBrassNote(392.00, 0.0, 0.16, 0.16); // G4
      playBrassNote(523.25, 0.16, 0.16, 0.18); // C5
      playBrassNote(659.25, 0.32, 0.16, 0.20); // E5
      playBrassNote(783.99, 0.48, 0.28, 0.24); // G5 (held)

      // Flourish run: E5 - F5 - G5 - A5 - B5
      playBrassNote(659.25, 0.82, 0.10, 0.16);
      playBrassNote(698.46, 0.92, 0.10, 0.18);
      playBrassNote(783.99, 1.02, 0.12, 0.20);
      playBrassNote(880.00, 1.14, 0.12, 0.22);
      playBrassNote(987.77, 1.26, 0.14, 0.24);

      // Grand Climax Chord (Tutti Brass Section): C3 Bass + G3 + C4 + E4 + G4 + C5 (1.45s)
      const chordStart = 1.42;
      const chordDuration = 1.4;
      playBrassNote(130.81, chordStart, chordDuration, 0.25); // Tuba / C3
      playBrassNote(196.00, chordStart, chordDuration, 0.22); // G3
      playBrassNote(261.63, chordStart, chordDuration, 0.24); // C4
      playBrassNote(329.63, chordStart, chordDuration, 0.22); // E4
      playBrassNote(392.00, chordStart, chordDuration, 0.24); // G4
      playBrassNote(523.25, chordStart, chordDuration, 0.26); // C5
      playBrassNote(1046.50, chordStart, chordDuration * 0.9, 0.18); // High C6 trumpet shine

      // Golden celebratory bells shimmer over the chord
      [1318.51, 1567.98, 2093.00].forEach((bellFreq, bi) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bellFreq, now + chordStart + bi * 0.12);
        gain.gain.setValueAtTime(0.12, now + chordStart + bi * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chordStart + bi * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + chordStart + bi * 0.12);
        osc.stop(now + chordStart + bi * 0.12 + 0.85);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Fanfare alias for backward compatibility
   */
  public playFanfare() {
    this.playMajesticBrassFanfare();
  }

  /**
   * Crisp button click sound
   */
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundPlayer();
