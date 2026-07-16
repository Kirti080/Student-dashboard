import axiosConfig from "@/api/axiosConfig";

export type AdminResource =
  | "students"
  | "courses"
  | "assignments"
  | "progress"
  | "attendance"
  | "results";
export type AdminRecord = Record<string, unknown> & { _id: string };
export type AdminQuery = {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | undefined;
};
export type PageResponse = {
  data: AdminRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

export const fetchAdminPage = async (
  resource: AdminResource,
  query: AdminQuery,
) =>
  (
    await axiosConfig.get<PageResponse>(`/admin/${resource}`, {
      params: query,
    })
  ).data;

export const saveAdminRecord = async (
  resource: AdminResource,
  values: Record<string, unknown>,
  id?: string,
) =>
  (
    await (id
      ? axiosConfig.put(`/admin/${resource}/${id}`, values)
      : axiosConfig.post(`/admin/${resource}`, values))
  ).data;

export const deleteAdminRecord = async (resource: AdminResource, id: string) =>
  (await axiosConfig.delete(`/admin/${resource}/${id}`)).data;

export const updateStudentStatus = async (id: string, isActive: boolean) =>
  (await axiosConfig.patch(`/admin/students/${id}/status`, { isActive })).data;

export const fetchAdminDashboard = async () =>
  (await axiosConfig.get("/admin/dashboard")).data.data;
