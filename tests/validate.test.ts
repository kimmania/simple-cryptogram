import { describe, expect, it } from 'vitest';
import { assignLetter } from '../src/cryptogram/mapping';
import { createGameState } from '../src/cryptogram/puzzle';
import type { Puzzle } from '../src/cryptogram/types';
import { checkWin } from '../src/cryptogram/validate';

const samplePuzzle: Puzzle = {
  id: 'test-1',
  difficulty: 'easy',
  solution: 'HELLO',
  ciphertext: 'IFMMP',
  cipherKeys: ['I', 'F', 'M', 'P'],
  givenKeys: [],
};

describe('validate', () => {
  it('detects a complete correct solve', () => {
    const state = createGameState(samplePuzzle);
    assignLetter(state, 0, 'H');
    assignLetter(state, 1, 'E');
    assignLetter(state, 2, 'L');
    assignLetter(state, 3, 'O');
    expect(checkWin(state)).toBe(true);
  });

  it('is not won when letters are missing', () => {
    const state = createGameState(samplePuzzle);
    assignLetter(state, 0, 'H');
    expect(checkWin(state)).toBe(false);
  });
});
