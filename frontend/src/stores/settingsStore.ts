import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, ThemeMode } from '../services/types';

interface SettingsState extends Settings {
  setTheme: (theme: ThemeMode) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
}

const DEFAULTS: Settings = {
  theme: 'dark',
  historyEnabled: true,
  autocompleteEnabled: true,
  openInNewTab: false,
  resultsPerPage: 10,
  language: 'pt',
  region: 'br',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      setSetting: (key, value) => set({ [key]: value }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'crom-settings' }
  )
);
