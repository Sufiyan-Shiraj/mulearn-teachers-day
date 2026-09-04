import { create } from 'zustand'
import type { CardDoc, CardElement, DecoKey, FontKey, TextElement } from './types'
import { getTemplate, TEMPLATES } from './templates'
import { SLOTS } from './slots'
import { nid } from './id'

const LS_CURRENT = 'mut.card.current'
const LS_LIBRARY = 'mut.card.library'

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

export function newDoc(templateId: string): CardDoc {
  const tpl = getTemplate(templateId)
  return {
    id: nid(12),
    templateId: tpl.id,
    elements: clone(tpl.elements),
    from: '', to: '',
    createdAt: Date.now(), updatedAt: Date.now(),
  }
}

interface State {
  doc: CardDoc
  selectedId: string | null
  editingId: string | null
  past: CardDoc[]
  future: CardDoc[]
  /** transient: the last photo dropped in, used for the fly-in animation */
  photoJustAdded: boolean
  /** transient: the element added most recently, so it can animate in */
  freshId: string | null

  /* actions */
  startCard: (templateId: string) => void
  loadDoc: (d: CardDoc) => void
  setTemplate: (templateId: string) => void
  select: (id: string | null) => void
  setEditing: (id: string | null) => void
  update: (id: string, patch: Partial<CardElement>, opts?: { history?: boolean }) => void
  beginChange: () => void
  addDeco: (deco: DecoKey, color?: string) => string
  addText: () => string
  remove: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  setPhoto: (dataUrl: string | undefined) => void
  ensurePhotoAspect: () => void
  setMeta: (patch: Partial<Pick<CardDoc, 'from' | 'to'>>) => void
  undo: () => void
  redo: () => void
  reset: () => void
  clearJustAdded: () => void
  clearFresh: () => void
}

function persist(doc: CardDoc) {
  try { localStorage.setItem(LS_CURRENT, JSON.stringify(doc)) } catch { /* quota */ }
}

function restore(): CardDoc | null {
  try {
    const raw = localStorage.getItem(LS_CURRENT)
    if (!raw) return null
    const d = JSON.parse(raw) as CardDoc
    if (!d?.templateId || !Array.isArray(d.elements)) return null
    const tpl = TEMPLATES.find(t => t.id === d.templateId)
    const slot = tpl ? SLOTS[tpl.art] : (SLOTS as Record<string, typeof SLOTS.disco>)[d.templateId]
    if (slot) {
      d.elements = d.elements.map(e => {
        if (e.kind === 'text' && (e.rot === 0 || !('scaleX' in e))) {
          return {
            ...e,
            rot: slot.nameRot ?? 0,
            scaleX: slot.scaleX ?? 1,
            box: { x: slot.name[0], y: slot.name[1], w: slot.name[2], h: slot.name[3] },
            size: slot.nameSize,
          }
        }
        return e
      })
    }
    return d
  } catch { return null }
}

