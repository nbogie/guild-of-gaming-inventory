import { LIST_IDS, LIST_LABELS, type ListId, type Lists } from '../types'

interface Props {
  gameId: string
  lists: Lists
  onToggle: (listId: ListId, gameId: string) => void
}

export default function ListMenu({ gameId, lists, onToggle }: Props) {
  return (
    <div className="list-menu" role="group" aria-label="Add to my lists">
      {LIST_IDS.map((id) => {
        const on = lists[id].includes(gameId)
        return (
          <button
            key={id}
            type="button"
            className={`tag tag-${id}${on ? ' on' : ''}`}
            aria-pressed={on}
            onClick={() => onToggle(id, gameId)}
          >
            {LIST_LABELS[id]}
          </button>
        )
      })}
    </div>
  )
}
