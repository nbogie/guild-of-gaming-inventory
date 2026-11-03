import { useCallback, useEffect, useState } from 'react'
import { LIST_IDS, type ListId, type Lists } from './types'

const STORAGE_KEY = 'guild-of-gaming-lists-v1'

function emptyLists(): Lists {
  return Object.fromEntries(LIST_IDS.map((id) => [id, [] as string[]])) as unknown as Lists
}

function sanitize(input: unknown): Lists {
  const out = emptyLists()
  if (!input || typeof input !== 'object') return out
  const obj = input as Record<string, unknown>
  for (const id of LIST_IDS) {
    const v = obj[id]
    if (Array.isArray(v)) out[id] = Array.from(new Set(v.filter((x): x is string => typeof x === 'string')))
  }
  return out
}

function load(): Lists {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? sanitize(JSON.parse(raw)) : emptyLists()
  } catch {
    return emptyLists()
  }
}

export function useLists() {
  const [lists, setLists] = useState<Lists>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
    } catch {
      /* storage unavailable: lists live for this session only */
    }
  }, [lists])

  const toggle = useCallback((listId: ListId, gameId: string) => {
    setLists((prev) => {
      const has = prev[listId].includes(gameId)
      return {
        ...prev,
        [listId]: has ? prev[listId].filter((g) => g !== gameId) : [...prev[listId], gameId],
      }
    })
  }, [])

  const replaceAll = useCallback((next: unknown) => setLists(sanitize(next)), [])

  const merge = useCallback((incoming: unknown) => {
    const inc = sanitize(incoming)
    setLists((prev) => {
      const out = emptyLists()
      for (const id of LIST_IDS) out[id] = Array.from(new Set([...prev[id], ...inc[id]]))
      return out
    })
  }, [])

  const clear = useCallback(() => setLists(emptyLists()), [])

  return { lists, toggle, replaceAll, merge, clear }
}

export function exportPayload(lists: Lists) {
  return {
    app: 'guild-of-gaming-inventory',
    version: 1,
    exportedAt: new Date().toISOString(),
    lists,
  }
}

export function parseImport(text: string): Lists {
  const parsed = JSON.parse(text)
  return sanitize(parsed && typeof parsed === 'object' && 'lists' in parsed ? parsed.lists : parsed)
}
