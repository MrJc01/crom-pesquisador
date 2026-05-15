import type { KnowledgePanel as KPType } from '../services/types';
import { Search } from 'lucide-react';

interface Props {
  data: KPType;
}

export function KnowledgePanel({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-surface-900 overflow-hidden shadow-sm animate-fade-in-up">
      {/* Image/gradient header */}
      <div className="h-36 bg-gradient-to-br from-brand-500 via-purple-500 to-blue-500 flex items-center justify-center">
        <Search className="w-14 h-14 text-white/70" />
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-0.5">{data.title}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{data.subtitle}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{data.description}</p>
        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/40">
          {data.facts.map((fact) => (
            <div key={fact.label} className="flex text-sm">
              <span className="w-24 shrink-0 font-medium text-slate-500 dark:text-slate-400">{fact.label}</span>
              {fact.link ? (
                <a href={fact.link} className="text-brand-500 hover:underline">{fact.value}</a>
              ) : (
                <span className="text-slate-700 dark:text-slate-300">{fact.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
