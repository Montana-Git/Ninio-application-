import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import { useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { ErrorBoundary } from "./components/ui/error-boundary";

// Lazy load pages for better performance
const LoginPage = lazy(() => import("./pages/auth/login"));
const RegisterPage = lazy(() => import("./pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("./pages/auth/reset-password"));
const ParentDashboard = lazy(() => import("./pages/dashboard/parent"));
const ParentProfilePage = lazy(
  () => import("./pages/dashboard/parent/profile"),
);
const ParentChildrenPage = lazy(
  () => import("./pages/dashboard/parent/children"),
);
const ParentPaymentsPage = lazy(
  () => import("./pages/dashboard/parent/payments"),
);
const AdminDashboard = lazy(() => import("./pages/dashboard/admin"));
const AdminProfilePage = lazy(() => import("./pages/dashboard/admin/profile"));
const ProgramsPage = lazy(() => import("./pages/programs"));
const FileUploadPage = lazy(() => import("./pages/dashboard/parent/file-upload"));
const ReportsPage = lazy(() => import("./pages/dashboard/parent/reports"));
const NotificationSettingsPage = lazy(() => import("./pages/dashboard/parent/notification-settings"));

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
  const { user } = useAuth();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
      }}
    >
      <NotificationProvider>
        <AnalyticsProvider>
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
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

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
            <Route
              path="/dashboard/parent/files"
              element={
                <ProtectedRoute requiredRole="parent">
                  <FileUploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/parent/reports"
              element={
                <ProtectedRoute requiredRole="parent">
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/parent/notification-settings"
              element={
                <ProtectedRoute requiredRole="parent">
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/parent/children"
              element={
                <ProtectedRoute requiredRole="parent">
                  <ParentChildrenPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/parent/payments"
              element={
                <ProtectedRoute requiredRole="parent">
                  <ParentPaymentsPage />
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
          {/* Tempo routes removed */}
        </>
          </Suspense>
        </AnalyticsProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
