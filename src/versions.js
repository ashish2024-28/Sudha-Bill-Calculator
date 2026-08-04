// ═══════════════════════════════════════════════════════════════════════════════
// versions.js — central registry of all live app versions
// ───────────────────────────────────────────────────────────────────────────────
// PATH: src/versions.js
//
// HOW TO ADD A NEW VERSION (e.g. releasing v4):
//   1. Push your new code to Vercel → wait for deploy to finish
//   2. On Vercel dashboard → Deployments → click the PREVIOUS deploy row
//      → copy its permanent URL  (looks like: sudha-bill-calculator-xxxxx.vercel.app)
//   3. In THIS file:
//        a. Add a new entry at the TOP of APP_VERSIONS with your new id ('v4')
//        b. Move the old 'v3' entry down one slot and paste the permanent URL into its `url` field
//        c. Change CURRENT_VERSION_ID to 'v4'
//        d. Set isLatest: true on the new entry, isLatest: false on all others
//   4. Commit + push — the picker updates in every live version automatically
//
// SHARED HISTORY NOTE:
//   All versions served from the SAME Vercel domain share localStorage
//   automatically (same origin). Saved milk/dahi history is visible in v1, v2,
//   v3 without any extra work. Permanent *.vercel.app URLs are different origins
//   and do NOT share storage — always link to your main domain URLs for versions.
// ═══════════════════════════════════════════════════════════════════════════════

// ← UPDATE THIS every time you release a new version
export const CURRENT_VERSION_ID = 'v3'

export const APP_VERSIONS = [
  // ── CURRENT / LATEST version — always first ─────────────────────────────
   {
    id:          'v4',
    label:       'v4 — Latest',
    url:         '/',           // your live domain root, e.g. https://sudha.vercel.app/
    description: 'Version picker, Milk/Dahi split totals, history panel, Less Amount, payment mode',
    isLatest:    true,
  },

  {
    id:          'v3',
    label:       'v3',
    url:         'https://sudha-bill-calculator-61v1rql7u-ashish2024-28s-projects.vercel.app/',          
    description: 'Version picker, Milk/Dahi split totals, history panel, Less Amount, payment mode',
    isLatest:    true,
  },

  // ── OLDER versions — paste permanent Vercel URL in `url` ─────────────────
  // After deploying v4, this entry's url becomes the permanent link for v3.
  // To find it: Vercel dashboard → Deployments → click any old row → copy URL.
  {
    id:          'v2',
    label:       'v2 — Stable',
    url:         'https://sudha-bill-calculator-163gu9vx5-ashish2024-28s-projects.vercel.app/',
    description: 'Edit orders mode, extra milk toggle, discount fix',
    isLatest:    false,
  },
  {
    id:          'v1',
    label:       'v1 — Original',
    url:         'https://sudha-bill-calculator-k0iwlki2s-ashish2024-28s-projects.vercel.app/',
    description: 'First release — basic Patan / Arra dairy tables',
    isLatest:    false,
  },
]