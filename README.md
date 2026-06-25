# Heart Landing Page

A romantic interactive static landing page with a terminal-style intro and a glowing heart made from repeated `i love you` text particles.

## Features

- Full-screen dark romantic landing page
- Animated terminal-style intro copy
- Click-anywhere reveal interaction
- Canvas-rendered heart made from hundreds of text particles
- Responsive layout for desktop and mobile
- Soft red and pink glow effects with floating text particles
- Keyboard support for the decrypt button
- `prefers-reduced-motion` support
- No frameworks, no backend, and no external dependencies

## File Structure

```text
.
|-- index.html
|-- styles.css
|-- script.js
|-- README.md
|-- vercel.json
`-- .gitignore
```

## Run Locally

Open `index.html` directly in any modern browser.

No build step or local server is required.

## Deploy On Vercel

Use these Vercel project settings:

- Framework Preset: Other
- Build Command: empty
- Output Directory: `.`
- Root Directory: repository root

The included `vercel.json` keeps Vercel configured as a plain static website.

## Deploy On GitHub Pages

Use these GitHub Pages settings:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root`

To enable it, open the repository on GitHub, go to **Settings** > **Pages**, choose the settings above, and save.

GitHub Pages will publish the site at `https://foodi.github.io/iloveyou/` after the deployment finishes.

## Customization

All primary animation values live near the top of `script.js`.

- Change the main message by editing `MAIN_MESSAGE`.
- Change the repeated particle text by editing `PARTICLE_TEXT`.
- Change the heart density by editing `PARTICLE_COUNT`.
- Change the red, pink, and orange tones by editing `HEART_COLOR_PALETTE`.

The headline, terminal text, and button markup are in `index.html`. The page colors, spacing, and responsive styles are in `styles.css`.
