import { Heading1 } from 'lucide-react'
import React, { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CATALOGUE  &  CALCULATION RULES
// ───────────────────────────────────────────────────────────────────────────────
//
// THREE distinct pricing / input modes — stored in `calcMode` field:
//
//  'kg'    – Milk 1 kg/L packs (Cow, Shakti, Gold full-litre)
//            user enters: actual kg/L in Morning + Evening
//            price is ₹ per kg/L
//            net = qty × price − discMilk × qty
//            e.g. qty=10, price=57, disc=2.3 → 570 − 23 = ₹547
//
//  'pack'  – Milk 0.5 L packs (Cow, Shakti, Gold half-litre)
//            user enters: number of 500 ml packs
//            price is ₹ per pack (NOT per kg)
//            net = qty × price − discMilk × qty   (disc per pack, as confirmed)
//            e.g. qty=5, price=58, disc=2.3 → 290 − 11.5 = ₹278.50
//
//  'dahi'  – Dahi 400 g packs
//            user enters: kg (EVEN numbers: 2, 4, 6 …)
//            1 kg = 2.5 packs of 400 g  →  packets = inputKg × 2.5
//            price is ₹35 per packet
//            net = packets × 35 − discDahi × packets
//            e.g. inputKg=2 → packets=5, gross=175, disc=2.9×5=14.50, net=₹160.50 ✓
//
// ═══════════════════════════════════════════════════════════════════════════════
const BASE_PRODUCTS = [
  // id         name                     price  calcMode
  { id: 'shak1', name: 'Shakti 1 L', price: 60, calcMode: 'kg', discAmt: 2.3 },
  { id: 'gold05', name: 'Gold 1/2 L', price: 70, calcMode: 'kg', discAmt: 2.3 },
  { id: 'shak05', name: 'Shakti 1/2 L', price: 62, calcMode: 'kg', discAmt: 2.3 },
  { id: 'cow05', name: 'Cow 1/2 L', price: 58, calcMode: 'kg', discAmt: 2.3 },
  { id: 'cow1', name: 'Cow 1 Kg', price: 57, calcMode: 'kg', discAmt: 2.3 },
  { id: 'gold1', name: 'Gold 1 L', price: 68, calcMode: 'kg', discAmt: 2.3 },

  // Dahi: user enters kg (even). 1 kg = 2.5 packets × ₹35 = ₹87.50/kg
  { id: 'dahi400', name: 'Dahi 400 g', price: 35, calcMode: 'dahi', discAmt: 2.9 },
  { id: 'dahi200', name: 'Dahi 200 g', price: 20, calcMode: 'dahi', discAmt: 2.4 },
]


// ─── Calendar helpers ──────────────────────────────────────────────────────────
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const todayStr = () => new Date().toISOString().slice(0, 10)

const fmtDateLabel = dateStr => {
  const d = new Date(dateStr + 'T00:00:00')
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`
}

// ─── Row factory ───────────────────────────────────────────────────────────────
// Creates a zeroed order row from a product definition.
const mkRow = ({ id, name, price, calcMode, discAmt }) => ({
  id, name,
  price: Number(price),
  calcMode,
  disc: Number(discAmt) || 2.30,   // ← per-row discount from product definition
  morn: 0,
  eve: 0,
})

const uid = () => 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
const fmt = n => '₹' + parseFloat(n).toFixed(1)
const fmtN = n => {
  const v = parseFloat(n)
  return v % 1 === 0 ? String(v) : v.toFixed(2)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE CALCULATION — calcRow
// ═══════════════════════════════════════════════════════════════════════════════

const calcRow = (r) => {
  const qty = (Number(r.morn) || 0) + (Number(r.eve) || 0)
  const disc = Number(r.disc) || 0

  if (r.id === 'dahi400') {
    // ── Dahi 400g ───────────────────────────────────────────────────────────
    // qty = kg entered by user (must be even: 2, 4, 6 …)
    // packets = qty × 2.5   (400g packs per kg)
    const packets = qty * 2.5
    const gross = packets * Number(r.price)          // packets × ₹35

    const discAmt = disc * packets

    return {
      qty, packets,
      actualKg: qty,                                  // kg for totals
      gross, discAmt,
      net: Math.max(0, gross - discAmt),
      inputLabel: 'kg',
      kgLabel: `${fmtN(qty)} kg\n(${fmtN(packets)} pkt)`,
    }
  }
  if (r.id === 'dahi200') {
    // ── Dahi 400g ───────────────────────────────────────────────────────────
    // qty = kg entered by user (must be even: 2, 4, 6 …)
    // packets = qty × 2.5   (400g packs per kg)
    const packets = qty * 5
    const gross = packets * Number(r.price)          // packets × ₹20

    const discAmt = disc * packets

    return {
      qty, packets,
      actualKg: qty,                                  // kg for totals
      gross, discAmt,
      net: Math.max(0, gross - discAmt),
      inputLabel: 'kg',
      kgLabel: `${fmtN(qty)} kg\n(${fmtN(packets)} pkt)`,
    }
  }

  if (r.calcMode === 'kg') {
    // ── Milk 1 kg/L packs ───────────────────────────────────────────────────
    // qty = actual kg/L entered
    const gross = qty * Number(r.price)

    const discAmt = disc * qty

    return {
      qty, packets: qty,
      actualKg: qty,
      gross, discAmt,
      net: Math.max(0, gross - discAmt),
      inputLabel: 'kg/L',
      kgLabel: `${fmtN(qty)} L`,
    }
  }

  // ── Milk 0.5 L packs  (calcMode === 'pack') ──────────────────────────────
  // qty = number of 500 ml packs entered
  // discount is per pack (not per litre)
  const gross = qty * Number(r.price)
  const discAmt = Number(discMilk) * qty
  return {
    qty, packets: qty,
    actualKg: qty * 0.5,                              // 0.5 L per pack for totals
    gross, discAmt,
    net: Math.max(0, gross - discAmt),
    inputLabel: 'packs',
    kgLabel: `${fmtN(qty)} L`,
  }
}

// ─── Aggregate totals across all rows ─────────────────────────────────────────

const calcTotals = rows =>
  rows.reduce((acc, r) => {

    const c = calcRow(r)

    const isDahi = r.calcMode === 'dahi'
    return {
      milkKg: acc.milkKg + (!isDahi ? c.actualKg : 0),
      dahiKg: acc.dahiKg + (isDahi ? c.actualKg : 0),
      gross: acc.gross + c.gross,
      disc: acc.disc + c.discAmt,
      net: acc.net + c.net,
    }
  }, { milkKg: 0, dahiKg: 0, gross: 0, disc: 0, net: 0 })

// ─── Initial tab state ─────────────────────────────────────────────────────────
const initTabState = () => ({
  rows: BASE_PRODUCTS.map(mkRow),
  extra: BASE_PRODUCTS.map(mkRow),
})

// ═══════════════════════════════════════════════════════════════════════════════
// localStorage  (saves per-day history, max 30 entries per tab)
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'dairy_history_v4'

const loadHistory = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} } }
const saveHistory = h => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) } catch { } }

// ── Helper: delete all entries for one tab ──
const deleteAllForTab = (tabKey) => {
  const h = loadHistory()
  Object.keys(h).filter(k => k.startsWith(tabKey + '_')).forEach(k => delete h[k])
  saveHistory(h)
}

// ── Helper: delete entries in a date range for one tab ──
// dateFrom / dateTo are 'YYYY-MM-DD' strings (inclusive both ends)
const deleteRangeForTab = (tabKey, dateFrom, dateTo) => {
  const h = loadHistory()
  Object.keys(h)
    .filter(k => k.startsWith(tabKey + '_'))
    .forEach(k => {
      const date = k.replace(tabKey + '_', '')
      if (date >= dateFrom && date <= dateTo) delete h[k]
    })
  saveHistory(h)
}


// ═══════════════════════════════════════════════════════════════════════════════
// TABLE HEADER
// ═══════════════════════════════════════════════════════════════════════════════
// Columns: Product | ₹/kg/L | Morning | Evening | Qty | Kg/L | Net | [Move/Del]
const THead = ({ showDel }) => (
  <thead>
    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
      <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 130 }}>Product</th>
      <th className="px-1 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 68 }}>₹ / kg</th>
      <th className="px-1 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 62 }}>Morning</th>
      <th className="px-1 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 62 }}>Evening</th>
      <th className="px-1 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 56 }}> Total Kg </th>
      <th className="px-1 py-2 text-center text-xm font-semibold text-emerald-600 dark:text-emerald-400 uppercase" style={{ width: 80 }}>Total ₹</th>
      <th className="px-1 py-2 text-center text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 60 }}>Disc ₹</th>

      {showDel && <th style={{ width: 72 }} className="px-1 py-2 text-center text-xs font-semibold text-slate-400 uppercase">Move/Del</th>}
    </tr>
  </thead>
)

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT ROW
// ═══════════════════════════════════════════════════════════════════════════════
const ProductRow = ({ row, idx, total, modifyMode, editMode, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const { qty, actualKg, net, kgLabel, discAmt } = calcRow(row)

  const isDahi = row.id === 'dahi400'
  // ── Dahi: warn if odd number entered ──
  const dahiWarn = isDahi && qty > 0 && qty % 2 !== 0

  const cell = 'border-b border-slate-100 dark:border-slate-700/50 border-r border-slate-100 dark:border-slate-700/50 px-1 py-1.5 text-center text-xs'
  const inp = 'w-full bg-transparent border-none outline-none text-xs text-center font-mono text-slate-800 dark:text-slate-100'


  return (
    <tr className={`hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors ${dahiWarn ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>

      {/* Product name */}
      <td className={`${cell} text-left px-2 bg-slate-50/40 dark:bg-slate-700/20`}>
        {modifyMode
          ? <input className={`${inp} text-left`} value={row.name}
            onChange={e => onUpdate(idx, 'name', e.target.value)} />
          : <div>
            <span className="text-slate-800 dark:text-slate-100 text-[15px] leading-tight ">{row.name}</span>
            {isDahi && <span className="block text-[10px] text-slate-400">enter kg (even)</span>}
          </div>}
      </td>

      {/* Price per kg/L/pack */}
      <td className={cell}>
        {modifyMode
          ? <input type="text" min="0" step="0.5" className={inp} value={row.price}
            onChange={e => onUpdate(idx, 'price', e.target.value)} />
          : <span className="text-slate-500 dark:text-slate-400 text-[12px]">₹{row.price}</span>}
      </td>

      {/* Morning input */}
      <td className={cell}>
        {editMode
          ? <input
            type="text" min="0" step={isDahi ? 2 : 1}
            className={`${inp} focus:bg-blue-50 dark:focus:bg-blue-900/30 rounded`}
            value={row.morn || ''} placeholder="0"
            onChange={e => onUpdate(idx, 'morn', e.target.value)} />
          : <span className="text-slate-600 dark:text-slate-300 text-[17px]">{row.morn || '-'}</span>}
      </td>

      {/* Evening input */}
      <td className={cell}>
        {editMode
          ? <input
            type="text" min="0" step={isDahi ? 2 : 1}
            className={`${inp} focus:bg-blue-50 dark:focus:bg-blue-900/30 rounded`}
            value={row.eve || ''} placeholder="0"
            onChange={e => onUpdate(idx, 'eve', e.target.value)} />
          : <span className="text-slate-600 dark:text-slate-300 text-[16px]">{row.eve || '-'}</span>}
      </td>

      {/* Kg / L display  + warning */}
      <td className={cell}>
        <span className={`px-1.5 py-0.5 rounded font-semibold text-[12px] dark:bg-slate-600
        ${isDahi
            ? 'text-slate-800 dark:text-slate-300 leading-tight whitespace-pre-line '
            : 'text-slate-800 dark:text-slate-300 '
          }`}>
          {kgLabel}
        </span>
        {dahiWarn && <span className="block text-[9px] text-orange-500 leading-tight">enter even</span>}

      </td>

      {/* Net amount */}
      <td className="border-b border-slate-100 dark:border-slate-700/50 px-2 py-1.5 text-center">
        <span className="font-mono text-emerald-700 dark:text-emerald-400 text-[16px]">{fmt(net)}</span>
      </td>

      {/* Discount — editable only in modifyMode, otherwise read-only */}
      <td className={cell}>
        {modifyMode
          ? <input
            type="number"
            min="0"
            step="0.1"
            className={`${inp} focus:bg-orange-50 dark:focus:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800 w-14`}
            value={row.disc}
            onChange={e => onUpdate(idx, 'disc', e.target.value)}
          />
          : <span className="text-orange-500 dark:text-orange-400 text-[12px] font-mono">
            {fmtN(row.disc)}
          </span>}
      </td>

      {/* Move / Delete buttons (modifyMode only) */}
      {modifyMode && (
        <td className="border-b border-slate-100 dark:border-slate-700/50 px-1 py-1 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <button onClick={() => onMoveUp(idx)} disabled={idx === 0}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 transition-colors text-[10px]">▲</button>
            <button onClick={() => onMoveDown(idx)} disabled={idx === total - 1}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 transition-colors text-[10px]">▼</button>
            <button onClick={() => onDelete(idx)}
              className="w-5 h-5 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-xs">✕</button>
          </div>
        </td>
      )}
    </tr>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY PANEL  (last 30 saved days per tab)
// ═══════════════════════════════════════════════════════════════════════════════
const HistoryPanel = ({ tabKey, onLoad }) => {
  const [history, setHistory] = useState({})
  const [open, setOpen] = useState(false)
  const [showDel, setShowDel] = useState(false)    // toggle delete controls
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [confirmAll, setConfirmAll] = useState(false)  // confirm "delete all" step

  const reload = () => setHistory(loadHistory())
  useEffect(() => { if (open) reload() }, [open])

  // All entries for this tab, sorted newest first — no slice limit (lifetime)
  const tabHistory = Object.entries(history)
    .filter(([k]) => k.startsWith(tabKey + '_'))
    .sort((a, b) => b[0].localeCompare(a[0]))


  // ── Delete all entries for this tab ──
  const handleDeleteAll = () => {
    deleteAllForTab(tabKey)
    setConfirmAll(false)
    reload()
  }

  // ── Delete range ──
  const handleDeleteRange = () => {
    if (!rangeFrom || !rangeTo) return
    deleteRangeForTab(tabKey, rangeFrom, rangeTo)
    setRangeFrom(''); setRangeTo('')
    reload()
  }

  const count = tabHistory.length

  // ── Collapsed ──
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="text-xl font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 transition-colors px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 w-full text-left">
      📅 View saved history ({count} {count === 1 ? 'day' : 'days'})
    </button>
  )

  // ── Expanded ──
  return (
    <div className="border-t border-slate-100 dark:border-slate-700">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
        <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
          Saved History ({count} {count === 1 ? 'day' : 'days'})
        </span>
        <div className="flex items-center gap-2">
          {/* Toggle delete controls */}
          <button onClick={() => { setShowDel(v => !v); setConfirmAll(false) }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
            {showDel ? 'Cancel' : '🗑 Delete'}
          </button>
          <button onClick={() => setOpen(false)}
            className=" ml-2 text-[14px] text-indigo-400 hover:text-indigo-600">✕ Close</button>
        </div>
      </div>

      {/* ── Delete controls (shown when showDel) ── */}
      {showDel && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 space-y-3">

          {/* Delete all */}
          <div className="flex items-center gap-2">
            {!confirmAll
              ? <button onClick={() => setConfirmAll(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">
                Delete all {count} entries
              </button>
              : <>
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Sure? This cannot be undone.</span>
                <button onClick={handleDeleteAll}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
                  Yes, delete all
                </button>
                <button onClick={() => setConfirmAll(false)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
              </>}
          </div>

          {/* Delete range */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Delete range:</span>
            <input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)}
              className="px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-red-400" />
            <span className="text-xs text-slate-400">to</span>
            <input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)}
              className="px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-red-400" />
            <button onClick={handleDeleteRange} disabled={!rangeFrom || !rangeTo}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-40">
              Delete range
            </button>
          </div>
        </div>
      )}

      {/* No entries */}
      {tabHistory.length === 0 && (
        <p className="px-4 py-4 text-xs text-slate-400">No saved records yet. Fill in orders and click 💾 Save.</p>
      )}

      {/* Entry list (scrollable, no limit) */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
        {tabHistory.map(([key, data]) => {
          const dateStr = key.replace(tabKey + '_', '')
          const mt = calcTotals(data.rows || [], data.discMilk, data.discDahi)
          const et = calcTotals(data.extra || [], data.discMilk, data.discDahi)
          return (
            <div key={key} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtDateLabel(dateStr)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Milk: {fmtN(mt.milkKg + et.milkKg)} L &nbsp;·&nbsp;
                  Dahi: {fmtN(mt.dahiKg + et.dahiKg)} kg &nbsp;·&nbsp;
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(mt.net + et.net)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { onLoad(data); setOpen(false) }}
                  className="text-xl px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 transition-colors">
                  View
                </button>

                {!confirmAll
                  ? <button onClick={() => setConfirmAll(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">
                    Delete
                  </button>
                  : <>
                    <span className="text-xm text-red-600 dark:text-red-400 font-semibold">Sure? This cannot be undone.</span>
                    <button onClick={handleDeleteAll}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
                      Yes, delete
                    </button>
                    <button onClick={() => setConfirmAll(false)}
                      className="text-xm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors">
                      Cancel
                    </button>
                  </>}

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT  —  DairyOrderTable
// ═══════════════════════════════════════════════════════════════════════════════
// Props:
//   tabName  (string) – display title  e.g. "🐄 Patan Dairy"
//   tabKey   (string) – storage key    e.g. "patandairy"
const DairyOrderTable = ({ tabName, tabKey }) => {

  // Both tabs share one state object; active tab is selected by tabKey
  const [tabData, setTabData] = useState({
    patandairy: initTabState(),
    arradairy: initTabState(),
  })
  const [modifyMode, setModifyMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showExtraTable, setShowExtraTable] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayStr())

  const st = tabData[tabKey]
  const upd = patch => setTabData(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], ...patch } }))

  // ── Row array helpers ──────────────────────────────────────────────────────
  const updRow = (arr, i, field, val) =>
    arr.map((r, idx) => idx !== i ? r : { ...r, [field]: field === 'name' ? val : (parseFloat(val) || 0) })
  const delRow = (arr, i) => arr.filter((_, idx) => idx !== i)
  const moveRow = (arr, i, dir) => {
    const a = [...arr], j = i + dir
    if (j < 0 || j >= a.length) return a
      ;[a[i], a[j]] = [a[j], a[i]]
    return a
  }

  // ── Aggregated numbers ── Totals  ─────────────────────────────────────────────────────
  const mainTotals = calcTotals(st.rows, st.discMilk, st.discDahi)
  const extraTotals = calcTotals(st.extra, st.discMilk, st.discDahi)

  const extraActive = st.extra.filter(r => calcRow(r, st.discMilk, st.discDahi).qty > 0)
  const hasExtraSummary = !showExtraTable && extraActive.length > 0

  const allMilkL = mainTotals.milkKg + extraTotals.milkKg
  const allDahiKg = mainTotals.dahiKg + extraTotals.dahiKg
  const finalNet = mainTotals.net + extraTotals.net
  const finalDisc = mainTotals.disc + extraTotals.disc

  // ── Save / Load ────────────────────────────────────────────────────────────
  const handleSave = () => {
    const h = loadHistory(), key = tabKey + '_' + selectedDate
    const keys = Object.keys(h).filter(k => k.startsWith(tabKey + '_')).sort()
    // if (keys.length >= 30 && !keys.includes(key)) delete h[keys[0]]
    // No entry cap — history is kept for lifetime
    h[key] = { rows: st.rows, extra: st.extra }
    saveHistory(h)
    setSaveMsg('✓ Saved!')
    setTimeout(() => setSaveMsg(''), 2500)
  }
  const handleLoad = data => upd({ rows: data.rows, extra: data.extra })

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLE RENDERER  (reused for main rows and extra rows)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderTable = (rows, isExtra) => {
    const setRows = r => isExtra ? upd({ extra: r }) : upd({ rows: r })
    const totals = isExtra ? extraTotals : mainTotals

    return (
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <THead showDel={modifyMode} />
          <tbody>
            {rows.map((r, i) => (
              <ProductRow
                key={r.id} row={r} idx={i} total={rows.length}
                modifyMode={modifyMode} editMode={editMode}
                discMilk={st.discMilk} discDahi={st.discDahi}
                onUpdate={(idx, f, v) => setRows(updRow(rows, idx, f, v))}
                onDelete={idx => setRows(delRow(rows, idx))}
                onMoveUp={idx => setRows(moveRow(rows, idx, -1))}
                onMoveDown={idx => setRows(moveRow(rows, idx, +1))}
              />
            ))}

            {/* Add row (modifyMode only) */}
            {modifyMode && (
              <tr>
                <td colSpan={9} className="px-3 py-2">
                  <button
                    onClick={() => setRows([...rows, mkRow({ id: uid(), name: 'New product', price: 0, calcMode: 'kg' })])}
                    className="text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 hover:border-slate-400 transition-colors"
                  >+ Add row</button>
                </td>
              </tr>
            )}

            {/* Subtotal row */}
            <tr className="bg-slate-50 dark:bg-slate-700/30">
              <td colSpan={modifyMode ? 7 : 4}
                className=" text-right text-[15px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                {isExtra ? 'Extra subtotal' : 'Main subtotal'}
              </td>
              <td colSpan={3} className=" py-3 text-center border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-[18px] font-mono text-emerald-600 dark:text-emerald-400">{fmt(totals.net)}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="card overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-2">
        <div>
          <div className="font-display font-semibold text-slate-800 dark:text-slate-100 text-xl">{tabName} — Order Sheet</div>
          <div className="text-xl text-slate-400 dark:text-slate-500 mt-0.5">{fmtDateLabel(selectedDate)}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Modify: edit product names, prices; add/delete/reorder rows */}
          <button onClick={() => setModifyMode(v => !v)}
            className={`px-3 py-1.5 rounded-xl text-xm font-semibold border transition-all
              ${modifyMode
                ? 'bg-red-300  text-slate-800 border-amber-200 dark:border-amber-800'
                : 'bg-red-500  text-slate-800 border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
            {modifyMode ? '✓ Modify Save' : '⚙ Modify'}
          </button>

          {/* Edit: enter morning / evening quantities */}
          <button onClick={() => setEditMode(v => !v)}
            className={`px-3 py-2 rounded-xl text-xl font-semibold border transition-all
              ${editMode
                ? 'bg-green-400 text-black border-blue-200 '
                : 'bg-yellow-400  text-slate-800  border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
            {editMode ? '✓ Edit Save' : '✏ Edit orders'}
          </button>
        </div>
      </div>

      {/* Modify mode hint */}
      {modifyMode && (
        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800">
          <span className="text-xs text-orange-600 dark:text-orange-400">
            ⚙ Modify mode: edit product names, prices, and per-row discounts. Default per product: <strong>discAmt</strong> from product definition.
          </span>
        </div>
      )}

      {/* ── Main product table ── */}
      {renderTable(st.rows, false)}

      {/* ── Extra milk compact summary strip ── */}
      {hasExtraSummary && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/30">
            <span className="text-[18px] font-semibold text-blue-400 uppercase tracking-wide">Extra milk summary</span>
          </div>
          <div className="px-4 py-2 space-y-1">
            {extraActive.map(r => {
              const { qty, net, kgLabel } = calcRow(r)
              return (
                <div key={r.id} className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-[15px] py-1 text-slate-700 dark:text-slate-200">{r.name}  =  {kgLabel}</span>
                  <span className="text-[18px] font-mono text-slate-800 dark:text-slate-100">{fmt(net)}</span>
                </div>
              )
            })}
            <div className="flex justify-between text-sm font-bold pt-2">
              <span className="text-[18px] text-slate-800 dark:text-slate-200">Total extra</span>
              <span className="text-[18px] font-mono text-emerald-600 dark:text-emerald-400">{fmt(extraTotals.net)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Combined final total (shown when extra has active rows) ── */}
      {extraActive.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800">
          <div>
            <p className="text-[15px] text-emerald-600 dark:text-emerald-400">Main subtotal {fmt(mainTotals.net)}</p>
            <p className="text-[15px] text-emerald-600 dark:text-emerald-400">+ Extra milk {fmt(extraTotals.net)}</p>
            <p className="text-[15px] text-emerald-700 dark:text-emerald-300 mt-1">Final Total Amount</p>
          </div>
          <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{fmt(finalNet)}</span>
        </div>
      )}

      {/* ── Extra milk toggle ── */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700">
        <button onClick={() => setShowExtraTable(p => !p)}
          className="text-[20px] font-semibold text-blue-500 dark:text-blue-400 hover:text-blue-700 transition-colors">
          {showExtraTable ? '▲ Hide extra milk orders' : '+ Add extra milk'}
        </button>
      </div>

      {/* ── Extra milk full table ── */}
      {showExtraTable && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/30">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Extra milk orders</span>
          </div>
          {renderTable(st.extra, true)}
        </div>
      )}

      {/* ── Summary chips: Milk L | Dahi kg | Discount | Grand total ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-700">
        {[
          { label: 'Total milk', value: `${fmtN(allMilkL)} L`, cls: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total dahi', value: `${fmtN(allDahiKg)} kg`, cls: 'text-amber-600 dark:text-amber-400' },
          { label: 'Total discount', value: `-${fmt(finalDisc)}`, cls: 'text-red-500 dark:text-red-400' },
          { label: 'Grand total', value: fmt(finalNet), cls: 'text-emerald-600 dark:text-emerald-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
            <p className="text-[17px] text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-[19px] font-mono font-bold mt-0.5 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Save bar ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20 flex-wrap">
        <span className="text-xl text-slate-500 dark:text-slate-400 font-medium">Save for:</span>
        <input type="date" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-400" />

        <button onClick={handleSave}
          className="px-4 py-1.5 rounded-xl text-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
          💾 Save
        </button>
        {saveMsg && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{saveMsg}</span>}
      </div>

      {/* ── History panel ── */}
      <HistoryPanel tabKey={tabKey} onLoad={handleLoad} />

    </div>
  )
}

export default DairyOrderTable