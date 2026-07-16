import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = { name: string; subtitle: string; image?: string; collapsed: boolean; onLogout: () => void };

export default function SidebarAccountCard({ name, subtitle, image, collapsed, onLogout }: Props) {
  const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  if (collapsed) return (
    <button type="button" onClick={onLogout} title={`Sign out · ${name}`} aria-label={`Sign out ${name}`} className="mx-auto block rounded-full outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-white">
      <Avatar className="h-10 w-10 border-2 border-white/30 shadow-lg">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback className="bg-white/20 text-xs font-black text-white">{initials}</AvatarFallback>
      </Avatar>
    </button>
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 shadow-sm">
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border-2 border-white/30 shadow-md">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-white/20 text-xs font-black text-white">{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-blue-700 bg-emerald-400" />
      </div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold leading-tight text-white">{name}</p><p className="mt-1 truncate text-xs text-blue-200">{subtitle}</p></div>
      <button type="button" onClick={onLogout} title="Sign out" aria-label={`Sign out ${name}`} className="shrink-0 rounded-xl p-2 text-blue-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><LogOut className="h-4 w-4" /></button>
    </div>
  );
}
