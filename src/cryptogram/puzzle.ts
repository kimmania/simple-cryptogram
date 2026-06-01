import type { Difficulty, GameState, Puzzle } from './types';
import { RECENT_PUZZLE_COUNT, RECENT_SOLUTION_COUNT } from './types';
import { solutionLetterForKey } from './cipher';

const puzzleCache = new Map<Difficulty, Puzzle[]>();
const recentIdKey = (difficulty: Difficulty) => `simple-cryptogram-recent-${difficulty}`;
const recentSolutionKey = (difficulty: Difficulty) =>
  `simple-cryptogram-recent-solutions-${difficulty}`;

export async function loadPuzzles(difficulty: Difficulty): Promise<Puzzle[]> {
  const cached = puzzleCache.get(difficulty);
  if (cached) return cached;

  const response = await fetch(`${import.meta.env.BASE_URL}phrases/${difficulty}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load puzzles for ${difficulty}`);
  }

  const puzzles = (await response.json()) as Puzzle[];
  puzzleCache.set(difficulty, puzzles);
  return puzzles;
}

function readRecentList(key: string, max: number): string[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.slice(0, max) : [];
  } catch {
    return [];
  }
}

function pushRecent(key: string, value: string, max: number): void {
  const recent = readRecentList(key, max).filter((existing) => existing !== value);
  recent.unshift(value);
  sessionStorage.setItem(key, JSON.stringify(recent.slice(0, max)));
}

function getRecentIds(difficulty: Difficulty): string[] {
  return readRecentList(recentIdKey(difficulty), RECENT_PUZZLE_COUNT);
}

function getRecentSolutions(difficulty: Difficulty): string[] {
  return readRecentList(recentSolutionKey(difficulty), RECENT_SOLUTION_COUNT);
}

function recordRecentPuzzle(difficulty: Difficulty, puzzle: Puzzle): void {
  pushRecent(recentIdKey(difficulty), puzzle.id, RECENT_PUZZLE_COUNT);
  pushRecent(recentSolutionKey(difficulty), puzzle.solution, RECENT_SOLUTION_COUNT);
}

export function pickRandomPuzzle(puzzles: Puzzle[], difficulty: Difficulty): Puzzle {
  if (puzzles.length === 0) {
    throw new Error(`No puzzles available for ${difficulty}`);
  }

  const recentIds = new Set(getRecentIds(difficulty));
  const recentSolutions = new Set(getRecentSolutions(difficulty));

  let pool = puzzles.filter(
    (puzzle) => !recentIds.has(puzzle.id) && !recentSolutions.has(puzzle.solution),
  );

  if (pool.length === 0) {
    pool = puzzles.filter((puzzle) => !recentSolutions.has(puzzle.solution));
  }
  if (pool.length === 0) {
    pool = puzzles.filter((puzzle) => !recentIds.has(puzzle.id));
  }
  if (pool.length === 0) {
    pool = puzzles;
  }

  const index = Math.floor(Math.random() * pool.length);
  const puzzle = pool[index]!;
  recordRecentPuzzle(difficulty, puzzle);
  return puzzle;
}

export function createGameState(puzzle: Puzzle): GameState {
  const givenKeys = new Set(puzzle.givenKeys);
  const playerMap = new Map<number, string>();

  for (const keyIndex of puzzle.givenKeys) {
    const letter = solutionLetterForKey(
      puzzle.solution,
      puzzle.ciphertext,
      puzzle.cipherKeys,
      keyIndex,
    );
    if (letter) playerMap.set(keyIndex, letter);
  }

  return {
    puzzleId: puzzle.id,
    difficulty: puzzle.difficulty,
    solution: puzzle.solution,
    ciphertext: puzzle.ciphertext,
    cipherKeys: puzzle.cipherKeys,
    givenKeys,
    playerMap,
    mistakenKeys: new Set(),
    mistakes: 0,
    selectedKey: null,
    status: 'playing',
    attribution: puzzle.attribution,
  };
}

export function resetGameState(state: GameState, puzzle: Puzzle): void {
  const fresh = createGameState(puzzle);
  state.playerMap = fresh.playerMap;
  state.mistakenKeys = fresh.mistakenKeys;
  state.mistakes = 0;
  state.selectedKey = null;
  state.status = 'playing';
}

export async function startNewGame(difficulty: Difficulty): Promise<GameState> {
  const puzzles = await loadPuzzles(difficulty);
  const puzzle = pickRandomPuzzle(puzzles, difficulty);
  return createGameState(puzzle);
}

export function findPuzzleById(puzzles: Puzzle[], id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}
