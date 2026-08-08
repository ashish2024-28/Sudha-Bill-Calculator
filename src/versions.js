// ═══════════════════════════════════════════════════════════════════════════════
// versions.js — central registry of all live app versions & changelogs
// ═══════════════════════════════════════════════════════════════════════════════

export const CURRENT_VERSION_ID = 'v4'

export const VERSION_LIST = [
  {
    id:          'v4',
    label:       'v4 — Latest',
    url:         '/',
    description: 'Supply Date picker, persistent draft auto-save, Activity logs & PWA',
    isLatest:    true,
  },
  {
    id:          'v3',
    label:       'v3',
    url:         'https://sudha-bill-calculator-61v1rql7u-ashish2024-28s-projects.vercel.app/',
    description: 'Version picker, Milk/Dahi split totals, history panel, Less Amount, payment mode',
    isLatest:    false,
  },
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

export const APP_VERSIONS = [
  {
    version: 'v5.2.0 (v4)',
    date: '2026-08-08',
    tag: 'Latest',
    title: 'Supply Date Fix & Persistent Draft Engine',
    changes: [
      'Added Supply Date picker right next to Order Date.',
      'Auto-saved active order state to Local Storage draft on every input change.',
      'Saved supply date into billing history records and share summaries.',
      'Comprehensive Activity Logs & Change Tracker modal.',
      'Browser refresh & navigation back-button safety alerts when unsaved calculations exist.'
    ]
  },
  {
    version: 'v5.1.0 (v3)',
    date: '2026-08-01',
    tag: 'Stable',
    title: 'Multi-Dairy Management System',
    changes: [
      'Separated Patna Dairy, Arra Dairy, and Other Dairy tab order sheets.',
      'Integrated Web Share API and formatted WhatsApp/Print summary templates.',
      'Added custom extra products and milk/dahi total calculations.'
    ]
  },
  {
    version: 'v5.0.0 (v2)',
    date: '2026-07-15',
    tag: 'Major',
    title: 'Modern UI Redesign & PWA Installation',
    changes: [
      'Full offline PWA support with service worker precaching.',
      'Dark mode theme engine with system auto-detection.',
      'Interactive modification mode for editing product names and unit rates.'
    ]
  },
  {
    version: 'v4.0.0 (v1)',
    date: '2026-06-20',
    tag: 'Feature',
    title: 'Dynamic Rate & Item Customization',
    changes: [
      'Product edit mode for updating unit prices and product labels.',
      'Reordering, inserting, and deleting milk/dairy product rows.',
      'Custom Extra Items row insertion engine.'
    ]
  }
]

export const APP_INFO = {
  name: 'Sudha Bill Calculator',
  subtitle: 'Dairy Order & Daily Billing Management System',
  description: 'An offline-first Progressive Web Application (PWA) engineered specifically for Sudha, Patna, Arra, and local dairy distributors to generate accurate daily order sheets, track supply dates, calculate milk/dahi weight subtotals, and maintain complete local billing history.',
  developer: 'Sudha Bill Engineering',
  techStack: ['React', 'Vite PWA', 'Tailwind CSS', 'Local Storage Engine', 'Lucide Icons'],
  features: [
    'Offline-First PWA (works without internet)',
    'Auto-Save Active Draft on every change',
    'Supply Date & Order Date synchronization',
    'Real-Time Activity Log & Change History',
    'Multi-Dairy Management (Patna, Arra, Other)',
    'Print & Web Share API support for WhatsApp summaries',
    'Dark/Light Mode theme toggle'
  ]
}
