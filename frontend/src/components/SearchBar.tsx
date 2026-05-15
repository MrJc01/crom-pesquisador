import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Keyboard, Mic } from 'lucide-react';
import { getSuggestions } from '../services/api';

interface Props {
  initialQuery?: string;
  compact?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({ initialQuery = '', compact = false, onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setShowSugg(false);
    if (onSearch) onSearch(trimmed);
    else navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleInput = (value: string) => {
    setQuery(value);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); setShowSugg(false); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await getSuggestions(value);
      setSuggestions(results);
      setShowSugg(results.length > 0);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Escape') { setShowSugg(false); setActiveIdx(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        setQuery(suggestions[activeIdx]);
        doSearch(suggestions[activeIdx]);
      } else {
        doSearch(query);
      }
    }
  };

  const py = compact ? 'py-2' : 'py-3.5';
  const px = compact ? 'px-4' : 'px-5';
  const textSize = compact ? 'text-sm' : 'text-base';

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`search-glow group flex items-center gap-3 w-full ${px} ${py} rounded-2xl bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700/60 shadow-lg dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/30 hover:border-brand-300 dark:hover:border-brand-500/40 transition-all duration-300`}>
        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 transition-colors shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowSugg(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar na web..."
          className={`flex-1 bg-transparent outline-none ${textSize} text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
          autoComplete="off"
        />
        {query && (
          <>
            <button onClick={() => { setQuery(''); setSuggestions([]); setShowSugg(false); inputRef.current?.focus(); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />
          </>
        )}
        {!compact && (
          <>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all" title="Teclado">
              <Keyboard className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all" title="Voz">
              <Mic className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Autocomplete */}
      {showSugg && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 py-1.5 rounded-xl bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700/60 shadow-2xl dark:shadow-black/40 z-50 animate-slide-down overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s}
              onClick={() => { setQuery(s); doSearch(s); }}
              className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm text-left transition-colors ${i === activeIdx ? 'bg-slate-50 dark:bg-surface-800 text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-800'}`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
