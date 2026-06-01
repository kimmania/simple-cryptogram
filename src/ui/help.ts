export function bindHelp(): void {
  const openBtn = document.getElementById('help-btn');
  const closeBtn = document.getElementById('help-close');
  const dialog = document.getElementById('help-dialog') as HTMLDialogElement | null;

  if (!openBtn || !closeBtn || !dialog) return;

  openBtn.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  });

  closeBtn.addEventListener('click', () => {
    dialog.close();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}
