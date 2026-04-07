import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DocumentsPage from "./pages/DocumentsPage";
import UploadPage from "./pages/UploadPage";
import ErrorReportsPage from "./pages/ErrorReportsPage";
import SettingsPage from "./pages/SettingsPage";
import DocumentReviewPage from "./pages/DocumentReviewPage";
import { GuestOnlyRoute, ProtectedRoute } from "./components/routing/ProtectedRoute";

function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="px-6 py-3 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl hover:from-teal-500 hover:to-teal-600 transition-all inline-block">
          Go Home
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth",
    element: (
      <GuestOnlyRoute>
        <AuthPage />
      </GuestOnlyRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/documents",
    element: (
      <ProtectedRoute>
        <DocumentsPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/documents/:id",
    element: (
      <ProtectedRoute>
        <DocumentReviewPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/upload",
    element: (
      <ProtectedRoute>
        <UploadPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/error-reports",
    element: (
      <ProtectedRoute>
        <ErrorReportsPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    element: <ErrorBoundary />,
  },
]);
