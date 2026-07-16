import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/redux/actions/authActions";
import type { RootState } from "@/redux/reducers";

const links = [
  [
    "Dashboard",
    "/admin/dashboard",
    LayoutDashboard,
    "from-blue-400 to-blue-600",
  ],
  ["Students", "/admin/students", Users, "from-cyan-400 to-cyan-600"],
  ["Courses", "/admin/courses", BookOpen, "from-purple-400 to-purple-600"],
  [
    "Assignments",
    "/admin/assignments",
    ClipboardList,
    "from-orange-400 to-orange-600",
  ],
  [
    "Progress & Credits",
    "/admin/progress",
    BarChart3,
    "from-pink-400 to-rose-600",
  ],
  [
    "Attendance",
    "/admin/attendance",
    CalendarDays,
    "from-green-400 to-green-600",
  ],
  ["Results", "/admin/results", Award, "from-yellow-400 to-amber-600"],
  ["Settings", "/admin/settings", Settings, "from-indigo-400 to-indigo-600"],
] as const;

export default function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const name = useSelector(
    (root: RootState) => root.auth.user?.name || "Administrator",
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 text-white"
      style={{
        background:
          "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
      }}
    >
      <SidebarContent className="flex h-full flex-col">
        <div className="border-b border-white/10 px-4 py-5">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-sm font-black text-white shadow-lg backdrop-blur">
                AP
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-base font-black leading-tight tracking-tight text-white">
                Admin Portal
              </h1>
              <p className="text-xs text-blue-200">Academic Dashboard</p>
            </div>
          )}
        </div>

        <SidebarGroup className="mt-3 flex-1 px-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {links.map(([label, path, Icon, accent]) => {
                const active = location.pathname === path;

                return (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      onClick={() => navigate(path)}
                      className={`group h-11 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "border border-white/20 bg-white/20 text-white shadow-lg shadow-black/10"
                          : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div
                        className={`shrink-0 ${
                          active
                            ? `rounded-lg bg-gradient-to-br p-1 ${accent} shadow-md`
                            : ""
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            active
                              ? "text-white"
                              : "text-blue-200 group-hover:text-white"
                          }`}
                        />
                      </div>
                      {!collapsed && <span className="truncate">{label}</span>}
                      {active && !collapsed && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <LogOut className="h-4 w-4 text-blue-200" />
          {!collapsed && <span className="truncate">Sign out · {name}</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
