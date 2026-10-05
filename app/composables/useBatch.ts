import type { SlipForm } from './useSlip'

export interface BatchItem {
  id: string
  form: SlipForm
}

const KEY = 'uplatnica-me:batch:v1'
/** 10 A4 pages. */
const MAX = 30

/** Slips collected for one PDF. Kept in localStorage so a reload does not lose them. */
export function useBatch() {
  const items = useState<BatchItem[]>('batch', () => [])
  const loaded = useState('batch-loaded', () => false)
  /** Id of the batch item currently open in the editor, if any. */
  const editing = useState<string | null>('batch-editing', () => null)

  function load() {
    if (loaded.value || import.meta.server) return
    loaded.value = true
    try { items.value = JSON.parse(localStorage.getItem(KEY) || '[]') }
    catch { /* storage unavailable or corrupted */ }
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(items.value)) }
    catch { /* storage unavailable */ }
  }

  /** Adds a new slip, or saves over the one being edited. */
  function put(form: SlipForm) {
    const snapshot = { ...form }
    const i = items.value.findIndex(it => it.id === editing.value)
    if (i >= 0) items.value = items.value.map((it, j) => (j === i ? { ...it, form: snapshot } : it))
    else if (items.value.length < MAX) items.value = [...items.value, { id: crypto.randomUUID(), form: snapshot }]
    editing.value = null
    persist()
  }

  function remove(id: string) {
    items.value = items.value.filter(it => it.id !== id)
    if (editing.value === id) editing.value = null
    persist()
  }

  function clear() {
    items.value = []
    editing.value = null
    persist()
  }

  return { items, editing, full: computed(() => items.value.length >= MAX), load, put, remove, clear }
}
