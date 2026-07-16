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
          className="flex h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-3xl bg-white p-0 sm:max-w-6xl dark:bg-slate-950"
        >
          <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-5 text-white">
            <button
              type="button"
              onClick={() => setRegisterOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/15 p-2 hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            <DialogTitle className="text-2xl font-black text-white">
              {editingId ? "Edit Attendance" : "Mark Attendance"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-blue-100">
              Complete the class register and save everyone in one operation.
            </DialogDescription>
          </div>

          <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Course
              <select
                value={course}
                disabled={Boolean(editingId)}
                onChange={(event) => void loadStudents(event.target.value)}
                className="mt-2 h-10 w-full rounded-xl border-2 border-slate-200 bg-white px-3 dark:bg-slate-900"
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
            <Button variant="outline" onClick={() => setAll("Present")} className="h-10 rounded-xl text-emerald-700">
              All Present
            </Button>
            <Button variant="outline" onClick={() => setAll("Absent")} className="h-10 rounded-xl text-red-700">
              All Absent
            </Button>
            <Button variant="outline" onClick={() => setAll("Present")} className="h-10 rounded-xl">
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 border-b bg-slate-50 p-3 sm:grid-cols-4 dark:bg-slate-900">
            {[
              ["Total", records.length, "text-slate-900 dark:text-white"],
              ["Present", counts.present, "text-emerald-600"],
              ["Absent", counts.absent, "text-red-600"],
              ["Percentage", `${counts.percentage}%`, "text-blue-600"],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-xl bg-white px-4 py-2 text-center shadow-sm dark:bg-slate-800">
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="border-b p-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, roll number or email"
                className="h-10 rounded-xl border-2 border-slate-200 pl-10"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {registerLoading ? (
              <p className="p-10 text-center text-slate-500">Loading class register…</p>
            ) : records.length === 0 ? (
              <p className="p-10 text-center text-slate-500">
                Select a course to load its active students.
              </p>
            ) : (
              <table className="w-full min-w-[760px] text-left">
                <thead className="sticky top-0 z-10 bg-slate-100 text-sm text-slate-500 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3">Roll number</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {visibleRecords.map((record) => (
                    <tr key={record.student}>
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
                          className="h-9 rounded-xl border-slate-200"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-red-600">{formError}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRegisterOpen(false)} className="h-10 rounded-xl px-5">
                Cancel
              </Button>
              <Button
                onClick={() => void save()}
                disabled={saving || records.length === 0}
                className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 font-bold text-white"
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
