import { Link } from 'react-router-dom';
import { Settings, ShieldCheck, Search, Zap } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-end gap-3 px-6 py-3 animate-fade-in">
        <nav className="flex items-center gap-4 md:gap-6">
          <Link to="/network" className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">CROM Network</Link>
          <Link to="/api" className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">API</Link>
          <a href="https://crom.run/apoio" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Contribuir</a>
          <Link to="/transparency" className="hidden sm:block text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Transparência</Link>
        </nav>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
        <Link to="/settings" className="p-2 rounded-xl text-slate-400 hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all" title="Configurações">
          <Settings className="w-5 h-5" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content (Pushed to bottom) */}
      <main className="mt-auto flex flex-col items-center w-full px-4 sm:px-6 pb-8 md:pb-12">
        <div className="mb-6 md:mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <img src="/logo.ico" alt="CROM" className="w-[clamp(6rem,18vw,12rem)] h-auto object-contain animate-float drop-shadow-2xl" />
        </div>

        <p className="text-xs sm:text-sm md:text-base text-slate-400 dark:text-slate-500 mb-6 text-center animate-fade-in-up tracking-wide" style={{ animationDelay: '150ms' }}>
          Pesquise a web com <span className="text-brand-400 font-semibold">soberania</span> e <span className="text-emerald-400 font-semibold">privacidade</span>
        </p>

        <div className="w-full max-w-[620px] animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <SearchBar />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => { const input = document.querySelector('input') as HTMLInputElement; if (input?.value.trim()) navigate(`/search?q=${encodeURIComponent(input.value)}`); else input?.focus(); }}
            className="group px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-surface-800 border border-slate-200 dark:border-slate-700/50 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-brand-500 hover:border-brand-500 hover:text-white dark:hover:bg-brand-600 dark:hover:border-brand-600 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-brand-500/20 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Pesquisar
          </button>
          <button
            onClick={() => { const input = document.querySelector('input') as HTMLInputElement; if (input?.value.trim()) navigate(`/search?q=${encodeURIComponent(input.value)}&lucky=1`); else input?.focus(); }}
            className="group px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-surface-800 border border-slate-200 dark:border-slate-700/50 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:border-amber-500 hover:text-white dark:hover:bg-amber-600 dark:hover:border-amber-600 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-amber-500/20 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Estou com sorte
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-surface-950/80">
        <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero tracking · Soberania Digital · Local-first</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Termos</a>
            <a href="#" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacidade</a>
            <a href="#" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Contato</a>
            <Link to="/settings" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Preferências</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
