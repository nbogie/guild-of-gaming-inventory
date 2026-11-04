import { useRef, useState } from 'react'
import { inventory } from '../data'
import { exportPayload, parseImport } from '../lists'
import { copyToClipboard, listsAsDiscordMarkdown } from '../exports'
import { LIST_IDS, LIST_LABELS, type ListId, type Lists } from '../types'
import GameCard from './GameCard'

interface Props {
  lists: Lists
  onToggle: (listId: ListId, gameId: string) => void
  onImport: (incoming: unknown, mode: 'merge' | 'replace') => void
  onClear: () => void
  onClearList: (listId: ListId) => void
}

const gameById = Object.fromEntries(inventory.games.map((g) => [g.id, g]))

export default function MyLists({ lists, onToggle, onImport, onClear, onClearList }: Props) {
  const [active, setActive] = useState<ListId>('want-to-play')
  const [status, setStatus] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const total = LIST_IDS.reduce((n, id) => n + lists[id].length, 0)
  const games = lists[active].map((id) => gameById[id]).filter(Boolean)

  const download = () => {
    const blob = new Blob([JSON.stringify(exportPayload(lists), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guild-lists-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Downloaded your lists as a file.')
  }

  const discordExportable = lists['want-to-play'].length + lists['want-to-try'].length + lists['can-teach'].length > 0

  const copyForDiscord = async () => {
    const ok = await copyToClipboard(listsAsDiscordMarkdown(lists))
    setStatus(ok ? 'Copied your want-to-play and can-teach titles.' : 'Could not copy to the clipboard.')
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const incoming = parseImport(await file.text())
      const replace = total > 0 && window.confirm('Replace your current lists? Cancel to merge them instead.')
      onImport(incoming, replace ? 'replace' : 'merge')
      setStatus(replace ? 'Replaced your lists from the file.' : 'Merged the file into your lists.')
    } catch {
      setStatus('That file is not a lists export from this app.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="mylists">
      <nav className="tabs" aria-label="My lists">
        {LIST_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`tab tab-${id}${active === id ? ' on' : ''}`}
            aria-current={active === id ? 'page' : undefined}
            onClick={() => setActive(id)}
          >
            {LIST_LABELS[id]} <span className="tab-n">{lists[id].length}</span>
          </button>
        ))}
      </nav>

      {games.length === 0 ? (
        <div className="empty">
          <p>Nothing in {LIST_LABELS[active].toLowerCase()} yet.</p>
          <p>Open a game on the shelf and tap a list to add it.</p>
        </div>
      ) : (
        <>
          <div className="cards">
            {games.map((g) => (
              <GameCard key={g.id} game={g} lists={lists} onToggle={onToggle} />
            ))}
          </div>
          <button
            type="button"
            className="btn btn-quiet list-clear"
            onClick={() => {
              const n = games.length
              if (window.confirm(`Remove ${n === 1 ? 'the one game' : `all ${n} games`} from ${LIST_LABELS[active].toLowerCase()}?`)) {
                onClearList(active)
                setStatus(`Cleared ${LIST_LABELS[active].toLowerCase()}.`)
              }
            }}
          >
            Clear this list
          </button>
        </>
      )}

      <div className="tools">
        <p>Lists are stored on this device only. Download a file to keep a copy or move them to another device. "Export titles for Discord" copies your want-to-play and can-teach games in a form suitable for a discord message.</p>
        <div className="tools-row">
          <button type="button" className="btn" onClick={download} disabled={total === 0}>
            Download file
          </button>
          <button type="button" className="btn" onClick={copyForDiscord} disabled={!discordExportable}>
            Export titles for Discord
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Import file
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <button
            type="button"
            className="btn btn-quiet"
            disabled={total === 0}
            onClick={() => window.confirm('Clear every list on this device?') && onClear()}
          >
            Clear lists
          </button>
        </div>
        {status && (
          <p className="status" role="status">
            {status}
          </p>
        )}
      </div>
    </div>
  )
}
