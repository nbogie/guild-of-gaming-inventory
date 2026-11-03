import { useState } from 'react'
import MyLists from './components/MyLists'
import Shelf from './components/Shelf'
import { inventory } from './data'
import { useLists } from './lists'
import { LIST_IDS } from './types'
import { LINKS } from './links'
import { copyToClipboard, inventoryAsDiscordPost } from './exports'

type Page = 'shelf' | 'lists'

export default function App() {
  const [page, setPage] = useState<Page>('shelf')
  const { lists, toggle, replaceAll, merge, clear } = useLists()
  const listCount = LIST_IDS.reduce((n, id) => n + lists[id].length, 0)
  const [copyNote, setCopyNote] = useState<string | null>(null)

  const copyInventory = async () => {
    const ok = window.confirm(
      'Copy the full inventory to your clipboard as a Discord post? This is for organisers updating the pinned list. It will replace whatever is on your clipboard.',
    )
    if (!ok) return
    const done = await copyToClipboard(inventoryAsDiscordPost())
    setCopyNote(done ? 'Copied the full inventory. Paste it into Discord.' : 'Could not copy to the clipboard.')
  }

  return (
    <div className="app">
      <header className="masthead">
        <h1>Guild of Gaming</h1>
        <p>{inventory.games.length} board games and card games on the shelf.</p>
      </header>

      <nav className="pagenav" aria-label="Pages">
        <button type="button" className={page === 'shelf' ? 'on' : ''} aria-current={page === 'shelf' ? 'page' : undefined} onClick={() => setPage('shelf')}>
          The shelf
        </button>
        <button type="button" className={page === 'lists' ? 'on' : ''} aria-current={page === 'lists' ? 'page' : undefined} onClick={() => setPage('lists')}>
          My lists{listCount > 0 && <span className="tab-n">{listCount}</span>}
        </button>
      </nav>

      <main>
        {page === 'shelf' ? (
          <Shelf lists={lists} onToggle={toggle} />
        ) : (
          <MyLists
            lists={lists}
            onToggle={toggle}
            onClear={clear}
            onImport={(incoming, mode) => (mode === 'replace' ? replaceAll(incoming) : merge(incoming))}
          />
        )}
      </main>

      <footer className="colophon">
        <p>Inventory last updated {inventory.meta.lastUpdated}.</p>
        <p className="colophon-links">
          {LINKS.suggestAGame && (
            <a href={LINKS.suggestAGame} target="_blank" rel="noopener noreferrer">
              Suggest a game
            </a>
          )}
          {LINKS.siteFeedback && (
            <a href={LINKS.siteFeedback} target="_blank" rel="noopener noreferrer">
              Site feedback
            </a>
          )}
          {LINKS.editOnGitHub && (
            <a href={LINKS.editOnGitHub} target="_blank" rel="noopener noreferrer">
              Fix a mistake on GitHub
            </a>
          )}
          <button type="button" className="link" onClick={copyInventory}>
            Copy full inventory for Discord
          </button>
        </p>
        {copyNote && (
          <p className="status" role="status">
            {copyNote}
          </p>
        )}
      </footer>
    </div>
  )
}
