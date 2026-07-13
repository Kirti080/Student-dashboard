import { type FormEvent, useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import axiosConfig from "@/api/axiosConfig";

import {
  BookOpen,
  Clock,
  Plus,
  User,
  X,
} from "lucide-react";

type Course = {
  _id?: string;
  name: string;
  faculty: string;
  progress: number;
  credits: number;
};

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    faculty: "",
    progress: "0",
    credits: "3",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosConfig.get<{ courses: Course[] }>("/courses");

        setCourses(response.data.courses);
      } catch (error) {
        console.error("Fetch courses error:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await axiosConfig.post<{ course: Course }>("/courses", {
        name: form.name,
        faculty: form.faculty,
        progress: Number(form.progress),
        credits: Number(form.credits),
      });

      setCourses((currentCourses) => [response.data.course, ...currentCourses]);
      setForm({
        name: "",
        faculty: "",
        progress: "0",
        credits: "3",
      });
      setOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      setError(axiosError.response?.data?.message || "Could not create course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-3 sm:p-4 lg:p-6">

          {/* Header */}
 <PageHeader
  title="Courses"
  subtitle="Courses you have Enrolled"
/>

          {/* Hero Card */}

          <Card className="rounded-3xl border-0 shadow-lg mb-8 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold">
                  {courses.length} Active Courses
                </h2>

                <p className="mt-2 text-blue-100">
                  Track progress, credits and faculty information.
                </p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-11 w-full gap-2 bg-white text-blue-700 hover:bg-blue-50 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Create Course
                  </Button>
                </DialogTrigger>

                <DialogContent
                  showCloseButton={false}
                  className="overflow-hidden rounded-3xl bg-white p-0 text-slate-900 shadow-2xl sm:max-w-xl"
                >
                  <DialogHeader className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-6">
                    <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />

                    <DialogClose asChild>
                      <button
                        type="button"
                        className="absolute right-5 top-5 z-10 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </button>
                    </DialogClose>

                    <div className="relative flex items-center gap-4">
                      <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
                        <Plus className="h-6 w-6 text-white" />
                      </div>

                      <div>
                        <DialogTitle className="text-2xl font-black text-white">
                          Create Course
                        </DialogTitle>
                        <p className="text-sm font-medium text-blue-100">
                          Add a new course to your dashboard
                        </p>
                      </div>
                    </div>
                  </DialogHeader>

                  <form className="space-y-5 p-6" onSubmit={handleCreateCourse}>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">
                        Course Name *
                      </label>
                      <Input
                        placeholder="Course name"
                        value={form.name}
                        onChange={(event) =>
                          setForm({ ...form, name: event.target.value })
                        }
                        className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">
                        Faculty Name *
                      </label>
                      <Input
                        placeholder="Faculty name"
                        value={form.faculty}
                        onChange={(event) =>
                          setForm({ ...form, faculty: event.target.value })
                        }
                        className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          Progress
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={form.progress}
                          onChange={(event) =>
                            setForm({ ...form, progress: event.target.value })
                          }
                          className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          Credits *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="3"
                          value={form.credits}
                          onChange={(event) =>
                            setForm({ ...form, credits: event.target.value })
                          }
                          className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-base focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {error}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="h-12 flex-1 rounded-xl border-2 border-slate-200 bg-white text-base font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        className="h-12 flex-1 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
                        disabled={
                          saving ||
                          !form.name.trim() ||
                          !form.faculty.trim() ||
                          !form.credits
                        }
                      >
                        <Plus className="h-4 w-4" />
                        {saving ? "Creating..." : "Create Course"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Courses Grid */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.length === 0 && (
              <Card className="rounded-3xl border-0 shadow-md md:col-span-2 xl:col-span-3">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                    <BookOpen className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    No courses yet
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Create your first course to start tracking progress here.
                  </p>
                </CardContent>
              </Card>
            )}

            {courses.map((course) => (
              <Card
                key={course._id || course.name}
                className="
                  rounded-3xl
                  border-0
                  shadow-md
                  hover:shadow-xl
                  transition-all
                "
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <BookOpen className="h-8 w-8 text-blue-600" />

                    <Badge>
                      {course.credits} Credits
                    </Badge>
                  </div>

                  <CardTitle className="text-lg mt-3">
                    {course.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    {course.faculty}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2 text-sm font-medium">
                      <span>Progress</span>

                      <span>
                        {course.progress}%
                      </span>
                    </div>

                    <Progress
                      value={course.progress}
                      className="h-3"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    Semester Ongoing
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Courses;
