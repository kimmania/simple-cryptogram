import { isLetter, keyIndexForChar, solutionLetterForKey } from '../cryptogram/cipher';
import { guessForKey } from '../cryptogram/mapping';
import type { GameState } from '../cryptogram/types';

export interface PuzzleView {
  root: HTMLElement;
}

export function createPuzzleView(container: HTMLElement): PuzzleView {
  return { root: container };
}

export function bindPuzzleClick(
  view: PuzzleView,
  onSelectKey: (keyIndex: number) => void,
): void {
  view.root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-key]');
    if (!target) return;
    const keyIndex = parseInt(target.dataset.key ?? '', 10);
    if (!Number.isNaN(keyIndex)) onSelectKey(keyIndex);
  });
}

export function renderPuzzle(view: PuzzleView, state: GameState): void {
  const { ciphertext, cipherKeys, selectedKey, givenKeys } = state;
  const fragment = document.createDocumentFragment();
  const words = ciphertext.split(' ');

  for (let w = 0; w < words.length; w++) {
    const wordEl = document.createElement('div');
    wordEl.className = 'word';

    for (const ch of words[w]!) {
      if (isLetter(ch)) {
        const keyIndex = keyIndexForChar(cipherKeys, ch);
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'letter-cell';
        cell.dataset.key = String(keyIndex);

        if (givenKeys.has(keyIndex)) cell.classList.add('given');
        if (selectedKey !== null && keyIndex === selectedKey) {
          cell.classList.add('key-highlight');
        }

        const guess = guessForKey(state, keyIndex);
        const correct = solutionLetterForKey(
          state.solution,
          state.ciphertext,
          state.cipherKeys,
          keyIndex,
        );
        if (guess && !givenKeys.has(keyIndex) && guess !== correct) {
          cell.classList.add('wrong');
        }
        if (guess) cell.classList.add('filled');

        const cipherEl = document.createElement('span');
        cipherEl.className = 'cipher';
        cipherEl.textContent = ch;

        const guessEl = document.createElement('span');
        guessEl.className = 'guess';
        guessEl.textContent = guess || '\u00a0';

        const numEl = document.createElement('span');
        numEl.className = 'number';
        numEl.textContent = String(keyIndex + 1);

        cell.append(cipherEl, guessEl, numEl);
        wordEl.appendChild(cell);
      } else {
        const punct = document.createElement('span');
        punct.className = 'punct';
        punct.textContent = ch;
        wordEl.appendChild(punct);
      }
    }

    fragment.appendChild(wordEl);
    if (w < words.length - 1) {
      const space = document.createElement('span');
      space.className = 'word-gap';
      space.textContent = '\u00a0';
      fragment.appendChild(space);
    }
  }

  view.root.replaceChildren(fragment);
}
