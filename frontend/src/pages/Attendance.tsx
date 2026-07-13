import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
} from "lucide-react";

// ── Mini Calendar ──────────────────────────────────────────────────────────────
function MiniCalendar({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const presentDates = new Set([1, 2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 28, 29]);
  const absentDates  = new Set([5, 6, 12, 13, 19, 20, 26, 27]);

  const monthName   = viewDate.toLocaleString("default", { month: "long" });
  const year        = viewDate.getFullYear();
  const firstDay    = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const presentCount = [...presentDates].filter(d => d <= daysInMonth).length;
  const absentCount  = [...absentDates].filter(d => d <= daysInMonth).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative mx-3 w-full max-w-96 animate-scale-in overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient bar */}
        <div className="grad-blue p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center relative">
            <div className="flex justify-start">
              <button
                type="button"
                aria-label="Previous month"
                onClick={prevMonth}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-black text-white text-xl">{monthName}</p>
              <p className="text-blue-200 text-sm font-medium">{year}</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Next month"
                onClick={nextMonth}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Close calendar"
                onClick={onClose}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {/* Mini stats */}
          <div className="flex justify-center gap-5 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{presentCount}</p>
              <p className="text-xs text-green-300 font-semibold">Present</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">{absentCount}</p>
              <p className="text-xs text-red-300 font-semibold">Absent</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">
                {Math.round((presentCount / (presentCount + absentCount)) * 100)}%
              </p>
              <p className="text-xs text-blue-200 font-semibold">Rate</p>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="p-5">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-3">
            {days.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-y-1.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                today.getDate() === day &&
                today.getMonth() === viewDate.getMonth() &&
                today.getFullYear() === viewDate.getFullYear();
              const isSelected = selectedDay === day;
              const isPresent  = presentDates.has(day);
              const isAbsent   = absentDates.has(day);

              let cls = "relative flex items-center justify-center h-9 w-9 mx-auto text-sm rounded-2xl cursor-pointer transition-all duration-150 font-semibold ";

              if (isSelected) {
                cls += "bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110 ";
              } else if (isPresent) {
                cls += "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 ";
              } else if (isAbsent) {
                cls += "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 ";
              } else {
                cls += "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 ";
              }

              if (isToday && !isSelected) {
                cls += "ring-2 ring-blue-400 ring-offset-1 ";
              }

              return (
                <div key={day} className="py-0.5">
                  <div className={cls} onClick={() => setSelectedDay(day)}>
                    {day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            {[
              { color: "bg-emerald-400", label: "Present" },
              { color: "bg-red-400", label: "Absent" },
              { color: "bg-blue-500", label: "Selected" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${l.color} block`} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────────
function Attendance() {
  const [showCalendar, setShowCalendar] = useState(false);

  const attendance = [
    { subject: "Operating Systems",  percentage: 95, attended: 38, total: 40, color: "#3b82f6" },
    { subject: "Data Mining",        percentage: 90, attended: 36, total: 40, color: "#10b981" },
    { subject: "Cyber Security",     percentage: 93, attended: 37, total: 40, color: "#8b5cf6" },
    { subject: "Software Engineering", percentage: 89, attended: 35, total: 40, color: "#f97316" },
    { subject: "Computer Graphics",  percentage: 94, attended: 38, total: 40, color: "#f43f5e" },
  ];

  const statCards = [
    {
      label: "Overall Attendance",
      value: "92%",
      icon: CalendarDays,
      grad: "grad-green",
      glow: "rgba(16,185,129,0.35)",
      clickable: true,
    },
    {
      label: "Classes Attended",
      value: "184",
      icon: CheckCircle,
      grad: "grad-blue",
      glow: "rgba(59,130,246,0.35)",
      clickable: false,
    },
    {
      label: "Total Classes",
      value: "200",
      icon: Clock,
      grad: "grad-orange",
      glow: "rgba(249,115,22,0.35)",
      clickable: false,
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-emerald-100/60 p-3 transition-colors duration-300 sm:p-4 lg:p-6 dark:from-[#0a0f1e] dark:via-[#0f172a] dark:to-[#0a1a10]">

          <PageHeader title="Attendance" subtitle="Record of your attendance" />

          {/* ── Hero Banner ── */}
          <div className="animate-fade-slide-up delay-100 mb-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600" />
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
              <div className="relative flex items-center justify-between p-4 sm:p-6 lg:p-7">
                <div>
                  <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Overall Attendance</h2>
                  <p className="mt-1 text-green-100 text-base">Excellent attendance record this semester 🎉</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm font-semibold border border-white/30">
                      184 / 200 Classes
                    </div>
                    <div className="flex items-center gap-1.5 text-green-300 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4" /> Above 75% threshold
                    </div>
                  </div>
                </div>
                <div
                  className="hidden md:flex flex-col items-center justify-center h-28 w-28 rounded-full bg-white/20 backdrop-blur border-4 border-white/30 cursor-pointer hover:scale-105 transition-transform duration-300 group"
                  onClick={() => setShowCalendar(true)}
                >
                  <span className="text-4xl font-black text-white">92%</span>
                  <span className="text-xs text-green-200 font-semibold mt-1 group-hover:underline">View Calendar</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`animate-fade-slide-up delay-${200 + i * 80} stat-card`}
                  onClick={card.clickable ? () => setShowCalendar(true) : undefined}
                >
                  <div
                    className={`${card.grad} rounded-3xl p-5 shadow-xl ${card.clickable ? "cursor-pointer hover:scale-[1.03]" : ""} transition-all duration-300`}
                    style={{ boxShadow: `0 12px 32px -8px ${card.glow}` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {card.clickable && (
                        <span className="text-xs text-white/70 font-semibold">Click to open →</span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm font-medium mb-1">{card.label}</p>
                    <h2 className="text-4xl font-black text-white tracking-tight">{card.value}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Subject Attendance ── */}
          <div className="animate-fade-slide-up delay-400">
            <Card className="rounded-3xl border-0 shadow-xl glass dark:bg-slate-800/60 overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100/50 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Subject-wise Attendance
                  </CardTitle>
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Open Calendar
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {attendance.map((item, i) => {
                  const pct = item.percentage;
                  const badgeColor =
                    pct >= 90 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : pct >= 75 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

                  return (
                    <div key={item.subject} className={`animate-fade-slide-up delay-${450 + i * 60}`}>
                      <div className="flex justify-between mb-2.5">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.subject}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {item.attended}/{item.total} classes
                          </p>
                        </div>
                        <Badge className={`${badgeColor} font-bold border-0 self-start`}>
                          {item.percentage}%
                        </Badge>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${item.percentage}%`,
                            background: `linear-gradient(90deg, ${item.color}99, ${item.color})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>

      {showCalendar && <MiniCalendar onClose={() => setShowCalendar(false)} />}
    </SidebarProvider>
  );
}

export default Attendance;
