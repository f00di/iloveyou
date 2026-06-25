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

The included `vercel.json` routes all requests to `index.html`, which lets Vercel serve this as a plain static website.

## Deploy On GitHub Pages

1. Create a new GitHub repository.
2. Upload the repository root files to the repository.
3. In GitHub, open **Settings**.
4. Go to **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the branch that contains these files, usually `main`.
7. Select the root folder and save.

GitHub Pages will publish the static site after the deployment finishes.

## Customization

All primary animation values live near the top of `script.js`.

- Change the main message by editing `MAIN_MESSAGE`.
- Change the repeated particle text by editing `PARTICLE_TEXT`.
- Change the heart density by editing `PARTICLE_COUNT`.
- Change the red, pink, and orange tones by editing `HEART_COLOR_PALETTE`.

The headline, terminal text, and button markup are in `index.html`. The page colors, spacing, and responsive styles are in `styles.css`.
