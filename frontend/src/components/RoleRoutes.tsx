import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/reducers";
import AIChatAssistant from "@/components/AIChatAssistant";

function Guard({ children, role }: { children: ReactNode; role: "student" | "admin" }) {
  const location = useLocation();
  const auth = useSelector((state: RootState) => state.auth);
  if (!auth.isAuthenticated) return <Navigate to="/" replace state={{ from: location }} />;
  if (role === "admin" && auth.user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (role === "student" && auth.user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <>{children}{role === "student" && <AIChatAssistant />}</>;
}

export const StudentRoute = ({ children }: { children: ReactNode }) => <Guard role="student">{children}</Guard>;
export const AdminRoute = ({ children }: { children: ReactNode }) => <Guard role="admin">{children}</Guard>;
