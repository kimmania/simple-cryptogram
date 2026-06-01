import { createGameState } from './puzzle';
import type { Difficulty, GameState, GameStatus } from './types';
import { STORAGE_KEY } from './types';

interface SavedGame {
  puzzleId: string;
  difficulty: Difficulty;
  solution: string;
  ciphertext: string;
  cipherKeys: string[];
  givenKeys: number[];
  playerEntries: [number, string][];
  mistakenKeys: number[];
  mistakes: number;
  selectedKey: number | null;
  status: GameStatus;
  attribution?: string;
}

export function saveGame(state: GameState): void {
  const saved: SavedGame = {
    puzzleId: state.puzzleId,
    difficulty: state.difficulty,
    solution: state.solution,
    ciphertext: state.ciphertext,
    cipherKeys: state.cipherKeys,
    givenKeys: Array.from(state.givenKeys),
    playerEntries: Array.from(state.playerMap.entries()),
    mistakenKeys: Array.from(state.mistakenKeys),
    mistakes: state.mistakes,
    selectedKey: state.selectedKey,
    status: state.status,
    attribution: state.attribution,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage full or unavailable.
  }
}

export function loadSavedGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw) as SavedGame;
    const puzzle = {
      id: saved.puzzleId,
      difficulty: saved.difficulty,
      solution: saved.solution,
      ciphertext: saved.ciphertext,
      cipherKeys: saved.cipherKeys,
      givenKeys: saved.givenKeys,
      attribution: saved.attribution,
    };

    const state = createGameState(puzzle);
    state.playerMap = new Map(saved.playerEntries);
    state.mistakenKeys = new Set(saved.mistakenKeys);
    state.mistakes = saved.mistakes;
    state.selectedKey = saved.selectedKey;
    state.status = saved.status;
    return state;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
