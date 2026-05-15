import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { SearchResult } from '../services/types';

interface Props {
  result: SearchResult;
  index: number;
  openInNewTab?: boolean;
}

export function ResultCard({ result, index, openInNewTab = false }: Props) {
  return (
    <article
      className="result-line group flex items-start gap-3 p-4 pl-5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-surface-850/50 transition-all animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
            style={{ background: result.color }}
          >
            {result.site[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{result.site}</p>
            <p className="text-xs text-emerald-600 dark:text-teal-400 truncate">{result.breadcrumb}</p>
          </div>
        </div>

        <a
          href={result.url.startsWith('http') ? result.url : `https://${result.url}`}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          className="block text-lg font-normal text-blue-700 dark:text-blue-400 hover:underline leading-snug mb-1 decoration-blue-400/40"
        >
          {result.title}
        </a>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {result.snippet}
        </p>

        {result.sitelinks && result.sitelinks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {result.sitelinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors font-medium"
              >
                {link}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Detail Button ">" */}
      <Link
        to={`/link/${result.id}`}
        className="shrink-0 mt-6 p-2 rounded-xl text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
        title="Ver detalhes do link"
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </article>
  );
}
