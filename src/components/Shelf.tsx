import { useMemo, useState } from 'react'
import { hasComplexityData, inventory } from '../data'
import { applyFilters, EMPTY_FILTERS, isDefault, TIME_BANDS, type Filters } from '../filters'
import type { ListId, Lists } from '../types'
import GameCard from './GameCard'
import PlayerStepper from './PlayerStepper'

interface Props {
  lists: Lists
  onToggle: (listId: ListId, gameId: string) => void
}

const COMPLEXITY = [
  { v: 1, label: 'Light' },
  { v: 2, label: 'Easy' },
  { v: 3, label: 'Medium' },
  { v: 4, label: 'Heavy' },
  { v: 5, label: 'Brain burner' },
]

export default function Shelf({ lists, onToggle }: Props) {
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }))
  const results = useMemo(() => applyFilters(inventory.games, f), [f])

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

        {!isDefault(f) && (
          <button type="button" className="link" onClick={() => setF(EMPTY_FILTERS)}>
            Clear all
          </button>
        )}
      </aside>

      <section className="results" aria-live="polite">
        <p className="results-count">
          {results.length === inventory.games.length
            ? `All ${results.length} games on the shelf`
            : `${results.length} of ${inventory.games.length} games`}
        </p>
        {results.length === 0 ? (
          <div className="empty">
            <p>Nothing on the shelf fits that.</p>
            <p>Try a different length, or loosen the player count.</p>
            <button type="button" className="link" onClick={() => setF(EMPTY_FILTERS)}>
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
