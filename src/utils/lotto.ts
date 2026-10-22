import { LottoFilterOptions, LottoGame, NumberStat } from '../types/lotto';

/**
 * Get Korean official Lotto ball color class
 */
export function getBallColorClass(num: number): string {
  if (num <= 10) return 'lotto-ball-1-10';
  if (num <= 20) return 'lotto-ball-11-20';
  if (num <= 30) return 'lotto-ball-21-30';
  if (num <= 40) return 'lotto-ball-31-40';
  return 'lotto-ball-41-45';
}

export function getBallHexColor(num: number): string {
  if (num <= 10) return '#f59e0b';
  if (num <= 20) return '#0284c7';
  if (num <= 30) return '#e11d48';
  if (num <= 40) return '#64748b';
  return '#84cc16';
}

export function getBallCategoryName(num: number): string {
  if (num <= 10) return '1~10 (노랑)';
  if (num <= 20) return '11~20 (파랑)';
  if (num <= 30) return '21~30 (빨강)';
  if (num <= 40) return '31~40 (회색)';
  return '41~45 (초록)';
}

/**
 * Generates 6 random unique lotto numbers (1 to 45)
 */
export function generateRandom6(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 6) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) {
      numbers.push(n);
    }
  }
  return numbers.sort((a, b) => a - b);
}

/**
 * Generates single bonus number not in existing 6
 */
export function generateBonusNumber(existing: number[]): number {
  let bonus: number;
  do {
    bonus = Math.floor(Math.random() * 45) + 1;
  } while (existing.includes(bonus));
  return bonus;
}

/**
 * Advanced lotto generator with filtering options
 */
export function generateFilteredNumbers(filters: LottoFilterOptions): number[] {
  const {
    includeNumbers = [],
    excludeNumbers = [],
    oddEvenRatio = 'any',
    sumRange = [100, 175],
    avoidConsecutive3 = true,
  } = filters;

  const validIncludes = includeNumbers.filter(n => n >= 1 && n <= 45 && !excludeNumbers.includes(n));
  if (validIncludes.length > 5) {
    return validIncludes.slice(0, 6).sort((a, b) => a - b);
  }

  const pool: number[] = [];
  for (let i = 1; i <= 45; i++) {
    if (!excludeNumbers.includes(i) && !validIncludes.includes(i)) {
      pool.push(i);
    }
  }

  // Safety check if pool has enough numbers
  const needed = 6 - validIncludes.length;
  if (pool.length < needed) {
    // Fallback if user excluded too many numbers
    return generateRandom6();
  }

  let attempts = 0;
  const MAX_ATTEMPTS = 500;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const candidate = [...validIncludes, ...shuffled.slice(0, needed)].sort((a, b) => a - b);

    // Filter: Sum range
    const sum = candidate.reduce((a, b) => a + b, 0);
    if (sum < sumRange[0] || sum > sumRange[1]) {
      continue;
    }

    // Filter: Odd / Even ratio
    if (oddEvenRatio !== 'any') {
      const oddCount = candidate.filter(n => n % 2 !== 0).length;
      if (oddEvenRatio === '3:3' && oddCount !== 3) continue;
      if (oddEvenRatio === '4:2' && oddCount !== 4) continue;
      if (oddEvenRatio === '2:4' && oddCount !== 2) continue;
    }

    // Filter: Avoid 3 consecutive numbers (e.g., 14, 15, 16)
    if (avoidConsecutive3) {
      let hasConsecutive3 = false;
      for (let i = 0; i < candidate.length - 2; i++) {
        if (candidate[i + 1] === candidate[i] + 1 && candidate[i + 2] === candidate[i] + 2) {
          hasConsecutive3 = true;
          break;
        }
      }
      if (hasConsecutive3) continue;
    }

    return candidate;
  }

  // Fallback to random pick from pool + includes if strict conditions timed out
  const fallbackShuffled = [...pool].sort(() => Math.random() - 0.5);
  return [...validIncludes, ...fallbackShuffled.slice(0, needed)].sort((a, b) => a - b);
}

/**
 * Generate 5 games (A, B, C, D, E) standard slip
 */
