import { useState } from 'react'
import MyLists from './components/MyLists'
import Shelf from './components/Shelf'
import { inventory } from './data'
import { useLists } from './lists'
import { LIST_IDS } from './types'

type Page = 'shelf' | 'lists'

export default function App() {
  const [page, setPage] = useState<Page>('shelf')
  const { lists, toggle, replaceAll, merge, clear } = useLists()
  const listCount = LIST_IDS.reduce((n, id) => n + lists[id].length, 0)

  return (
    <div className="app">
      <header className="masthead">
        <h1>Guild of Gaming</h1>
        <p>{inventory.games.length} games on the shelf. What are we playing tonight?</p>
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
        <p>Inventory last updated {inventory.meta.lastUpdated}. Spotted a mistake? Edit the list on GitHub.</p>
      </footer>
    </div>
  )
}
