import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Search,
  UserCheck,
  UserRoundX,
  Users,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDatePicker from "@/components/admin/AdminDatePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchAdminPage } from "@/services/adminService";
import type { CourseRef } from "@/services/academicService";
import {
  getAttendanceDashboardSummary,
  getAttendanceSession,
  getAttendanceSessions,
  getRegisterStudents,
  saveAttendanceSession,
  type AttendanceDashboardSummary,
  type AttendanceSession,
  type RegisterRecord,
} from "@/services/attendanceAdminService";

const today = new Date().toISOString().slice(0, 10);

const emptySummary: AttendanceDashboardSummary = {
  totalStudents: 0,
  presentToday: 0,
  absentToday: 0,
  percentage: 0,
  sessionsToday: 0,
};

const fetchAttendancePage = async (filters: {
  course: string;
  date: string;
}) => {
  const [summaryResult, historyResult, coursesResult] =
    await Promise.allSettled([
    getAttendanceDashboardSummary(),
    getAttendanceSessions({
      limit: 50,
      course: filters.course || undefined,
      date: filters.date || undefined,
    }),
    fetchAdminPage("courses", { limit: 100 }),
  ]);
  const errors = [summaryResult, historyResult, coursesResult]
    .filter((result) => result.status === "rejected")
    .map((result) => {
      const reason = (result as PromiseRejectedResult).reason;
      return axios.isAxiosError<{ message?: string }>(reason)
        ? reason.response?.data.message || reason.message
        : "Unable to load attendance data";
    });
  return {
    summary:
      summaryResult.status === "fulfilled"
        ? summaryResult.value
        : emptySummary,
    sessions:
      historyResult.status === "fulfilled" ? historyResult.value.data : [],
    courses:
      coursesResult.status === "fulfilled"
        ? (coursesResult.value.data as unknown as CourseRef[])
        : [],
    error: [...new Set(errors)].join(" · "),
  };
};

