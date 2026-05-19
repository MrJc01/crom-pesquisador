import { Globe, AlertOctagon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function BlockedRegionPage() {
  useTheme(); // Inicializa tema para respeitar sistema

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-red-500/20 dark:bg-red-500/10 blur-xl rounded-full" />
        <div className="relative bg-white dark:bg-surface-900 border-2 border-red-100 dark:border-red-900/50 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg">
          <AlertOctagon className="w-12 h-12 text-red-500" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
        Acesso Restrito à Região
      </h1>
      
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        O <strong>CROM Pesquisador</strong> atualmente está disponível exclusivamente para usuários em território <span className="font-bold text-brand-500 dark:text-brand-400">Brasileiro</span>.
      </p>

      <div className="flex items-center gap-2 bg-slate-100 dark:bg-surface-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
        <Globe className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Sua localização não é suportada neste momento.
        </span>
      </div>
    </div>
  );
}
