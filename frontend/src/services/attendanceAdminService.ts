import axiosConfig from "@/api/axiosConfig";
import type { CourseRef } from "@/services/academicService";

export type RegisterStudent = {
  _id: string;
  name: string;
  rollNo?: string;
  email: string;
  program: string;
  semester?: string;
  isActive?: boolean;
};

export type RegisterRecord = {
  student: string;
  status: "Present" | "Absent";
  remarks: string;
  studentDetails: RegisterStudent;
};

export type AttendanceSession = {
  _id: string;
  course: CourseRef;
  program: string;
  date: string;
  markedBy?: { _id: string; name: string };
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  status: "submitted";
  createdAt: string;
  records?: Array<{
    _id: string;
    student: RegisterStudent;
    status: "Present" | "Absent";
    remarks?: string;
  }>;
};

export type AttendanceDashboardSummary = {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  percentage: number;
  sessionsToday: number;
};

export const getAttendanceDashboardSummary = async () =>
  (
    await axiosConfig.get<{ data: AttendanceDashboardSummary }>(
      "/admin/attendance-sessions/summary",
    )
  ).data.data;

export const getRegisterStudents = async (course: string) =>
  (
    await axiosConfig.get<{
      data: { course: CourseRef; students: RegisterStudent[] };
    }>("/admin/attendance-sessions/register-students", {
      params: { course },
    })
  ).data.data;

export const getAttendanceSessions = async (params: {
  page?: number;
  limit?: number;
  course?: string;
  date?: string;
}) =>
  (
    await axiosConfig.get<{
      data: AttendanceSession[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>("/admin/attendance-sessions", { params })
  ).data;

export const getAttendanceSession = async (id: string) =>
  (
    await axiosConfig.get<{ data: AttendanceSession }>(
      `/admin/attendance-sessions/${id}`,
    )
  ).data.data;

export const saveAttendanceSession = async (
  values: {
    course: string;
    date: string;
    records: Array<{
      student: string;
      status: "Present" | "Absent";
      remarks: string;
    }>;
  },
  id?: string,
) =>
  (
    await (id
      ? axiosConfig.put(`/admin/attendance-sessions/${id}`, values)
      : axiosConfig.post("/admin/attendance-sessions", values))
  ).data;
