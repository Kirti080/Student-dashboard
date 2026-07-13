import { useEffect, useState } from "react";
import axiosConfig from "@/api/axiosConfig";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format, isValid, parseISO } from "date-fns";
import {
  ClipboardList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Plus,
  Upload,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Assignment {
  _id?: string;
  id?: number;
  title: string;
  subject: string;
  dueDate: string | null;
  status: "Pending" | "Submitted";
  description?: string;
  priority?: "high" | "medium" | "low";
}

type AssignmentForm = {
  title: string;
  subject: string;
  dueDate: string;
  description: string;
};

const getAssignmentKey = (assignment: Assignment) =>
  assignment._id || String(assignment.id || "");

const formatDueDate = (dueDate?: string | null) => {
  if (!dueDate) return "No date selected";

  const parsedDate = parseISO(dueDate);
  const date = isValid(parsedDate) ? parsedDate : new Date(dueDate);

  return isValid(date) ? format(date, "dd MMMM yyyy") : dueDate;
};

const getSelectedDate = (dueDate?: string | null) => {
  if (!dueDate) return undefined;

  const parsedDate = parseISO(dueDate);
  const date = isValid(parsedDate) ? parsedDate : new Date(dueDate);

  return isValid(date) ? date : undefined;
};

function DueDatePicker({
  value,
  onChange,
  accent = "purple",
}: {
  value: string;
  onChange: (value: string) => void;
  accent?: "purple" | "blue";
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = getSelectedDate(value);
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    const date = selectedDate || today;

    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const focusClass = accent === "blue" ? "focus:ring-blue-500" : "focus:ring-purple-500";
  const selectedClass =
    accent === "blue"
      ? "bg-blue-600 shadow-blue-500/40"
      : "bg-purple-600 shadow-purple-500/40";
  const todayRingClass = accent === "blue" ? "ring-blue-400" : "ring-purple-400";
  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const year = viewDate.getFullYear();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 ${focusClass} dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`}
      >
        <span className={value ? "" : "text-slate-400"}>
          {value ? formatDueDate(value) : "Select due date"}
        </span>
        <CalendarDays className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 z-[70] mb-2 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className={accent === "blue" ? "grad-blue p-3" : "grad-purple p-3"}>
            <div className="grid grid-cols-[3rem_1fr_3rem] items-center">
              <button
                type="button"
                aria-label="Previous month"
                onClick={prevMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white transition-colors hover:bg-white/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-center">
                <p className="text-base font-black text-white">{monthName}</p>
                <p className={accent === "blue" ? "text-sm font-medium text-blue-200" : "text-sm font-medium text-purple-200"}>
                  {year}
                </p>
              </div>
              <button
                type="button"
                aria-label="Next month"
                onClick={nextMonth}
                className="inline-flex h-8 w-8 items-center justify-center justify-self-end rounded-xl bg-white/20 text-white transition-colors hover:bg-white/30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-3">
            <div className="mb-1.5 grid grid-cols-7">
              {days.map((day) => (
                <div key={day} className="py-0.5 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5">
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                const isSelected =
                  selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === viewDate.getMonth() &&
                  selectedDate?.getFullYear() === viewDate.getFullYear();
                const isToday =
                  today.getDate() === day &&
                  today.getMonth() === viewDate.getMonth() &&
                  today.getFullYear() === viewDate.getFullYear();

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      onChange(format(date, "yyyy-MM-dd"));
                      setOpen(false);
                    }}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? `${selectedClass} scale-110 text-white shadow-lg`
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    } ${isToday && !isSelected ? `ring-2 ${todayRingClass} ring-offset-1 dark:ring-offset-slate-900` : ""}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────────
function EditModal({
  assignment,
  onSave,
  onClose,
}: {
  assignment: Assignment;
  onSave: (updated: Assignment) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Assignment>({ ...assignment, dueDate: assignment.dueDate || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await onSave(form);
      onClose();
    } catch {
      setError("Could not update assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative animate-scale-in mx-4 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="grad-blue p-5 relative overflow-hidden rounded-t-3xl">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-3 relative">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Edit Assignment</h2>
              <p className="text-xs text-blue-200">Update assignment details</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: "Title", field: "title", placeholder: "Assignment title" },
            { label: "Subject", field: "subject", placeholder: "Subject name" },
          ].map((f) => (
            <div key={f.field} className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.label}</label>
              <Input
                value={form[f.field as keyof Assignment] as string}
                onChange={(e) => setForm((p) => ({ ...p, [f.field]: e.target.value }))}
                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 transition"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Due Date</label>
            <DueDatePicker
              value={form.dueDate || ""}
              onChange={(dueDate) => setForm((p) => ({ ...p, dueDate }))}
              accent="blue"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Brief description (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
            <div className="flex gap-3">
              {(["Pending", "Submitted"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((p) => ({ ...p, status: s }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.status === s
                      ? s === "Submitted"
                        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.subject.trim()}
              className="flex-1 py-2.5 rounded-xl grad-blue text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Modal ──────────────────────────────────────────────────────────────────
function AddModal({
  onAdd,
  onClose,
}: {
  onAdd: (assignment: AssignmentForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AssignmentForm>({ title: "", subject: "", dueDate: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!form.title.trim() || !form.subject.trim()) return;

    try {
      setSaving(true);
      setError("");
      await onAdd(form);
      onClose();
    } catch {
      setError("Could not add assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative animate-scale-in mx-4 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grad-purple p-5 relative overflow-hidden rounded-t-3xl">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-3 relative">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">New Assignment</h2>
              <p className="text-xs text-purple-200">Add a new assignment to track</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: "Title *", field: "title", placeholder: "Assignment title" },
            { label: "Subject *", field: "subject", placeholder: "Subject name" },
          ].map((f) => (
            <div key={f.field} className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.label}</label>
              <Input
                value={form[f.field as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [f.field]: e.target.value }))}
                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 transition"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Due Date</label>
            <DueDatePicker
              value={form.dueDate}
              onChange={(dueDate) => setForm((p) => ({ ...p, dueDate }))}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !form.title.trim() || !form.subject.trim()}
              className="flex-1 py-2.5 rounded-xl grad-purple text-white text-sm font-bold shadow-lg shadow-purple-500/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> {saving ? "Adding..." : "Add Assignment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosConfig.get<{ assignments: Assignment[] }>("/assignments");

        setAssignments(response.data.assignments);
      } catch (error) {
        console.error("Fetch assignments error:", error);
      }
    };

    fetchAssignments();
  }, []);

  const handleSave = async (updated: Assignment) => {
    const assignmentKey = getAssignmentKey(updated);

    if (!updated._id) {
      throw new Error("Only MongoDB assignments can be edited");
    }

    const assignmentPayload = {
      title: updated.title,
      subject: updated.subject,
      dueDate: updated.dueDate,
      description: updated.description,
      priority: updated.priority,
      status: updated.status,
    };

    const response = await axiosConfig.put<{ assignment: Assignment }>(
      `/assignments/${assignmentKey}`,
      assignmentPayload
    );

    setAssignments((p) =>
      p.map((a) => (getAssignmentKey(a) === assignmentKey ? response.data.assignment : a))
    );
    setPageError("");
  };

  const handleDelete = async (assignmentKey: string) => {
    try {
      const assignment = assignments.find((a) => getAssignmentKey(a) === assignmentKey);

      if (!assignment?._id) {
        setPageError("Only assignments saved in MongoDB can be deleted.");
        return;
      }

      await axiosConfig.delete(`/assignments/${assignmentKey}`);

      setAssignments((p) => p.filter((a) => getAssignmentKey(a) !== assignmentKey));
      setPageError("");
    } catch (error) {
      console.error("Delete assignment error:", error);
      setPageError("Could not delete assignment. Restart backend and try again.");
    }
  };

  const handleSubmit = async (assignmentKey: string) => {
    try {
      const assignment = assignments.find((a) => getAssignmentKey(a) === assignmentKey);

      if (!assignment?._id) {
        setPageError("Only assignments saved in MongoDB can be submitted.");
        return;
      }

      await handleSave({ ...assignment, status: "Submitted" });
    } catch (error) {
      console.error("Submit assignment error:", error);
      setPageError("Could not submit assignment. Restart backend and try again.");
    }
  };

  const handleAdd = async (newAssignment: AssignmentForm) => {
    const response = await axiosConfig.post<{ assignment: Assignment }>("/assignments", newAssignment);

    setAssignments((p) => [response.data.assignment, ...p]);
    setPageError("");
  };

  const pending   = assignments.filter((a) => a.status === "Pending").length;
  const submitted = assignments.filter((a) => a.status === "Submitted").length;

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/40 to-amber-100/60 p-3 transition-colors duration-300 sm:p-4 lg:p-6 dark:from-[#0a0f1e] dark:via-[#0f172a] dark:to-[#1a0f00]">

          <div className="animate-fade-slide-up delay-0">
            <PageHeader title="Assignments" subtitle="Track and submit your assignments" />
          </div>

          {/* ── Hero Banner ── */}
          <div className="animate-fade-slide-up delay-100 mb-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500" />
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
              <div className="relative flex flex-col items-start gap-5 p-4 sm:p-6 md:flex-row md:items-center md:justify-between lg:p-7">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-yellow-200" />
                    <span className="text-orange-100 text-sm font-medium">Stay on top of your work</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {assignments.length} Active Assignments
                  </h2>
                  <p className="mt-1 text-orange-100 text-base">Never miss a deadline. Stay organized.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm font-semibold border border-white/30">
                      🕐 {pending} Pending
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm font-semibold border border-white/30">
                      ✅ {submitted} Submitted
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-orange-700 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 sm:w-auto"
                >
                  <Plus className="h-4 w-4" /> Add New
                </button>
              </div>
            </div>
          </div>

          {/* ── Assignment Cards ── */}
          <div className="grid gap-4 mb-8">
            {pageError && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-300">
                {pageError}
              </div>
            )}

            {assignments.length === 0 && (
              <Card className="rounded-3xl border-0 shadow-lg glass dark:bg-slate-800/70">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/40">
                    <ClipboardList className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    No assignments yet
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Add your first assignment to start tracking it here.
                  </p>
                </CardContent>
              </Card>
            )}

            {assignments.map((a, i) => {
              const assignmentKey = getAssignmentKey(a);

              return (
              <div key={assignmentKey} className={`animate-fade-slide-up delay-${200 + i * 60}`}>
                <Card
                  className={`rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 glass dark:bg-slate-800/70 overflow-hidden group hover:-translate-y-0.5 ${
                    a.status === "Pending" ? "accent-pending" : "accent-submitted"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start gap-4">

                      {/* Left info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${
                            a.status === "Submitted"
                              ? "bg-green-100 dark:bg-green-900/40"
                              : "bg-orange-100 dark:bg-orange-900/40"
                          }`}>
                            <FileText className={`h-4 w-4 ${
                              a.status === "Submitted"
                                ? "text-green-600 dark:text-green-400"
                                : "text-orange-600 dark:text-orange-400"
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{a.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{a.subject}</p>
                          </div>
                        </div>

                        {a.description && (
                          <p className="text-sm text-slate-400 dark:text-slate-500 line-clamp-1 pl-[3.25rem]">
                            {a.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 pl-[3.25rem]">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Due: {formatDueDate(a.dueDate)}
                          </div>
                          {a.priority === "high" && (
                            <div className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                              <AlertCircle className="h-3 w-3" /> Urgent
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: status + actions */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <Badge className={`font-bold text-xs border-0 ${
                          a.status === "Submitted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                        }`}>
                          {a.status === "Submitted" ? "✓ " : "⏳ "}{a.status}
                        </Badge>

                        <div className="flex items-center gap-1.5">
                          {a.status === "Pending" && (
                            <button
                              onClick={() => handleSubmit(assignmentKey)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/50 hover:scale-105 active:scale-95 transition-all"
                            >
                              <Upload className="h-3 w-3" /> Submit
                            </button>
                          )}
                          <button
                            onClick={() => setEditingAssignment(a)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(assignmentKey)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>
            )})}
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-fade-slide-up delay-500">
              <div
                className="grad-orange rounded-3xl p-5 shadow-xl"
                style={{ boxShadow: "0 12px 32px -8px rgba(249,115,22,0.35)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-white/50" />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Pending Assignments</p>
                <h2 className="text-5xl font-black text-white">{pending}</h2>
              </div>
            </div>
            <div className="animate-fade-slide-up delay-550">
              <div
                className="grad-green rounded-3xl p-5 shadow-xl"
                style={{ boxShadow: "0 12px 32px -8px rgba(16,185,129,0.35)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-white/50" />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Submitted Assignments</p>
                <h2 className="text-5xl font-black text-white">{submitted}</h2>
              </div>
            </div>
          </div>

        </div>
      </SidebarInset>

      {editingAssignment && (
        <EditModal assignment={editingAssignment} onSave={handleSave} onClose={() => setEditingAssignment(null)} />
      )}
      {showAddModal && (
        <AddModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
    </SidebarProvider>
  );
}

export default Assignments;
