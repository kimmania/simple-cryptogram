import { solutionLetterForKey } from './cipher';
import type { GameState } from './types';
import { MAX_MISTAKES } from './types';

export function isPlainLetterUsed(state: GameState, letter: string, exceptKey?: number): boolean {
  for (const [keyIndex, mapped] of state.playerMap) {
    if (exceptKey !== undefined && keyIndex === exceptKey) continue;
    if (mapped === letter) return true;
  }
  return false;
}

export function canAssign(state: GameState, keyIndex: number, letter: string): boolean {
  if (state.givenKeys.has(keyIndex)) return false;
  if (state.status !== 'playing') return false;
  return !isPlainLetterUsed(state, letter, keyIndex);
}

export interface AssignResult {
  applied: boolean;
  mistakeAdded: boolean;
}

export function assignLetter(state: GameState, keyIndex: number, letter: string): AssignResult {
  if (state.givenKeys.has(keyIndex) || state.status !== 'playing') {
    return { applied: false, mistakeAdded: false };
  }

  const upper = letter.toUpperCase();
  if (upper.length !== 1 || upper < 'A' || upper > 'Z') {
    return { applied: false, mistakeAdded: false };
  }

  if (isPlainLetterUsed(state, upper, keyIndex)) {
    return { applied: false, mistakeAdded: false };
  }

  const correct = solutionLetterForKey(
    state.solution,
    state.ciphertext,
    state.cipherKeys,
    keyIndex,
  );

  const previous = state.playerMap.get(keyIndex);
  if (previous === upper) {
    return { applied: true, mistakeAdded: false };
  }

  state.playerMap.set(keyIndex, upper);

  if (upper === correct) {
    return { applied: true, mistakeAdded: false };
  }

  if (state.mistakenKeys.has(keyIndex)) {
    return { applied: true, mistakeAdded: false };
  }

  state.mistakenKeys.add(keyIndex);
  state.mistakes += 1;
  if (state.mistakes >= MAX_MISTAKES) {
    state.status = 'lost';
  }

  return { applied: true, mistakeAdded: true };
}

export function clearKey(state: GameState, keyIndex: number): boolean {
  if (state.givenKeys.has(keyIndex) || state.status !== 'playing') return false;
  if (!state.playerMap.has(keyIndex)) return false;
  state.playerMap.delete(keyIndex);
  return true;
}

export function guessForKey(state: GameState, keyIndex: number): string {
  return state.playerMap.get(keyIndex) ?? '';
}
