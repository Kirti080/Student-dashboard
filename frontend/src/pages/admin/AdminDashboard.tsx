import { useEffect, useState } from "react";
import { BookOpen, CalendarCheck, ClipboardList, UserCheck, UserX, Users } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAdminDashboard } from "@/services/adminService";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardData = {
  stats: Record<string, number>;
  recentStudents: Array<Record<string, unknown>>;
  upcomingAssignments: Array<Record<string, unknown>>;
  activities: Array<Record<string, unknown>>;
  charts: { registrations: Array<{ name: string; value: number }>; assignments: Array<{ name: string; value: number }>; attendance: Array<{ name: string; value: number }>; grades: Array<{ name: string; value: number }> };
};
const cards = [
  ["Total Students", "totalStudents", Users, "from-blue-500 to-blue-700"],
  ["Active Students", "activeStudents", UserCheck, "from-emerald-500 to-green-700"],
  ["Inactive Students", "inactiveStudents", UserX, "from-rose-500 to-red-700"],
  ["Courses", "totalCourses", BookOpen, "from-violet-500 to-purple-700"],
  ["Assignments", "totalAssignments", ClipboardList, "from-orange-500 to-amber-600"],
  ["Attendance", "averageAttendance", CalendarCheck, "from-cyan-500 to-teal-700"],
] as const;

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetchAdminDashboard().then(setData).catch(() => setError("Unable to load dashboard data")); }, []);
  return <AdminLayout title="Admin Dashboard" subtitle="Live overview of the student portal">
    <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-2xl"><div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" /><div className="relative"><p className="text-sm font-semibold text-blue-100">Portal administration</p><h2 className="mt-1 text-3xl font-black">Everything in one clear view</h2><p className="mt-2 text-blue-100">All figures below come directly from your database.</p></div></section>
    {error ? <Card className="p-8 text-center text-red-600">{error}</Card> : !data ? <Card className="p-8 text-center text-slate-500">Loading dashboard…</Card> : <>
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, key, Icon, gradient]) => <Card key={key} className={`border-0 bg-gradient-to-br ${gradient} text-white shadow-xl`}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-white/75">{label}</p><p className="mt-1 text-3xl font-black">{data.stats[key] ?? 0}{key === "averageAttendance" ? "%" : ""}</p></div><div className="rounded-2xl bg-white/15 p-3"><Icon className="h-6 w-6" /></div></CardContent></Card>)}</div>
      <div className="mb-7 grid gap-6 xl:grid-cols-2"><ChartCard title="Student registrations"><ResponsiveContainer width="100%" height={250}><BarChart data={data.charts.registrations}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Assignment status"><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={data.charts.assignments} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>{data.charts.assignments.map((entry, index) => <Cell key={entry.name} fill={["#f97316", "#10b981"][index % 2]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></ChartCard><ChartCard title="Attendance overview"><ResponsiveContainer width="100%" height={250}><BarChart data={data.charts.attendance}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Grade distribution"><ResponsiveContainer width="100%" height={250}><BarChart data={data.charts.grades}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard></div>
      <div className="grid gap-6 xl:grid-cols-3"><Info title="Recently registered" items={data.recentStudents} primary="name" secondary="email" /><Info title="Upcoming deadlines" items={data.upcomingAssignments} primary="title" secondary="dueDate" /><Info title="Recent activity" items={data.activities} primary="action" secondary="resource" /></div>
    </>}
  </AdminLayout>;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="rounded-3xl border-0 shadow-xl"><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}

function Info({ title, items, primary, secondary }: { title: string; items: Array<Record<string, unknown>>; primary: string; secondary: string }) {
  return <Card className="rounded-3xl border-0 shadow-xl"><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent className="space-y-3">{items.length ? items.map((item, index) => <div key={String(item._id || index)} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><p className="font-bold capitalize text-slate-800 dark:text-white">{String(item[primary] || "Record")}</p><p className="mt-0.5 text-xs text-slate-500">{secondary.toLowerCase().includes("date") && item[secondary] ? new Date(String(item[secondary])).toLocaleDateString() : String(item[secondary] || "")}</p></div>) : <p className="py-5 text-center text-sm text-slate-500">No data yet.</p>}</CardContent></Card>;
}
