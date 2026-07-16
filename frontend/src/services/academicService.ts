import axiosConfig from "@/api/axiosConfig";

export type CourseRef = {
  _id: string;
  name: string;
  faculty?: string;
  credits?: number;
  progress?: number;
  program?: string;
};
export type AttendanceRecord = {
  _id: string;
  course: CourseRef;
  date: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  remarks?: string;
};
export type ResultRecord = {
  _id: string;
  course: CourseRef;
  examType: string;
  marksObtained: number;
  maximumMarks: number;
  grade?: string;
  remarks?: string;
};
export type StudentDashboardData = {
  profile: { name: string; program: string; semester: string };
  summary: {
    averageResult: number;
    attendance: number;
    credits: number;
    pendingAssignments: number;
  };
  courses: CourseRef[];
  assignments: Array<{
    _id: string;
    title: string;
    subject: string;
    dueDate?: string;
    status: string;
    priority: string;
  }>;
  attendance: AttendanceRecord[];
  results: ResultRecord[];
};

export const getStudentDashboard = async () =>
  (await axiosConfig.get<{ data: StudentDashboardData }>("/dashboard")).data
    .data;
export const getAttendance = async () =>
  (
    await axiosConfig.get<{
      data: AttendanceRecord[];
      summary: { total: number; attended: number; percentage: number };
    }>("/attendance")
  ).data;
export const getResults = async () =>
  (await axiosConfig.get<{ data: ResultRecord[] }>("/results")).data.data;
