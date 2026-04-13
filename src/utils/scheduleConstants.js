export const SCHEDULE_DAYS = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' }
];

export const SCHEDULE_SLOTS = [
  // Manhã
  '7:00-7:50',
  '7:50-8:40',
  '8:55-9:45',
  '9:45-10:35',
  '10:50-11:40',
  '11:40-12:30',
  // Tarde
  '13:00-13:50',
  '13:50-14:40',
  '14:55-15:45',
  '15:45-16:35',
  '16:50-17:40',
  '17:40-18:30',
  // Noite
  '18:45-19:35',
  '19:35-20:25',
  '20:35-21:25',
  '21:25-22:15'
];

export const getPastelColor = (str) => {
  if (!str) return 'bg-slate-50 text-slate-300';
  
  // Hash function to get a consistent color for a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'bg-lime-100 text-lime-700 border-lime-200'
  ];

  return colors[Math.abs(hash) % colors.length];
};
