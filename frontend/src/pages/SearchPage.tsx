import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Image, Video, Newspaper, Code, MessageCircle, Settings, Loader2, BookOpen, ShoppingCart } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { ResultCard } from '../components/ResultCard';
import { ChatPanel } from '../components/ChatPanel';
import { useHistoryStore } from '../stores/historyStore';
import { useSettingsStore } from '../stores/settingsStore';
import { search as searchAPI, getProxyUrl } from '../services/api';
import type { SearchResponse, TabType } from '../services/types';

const TABS = [
  { id: 'all' as TabType, label: 'Todos', icon: Search },
  { id: 'images' as TabType, label: 'Imagens', icon: Image },
  { id: 'videos' as TabType, label: 'Vídeos', icon: Video },
  { id: 'news' as TabType, label: 'Notícias', icon: Newspaper },
  { id: 'code' as TabType, label: 'Código', icon: Code },
  { id: 'academic' as TabType, label: 'Acadêmico', icon: BookOpen },
  { id: 'shopping' as TabType, label: 'Shopping', icon: ShoppingCart },
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
        academic: [...(prev.academic || []), ...(res.academic || [])],
        shopping: [...(prev.shopping || []), ...(res.shopping || [])],
      } : res);
      setPage(nextPage);
      setLoadingMore(false);
    });
  }, [data, loadingMore, query, page]);

  // Handle infinite scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      if (data?.hasMore && !loadingMore && query) {
        loadMore();
      }
    }
  }, [data?.hasMore, loadingMore, loadMore, query]);

  // Reset scroll when changing tabs
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [tab]);

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
      <div className="flex flex-1 min-h-0">
        <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-surface-900">
          {/* Swiper Container taking full height */}
          <div className="absolute inset-0 w-full h-full flex flex-col pt-12 pb-4">
            {loading && !data && (
              <div className="flex flex-col items-center justify-center h-full text-brand-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <span className="text-sm font-medium">Buscando na rede soberana...</span>
              </div>
            )}

            {/* Scroll Container for all Tabs */}
            {!loading && data && data.results.length > 0 && (
              <div 
                ref={scrollContainerRef} 
                onScroll={handleScroll}
                className="w-full h-full overflow-y-auto p-4 md:p-6 flex justify-center"
              >
                <div className="w-full max-w-[700px] mx-auto pb-8">
                  {/* Tab: Todos */}
                  {tab === 'all' && (
                    <div className="flex flex-col gap-6">
                      {data.results.map((r, i) => (
                        <div key={r.id} className="w-full animate-fade-in">
                          <ResultCard result={r} index={i} openInNewTab={openInNewTab} />
                        </div>
                      ))}
                      
                      {/* Loading More Indicator */}
                      {data.hasMore && (
                        <div className="w-full flex justify-center py-6">
                          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                        </div>
                      )}
                      
                      {/* End of results / Related Searches */}
                      {!data.hasMore && data.related.length > 0 && (
                        <div className="w-full text-center py-12">
                          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Fim dos resultados</h2>
                          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Pesquisas relacionadas</h3>
                          <div className="flex flex-wrap justify-center gap-2">
                            {data.related.map(r => (
                              <Link key={r} to={`/search?q=${encodeURIComponent(r)}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-surface-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-500 transition-all">
                                <Search className="w-4 h-4" />{r}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Tab: Imagens */}
                  {tab === 'images' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {data.images.map((img, i) => (
                        <div key={img.id} className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-surface-850 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                          <img src={getProxyUrl(img.src)} alt={img.alt} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <div><p className="text-xs text-white font-medium">{img.alt}</p><p className="text-[10px] text-white/70">{img.site}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab: Vídeos */}
                  {tab === 'videos' && (
                    <div className="flex flex-col gap-3">
                      {data.videos.map((v, i) => (
                        <article key={v.id} className="group flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-850/50 transition-all animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="relative shrink-0 w-44 h-24 rounded-lg overflow-hidden bg-slate-200 dark:bg-surface-800">
                            <img src={getProxyUrl(v.thumb)} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">{v.duration}</span>
                          </div>
                          <div className="min-w-0"><h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-500 line-clamp-2">{v.title}</h3><p className="text-xs text-slate-400 mt-1">{v.channel}</p><p className="text-xs text-slate-400">{v.views} visualizações</p></div>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Tab: Notícias */}
                  {tab === 'news' && (
                    <div className="flex flex-col gap-3">
                      {data.news.map((n, i) => (
                        <article key={n.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-md transition-all animate-fade-in cursor-pointer bg-white dark:bg-surface-950" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="flex items-center gap-2 mb-2"><span className="text-xs font-semibold text-brand-500">{n.source}</span><span className="text-[10px] text-slate-400">· {n.time}</span></div>
                          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{n.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{n.snippet}</p>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Tab: Código */}
                  {tab === 'code' && (
                    <div className="flex flex-col gap-3">
                      {data.code.map((c, i) => (
                        <article key={c.id} className="rounded-xl border border-slate-100 dark:border-slate-800/40 overflow-hidden hover:border-brand-300 dark:hover:border-brand-500/30 transition-all animate-fade-in bg-white dark:bg-surface-950" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-surface-850 border-b border-slate-100 dark:border-slate-800/40">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{c.repo}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium">{c.lang}</span>
                          </div>
                          <div className="px-4 py-1.5 text-xs text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800/30">{c.file}</div>
                          <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-surface-900 overflow-x-auto leading-relaxed"><code>{c.snippet}</code></pre>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Tab: Acadêmico */}
                  {tab === 'academic' && (
                    <div className="flex flex-col gap-4">
                      {data.academic?.map((a, i) => (
                        <article key={a.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all animate-fade-in bg-white dark:bg-surface-950" style={{ animationDelay: `${i * 80}ms` }}>
                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="w-4 h-4 text-brand-500" />
                              <span className="text-xs font-semibold text-slate-500">{a.site}</span>
                              {a.year && <span className="text-[10px] text-slate-400">· {a.year}</span>}
                            </div>
                            <h3 className="text-base font-semibold text-brand-600 dark:text-brand-400 mb-2 hover:underline">{a.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{a.snippet}</p>
                          </a>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Tab: Shopping */}
                  {tab === 'shopping' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {data.shopping?.map((s, i) => (
                        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-md transition-all animate-fade-in bg-white dark:bg-surface-950" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="aspect-square bg-slate-50 dark:bg-surface-900 rounded-lg flex items-center justify-center mb-3">
                            <ShoppingCart className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 mb-1 group-hover:text-brand-500 transition-colors">{s.title}</h3>
                            <div className="mt-auto">
                              <span className="text-lg font-bold text-slate-900 dark:text-white">{s.price || "Preço indisponível"}</span>
                              <p className="text-[10px] text-slate-500 mt-1">{s.site}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && data && data.results.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-slate-200 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Nenhum resultado</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">O Crawler ainda está mapeando a rede soberana. Volte em alguns minutos.</p>
              </div>
            )}
            
            {/* Top Stats Overlay */}
            {data && !loading && tab === 'all' && data.results.length > 0 && (
              <div className="absolute top-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                  <p className="text-[10px] font-medium text-white/90">
                    {data.total.toLocaleString()} resultados ({data.time}s)
                  </p>
                </div>
              </div>
            )}
            
            {/* Knowledge Panel / Skeleton */}
            {loading && (
               <div className="hidden"></div> // Skeleton removed for swiper focus
            )}
          </div>
        </main>
      </div>

      {/* Sticky Bottom Navigation (Pesquisa e Tabs) */}
      <div className="sticky bottom-0 z-40 bg-white/90 dark:bg-surface-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/60 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)]">
        <div className="max-w-screen-2xl mx-auto">
          {/* Tabs */}
          <nav className="flex justify-center md:justify-start items-center gap-1 px-2 md:px-6 overflow-x-auto no-scrollbar pt-2">
            <button disabled className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all opacity-70 cursor-not-allowed text-purple-500/70 dark:text-purple-400/70 bg-purple-50 dark:bg-purple-500/10`}>
              <MessageCircle className="w-4 h-4" /> Rosa <span className="text-[10px] uppercase font-bold bg-purple-200 dark:bg-purple-500/30 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300">Em breve</span>
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
