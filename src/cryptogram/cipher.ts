const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function normalizePhrase(text: string): string {
  return text
    .toUpperCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"');
}

export function isLetter(char: string): boolean {
  return char.length === 1 && char >= 'A' && char <= 'Z';
}

export function shuffle<T>(array: T[], random: () => number = Math.random): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Plain letter → cipher letter. */
export function buildPlainToCipher(random: () => number = Math.random): Map<string, string> {
  const plain = ALPHABET.split('');
  const cipher = shuffle(plain, random);
  const map = new Map<string, string>();
  for (let i = 0; i < 26; i++) {
    map.set(plain[i]!, cipher[i]!);
  }
  return map;
}

export function encrypt(plaintext: string, plainToCipher: Map<string, string>): string {
  let result = '';
  for (const ch of plaintext) {
    if (isLetter(ch)) {
      result += plainToCipher.get(ch) ?? ch;
    } else {
      result += ch;
    }
  }
  return result;
}

/** Unique ciphertext letters in order of first appearance. */
export function extractCipherKeys(ciphertext: string): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const ch of ciphertext) {
    if (!isLetter(ch) || seen.has(ch)) continue;
    seen.add(ch);
    keys.push(ch);
  }
  return keys;
}

export function countUniqueLetters(text: string): number {
  const seen = new Set<string>();
  for (const ch of text) {
    if (isLetter(ch)) seen.add(ch);
  }
  return seen.size;
}

export function solutionLetterForKey(
  solution: string,
  ciphertext: string,
  cipherKeys: string[],
  keyIndex: number,
): string {
  const cipherChar = cipherKeys[keyIndex];
  if (!cipherChar) return '';

  for (let i = 0; i < ciphertext.length; i++) {
    if (ciphertext[i] === cipherChar) {
      return solution[i] ?? '';
    }
  }
  return '';
}

/** Index of cipher key for a ciphertext letter, or -1. */
export function keyIndexForChar(cipherKeys: string[], char: string): number {
  return cipherKeys.indexOf(char);
}
