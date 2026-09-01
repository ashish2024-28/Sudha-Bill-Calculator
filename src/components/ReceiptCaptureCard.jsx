import React from 'react'
import { fmt, fmtN, formatIsoToDdMmYyyy, fmtDateLabel, calcRow, calcTotals, loadHistory } from './DairyOrderTable'

/**
 * ReceiptCaptureCard:
 * A dedicated high-resolution, perfectly-styled receipt card used specifically
 * for crystal-clear screenshot captures. It includes:
 * - Dairy Header & Order/Supply Dates
 * - Current Order Items Breakdown (Rates, Qty, Discounts, Net)
 * - Extra Milk orders (if any)
 * - Bill Summary Totals (Total Milk L, Total Dahi kg, Discounts, Gross Net, Less, Final Payable)
 * - Payment breakdown (Online / Offline split)
 * - Save & Order Confirmation Details
 * - Saved History Records (Below Save Data) — showing previous saved entries with S.No, dates, and amounts!
 */
export const ReceiptCaptureCard = ({
  tabName,
  tabKey = '',
  selectedDate,
  effectiveSupplyDate,
  rows = [],
  extra = [],
  lessAmt = 0,
  finalNet = 0,
  finalAfterLess = 0,
  finalDisc = 0,
  allMilkL = 0,
  allDahiKg = 0,
  isOnline = false,
  payOnline = 0,
  payOffline = 0,
  st = {},
}) => {
  const mainActiveRows = rows.filter(r => (Number(r.morn) || 0) > 0 || (Number(r.eve) || 0) > 0)
  const extraActiveRows = extra.filter(r => (Number(r.morn) || 0) > 0 || (Number(r.eve) || 0) > 0)

  const mainTotals = calcTotals(rows)

  // Load history records for this tab (what's below the save data in the app)
  const history = loadHistory()
  const tabHistory = Object.entries(history)
    .filter(([k]) => k.startsWith(tabKey + '_'))
    .sort((a, b) => b[0].localeCompare(a[0])) // newest first

  return (
    <div
      id="receipt-capture-container"
      className="bg-white text-slate-900 font-sans p-6 rounded-2xl shadow-xl border border-slate-200"
      style={{
        width: '640px',
        maxWidth: '640px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── Header ── */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥛</span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {tabName}
              </h1>
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
              Official Order & Supply Bill
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Confirmed Order
            </span>
          </div>
        </div>

        {/* ── Dates Row ── */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Order Date</span>
            <span className="text-base font-extrabold text-slate-900">
              📅 {formatIsoToDdMmYyyy(selectedDate)}
            </span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">Supply Date</span>
            <span className="text-base font-extrabold text-emerald-900">
              🚚 {formatIsoToDdMmYyyy(effectiveSupplyDate)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Order Items Table ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Order Items Breakdown
          </h2>
          <span className="text-[11px] font-bold text-slate-500">
            {mainActiveRows.length} items ordered
          </span>
        </div>

        <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-[11px] font-black uppercase border-b border-slate-200">
              <th className="py-2 px-3 text-left">Product</th>
              <th className="py-2 px-2 text-center">Rate</th>
              <th className="py-2 px-2 text-center">Order</th>
              <th className="py-2 px-2 text-center">Total Qty</th>
              <th className="py-2 px-2 text-center text-orange-600">Disc ₹</th>
              <th className="py-2 px-3 text-right text-emerald-700">Net ₹</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rows.map((r, idx) => {
              const c = calcRow(r)
              const hasQty = (Number(r.morn) || 0) > 0 || (Number(r.eve) || 0) > 0
              return (
                <tr
                  key={r.id || idx}
                  className={hasQty ? 'bg-white font-bold text-slate-900' : 'bg-slate-50/50 text-slate-400 font-normal'}
                >
                  <td className="py-2 px-3">
                    <span className={hasQty ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                      {r.name}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-medium text-slate-600">
                    ₹{r.price}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={hasQty ? 'bg-yellow-100 text-slate-900 font-black px-2 py-0.5 rounded' : 'text-slate-400'}>
                      {r.morn || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-blue-700">
                    {hasQty ? c.kgLabel.replace('\n', ' ') : '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-orange-600">
                    {c.discAmt > 0 ? `-${c.discAmt.toFixed(1)}` : '0'}
                  </td>
                  <td className="py-2 px-3 text-right font-black text-emerald-700">
                    ₹{Math.round(c.net)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-extrabold text-slate-900 text-xs border-t-2 border-slate-300">
              <td colSpan="3" className="py-2 px-3">Subtotal (Main Order)</td>
              <td className="py-2 px-2 text-center text-blue-800">
                {mainTotals.milkKg > 0 ? `${fmtN(mainTotals.milkKg)} L` : ''}
                {mainTotals.milkKg > 0 && mainTotals.dahiKg > 0 ? ' + ' : ''}
                {mainTotals.dahiKg > 0 ? `${fmtN(mainTotals.dahiKg)} kg` : ''}
              </td>
              <td className="py-2 px-2 text-center text-orange-600">
                {mainTotals.disc > 0 ? `-${fmt(mainTotals.disc)}` : '₹0'}
              </td>
              <td className="py-2 px-3 text-right text-emerald-800">
                ₹{fmt(mainTotals.net)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Extra Milk Section (if any) ── */}
      {extraActiveRows.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-amber-700 uppercase tracking-wider">
              Extra Milk Order
            </h2>
            <span className="text-[11px] font-bold text-amber-600">
              {extraActiveRows.length} extra items
            </span>
          </div>

          <table className="w-full text-left border-collapse border border-amber-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-amber-50 text-amber-900 text-[11px] font-black uppercase border-b border-amber-200">
                <th className="py-1.5 px-3 text-left">Product</th>
                <th className="py-1.5 px-2 text-center">Rate</th>
                <th className="py-1.5 px-2 text-center">Order</th>
                <th className="py-1.5 px-2 text-center">Total Qty</th>
                <th className="py-1.5 px-2 text-center text-orange-600">Disc ₹</th>
                <th className="py-1.5 px-3 text-right text-emerald-700">Net ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 text-xs">
              {extra.filter(r => (Number(r.morn) || 0) > 0 || (Number(r.eve) || 0) > 0).map((r, idx) => {
                const c = calcRow(r)
                return (
                  <tr key={idx} className="bg-white font-bold text-slate-900">
                    <td className="py-1.5 px-3">{r.name}</td>
                    <td className="py-1.5 px-2 text-center text-slate-600">₹{r.price}</td>
                    <td className="py-1.5 px-2 text-center bg-amber-50/50">{r.morn || '-'}</td>
                    <td className="py-1.5 px-2 text-center text-blue-700">{c.kgLabel.replace('\n', ' ')}</td>
                    <td className="py-1.5 px-2 text-center text-orange-600">
                      {c.discAmt > 0 ? `-${c.discAmt.toFixed(1)}` : '0'}
                    </td>
                    <td className="py-1.5 px-3 text-right font-black text-emerald-700">₹{Math.round(c.net)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Bill Summary Totals Box ── */}
      <div className="bg-slate-900 text-white rounded-xl p-4 mb-3 shadow-md">
        <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-800 pb-3 mb-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Milk</span>
            <span className="text-base font-black text-blue-300">{fmtN(allMilkL)} L</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Dahi</span>
            <span className="text-base font-black text-cyan-300">{fmtN(allDahiKg)} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Discount</span>
            <span className="text-base font-black text-orange-400">-{fmt(finalDisc)}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Gross Net Amount:</span>
            <span className="font-bold text-white text-sm">₹{fmt(finalNet)}</span>
          </div>

          {lessAmt > 0 && (
            <div className="flex justify-between items-center text-amber-300">
              <span>Less / Adjustment:</span>
              <span className="font-bold">-₹{fmt(lessAmt)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-700 text-base font-black">
            <span className="text-emerald-400 uppercase tracking-wide">Final Payable:</span>
            <span className="text-2xl font-black text-emerald-300">₹{fmt(finalAfterLess)}</span>
          </div>
        </div>
      </div>

      {/* ── Payment Info (if shown) ── */}
      {isOnline && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 text-xs">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
            Payment Breakdown
          </span>
          <div className="flex items-center justify-between font-bold">
            <span className="text-blue-700">Online: ₹{fmt(payOnline)}</span>
            <span className="text-slate-700">Offline / Cash: ₹{fmt(payOffline)}</span>
            <span className="text-emerald-700">Total: ₹{fmt(payOnline + payOffline)}</span>
          </div>
        </div>
      )}

      {/* ── Order & Supply Confirmation Bar (Below Save Data) ── */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">💾</span>
          <div>
            <span className="font-bold text-emerald-900 block">Saved Order Record</span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Order: {formatIsoToDdMmYyyy(selectedDate)} • Supply: {formatIsoToDdMmYyyy(effectiveSupplyDate)}
            </span>
          </div>
        </div>
        <span className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px]">
          Status: Saved
        </span>
      </div>

      {/* ── Saved History Records Table (Below Save Data) ── */}
      {tabHistory.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                📁 Saved History Records
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full">
                {tabHistory.length} {tabHistory.length === 1 ? 'day' : 'days'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Recent order history for this tab
            </span>
          </div>

          <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900 text-[10px] font-black uppercase border-b border-indigo-100">
                <th className="py-1.5 px-2 text-center w-10">S.No</th>
                <th className="py-1.5 px-2.5">Order Date</th>
                <th className="py-1.5 px-2.5">Supply Date</th>
                <th className="py-1.5 px-2 text-center">Milk</th>
                <th className="py-1.5 px-2 text-center">Dahi</th>
                <th className="py-1.5 px-3 text-right">Total ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {tabHistory.map(([key, data], index) => {
                const dateStr = key.replace(tabKey + '_', '')
                const mt = calcTotals(data.rows || [])
                const et = calcTotals(data.extra || [])
                const grossNet = mt.net + et.net
                const hLess = Number(data.lessAmt) || 0
                const hFinal = Math.max(0, grossNet - hLess)
                const isCurrent = dateStr === selectedDate

                return (
                  <tr
                    key={key}
                    className={isCurrent ? 'bg-emerald-50/70 font-bold text-slate-900' : 'bg-white text-slate-700'}
                  >
                    <td className="py-1.5 px-2 text-center font-bold text-indigo-700">
                      #{index + 1}
                    </td>
                    <td className="py-1.5 px-2.5 font-semibold">
                      {fmtDateLabel(dateStr)}
                      {isCurrent && <span className="ml-1 text-[9px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded">Current</span>}
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-600 font-medium">
                      {data.supplyDate ? `🚚 ${formatIsoToDdMmYyyy(data.supplyDate)}` : '-'}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-blue-700">
                      {fmtN(mt.milkKg + et.milkKg)} L
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-cyan-700">
                      {fmtN(mt.dahiKg + et.dahiKg)} kg
                    </td>
                    <td className="py-1.5 px-3 text-right font-black text-emerald-700">
                      ₹{fmt(hFinal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer / Watermark ── */}
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 pt-3 mt-3 border-t border-slate-100">
        <span>Generated via Dairy Order Manager</span>
        <span>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}