export default function AdminAttendance() {
  const [summary, setSummary] = useState(emptySummary);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [courses, setCourses] = useState<CourseRef[]>([]);
  const [filters, setFilters] = useState({ course: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [course, setCourse] = useState("");
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState<RegisterRecord[]>([]);
  const [search, setSearch] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPage = async () => {
    setLoading(true);
    try {
      const page = await fetchAttendancePage(filters);
      setSummary(page.summary);
      setSessions(page.sessions);
      setCourses(page.courses);
      setNotice(page.error);
    } catch {
      setNotice("Unable to load attendance dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void fetchAttendancePage(filters)
      .then((page) => {
        if (!active) return;
        setSummary(page.summary);
        setSessions(page.sessions);
        setCourses(page.courses);
        setNotice(page.error);
      })
      .catch(() => {
        if (active) setNotice("Unable to load attendance dashboard");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters]);

  const startRegister = () => {
    setEditingId(undefined);
    setCourse("");
    setDate(today);
    setRecords([]);
    setSearch("");
    setFormError("");
    setRegisterOpen(true);
  };

  const loadStudents = async (courseId: string) => {
    setCourse(courseId);
    setRecords([]);
    if (!courseId) return;
    setRegisterLoading(true);
    setFormError("");
    try {
      const response = await getRegisterStudents(courseId);
      setRecords(
        response.students.map((student) => ({
          student: student._id,
          status: "Present",
          remarks: "",
          studentDetails: student,
        })),
      );
      if (response.students.length === 0) {
        setFormError("No active students belong to this course program");
      }
    } catch {
      setFormError("Unable to load the class register");
    } finally {
      setRegisterLoading(false);
    }
  };

  const editSession = async (id: string) => {
    setRegisterOpen(true);
    setRegisterLoading(true);
    setFormError("");
    try {
      const session = await getAttendanceSession(id);
      setEditingId(id);
      setCourse(session.course._id);
      setDate(session.date.slice(0, 10));
      setRecords(
        (session.records || []).map((record) => ({
          student: record.student._id,
          status: record.status,
          remarks: record.remarks || "",
          studentDetails: record.student,
        })),
      );
    } catch {
      setFormError("Unable to open this attendance session");
    } finally {
      setRegisterLoading(false);
    }
  };

  const counts = useMemo(() => {
    const present = records.filter((record) => record.status === "Present").length;
    const absent = records.length - present;
    return {
      present,
      absent,
      percentage: records.length ? Math.round((present / records.length) * 100) : 0,
    };
  }, [records]);

  const visibleRecords = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return records;
    return records.filter((record) =>
      [
        record.studentDetails.name,
        record.studentDetails.rollNo,
        record.studentDetails.email,
      ].some((field) => field?.toLowerCase().includes(value)),
    );
  }, [records, search]);

  const setAll = (status: "Present" | "Absent") => {
    setRecords((current) =>
      current.map((record) => ({ ...record, status })),
    );
  };

  const updateRecord = (
    student: string,
    update: Partial<Pick<RegisterRecord, "status" | "remarks">>,
  ) => {
    setRecords((current) =>
      current.map((record) =>
        record.student === student ? { ...record, ...update } : record,
      ),
    );
  };

  const save = async () => {
    if (!course || !date || records.length === 0) {
      setFormError("Select a course, date and a non-empty class register");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await saveAttendanceSession(
        {
          course,
          date,
          records: records.map(({ student, status, remarks }) => ({
            student,
            status,
            remarks,
          })),
        },
        editingId,
      );
      setRegisterOpen(false);
      setNotice(
        editingId
          ? "Attendance session updated successfully"
          : "Class attendance saved successfully",
      );
      await loadPage();
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; existingSessionId?: string }>(error)) {
        const existingId = error.response?.data.existingSessionId;
        if (error.response?.status === 409 && existingId) {
          setFormError("Attendance already exists. Opening it for editing.");
          await editSession(existingId);
        } else {
          setFormError(error.response?.data.message || "Unable to save attendance");
        }
      } else {
        setFormError("Unable to save attendance");
      }
    } finally {
      setSaving(false);
    }
  };

  const cards = [
    ["Total students", summary.totalStudents, Users, "from-blue-500 to-blue-700"],
    ["Present today", summary.presentToday, UserCheck, "from-emerald-500 to-green-700"],
    ["Absent today", summary.absentToday, UserRoundX, "from-rose-500 to-red-700"],
    ["Today's attendance", `${summary.percentage}%`, CalendarCheck, "from-violet-500 to-purple-700"],
  ] as const;

  return (
    <AdminLayout
      title="Attendance"
      subtitle="Mark and manage complete classroom attendance"
    >
      <section className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-xl sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-100">Classroom register</p>
          <h2 className="mt-1 text-2xl font-black">Attendance management</h2>
          <p className="mt-2 text-sm text-blue-100">
            Everyone starts present. Change only the students who are absent.
          </p>
        </div>
        <Button
          onClick={startRegister}
          className="h-11 rounded-xl bg-white px-5 font-bold text-blue-700 hover:bg-blue-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark Attendance
        </Button>
      </section>

      {notice && (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          {notice}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, gradient]) => (
          <Card
            key={label}
            className={`border-0 bg-gradient-to-br ${gradient} text-white shadow-xl`}
          >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-white/75">{label}</p>
                <p className="mt-1 text-3xl font-black">{value}</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3">
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
        <CardContent className="p-0">
          <div className="flex flex-col justify-between gap-4 border-b p-5 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Attendance history
              </h3>
              <p className="text-sm text-slate-500">
                {sessions.length} recent classroom sessions
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <select
                  value={filters.course}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      course: event.target.value,
                    }))
                  }
                  className="h-10 min-w-52 appearance-none rounded-xl border-2 border-slate-200 bg-white px-3 pr-9 text-sm dark:bg-slate-900"
                >
                  <option value="">All courses</option>
                  {courses.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <AdminDatePicker
                value={filters.date || undefined}
                label="date"
                onChange={(value) =>
                  setFilters((current) => ({ ...current, date: value }))
                }
              />
            </div>
          </div>

          {loading ? (
            <p className="p-10 text-center text-slate-500">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="p-10 text-center text-slate-500">
              No attendance sessions match these filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500 dark:bg-slate-800">
                  <tr>
                    {["Date", "Course", "Total", "Present", "Absent", "Percentage", "Action"].map((label) => (
                      <th key={label} className="px-5 py-4 font-bold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {sessions.map((session) => {
                    const percentage = session.totalStudents
                      ? Math.round((session.presentCount / session.totalStudents) * 100)
                      : 0;
                    return (
                      <tr key={session._id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50">
                        <td className="px-5 py-4 text-sm font-semibold">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold">{session.course?.name || "Course"}</p>
                          <p className="text-xs text-slate-500">{session.program}</p>
                        </td>
                        <td className="px-5 py-4">{session.totalStudents}</td>
                        <td className="px-5 py-4 text-emerald-600">{session.presentCount}</td>
                        <td className="px-5 py-4 text-red-600">{session.absentCount}</td>
                        <td className="px-5 py-4">
                          <Badge className={percentage >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {percentage}%
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Button
                            variant="outline"
                            onClick={() => void editSession(session._id)}
                            className="h-9 rounded-xl"
                          >
                            <Edit3 className="h-4 w-4" /> Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[calc(100vh-3rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-[2rem] border-0 bg-slate-50 p-0 shadow-2xl shadow-slate-950/30 sm:max-w-5xl dark:bg-slate-950"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 px-6 py-5 text-white">
            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute right-28 top-12 h-28 w-28 rounded-full bg-white/5" />
            <button
              type="button"
              onClick={() => setRegisterOpen(false)}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/15 p-2.5 text-white transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3 shadow-inner backdrop-blur">
                <CalendarCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-white sm:text-3xl">
                  {editingId ? "Edit Attendance" : "Mark Attendance"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm font-medium text-blue-100">
                  Complete the class register and save everyone in one operation.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="grid gap-4 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end dark:bg-slate-900">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Course
              <select
                value={course}
                onChange={(event) => void loadStudents(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-950"
              >
                <option value="">Select course</option>
                {courses.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Attendance date
              <div className="mt-2">
                <AdminDatePicker
                  value={date}
                  label="attendance date"
                  onChange={setDate}
                />
              </div>
            </label>
            <Button variant="outline" onClick={() => setAll("Present")} className="h-12 rounded-2xl border-emerald-200 bg-emerald-50 px-4 font-bold text-emerald-700 hover:bg-emerald-100">
              All Present
            </Button>
            <Button variant="outline" onClick={() => setAll("Absent")} className="h-12 rounded-2xl border-red-200 bg-red-50 px-4 font-bold text-red-700 hover:bg-red-100">
              All Absent
            </Button>
            <Button variant="outline" onClick={() => setAll("Present")} className="h-12 rounded-2xl px-4 font-bold">
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-100/80 px-5 py-4 sm:grid-cols-4 dark:bg-slate-950">
            {[
              ["Total", records.length, "text-slate-900 dark:text-white"],
              ["Present", counts.present, "text-emerald-600"],
              ["Absent", counts.absent, "text-red-600"],
              ["Percentage", `${counts.percentage}%`, "text-blue-600"],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-2xl border border-white bg-white px-4 py-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white px-5 py-4 dark:bg-slate-900">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, roll number or email"
                className="h-11 rounded-2xl border-2 border-slate-200 bg-slate-50 pl-10 text-base"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto bg-white dark:bg-slate-900">
            {registerLoading ? (
              <p className="p-10 text-center text-slate-500">Loading class register…</p>
            ) : records.length === 0 ? (
              <div className="flex h-full min-h-72 items-center justify-center p-8">
                <div className="max-w-sm rounded-3xl border border-slate-100 bg-slate-50 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Users className="h-7 w-7" />
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    Select a course first
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Active students will appear here after you choose a course.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full min-w-[760px] text-left">
                <thead className="sticky top-0 z-10 bg-slate-100 text-sm text-slate-500 shadow-sm dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3">Roll number</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {visibleRecords.map((record) => (
                    <tr key={record.student} className="transition hover:bg-blue-50/50 dark:hover:bg-slate-800/70">
                      <td className="px-4 py-3 font-semibold text-slate-500">
                        {record.studentDetails.rollNo || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold">{record.studentDetails.name}</p>
                        <p className="text-xs text-slate-500">{record.studentDetails.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                          {(["Present", "Absent"] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateRecord(record.student, { status })}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${record.status === status ? status === "Present" ? "bg-emerald-500 text-white shadow" : "bg-red-500 text-white shadow" : "text-slate-500"}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={record.remarks}
                          maxLength={500}
                          onChange={(event) => updateRecord(record.student, { remarks: event.target.value })}
                          placeholder="Optional remark"
                          className="h-10 rounded-xl border-slate-200 bg-slate-50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-red-600">{formError}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRegisterOpen(false)} className="h-12 rounded-2xl px-7 font-bold">
                Cancel
              </Button>
              <Button
                onClick={() => void save()}
                disabled={saving || records.length === 0}
                className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 font-bold text-white shadow-lg shadow-blue-500/20"
              >
                {saving ? "Saving…" : editingId ? "Update Attendance" : "Save Attendance"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
