import { assignLetter, clearKey } from './cryptogram/mapping';
import {
  createGameState,
  findPuzzleById,
  loadPuzzles,
  resetGameState,
  startNewGame,
} from './cryptogram/puzzle';
import { clearSavedGame, loadSavedGame, saveGame } from './cryptogram/storage';
import type { GameState, Puzzle } from './cryptogram/types';
import { checkWin } from './cryptogram/validate';
import {
  bindControlHandlers,
  getSelectedDifficulty,
  setControlsDisabled,
  setDifficulty,
  showLostBanner,
  showWinBanner,
  updateMistakes,
  updatePuzzleId,
} from './ui/controls';
import { bindHelp } from './ui/help';
import { bindKeyboardHandlers, buildKeyboard, updateKeyboard } from './ui/keyboard';
import { bindPuzzleClick, createPuzzleView, renderPuzzle } from './ui/puzzle-view';

export class CryptogramApp {
  private state: GameState | null = null;
  private currentPuzzle: Puzzle | null = null;
  private puzzleView = createPuzzleView(document.getElementById('puzzle')!);
  private loading = false;

  async init(): Promise<void> {
    buildKeyboard();
    bindHelp();
    bindPuzzleClick(this.puzzleView, (keyIndex) => this.selectKey(keyIndex));
    bindControlHandlers({
      onNewGame: () => void this.newGame(),
      onReset: () => void this.handleReset(),
      onDifficultyChange: () => void this.newGame(),
    });
    bindKeyboardHandlers({
      onLetter: (letter) => this.handleLetter(letter),
      onClear: () => this.handleClear(),
    });

    document.addEventListener('keydown', (event) => this.handleKeydown(event));

    const saved = loadSavedGame();
    if (saved && (saved.status === 'playing' || saved.status === 'lost')) {
      this.state = saved;
      setDifficulty(saved.difficulty);
      this.currentPuzzle = {
        id: saved.puzzleId,
        difficulty: saved.difficulty,
        solution: saved.solution,
        ciphertext: saved.ciphertext,
        cipherKeys: saved.cipherKeys,
        givenKeys: Array.from(saved.givenKeys),
        attribution: saved.attribution,
      };
      this.refresh();
      return;
    }

    await this.newGame();
  }

  private async newGame(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    clearSavedGame();

    try {
      const difficulty = getSelectedDifficulty();
      this.state = await startNewGame(difficulty);
      const puzzles = await loadPuzzles(difficulty);
      this.currentPuzzle =
        findPuzzleById(puzzles, this.state.puzzleId) ?? {
          id: this.state.puzzleId,
          difficulty: this.state.difficulty,
          solution: this.state.solution,
          ciphertext: this.state.ciphertext,
          cipherKeys: this.state.cipherKeys,
          givenKeys: Array.from(this.state.givenKeys),
          attribution: this.state.attribution,
        };
      this.refresh();
    } catch (error) {
      console.error(error);
      alert('Could not load a puzzle. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  private async handleReset(): Promise<void> {
    if (!this.state) return;

    if (!this.currentPuzzle) {
      const puzzles = await loadPuzzles(this.state.difficulty);
      this.currentPuzzle = findPuzzleById(puzzles, this.state.puzzleId) ?? null;
    }

    if (this.currentPuzzle) {
      resetGameState(this.state, this.currentPuzzle);
    } else {
      const fresh = createGameState({
        id: this.state.puzzleId,
        difficulty: this.state.difficulty,
        solution: this.state.solution,
        ciphertext: this.state.ciphertext,
        cipherKeys: this.state.cipherKeys,
        givenKeys: Array.from(this.state.givenKeys),
        attribution: this.state.attribution,
      });
      this.state.playerMap = fresh.playerMap;
      this.state.mistakenKeys = fresh.mistakenKeys;
      this.state.mistakes = 0;
      this.state.status = 'playing';
      this.state.selectedKey = null;
    }

    this.refresh();
  }

  private selectKey(keyIndex: number): void {
    if (!this.state || this.state.status !== 'playing') return;
    this.state.selectedKey = keyIndex;
    this.refresh();
  }

  private handleLetter(letter: string): void {
    if (!this.state || this.state.status !== 'playing') return;
    const keyIndex = this.state.selectedKey;
    if (keyIndex === null) return;

    assignLetter(this.state, keyIndex, letter);

    if (checkWin(this.state)) {
      this.state.status = 'won';
    }

    this.refresh();
  }

  private handleClear(): void {
    if (!this.state || this.state.status !== 'playing') return;
    const keyIndex = this.state.selectedKey;
    if (keyIndex === null) return;
    clearKey(this.state, keyIndex);
    this.refresh();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.state || this.state.status !== 'playing') return;

    const target = event.target as HTMLElement;
    if (target.tagName === 'SELECT') return;

    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      this.handleClear();
      return;
    }

    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
      event.preventDefault();
      this.handleLetter(event.key);
    }
  }

  private getUsedLetters(): Set<string> {
    const used = new Set<string>();
    if (!this.state) return used;
    for (const [keyIndex, letter] of this.state.playerMap) {
      if (keyIndex === this.state.selectedKey) continue;
      used.add(letter);
    }
    return used;
  }

  private refresh(): void {
    if (!this.state) return;

    renderPuzzle(this.puzzleView, this.state);
    updateMistakes(this.state.mistakes);
    updatePuzzleId(this.state.puzzleId);
    showWinBanner(this.state.status === 'won', this.state.attribution);
    showLostBanner(this.state.status === 'lost');
    setControlsDisabled(this.state.status !== 'playing');

    const usedLetters = this.getUsedLetters();
    updateKeyboard({
      usedLetters,
      disabled: this.state.status !== 'playing',
    });

    if (this.state.status === 'playing' || this.state.status === 'lost') {
      saveGame(this.state);
    } else {
      clearSavedGame();
    }
  }
}

export async function bootstrap(): Promise<void> {
  const app = new CryptogramApp();
  await app.init();
}
