# Guild of Gaming shelf

A read-only, mobile-first web app that lists the group's board games and lets
you find something to play: by player count, length, kind of game,
title, and complexity. People can keep private lists on
their own device (want to play, want to try, can teach, played, favourite, not for me) and
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

## Share a search

Filters and sort can be given in the query string, so a link can open the
shelf pre-filtered. Only non-default values are needed:

| param     | values                                        |
| --------- | --------------------------------------------- |
| `q`       | title search text                             |
| `players` | 1 to 12                                       |
| `time`    | `quick`, `hour`, `long`                       |
| `cat`     | comma-separated category ids from games.json  |
| `cx`      | complexity 1 to 5                             |
| `sort`    | `playtime`, `complexity`, `age` (default title) |

Example: `/?cat=cooperative&time=hour` shows co-operative games of about an
hour. "Copy link to this search" on the shelf builds this for you.

## Tests

```
npm test           # unit tests (Vitest): filters, sorting, URL encoding
npm run test:e2e   # end-to-end tests (Playwright) against a production build
```

The end-to-end tests drive the installed Google Chrome on desktop and
iPhone-sized viewports, so no browser download is needed.
