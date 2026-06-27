import type { Difficulty } from '../cryptogram/types';
import { MAX_MISTAKES } from '../cryptogram/types';

export function getDifficultySelect(): HTMLSelectElement {
  return document.getElementById('difficulty') as HTMLSelectElement;
}

export function getSelectedDifficulty(): Difficulty {
  return getDifficultySelect().value as Difficulty;
}

export function setDifficulty(difficulty: Difficulty): void {
  getDifficultySelect().value = difficulty;
}

export function updateMistakes(count: number): void {
  const el = document.getElementById('mistakes');
  if (el) el.textContent = `Mistakes: ${count}/${MAX_MISTAKES}`;
}

export function updatePuzzleId(id: string): void {
  const label = id ? `#${id}` : '';
  document.getElementById('puzzle-id')?.replaceChildren(document.createTextNode(label));
}

export function showWinBanner(show: boolean, attribution?: string): void {
  const banner = document.getElementById('win-banner');
  if (!banner) return;
  banner.classList.toggle('hidden', !show);
  const textEl = banner.querySelector('.win-text') as HTMLElement | null;
  if (!textEl) return;
  if (show && attribution) {
    textEl.textContent = `Solved! ${attribution}`;
  } else if (show) {
    textEl.textContent = 'Puzzle solved!';
  } else {
    textEl.textContent = 'Puzzle solved!';
  }
}

export function showLostBanner(show: boolean): void {
  const banner = document.getElementById('lost-banner');
  if (!banner) return;
  banner.classList.toggle('hidden', !show);
}

export function setControlsDisabled(disabled: boolean): void {
  const keyboard = document.getElementById('keyboard');
  keyboard?.classList.toggle('disabled', disabled);
}

export function bindControlHandlers(handlers: {
  onNewGame: () => void;
  onReset: () => void;
  onDifficultyChange: () => void;
}): void {
  document.getElementById('new-game')?.addEventListener('click', handlers.onNewGame);
  document.getElementById('reset')?.addEventListener('click', handlers.onReset);
  getDifficultySelect().addEventListener('change', handlers.onDifficultyChange);
}
