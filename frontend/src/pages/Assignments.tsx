import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
} from "lucide-react";
import axiosConfig from "@/api/axiosConfig";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Assignment = {
  _id: string;
  title: string;
  subject: string;
  program: string;
  dueDate?: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "Active" | "Closed";
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No due date";

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosConfig
      .get<{ assignments: Assignment[] }>("/assignments")
      .then((response) => setAssignments(response.data.assignments))
      .catch((requestError) =>
        setError(
          axios.isAxiosError<{ message?: string }>(requestError)
            ? requestError.response?.data?.message ||
                "Unable to load assignments"
            : "Unable to load assignments",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const activeCount = useMemo(
    () => assignments.filter(({ status }) => status === "Active").length,
    [assignments],
  );

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/40 to-amber-100/60 p-3 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950 sm:p-5 lg:p-6">
          <PageHeader
            title="Assignments"
            subtitle="Academic work assigned to your program"
          />

          <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 p-6 text-white shadow-2xl">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-orange-100">
                  Program assignments
                </p>
                <h2 className="mt-1 text-3xl font-black">
                  {activeCount} Active Assignments
                </h2>
                <p className="mt-2 text-orange-100">
                  Deadlines and details are maintained by your administrator.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">
                <LockKeyhole className="h-5 w-5" />
                <div>
                  <p className="text-sm font-bold">Read-only access</p>
                  <p className="text-xs text-orange-100">Admin controlled</p>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-10 text-center text-slate-500">
                Loading assignments...
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-10 text-center font-semibold text-red-600">
                {error}
              </CardContent>
            </Card>
          ) : assignments.length === 0 ? (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-10 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-orange-400" />
                <h3 className="mt-3 text-lg font-black">
                  No assignments available
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Assignments will appear after an administrator adds them to
                  your program.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className="overflow-hidden rounded-3xl border-0 shadow-lg"
                >
                  <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className={`shrink-0 rounded-2xl p-3 ${
                          assignment.status === "Closed"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/40"
                            : "bg-orange-100 text-orange-600 dark:bg-orange-900/40"
                        }`}
                      >
                        {assignment.status === "Closed" ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <ClipboardList className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {assignment.title}
                          </h3>
                          <Badge variant="secondary">
                            {assignment.subject}
                          </Badge>
                        </div>
                        {assignment.description && (
                          <p className="mt-2 text-sm text-slate-500">
                            {assignment.description}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(assignment.dueDate)}
                          </span>
                          <span>{assignment.program}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {assignment.priority === "high" && (
                        <Badge className="gap-1 bg-red-50 text-red-600 hover:bg-red-50">
                          <AlertCircle className="h-3 w-3" /> High priority
                        </Badge>
                      )}
                      <Badge
                        className={
                          assignment.status === "Closed"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
