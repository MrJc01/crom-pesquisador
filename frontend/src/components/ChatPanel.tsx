import { useState, useRef, useEffect } from 'react';
import { Zap, X, Send } from 'lucide-react';
import { chatAI } from '../services/api';
import type { ChatMessage } from '../services/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'Olá! Sou o assistente IA do CROM. Posso resumir resultados, responder perguntas e ajudar na sua pesquisa.', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const response = await chatAI(msg);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: 'Erro ao processar. Tente novamente.', timestamp: Date.now() }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-[400px] shrink-0 border-r border-slate-200 dark:border-slate-800/60 flex flex-col bg-slate-50/50 dark:bg-surface-900/50 h-[calc(100vh-105px)] sticky top-[105px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold">CROM IA</span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full">BETA</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-fade-in`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`text-sm leading-relaxed rounded-xl p-3 max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-brand-50 dark:bg-brand-500/10 text-slate-700 dark:text-slate-200 rounded-tr-sm'
                : 'bg-white dark:bg-surface-850 text-slate-600 dark:text-slate-300 rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700/40'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white">U</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center shrink-0"><Zap className="w-3.5 h-3.5 text-white" /></div>
            <div className="bg-white dark:bg-surface-850 rounded-xl rounded-tl-sm p-3 shadow-sm border border-slate-100 dark:border-slate-700/40">
              <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/40">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-surface-850 border border-slate-200 dark:border-slate-700/50 focus-within:border-purple-400 dark:focus-within:border-purple-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="p-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
