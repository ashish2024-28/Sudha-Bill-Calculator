// Calculation utilities
export const calculateItemTotal = (price, quantity) => {
  return parseFloat(price) * parseInt(quantity)
}

export const calculateDiscountAmount = (itemTotal, discountPercent) => {
  return (itemTotal * parseFloat(discountPercent)) / 100
}

export const calculateFinalTotal = (itemTotal, discountAmount) => {
  return itemTotal - discountAmount
}

export const calculateProductTotals = (product) => {
  const price = parseFloat(product.price) || 0
  const quantity = parseInt(product.quantity) || 0
  const discountPercent = parseFloat(product.discount) || 0

  const itemTotal = calculateItemTotal(price, quantity)
  const discountAmount = calculateDiscountAmount(itemTotal, discountPercent)
  const finalTotal = calculateFinalTotal(itemTotal, discountAmount)

  return { itemTotal, discountAmount, finalTotal }
}

export const calculateSummary = (products) => {
  return products.reduce((acc, product) => {
    const { itemTotal, discountAmount, finalTotal } = calculateProductTotals(product)
    acc.subtotal += itemTotal
    acc.totalDiscount += discountAmount
    acc.grandTotal += finalTotal
    acc.totalItems += parseInt(product.quantity) || 0
    return acc
  }, { subtotal: 0, totalDiscount: 0, grandTotal: 0, totalItems: 0 })
}

// Formatting utilities
export const formatCurrency = (amount, currency = '₹') => {
  const num = parseFloat(amount) || 0
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatPercent = (value) => {
  return `${parseFloat(value || 0).toFixed(1)}%`
}

// ID generator
export const generateId = () => {
  return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validation
export const validateProduct = (product) => {
  const errors = {}

  if (!product.name || product.name.trim() === '') {
    errors.name = 'Product name is required'
  }

  if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) < 0) {
    errors.price = 'Valid price is required'
  }

  if (!product.quantity || isNaN(parseInt(product.quantity)) || parseInt(product.quantity) < 1) {
    errors.quantity = 'Quantity must be at least 1'
  }

  if (product.discount !== undefined && product.discount !== '') {
    const disc = parseFloat(product.discount)
    if (isNaN(disc) || disc < 0 || disc > 100) {
      errors.discount = 'Discount must be between 0 and 100'
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

// Print bill
export const printBill = (products, summary, currency = '₹') => {
  const date = new Date().toLocaleString('en-IN')
  const rows = products.map((p, i) => {
    const { itemTotal, discountAmount, finalTotal } = calculateProductTotals(p)
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px;">${i + 1}</td>
        <td style="padding: 8px 12px; font-weight: 500;">${p.name}</td>
        <td style="padding: 8px 12px; text-align: right;">${currency}${parseFloat(p.price).toFixed(2)}</td>
        <td style="padding: 8px 12px; text-align: center;">${p.quantity}</td>
        <td style="padding: 8px 12px; text-align: center;">${p.discount || 0}%</td>
        <td style="padding: 8px 12px; text-align: right; color: #dc2626;">${currency}${discountAmount.toFixed(2)}</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${currency}${finalTotal.toFixed(2)}</td>
      </tr>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sudha Bill Calculator - Receipt</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; color: #1e293b; }
        .header { text-align: center; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 28px; color: #1d4ed8; margin: 0 0 5px; }
        .header p { color: #64748b; margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #1d4ed8; color: white; }
        thead th { padding: 12px; text-align: left; font-size: 13px; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        .summary { margin-top: 30px; border-top: 2px solid #1d4ed8; padding-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
        .summary-row.grand { font-size: 20px; font-weight: 700; color: #1d4ed8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 8px; }
        .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🧾 Sudha Bill Calculator</h1>
        <p>Generated on: ${date}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product Name</th>
            <th style="text-align:right">Price</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:center">Discount</th>
            <th style="text-align:right">Disc Amt</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="summary">
        <div class="summary-row"><span>Subtotal</span><span>${currency}${summary.subtotal.toFixed(2)}</span></div>
        <div class="summary-row" style="color:#dc2626"><span>Total Discount</span><span>-${currency}${summary.totalDiscount.toFixed(2)}</span></div>
        <div class="summary-row"><span>Total Items</span><span>${summary.totalItems}</span></div>
        <div class="summary-row grand"><span>GRAND TOTAL</span><span>${currency}${summary.grandTotal.toFixed(2)}</span></div>
      </div>
      <div class="footer">
        <p>Thank you for using Sudha Bill Calculator</p>
        <button onclick="window.print()" style="margin-top:10px; padding:8px 20px; background:#1d4ed8; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">🖨️ Print</button>
      </div>
    </body>
    </html>
  `

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }
}

// Share utility
export const shareData = async (products, summary, currency = '₹') => {
  const text = `🧾 Sudha Bill Calculator\n` +
    `📅 ${new Date().toLocaleDateString('en-IN')}\n\n` +
    products.map(p => {
      const { finalTotal } = calculateProductTotals(p)
      return `• ${p.name} (${p.quantity}x${currency}${p.price}${p.discount > 0 ? ` -${p.discount}%` : ''}): ${currency}${finalTotal.toFixed(2)}`
    }).join('\n') +
    `\n\n💰 Grand Total: ${currency}${summary.grandTotal.toFixed(2)}` +
    `\n🏷️ You saved: ${currency}${summary.totalDiscount.toFixed(2)}`

  if (navigator.share) {
    await navigator.share({ title: 'Sudha Bill', text })
  } else {
    await navigator.clipboard.writeText(text)
    return 'copied'
  }
  return 'shared'
}

// Sort utility
export const sortProducts = (products, sortBy, sortOrder = 'asc') => {
  return [...products].sort((a, b) => {
    let valA, valB

    switch (sortBy) {
      case 'name':
        valA = a.name.toLowerCase()
        valB = b.name.toLowerCase()
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      case 'price':
        valA = parseFloat(a.price) || 0
        valB = parseFloat(b.price) || 0
        break
      case 'quantity':
        valA = parseInt(a.quantity) || 0
        valB = parseInt(b.quantity) || 0
        break
      case 'discount':
        valA = parseFloat(a.discount) || 0
        valB = parseFloat(b.discount) || 0
        break
      case 'total':
        valA = calculateProductTotals(a).finalTotal
        valB = calculateProductTotals(b).finalTotal
        break
      default:
        return 0
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA
  })
}
