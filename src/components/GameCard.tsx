import { useState } from 'react'
import { categoryById, playersLabel, playtimeLabel } from '../data'
import type { Game, ListId, Lists } from '../types'
import { LIST_IDS, LIST_LABELS } from '../types'
import ListMenu from './ListMenu'

interface Props {
  game: Game
  lists: Lists
  onToggle: (listId: ListId, gameId: string) => void
}

export default function GameCard({ game, lists, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const inLists = LIST_IDS.filter((id) => lists[id].includes(game.id))

  return (
    <article className={`card${open ? ' open' : ''}`}>
      <button type="button" className="card-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="card-emoji" aria-hidden="true">
          {game.emoji}
        </span>
        <span className="card-title">
          {game.title}
          {game.expansions.length > 0 && (
            <span className="card-plus"> + {game.expansions.map((e) => e.title).join(', ')}</span>
          )}
        </span>
        <span className="card-facts">
          <span>{playersLabel(game)}</span>
          <span>{playtimeLabel(game)}</span>
          <span>age {game.minAge}+</span>
        </span>
        {inLists.length > 0 && (
          <span className="card-marks" aria-label={`In lists: ${inLists.map((id) => LIST_LABELS[id]).join(', ')}`}>
            {inLists.map((id) => (
              <i key={id} className={`mark mark-${id}`} />
            ))}
          </span>
        )}
      </button>
      {open && (
        <div className="card-body">
          <p>{game.description}</p>
          {game.expansions.map((e) => (
            <p key={e.title} className="card-exp">
              <b>{e.title}</b>
              {e.note ? ` ${e.note}` : ''}
            </p>
          ))}
          {game.notes && <p className="card-note">{game.notes}</p>}
          <p className="card-cats">
            {game.categories.map((c) => categoryById[c]?.name ?? c).join(', ')}
            {game.bggId != null && (
              <>
                {' '}
                <a className="card-link" href={`https://boardgamegeek.com/boardgame/${game.bggId}`} target="_blank" rel="noopener noreferrer">
                  See on BoardGameGeek
                </a>
              </>
            )}
          </p>
          <ListMenu gameId={game.id} lists={lists} onToggle={onToggle} />
        </div>
      )}
    </article>
  )
}
