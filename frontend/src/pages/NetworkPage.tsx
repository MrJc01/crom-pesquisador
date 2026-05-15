import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Server, Shield, Network } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function NetworkPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 max-w-screen-2xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100 hidden md:block">Voltar</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-4 md:px-6">
        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6">
          <Network className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-4">
          CROM Network
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-2xl mb-12 leading-relaxed">
          O CROM Engine faz parte de um ecossistema mais amplo de infraestrutura soberana. Nossa rede é projetada para ser distribuída, privada e resistente à censura.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <Server className="w-6 h-6 text-brand-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Descentralização</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Dados estruturados através de shards em SQLite (One-File-Per-Site), facilitando a distribuição do conhecimento.</p>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <Shield className="w-6 h-6 text-purple-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Soberania</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sem analytics invasivos, sem rastreamento comportamental. Privacidade é a fundação da nossa arquitetura LGPD.</p>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <Globe className="w-6 h-6 text-blue-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Integração</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Conectado ao ecossistema Crom (CromChat, Cromia, Crolab). Um hub central para a soberania digital na Web3.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
