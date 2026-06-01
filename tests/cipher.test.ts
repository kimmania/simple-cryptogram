import { describe, expect, it } from 'vitest';
import {
  buildPlainToCipher,
  encrypt,
  extractCipherKeys,
  normalizePhrase,
  solutionLetterForKey,
} from '../src/cryptogram/cipher';

describe('cipher', () => {
  it('normalizes text to uppercase', () => {
    expect(normalizePhrase('hello')).toBe('HELLO');
  });

  it('encrypts with a substitution mapping', () => {
    const map = buildPlainToCipher(() => 0.5);
    const cipher = encrypt('HELLO', map);
    expect(cipher).not.toBe('HELLO');
    expect(cipher.length).toBe(5);
  });

  it('extracts cipher keys in order of appearance', () => {
    expect(extractCipherKeys('ABCA')).toEqual(['A', 'B', 'C']);
  });

  it('resolves solution letters for cipher keys', () => {
    const solution = 'HELLO';
    const ciphertext = 'IFMMP';
    const keys = extractCipherKeys(ciphertext);
    expect(solutionLetterForKey(solution, ciphertext, keys, 0)).toBe('H');
    expect(solutionLetterForKey(solution, ciphertext, keys, 1)).toBe('E');
  });
});