export function generate5Games(filters?: LottoFilterOptions): LottoGame[] {
  const labels: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const now = Date.now();

  return labels.map((label, idx) => {
    let nums: number[];
    let mode: '자동' | '반자동' | '수동' | '행운수' = '자동';

    if (filters && (filters.includeNumbers.length > 0 || filters.excludeNumbers.length > 0 || filters.oddEvenRatio !== 'any')) {
      nums = generateFilteredNumbers(filters);
      mode = filters.includeNumbers.length > 0 ? '반자동' : '자동';
    } else {
      nums = generateRandom6();
      mode = '자동';
    }

    return {
      id: `${now}-${idx}`,
      label,
      numbers: nums,
      mode,
      createdAt: now,
    };
  });
}

/**
 * Historical Realistic Frequency Data based on Korean Lotto 6/45 real trends
 * (Total ~1,100+ rounds average frequency is ~170 times per number)
 */
export const HISTORICAL_STATS: NumberStat[] = [
  { num: 34, count: 198, percentage: 8.8, lastAppearedRound: 2, colorCategory: 4 },
  { num: 12, count: 194, percentage: 8.6, lastAppearedRound: 4, colorCategory: 2 },
  { num: 27, count: 191, percentage: 8.5, lastAppearedRound: 1, colorCategory: 3 },
  { num: 13, count: 189, percentage: 8.4, lastAppearedRound: 5, colorCategory: 2 },
  { num: 18, count: 188, percentage: 8.3, lastAppearedRound: 3, colorCategory: 2 },
  { num: 45, count: 186, percentage: 8.2, lastAppearedRound: 1, colorCategory: 5 },
  { num: 1, count: 185, percentage: 8.2, lastAppearedRound: 8, colorCategory: 1 },
  { num: 33, count: 183, percentage: 8.1, lastAppearedRound: 2, colorCategory: 4 },
  { num: 20, count: 182, percentage: 8.1, lastAppearedRound: 6, colorCategory: 2 },
  { num: 40, count: 180, percentage: 8.0, lastAppearedRound: 4, colorCategory: 4 },
  { num: 37, count: 179, percentage: 7.9, lastAppearedRound: 1, colorCategory: 4 },
  { num: 14, count: 178, percentage: 7.9, lastAppearedRound: 7, colorCategory: 2 },
  { num: 26, count: 177, percentage: 7.8, lastAppearedRound: 3, colorCategory: 3 },
  { num: 43, count: 176, percentage: 7.8, lastAppearedRound: 9, colorCategory: 5 },
  { num: 17, count: 175, percentage: 7.7, lastAppearedRound: 5, colorCategory: 2 },
  { num: 4, count: 174, percentage: 7.7, lastAppearedRound: 11, colorCategory: 1 },
  { num: 10, count: 173, percentage: 7.7, lastAppearedRound: 2, colorCategory: 1 },
  { num: 2, count: 172, percentage: 7.6, lastAppearedRound: 6, colorCategory: 1 },
  { num: 38, count: 171, percentage: 7.6, lastAppearedRound: 4, colorCategory: 4 },
  { num: 11, count: 170, percentage: 7.5, lastAppearedRound: 12, colorCategory: 2 },
  { num: 31, count: 169, percentage: 7.5, lastAppearedRound: 3, colorCategory: 4 },
  { num: 24, count: 168, percentage: 7.4, lastAppearedRound: 7, colorCategory: 3 },
  { num: 3, count: 167, percentage: 7.4, lastAppearedRound: 10, colorCategory: 1 },
  { num: 7, count: 166, percentage: 7.4, lastAppearedRound: 14, colorCategory: 1 },
  { num: 15, count: 165, percentage: 7.3, lastAppearedRound: 8, colorCategory: 2 },
  { num: 39, count: 164, percentage: 7.3, lastAppearedRound: 2, colorCategory: 4 },
  { num: 6, count: 163, percentage: 7.2, lastAppearedRound: 15, colorCategory: 1 },
  { num: 19, count: 162, percentage: 7.2, lastAppearedRound: 4, colorCategory: 2 },
  { num: 35, count: 161, percentage: 7.1, lastAppearedRound: 13, colorCategory: 4 },
  { num: 21, count: 160, percentage: 7.1, lastAppearedRound: 5, colorCategory: 3 },
  { num: 44, count: 159, percentage: 7.0, lastAppearedRound: 1, colorCategory: 5 },
  { num: 16, count: 158, percentage: 7.0, lastAppearedRound: 6, colorCategory: 2 },
  { num: 28, count: 157, percentage: 7.0, lastAppearedRound: 9, colorCategory: 3 },
  { num: 36, count: 156, percentage: 6.9, lastAppearedRound: 8, colorCategory: 4 },
  { num: 5, count: 155, percentage: 6.9, lastAppearedRound: 16, colorCategory: 1 },
  { num: 25, count: 154, percentage: 6.8, lastAppearedRound: 11, colorCategory: 3 },
  { num: 42, count: 153, percentage: 6.8, lastAppearedRound: 3, colorCategory: 5 },
  { num: 8, count: 152, percentage: 6.7, lastAppearedRound: 18, colorCategory: 1 },
  { num: 32, count: 151, percentage: 6.7, lastAppearedRound: 4, colorCategory: 4 },
  { num: 41, count: 150, percentage: 6.6, lastAppearedRound: 17, colorCategory: 5 },
  { num: 30, count: 149, percentage: 6.6, lastAppearedRound: 7, colorCategory: 3 },
  { num: 23, count: 148, percentage: 6.5, lastAppearedRound: 20, colorCategory: 3 },
  { num: 29, count: 145, percentage: 6.4, lastAppearedRound: 22, colorCategory: 3 },
  { num: 22, count: 142, percentage: 6.3, lastAppearedRound: 19, colorCategory: 3 },
  { num: 9, count: 139, percentage: 6.1, lastAppearedRound: 24, colorCategory: 1 },
];

