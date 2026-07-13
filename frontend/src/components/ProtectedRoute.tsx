import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/reducers";
import AIChatAssistant from "@/components/AIChatAssistant";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <>
      {children}
      <AIChatAssistant />
    </>
  );
}

export default ProtectedRoute;
