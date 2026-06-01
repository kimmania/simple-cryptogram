import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildPlainToCipher,
  countUniqueLetters,
  encrypt,
  extractCipherKeys,
  normalizePhrase,
  shuffle,
} from '../src/cryptogram/cipher.ts';
import type { Difficulty, Puzzle } from '../src/cryptogram/types.ts';
import {
  EXPERT_GIVEN_COUNT,
  GIVEN_RANGES,
  MIN_UNIQUE_LETTERS,
} from '../src/cryptogram/types.ts';
import { solutionLetterForKey } from '../src/cryptogram/cipher.ts';

interface PhraseEntry {
  text: string;
  attribution?: string;
}

const TARGETS: Record<Difficulty, number> = {
  easy: 500,
  medium: 500,
  hard: 500,
  expert: 500,
};

/** Max puzzles sharing the same quote (different ciphers / given sets). */
const MAX_VARIANTS_PER_SOLUTION = 3;

const MAX_BUILD_ATTEMPTS_PER_SLOT = 30;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickGivenKeys(
  difficulty: Difficulty,
  cipherKeys: string[],
  ciphertext: string,
  random: () => number,
): number[] {
  const n = cipherKeys.length;
  if (n === 0) return [];

  if (difficulty === 'expert') {
    const freq = new Map<number, number>();
    for (let i = 0; i < ciphertext.length; i++) {
      const ch = ciphertext[i]!;
      const idx = cipherKeys.indexOf(ch);
      if (idx >= 0) freq.set(idx, (freq.get(idx) ?? 0) + 1);
    }
    let best = 0;
    let bestCount = -1;
    for (const [idx, count] of freq) {
      if (count > bestCount) {
        bestCount = count;
        best = idx;
      }
    }
    return [best];
  }

  const range = GIVEN_RANGES[difficulty];
  const pct = range.minPct + random() * (range.maxPct - range.minPct);
  let count = Math.round(n * pct);
  count = Math.max(1, Math.min(n - 1, count));

  const indices = cipherKeys.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices.slice(0, count).sort((a, b) => a - b);
}

function puzzleFingerprint(puzzle: Omit<Puzzle, 'id' | 'difficulty'>): string {
  return `${puzzle.ciphertext}|${puzzle.givenKeys.join(',')}`;
}

function buildPuzzle(
  phrase: PhraseEntry,
  difficulty: Difficulty,
  variant: number,
): Omit<Puzzle, 'id' | 'difficulty'> | null {
  const solution = normalizePhrase(phrase.text);
  if (countUniqueLetters(solution) < MIN_UNIQUE_LETTERS) return null;

  const random = mulberry32(
    solution.split('').reduce((a, c) => a + c.charCodeAt(0), 0) +
      difficulty.charCodeAt(0) * 1000 +
      variant * 7919,
  );

  const plainToCipher = buildPlainToCipher(random);
  const ciphertext = encrypt(solution, plainToCipher);
  if (ciphertext === solution) return null;
  const cipherKeys = extractCipherKeys(ciphertext);
  if (cipherKeys.length < MIN_UNIQUE_LETTERS) return null;

  const givenKeys = pickGivenKeys(difficulty, cipherKeys, ciphertext, random);
  if (difficulty === 'expert' && givenKeys.length !== EXPERT_GIVEN_COUNT) {
    return null;
  }

  return {
    solution,
    ciphertext,
    cipherKeys,
    givenKeys,
    attribution: phrase.attribution,
  };
}

