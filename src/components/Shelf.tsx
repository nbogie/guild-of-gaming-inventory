import { useEffect, useMemo, useState } from 'react'
import { hasComplexityData, inventory } from '../data'
import { applyFilters, EMPTY_FILTERS, isDefault, SORT_OPTIONS, sortGames, TIME_BANDS, type Filters, type SortKey } from '../filters'
import type { ListId, Lists } from '../types'
import GameCard from './GameCard'
import PlayerStepper from './PlayerStepper'
import { paramsToSearch, searchToUrl } from '../urlState'
import { copyToClipboard } from '../exports'

interface Props {
  lists: Lists
  onToggle: (listId: ListId, gameId: string) => void
}

const HIDE_KEY = 'guild-of-gaming-hide-not-for-me'
const CATEGORY_IDS = inventory.categories.map((c) => c.id)

function initialSearch() {
  return paramsToSearch(new URLSearchParams(window.location.search), CATEGORY_IDS)
}

const COMPLEXITY = [
  { v: 1, label: 'Light' },
  { v: 2, label: 'Easy' },
  { v: 3, label: 'Medium' },
  { v: 4, label: 'Heavy' },
  { v: 5, label: 'Brain burner' },
]

export default function Shelf({ lists, onToggle }: Props) {
  const [f, setF] = useState<Filters>(() => initialSearch().filters)
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }))
  const [sort, setSort] = useState<SortKey>(() => initialSearch().sort)
  const [linkNote, setLinkNote] = useState<string | null>(null)
  const [hideNotForMe, setHideNotForMe] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HIDE_KEY) === '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(HIDE_KEY, hideNotForMe ? '1' : '0')
    } catch {
      /* per-device convenience only */
    }
  }, [hideNotForMe])

  const notForMe = lists['not-for-me']
  const clearAll = () => {
    setF(EMPTY_FILTERS)
    setHideNotForMe(false)
    setLinkNote(null)
  }

  const copyLink = async () => {
    const url = searchToUrl({ filters: f, sort }, CATEGORY_IDS)
    if (!window.confirm('Copy a link to this search? It will replace whatever is on your clipboard.')) return
    const ok = await copyToClipboard(url)
    setLinkNote(ok ? 'Link copied. Anyone who opens it sees this search.' : 'Could not copy to the clipboard.')
  }
  const results = useMemo(() => {
    const filtered = applyFilters(inventory.games, f)
    const shown = hideNotForMe && notForMe.length ? filtered.filter((g) => !notForMe.includes(g.id)) : filtered
    return sortGames(shown, sort)
  }, [f, sort, hideNotForMe, notForMe])

  const toggleCat = (id: string) =>
    set('categories', f.categories.includes(id) ? f.categories.filter((c) => c !== id) : [...f.categories, id])

  return (
    <div className="shelf">
      <aside className="controls">
        <PlayerStepper value={f.players} onChange={(v) => set('players', v)} />

        <label className="search">
          <span className="sr-only">Search by title</span>
          <input
            type="search"
            placeholder="Search titles"
            value={f.query}
            onChange={(e) => set('query', e.target.value)}
            autoComplete="off"
          />
        </label>

        <fieldset className="chips">
          <legend>How long have you got?</legend>
          <div className="chip-row">
          {TIME_BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`chip${f.time === b.id ? ' on' : ''}`}
              aria-pressed={f.time === b.id}
              onClick={() => set('time', b.id)}
              title={b.hint}
            >
              {b.label}
            </button>
          ))}
          </div>
        </fieldset>

        <fieldset className="chips">
          <legend>Kind of game</legend>
          <div className="chip-row">
          {inventory.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip${f.categories.includes(c.id) ? ' on' : ''}`}
              aria-pressed={f.categories.includes(c.id)}
              onClick={() => toggleCat(c.id)}
            >
              {c.name}
            </button>
          ))}
          </div>
        </fieldset>

        {hasComplexityData && (
          <fieldset className="chips">
            <legend>Complexity</legend>
          <div className="chip-row">
            {COMPLEXITY.map((c) => (
              <button
                key={c.v}
                type="button"
                className={`chip${f.complexity === c.v ? ' on' : ''}`}
                aria-pressed={f.complexity === c.v}
                onClick={() => set('complexity', f.complexity === c.v ? null : c.v)}
              >
                {c.label}
              </button>
            ))}
          </div>
          </fieldset>
        )}

        <label className={`check${notForMe.length ? '' : ' muted'}`}>
          <input
            type="checkbox"
            checked={hideNotForMe}
            disabled={notForMe.length === 0}
            onChange={(e) => setHideNotForMe(e.target.checked)}
          />
          Hide games marked &ldquo;not for me&rdquo;
          {notForMe.length > 0 && <span className="tab-n">{notForMe.length}</span>}
        </label>

        <div className="control-actions">
          {(!isDefault(f) || hideNotForMe) && (
            <button type="button" className="link" onClick={clearAll}>
              Clear all
            </button>
          )}
          {(!isDefault(f) || sort !== 'title') && (
            <button type="button" className="link" onClick={copyLink}>
              Copy link to this search
            </button>
          )}
        </div>
        {linkNote && (
          <p className="status" role="status">
            {linkNote}
          </p>
        )}
      </aside>

      <section className="results" aria-live="polite">
        <div className="results-bar">
          <p className="results-count">
            {results.length === inventory.games.length
              ? `All ${results.length} games on the shelf`
              : `${results.length} of ${inventory.games.length} games`}
          </p>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {results.length === 0 ? (
          <div className="empty">
            <p>Nothing on the shelf fits that.</p>
            <p>Try a different length, or loosen the player count.</p>
            <button type="button" className="link" onClick={clearAll}>
              Clear all
            </button>
          </div>
        ) : (
          <div className="cards">
            {results.map((g) => (
              <GameCard key={g.id} game={g} lists={lists} onToggle={onToggle} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
