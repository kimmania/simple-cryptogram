const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function bindKeyboardHandlers(handlers: {
  onLetter: (letter: string) => void;
  onClear: () => void;
}): void {
  const keyboard = document.getElementById('keyboard');
  keyboard?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.id === 'clear-key') {
      handlers.onClear();
      return;
    }
    const letter = target.dataset.letter;
    if (letter) handlers.onLetter(letter);
  });
}

export function updateKeyboard(state: {
  usedLetters: Set<string>;
  disabled: boolean;
}): void {
  const keyboard = document.getElementById('keyboard');
  if (!keyboard) return;

  keyboard.querySelectorAll<HTMLButtonElement>('.key-btn[data-letter]').forEach((btn) => {
    const letter = btn.dataset.letter ?? '';
    const used = state.usedLetters.has(letter);
    btn.classList.toggle('used', used);
    btn.disabled = state.disabled || used;
  });

  const clearBtn = document.getElementById('clear-key') as HTMLButtonElement | null;
  if (clearBtn) clearBtn.disabled = state.disabled;
}

export function buildKeyboard(): void {
  const keyboard = document.getElementById('keyboard');
  if (!keyboard || keyboard.childElementCount > 0) return;

  for (const letter of LETTERS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key-btn';
    btn.dataset.letter = letter;
    btn.textContent = letter;
    keyboard.appendChild(btn);
  }

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.id = 'clear-key';
  clear.className = 'key-btn key-clear';
  clear.textContent = 'Clear';
  keyboard.appendChild(clear);
}
