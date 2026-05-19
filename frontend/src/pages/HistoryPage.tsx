import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Image, Video, Newspaper, Code, Trash2, ArrowLeft, BookOpen, ShoppingCart } from 'lucide-react';
import { useHistoryStore } from '../stores/historyStore';
import type { TabType } from '../services/types';

const TAB_ICONS: Record<TabType, typeof Search> = { all: Search, images: Image, videos: Video, news: Newspaper, code: Code, academic: BookOpen, shopping: ShoppingCart };
const TAB_LABELS: Record<TabType, string> = { all: 'Todos', images: 'Imagens', videos: 'Vídeos', news: 'Notícias', code: 'Código', academic: 'Acadêmico', shopping: 'Shopping' };

export function HistoryPage() {
  const { entries, removeEntry, clearAll } = useHistoryStore();
  const [filter, setFilter] = useState<TabType | 'all_tabs'>('all_tabs');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = entries.filter(e => {
    if (filter !== 'all_tabs' && e.tab !== filter) return false;
    if (searchTerm && !e.query.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof entries>>((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    (acc[date] = acc[date] || []).push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950 text-slate-900 dark:text-slate-100">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800/60">
        <Link to="/settings" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"><ArrowLeft className="w-5 h-5" /></Link>
        <Clock className="w-5 h-5 text-brand-500" />
        <h1 className="text-lg font-bold">Histórico de Pesquisa</h1>
        {entries.length > 0 && (
          <button onClick={() => { if (confirm('Limpar todo o histórico?')) clearAll(); }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-300 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Limpar tudo
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-700/50">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar no histórico..." className="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            <button onClick={() => setFilter('all_tabs')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === 'all_tabs' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-surface-850 text-slate-500 hover:text-brand-500'}`}>Todas</button>
            {(Object.keys(TAB_LABELS) as TabType[]).map(t => {
              const Icon = TAB_ICONS[t];
              return (
                <button key={t} onClick={() => setFilter(t)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === t ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-surface-850 text-slate-500 hover:text-brand-500'}`}>
                  <Icon className="w-3 h-3" />{TAB_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-sm text-slate-400">{entries.length === 0 ? 'Nenhuma pesquisa no histórico.' : 'Nenhum resultado para este filtro.'}</p>
          </div>
        )}

        {/* Grouped entries */}
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-8 animate-fade-in">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">{date}</h2>
            <div className="space-y-1">
              {items.map(entry => {
                const Icon = TAB_ICONS[entry.tab];
                return (
                  <div key={entry.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-850/50 transition-all">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <Link to={`/search?q=${encodeURIComponent(entry.query)}`} className="flex-1 text-sm text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors truncate">
                      {entry.query}
                    </Link>
                    <span className="text-[10px] text-slate-400 shrink-0">{new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-surface-800 text-slate-400">{TAB_LABELS[entry.tab]}</span>
                    <button onClick={() => removeEntry(entry.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-500 transition-all" title="Remover">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
