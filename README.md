# Simple Cryptogram

A mobile-first cryptogram puzzle game built with vanilla TypeScript. Play in the browser with four difficulty levels, three lives, and an installable PWA experience.

## Features

- **Difficulty levels:** Easy, Medium, Hard, Expert (expert reveals one starter letter)
- **Three lives:** Three mistakes end the puzzle — use Reset to try again
- **500 puzzles per level:** 400+ unique English quotes (up to 3 cipher variants each), session anti-repeat by puzzle and quote
- **Resume game:** Progress saved to local storage
- **Installable PWA:** Add to Home Screen for a full-screen app experience

## Development

```bash
npm install
npm run generate-puzzles   # first time, or after editing data/phrases.json
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173/simple-cryptogram/`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run generate-puzzles` | Regenerate phrase JSON banks |
| `npm run generate-icons` | Resize `public/icons/icon-source.png` to PWA sizes |

## GitHub Pages

Pushes to `main` deploy automatically via GitHub Actions.

1. Enable **GitHub Pages** → Source: **GitHub Actions**
2. Live site: `https://kimmania.github.io/simple-cryptogram/`

## Install on iPhone or iPad

1. Open the site in Safari
2. Tap the Share button
3. Choose **Add to Home Screen**

## License

MIT
