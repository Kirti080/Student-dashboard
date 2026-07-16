import type { AdminQuery, AdminRecord, AdminResource } from "@/services/adminService";

export const ADMIN_LIST_REQUEST = "ADMIN_LIST_REQUEST" as const;
export const ADMIN_LIST_SUCCESS = "ADMIN_LIST_SUCCESS" as const;
export const ADMIN_LIST_FAILURE = "ADMIN_LIST_FAILURE" as const;

export type AdminState = {
  resource: AdminResource;
  records: AdminRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  loading: boolean;
  error: string | null;
};

export type AdminAction =
  | { type: typeof ADMIN_LIST_REQUEST; payload: { resource: AdminResource; query: AdminQuery } }
  | { type: typeof ADMIN_LIST_SUCCESS; payload: { resource: AdminResource; records: AdminRecord[]; pagination: AdminState["pagination"] } }
  | { type: typeof ADMIN_LIST_FAILURE; payload: string };
