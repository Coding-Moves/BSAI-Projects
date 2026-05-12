// src/components/Layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, X } from 'lucide-react';
import { medicinesAPI } from '../../api';

export default function Navbar({ title }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const navigate               = useNavigate();
  const ref                    = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    try {
      const { data } = await medicinesAPI.getAll({ search: q, limit: 6 });
      setResults(data.data || []);
      setOpen(true);
    } catch {}
  };

  return (
    <header className="navbar no-print sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h1>

      {/* Global Search */}
      <div className="relative w-64" ref={ref}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          placeholder="Search medicines…"
          className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            {results.map(m => (
              <button
                key={m.medicine_id}
                onClick={() => { navigate(`/medicines`); setOpen(false); setQuery(''); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium dark:text-white">{m.name}</span>
                <span className="text-gray-400 text-xs">{m.dosage_form}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
