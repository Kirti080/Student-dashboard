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

import {
  Award,
  Trophy,
  GraduationCap,
} from "lucide-react";

function Results() {
  const results = [
    {
      subject: "Operating Systems",
      marks: 88,
      grade: "A",
    },
    {
      subject: "Data Mining",
      marks: 84,
      grade: "A",
    },
    {
      subject: "Cyber Security",
      marks: 90,
      grade: "A+",
    },
    {
      subject: "Software Engineering",
      marks: 86,
      grade: "A",
    },
    {
      subject: "Computer Graphics",
      marks: 94,
      grade: "A+",
    },
    {
      subject: "Artificial Intelligence",
      marks: 91,
      grade: "A+",
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-3 sm:p-4 lg:p-6">

          {/* Header */}
          <PageHeader
            title="Results"
            subtitle="Academic performance overview"
          />

          {/* Hero Card */}

          <Card className="rounded-3xl border-0 shadow-lg mb-8 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold">
                Semester 6 Results
              </h2>

              <p className="mt-2 text-blue-100">
                Great work! Keep improving your academic performance.
              </p>

              <div className="flex gap-3 mt-5">
                <Badge className="bg-white text-blue-700 hover:bg-white">
                  CGPA 8.5
                </Badge>

                <Badge className="bg-white text-blue-700 hover:bg-white">
                  Rank Top 10%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}

          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">
                    CGPA
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    8.5
                  </h2>
                </div>

                <GraduationCap className="h-10 w-10 text-blue-600" />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">
                    Subjects
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    6
                  </h2>
                </div>

                <Award className="h-10 w-10 text-purple-600" />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">
                    Highest Score
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    94
                  </h2>
                </div>

                <Trophy className="h-10 w-10 text-yellow-500" />
              </CardContent>
            </Card>

          </div>

          {/* Results Table */}

          <Card className="rounded-3xl border-0 shadow-md">
            <CardHeader>
              <CardTitle>
                Subject Wise Results
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.subject}
                  className="
                    flex
                    justify-between
                    items-center
                    p-4
                    rounded-xl
                    bg-slate-50
                  "
                >
                  <div>
                    <h3 className="font-semibold">
                      {result.subject}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Marks Obtained
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {result.marks}
                    </Badge>

                    <Badge
                      className="
                        bg-green-100
                        text-green-700
                        hover:bg-green-100
                      "
                    >
                      {result.grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Results;
