import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry, TabType } from '../services/types';

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (query: string, tab: TabType) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
  clearByTab: (tab: TabType) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (query, tab) => {
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          query,
          tab,
          timestamp: Date.now(),
        };
        // Evita duplicatas consecutivas
        const prev = get().entries;
        if (prev.length > 0 && prev[0].query === query && prev[0].tab === tab) return;
        set({ entries: [entry, ...prev].slice(0, 200) });
      },
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      clearAll: () => set({ entries: [] }),
      clearByTab: (tab) => set((s) => ({ entries: s.entries.filter((e) => e.tab !== tab) })),
    }),
    { name: 'crom-history' }
  )
);
