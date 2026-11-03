import type { Game } from './types'

export type TimeBand = 'any' | 'quick' | 'hour' | 'long'

export const TIME_BANDS: { id: TimeBand; label: string; hint: string }[] = [
  { id: 'any', label: 'Any length', hint: '' },
  { id: 'quick', label: 'Under 45 min', hint: 'fits before food' },
  { id: 'hour', label: 'About an hour', hint: '45 to 90 min' },
  { id: 'long', label: 'Settle in', hint: 'over 90 min' },
]

export interface Filters {
  query: string
  players: number | null
  time: TimeBand
  categories: string[]
  complexity: number | null
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  players: null,
  time: 'any',
  categories: [],
  complexity: null,
}

export function isDefault(f: Filters): boolean {
  return (
    f.query.trim() === '' &&
    f.players == null &&
    f.time === 'any' &&
    f.categories.length === 0 &&
    f.complexity == null
  )
}

function fitsTime(g: Game, band: TimeBand): boolean {
  const lo = g.playtimeMinutes.min
  const hi = g.playtimeMinutes.max ?? lo
  switch (band) {
    case 'any':
      return true
    case 'quick':
      return hi < 45
    case 'hour':
      return hi >= 45 && lo <= 90
    case 'long':
      return hi > 90
  }
}

function matchesQuery(g: Game, q: string): boolean {
  if (!q) return true
  const hay = [g.title, g.description, ...g.expansions.map((e) => e.title)].join(' ').toLowerCase()
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word))
}

export function applyFilters(games: Game[], f: Filters): Game[] {
  const q = f.query.trim().toLowerCase()
  return games.filter((g) => {
    if (!matchesQuery(g, q)) return false
    if (f.players != null) {
      const { min, max } = g.players
      if (f.players < min) return false
      if (max != null && f.players > max) return false
    }
    if (!fitsTime(g, f.time)) return false
    if (f.categories.length && !f.categories.some((c) => g.categories.includes(c))) return false
    if (f.complexity != null) {
      if (g.complexity == null) return false
      if (Math.round(g.complexity) !== f.complexity) return false
    }
    return true
  })
}

export type SortKey = 'title' | 'playtime' | 'complexity'

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'title', label: 'Title' },
  { id: 'playtime', label: 'Shortest first' },
  { id: 'complexity', label: 'Lightest first' },
]

function sortTitle(t: string): string {
  return t.replace(/^(the|a)\s+/i, '').toLowerCase()
}

export function sortGames(games: Game[], key: SortKey): Game[] {
  const byTitle = (a: Game, b: Game) => sortTitle(a.title).localeCompare(sortTitle(b.title))
  const sorted = [...games]
  switch (key) {
    case 'title':
      return sorted.sort(byTitle)
    case 'playtime':
      return sorted.sort(
        (a, b) =>
          a.playtimeMinutes.min - b.playtimeMinutes.min ||
          (a.playtimeMinutes.max ?? a.playtimeMinutes.min) - (b.playtimeMinutes.max ?? b.playtimeMinutes.min) ||
          byTitle(a, b),
      )
    case 'complexity':
      return sorted.sort((a, b) => (a.complexity ?? 99) - (b.complexity ?? 99) || byTitle(a, b))
  }
}
