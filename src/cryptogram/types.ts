export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Puzzle {
  id: string;
  difficulty: Difficulty;
  solution: string;
  ciphertext: string;
  cipherKeys: string[];
  givenKeys: number[];
  attribution?: string;
}

export interface GameState {
  puzzleId: string;
  difficulty: Difficulty;
  solution: string;
  ciphertext: string;
  cipherKeys: string[];
  givenKeys: Set<number>;
  playerMap: Map<number, string>;
  mistakenKeys: Set<number>;
  mistakes: number;
  selectedKey: number | null;
  status: GameStatus;
  attribution?: string;
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export const MAX_MISTAKES = 3;

export const RECENT_PUZZLE_COUNT = 40;

/** Session history size by quote text (avoids the same phrase back-to-back). */
export const RECENT_SOLUTION_COUNT = 40;

export const STORAGE_KEY = 'simple-cryptogram-save';

/** Fraction of unique cipher letters revealed at start (expert uses EXPERT_GIVEN_COUNT). */
export const GIVEN_RANGES: Record<
  Exclude<Difficulty, 'expert'>,
  { minPct: number; maxPct: number }
> = {
  easy: { minPct: 0.45, maxPct: 0.55 },
  medium: { minPct: 0.3, maxPct: 0.4 },
  hard: { minPct: 0.15, maxPct: 0.25 },
};

export const EXPERT_GIVEN_COUNT = 1;

export const MIN_UNIQUE_LETTERS = 8;
