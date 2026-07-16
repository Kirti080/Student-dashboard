import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/context/ThemeContext";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  return <SidebarProvider defaultOpen><AdminSidebar /><SidebarInset><main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-100/80 p-3 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:p-5 lg:p-7">
    <header className="mb-7 flex items-center justify-between"><div className="flex items-center gap-3"><SidebarTrigger className="rounded-xl bg-white/80 shadow-sm dark:bg-slate-800" /><div><h1 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h1><p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p></div></div><button type="button" aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="rounded-xl bg-white p-2.5 shadow-md dark:bg-slate-800">{resolvedTheme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}</button></header>
    {children}
  </main></SidebarInset></SidebarProvider>;
}
