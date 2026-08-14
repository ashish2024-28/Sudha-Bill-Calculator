import React, { useState, useEffect, useMemo } from 'react'
import { storageService } from '../services/storageService'
import { getFestivalAdvisor } from '../data/festivalCalendar'

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CATALOGUES & CALCULATION RULES
// ───────────────────────────────────────────────────────────────────────────────
// SUDHA / PATNA / ARRA DAIRY PRODUCTS vs. NAMASTE INDIA (OTHER DAIRY) PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── SUDHA / PATNA DAIRY / ARRA DAIRY PRODUCTS ─────────────────────────────────
export const SUDHA_BASE_PRODUCTS = [
  // id         name                     price  calcMode  discAmt
  { id: 'shak1',   name: 'Shakti 1 L',   price: 60, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'gold05',  name: 'Gold 1/2 L',   price: 70, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'shak05',  name: 'Shakti 1/2 L', price: 62, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'cow05',   name: 'Cow 1/2 L',    price: 58, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'cow1',    name: 'Cow 1 L',      price: 57, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'gold1',   name: 'Gold 1 L',     price: 68, calcMode: 'kg',   discAmt: 2.3 },

  // Dahi: user enters kg (even). 100g (₹10/pkt, ₹1.0 disc), 200g (₹20/pkt, ₹1.6 disc), 400g (₹35/pkt, ₹2.9 disc)
  { id: 'dahi200', name: 'Dahi 200 g',   price: 20, calcMode: 'dahi', discAmt: 1.6 },
  { id: 'dahi400', name: 'Dahi 400 g',   price: 35, calcMode: 'dahi', discAmt: 2.9 },
]

// ─── NAMASTE INDIA (OTHER DAIRY DEFAULT) PRODUCTS ─────────────────────────────
// Default Rates: Shakti 1 L: ₹59, Gold 1/2 L: ₹68, Shakti 1/2 L: ₹60, Cow 1/2 L: ₹56, Cow 1 L: ₹56, Gold 1 L: ₹67
export const NAMASTE_INDIA_BASE_PRODUCTS = [
  // id         name                     price  calcMode  discAmt
  { id: 'shak1',   name: 'Shakti 1 L',   price: 59, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'gold05',  name: 'Gold 1/2 L',   price: 67, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'shak05',  name: 'Shakti 1/2 L', price: 60, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'cow05',   name: 'Cow 1/2 L',    price: 56, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'cow1',    name: 'Cow 1 L',      price: 56, calcMode: 'kg',   discAmt: 2.3 },
  { id: 'gold1',   name: 'Gold 1 L',     price: 68, calcMode: 'kg',   discAmt: 2.3 },

  // Dahi: user enters kg (even). 100g (₹10/pkt, ₹1.0 disc), 200g (₹20/pkt, ₹1.6 disc), 400g (₹35/pkt, ₹2.9 disc)
  { id: 'dahi100', name: 'Dahi 100 g',   price: 10, calcMode: 'dahi', discAmt: 1.0 },
  { id: 'dahi200', name: 'Dahi 200 g',   price: 20, calcMode: 'dahi', discAmt: 1.6 },
  { id: 'dahi400', name: 'Dahi 400 g',   price: 35, calcMode: 'dahi', discAmt: 2.9 },

  // Lassi: user enters packets. ₹10 per packet with ₹1.1 discount
  { id: 'lassi10', name: 'Lassi 10 Rs',  price: 10, calcMode: 'pack', discAmt: 1.1 },
]

export const BASE_PRODUCTS = SUDHA_BASE_PRODUCTS

export const getDefaultProductsForTab = (tabKey = '') => {
  const k = String(tabKey).toLowerCase()
  if (k.includes('namaste') || k.startsWith('otherdairy')) {
    return NAMASTE_INDIA_BASE_PRODUCTS
  }
  return SUDHA_BASE_PRODUCTS
}


// ─── Calendar helpers ──────────────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDateToIso = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayStr = () => formatDateToIso(new Date())

const tomorrowStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatDateToIso(d)
}

const getNextDayStr = (dateStr) => {
  if (!dateStr) return tomorrowStr()
  const parts = String(dateStr).split('-')
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    d.setDate(d.getDate() + 1)
    return formatDateToIso(d)
  }
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 1)
  return formatDateToIso(d)
}

