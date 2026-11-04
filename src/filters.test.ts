import { describe, expect, it } from 'vitest'
import { applyFilters, EMPTY_FILTERS, sortGames } from './filters'
import type { Game } from './types'

const g = (over: Partial<Game> & { id: string }): Game => ({
  title: over.id,
  bggId: null,
  emoji: '',
  categories: ['strategy'],
  players: { min: 2, max: 4 },
  minAge: 10,
  playtimeMinutes: { min: 60, max: 60 },
  complexity: 2.5,
  description: '',
  expansions: [],
  notes: null,
  ...over,
})

const games: Game[] = [
  g({ id: 'catan', title: 'Catan', players: { min: 3, max: 4 }, minAge: 10, playtimeMinutes: { min: 60, max: 60 }, complexity: 2.3 }),
  g({ id: 'codenames', title: 'Codenames', categories: ['party', 'social-deduction'], players: { min: 2, max: 8 }, playtimeMinutes: { min: 15, max: 15 }, complexity: 1.3, minAge: 10 }),
  g({ id: 'brass', title: 'Brass: Birmingham', players: { min: 2, max: 4 }, playtimeMinutes: { min: 60, max: 120 }, complexity: 3.9, minAge: 14 }),
  g({ id: 'sde', title: 'Super Dungeon Explore', categories: ['cooperative'], players: { min: 2, max: null }, playtimeMinutes: { min: 60, max: 90 }, complexity: 2.7, minAge: 13 }),
  g({ id: 'resistance', title: 'The Resistance', categories: ['social-deduction'], players: { min: 5, max: 10 }, playtimeMinutes: { min: 30, max: 30 }, complexity: 1.6, minAge: 13 }),
  g({ id: 'wingspan', title: 'Wingspan', expansions: [{ title: 'Wingspan: Asia', bggId: null, note: null }], complexity: 2.4, minAge: 14 }),
]
const ids = (gs: Game[]) => gs.map((x) => x.id)

describe('applyFilters', () => {
  it('returns everything with default filters', () => {
    expect(applyFilters(games, EMPTY_FILTERS)).toHaveLength(games.length)
  })

  it('matches title words only, not descriptions, and includes expansion titles', () => {
    const withDesc = games.map((x) => ({ ...x, description: 'card drafting' }))
    expect(ids(applyFilters(withDesc, { ...EMPTY_FILTERS, query: 'card' }))).toEqual([])
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, query: 'asia' }))).toEqual(['wingspan'])
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, query: 'Brass birm' }))).toEqual(['brass'])
  })

  it('filters by player count, treating a null max as open-ended', () => {
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, players: 6 }))).toEqual(['codenames', 'sde', 'resistance'])
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, players: 12 }))).toEqual(['sde'])
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, players: 2 }))).not.toContain('catan')
  })

  it('filters by time band', () => {
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, time: 'quick' }))).toEqual(['codenames', 'resistance'])
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, time: 'hour' }))).toEqual(['catan', 'brass', 'sde', 'wingspan'])
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, time: 'long' }))).toEqual(['brass'])
  })

  it('matches any of the chosen categories', () => {
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, categories: ['cooperative', 'party'] }))).toEqual(['codenames', 'sde'])
  })

  it('filters by rounded complexity and excludes games without a weight', () => {
    const unknown = g({ id: 'unknown', complexity: null })
    expect(ids(applyFilters([...games, unknown], { ...EMPTY_FILTERS, complexity: 4 }))).toEqual(['brass'])
    expect(ids(applyFilters([...games, unknown], { ...EMPTY_FILTERS, complexity: 3 }))).toEqual(['sde'])
  })

  it('combines filters', () => {
    expect(ids(applyFilters(games, { ...EMPTY_FILTERS, players: 4, time: 'hour', categories: ['strategy'] }))).toEqual(['catan', 'brass', 'wingspan'])
  })
})

describe('sortGames', () => {
  it('sorts by title ignoring a leading The', () => {
    expect(ids(sortGames(games, 'title'))).toEqual(['brass', 'catan', 'codenames', 'resistance', 'sde', 'wingspan'])
  })

  it('sorts by playtime midpoint', () => {
    // brass midpoint 90, sde 75, catan/wingspan 60
    expect(ids(sortGames(games, 'playtime'))).toEqual(['codenames', 'resistance', 'catan', 'wingspan', 'sde', 'brass'])
  })

  it('sorts by complexity then title, unknown last', () => {
    const unknown = g({ id: 'aaa', title: 'Aaa', complexity: null })
    expect(ids(sortGames([...games, unknown], 'complexity'))).toEqual(['codenames', 'resistance', 'catan', 'wingspan', 'sde', 'brass', 'aaa'])
  })

  it('sorts by minimum age then title', () => {
    expect(ids(sortGames(games, 'age'))).toEqual(['catan', 'codenames', 'resistance', 'sde', 'brass', 'wingspan'])
  })

  it('does not mutate the input', () => {
    const copy = [...games]
    sortGames(games, 'playtime')
    expect(games).toEqual(copy)
  })
})
