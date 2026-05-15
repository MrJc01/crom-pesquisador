import { Link } from 'react-router-dom';
import { Sun, Shield, Settings as SettingsIcon, Globe, Clock } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useTheme } from '../hooks/useTheme';
import type { ThemeMode } from '../services/types';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const settings = useSettingsStore();

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative">
      <input type="checkbox" className="toggle-input sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="toggle-track" />
    </label>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950 text-slate-900 dark:text-slate-100">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800/60">
        <Link to="/"><img src="/logo.ico" alt="CROM" className="w-9 h-9 object-contain" /></Link>
        <h1 className="text-lg font-bold">Configurações</h1>
        <Link to="/history" className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
          <Clock className="w-4 h-4" /> Histórico
        </Link>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 space-y-10">
        {/* Aparência */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2.5 mb-1"><Sun className="w-5 h-5 text-brand-500" /><h2 className="text-base font-bold">Aparência</h2></div>
          <p className="text-sm text-slate-400 mb-5">Personalize o visual.</p>
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/40">
            <div><p className="text-sm font-medium">Tema</p></div>
            <div className="flex gap-3">
              {(['light', 'dark', 'system'] as ThemeMode[]).map(t => (
                <label key={t} className="cursor-pointer text-center">
                  <input type="radio" name="theme" value={t} className="hidden peer" checked={theme === t} onChange={() => setTheme(t)} />
                  <div className={`w-16 h-11 rounded-lg border-2 ${theme === t ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-200 dark:border-slate-700'} overflow-hidden transition-all ${t === 'light' ? 'bg-white' : t === 'dark' ? 'bg-slate-900' : ''}`} style={t === 'system' ? { background: 'linear-gradient(135deg, #fff 50%, #0f172a 50%)' } : {}}>
                    <div className={`h-3 ${t === 'light' ? 'bg-slate-100' : t === 'dark' ? 'bg-slate-800' : ''}`} style={t === 'system' ? { background: 'linear-gradient(135deg, #f1f5f9 50%, #1e293b 50%)' } : {}} />
                    {t !== 'system' && <div className="p-1 space-y-1"><div className={`h-1 w-10 ${t === 'light' ? 'bg-slate-200' : 'bg-slate-700'} rounded`} /><div className={`h-1 w-7 ${t === 'light' ? 'bg-slate-200' : 'bg-slate-700'} rounded`} /></div>}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block capitalize">{t === 'system' ? 'Sistema' : t === 'light' ? 'Claro' : 'Escuro'}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Privacidade */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2.5 mb-1"><Shield className="w-5 h-5 text-emerald-500" /><h2 className="text-base font-bold">Privacidade</h2></div>
          <p className="text-sm text-slate-400 mb-5">Dados salvos localmente no navegador.</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Histórico local</p><p className="text-xs text-slate-400 mt-0.5">Buscas recentes para sugestões.</p></div>
              <Toggle checked={settings.historyEnabled} onChange={(v) => settings.setSetting('historyEnabled', v)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Autocompletar</p><p className="text-xs text-slate-400 mt-0.5">Sugestões ao digitar.</p></div>
              <Toggle checked={settings.autocompleteEnabled} onChange={(v) => settings.setSetting('autocompleteEnabled', v)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Limpar dados</p></div>
              <button onClick={() => { if (confirm('Limpar tudo?')) settings.reset(); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-300 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">Limpar tudo</button>
            </div>
          </div>
        </section>

        {/* Comportamento */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2.5 mb-1"><SettingsIcon className="w-5 h-5 text-brand-500" /><h2 className="text-base font-bold">Comportamento</h2></div>
          <p className="text-sm text-slate-400 mb-5">Controle o CROM.</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Abrir em nova aba</p></div>
              <Toggle checked={settings.openInNewTab} onChange={(v) => settings.setSetting('openInNewTab', v)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Resultados por página</p></div>
              <select value={settings.resultsPerPage} onChange={(e) => settings.setSetting('resultsPerPage', Number(e.target.value))} className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-700/50 outline-none cursor-pointer">
                {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Região */}
        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2.5 mb-1"><Globe className="w-5 h-5 text-sky-500" /><h2 className="text-base font-bold">Região & Idioma</h2></div>
          <p className="text-sm text-slate-400 mb-5">Filtrar por região e idioma.</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Idioma</p></div>
              <select value={settings.language} onChange={(e) => settings.setSetting('language', e.target.value)} className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-700/50 outline-none cursor-pointer">
                <option value="pt">Português</option><option value="en">English</option><option value="es">Español</option><option value="all">Todos</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">Região</p></div>
              <select value={settings.region} onChange={(e) => settings.setSetting('region', e.target.value)} className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-700/50 outline-none cursor-pointer">
                <option value="br">Brasil</option><option value="pt">Portugal</option><option value="us">EUA</option><option value="global">Global</option>
              </select>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
