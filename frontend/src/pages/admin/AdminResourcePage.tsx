import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminListRequest } from "@/redux/admin/adminActions";
import type { RootState } from "@/redux/reducers";
import {
  deleteAdminRecord,
  fetchAdminPage,
  saveAdminRecord,
  type AdminRecord,
  type AdminResource,
} from "@/services/adminService";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  academicPrograms,
  academicSemesters,
} from "@/constants/academicPrograms";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "password" | "checkbox";
  options?: string[];
  relation?: "students" | "courses";
  required?: boolean;
};
type Config = {
  title: string;
  subtitle: string;
  singular: string;
  fields: Field[];
  columns: { label: string; value: (record: AdminRecord) => string }[];
};
const text = (value: unknown) =>
  value === null || value === undefined || value === "" ? "—" : String(value);
const relation = (record: AdminRecord, key: string) =>
  record[key] && typeof record[key] === "object"
    ? (record[key] as Record<string, unknown>)
    : {};

const configs: Record<AdminResource, Config> = {
  students: {
    title: "Students",
    subtitle: "Manage student accounts and access",
    singular: "Student",
    fields: [
      { name: "name", label: "Full name", required: true },
      { name: "email", label: "Email", required: true },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
      },
      { name: "phone", label: "Phone" },
      {
        name: "program",
        label: "Program",
        type: "select",
        options: [...academicPrograms],
        required: true,
      },
      {
        name: "semester",
        label: "Semester",
        type: "select",
        options: [...academicSemesters],
        required: true,
      },
      { name: "rollNo", label: "Roll number" },
      { name: "isActive", label: "Active account", type: "checkbox" },
    ],
    columns: [
      { label: "Student", value: (r) => text(r.name) },
      { label: "Email", value: (r) => text(r.email) },
      { label: "Program", value: (r) => text(r.program) },
      { label: "Semester", value: (r) => text(r.semester) },
      {
        label: "Status",
        value: (r) => (r.isActive === false ? "Inactive" : "Active"),
      },
    ],
  },
  courses: {
    title: "Courses",
    subtitle: "Assign courses to academic programs",
    singular: "Course",
    fields: [
      {
        name: "program",
        label: "Program",
        type: "select",
        options: [...academicPrograms],
        required: true,
      },
      { name: "name", label: "Course name", required: true },
      { name: "faculty", label: "Faculty", required: true },
    ],
    columns: [
      { label: "Course", value: (r) => text(r.name) },
      { label: "Faculty", value: (r) => text(r.faculty) },
      { label: "Program", value: (r) => text(r.program) },
    ],
  },
  assignments: {
    title: "Assignments",
    subtitle: "Assign academic work by program",
    singular: "Assignment",
    fields: [
      {
        name: "program",
        label: "Program",
        type: "select",
        options: [...academicPrograms],
        required: true,
      },
      { name: "title", label: "Title", required: true },
      { name: "subject", label: "Subject", required: true },
      { name: "dueDate", label: "Due date", type: "date" },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: ["high", "medium", "low"],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Closed"],
      },
      { name: "description", label: "Description" },
    ],
    columns: [
      { label: "Assignment", value: (r) => text(r.title) },
      { label: "Subject", value: (r) => text(r.subject) },
      { label: "Program", value: (r) => text(r.program) },
      {
        label: "Due",
        value: (r) =>
          r.dueDate ? new Date(String(r.dueDate)).toLocaleDateString() : "—",
      },
      { label: "Status", value: (r) => text(r.status) },
    ],
  },
  progress: {
    title: "Progress & Credits",
    subtitle: "Manage course progress and credits for each student",
    singular: "Progress Record",
    fields: [
      {
        name: "student",
        label: "Student",
        type: "select",
        relation: "students",
        required: true,
      },
      {
        name: "course",
        label: "Course",
        type: "select",
        relation: "courses",
        required: true,
      },
      {
        name: "progress",
        label: "Progress %",
        type: "number",
        required: true,
      },
      {
        name: "credits",
        label: "Earned credits",
        type: "number",
        required: true,
      },
    ],
    columns: [
      { label: "Student", value: (r) => text(relation(r, "student").name) },
      { label: "Course", value: (r) => text(relation(r, "course").name) },
      {
        label: "Program",
        value: (r) => text(relation(r, "course").program),
      },
      { label: "Progress", value: (r) => `${text(r.progress)}%` },
      { label: "Credits", value: (r) => text(r.credits) },
    ],
  },
  attendance: {
    title: "Attendance",
    subtitle: "Record and review attendance",
    singular: "Attendance",
    fields: [
      {
        name: "student",
        label: "Student",
        type: "select",
        relation: "students",
        required: true,
      },
      {
        name: "course",
        label: "Course",
        type: "select",
        relation: "courses",
        required: true,
      },
      { name: "date", label: "Date", type: "date", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Present", "Absent", "Late", "Excused"],
        required: true,
      },
      { name: "remarks", label: "Remarks" },
    ],
    columns: [
      { label: "Student", value: (r) => text(relation(r, "student").name) },
      { label: "Course", value: (r) => text(relation(r, "course").name) },
      {
        label: "Date",
        value: (r) => new Date(String(r.date)).toLocaleDateString(),
      },
      { label: "Status", value: (r) => text(r.status) },
      { label: "Remarks", value: (r) => text(r.remarks) },
    ],
  },
  results: {
    title: "Results",
    subtitle: "Manage marks and publication",
    singular: "Result",
    fields: [
      {
        name: "student",
        label: "Student",
        type: "select",
        relation: "students",
        required: true,
      },
      {
        name: "course",
        label: "Course",
        type: "select",
        relation: "courses",
        required: true,
      },
      { name: "examType", label: "Exam type", required: true },
      {
        name: "marksObtained",
        label: "Marks obtained",
        type: "number",
        required: true,
      },
      {
        name: "maximumMarks",
        label: "Maximum marks",
        type: "number",
        required: true,
      },
      { name: "grade", label: "Grade" },
      { name: "published", label: "Published", type: "checkbox" },
      { name: "remarks", label: "Remarks" },
    ],
    columns: [
      { label: "Student", value: (r) => text(relation(r, "student").name) },
      { label: "Course", value: (r) => text(relation(r, "course").name) },
      { label: "Exam", value: (r) => text(r.examType) },
      {
        label: "Marks",
        value: (r) => `${text(r.marksObtained)}/${text(r.maximumMarks)}`,
      },
      { label: "Grade", value: (r) => text(r.grade) },
      { label: "Status", value: (r) => (r.published ? "Published" : "Draft") },
    ],
  },
};

