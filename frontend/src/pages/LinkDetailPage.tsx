import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Shield, Globe, Clock, BarChart3,
  Tag, MessageCircle, ThumbsUp, ThumbsDown, Send, Lock,
  Server, FileText, Eye, Calendar, User, Hash, ChevronRight, Flag
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { getLinkDetail, postComment, reportLink, getProxyUrl } from '../services/api';
import type { LinkDetail, LinkComment } from '../services/types';

export function LinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<LinkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [activeSection, setActiveSection] = useState<'meta' | 'tech' | 'analytics' | 'comments'>('meta');
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getLinkDetail(id).then(d => { setData(d); setLoading(false); });
  }, [id]);

  const handleComment = async () => {
    if (!comment.trim() || !id || sending) return;
    setSending(true);
    const newComment = await postComment(id, comment.trim());
    setData(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev);
    setComment('');
    setSending(false);
  };

  const handleReport = async () => {
    if (!reportReason.trim() || !id) return;
    setReportStatus('loading');
    try {
      await reportLink(id, data?.url || '', reportReason);
      setReportStatus('success');
      setTimeout(() => {
        setShowReportModal(false);
        setReportStatus('idle');
        setReportReason('');
      }, 2000);
    } catch {
      setReportStatus('error');
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}min atrás`;
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-surface-950 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl px-6">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6 w-full" style={{ animationDelay: `${i * 100}ms` }} />)}
        </div>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-400">Link não encontrado</div>;

  const sections = [
    { id: 'meta' as const, label: 'Metadados', icon: FileText },
    { id: 'tech' as const, label: 'Técnico', icon: Server },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'comments' as const, label: `Comentários (${data.comments?.length || 0})`, icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-4 px-4 md:px-6 py-3 max-w-5xl mx-auto">
          <button onClick={() => window.history.back()} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link to="/" className="shrink-0"><img src="/logo.ico" alt="CROM" className="w-8 h-8 object-contain" /></Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{data.meta.title}</p>
            <p className="text-xs text-emerald-500 dark:text-teal-400 truncate">{data.url}</p>
          </div>
          <button onClick={() => setShowReportModal(true)} title="Denunciar Conteúdo" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
            <Flag className="w-3.5 h-3.5" />
          </button>
          <a href={data.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-500 border border-brand-300 dark:border-brand-500/30 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Visitar
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-6">
        {/* OG Image Preview */}
        {data.meta.ogImage && (
          <div className="rounded-2xl overflow-hidden mb-6 animate-fade-in">
            <img src={getProxyUrl(data.meta.ogImage)} alt={data.meta.title} className="w-full h-48 md:h-64 object-cover" />
          </div>
        )}

        {/* Title + Description */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2">{data.meta.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{data.meta.description}</p>
          {(data.meta.keywords?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {data.meta.keywords.map(k => (
                <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-850 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">{k}</span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-100 dark:border-slate-800/40">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-500/10"><BarChart3 className="w-4 h-4 text-brand-500" /></div>
            <div><p className="text-lg font-bold">{data.analytics.cromRank}</p><p className="text-[10px] text-slate-400">CROM Rank</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-100 dark:border-slate-800/40">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10"><Eye className="w-4 h-4 text-emerald-500" /></div>
            <div><p className="text-lg font-bold">{data.analytics.searchAppearances.toLocaleString()}</p><p className="text-[10px] text-slate-400">Aparições</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-100 dark:border-slate-800/40">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10"><Clock className="w-4 h-4 text-sky-500" /></div>
            <div><p className="text-lg font-bold">{data.technical.responseTimeMs}ms</p><p className="text-[10px] text-slate-400">Resposta</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-100 dark:border-slate-800/40">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10"><MessageCircle className="w-4 h-4 text-purple-500" /></div>
            <div><p className="text-lg font-bold">{data.comments?.length || 0}</p><p className="text-[10px] text-slate-400">Comentários</p></div>
          </div>
        </div>

        {/* Section Tabs */}
        <nav className="flex gap-1 mb-6 overflow-x-auto border-b border-slate-100 dark:border-slate-800/40">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${activeSection === s.id ? 'tab-active' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </nav>

        {/* Metadados */}
        {activeSection === 'meta' && (
          <div className="space-y-3 animate-fade-in">
            <InfoRow icon={FileText} label="Título" value={data.meta.title} />
            <InfoRow icon={FileText} label="Descrição" value={data.meta.description} />
            {data.meta.ogType && <InfoRow icon={Globe} label="OG Type" value={data.meta.ogType} />}
            {data.meta.canonical && <InfoRow icon={ExternalLink} label="Canonical" value={data.meta.canonical} link />}
            {data.meta.author && <InfoRow icon={User} label="Autor" value={data.meta.author} />}
            {data.meta.language && <InfoRow icon={Globe} label="Idioma" value={data.meta.language} />}
            {data.meta.publishedDate && <InfoRow icon={Calendar} label="Publicado" value={formatDate(data.meta.publishedDate)} />}
            {data.meta.modifiedDate && <InfoRow icon={Calendar} label="Atualizado" value={formatDate(data.meta.modifiedDate)} />}
          </div>
        )}

        {/* Técnico */}
        {activeSection === 'tech' && (
          <div className="space-y-3 animate-fade-in">
            <InfoRow icon={Globe} label="Domínio" value={data.technical.domain} />
            <InfoRow icon={Hash} label="IP (mascarado)" value={data.technical.ipMasked} badge="LGPD" badgeColor="emerald" />
            <InfoRow icon={Lock} label="SSL" value={data.technical.ssl ? `✅ Sim — ${data.technical.sslIssuer || 'N/A'}` : '❌ Não'} />
            <InfoRow icon={Server} label="Servidor" value={data.technical.server || 'N/A'} />
            <InfoRow icon={BarChart3} label="HTTP Status" value={String(data.technical.httpStatus)} />
            <InfoRow icon={Clock} label="Tempo de Resposta" value={`${data.technical.responseTimeMs}ms`} />
            <InfoRow icon={FileText} label="Content-Type" value={data.technical.contentType} />
            {data.technical.contentLength && <InfoRow icon={FileText} label="Tamanho" value={`${(data.technical.contentLength / 1024).toFixed(1)} KB`} />}
          </div>
        )}

        {/* Analytics */}
        {activeSection === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard label="CROM Rank" value={`${data.analytics.cromRank}/100`} bar={data.analytics.cromRank} color="brand" />
              <StatCard label="Aparições em Buscas" value={data.analytics.searchAppearances.toLocaleString()} color="emerald" />
            </div>
            <InfoRow icon={Clock} label="Último Crawl" value={formatDate(data.analytics.lastCrawled)} />
            <InfoRow icon={Calendar} label="Primeiro Registro" value={formatDate(data.analytics.firstSeen)} />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><Tag className="w-4 h-4 text-brand-500" /> Categorias</p>
              <div className="flex flex-wrap gap-2">
                {data.analytics.categoryTags?.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comentários */}
        {activeSection === 'comments' && (
          <div className="space-y-4 animate-fade-in">
            {/* LGPD Notice */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Comentários baseados em IP anonimizado. Sem cadastro, sem rastreamento. Conforme LGPD.</span>
            </div>

            {/* Comment Input */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-brand-500" />
              </div>
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Deixe um comentário sobre este link..."
                  rows={2}
                  className="w-full bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">Seu IP será anonimizado</span>
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim() || sending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {data.comments?.map((c: LinkComment) => (
              <div key={c.id} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-850/50 transition-all">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {c.ipHash.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">{c.ipMasked}</span>
                    <span className="text-[10px] text-slate-400">· {timeAgo(c.timestamp)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{c.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-500 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" /> {c.upvotes}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      <ThumbsDown className="w-3.5 h-3.5" /> {c.downvotes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related Links */}
        {(data.related?.length || 0) > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/40 animate-fade-in">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Links Relacionados</h2>
            <div className="space-y-2">
              {data.related.map(r => (
                <Link key={r.id} to={`/link/${r.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-850/50 transition-all group">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-500 truncate">{r.title}</p>
                    <p className="text-xs text-emerald-500 truncate">{r.url}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-surface-800 text-slate-400">{r.type}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                <Flag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Denunciar Conteúdo</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Por que este link deve ser investigado pelo esquadrão SRE da rede CROM?</p>
            <textarea
              placeholder="Ex: Contém malware, phishing, violação de direitos (DMCA) ou conteúdo ilegal."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 mb-4 resize-none"
            />
            {reportStatus === 'success' && <p className="text-emerald-500 text-sm mb-4">Denúncia enviada aos administradores. Obrigado!</p>}
            {reportStatus === 'error' && <p className="text-red-500 text-sm mb-4">Falha ao enviar denúncia. Tente novamente.</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Cancelar</button>
              <button onClick={handleReport} disabled={reportStatus === 'loading' || reportStatus === 'success' || !reportReason.trim()} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50">
                {reportStatus === 'loading' ? 'Enviando...' : 'Enviar Denúncia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function InfoRow({ icon: Icon, label, value, link, badge, badgeColor }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; link?: boolean;
  badge?: string; badgeColor?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-850/30 transition-all">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        {link ? (
          <a href={value} target="_blank" rel="noopener" className="text-sm text-brand-500 hover:underline break-all">{value}</a>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 break-all">{value}</p>
        )}
      </div>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-${badgeColor}-50 dark:bg-${badgeColor}-500/10 text-${badgeColor}-600 dark:text-${badgeColor}-400`}>
          {badge}
        </span>
      )}
    </div>
  );
}

function StatCard({ label, value, bar, color }: { label: string; value: string; bar?: number; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-100 dark:border-slate-800/40">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold mb-2">{value}</p>
      {bar !== undefined && (
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className={`h-full rounded-full bg-${color}-500 transition-all duration-1000`} style={{ width: `${bar}%` }} />
        </div>
      )}
    </div>
  );
}