const fmtDateLabel = dateStr => {
  if (!dateStr) return ''
  const parts = String(dateStr).split('-')
  let d
  if (parts.length === 3) {
    d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  } else {
    d = new Date(dateStr)
  }
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${DAYS[d.getDay()]}, ${day}/${month}/${year}`
}

const formatIsoToDdMmYyyy = (isoStr) => {
  if (!isoStr) return ''
  const parts = isoStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return isoStr
}

// Helper to allow smooth decimal typing (e.g. "2.", "2.3", ".5") for Discount and monetary fields
const sanitizeDecimalInput = (val) => {
  if (val === '' || val === undefined || val === null) return ''
  const str = String(val).replace(/,/g, '.')
  const clean = str.replace(/[^0-9.]/g, '')
  const parts = clean.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }
  return clean
}

// Helper to strictly allow whole numbers / integers only (e.g. "10", "4", "2") for Order Quantities
const sanitizeIntegerInput = (val) => {
  if (val === '' || val === undefined || val === null) return ''
  return String(val).replace(/[^0-9]/g, '')
}

// ─── Row factory ───────────────────────────────────────────────────────────────
// Creates a zeroed order row from a product definition.
const mkRow = ({ id, name, price, calcMode, discAmt }) => {
  let disc = discAmt !== undefined ? discAmt : 2.30
  if (id === 'dahi100') disc = 1.0
  if (id === 'dahi200') disc = 1.6
  if (id === 'dahi400') disc = 2.9
  if (id === 'lassi10' || (name && String(name).toLowerCase().includes('lassi'))) disc = 1.1
  return {
    id, name,
    price: Number(price),
    calcMode,
    disc,
    morn: '',
    eve: '',
  }
}

const uid = () => 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
const fmt = n => '₹' + parseFloat(n || 0).toFixed(1)
const fmtN = n => {
  const v = parseFloat(n || 0)
  return v % 1 === 0 ? String(v) : v.toFixed(2)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE CALCULATION — calcRow
// ═══════════════════════════════════════════════════════════════════════════════

const calcRow = (r) => {
  const qty = (parseFloat(r.morn) || 0) + (parseFloat(r.eve) || 0)
  const disc = parseFloat(r.disc) || 0
  const price = parseFloat(r.price) || 0

  if (r.id === 'dahi100') {
    // ── Dahi 100g ───────────────────────────────────────────────────────────
    // qty = kg entered by user (1 kg = 10 packs of 100g)
    const packets = qty * 10
    const gross = packets * price          // packets × ₹10
    const discAmt = disc * packets         // packets × ₹1.0

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
    // ── Dahi 200g ───────────────────────────────────────────────────────────
    // qty = kg entered by user (must be even: 2, 4, 6 …)
    // packets = qty × 5   (200g packs per kg)
    const packets = qty * 5
    const gross = packets * price          // packets × ₹20
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

  if (r.id === 'dahi400') {
    // ── Dahi 400g ───────────────────────────────────────────────────────────
    // qty = kg entered by user (must be even: 2, 4, 6 …)
    // packets = qty × 2.5   (400g packs per kg)
    const packets = qty * 2.5
    const gross = packets * price          // packets × ₹35
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

  if (r.id === 'lassi10' || (r.name && String(r.name).toLowerCase().includes('lassi'))) {
    // ── Lassi 10 Rs ──────────────────────────────────────────────────────────
    // qty = number of packets entered
    const gross = qty * price              // qty × ₹10
    const discAmt = disc * qty             // qty × ₹1.1
    return {
      qty, packets: qty,
      actualKg: 0,                         // beverage packets
      gross, discAmt,
      net: Math.max(0, gross - discAmt),
      inputLabel: 'pkt',
      kgLabel: `${fmtN(qty)} pkt`,
    }
  }

  if (r.calcMode === 'kg') {
    // ── Milk 1 kg/L packs ───────────────────────────────────────────────────
    // qty = actual kg/L entered
    const gross = qty * price
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
  const gross = qty * price
  const discAmt = disc * qty
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

    const isDahi = r.calcMode === 'dahi' || r.id === 'dahi100' || r.id === 'dahi200' || r.id === 'dahi400'
    const isDrink = r.id === 'lassi10' || (r.name && String(r.name).toLowerCase().includes('lassi'))
    return {
      milkKg: acc.milkKg + (!isDahi && !isDrink ? c.actualKg : 0),
      dahiKg: acc.dahiKg + (isDahi ? c.actualKg : 0),
      gross: acc.gross + c.gross,
      disc: acc.disc + c.discAmt,
      net: acc.net + c.net,
    }
  }, { milkKg: 0, dahiKg: 0, gross: 0, disc: 0, net: 0 })

// ─── Initial tab state ─────────────────────────────────────────────────────────
const BANNED_PRODUCT_KEYWORDS = ['paneer', 'pedha', 'pedaa', 'butter', 'other item']

const sanitizeRows = (rows, tabKey = '') => {
  const defaultList = getDefaultProductsForTab(tabKey)
  if (!Array.isArray(rows) || rows.length === 0) return defaultList.map(mkRow)
  let filtered = rows
    .filter(r => {
      if (!r || !r.name) return false
      const nameLower = String(r.name).toLowerCase().trim()
      return !BANNED_PRODUCT_KEYWORDS.some(banned => nameLower.includes(banned))
    })
    .map(r => {
      if (r.id === 'dahi100' && (!r.disc || r.disc === 0)) return { ...r, disc: 1.0, price: r.price || 10 }
      if (r.id === 'dahi200' && (r.disc === 1.7 || !r.disc)) return { ...r, disc: 1.6, price: r.price || 20 }
      if (r.id === 'dahi400' && (r.disc === 2.865 || !r.disc)) return { ...r, disc: 2.9, price: r.price || 35 }
      if ((r.id === 'lassi10' || r.name?.toLowerCase().includes('lassi')) && (!r.disc || r.disc === 0)) {
        return { ...r, disc: 1.1, price: r.price || 10 }
      }
      return r
    })

  // Ensure standard items like Dahi 100g and Lassi are present
  const hasDahi100 = filtered.some(r => r.id === 'dahi100' || (r.name && r.name.toLowerCase().includes('dahi 100')))
  if (!hasDahi100) {
    const d100Def = defaultList.find(p => p.id === 'dahi100')
    if (d100Def) {
      const d200Idx = filtered.findIndex(r => r.id === 'dahi200')
      if (d200Idx !== -1) {
        filtered.splice(d200Idx, 0, mkRow(d100Def))
      } else {
        filtered.push(mkRow(d100Def))
      }
    }
  }

  const hasLassi = filtered.some(r => r.id === 'lassi10' || (r.name && r.name.toLowerCase().includes('lassi')))
  if (!hasLassi) {
    const lassiDef = defaultList.find(p => p.id === 'lassi10')
    if (lassiDef) {
      filtered.push(mkRow(lassiDef))
    }
  }

  return filtered.length > 0 ? filtered : defaultList.map(mkRow)
}

const initTabState = (tabKey = '') => {
  const defaultList = getDefaultProductsForTab(tabKey)
  return {
    rows: defaultList.map(mkRow),
    extra: defaultList.map(mkRow),
    lessAmt: Number(localStorage.getItem('dairy_last_less_amt') || 0),
    payOnline: 0,
    payOffline: 0,
    payMode: 'auto',
    supplyDate: '',   // ← defaults dynamically to selectedDate + 1 day
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// localStorage  (saves per-day history, max 30 entries per tab)
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'dairy_history_v4'
const LAST_LESS_KEY = 'dairy_last_less_amt'

const loadHistory = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} } }
const saveHistory = h => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) } catch { } }

// ── Helper: delete all entries for one tab ──
const deleteAllForTab = (tabKey) => {
  const h = loadHistory()
  Object.keys(h).filter(k => k.startsWith(tabKey + '_')).forEach(k => delete h[k])
  saveHistory(h)
}

// ── Helper: delete entries by 1-based serial number range (newest-first) ──
const deleteBySerialRangeForTab = (tabKey, startSn, endSn) => {
  const h = loadHistory()
  const keys = Object.keys(h)
    .filter(k => k.startsWith(tabKey + '_'))
    .sort((a, b) => b.localeCompare(a))   // newest first (S.No 1 is index 0)
  
  const startIdx = Math.max(0, startSn - 1)
  const endIdx = Math.min(keys.length - 1, endSn - 1)
  
  let deletedCount = 0
  for (let i = startIdx; i <= endIdx; i++) {
    if (keys[i]) {
      delete h[keys[i]]
      deletedCount++
    }
  }
  saveHistory(h)
  return deletedCount
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY BUILDERS  (used by both "Open Summary Page" and "Share as Text")
// ═══════════════════════════════════════════════════════════════════════════════

// Builds a plain-text summary (for clipboard / Web Share API text body)
const buildSummaryText = ({ tabName, dateLabel, supplyDateLabel, rows, extra, allMilkL, allDahiKg, finalDisc,
  finalNet, lessAmt, finalAfterLess, payOnline, payOffline, historyDays = [], historyTotals }) => {
  const lines = []
  lines.push(`📋 ${tabName} — Order Summary`)
  lines.push(`📅 Order Date: ${dateLabel}  |  🚚 Supply Date: ${supplyDateLabel}`)
  lines.push('')
  lines.push('── Main Order ──')
  rows.filter(r => calcRow(r).qty > 0).forEach(r => {
    const c = calcRow(r)
    lines.push(`${r.name}: ${c.kgLabel.replace('\n', ' ')}  =  ${fmt(c.net)}`)
  })
  const extraActive = extra.filter(r => calcRow(r).qty > 0)
  if (extraActive.length) {
    lines.push('')
    lines.push('── Extra Milk ──')
    extraActive.forEach(r => {
      const c = calcRow(r)
      lines.push(`${r.name}: ${c.kgLabel.replace('\n', ' ')}  =  ${fmt(c.net)}`)
    })
  }
  lines.push('')
  lines.push(`Total milk: ${fmtN(allMilkL)} L`)
  lines.push(`Total dahi: ${fmtN(allDahiKg)} kg`)
  lines.push(`Total discount: -${fmt(finalDisc)}`)
  lines.push(`Final Total Amount: ${fmt(finalNet)}`)
  if (lessAmt > 0) {
    lines.push(`Less Amount: -${fmt(lessAmt)}`)
    lines.push(`Final Total Amount (after less): ${fmt(finalAfterLess)}`)
  }
  lines.push('')
  lines.push(`Payment — Online: ${fmt(payOnline)}  |  Offline: ${fmt(payOffline)}`)

  // ── All saved history for this tab ──
  if (historyDays.length) {
    lines.push('')
    lines.push(`══ All Saved History (${historyDays.length} ${historyDays.length === 1 ? 'day' : 'days'}) ══`)
    historyDays.forEach(d => {
      lines.push(`${d.dateLabel} — Milk ${fmtN(d.milkL)}L, Dahi ${fmtN(d.dahiKg)}kg = ${fmt(d.net)}`)
    })
    lines.push('')
    lines.push(`Lifetime totals — Milk: ${fmtN(historyTotals.milkL)} L | Dahi: ${fmtN(historyTotals.dahiKg)} kg | Net: ${fmt(historyTotals.net)}`)
  }

  return lines.join('\n')
}

// Builds a full printable HTML page (for the Summary tab / "Save as PDF")
const buildSummaryHTML = ({ tabName, dateLabel, supplyDateLabel, rows, extra, allMilkL, allDahiKg, finalDisc,
  finalNet, lessAmt, finalAfterLess, payOnline, payOffline, historyDays = [], historyTotals }) => {

  const rowsHtml = (list) => list.filter(r => calcRow(r).qty > 0).map(r => {
    const c = calcRow(r)
    return `<tr>
      <td>${r.name}</td>
      <td style="text-align:center">${c.kgLabel.replace('\n', ' ')}</td>
      <td style="text-align:right">${fmt(c.net)}</td>
    </tr>`
  }).join('')

  const extraActive = extra.filter(r => calcRow(r).qty > 0)

  const historyRowsHtml = historyDays.map(d => `<tr>
    <td>${d.dateLabel}</td>
    <td style="text-align:center">${fmtN(d.milkL)} L</td>
    <td style="text-align:center">${fmtN(d.dahiKg)} kg</td>
    <td style="text-align:right">${fmt(d.net)}</td>
  </tr>`).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>${tabName} — Summary — ${dateLabel}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 640px; margin: 24px auto; padding: 0 16px; color: #1e293b; }
  h1 { font-size: 22px; margin-bottom: 2px; }
  .sub { color: #64748b; font-size: 14px; margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th, td { padding: 7px 6px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase; }
  .section-title { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; margin: 18px 0 6px; }
  .totals { background: #f8fafc; border-radius: 10px; padding: 12px 16px; margin-top: 10px; }
  .totals div { display:flex; justify-content:space-between; padding: 3px 0; font-size: 14px; }
  .grand { font-size: 19px; font-weight: 800; color: #059669; border-top: 1px solid #cbd5e1; margin-top: 8px; padding-top: 8px; }
  .less { color: #dc2626; }
  .final2 { font-size: 19px; font-weight: 800; color: #0f766e; }
  .pay { margin-top: 14px; background:#eff6ff; border-radius:10px; padding:12px 16px; }
  .pay div { display:flex; justify-content:space-between; font-size:14px; padding:2px 0; }
  .history-totals { background: #f1f5f9; border-radius: 10px; padding: 12px 16px; margin-top: 8px; font-weight: 700; }
  .history-totals div { display:flex; justify-content:space-between; font-size: 14px; }
  @media print { body { margin: 0; padding: 12px; } }
</style>
</head>
<body>
  <h1>${tabName} — Order Summary</h1>
  <p class="sub">📅 Order Date: ${dateLabel} &nbsp;•&nbsp; 🚚 Supply Date: ${supplyDateLabel}</p>

  <div class="section-title">Main Order</div>
  <table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${rowsHtml(rows) || '<tr><td colspan="3" style="color:#94a3b8">No items</td></tr>'}</tbody></table>

  ${extraActive.length ? `
  <div class="section-title">Extra Milk</div>
  <table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${rowsHtml(extra)}</tbody></table>` : ''}

  <div class="totals">
    <div><span>Total milk</span><strong>${fmtN(allMilkL)} L</strong></div>
    <div><span>Total dahi</span><strong>${fmtN(allDahiKg)} kg</strong></div>
    <div><span>Total discount</span><strong>-${fmt(finalDisc)}</strong></div>
    <div class="grand"><span>Final Total Amount</span><span>${fmt(finalNet)}</span></div>
    ${lessAmt > 0 ? `
    <div class="less"><span>Less Amount</span><span>-${fmt(lessAmt)}</span></div>
    <div class="final2"><span>Final Total Amount</span><span>${fmt(finalAfterLess)}</span></div>` : ''}
  </div>

  <div class="pay">
    <div><span>💳 Online</span><strong>${fmt(payOnline)}</strong></div>
    <div><span>💵 Offline</span><strong>${fmt(payOffline)}</strong></div>
  </div>

  ${historyDays.length ? `
  <div class="section-title">All Saved History (${historyDays.length} ${historyDays.length === 1 ? 'day' : 'days'})</div>
  <table><thead><tr><th>Date</th><th style="text-align:center">Milk</th><th style="text-align:center">Dahi</th><th style="text-align:right">Net</th></tr></thead>
  <tbody>${historyRowsHtml}</tbody></table>` : ''
    }

  <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:24px;">Generated by Sudha Bill Calculator</p>
  <script>window.onload = () => { /* user can press Ctrl/Cmd+P to save as PDF */ }</script>
</body></html>`
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE HEADER
// ═══════════════════════════════════════════════════════════════════════════════
// Columns: Product | ₹/kg/L | Total Kg | Total Kg | Total ₹ | Disc ₹ | [Move/Del]
const THead = ({ showDel }) => (
  <thead>
    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
      <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-2 sm:px-3 py-2 text-left sm:text-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase border-r border-slate-200 dark:border-slate-700 shadow-[1px_0_0_0_#cbd5e1] dark:shadow-[1px_0_0_0_#334155]" style={{ width: 135, minWidth: 125 }}>Product</th>
      <th className="px-1 py-2 text-center text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 42 }}>₹ / kg</th>
      <th className="px-1 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 65 }}>Total Kg</th>
      <th className="px-1 py-2 text-center text-xs sm:text-sm font-extrabold text-blue-700 dark:text-blue-300 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 75 }}>Total Kg</th>
      <th className="px-1 py-2 text-center text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase" style={{ width: 85 }}>Total ₹</th>
      <th className="px-1 py-2 text-center text-xs font-bold text-orange-500 dark:text-orange-400 uppercase border-r border-slate-200 dark:border-slate-700" style={{ width: 60 }}>Disc ₹</th>

      {showDel && <th style={{ width: 72 }} className="px-1 py-2 text-center text-xs font-bold text-slate-400 uppercase">Move/Del</th>}
    </tr>
  </thead>
)

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT ROW
// ═══════════════════════════════════════════════════════════════════════════════
const ProductRow = ({ row, idx, total, modifyMode, editMode, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const { qty, net, kgLabel } = calcRow(row)

  const isDahi = row.id === 'dahi400' || row.id === 'dahi200' || row.id === 'dahi100'
  // ── Dahi 400g: warn if odd kg entered (since 1 kg = 2.5 packs) ──
  const dahiWarn = row.id === 'dahi400' && qty > 0 && qty % 2 !== 0

  const cell = 'border-b border-slate-100 dark:border-slate-700/50 border-r border-slate-100 dark:border-slate-700/50 px-1 py-1.5 text-center text-xs'
  const inp = 'w-full bg-transparent border-none outline-none text-xs text-center font-mono text-slate-800 dark:text-slate-100'


  return (
    <tr className={`hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors ${dahiWarn ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>

      {/* Product name: Sticky on left for mobile phones */}
      <td className={`${cell} text-left px-2 sticky left-0 z-10 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#334155]`}>
        {modifyMode
          ? <input className="w-full text-sm sm:text-base font-bold text-slate-900 dark:text-white bg-amber-50 dark:bg-slate-800 px-2 py-1 rounded-lg border-none outline-none focus:bg-amber-100 dark:focus:bg-slate-700" value={row.name}
            onChange={e => onUpdate(idx, 'name', e.target.value)} />
          : <div>
            <span className="text-slate-800 dark:text-slate-100 text-[15px] sm:text-[17px] font-bold leading-tight">{row.name}</span>
          </div>}
      </td>

      {/* Price per kg/L/pack */}
      <td className={cell}>
        {modifyMode
          ? <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            className={`${inp} text-xs font-semibold`}
            value={row.price !== undefined && row.price !== null ? row.price : ''}
            onChange={e => onUpdate(idx, 'price', e.target.value)}
          />
          : <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-[12px] font-medium">₹{row.price}</span>}
      </td>

      {/* Morning input or Order Quantity / Packets */}
      <td className={cell}>
        {editMode
          ? <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full bg-yellow-50 dark:bg-slate-800 border-none outline-none text-base sm:text-lg md:text-xl font-black text-center font-mono text-slate-900 dark:text-white rounded-lg py-1 px-1 focus:bg-yellow-100 dark:focus:bg-slate-700 select-all"
            value={row.morn !== undefined && row.morn !== null ? row.morn : ''}
            placeholder="0"
            onChange={e => onUpdate(idx, 'morn', e.target.value)} />
          : <span className="text-slate-800 dark:text-slate-100 text-[18px] sm:text-[20px] font-extrabold">{row.morn || '-'}</span>}
      </td>

      {/* Kg / L display  + warning */}
      <td className={cell}>
        <span className={`px-1 py-0.5 rounded font-bold text-[13px] sm:text-[14px] dark:bg-slate-700/80
        ${isDahi
            ? 'text-blue-900 dark:text-blue-200 leading-tight whitespace-pre-line'
            : 'text-blue-900 dark:text-blue-200'
          }`}>
          {kgLabel}
        </span>
        {dahiWarn && <span className="block text-[10px] text-orange-500 font-bold leading-tight">enter even</span>}

      </td>

      {/* Net amount */}
      <td className="border-b border-slate-100 dark:border-slate-700/50 px-2 py-1.5 text-center">
        <span className="font-mono text-emerald-700 dark:text-emerald-400 text-[17px] sm:text-[19px] font-extrabold">{fmt(net)}</span>
      </td>

      {/* Discount — editable only in modifyMode, otherwise read-only */}
      <td className={cell}>
        {modifyMode
          ? <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className={`${inp} focus:bg-orange-50 dark:focus:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800 w-14 font-bold`}
            value={row.disc !== undefined && row.disc !== null ? row.disc : ''}
            onChange={e => onUpdate(idx, 'disc', e.target.value)}
          />
          : <span className="text-orange-500 dark:text-orange-400 text-[13px] font-bold font-mono">
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
  const [showDel, setShowDel] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)

  // S.No delete controls
  const [keepTopInput, setKeepTopInput] = useState('') // e.g., "10" -> deletes S.No 11 to count
  const [rangeFromSn, setRangeFromSn] = useState('')   // e.g., "11"
  const [rangeToSn, setRangeToSn] = useState('')     // e.g., "100"
  
  const [snError, setSnError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null) // { startSn, endSn, type, keepN, items }

  const reload = () => setHistory(loadHistory())
  useEffect(() => { if (open) reload() }, [open])

  const tabHistory = Object.entries(history)
    .filter(([k]) => k.startsWith(tabKey + '_'))
    .sort((a, b) => b[0].localeCompare(a[0]))  // newest first (S.No 1, 2, ...)

  const count = tabHistory.length

  // Preview deletion for "Keep Top X" (e.g. enter 10 -> deletes 11 to count)
  const handlePreviewKeepTop = () => {
    const keepN = parseInt(keepTopInput, 10)
    if (isNaN(keepN) || keepN < 1) {
      setSnError('Please enter a valid S.No number (≥ 1)')
      return
    }
    if (keepN >= count) {
      setSnError(`Only ${count} ${count === 1 ? 'entry' : 'entries'} exist. Enter a number less than ${count}.`)
      return
    }
    const startSn = keepN + 1
    const endSn = count
    const itemsToDelete = tabHistory.slice(keepN).map(([key, data], idx) => ({
      serialNo: keepN + 1 + idx,
      key,
      dateStr: key.replace(tabKey + '_', ''),
      data
    }))

    setSnError('')
    setPendingDelete({
      startSn,
      endSn,
      type: 'keepTop',
      keepN,
      items: itemsToDelete
    })
  }

  // Preview deletion for specific S.No Range (e.g. From 11 To 100 or End)
  const handlePreviewRange = () => {
    const start = parseInt(rangeFromSn, 10)
    if (isNaN(start) || start < 1) {
      setSnError('Start S.No must be at least 1')
      return
    }
    if (start > count) {
      setSnError(`Start S.No (${start}) exceeds total entries (${count})`)
      return
    }
    let end = parseInt(rangeToSn, 10)
    if (isNaN(end) || !rangeToSn) {
      end = count // default to End (total count)
    }
    if (end < start) {
      setSnError('End S.No must be greater than or equal to Start S.No')
      return
    }
    const endClamped = Math.min(count, end)
    const itemsToDelete = tabHistory.slice(start - 1, endClamped).map(([key, data], idx) => ({
      serialNo: start + idx,
      key,
      dateStr: key.replace(tabKey + '_', ''),
      data
    }))

    setSnError('')
    setPendingDelete({
      startSn: start,
      endSn: endClamped,
      type: 'range',
      items: itemsToDelete
    })
  }

  const handleExecuteDelete = () => {
    if (!pendingDelete) return
    const { startSn, endSn } = pendingDelete
    deleteBySerialRangeForTab(tabKey, startSn, endSn)
    
    setPendingDelete(null)
    setKeepTopInput('')
    setRangeFromSn('')
    setRangeToSn('')
    setSnError('')
    reload()
  }

  const handleDeleteAll = () => {
    deleteAllForTab(tabKey)
    setConfirmAll(false)
    setPendingDelete(null)
    reload()
  }

  // Collapsed
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="text-xl font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 transition-colors px-4 py-4 pt-6 border-t border-slate-100 dark:border-slate-700 w-full text-left">
      📅 View saved history ({count} {count === 1 ? 'day' : 'days'})
    </button>
  )

  return (
    <div className="border-t border-slate-100 dark:border-slate-700">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-5 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
        <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
          Saved History ({count} {count === 1 ? 'day' : 'days'})
        </span>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <button onClick={() => { setShowDel(v => !v); setConfirmAll(false); setPendingDelete(null); setSnError('') }}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 transition-colors px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 font-semibold shadow-xs">
              {showDel ? 'Cancel Delete' : '🗑️ Delete S.No'}
            </button>
          )}
          <button onClick={() => setOpen(false)}
            className="ml-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold">✕ Close</button>
        </div>
      </div>

      {/* Delete Controls Panel */}
      {showDel && count > 0 && (
        <div className="px-4 py-3.5 bg-red-50/70 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/40 space-y-4">

          {/* Pending Delete Preview Modal / Box */}
          {pendingDelete ? (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-red-400 dark:border-red-700 shadow-xl space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="text-base">⚠️</span> 
                    Confirm Deleting S.No {pendingDelete.startSn} to {pendingDelete.endSn}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {pendingDelete.type === 'keepTop' 
                      ? `This will keep the first ${pendingDelete.keepN} entries (S.No 1 to ${pendingDelete.keepN}) and delete S.No ${pendingDelete.startSn} to ${pendingDelete.endSn} (${pendingDelete.items.length} ${pendingDelete.items.length === 1 ? 'entry' : 'entries'}).`
                      : `Are you sure you want to delete ${pendingDelete.items.length} ${pendingDelete.items.length === 1 ? 'entry' : 'entries'} (S.No ${pendingDelete.startSn} to ${pendingDelete.endSn})?`}
                  </p>
                </div>
              </div>

              {/* Scrollable list of items targeted for deletion */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-2 space-y-1">
                {pendingDelete.items.map((item) => {
                  const mt = calcTotals(item.data.rows || [])
                  const et = calcTotals(item.data.extra || [])
                  const grossNet = mt.net + et.net
                  const lessAmt = Number(item.data.lessAmt) || 0
                  const finalNet = Math.max(0, grossNet - lessAmt)

                  return (
                    <div key={item.key} className="py-2 px-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-bold text-[11px] shrink-0">
                          S.No {item.serialNo}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {fmtDateLabel(item.dateStr)}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Milk: {fmtN(mt.milkKg + et.milkKg)} L &nbsp;·&nbsp; Dahi: {fmtN(mt.dahiKg + et.dahiKg)} kg &nbsp;·&nbsp; {fmt(finalNet)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-red-600 dark:text-red-400 text-xs">
                          {fmt(finalNet)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={handleExecuteDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5"
                >
                  🗑️ Yes, Delete S.No {pendingDelete.startSn} to {pendingDelete.endSn}
                </button>
                <button
                  onClick={() => setPendingDelete(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Option 1: Keep Top X entries (Delete S.No X+1 to max) */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-200 dark:border-red-900/40">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                  1. Keep Top Entries (Delete After S.No X)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  E.g. If you enter <span className="font-mono font-bold text-slate-700 dark:text-slate-300">10</span>, entries from S.No <span className="font-bold text-red-600">11 to {count >= 11 ? count : 'End'}</span> will be deleted.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Keep Top:</span>
                    <input
                      type="number" min="1" max={count - 1} placeholder="e.g. 10"
                      value={keepTopInput}
                      onChange={e => { setKeepTopInput(e.target.value); setSnError('') }}
                      className="w-20 px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-1 focus:ring-red-500 outline-none"
                    />
                    <span className="text-xs text-slate-500">entries</span>
                  </div>
                  <button
                    onClick={handlePreviewKeepTop}
                    disabled={!keepTopInput}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-40"
                  >
                    Delete After S.No {keepTopInput ? parseInt(keepTopInput, 10) : 'X'}
                  </button>
                </div>
              </div>

              {/* Option 2: Delete specific S.No Range */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-200 dark:border-red-900/40">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                  2. Delete S.No Range (or to End)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Enter starting S.No and ending S.No. Leave "To" empty to delete up to the End (S.No {count}).
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">From:</span>
                    <input
                      type="number" min="1" max={count} placeholder="S.No"
                      value={rangeFromSn}
                      onChange={e => { setRangeFromSn(e.target.value); setSnError('') }}
                      className="w-16 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">To:</span>
                    <input
                      type="number" min="1" max={count} placeholder={`End (${count})`}
                      value={rangeToSn}
                      onChange={e => { setRangeToSn(e.target.value); setSnError('') }}
                      className="w-20 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handlePreviewRange}
                    disabled={!rangeFromSn}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-40"
                  >
                    Delete Range
                  </button>
                </div>
              </div>

              {/* Option 3: Delete All */}
              <div className="flex items-center justify-between pt-1">
                {!confirmAll ? (
                  <button
                    onClick={() => setConfirmAll(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 font-semibold transition-colors"
                  >
                    Delete All ({count} entries)
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Are you sure? All {count} history records will be deleted.</span>
                    <button
                      onClick={handleDeleteAll}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                    >
                      Yes, Delete All
                    </button>
                    <button
                      onClick={() => setConfirmAll(false)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {snError && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100/80 dark:bg-red-900/40 p-2 rounded-lg border border-red-200 dark:border-red-800">
              ⚠️ {snError}
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {tabHistory.length === 0 && (
        <p className="px-4 py-4 text-xs text-slate-400">No saved records yet. Fill in orders and click 💾 Save.</p>
      )}

      {/* Entry list with S.No */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
        {tabHistory.map(([key, data], index) => {
          const dateStr = key.replace(tabKey + '_', '')
          const mt = calcTotals(data.rows || [])
          const et = calcTotals(data.extra || [])
          const grossNet = mt.net + et.net
          const lessAmt = Number(data.lessAmt) || 0
          const finalNet = Math.max(0, grossNet - lessAmt)
          const serialNo = index + 1   // 1-based, renumbers automatically after any deletion

          return (
            <div key={key} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">

              {/* S.No badge */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-700/50">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">{serialNo}</span>
              </div>

              {/* Date + summary */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {fmtDateLabel(dateStr)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Milk: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{fmtN(mt.milkKg + et.milkKg)} L</strong></span>
                  <span>·</span>
                  <span>Dahi: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{fmtN(mt.dahiKg + et.dahiKg)} kg</strong></span>
                  <span>·</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{fmt(finalNet)}</strong>
                </p>
              </div>

              {/* View button */}
              <button onClick={() => { onLoad(data, dateStr); setOpen(false) }}
                className="flex-shrink-0 text-xs px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-semibold">
                View
              </button>
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
const DairyOrderTable = ({ tabName, tabKey, onOpenLogs, onOpenFestivalAdvisor }) => {

  // Auto-restore draft from Local Storage on load
  const [tabData, setTabData] = useState(() => {
    const draft = storageService.getActiveDraft()
    if (draft && draft.tabData && typeof draft.tabData === 'object') {
      const sanitized = {}
      Object.keys(draft.tabData).forEach(k => {
        const item = draft.tabData[k]
        if (item && typeof item === 'object') {
          sanitized[k] = {
            ...item,
            rows: sanitizeRows(item.rows, k),
            extra: sanitizeRows(item.extra, k)
          }
        }
      })
      return sanitized
    }
    return {
      patandairy: initTabState('patandairy'),
      arradairy: initTabState('arradairy'),
      otherdairy: initTabState('otherdairy'),
    }
  })

  const [modifyMode, setModifyMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showExtraTable, setShowExtraTable] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareToast, setShareToast] = useState('')
  const [saveToastInfo, setSaveToastInfo] = useState(null)
  const [saveConfirmModal, setSaveConfirmModal] = useState(null)

  const st = tabData[tabKey] || initTabState(tabKey)

  // Effective supply date is ALWAYS at least selectedDate + 1 day unless explicitly set to a later date
  const effectiveSupplyDate = (st.supplyDate && st.supplyDate > selectedDate)
    ? st.supplyDate
    : getNextDayStr(selectedDate)

  // Festival Demand Advisor for Supply Date (or Order Date)
  const festivalAdvisor = useMemo(() => {
    return getFestivalAdvisor(effectiveSupplyDate)
  }, [effectiveSupplyDate])

  // ── Auto-save tabData to local storage whenever state changes ───────────────
  useEffect(() => {
    storageService.saveActiveDraft({ tabData })
  }, [tabData])

  // ── Activity Logging helper ───────────────────────────────────────────────
  const logActivity = (action, details, type = 'update') => {
    storageService.addActivityLog({
      tab: tabName,
      action,
      details,
      type
    })
  }

  // ── Unsaved Changes / Refresh & Navigation Guard ─────────────────────────
  const hasActiveEntries = Boolean(
    (st.rows && st.rows.some(r => r.morn > 0 || r.eve > 0)) ||
    (st.extra && st.extra.some(r => r.morn > 0 || r.eve > 0)) ||
    st.lessAmt > 0 || st.payOnline > 0
  )

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasActiveEntries) {
        e.preventDefault()
        e.returnValue = 'Data is auto-saved in local storage draft. Are you sure you want to refresh or close?'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasActiveEntries])

  useEffect(() => {
    const handlePopState = () => {
      if (hasActiveEntries) {
        const confirmLeave = window.confirm(
          `You have active entries in ${tabName}. All progress is auto-saved locally. Are you sure you want to go back?`
        )
        if (!confirmLeave) {
          window.history.pushState(null, '', window.location.href)
        }
      }
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hasActiveEntries, tabName])

  const upd = patch => setTabData(prev => ({ ...prev, [tabKey]: { ...(prev[tabKey] || initTabState(tabKey)), ...patch } }))

  // ── Row array helpers with activity logging ─────────────────────────────────
  const updRow = (arr, i, field, val) => {
    let sanitizedVal = val
    if (field === 'morn' || field === 'eve') {
      sanitizedVal = sanitizeIntegerInput(val)
    } else if (field === 'disc' || field === 'price') {
      sanitizedVal = sanitizeDecimalInput(val)
    }
    const updated = arr.map((r, idx) => idx !== i ? r : { ...r, [field]: sanitizedVal })
    const item = arr[i]
    if (item && field !== 'name') {
      logActivity('Update Qty', `Changed ${item.name} ${field} to ${sanitizedVal || 0}`, 'update')
    } else if (item && field === 'name') {
      logActivity('Rename Product', `Renamed product to "${val}"`, 'update')
    }
    return updated
  }

  const delRow = (arr, i) => {
    const item = arr[i]
    if (item) {
      logActivity('Remove Row', `Removed ${item.name} from product list`, 'delete')
    }
    return arr.filter((_, idx) => idx !== i)
  }

  const moveRow = (arr, i, dir) => {
    const a = [...arr], j = i + dir
    if (j < 0 || j >= a.length) return a
    ;[a[i], a[j]] = [a[j], a[i]]
    logActivity('Reorder', `Reordered row ${a[j]?.name || ''}`, 'update')
    return a
  }

  // ── Aggregated numbers ── Totals ───────────────────────────────────────────
  const mainTotals = calcTotals(st.rows)
  const extraTotals = calcTotals(st.extra)

  const extraActive = st.extra.filter(r => calcRow(r).qty > 0)
  const hasExtraSummary = !showExtraTable && extraActive.length > 0

  const allMilkL = mainTotals.milkKg + extraTotals.milkKg
  const allDahiKg = mainTotals.dahiKg + extraTotals.dahiKg
  const finalNet = mainTotals.net + extraTotals.net
  const finalDisc = mainTotals.disc + extraTotals.disc

  // ── Less Amount + Final Total After Less ──────────────────────────────────
  const lessAmt = Number(st.lessAmt) || 0
  const finalAfterLess = Math.max(0, finalNet - lessAmt)

  // ── Payment mode (Online / Offline) ─────────────────────────────────────────
  const payOnline = Number(st.payOnline) || 0
  const payOffline = st.payMode === 'manual'
    ? (Number(st.payOffline) || 0)
    : Math.max(0, finalAfterLess - payOnline)

  const handleOnlineChange = (val) => {
    const sanitized = sanitizeDecimalInput(val)
    const online = parseFloat(sanitized) || 0
    upd({ payOnline: sanitized, payMode: 'auto', payOffline: Math.max(0, finalAfterLess - online) })
    logActivity('Payment Online', `Set Online payment to ₹${online}`, 'update')
  }

  const handleOfflineChange = (val) => {
    const sanitized = sanitizeDecimalInput(val)
    const offline = parseFloat(sanitized) || 0
    upd({ payOffline: sanitized, payMode: 'manual' })
    logActivity('Payment Offline', `Set Offline payment to ₹${offline}`, 'update')
  }

  const handleLessAmtChange = (val) => {
    const sanitized = sanitizeDecimalInput(val)
    const v = parseFloat(sanitized) || 0
    upd({ lessAmt: sanitized })
    logActivity('Less Amount', `Set discount/less amount to ₹${v}`, 'update')
    try { localStorage.setItem(LAST_LESS_KEY, String(v)) } catch { }
  }

  // ── Save / Overwrite / Refresh / Load ─────────────────────────────────────────
  const handleSaveInitiate = () => {
    const h = loadHistory(), key = tabKey + '_' + selectedDate
    const existingRecord = h[key]

    if (existingRecord) {
      // Record exists for this date! Show confirmation modal with summary of changes
      const oldTotals = calcTotals(existingRecord.rows || [])
      const oldExtra = calcTotals(existingRecord.extra || [])
      const oldGrossNet = oldTotals.net + oldExtra.net
      const oldLess = Number(existingRecord.lessAmt) || 0
      const oldFinal = Math.max(0, oldGrossNet - oldLess)

      setSaveConfirmModal({
        key,
        dateStr: selectedDate,
        formattedDate: formatIsoToDdMmYyyy(selectedDate),
        oldTotal: oldFinal,
        newTotal: finalAfterLess,
      })
    } else {
      // First time saving for this date: save directly!
      executeSave(false)
    }
  }

  const executeSave = (isOverwrite = false) => {
    const h = loadHistory(), key = tabKey + '_' + selectedDate
    h[key] = {
      rows: st.rows, extra: st.extra,
      lessAmt: st.lessAmt, payOnline: st.payOnline, payOffline: st.payOffline, payMode: st.payMode,
      supplyDate: effectiveSupplyDate,
      savedAt: new Date().toISOString(),
    }
    saveHistory(h)

    const formattedDate = formatIsoToDdMmYyyy(selectedDate)
    const logMsg = `${isOverwrite ? 'Overwrote' : 'Saved'} bill for date ${selectedDate} (Final Total: ₹${finalAfterLess})`
    logActivity('Save Bill', logMsg, 'save')

    const badgeText = isOverwrite ? '✓ Overwritten & Saved!' : '✓ Saved!'
    setSaveMsg(badgeText)

    setSaveToastInfo({
      type: isOverwrite ? 'overwrite' : 'save',
      title: isOverwrite ? 'Bill Overwritten & Updated' : 'Bill Saved Successfully',
      message: `${tabName} • Order Date: ${formattedDate} • Total: ₹${finalAfterLess}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    setSaveConfirmModal(null)
    setTimeout(() => setSaveMsg(''), 3000)
    setTimeout(() => setSaveToastInfo(null), 4500)
  }

  const handleRefresh = () => {
    const clearedRows = st.rows.map(r => ({ ...r, morn: '' }))
    const clearedExtra = st.extra.map(r => ({ ...r, morn: '' }))

    upd({
      rows: clearedRows,
      extra: clearedExtra,
      lessAmt: 0,
      payOnline: 0,
      payOffline: 0,
      payMode: 'auto',
    })

    logActivity('Refresh Form', 'Cleared all written order quantities and payments', 'update')

    setSaveToastInfo({
      type: 'refresh',
      title: 'Form Refreshed & Cleared',
      message: `All typed quantities in ${tabName} have been cleared.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    setTimeout(() => setSaveToastInfo(null), 3500)
  }

  const handleLoad = (data, dateStr) => {
    const targetDate = dateStr || selectedDate
    const loadedSupply = (data.supplyDate && data.supplyDate > targetDate)
      ? data.supplyDate
      : getNextDayStr(targetDate)

    upd({
      rows: sanitizeRows(data.rows),
      extra: sanitizeRows(data.extra),
      lessAmt: data.lessAmt || 0, payOnline: data.payOnline || 0,
      payOffline: data.payOffline || 0, payMode: data.payMode || 'auto',
      supplyDate: loadedSupply,
    })
    logActivity('Restore Bill', `Restored saved record from ${targetDate}`, 'restore')
    if (dateStr) setSelectedDate(dateStr)

    setSaveToastInfo({
      type: 'restore',
      title: 'Bill Restored from History',
      message: `${tabName} • Order Date: ${formatIsoToDdMmYyyy(targetDate)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    setTimeout(() => setSaveToastInfo(null), 3500)
  }

  const handleResetProducts = () => {
    const defaultList = getDefaultProductsForTab(tabKey)
    upd({
      rows: defaultList.map(mkRow),
      extra: defaultList.map(mkRow)
    })
    logActivity('Reset Catalog', 'Restored default milk, dahi, and lassi product catalog', 'update')
    setSaveMsg('✓ Reset to default products list!')
    setTimeout(() => setSaveMsg(''), 2500)
  }

  // ── Share / Summary helpers ─────────────────────────────────────────────────
  const summaryArgs = () => {
    // Pull every saved day for this tab from localStorage
    const h = loadHistory()
    const historyDays = Object.entries(h)
      .filter(([k]) => k.startsWith(tabKey + '_'))
      .map(([k, data]) => {
        const dateStr = k.replace(tabKey + '_', '')
        const mt = calcTotals(data.rows || [])
        const et = calcTotals(data.extra || [])
        const grossNet = mt.net + et.net
        const lessAmt = Number(data.lessAmt) || 0
        const finalNet = Math.max(0, grossNet - lessAmt)
        return {
          dateStr,
          dateLabel: fmtDateLabel(dateStr),
          milkL: mt.milkKg + et.milkKg,
          dahiKg: mt.dahiKg + et.dahiKg,
          net: finalNet,
          lessAmt,
          payOnline: data.payOnline || 0,
          payOffline: data.payOffline || 0,
        }
      })
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr))

    const historyTotals = historyDays.reduce((acc, d) => ({
      milkL: acc.milkL + d.milkL,
      dahiKg: acc.dahiKg + d.dahiKg,
      net: acc.net + d.net,
    }), { milkL: 0, dahiKg: 0, net: 0 })

    return {
      tabName,
      dateLabel: fmtDateLabel(selectedDate),
      supplyDateLabel: fmtDateLabel(effectiveSupplyDate),
      rows: st.rows, extra: st.extra,
      allMilkL, allDahiKg, finalDisc, finalNet,
      lessAmt, finalAfterLess, payOnline, payOffline,
      historyDays, historyTotals,
    }
  }

  const handleOpenSummaryPage = () => {
    const html = buildSummaryHTML(summaryArgs())
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    } else {
      setShareToast('Please allow pop-ups to view the summary page')
      setTimeout(() => setShareToast(''), 3000)
    }
    setShowShareMenu(false)
  }

  const handleShareText = async () => {
    const text = buildSummaryText(summaryArgs())
    try {
      if (navigator.share) {
        await navigator.share({ title: `${tabName} — Order Summary`, text })
        setShareToast('Shared!')
      } else {
        await navigator.clipboard.writeText(text)
        setShareToast('Copied summary to clipboard!')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') setShareToast('Share failed')
    }
    setTimeout(() => setShareToast(''), 2800)
    setShowShareMenu(false)
  }

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
            <tr className="bg-slate-100/90 dark:bg-slate-700/60 border-t-2 border-slate-300 dark:border-slate-600">
              <td colSpan={4}
                className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-700/90 text-left pl-3 sm:pl-8 pr-3 py-3.5 text-[15px] sm:text-[18px] font-bold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                {isExtra ? 'Extra subtotal' : 'Main subtotal'}
              </td>
              <td className="py-3.5 text-center">
                <span className="font-extrabold text-[20px] sm:text-[22px] font-mono text-emerald-600 dark:text-emerald-400">{fmt(totals.net)}</span>
              </td>
              <td colSpan={modifyMode ? 2 : 1}></td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  const [isOnline, setIsOnline] = useState(false)    // toggle online or not controls

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="card overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-2">
        <div>
          <div className="font-display font-semibold text-slate-800 dark:text-slate-100 text-xl">{tabName} — Order Sheet</div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span>📅 Order: {fmtDateLabel(selectedDate)}</span>
            <span>•</span>
            <span>🚚 Supply: {fmtDateLabel(effectiveSupplyDate)}</span>
            
          </div>

        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Modify: standard size, solid black text */}
          <button onClick={() => setModifyMode(v => !v)}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap text-black
              ${modifyMode
                ? 'bg-red-300 border-red-400'
                : 'bg-red-500 border-red-600 hover:bg-red-600'}`}>
            {modifyMode ? '✓ Modify Save' : '⚙ Modify'}
          </button>

          {/* Edit: 1.8x enlarged size */}
          <button onClick={() => setEditMode(v => !v)}
            className={`px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg md:text-xl font-black border-2 transition-all cursor-pointer active:scale-95 shadow-md whitespace-nowrap
              ${editMode
                ? 'bg-emerald-400 text-slate-950 border-emerald-500 font-extrabold'
                : 'bg-yellow-400 text-slate-900 border-yellow-500 hover:bg-yellow-500'}`}>
            {editMode ? '✓ Edit Save' : '✏ Edit orders'}
          </button>

          {/* Refresh: enlarged sky-blue icon-only button on the right side */}
          <button
            onClick={handleRefresh}
            title="Clear all written quantities"
            className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-slate-950 border border-sky-500 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs shrink-0 whitespace-nowrap"
          >
            <span className="text-xl sm:text-2xl leading-none">🔄</span>
          </button>
        </div>
      </div>

      {/* Modify mode hint */}
      {modifyMode && (
        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-orange-600 dark:text-orange-400">
            ⚙ Modify mode: edit product names, prices, and per-row discounts.
          </span>
          <button
            onClick={handleResetProducts}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
          >
            ↺ Reset to Old Products
          </button>
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

      {/* If no extra milk rows are active, still show the plain Final Total Amount banner
          so the Less Amount / Payment sections below always have a clear total above them. */}
      {extraActive.length === 0 && (
        <div className="flex items-center justify-between px-4 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800">
          <span className="text-[18px] text-emerald-700 dark:text-emerald-300 font-semibold">Final Total Amount</span>
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


      {/* ═══════════════════════════════════════════════════════════════════════
          LESS AMOUNT  →  FINAL TOTAL AMOUNT (after less)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-rose-50/40 dark:bg-rose-900/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-[16px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            ➖ Less Amount
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={st.lessAmt !== undefined && st.lessAmt !== null ? st.lessAmt : ''}
            onChange={e => handleLessAmtChange(e.target.value)}
            className="w-28 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 text-right font-mono text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-rose-100 dark:border-rose-900/30">
          <span className="text-[18px] font-bold text-teal-700 dark:text-teal-300">Final Total Amount</span>
          <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">{fmt(finalAfterLess)}</span>
        </div>
      </div>


      {/* ── Summary chips: Milk L | Dahi kg | Discount | Grand total (Compact & Smaller) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 sm:px-4 py-2.5 border-t border-slate-100 dark:border-slate-700">
        {[
          { label: 'Total milk', value: `${fmtN(allMilkL)} L`, cls: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total dahi', value: `${fmtN(allDahiKg)} kg`, cls: 'text-amber-600 dark:text-amber-400' },
          { label: 'Total discount', value: `-${fmt(finalDisc)}`, cls: 'text-red-500 dark:text-red-400' },
          { label: 'Grand total', value: fmt(finalAfterLess), cls: 'text-emerald-600 dark:text-emerald-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2 sm:p-2.5 border border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-sm sm:text-base font-mono font-bold mt-0.5 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>



      {/* ═══════════════════════════════════════════════════════════════════════
          PAYMENT MODE  —  Online / Offline split
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 py-1.5">
        <button onClick={() => setIsOnline(p => !p)}
          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-2xs">
          {!isOnline ? 'Online Payment' : 'Payment Mode Hide'}
        </button>
      </div>

      {isOnline && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-blue-50/40 dark:bg-blue-900/10">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">💳 Payment Mode</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Online</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={st.payOnline !== undefined && st.payOnline !== null ? st.payOnline : ''}
                onChange={e => handleOnlineChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-right font-mono text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Offline {st.payMode !== 'manual' && <span className="text-[10px] text-slate-400">(auto)</span>}
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={st.payMode === 'manual' ? (st.payOffline !== undefined && st.payOffline !== null ? st.payOffline : '') : (payOffline || '')}
                onChange={e => handleOfflineChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-right font-mono text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Online {fmt(payOnline)} + Offline {fmt(payOffline)} = <strong className="text-slate-700 dark:text-slate-200">{fmt(payOnline + payOffline)}</strong></span>
            {st.payMode === 'manual' && (
              <button onClick={() => upd({ payMode: 'auto', payOffline: Math.max(0, finalAfterLess - payOnline) })}
                className="text-[11px] text-blue-500 hover:text-blue-700 underline">reset to auto</button>
            )}
          </div>
        </div>)
      }


      {/* ── Save + Share bar (Row 1: Order Date + Share | Row 2: Supply Date + Save) ── */}
      <div className="flex flex-col gap-3 px-3 sm:px-4 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
        
        {/* Row 1: Order Date (left) + Share Button (right) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs relative cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex-1 min-w-0 max-w-[50%]">
            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap">Order:</span>
            <div className="relative flex items-center w-full justify-center">
              <div className="px-2.5 py-1 border border-slate-200 dark:border-slate-600 rounded-xl text-sm sm:text-base font-mono font-black bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs">
                <span>{formatIsoToDdMmYyyy(selectedDate)}</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={e => {
                  const newDate = e.target.value
                  if (!newDate) return
                  setSelectedDate(newDate)
                  const nextSupply = getNextDayStr(newDate)
                  upd({ supplyDate: nextSupply })
                  logActivity('Order Date', `Changed order date to ${newDate}, supply date set to ${nextSupply}`, 'update')
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 relative flex-1 min-w-0 max-w-[50%] justify-end">
            <button
              onClick={() => setShowShareMenu(v => !v)}
              className="w-full py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-black bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-95"
            >
              📤 Share
            </button>
            {showShareMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-2xl overflow-hidden z-20">
                <button
                  onClick={handleOpenSummaryPage}
                  className="w-full text-left px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2"
                >
                  🧾 Open Summary Page <span className="text-xs text-slate-400 font-normal">(Print / PDF)</span>
                </button>
                <button
                  onClick={handleShareText}
                  className="w-full text-left px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 flex items-center gap-2"
                >
                  💬 Share as Text
                </button>
              </div>
            )}
            {shareToast && (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 animate-fadeIn absolute right-0 -top-8 whitespace-nowrap shadow-sm z-30">
                {shareToast}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Supply Date (left) + Save Button (right) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs relative cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex-1 min-w-0 max-w-[50%]">
            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap">Supply:</span>
            <div className="relative flex items-center w-full justify-center">
              <div className="px-2.5 py-1 border border-slate-200 dark:border-slate-600 rounded-xl text-sm sm:text-base font-mono font-black bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs">
                <span>{formatIsoToDdMmYyyy(effectiveSupplyDate)}</span>
              </div>
              <input
                type="date"
                value={effectiveSupplyDate}
                onChange={e => {
                  const val = e.target.value
                  if (!val) return
                  upd({ supplyDate: val })
                  logActivity('Supply Date', `Updated supply date to ${val}`, 'update')
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 relative flex-1 min-w-0 max-w-[50%] justify-end">
            <button
              onClick={handleSaveInitiate}
              className="w-full py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-black bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-95"
            >
              💾 Save
            </button>
            {saveMsg && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-fadeIn absolute right-0 -top-8 whitespace-nowrap shadow-sm z-30">
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast Notification Popup on Save / Overwrite / Refresh / Restore ── */}
      {saveToastInfo && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 max-w-sm w-full bg-slate-900/95 dark:bg-slate-950/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3 backdrop-blur-md animate-bounceIn">
          <div className={`p-2.5 rounded-xl text-xl flex items-center justify-center ${saveToastInfo.type === 'overwrite' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : saveToastInfo.type === 'restore' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : saveToastInfo.type === 'refresh' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            {saveToastInfo.type === 'overwrite' ? '⚠️' : saveToastInfo.type === 'restore' ? '📜' : saveToastInfo.type === 'refresh' ? '🔄' : '💾'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-sm font-bold text-slate-100">{saveToastInfo.title}</p>
              <span className="text-[10px] text-slate-400 font-mono">{saveToastInfo.time}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-snug">{saveToastInfo.message}</p>
          </div>
          <button
            onClick={() => setSaveToastInfo(null)}
            className="text-slate-400 hover:text-white text-base px-1 cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Overwrite Confirmation Modal (Yes / No) ── */}
      {saveConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Overwrite Saved Record?</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Order Date: {saveConfirmModal.formattedDate}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              A bill for <strong className="text-slate-800 dark:text-slate-100">{saveConfirmModal.formattedDate}</strong> already exists in history. Overwrite with new changes?
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 text-xs mb-4 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Previous Saved Total:</span>
                <span className="line-through font-bold text-slate-600 dark:text-slate-300">₹{fmt(saveConfirmModal.oldTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-extrabold text-sm border-t border-slate-200 dark:border-slate-700 pt-1.5">
                <span>New Updated Total:</span>
                <span>₹{fmt(saveConfirmModal.newTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSaveConfirmModal(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
              >
                ✕ Cancel
              </button>
              <button
                onClick={() => executeSave(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1"
              >
                ✓ Yes, Overwrite & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History panel ── */}
      <HistoryPanel tabKey={tabKey} onLoad={handleLoad} />

      {/* ── Phone-First Floating Bottom Action Bar (Mobile Screens Only) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-3 py-2 shadow-2xl flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider leading-tight">Grand Total</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
              {fmt(finalAfterLess)}
            </span>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono">
              {fmtN(allMilkL)}L
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setEditMode(v => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1 ${
              editMode
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-yellow-400 text-slate-900 font-bold'
            }`}
          >
            <span>{editMode ? '✓ Done' : '✏ Edit'}</span>
          </button>

          <button
            onClick={handleSaveInitiate}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 active:bg-emerald-700 text-white shadow-md cursor-pointer active:scale-95 flex items-center gap-1"
          >
            <span>💾 Save</span>
          </button>

          <button
            onClick={() => setShowShareMenu(v => !v)}
            className="p-2 rounded-xl text-xs font-black bg-indigo-600 active:bg-indigo-700 text-white shadow-md cursor-pointer active:scale-95"
            title="Share"
          >
            <span>📤</span>
          </button>
        </div>
      </div>

    </div>
  )
}

export default DairyOrderTable