export default function AdminResourcePage({
  resource,
}: {
  resource: AdminResource;
}) {
  const config = configs[resource];
  const dispatch = useDispatch();
  const admin = useSelector((state: RootState) => state.admin);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [filters, setFilters] = useState({
    program: "",
    semester: "",
    status: "",
    priority: "",
  });
  const debouncedProgram = useDebouncedValue(filters.program);
  const debouncedSemester = useDebouncedValue(filters.semester);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [students, setStudents] = useState<AdminRecord[]>([]);
  const [courses, setCourses] = useState<AdminRecord[]>([]);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const filterQuery = useMemo(
    () => ({
      program: debouncedProgram || undefined,
      semester: debouncedSemester || undefined,
      ...(resource === "results"
        ? { published: filters.status || undefined }
        : { status: filters.status || undefined }),
      priority: filters.priority || undefined,
    }),
    [
      debouncedProgram,
      debouncedSemester,
      filters.priority,
      filters.status,
      resource,
    ],
  );
  useEffect(() => {
    dispatch(
      adminListRequest(resource, {
        page,
        limit: 10,
        search: debouncedSearch,
        ...filterQuery,
      }),
    );
  }, [debouncedSearch, dispatch, filterQuery, page, resource]);
  useEffect(() => {
    if (["progress", "attendance", "results"].includes(resource))
      fetchAdminPage("students", { limit: 100 }).then((response) =>
        setStudents(response.data),
      );
    if (["progress", "attendance", "results"].includes(resource))
      fetchAdminPage("courses", { limit: 100 }).then((response) =>
        setCourses(response.data),
      );
  }, [resource]);

  const filteredCourses = useMemo(() => {
    if (!form.student) return [];
    const student = students.find(
      (record) => String(record._id) === String(form.student),
    );
    return courses.filter(
      (course) => String(course.program) === String(student?.program),
    );
  }, [courses, form.student, students]);

  const startCreate = () => {
    setFormError("");
    setEditing(null);
    setForm({
      status:
        resource === "assignments"
          ? "Active"
          : resource === "attendance"
            ? "Present"
            : undefined,
      priority: "medium",
      published: false,
    });
    setOpen(true);
  };
  const startEdit = (record: AdminRecord) => {
    setFormError("");
    const values = { ...record };
    ["user", "student", "course"].forEach((key) => {
      if (values[key] && typeof values[key] === "object")
        values[key] = (values[key] as Record<string, unknown>)._id;
    });
    if (values.dueDate) values.dueDate = String(values.dueDate).slice(0, 10);
    if (values.date) values.date = String(values.date).slice(0, 10);
    delete values.password;
    setEditing(record);
    setForm(values);
    setOpen(true);
  };
  const reload = () =>
    dispatch(
      adminListRequest(resource, {
        page,
        limit: 10,
        search: debouncedSearch,
        ...filterQuery,
      }),
    );
  const save = async () => {
    setSaving(true);
    setNotice("");
    setFormError("");
    try {
      await saveAdminRecord(resource, form, editing?._id);
      setOpen(false);
      setNotice(`${config.singular} saved successfully`);
      reload();
    } catch (error) {
      setFormError(
        axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Unable to save record"
          : error instanceof Error
            ? error.message
            : "Unable to save record",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async (record: AdminRecord) => {
    try {
      await deleteAdminRecord(resource, record._id);
      setNotice(`${config.singular} deleted`);
      reload();
    } catch {
      setNotice("Unable to delete record");
    }
  };

  return (
    <AdminLayout title={config.title} subtitle={config.subtitle}>
      <Card className="mb-6 overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-xl">
        <CardContent className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-blue-100">Admin management</p>
            <h2 className="text-2xl font-black">{config.title}</h2>
          </div>
          <Button
            onClick={startCreate}
            className="rounded-xl bg-white font-bold text-blue-700 hover:bg-blue-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {config.singular}
          </Button>
        </CardContent>
      </Card>
      <Card className="mb-5 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={`Search ${config.title.toLowerCase()}...`}
                className="h-12 rounded-2xl bg-slate-50 pl-12"
              />
            </div>
            <select
              value={filters.program}
              onChange={(event) => {
                setFilters((value) => ({
                  ...value,
                  program: event.target.value,
                }));
                setPage(1);
              }}
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4"
            >
              <option value="">All programs</option>
              {academicPrograms.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
            {!(["courses", "assignments"] as AdminResource[]).includes(
              resource,
            ) && (
              <select
                value={filters.semester}
                onChange={(event) => {
                  setFilters((value) => ({
                    ...value,
                    semester: event.target.value,
                  }));
                  setPage(1);
                }}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4"
              >
                <option value="">All semesters</option>
                {academicSemesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            )}
            {(
              [
                "students",
                "assignments",
                "attendance",
                "results",
              ] as AdminResource[]
            ).includes(resource) && (
              <select
                value={filters.status}
                onChange={(event) => {
                  setFilters((value) => ({
                    ...value,
                    status: event.target.value,
                  }));
                  setPage(1);
                }}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-3"
              >
                <option value="">All statuses</option>
                {resource === "students" ? (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </>
                ) : resource === "assignments" ? (
                  <>
                    <option>Active</option>
                    <option>Closed</option>
                  </>
                ) : resource === "attendance" ? (
                  <>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                    <option>Excused</option>
                  </>
                ) : (
                  <>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </>
                )}
              </select>
            )}
          </div>
          {resource === "assignments" && (
            <select
              value={filters.priority}
              onChange={(event) => {
                setFilters((value) => ({
                  ...value,
                  priority: event.target.value,
                }));
                setPage(1);
              }}
              className="mt-3 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3"
            >
              <option value="">All priorities</option>
              <option>high</option>
              <option>medium</option>
              <option>low</option>
            </select>
          )}
          {notice && (
            <p className="mt-3 text-sm font-semibold text-blue-600">{notice}</p>
          )}
        </CardContent>
      </Card>
      <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-100/80 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.label} className="px-5 py-4 font-bold">
                    {column.label}
                  </th>
                ))}
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admin.loading ? (
                <tr>
                  <td
                    colSpan={config.columns.length + 1}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading records…
                  </td>
                </tr>
              ) : admin.error ? (
                <tr>
                  <td
                    colSpan={config.columns.length + 1}
                    className="px-5 py-12 text-center text-red-600"
                  >
                    {admin.error}
                  </td>
                </tr>
              ) : admin.records.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.columns.length + 1}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                admin.records.map((record) => (
                  <tr
                    key={record._id}
                    className="bg-white transition hover:bg-blue-50/60 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    {config.columns.map((column) => (
                      <td
                        key={column.label}
                        className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200"
                      >
                        {["Status", "Grade"].includes(column.label) ? (
                          <Badge variant="secondary">
                            {column.value(record)}
                          </Badge>
                        ) : (
                          column.value(record)
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => startEdit(record)}
                          className="rounded-xl text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => remove(record)}
                          className="rounded-xl border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-4">
          <p className="text-sm text-slate-500">
            {admin.pagination.total} total records
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {Math.max(1, admin.pagination.totalPages)}
            </span>
            <Button
              size="icon"
              variant="outline"
              disabled={page >= admin.pagination.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] gap-0 overflow-hidden rounded-3xl bg-white p-0 text-slate-900 shadow-2xl sm:max-w-2xl"
        >
          <DialogHeader className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-6 text-left">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 right-24 h-32 w-32 rounded-full bg-white/5" />
            <DialogClose asChild>
              <button
                type="button"
                className="absolute right-5 top-5 z-10 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogClose>
            <div className="relative flex items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
                {editing ? (
                  <Pencil className="h-6 w-6 text-white" />
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-white">
                  {editing ? "Edit" : "Add"} {config.singular}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm font-medium text-blue-100">
                  {editing
                    ? `Update this ${config.singular.toLowerCase()} record.`
                    : `Add a new ${config.singular.toLowerCase()} to the portal.`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form
            className="overflow-y-auto p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {config.fields
                .filter((field) => !(editing && field.name === "password"))
                .map((field) => (
                  <label
                    key={field.name}
                    className={
                      field.name === "description" || field.name === "remarks"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    {field.type === "checkbox" ? (
                      <span className="flex h-12 cursor-pointer items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 px-4 transition hover:border-blue-300">
                        <span className="text-sm font-bold text-slate-700">
                          {field.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(form[field.name])}
                          onChange={(event) =>
                            setForm((value) => ({
                              ...value,
                              [field.name]: event.target.checked,
                            }))
                          }
                          className="h-5 w-5 rounded accent-blue-600"
                        />
                      </span>
                    ) : (
                      <>
                        <span className="mb-2 block text-sm font-bold text-slate-700">
                          {field.label}
                          {field.required ? " *" : ""}
                        </span>
                        {field.type === "select" ? (
                          <select
                            required={field.required}
                            value={
                              text(form[field.name]) === "—"
                                ? ""
                                : String(form[field.name])
                            }
                            onChange={(event) =>
                              setForm((value) => ({
                                ...value,
                                [field.name]: event.target.value,
                                ...(field.name === "student"
                                  ? { course: "" }
                                  : {}),
                              }))
                            }
                            className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="">
                              Select {field.label.toLowerCase()}
                            </option>
                            {field.relation === "students"
                              ? students.map((record) => (
                                  <option key={record._id} value={record._id}>
                                    {text(record.name)} ({text(record.rollNo)})
                                  </option>
                                ))
                              : field.relation === "courses"
                                ? filteredCourses.map((record) => (
                                    <option key={record._id} value={record._id}>
                                      {text(record.name)}
                                    </option>
                                  ))
                                : field.options?.map((option) => (
                                    <option key={option}>{option}</option>
                                  ))}
                          </select>
                        ) : (
                          <Input
                            required={
                              field.required &&
                              !(editing && field.name === "password")
                            }
                            type={field.type || "text"}
                            value={
                              form[field.name] === undefined
                                ? ""
                                : String(form[field.name])
                            }
                            onChange={(event) =>
                              setForm((value) => ({
                                ...value,
                                [field.name]:
                                  field.type === "number"
                                    ? Number(event.target.value)
                                    : event.target.value,
                              }))
                            }
                            className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base text-slate-900 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                          />
                        )}
                      </>
                    )}
                  </label>
                ))}
            </div>

            {formError && (
              <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {formError}
              </p>
            )}

            <DialogFooter className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-12 rounded-xl border-2 border-slate-200 bg-white text-base font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-12 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
              >
                {editing ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : `Add ${config.singular}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
