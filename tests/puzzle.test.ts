import { beforeEach, describe, expect, it } from 'vitest';
import { pickRandomPuzzle } from '../src/cryptogram/puzzle';
import type { Puzzle } from '../src/cryptogram/types';

const puzzles: Puzzle[] = [
  {
    id: 'easy-001',
    difficulty: 'easy',
    solution: 'QUOTE ONE',
    ciphertext: 'ABC',
    cipherKeys: ['A'],
    givenKeys: [0],
  },
  {
    id: 'easy-002',
    difficulty: 'easy',
    solution: 'QUOTE TWO',
    ciphertext: 'DEF',
    cipherKeys: ['D'],
    givenKeys: [0],
  },
  {
    id: 'easy-003',
    difficulty: 'easy',
    solution: 'QUOTE ONE',
    ciphertext: 'GHI',
    cipherKeys: ['G'],
    givenKeys: [0],
  },
];

describe('pickRandomPuzzle', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('avoids recently played quotes', () => {
    const first = pickRandomPuzzle(puzzles, 'easy');
    const second = pickRandomPuzzle(puzzles, 'easy');
    expect(second.solution).not.toBe(first.solution);
  });
});
