# solo-blaster (V1)

A GitHub Pages–friendly solo campaign companion for **Slugblaster** using your **Solo Blaster** rules.

## Requirements
- Node.js 18+

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
This project uses `base: './'` and `HashRouter`, so it works under `https://<user>.github.io/solo-blaster/` without extra routing configuration.

Typical deployment options:
- GitHub Actions Pages workflow (recommended)
- Build locally and push `dist/` to a Pages branch (manual)

## Notes about V1 content
- The app UI is **English** (as requested).
- **Monsters** are **canon-only** in V1 and currently include **Mathpanthers**.
- **Factions** are a **draft enrichment** (likes/dislikes) and can be made “official” later.
- Tables in `src/tables/soloTables.ts` ship with **sample entries**. Replace them with the full tables from your Solo Blaster PDF.

## Folder guide
- `src/compendiums/` – reference datasets (monsters, factions, beats)
- `src/tables/` – roll tables
- `src/storage/` – localStorage-backed campaign state