/**
 * Dream Dictionary (꿈해몽 길몽 추천 번호)
 */
export interface DreamItem {
  id: string;
  category: string;
  title: string;
  symbol: string;
  description: string;
  luckyNumbers: number[];
  recommendation: string;
}

export const DREAM_DATABASE: DreamItem[] = [
  {
    id: 'pig',
    category: '재물/풍요',
    title: '돼지 꿈 (황금돼지 / 새끼돼지)',
    symbol: '🐷',
    description: '집안으로 돼지가 들어오거나 황금돼지를 품에 안는 최고의 재물몽',
    luckyNumbers: [8, 12, 17, 34, 45],
    recommendation: '재물운이 최고조에 달한 날! 8과 45를 포함하여 도전해보세요.',
  },
  {
    id: 'dragon',
    category: '대성/명예',
    title: '용/이무기 승천 꿈',
    symbol: '🐉',
    description: '용이 여의주를 물고 하늘로 승천하거나 나를 감싸는 입신양명 길몽',
    luckyNumbers: [4, 7, 10, 24, 44],
    recommendation: '큰 기운이 솟구치는 길몽입니다. 7과 44의 상승 기운을 추천합니다.',
  },
  {
    id: 'fire',
    category: '번창/급상승',
    title: '불/화재 꿈 (활활 타오름)',
    symbol: '🔥',
    description: '집이나 건물이 거대한 불길에 휩싸여 붉게 활활 타오르는 사업 대박몽',
    luckyNumbers: [1, 11, 23, 31, 37],
    recommendation: '화(火) 기운의 1, 23번이 번영의 기운을 불어넣습니다.',
  },
  {
    id: 'ancestor',
    category: '은혜/행운',
    title: '조상님/돌아가신 부모님 꿈',
    symbol: '👵',
    description: '온화한 표정으로 무언가를 쥐어주시거나 숫자를 알려주시는 꿈',
    luckyNumbers: [1, 9, 14, 21, 38],
    recommendation: '조상님의 보살핌과 계시! 1번과 21번을 꼭 눈여겨보세요.',
  },
  {
    id: 'poop',
    category: '횡재수',
    title: '황금/대변(똥) 꿈',
    symbol: '💩',
    description: '황금빛 똥을 온몸에 뒤집어쓰거나 밟는 대표적인 횡재수 길몽',
    luckyNumbers: [3, 15, 20, 28, 41],
    recommendation: '한국 대표 복권 당첨자들의 최다 빈출 꿈! 3, 28번 추천.',
  },
  {
    id: 'water',
    category: '정화/생명',
    title: '맑은 물 / 큰 바다 / 홍수 꿈',
    symbol: '🌊',
    description: '온 세상이 깨끗한 물로 가득 차거나 거대한 파도를 타는 정화몽',
    luckyNumbers: [2, 5, 19, 27, 39],
    recommendation: '재물이 물밀듯이 쏟아지는 기운, 2번과 27번 조합.',
  },
  {
    id: 'president',
    category: '권력/신분상승',
    title: '대통령 / 유명인과 악수하는 꿈',
    symbol: '👑',
    description: '국가원수나 대스타와 다정하게 악수를 나누거나 밥을 먹는 귀인몽',
    luckyNumbers: [1, 3, 8, 18, 30],
    recommendation: '귀인을 만나는 1, 18번 중심의 행운 조합입니다.',
  },
  {
    id: 'flight',
    category: '도약/자유',
    title: '비행기 타고 하늘 나는 꿈',
    symbol: '✈️',
    description: '푸른 하늘을 자유롭게 날아오르거나 우주를 향해 비행하는 도약몽',
    luckyNumbers: [6, 16, 25, 36, 42],
    recommendation: '높은 곳을 향한 비상, 6, 36, 42의 균형잡힌 배치 추천.',
  },
];

