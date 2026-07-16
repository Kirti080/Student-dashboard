import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  CircleX,
  TrendingUp,
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getAttendance,
  type AttendanceRecord,
  type AttendanceSummary,
  type SubjectAttendance,
} from "@/services/academicService";

const emptySummary: AttendanceSummary = {
  total: 0,
  attended: 0,
  missed: 0,
  percentage: 0,
};

const attendanceColor = (percentage: number) =>
  percentage >= 75
    ? { bar: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" }
    : percentage >= 65
      ? { bar: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" }
      : { bar: "bg-rose-500", text: "text-rose-600", badge: "bg-rose-100 text-rose-700" };

const statusStyle: Record<AttendanceRecord["status"], string> = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-rose-100 text-rose-700",
  Late: "bg-amber-100 text-amber-700",
  Excused: "bg-blue-100 text-blue-700",
};

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>(emptySummary);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAttendance()
      .then((response) => {
        setRecords(response.data);
        setSummary(response.summary);
        setSubjects(response.subjects);
      })
      .catch(() => setError("Unable to load attendance"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 p-3 sm:p-5 lg:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
          <PageHeader title="Attendance" subtitle="Track your overall and subject-wise classroom attendance" />

          {loading ? (
            <Card className="rounded-3xl border-0 shadow-xl"><CardContent className="py-20 text-center text-slate-500">Loading attendance…</CardContent></Card>
          ) : error ? (
            <Card className="rounded-3xl border-0 shadow-xl"><CardContent className="py-20 text-center font-semibold text-red-600">{error}</CardContent></Card>
          ) : (
            <>
              <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 p-6 text-white shadow-2xl sm:p-8">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
                <div className="absolute bottom-[-5rem] right-40 h-44 w-44 rounded-full bg-white/5" />
                <div className="relative grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-100"><TrendingUp className="h-4 w-4" /> Overall attendance</div>
                    <div className="flex items-end gap-3"><span className="text-6xl font-black tracking-tight">{summary.percentage}%</span><span className="mb-2 text-blue-100">across all subjects</span></div>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100">Every class matters. Use the subject breakdown below to see where your attendance needs attention.</p>
                  </div>
                  <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="mb-3 flex justify-between text-sm font-bold"><span>Attendance progress</span><span>{summary.attended} / {summary.total} classes</span></div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-950/20"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${summary.percentage}%` }} /></div>
                    <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                      {[["Attended", summary.attended], ["Missed", summary.missed], ["Total", summary.total]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/10 px-2 py-3"><p className="text-2xl font-black">{value}</p><p className="text-xs text-blue-100">{label}</p></div>)}
                    </div>
                  </div>
                </div>
              </section>

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {([
                  ["Classes attended", summary.attended, CheckCircle2, "from-emerald-500 to-green-600"],
                  ["Classes missed", summary.missed, CircleX, "from-rose-500 to-red-600"],
                  ["Total classes", summary.total, CalendarCheck, "from-blue-500 to-indigo-600"],
                ] as const).map(([label, value, Icon, gradient]) => <Card key={label} className="overflow-hidden rounded-3xl border-0 shadow-lg"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div><div className={`rounded-2xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}><Icon className="h-6 w-6" /></div></CardContent></Card>)}
              </div>

              <Card className="mb-6 rounded-3xl border-0 shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><BookOpenCheck className="h-5 w-5 text-indigo-600" /> Subject-wise attendance</CardTitle></CardHeader>
                <CardContent>
                  {subjects.length === 0 ? <p className="py-10 text-center text-slate-500">No attendance has been marked yet.</p> : <div className="grid gap-4 lg:grid-cols-2">{subjects.map((subject) => {
                    const color = attendanceColor(subject.percentage);
                    return <article key={subject.course?._id || subject.course?.name} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="font-black text-slate-900 dark:text-white">{subject.course?.name || "Course"}</h3><p className="mt-1 text-xs text-slate-500">{subject.course?.faculty || "Your subject attendance"}</p></div><Badge className={color.badge}>{subject.percentage}%</Badge></div>
                      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500"><span>{subject.attended} attended</span><span>{subject.missed} missed · {subject.total} total</span></div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={`h-full rounded-full ${color.bar} transition-all duration-700`} style={{ width: `${subject.percentage}%` }} /></div>
                      <p className={`mt-3 text-xs font-bold ${color.text}`}>{subject.percentage >= 75 ? "Good standing" : subject.percentage >= 65 ? "Attendance needs attention" : "Attendance is below 65%"}</p>
                    </article>;
                  })}</div>}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-xl">
                <CardHeader><CardTitle>Attendance history</CardTitle></CardHeader>
                <CardContent>{records.length === 0 ? <p className="py-10 text-center text-slate-500">No attendance has been marked yet.</p> : <div className="space-y-3">{records.map((record) => <div key={record._id} className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 sm:flex-row sm:items-center"><div><p className="font-bold text-slate-800 dark:text-white">{record.course?.name || "Course"}</p><p className="text-sm text-slate-500">{new Date(record.date).toLocaleDateString()}{record.remarks ? ` · ${record.remarks}` : ""}</p></div><Badge className={statusStyle[record.status]}>{record.status}</Badge></div>)}</div>}</CardContent>
              </Card>
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
