import confetti from 'canvas-confetti';

/**
 * Screen-filling dazzling Golden Fireworks celebration
 * Multiple volleys, golden starbursts, sparkling flakes, and cannons.
 */
export function fireScreenFillingGoldenFireworks() {
  const goldColors = ['#ffd700', '#ffe066', '#ffb703', '#ffffff', '#e6a100', '#fff3b0'];

  // Volley 1: Bottom-left and Bottom-right Golden Cannons
  confetti({
    particleCount: 100,
    angle: 60,
    spread: 75,
    origin: { x: 0.05, y: 0.9 },
    colors: goldColors,
    startVelocity: 65,
    ticks: 280,
    gravity: 0.85,
    scalar: 1.2,
  });

  confetti({
    particleCount: 100,
    angle: 120,
    spread: 75,
    origin: { x: 0.95, y: 0.9 },
    colors: goldColors,
    startVelocity: 65,
    ticks: 280,
    gravity: 0.85,
    scalar: 1.2,
  });

  // Volley 2 (after 250ms): High Center Skyburst
  setTimeout(() => {
    confetti({
      particleCount: 140,
      spread: 120,
      origin: { x: 0.5, y: 0.35 },
      colors: goldColors,
      startVelocity: 45,
      ticks: 300,
      gravity: 0.7,
      scalar: 1.3,
    });
  }, 250);

  // Volley 3 (after 600ms): Dual Crossfire Skybursts
  setTimeout(() => {
    confetti({
      particleCount: 85,
      spread: 90,
      origin: { x: 0.3, y: 0.45 },
      colors: goldColors,
      startVelocity: 40,
      ticks: 250,
      gravity: 0.75,
      scalar: 1.1,
    });
    confetti({
      particleCount: 85,
      spread: 90,
      origin: { x: 0.7, y: 0.45 },
      colors: goldColors,
      startVelocity: 40,
      ticks: 250,
      gravity: 0.75,
      scalar: 1.1,
    });
  }, 600);

  // Volley 4 (after 1000ms): Falling Golden Shimmer Rain
  setTimeout(() => {
    confetti({
      particleCount: 160,
      spread: 160,
      origin: { x: 0.5, y: 0.1 },
      colors: ['#ffd700', '#ffffff', '#ffeaa7'],
      startVelocity: 25,
      ticks: 350,
      gravity: 0.5,
      scalar: 0.9,
    });
  }, 1000);

  // Volley 5 (after 1500ms): Grand Finale Golden Cascade
  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 140,
      origin: { x: 0.5, y: 0.5 },
      colors: goldColors,
      startVelocity: 55,
      ticks: 300,
      gravity: 0.8,
      scalar: 1.3,
    });
  }, 1500);
}
