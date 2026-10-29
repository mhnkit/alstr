# Alstr

Hackathon team finder. This is an interactive demo: no sign-in, no backend, no database.
Every visitor gets their own sample data, stored in their browser (localStorage).

## Deploy to Vercel
1. Create a GitHub repository and push this folder to it.
2. On vercel.com choose Add New, then Project, and import the repository.
3. Vercel reads `vercel.json` and runs `npm run build`, then serves `dist/`.
   Leave the framework as Other and the environment variables empty. Click Deploy.

Command line instead: `npm i -g vercel`, then `vercel --prod` in this folder.

## Develop
    npm run build    # writes dist/index.html
    npm start        # builds and serves dist/ locally
    npm test         # 71 data-layer tests, plain Node, no dependencies

## Layout
    src/core.js      rules, Builder Score engine, API with role checks
    src/seed.js      sample data, dated relative to today
    src/ui1-4.js     pages and components
    src/modals.js    dialogs and forms
    src/main.js      rendering, events, resume parsing
    src/styles.css   styles; src/theme-dark.txt holds the dark theme colours
    scripts/build.mjs  inlines everything into dist/index.html

## Notes
- "Demo controls" (bottom left) switches between a student, a new student, an admin and a visitor,
  and shows the admin two-factor code. Remove the `demo-fab` button in `src/ui1.js` for a public launch.
- Resume upload uses the keyword reader; Claude-powered parsing only runs inside claude.ai.
- Fonts load from Google Fonts and the PDF reader from cdnjs, so first load needs internet.
