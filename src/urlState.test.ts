import { describe, expect, it } from 'vitest'
import { EMPTY_FILTERS } from './filters'
import { paramsToSearch, searchToParams, searchToUrl } from './urlState'

const cats = ['cooperative', 'strategy', 'party']

describe('searchToParams', () => {
  it('produces no params for the default search', () => {
    expect(searchToParams({ filters: EMPTY_FILTERS, sort: 'title' }, cats).toString()).toBe('')
  })

  it('encodes only the non-default parts', () => {
    const p = searchToParams(
      { filters: { ...EMPTY_FILTERS, players: 4, time: 'hour', categories: ['cooperative', 'bogus'] }, sort: 'playtime' },
      cats,
    )
    expect(Object.fromEntries(p)).toEqual({ players: '4', time: 'hour', cat: 'cooperative', sort: 'playtime' })
  })

  it('builds a full URL with the hash dropped', () => {
    const url = searchToUrl({ filters: { ...EMPTY_FILTERS, query: 'ticket to ride' }, sort: 'title' }, cats, 'https://example.test/app/#x')
    expect(url).toBe('https://example.test/app/?q=ticket+to+ride')
  })
})

describe('paramsToSearch', () => {
  it('round-trips every field', () => {
    const state = {
      filters: { query: 'dead', players: 5, time: 'long' as const, categories: ['strategy', 'party'], complexity: 3 },
      sort: 'age' as const,
    }
    expect(paramsToSearch(searchToParams(state, cats), cats)).toEqual(state)
  })

  it('falls back to defaults on bad or unknown values', () => {
    const s = paramsToSearch(new URLSearchParams('players=99&time=forever&cat=nope,strategy,strategy&cx=0&sort=random'), cats)
    expect(s).toEqual({ filters: { ...EMPTY_FILTERS, categories: ['strategy'] }, sort: 'title' })
  })

  it('ignores unrelated params', () => {
    expect(paramsToSearch(new URLSearchParams('utm_source=discord'), cats)).toEqual({ filters: EMPTY_FILTERS, sort: 'title' })
  })
})
