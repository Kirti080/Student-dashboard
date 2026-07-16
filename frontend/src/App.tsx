import { Routes, Route } from "react-router-dom";
import Create from "./pages/Create";
import Sign from "./pages/SignIn";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Results from "./pages/Results";
import Attendance from "./pages/Attendance";
import Settings from "./pages/Settings";
import { AdminRoute, StudentRoute } from "./components/RoleRoutes";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResourcePage from "./pages/admin/AdminResourcePage";
import AdminSettings from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Sign />} />
      <Route path="/Create" element={<Create />} />
      <Route
        path="/dashboard"
        element={
          <StudentRoute>
            <Dashboard />
          </StudentRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <StudentRoute>
            <Courses />
          </StudentRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <StudentRoute>
            <Assignments />
          </StudentRoute>
        }
      />
      <Route
        path="/results"
        element={
          <StudentRoute>
            <Results />
          </StudentRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <StudentRoute>
            <Attendance />
          </StudentRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <StudentRoute>
            <Settings />
          </StudentRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      {(
        [
          "students",
          "courses",
          "assignments",
          "progress",
          "attendance",
          "results",
        ] as const
      ).map((resource) => (
        <Route
          key={resource}
          path={`/admin/${resource}`}
          element={
            <AdminRoute>
              <AdminResourcePage resource={resource} />
            </AdminRoute>
          }
        />
      ))}
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
