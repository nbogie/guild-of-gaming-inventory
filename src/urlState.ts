import { EMPTY_FILTERS, TIME_BANDS, type Filters, type SortKey, SORT_OPTIONS, type TimeBand } from './filters'

export interface SearchState {
  filters: Filters
  sort: SortKey
}

const DEFAULT_SORT: SortKey = 'title'

/** Encode only what differs from the defaults, so a plain link stays plain. */
export function searchToParams(state: SearchState, knownCategories: string[]): URLSearchParams {
  const p = new URLSearchParams()
  const f = state.filters
  if (f.query.trim()) p.set('q', f.query.trim())
  if (f.players != null) p.set('players', String(f.players))
  if (f.time !== 'any') p.set('time', f.time)
  const cats = f.categories.filter((c) => knownCategories.includes(c))
  if (cats.length) p.set('cat', cats.join(','))
  if (f.complexity != null) p.set('cx', String(f.complexity))
  if (state.sort !== DEFAULT_SORT) p.set('sort', state.sort)
  return p
}

export function searchToUrl(state: SearchState, knownCategories: string[], base: string = window.location.href): string {
  const url = new URL(base)
  url.search = searchToParams(state, knownCategories).toString()
  url.hash = ''
  return url.toString()
}

const intIn = (v: string | null, lo: number, hi: number): number | null => {
  if (v == null) return null
  const n = Number.parseInt(v, 10)
  return Number.isInteger(n) && n >= lo && n <= hi ? n : null
}

/** Decode a query string. Unknown or malformed values fall back to the default. */
export function paramsToSearch(params: URLSearchParams, knownCategories: string[]): SearchState {
  const time = params.get('time')
  const sort = params.get('sort')
  const cats = (params.get('cat') ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter((c) => knownCategories.includes(c))
  return {
    filters: {
      ...EMPTY_FILTERS,
      query: params.get('q') ?? '',
      players: intIn(params.get('players'), 1, 12),
      time: TIME_BANDS.some((b) => b.id === time) ? (time as TimeBand) : 'any',
      categories: Array.from(new Set(cats)),
      complexity: intIn(params.get('cx'), 1, 5),
    },
    sort: SORT_OPTIONS.some((o) => o.id === sort) ? (sort as SortKey) : DEFAULT_SORT,
  }
}