function tryAddPuzzle(
  phrase: PhraseEntry,
  difficulty: Difficulty,
  variantSeed: number,
  seen: Set<string>,
  solutionCounts: Map<string, number>,
  puzzles: Puzzle[],
): boolean {
  const solution = normalizePhrase(phrase.text);
  const used = solutionCounts.get(solution) ?? 0;
  if (used >= MAX_VARIANTS_PER_SOLUTION) return false;

  for (let attempt = 0; attempt < MAX_BUILD_ATTEMPTS_PER_SLOT; attempt++) {
    const built = buildPuzzle(phrase, difficulty, variantSeed + attempt * 104729);
    if (!built) continue;

    const fp = puzzleFingerprint(built);
    if (seen.has(fp)) continue;

    seen.add(fp);
    solutionCounts.set(solution, used + 1);
    const idWidth = String(TARGETS[difficulty]).length;
    puzzles.push({
      id: `${difficulty}-${String(puzzles.length + 1).padStart(idWidth, '0')}`,
      difficulty,
      ...built,
    });
    return true;
  }

  return false;
}

function generateForDifficulty(
  phrases: PhraseEntry[],
  difficulty: Difficulty,
): Puzzle[] {
  const puzzles: Puzzle[] = [];
  const seen = new Set<string>();
  const solutionCounts = new Map<string, number>();
  const target = TARGETS[difficulty];
  const ordered = shuffle(phrases);

  // Pass 1: at most one variant per phrase (round-robin all quotes).
  let variant = 0;
  for (const phrase of ordered) {
    if (puzzles.length >= target) break;
    tryAddPuzzle(phrase, difficulty, variant, seen, solutionCounts, puzzles);
  }

  // Pass 2+: add more variants per quote until target or caps reached.
  variant = 1;
  while (puzzles.length < target && variant < MAX_VARIANTS_PER_SOLUTION) {
    let added = 0;
    for (const phrase of ordered) {
      if (puzzles.length >= target) break;
      if (tryAddPuzzle(phrase, difficulty, variant * 100_000, seen, solutionCounts, puzzles)) {
        added++;
      }
    }
    if (added === 0) break;
    variant++;
  }

  if (puzzles.length < target) {
    console.warn(`  ${difficulty}: only generated ${puzzles.length}/${target}`);
  }

  for (const puzzle of puzzles) {
    for (const keyIndex of puzzle.givenKeys) {
      const expected = solutionLetterForKey(
        puzzle.solution,
        puzzle.ciphertext,
        puzzle.cipherKeys,
        keyIndex,
      );
      const cipherChar = puzzle.cipherKeys[keyIndex]!;
      const pos = puzzle.ciphertext.indexOf(cipherChar);
      const actual = puzzle.solution[pos];
      if (expected !== actual) {
        throw new Error(`Invalid given key on ${puzzle.id}`);
      }
    }
  }

  const uniqueSolutions = new Set(puzzles.map((p) => p.solution)).size;
  console.log(`  ${difficulty}: ${uniqueSolutions} unique quotes in ${puzzles.length} puzzles`);

  return puzzles;
}

function dedupePhrases(entries: PhraseEntry[]): PhraseEntry[] {
  const seen = new Set<string>();
  const unique: PhraseEntry[] = [];
  for (const entry of entries) {
    const text = normalizePhrase(entry.text);
    if (seen.has(text)) continue;
    seen.add(text);
    unique.push({ text, attribution: entry.attribution });
  }
  return unique;
}

const dataPath = join(process.cwd(), 'data', 'phrases.json');
const rawPhrases = JSON.parse(readFileSync(dataPath, 'utf8')) as PhraseEntry[];

if (!Array.isArray(rawPhrases) || rawPhrases.length === 0) {
  throw new Error('data/phrases.json must be a non-empty array');
}

const phrases = dedupePhrases(rawPhrases);
console.log(`Loaded ${rawPhrases.length} phrases (${phrases.length} unique after dedupe)`);

const outDir = join(process.cwd(), 'public', 'phrases');
mkdirSync(outDir, { recursive: true });

for (const difficulty of ['easy', 'medium', 'hard', 'expert'] as Difficulty[]) {
  console.log(`Generating ${difficulty}...`);
  const started = Date.now();
  const puzzles = generateForDifficulty(phrases, difficulty);
  const path = join(outDir, `${difficulty}.json`);
  writeFileSync(path, JSON.stringify(puzzles));
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`Wrote ${path} (${puzzles.length} puzzles, ${seconds}s)`);
}

console.log('Done.');
