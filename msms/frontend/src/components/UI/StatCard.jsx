// src/components/UI/StatCard.jsx
export default function StatCard({ label, value, icon: Icon, color = 'teal', sub }) {
  const colors = {
    teal:   'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    green:  'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    red:    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    blue:   'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return (
    <div className="card flex items-center gap-5 p-6">
      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{value ?? '—'}</p>
        <p className="text-base text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
