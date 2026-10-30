// Made-up sample data only. No real vendors, names, numbers or prices.
const NO_DETAILS = {
  dueDate: '',
  contactName: '',
  phone: '',
  email: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  website: '',
  link: '',
  notes: '',
}

export const SAMPLE_VENDORS = [
  {
    ...NO_DETAILS,
    id: 'v_sample_1',
    name: 'Sample Dewan Seri Kenanga',
    category: 'venue',
    events: ['sanding', 'reception'],
    stage: 'deposit',
    estimatedCost: 15000,
    amountPaid: 5000,
    dueDate: '2027-03-01',
  },
  {
    ...NO_DETAILS,
    id: 'v_sample_2',
    name: 'Sample Katering Rasa Kampung',
    category: 'catering',
    events: ['sanding', 'reception'],
    stage: 'quoted',
    estimatedCost: 18000,
    amountPaid: 0,
    dueDate: '2026-12-15',
  },
  {
    ...NO_DETAILS,
    id: 'v_sample_3',
    name: 'Sample Studio Lensa Cahaya',
    category: 'photo',
    events: ['akad', 'sanding', 'reception'],
    stage: 'final',
    estimatedCost: 6500,
    amountPaid: 6500,
  },
]

export const EMPTY_DETAILS = NO_DETAILS

export const SAMPLE_SETTINGS = {
  events: {
    akad: { on: true, date: '2027-06-11' },
    sanding: { on: true, date: '2027-06-12' },
    reception: { on: true, date: '2027-06-19' },
  },
  totalBudget: 60000,
  // Planned amount per category (made-up figures); a category left out has no plan yet.
  categoryBudgets: { venue: 16000, catering: 20000, photo: 6000, decor: 8000, attire: 4000 },
  hiddenCategories: [],
}
