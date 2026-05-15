import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Image, Video, Newspaper, Code, MessageCircle, Settings, Loader2 } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { ResultCard } from '../components/ResultCard';
import { ChatPanel } from '../components/ChatPanel';
import { KnowledgePanel } from '../components/KnowledgePanel';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useHistoryStore } from '../stores/historyStore';
import { useSettingsStore } from '../stores/settingsStore';
import { search as searchAPI } from '../services/api';
import type { SearchResponse, TabType } from '../services/types';

const TABS = [
  { id: 'all' as TabType, label: 'Todos', icon: Search },
  { id: 'images' as TabType, label: 'Imagens', icon: Image },
  { id: 'videos' as TabType, label: 'Vídeos', icon: Video },
  { id: 'news' as TabType, label: 'Notícias', icon: Newspaper },
  { id: 'code' as TabType, label: 'Código', icon: Code },
];

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [tab, setTab] = useState<TabType>('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const addHistory = useHistoryStore(s => s.addEntry);
  const historyEnabled = useSettingsStore(s => s.historyEnabled);
  const openInNewTab = useSettingsStore(s => s.openInNewTab);

  // Initial search
  useEffect(() => {
    if (!query) return;
    setPage(1);
    setLoading(true);
    searchAPI(query, 1).then(res => {
      setData(res);
      setLoading(false);
      if (historyEnabled) addHistory(query, tab);
    });
  }, [query]);

  // Load more (infinite scroll)
  const loadMore = useCallback(() => {
    if (!data?.hasMore || loadingMore || !query) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    searchAPI(query, nextPage).then(res => {
      setData(prev => prev ? {
        ...res,
        results: [...prev.results, ...res.results],
        images: [...prev.images, ...res.images],
        videos: [...prev.videos, ...res.videos],
        news: [...prev.news, ...res.news],
        code: [...prev.code, ...res.code],
      } : res);
      setPage(nextPage);
      setLoadingMore(false);
    });
  }, [data, loadingMore, query, page]);

  const sentinelRef = useInfiniteScroll(loadMore, data?.hasMore ?? false, loadingMore);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950 text-slate-900 dark:text-slate-100">
      {/* Header - Topo (Simplificado) */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 max-w-screen-2xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.ico" alt="CROM" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100 hidden md:block">CROM</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/settings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
              <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Configurações</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

        <main className="flex-1 overflow-y-auto flex flex-col-reverse">
          <div className="flex gap-8 max-w-6xl mx-auto px-4 md:px-6 py-4 w-full">
            <div className="flex-1 min-w-0 max-w-[700px] flex flex-col-reverse gap-2">
              {/* 1. DOM First -> Visually at the BOTTOM */}
              {data && !loading && (
                <p className="text-xs text-slate-400 dark:text-slate-500 px-1 py-2 border-t border-slate-100 dark:border-slate-800/40 mt-2">
                  Aproximadamente <strong className="text-slate-500 dark:text-slate-400">{data.total.toLocaleString()}</strong> resultados em <strong className="text-slate-500 dark:text-slate-400">{data.time}s</strong>
                </p>
              )}

              {/* 2. DOM Second -> Visually ABOVE Stats */}
              {/* Tab: Todos */}
              {!loading && tab === 'all' && data && data.results.length > 0 && (
                <div className="flex flex-col-reverse gap-1">
                  {data.results.map((r, i) => <ResultCard key={r.id} result={r} index={i} openInNewTab={openInNewTab} />)}
                </div>
              )}

              {/* Tab: Imagens */}
              {!loading && tab === 'images' && data && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {data.images.map((img, i) => (
                    <div key={img.id} className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-surface-850 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <img src={img.src} alt={img.alt} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div><p className="text-xs text-white font-medium">{img.alt}</p><p className="text-[10px] text-white/70">{img.site}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Vídeos */}
              {!loading && tab === 'videos' && data && (
                <div className="flex flex-col-reverse gap-3">
                  {data.videos.map((v, i) => (
                    <article key={v.id} className="group flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-850/50 transition-all animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="relative shrink-0 w-44 h-24 rounded-lg overflow-hidden bg-slate-200 dark:bg-surface-800">
                        <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">{v.duration}</span>
                      </div>
                      <div className="min-w-0"><h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-500 line-clamp-2">{v.title}</h3><p className="text-xs text-slate-400 mt-1">{v.channel}</p><p className="text-xs text-slate-400">{v.views} visualizações</p></div>
                    </article>
                  ))}
                </div>
              )}

              {/* Tab: Notícias */}
              {!loading && tab === 'news' && data && (
                <div className="flex flex-col-reverse gap-3">
                  {data.news.map((n, i) => (
                    <article key={n.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-md transition-all animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-center gap-2 mb-2"><span className="text-xs font-semibold text-brand-500">{n.source}</span><span className="text-[10px] text-slate-400">· {n.time}</span></div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{n.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{n.snippet}</p>
                    </article>
                  ))}
                </div>
              )}

              {/* Tab: Código */}
              {!loading && tab === 'code' && data && (
                <div className="flex flex-col-reverse gap-3">
                  {data.code.map((c, i) => (
                    <article key={c.id} className="rounded-xl border border-slate-100 dark:border-slate-800/40 overflow-hidden hover:border-brand-300 dark:hover:border-brand-500/30 transition-all animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-surface-850 border-b border-slate-100 dark:border-slate-800/40">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{c.repo}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium">{c.lang}</span>
                      </div>
                      <div className="px-4 py-1.5 text-xs text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800/30">{c.file}</div>
                      <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-surface-900 overflow-x-auto leading-relaxed"><code>{c.snippet}</code></pre>
                    </article>
                  ))}
                </div>
              )}

              {/* Related Searches */}
              {data && data.related.length > 0 && !loading && (
                <div className="mt-4 mb-4 px-1">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Pesquisas relacionadas</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.related.map(r => (
                      <Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-700/50 hover:border-brand-400 hover:text-brand-500 transition-all">
                        <Search className="w-3.5 h-3.5" />{r}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && data && data.results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center h-[50vh]">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Nenhum resultado encontrado</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">Não encontramos páginas correspondentes à sua busca. O nosso Crawler indexará novos conteúdos em breve.</p>
                </div>
              )}

              {/* Loading skeleton -> Visually at TOP */}
              {loading && (
                <div className="space-y-4 px-1 pb-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-center gap-2"><div className="skeleton w-7 h-7 rounded-full" /><div className="skeleton h-4 w-32" /></div>
                      <div className="skeleton h-5 w-4/5" />
                      <div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Infinite Scroll Sentinel -> Visually at TOP (Acima de tudo para carregar mais páginas ao subir o scroll) */}
              <div ref={sentinelRef} className="py-6 flex justify-center">
                {loadingMore && <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />}
              </div>
            </div>

            {/* Knowledge Panel */}
            {data?.knowledgePanel && !loading && (
              <aside className="hidden lg:block w-[320px] shrink-0">
                <KnowledgePanel data={data.knowledgePanel} />
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* Sticky Bottom Navigation (Pesquisa e Tabs) */}
      <div className="sticky bottom-0 z-40 bg-white/90 dark:bg-surface-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)]">
        <div className="max-w-screen-2xl mx-auto">
          {/* Tabs */}
          <nav className="flex justify-center md:justify-start items-center gap-1 px-2 md:px-6 overflow-x-auto no-scrollbar pt-2">
            <button onClick={() => setChatOpen(!chatOpen)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${chatOpen ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-purple-500/70 dark:text-purple-400/70 hover:bg-purple-50 dark:hover:bg-purple-500/10'}`}>
              <MessageCircle className="w-4 h-4" /> Chat IA
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${tab === t.id ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-800'}`}>
                <t.icon className="w-4 h-4 shrink-0" /> {t.label}
              </button>
            ))}
          </nav>
          
          {/* Search Bar */}
          <div className="p-3 md:px-6 md:py-4">
            <div className="max-w-3xl mx-auto">
              <SearchBar initialQuery={query} compact />
            </div>
          </div>
        </div>
        
        {/* Footer info (minimalist) */}
        <div className="py-2 text-center bg-slate-50 dark:bg-surface-950/50 border-t border-slate-100 dark:border-slate-800/40">
          <span className="text-[10px] text-slate-400">Zero tracking · Soberania Digital · CROM Engine</span>
        </div>
      </div>
    </div>
  );
}
