import { useState, useEffect } from 'react';
import { API_BASE } from '../services/api';
import { Shield, Database, Globe, Check, X, LogOut, Activity } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link } from 'react-router-dom';

export function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [password, setPassword] = useState('');
  
  const [stats, setStats] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async (authToken: string) => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const statsRes = await fetch(`${API_BASE}/admin/stats`, { headers });
      if (!statsRes.ok) throw new Error('Unauthorized');
      const statsData = await statsRes.json();
      setStats(statsData);
      
      const suggRes = await fetch(`${API_BASE}/admin/suggestions`, { headers });
      if (suggRes.ok) {
        setSuggestions(await suggRes.json());
      }
      
      setToken(authToken);
      localStorage.setItem('admin_token', authToken);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      localStorage.removeItem('admin_token');
      setError('Acesso negado. Senha incorreta.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (url: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`${API_BASE}/admin/action`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, action })
      });
      if (res.ok) {
        // Remove from list optimistic UI
        setSuggestions(prev => prev.filter(s => s.url !== url));
        fetchDashboard(token); // Refresh stats
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard(token);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboard(password);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken('');
    setPassword('');
    localStorage.removeItem('admin_token');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-surface-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-brand-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Acesso Restrito</h1>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">Painel Governamental CROM Engine</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Senha de Administrador</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Autenticar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0"><img src="/logo.ico" alt="CROM" className="w-8 h-8" /></Link>
            <h1 className="font-bold text-lg hidden sm:block">Admin Dashboard</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">RESTRICTED</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nós Indexados</p>
              <h2 className="text-3xl font-bold">{stats?.total_nodes?.toLocaleString() || 0}</h2>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sugestões Pendentes</p>
              <h2 className="text-3xl font-bold">{stats?.pending_suggestions?.toLocaleString() || 0}</h2>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status do Engine</p>
              <h2 className="text-xl font-bold text-emerald-500 uppercase">{stats?.status || 'UNKNOWN'}</h2>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-brand-500" /> Fila de Sugestões de Usuários</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {suggestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">Nenhuma sugestão pendente no momento.</div>
            ) : (
              suggestions.map((s, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-surface-850 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                    <div>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-brand-500 hover:underline">{s.url}</a>
                      <p className="text-[10px] text-slate-400">Sugerido em: {new Date(s.suggested_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAction(s.url, 'approve')} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors" title="Aprovar e Enviar para o Crawler">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction(s.url, 'reject')} className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Rejeitar">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
