import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, LockKeyhole, UserRound } from "lucide-react";
import axios from "axios";
import axiosConfig from "@/api/axiosConfig";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Course = {
  _id: string;
  name: string;
  faculty: string;
  credits: number;
  progress: number;
  program: string;
};

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosConfig
      .get<{ courses: Course[] }>("/courses")
      .then((response) => setCourses(response.data.courses))
      .catch((requestError) =>
        setError(
          axios.isAxiosError<{ message?: string }>(requestError)
            ? requestError.response?.data?.message || "Unable to load courses"
            : "Unable to load courses",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const totalCredits = courses.reduce(
    (sum, course) => sum + (course.credits || 0),
    0,
  );

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-3 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:p-5 lg:p-6">
          <PageHeader
            title="Courses"
            subtitle="Courses assigned to your academic program"
          />

          <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-2xl">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-blue-100">
                  Program curriculum
                </p>
                <h2 className="mt-1 text-3xl font-black">
                  {courses.length} Assigned Courses
                </h2>
                <p className="mt-2 text-blue-100">
                  These courses are managed by your administrator.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">
                <LockKeyhole className="h-5 w-5" />
                <div>
                  <p className="text-sm font-bold">Read-only access</p>
                  <p className="text-xs text-blue-100">Admin controlled</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total courses</p>
                  <p className="text-2xl font-black">{courses.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/40">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total credits</p>
                  <p className="text-2xl font-black">{totalCredits}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-10 text-center text-slate-500">
                Loading courses...
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-10 text-center font-semibold text-red-600">
                {error}
              </CardContent>
            </Card>
          ) : courses.length === 0 ? (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-10 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-blue-400" />
                <h3 className="mt-3 text-lg font-black">No courses assigned</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Courses will appear here after an administrator adds them to
                  your program.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course._id}
                  className="overflow-hidden rounded-3xl border-0 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/40 dark:text-blue-200">
                        {course.credits} credits
                      </Badge>
                    </div>
                    <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                      {course.name}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <UserRound className="h-4 w-4 text-blue-500" />
                      {course.faculty}
                    </div>
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{
                            width: `${Math.min(100, Math.max(0, course.progress))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {course.program}
                    </p>
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