/**
 * 12 Zodiac signs (별자리) & 12 Chinese Zodiac animals (띠)
 */
export const ZODIAC_DATA = [
  { name: '물병자리 (1.20~2.18)', icon: '♒', lucky: [4, 11, 22, 29, 34, 43] },
  { name: '물고기자리 (2.19~3.20)', icon: '♓', lucky: [7, 12, 19, 28, 35, 41] },
  { name: '양자리 (3.21~4.19)', icon: '♈', lucky: [1, 9, 17, 26, 33, 45] },
  { name: '황소자리 (4.20~5.20)', icon: '♉', lucky: [2, 6, 15, 24, 38, 40] },
  { name: '쌍둥이자리 (5.21~6.21)', icon: '♊', lucky: [5, 14, 23, 31, 37, 44] },
  { name: '게자리 (6.22~7.22)', icon: '♋', lucky: [3, 8, 16, 27, 32, 42] },
  { name: '사자자리 (7.23~8.22)', icon: '♌', lucky: [1, 10, 18, 25, 34, 45] },
  { name: '처녀자리 (8.23~9.22)', icon: '♍', lucky: [5, 12, 20, 29, 36, 43] },
  { name: '천칭자리 (9.23~10.22)', icon: '♎', lucky: [6, 13, 21, 30, 39, 41] },
  { name: '전갈자리 (10.23~11.21)', icon: '♏', lucky: [4, 9, 17, 28, 35, 44] },
  { name: '사수자리 (11.22~12.21)', icon: '♐', lucky: [3, 7, 15, 24, 33, 40] },
  { name: '염소자리 (12.22~1.19)', icon: '♑', lucky: [8, 14, 22, 31, 38, 42] },
];

/**
 * Current calculated estimated Lotto round number in Korea
 * First draw was Dec 7, 2002.
 */
export function calculateCurrentLottoRound(): number {
  const firstDate = new Date('2002-12-07T20:00:00+09:00');
  const now = new Date();
  const diffWeeks = Math.floor((now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return 1 + diffWeeks;
}

/**
 * Check match against mock winning numbers
 */
export function checkLottoRank(
  myNumbers: number[],
  winningNumbers: number[],
  bonusNumber: number
): { rank: number; matchedCount: number; matchedBonus: boolean; prizeName: string } {
  const match = myNumbers.filter(n => winningNumbers.includes(n)).length;
  const matchedBonus = myNumbers.includes(bonusNumber);

  if (match === 6) {
    return { rank: 1, matchedCount: 6, matchedBonus: false, prizeName: '🎉 1등 당첨 (약 20억원 상당!)' };
  }
  if (match === 5 && matchedBonus) {
    return { rank: 2, matchedCount: 5, matchedBonus: true, prizeName: '🥈 2등 당첨 (약 5천만원 상당)' };
  }
  if (match === 5) {
    return { rank: 3, matchedCount: 5, matchedBonus: false, prizeName: '🥉 3등 당첨 (약 150만원)' };
  }
  if (match === 4) {
    return { rank: 4, matchedCount: 4, matchedBonus: false, prizeName: '🍀 4등 당첨 (고정 50,000원)' };
  }
  if (match === 3) {
    return { rank: 5, matchedCount: 3, matchedBonus: false, prizeName: '✨ 5등 당첨 (고정 5,000원)' };
  }
  return { rank: 0, matchedCount: match, matchedBonus, prizeName: '낙첨 (다음 기회에!)' };
}
