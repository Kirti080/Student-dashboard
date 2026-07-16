import type { AdminQuery, AdminResource } from "@/services/adminService";
import { ADMIN_LIST_REQUEST } from "./adminTypes";

export const adminListRequest = (resource: AdminResource, query: AdminQuery = {}) => ({
  type: ADMIN_LIST_REQUEST,
  payload: { resource, query },
} as const);
