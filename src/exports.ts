import { inventory, playersLabel, playtimeLabel } from './data'
import type { Game, Lists } from './types'

const gameById = Object.fromEntries(inventory.games.map((g) => [g.id, g]))

function byTitle(a: Game, b: Game): number {
  return a.title.localeCompare(b.title)
}

function titles(ids: string[]): Game[] {
  return ids
    .map((id) => gameById[id])
    .filter(Boolean)
    .sort(byTitle)
}

/**
 * Markdown for pasting into Discord: titles only.
 * "Want to play" and "Want to try" are merged, with the never-played ones annotated.
 */
export function listsAsDiscordMarkdown(lists: Lists): string {
  const wantIds = Array.from(new Set([...lists['want-to-play'], ...lists['want-to-try']]))
  const sections: string[] = []

  const want = titles(wantIds)
  if (want.length) {
    const lines = want.map((g) => (lists['want-to-try'].includes(g.id) ? `${g.title} (I've never played)` : g.title))
    sections.push(`### Games I want to play\n${lines.join('\n')}`)
  }

  const teach = titles(lists['can-teach'])
  if (teach.length) {
    sections.push(`### Games I can teach\n${teach.map((g) => g.title).join('\n')}`)
  }

  return sections.join('\n\n')
}

function titleLine(g: Game): string {
  const exps = g.expansions.map((e) => e.title)
  return exps.length ? `${g.emoji} ${g.title} + ${exps.join(', ')}` : `${g.emoji} ${g.title}`
}

/**
 * The whole inventory in the format of the original Discord post.
 * A game with several categories is listed under its first one only.
 */
export function inventoryAsDiscordPost(): string {
  const head = [
    '🎲 🎉 Guild of Gaming - Board Game Inventory! 🎉',
    '',
    "Here's the master list of all the awesome games we've got on hand!",
    '',
    'Every game includes the recommended age, player count, and a quick description.',
    '',
  ]

  const sections = inventory.categories
    .map((cat) => {
      const games = inventory.games.filter((g) => g.categories[0] === cat.id).sort(byTitle)
      if (!games.length) return null
      const heading = cat.tagline ? `${cat.emoji} ${cat.name} (${cat.tagline})` : `${cat.emoji} ${cat.name}`
      const body = games.map((g) =>
        [titleLine(g), `👥 ${playersLabel(g).replace(' players', '')} | 🎂 ${g.minAge}+ | ⏱ ${playtimeLabel(g)}`, g.description].join('\n'),
      )
      return `${heading}\n\n${body.join('\n\n')}`
    })
    .filter((s): s is string => s != null)

  return `${head.join('\n')}\n\n${sections.join('\n\n\n---\n\n')}\n`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
