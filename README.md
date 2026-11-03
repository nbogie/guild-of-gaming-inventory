# Guild of Gaming shelf

A read-only, mobile-first web app that lists the group's board games and lets
you find something to play tonight: by player count, length, kind of game,
title, and (once the data exists) complexity. People can keep private lists on
their own device (want to try, can teach, played, favourite, not for me) and
export or import them as a file.

## Data

Everything is driven by `data/games.json`. There is no database. To add or fix
a game, edit that file and rebuild.

Each game has: `id`, `title`, `bggId`, `emoji`, `categories` (array of
category ids), `players` and `playtimeMinutes` (`min`/`max`, `max` null for
"2+"), `minAge`, `description`, `expansions` (each with `title`, `bggId`,
`note`), and `notes`. An optional `complexity` (BoardGameGeek weight, 1 to 5)
turns on the complexity filter automatically once any game has it.

## Develop

```
npm install
npm run dev        # local dev server
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Vite is configured with a relative base path, so `dist/` can be hosted from
any static host or sub-path, including GitHub Pages.
