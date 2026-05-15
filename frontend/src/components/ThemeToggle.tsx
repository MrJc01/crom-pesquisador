import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
      title="Alternar tema"
    >
      <Sun className="w-[18px] h-[18px] hidden dark:block" />
      <Moon className="w-[18px] h-[18px] block dark:hidden" />
    </button>
  );
}
