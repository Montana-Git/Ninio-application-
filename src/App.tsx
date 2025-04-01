import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Lazy load pages for better performance
const LoginPage = lazy(() => import("./pages/auth/login"));
const RegisterPage = lazy(() => import("./pages/auth/register"));
const ParentDashboard = lazy(() => import("./pages/dashboard/parent"));
const ParentProfilePage = lazy(
  () => import("./pages/dashboard/parent/profile"),
);
const AdminDashboard = lazy(() => import("./pages/dashboard/admin"));
const AdminProfilePage = lazy(() => import("./pages/dashboard/admin/profile"));
const ProgramsPage = lazy(() => import("./pages/programs"));

// Protected route component
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: string;
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate
        to={user.role === "admin" ? "/dashboard/admin" : "/dashboard/parent"}
        replace
      />
    );
  }

  return children;
};

function App() {
  return (
    <NotificationProvider>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center">
            <p>Loading...</p>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            {/* Protected parent routes */}
            <Route
              path="/dashboard/parent"
              element={
                <ProtectedRoute requiredRole="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/parent/profile"
              element={
                <ProtectedRoute requiredRole="parent">
                  <ParentProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected admin routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/profile"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProfilePage />
                </ProtectedRoute>
              }
            />

            <Route path="/programs" element={<ProgramsPage />} />

            {/* Add the tempo route before any catch-all route */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}

            {/* Redirect to login by default */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </NotificationProvider>
  );
}

export default App;
