import { describe, expect, it } from 'vitest';
import { assignLetter, canAssign, clearKey } from '../src/cryptogram/mapping';
import { createGameState } from '../src/cryptogram/puzzle';
import type { Puzzle } from '../src/cryptogram/types';
import { MAX_MISTAKES } from '../src/cryptogram/types';

const samplePuzzle: Puzzle = {
  id: 'test-1',
  difficulty: 'medium',
  solution: 'HELLO WORLD',
  ciphertext: 'IFMMP XPSME',
  cipherKeys: ['I', 'F', 'M', 'P', 'X', 'S', 'E'],
  givenKeys: [0],
};

describe('mapping', () => {
  it('assigns correct letters without mistakes', () => {
    const state = createGameState(samplePuzzle);
    const result = assignLetter(state, 1, 'E');
    expect(result.mistakeAdded).toBe(false);
    expect(state.mistakes).toBe(0);
    expect(state.playerMap.get(1)).toBe('E');
  });

  it('counts a mistake once per cipher key', () => {
    const state = createGameState(samplePuzzle);
    assignLetter(state, 1, 'Z');
    expect(state.mistakes).toBe(1);
    assignLetter(state, 1, 'Y');
    expect(state.mistakes).toBe(1);
  });

  it('ends the game after max mistakes', () => {
    const state = createGameState(samplePuzzle);
    assignLetter(state, 1, 'Z');
    assignLetter(state, 2, 'Y');
    assignLetter(state, 3, 'W');
    expect(state.mistakes).toBe(MAX_MISTAKES);
    expect(state.status).toBe('lost');
  });

  it('blocks bijection conflicts', () => {
    const state = createGameState(samplePuzzle);
    assignLetter(state, 1, 'E');
    expect(canAssign(state, 2, 'E')).toBe(false);
  });

  it('clears non-given keys', () => {
    const state = createGameState(samplePuzzle);
    assignLetter(state, 1, 'E');
    expect(clearKey(state, 1)).toBe(true);
    expect(state.playerMap.has(1)).toBe(false);
  });
});
