# AI Resume Comparator

A small, friendly web app to compare resumes quickly and visually. This project is perfect for hobbyists, recruiters, or anyone who wants a lightweight way to compare two resumes side-by-side and spot differences fast.

Whether you're screening candidates or just curious which resume reads better, this tool gives you a simple UI to load two documents and compare them.

## Why this project exists

I built this as a compact, no-friction tool you can open in a browser and use right away. No backend, no accounts — just drop in two resumes and see how they stack up. It's intentionally simple so it's easy to extend or fork.

## What you'll find here

- `index.html` — the app shell and UI.
- `style.css` — lightweight styles to keep the interface clean and readable.
- `script.js` — the comparison logic and UI behavior.

## Quick start (try it now)

The easiest way to use the app is to open `index.html` in your browser. If you'd like to run a quick local server (recommended for consistent behavior), use one of these options in PowerShell:

```powershell
# If you have Python installed
python -m http.server 8000

# Or if you have Node.js installed (serve package)
# npx serve . -l 8000
```

Then open http://localhost:8000 in your browser and you should see the comparator.

## How it works (short)

Drop or paste two resume texts into the left and right panels. The app highlights differences and helps you scan content quickly — think of it as a lightweight diff for resumes.

## Contributing

Small contributions are welcome. If you fix a bug or add a tiny feature, open a pull request with a short explanation of the change. If you're planning a larger change, open an issue first so we can discuss the approach.