export const useCard = create<State>((set, get) => ({
  doc: restore() ?? newDoc(TEMPLATES[0].id),
  selectedId: null,
  editingId: null,
  past: [],
  future: [],
  photoJustAdded: false,
  freshId: null,

  startCard: (templateId) => {
    const cur = get().doc
    const doc = newDoc(templateId)
    // carry the photo across if the user already picked one
    if (cur.photo) doc.photo = cur.photo
    persist(doc)
    set({ doc, past: [], future: [], selectedId: null, editingId: null })
  },

  loadDoc: (d) => { persist(d); set({ doc: d, past: [], future: [], selectedId: null, editingId: null }) },

  setTemplate: (templateId) => {
    const cur = get().doc
    if (cur.templateId === templateId) return
    const doc = newDoc(templateId)
    doc.photo = cur.photo
    doc.from = cur.from; doc.to = cur.to
    const curName = cur.elements.find(e => e.kind === 'text') as TextElement | undefined
    if (curName?.text) {
      const newName = doc.elements.find(e => e.kind === 'text') as TextElement | undefined
      if (newName) newName.text = curName.text
    }
    persist(doc)
    set({ doc, past: [...get().past, clone(cur)].slice(-40), future: [], selectedId: null, editingId: null })
  },

  select: (id) => set({ selectedId: id, editingId: id === null ? null : get().editingId }),
  setEditing: (id) => set({ editingId: id, selectedId: id ?? get().selectedId }),

  update: (id, patch, opts) => {
    const s = get()
    const past = opts?.history === false ? s.past : [...s.past, clone(s.doc)].slice(-40)
    const doc: CardDoc = {
      ...s.doc,
      updatedAt: Date.now(),
      elements: s.doc.elements.map(e => (e.id === id ? { ...e, ...patch } as CardElement : e)),
    }
    persist(doc)
    set({ doc, past, future: opts?.history === false ? s.future : [] })
  },

  /**
   * Take a snapshot before an edit starts.
   *
   * This used to be `commit()`, called when a drag or a slider was released —
   * which pushed the card as it was *after* the change, so undo restored the
   * state you were already looking at and appeared to do nothing. Snapshotting
   * up front is what makes one undo step equal one interaction.
   */
  beginChange: () => {
    const s = get()
    const last = s.past[s.past.length - 1]
    const now = JSON.stringify(s.doc)
    if (last && JSON.stringify(last) === now) return
    set({ past: [...s.past, clone(s.doc)].slice(-40), future: [] })
  },

  addDeco: (deco, color) => {
    const s = get()
    const id = `deco-${nid(6)}`
    const el: CardElement = {
      kind: 'deco', id, deco, color,
      box: { x: 50, y: 46, w: deco.startsWith('tape') || deco.startsWith('sticker') ? 34 : 16, h: 0 },
      rot: (Math.random() * 16 - 8),
    }
    const doc = { ...s.doc, updatedAt: Date.now(), elements: [...s.doc.elements, el] }
    persist(doc)
    set({ doc, past: [...s.past, clone(s.doc)].slice(-40), future: [], selectedId: id, freshId: id })
    return id
  },

  addText: () => {
    const s = get()
    const id = `text-${nid(6)}`
    const el: TextElement = {
      kind: 'text', id, box: { x: 12, y: 44, w: 76, h: 10 }, rot: 0,
      text: '', placeholder: 'Type here…', font: 'playful', size: 44,
      color: getTemplate(s.doc.templateId).dark ? '#fdf7ec' : '#2b2320',
      align: 'center', lh: 1.3, plate: 'none', label: 'Your text', maxLen: 220,
    }
    const doc = { ...s.doc, updatedAt: Date.now(), elements: [...s.doc.elements, el] }
    persist(doc)
    set({ doc, past: [...s.past, clone(s.doc)].slice(-40), future: [], selectedId: id, editingId: id, freshId: id })
    return id
  },

  remove: (id) => {
    const s = get()
    const doc = { ...s.doc, updatedAt: Date.now(), elements: s.doc.elements.filter(e => e.id !== id) }
    persist(doc)
    set({ doc, past: [...s.past, clone(s.doc)].slice(-40), future: [], selectedId: null, editingId: null })
  },

  /* paint order is document order, so moving an element within the list is
     what changes which piece of the card covers which */
  bringForward: (id) => {
    const s = get()
    const el = s.doc.elements.find(e => e.id === id)
    if (!el) return
    const doc = { ...s.doc, elements: [...s.doc.elements.filter(e => e.id !== id), el] }
    persist(doc)
    set({ doc, past: [...s.past, clone(s.doc)].slice(-40), future: [] })
  },

  sendBackward: (id) => {
    const s = get()
    const el = s.doc.elements.find(e => e.id === id)
    if (!el) return
    const doc = { ...s.doc, elements: [el, ...s.doc.elements.filter(e => e.id !== id)] }
    persist(doc)
    set({ doc, past: [...s.past, clone(s.doc)].slice(-40), future: [] })
  },

  setPhoto: (dataUrl) => {
    const s = get()
    const doc = { ...s.doc, photo: dataUrl, photoAr: undefined, updatedAt: Date.now() }
    persist(doc)
    set({ doc, photoJustAdded: !!dataUrl, past: [...s.past, clone(s.doc)].slice(-40), future: [] })

    get().ensurePhotoAspect()
  },

  /**
   * Measure the photo's own shape, if it is not already known.
   *
   * How far a photo can be panned depends on how much of it `cover` is
   * hiding, which needs its aspect against the slot's. Cards saved before
   * this was recorded — or restored from a link — arrive without it, and
   * their pan sliders would sit dead for no reason, so this fills the gap
   * whenever the editor opens rather than only when a picture is chosen.
   */
  ensurePhotoAspect: () => {
    const { photo, photoAr } = get().doc
    if (!photo || photoAr) return
    const img = new Image()
    img.onload = () => {
      const ar = img.naturalWidth / img.naturalHeight
      if (!ar || !isFinite(ar)) return
      const cur = get().doc
      if (cur.photo !== photo || cur.photoAr) return
      const next = { ...cur, photoAr: ar }
      persist(next)
      set({ doc: next })
    }
    img.src = photo
  },

  setMeta: (patch) => {
    const s = get()
    const doc = { ...s.doc, ...patch, updatedAt: Date.now() }
    persist(doc)
    set({ doc })
  },

  undo: () => {
    const s = get()
    if (!s.past.length) return
    const prev = s.past[s.past.length - 1]
    persist(prev)
    set({ doc: prev, past: s.past.slice(0, -1), future: [clone(s.doc), ...s.future].slice(0, 40), selectedId: null, editingId: null })
  },

  redo: () => {
    const s = get()
    if (!s.future.length) return
    const nxt = s.future[0]
    persist(nxt)
    set({ doc: nxt, future: s.future.slice(1), past: [...s.past, clone(s.doc)].slice(-40), selectedId: null, editingId: null })
  },

  reset: () => {
    const doc = newDoc(get().doc.templateId)
    persist(doc)
    set({ doc, past: [], future: [], selectedId: null, editingId: null })
  },

  clearJustAdded: () => set({ photoJustAdded: false }),

  clearFresh: () => set({ freshId: null }),
}))

/* ---------------- selectors ---------------- */
export const useElement = (id: string | null) =>
  useCard(s => (id ? s.doc.elements.find(e => e.id === id) ?? null : null))

export function applyFontToSelection(id: string, font: FontKey) {
  useCard.getState().update(id, { font } as Partial<CardElement>)
}

/* ---------------- my cards library ---------------- */
export interface SavedCard { id: string; templateId: string; link: string; thumb?: string; to: string; createdAt: number }

export function library(): SavedCard[] {
  try { return JSON.parse(localStorage.getItem(LS_LIBRARY) || '[]') } catch { return [] }
}
export function saveToLibrary(entry: SavedCard) {
  const all = library().filter(c => c.id !== entry.id)
  all.unshift(entry)
  try { localStorage.setItem(LS_LIBRARY, JSON.stringify(all.slice(0, 30))) } catch { /* quota */ }
}
export function removeFromLibrary(id: string) {
  try { localStorage.setItem(LS_LIBRARY, JSON.stringify(library().filter(c => c.id !== id))) } catch { /* quota */ }
}
