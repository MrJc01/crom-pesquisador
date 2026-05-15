import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function TransparencyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-5 h-5 text-brand-500" />
            <h1 className="font-bold text-lg">Transparência</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Privacidade e Soberania Digital</h2>
          <p>
            O CROM Engine é um projeto construído com o objetivo de garantir a privacidade absoluta do usuário.
            Nós não rastreamos suas pesquisas, não vendemos seus dados e não criamos perfis de comportamento.
          </p>
          <h3>1. Zero Tracking (Proxy de Imagens)</h3>
          <p>
            Todas as imagens e mídias carregadas nos resultados da pesquisa passam por um <strong>Reverse Proxy</strong> em nossos servidores.
            Isso significa que o seu endereço IP nunca é enviado para os sites terceiros listados nos resultados. Você está invisível para eles.
          </p>
          <h3>2. Anonimato de Comentários (LGPD by Design)</h3>
          <p>
            Nenhum cadastro é necessário para interagir com a plataforma. Quando você avalia ou comenta um link, seu IP é submetido a um 
            Hash Criptográfico unidirecional (SHA-256) com salting aleatório. O endereço original é mascarado (ex: 192.168.***.***) e destruído da memória.
          </p>
          <h3>3. Infraestrutura Independente</h3>
          <p>
            O motor de busca opera de forma totalmente independente (Local-First Architecture). Não dependemos de APIs da Google ou Bing.
            Todo o conteúdo exibido é coletado e indexado pelos nossos próprios crawlers éticos.
          </p>
        </div>
      </main>
    </div>
  );
}
