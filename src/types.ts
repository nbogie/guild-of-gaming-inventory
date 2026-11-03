export interface Range {
  min: number
  max: number | null
}

export interface Expansion {
  title: string
  bggId: number | null
  note: string | null
}

export interface Game {
  id: string
  title: string
  bggId: number | null
  emoji: string
  categories: string[]
  players: Range
  minAge: number
  playtimeMinutes: Range
  description: string
  expansions: Expansion[]
  notes: string | null
  /** BoardGameGeek weight, 1 (light) to 5 (heavy). Not yet collected. */
  complexity?: number | null
}

export interface Category {
  id: string
  name: string
  tagline: string | null
  emoji: string
}

export interface Inventory {
  meta: { name: string; source: string; lastUpdated: string }
  categories: Category[]
  games: Game[]
}

export const LIST_IDS = ['want-to-try', 'can-teach', 'played', 'favourite', 'not-for-me'] as const
export type ListId = (typeof LIST_IDS)[number]

export const LIST_LABELS: Record<ListId, string> = {
  'want-to-try': 'Want to try',
  'can-teach': 'Can teach',
  played: 'Played',
  favourite: 'Favourite',
  'not-for-me': 'Not for me',
}

export type Lists = Record<ListId, string[]>
