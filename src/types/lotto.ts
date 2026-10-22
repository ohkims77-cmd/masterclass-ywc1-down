export interface LottoGame {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  numbers: number[]; // sorted 6 numbers
  mode: '자동' | '반자동' | '수동' | '행운수';
  createdAt: number;
}

export interface LottoDrawHistory {
  id: string;
  drawDate: string;
  roundNumber?: number;
  games: LottoGame[];
  bonusNumber?: number;
  note?: string;
}

export interface LottoFilterOptions {
  includeNumbers: number[]; // 고정수 (1~5개)
  excludeNumbers: number[]; // 제외수
  oddEvenRatio: 'any' | '3:3' | '4:2' | '2:4'; // 홀:짝 비율
  sumRange: [number, number]; // 번호 총합 범위 (기본 100 ~ 175)
  avoidConsecutive3: boolean; // 3연속 번호 제외
}

export interface NumberStat {
  num: number;
  count: number;
  percentage: number;
  lastAppearedRound: number; // 몇 회차 전
  colorCategory: 1 | 2 | 3 | 4 | 5;
}

export type BallColorClass =
  | 'lotto-ball-1-10'
  | 'lotto-ball-11-20'
  | 'lotto-ball-21-30'
  | 'lotto-ball-31-40'
  | 'lotto-ball-41-45';
