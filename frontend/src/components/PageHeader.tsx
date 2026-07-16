import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface PageHeaderProps { title: string; subtitle: string }

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  return <header className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
    <div className="min-w-0"><h1 className="truncate text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">{title}</h1><p className="truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{subtitle}</p></div>
    <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme" className="rounded-2xl border border-slate-200/60 bg-white/80 p-2.5 shadow-md transition hover:scale-105 dark:border-slate-700 dark:bg-slate-800">{resolvedTheme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}</button>
  </header>;
}
