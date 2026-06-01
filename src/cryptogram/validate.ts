import { solutionLetterForKey } from './cipher';
import type { GameState } from './types';

export function isMappingComplete(state: GameState): boolean {
  for (let i = 0; i < state.cipherKeys.length; i++) {
    if (!state.playerMap.has(i)) return false;
  }
  return state.cipherKeys.length > 0;
}

export function isMappingCorrect(state: GameState): boolean {
  for (let i = 0; i < state.cipherKeys.length; i++) {
    const expected = solutionLetterForKey(
      state.solution,
      state.ciphertext,
      state.cipherKeys,
      i,
    );
    if (state.playerMap.get(i) !== expected) return false;
  }
  return true;
}

export function checkWin(state: GameState): boolean {
  return isMappingComplete(state) && isMappingCorrect(state);
}
