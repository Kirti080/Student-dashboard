import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, BookOpen, ClipboardList,
  CalendarDays, Award, Settings,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from "@/redux/actions/authActions";
import { getProfile, type Profile } from "@/services/profileService";
import SidebarAccountCard from "@/components/SidebarAccountCard";
import getAssetURL from "@/utils/getAssetURL";

const menuItems = [
  { title: "Dashboard",   icon: LayoutDashboard, path: "/dashboard",   accent: "from-blue-400 to-blue-600" },
  { title: "Courses",     icon: BookOpen,        path: "/courses",     accent: "from-purple-400 to-purple-600" },
  { title: "Assignments", icon: ClipboardList,   path: "/assignments", accent: "from-orange-400 to-orange-600" },
  { title: "Attendance",  icon: CalendarDays,    path: "/attendance",  accent: "from-green-400 to-green-600" },
  { title: "Results",     icon: Award,           path: "/results",     accent: "from-yellow-400 to-amber-600" },
  { title: "Settings",    icon: Settings,        path: "/settings",    accent: "from-indigo-400 to-indigo-600" },
];

export function AppSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch((error) => {
      console.error("Sidebar profile error:", error);
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const profileName = profile?.name || "Student";
  const profileSubtitle = [profile?.program, profile?.semester].filter(Boolean).join(" · ") || "Student profile";
  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <TooltipProvider delayDuration={80}>
      <Sidebar
        collapsible="icon"
        className="border-r-0"
        style={{
          background: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
        }}
      >
        <SidebarContent className="flex flex-col h-full">

          {/* Logo */}
          <div className="px-4 py-5 border-b border-white/10">
            {collapsed ? (
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center font-black text-sm shadow-lg border border-white/20 text-white">
                  SP
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </div> */}
                <div>
                  <h1 className="text-base font-black text-white tracking-tight leading-tight">Student Portal</h1>
                  <p className="text-xs text-blue-200">Academic Dashboard</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <SidebarGroup className="mt-3 flex-1 px-2">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {menuItems.map((item) => {
                  const Icon  = item.icon;
                  const active = isActive(item.path);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => navigate(item.path)}
                            className={`
                              h-11 rounded-2xl text-sm font-semibold transition-all duration-200 group
                              ${active
                                ? "bg-white/20 text-white shadow-lg shadow-black/10 border border-white/20"
                                : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                              }
                            `}
                          >
                            <div className={`flex-shrink-0 ${active ? `p-1 rounded-lg bg-gradient-to-br ${item.accent} shadow-md` : ""}`}>
                              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-blue-200 group-hover:text-white"}`} />
                            </div>
                            {!collapsed && (
                              <span className="truncate">{item.title}</span>
                            )}
                            {active && !collapsed && (
                              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
                            )}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent
                            side="right"
                            sideOffset={10}
                            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-black/15 animate-in fade-in-0 zoom-in-95"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.accent}`}>
                                <Icon className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.title}</span>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer — Profile */}
        <SidebarFooter className="border-t border-white/10 p-3">
          <SidebarAccountCard
            name={profileName}
            subtitle={profileSubtitle}
            image={getAssetURL(profile?.profileImage)}
            collapsed={collapsed}
            onLogout={handleLogout}
          />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
