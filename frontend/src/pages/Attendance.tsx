import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAttendance, type AttendanceRecord } from "@/services/academicService";

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState({ total: 0, attended: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getAttendance().then((response) => { setRecords(response.data); setSummary(response.summary); }).catch(() => setError("Unable to load attendance")) .finally(() => setLoading(false)); }, []);
  const counts = useMemo(() => Object.fromEntries(["Present", "Absent", "Late", "Excused"].map((status) => [status, records.filter((record) => record.status === status).length])), [records]);
  const statusStyle: Record<string, string> = { Present: "bg-green-100 text-green-700", Absent: "bg-red-100 text-red-700", Late: "bg-amber-100 text-amber-700", Excused: "bg-blue-100 text-blue-700" };
  return <SidebarProvider defaultOpen><AppSidebar /><SidebarInset><main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-3 sm:p-5 lg:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950"><PageHeader title="Attendance" subtitle="Your attendance records from the portal" />
    <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 p-6 text-white shadow-2xl"><div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" /><div className="relative flex items-center justify-between"><div><p className="text-green-100">Overall attendance</p><h2 className="mt-1 text-4xl font-black">{summary.percentage}%</h2><p className="mt-2 text-sm text-green-100">{summary.attended} attended sessions out of {summary.total} records</p></div><CalendarCheck className="h-14 w-14 text-white/80" /></div></section>
    <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Present", CheckCircle2, "text-green-600"], ["Absent", XCircle, "text-red-600"], ["Late", Clock3, "text-amber-600"], ["Excused", CalendarCheck, "text-blue-600"]].map(([label, Icon, color]) => <Card key={String(label)} className="rounded-2xl border-0 shadow-lg"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-slate-500">{String(label)}</p><p className="text-3xl font-black">{counts[String(label)] || 0}</p></div><Icon className={`h-7 w-7 ${String(color)}`} /></CardContent></Card>)}</div>
    <Card className="rounded-3xl border-0 shadow-xl"><CardHeader><CardTitle>Attendance history</CardTitle></CardHeader><CardContent>{loading ? <p className="py-10 text-center text-slate-500">Loading attendance…</p> : error ? <p className="py-10 text-center text-red-600">{error}</p> : records.length === 0 ? <p className="py-10 text-center text-slate-500">No attendance has been marked yet.</p> : <div className="space-y-3">{records.map((record) => <div key={record._id} className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 sm:flex-row sm:items-center"><div><p className="font-bold text-slate-800 dark:text-white">{record.course?.name || "Course"}</p><p className="text-sm text-slate-500">{new Date(record.date).toLocaleDateString()} {record.remarks ? `· ${record.remarks}` : ""}</p></div><Badge className={statusStyle[record.status]}>{record.status}</Badge></div>)}</div>}</CardContent></Card>
  </main></SidebarInset></SidebarProvider>;
}
