import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";

const stats = [
  {
    title: "CGPA",
    value: "8.5",
    sub: "+0.3 this sem",
    icon: GraduationCap,
    grad: "grad-blue",
    glow: "rgba(59,130,246,0.35)",
    path: "/results",
  },
  {
    title: "Attendance",
    value: "92%",
    sub: "5 days streak",
    icon: CalendarDays,
    grad: "grad-green",
    glow: "rgba(16,185,129,0.35)",
    path: "/attendance",
  },
  {
    title: "Credits Earned",
    value: "120",
    sub: "of 160 total",
    icon: BookOpen,
    grad: "grad-purple",
    glow: "rgba(139,92,246,0.35)",
    path: "/courses",
  },
  {
    title: "Pending Tasks",
    value: "4",
    sub: "2 due this week",
    icon: ClipboardList,
    grad: "grad-orange",
    glow: "rgba(249,115,22,0.35)",
    path: "/assignments",
  },
];

const performanceData = [
  { subject: "Artificial Intelligence", value: 95, color: "#3b82f6" },
  { subject: "Cyber Security", value: 90, color: "#10b981" },
  { subject: "Operating Systems", value: 88, color: "#8b5cf6" },
  { subject: "Software Engineering", value: 86, color: "#f97316" },
  { subject: "Data Mining", value: 84, color: "#f43f5e" },
];

const attendanceData = [
  { subject: "Operating Systems", value: 95 },
  { subject: "Data Mining", value: 90 },
  { subject: "Cyber Security", value: 93 },
  { subject: "Software Engineering", value: 89 },
  { subject: "Computer Graphics", value: 94 },
];

const assignments = [
  { title: "AI Project Report", date: "28 Jun", urgent: true },
  { title: "Operating System Lab", date: "30 Jun", urgent: true },
  { title: "Data Mining Assignment", date: "2 Jul", urgent: false },
];

function Dashboard() {
  const navigate = useNavigate();

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-100/80 p-3 transition-colors duration-300 sm:p-4 lg:p-6 dark:from-[#0a0f1e] dark:via-[#0f172a] dark:to-[#1a1040]">

          {/* Header */}
          <PageHeader title="Student Dashboard" subtitle="Welcome back, Kirti " />

          {/* ── Hero Banner ── */}
          <div className="animate-fade-slide-up delay-100 mb-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />
              {/* Decorative circles */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
              <div className="absolute top-4 right-40 w-20 h-20 bg-white/10 rounded-full" />

              <div className="relative flex items-center justify-between p-4 sm:p-6 lg:p-7">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span className="text-blue-200 text-sm font-medium">Academic Year 2025–26</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    B.Tech CSE
                    <span className="mt-1 block text-base font-medium text-blue-200 sm:ml-3 sm:mt-0 sm:inline sm:text-xl lg:text-2xl">7th Semester</span>
                  </h2>
                  <p className="mt-2 text-blue-100 text-base">Keep learning, keep growing.</p>
                  <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm font-semibold border border-white/30 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" /> CGPA 8.5
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm font-semibold border border-white/30">
                      📅 Attendance 92%
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-center gap-2 text-white/80">
                  <div className="text-6xl font-black text-white/90">8.5</div>
                  <div className="text-sm text-blue-200 font-medium">Current CGPA</div>
                  <div className="flex items-center gap-1 text-green-300 text-xs font-semibold">
                    <TrendingUp className="h-3 w-3" /> +0.3 this semester
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
            {stats.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`animate-fade-slide-up delay-${150 + i * 50} stat-card`}
                  onClick={() => navigate(item.path)}
                >
                  <div
                    className={`${item.grad} rounded-3xl p-5 shadow-xl cursor-pointer hover:scale-[1.03] transition-all duration-300 group`}
                    style={{ boxShadow: `0 12px 32px -8px ${item.glow}` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <p className="text-white/70 text-sm font-medium mb-1">{item.title}</p>
                    <h2 className="text-4xl font-black text-white tracking-tight">{item.value}</h2>
                    <p className="text-white/60 text-xs mt-2 font-medium">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Academic Section ── */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">

            {/* Semester Performance */}
            <div className="animate-fade-slide-up delay-300">
              <Card className="rounded-3xl border-0 shadow-xl glass dark:bg-slate-800/60 overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100/50 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Semester Performance
                    </CardTitle>
                    <button
                      onClick={() => navigate("/results")}
                      className="text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      View All <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  {performanceData.map((item, i) => (
                    <div key={item.subject} className={`animate-fade-slide-up delay-${350 + i * 50}`}>
                      <div className="flex justify-between mb-2 text-sm font-medium">
                        <span className="text-slate-700 dark:text-slate-300">{item.subject}</span>
                        <span className="font-bold" style={{ color: item.color }}>{item.value}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${item.value}%`,
                            background: `linear-gradient(90deg, ${item.color}aa, ${item.color})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Attendance Overview */}
            <div className="animate-fade-slide-up delay-350">
              <Card className="rounded-3xl border-0 shadow-xl glass dark:bg-slate-800/60 overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100/50 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-green-500" />
                      Attendance Overview
                    </CardTitle>
                    <button
                      onClick={() => navigate("/attendance")}
                      className="text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      View All <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-4">
                  {attendanceData.map((item, i) => {
                    const pct = item.value;
                    const color = pct >= 90 ? "#10b981" : pct >= 75 ? "#3b82f6" : "#f43f5e";
                    return (
                      <div
                        key={item.subject}
                        className={`animate-fade-slide-up delay-${400 + i * 50} flex justify-between items-center p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/5 hover:bg-blue-50/60 dark:hover:bg-white/10 transition-colors cursor-default group`}
                      >
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                          {item.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                          <Badge
                            className="text-white text-xs font-bold border-0"
                            style={{ background: color }}
                          >
                            {pct}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Upcoming Assignments ── */}
          <div className="animate-fade-slide-up delay-400">
            <Card className="rounded-3xl border-0 shadow-xl glass dark:bg-slate-800/60 overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100/50 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-orange-500" />
                    Upcoming Assignments
                  </CardTitle>
                  <button
                    onClick={() => navigate("/assignments")}
                    className="text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {assignments.map((item, i) => (
                  <div
                    key={item.title}
                    className={`animate-fade-slide-up delay-${450 + i * 50} flex justify-between items-center p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 hover:bg-orange-50/60 dark:hover:bg-white/10 transition-all duration-200 group cursor-default ${item.urgent ? "border-l-4 border-orange-400" : "border-l-4 border-slate-200 dark:border-slate-700"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.urgent ? "bg-orange-400" : "bg-slate-300"}`} />
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.title}</span>
                    </div>
                    <Badge
                      className={`text-xs font-bold border-0 ${
                        item.urgent
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {item.date}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Dashboard;
