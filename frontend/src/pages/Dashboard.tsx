import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, ClipboardList, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getStudentDashboard, type StudentDashboardData } from "@/services/academicService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getStudentDashboard().then(setData).catch(() => setError("Unable to load dashboard data")); }, []);
  const attendanceByCourse = useMemo(() => {
    if (!data) return [];
    const groups = new Map<string, 
    { name: string; total: number; attended: number }>();
    data.attendance.forEach((record) => { const key = record.course?._id || "course"; 
    const current = groups.get(key) || { name: record.course?.name || "Course", total: 0, attended: 0 }; 
    if (record.status !== "Excused") { current.total += 1; 

    if (["Present", "Late"].includes(record.status)) current.attended += 1; } groups.set(key, current); });
    return [...groups.values()].map((group) => ({ name: group.name, value: group.total ? Math.round((group.attended / group.total) * 100) : 0 }));
  }, [data]);

  const performance = useMemo(() => data?.results.map((result) => ({ 
    name: result.course?.name || result.examType, 
    value: Math.round((result.marksObtained / result.maximumMarks) * 100) })) || [], [data]);

  const statCards: Array<{ 
    label: string; 
    value: string | number;
    icon: LucideIcon; 
    gradient: string; 
    path: string }> = data ? 
    [

    { label: "Average Result", value: `${data.summary.averageResult}%`, 
      icon: GraduationCap, gradient: "from-blue-500 to-blue-700", path: "/results" },

    { label: "Attendance", value: `${data.summary.attendance}%`, 
      icon: CalendarDays, gradient: "from-emerald-500 to-green-700", path: "/attendance" },

    { label: "Credits", value: data.summary.credits, 
      icon: BookOpen, gradient: "from-violet-500 to-purple-700", path: "/courses" },

    { label: "Pending Tasks", value: data.summary.pendingAssignments, 
      icon: ClipboardList, gradient: "from-orange-500 to-amber-600", path: "/assignments" },

  ] : [];

  return  <SidebarProvider defaultOpen>
    <AppSidebar />
    <SidebarInset>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-100/80 p-3 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:p-5 lg:p-6">
      <PageHeader title="Student Dashboard" subtitle={data ? `Welcome back, ${data.profile.name}` : "Your academic overview"} />
    {error ?
     <Card className="p-10 text-center text-red-600">{error}</Card> 
     : !data ? 
      <Card className="p-10 text-center text-slate-500">Loading dashboard…
      </Card> : <>
      <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-2xl">
      <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-indigo-900/15" />
      <div className="relative">
      <p className="flex items-center gap-2 text-sm text-blue-100">
      <Sparkles className="h-4 w-4 text-yellow-300" />Academic profile</p>
      <h2 className="mt-2 text-3xl font-black">{data.profile.program || "Student Portal"}
      <span className="ml-3 text-lg font-semibold text-blue-200">{data.profile.semester}
      </span>
      </h2>
      <p className="mt-2 text-blue-100">Keep learning, keep growing.</p>
      </div>
      </section>
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map(({ label, value, icon: Icon, gradient, path }) => 
      <button key={label} type="button" onClick={() => navigate(path)} className={`rounded-3xl bg-gradient-to-br ${gradient} p-5 text-left text-white shadow-xl transition hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
      <Icon className="h-6 w-6" />
      <ArrowRight className="h-4 w-4 text-white/60" />
      </div>
      <p className="mt-4 text-sm text-white/75">{label}</p>
      <p className="text-3xl font-black">{value}</p>
      </button>)
      }
      
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <MetricList title="Published Performance" icon={<TrendingUp className="h-5 w-5 text-blue-500" />} items={performance} empty="No published results yet." />
      <MetricList title="Attendance by Course" icon={<CalendarDays className="h-5 w-5 text-green-500" />} items={attendanceByCourse} empty="No attendance records yet." />
      </div>
      <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader className="flex-row items-center justify-between">
      <CardTitle className="flex items-center gap-2">
      <ClipboardList className="h-5 w-5 text-orange-500" />Upcoming Assignments</CardTitle>
      <button onClick={() => navigate("/assignments")} className="text-sm font-bold text-blue-600">View all</button>
      </CardHeader>
      <CardContent className="space-y-3">{data.assignments.length ? data.assignments.map((assignment) => 
      <div key={assignment._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <div>
      <p className="font-bold text-slate-800 dark:text-white">
      {assignment.title}</p><p className="text-sm text-slate-500">{assignment.subject}
      </p>
      </div>
      <Badge variant="secondary">
      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
      </Badge>
      </div>) : 
      <p className="py-6 text-center text-slate-500">No assignments yet.
      </p>
      }
      </CardContent>
      </Card>
    </>
    }
  </main>
  </SidebarInset>
  </SidebarProvider>;
}

function MetricList({ title, icon, items, empty }:
   { title: string; icon: React.ReactNode; 
     items: Array<{ name: string; value: number }>;
     empty: string }) {
  return <Card className="rounded-3xl border-0 shadow-xl">
    <CardHeader>
    <CardTitle className="flex items-center gap-2">
    {icon}{title}
    </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
    {items.length ? items.map((item) => 
    <div key={item.name}>
    <div className="mb-1.5 flex justify-between text-sm">
    <span>
    {item.name}
    </span>
    <strong>
    {item.value}%
    </strong>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${Math.min(100, item.value)}%` }} />
    </div>
    </div>) : 
    <p className="py-6 text-center text-slate-500">{empty}
    </p>}
    </CardContent>
    </Card>;
}
