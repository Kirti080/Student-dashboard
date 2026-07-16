import { useEffect, useMemo, useState } from "react";
import { Award, GraduationCap, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getResults, type ResultRecord } from "@/services/academicService";

export default function Results() {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getResults().then(setResults).catch(() => setError("Unable to load results")).finally(() => setLoading(false)); }, []);
  const scores = useMemo(() => results.map((result) => Math.round((result.marksObtained / result.maximumMarks) * 100)), [results]);
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const highest = scores.length ? Math.max(...scores) : 0;
  const summaryCards: Array<{ label: string; value: string | number; icon: LucideIcon; color: string }> = [
    { label: "Average Score", value: `${average}%`, icon: GraduationCap, color: "text-blue-600" },
    { label: "Published Results", value: results.length, icon: Award, color: "text-purple-600" },
    { label: "Highest Score", value: `${highest}%`, icon: Trophy, color: "text-amber-500" },
  ];
  return <SidebarProvider defaultOpen><AppSidebar /><SidebarInset><main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-3 sm:p-5 lg:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950"><PageHeader title="Results" subtitle="Your published academic results" />
    <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-2xl"><div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" /><h2 className="relative text-3xl font-black">Academic Performance</h2><p className="relative mt-2 text-blue-100">Only results published by the administrator appear here.</p></section>
    <div className="mb-7 grid gap-4 md:grid-cols-3">{summaryCards.map(({ label, value, icon: Icon, color }) => <Card key={label} className="rounded-3xl border-0 shadow-lg"><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div><Icon className={`h-9 w-9 ${color}`} /></CardContent></Card>)}</div>
    <Card className="rounded-3xl border-0 shadow-xl"><CardHeader><CardTitle>Course results</CardTitle></CardHeader><CardContent>{loading ? <p className="py-10 text-center text-slate-500">Loading results…</p> : error ? <p className="py-10 text-center text-red-600">{error}</p> : results.length === 0 ? <p className="py-10 text-center text-slate-500">No results have been published yet.</p> : <div className="space-y-3">{results.map((result) => { const score = Math.round((result.marksObtained / result.maximumMarks) * 100); return <div key={result._id} className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 sm:flex-row sm:items-center"><div><p className="font-bold text-slate-800 dark:text-white">{result.course?.name || "Course"}</p><p className="text-sm text-slate-500">{result.examType}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{result.marksObtained}/{result.maximumMarks} · {score}%</Badge><Badge className="bg-green-100 text-green-700">{result.grade || "—"}</Badge></div></div>; })}</div>}</CardContent></Card>
  </main></SidebarInset></SidebarProvider>;
}
