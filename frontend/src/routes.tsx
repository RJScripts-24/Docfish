import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import UploadPage from "./pages/UploadPage";
import ErrorReportsPage from "./pages/ErrorReportsPage";
import SettingsPage from "./pages/SettingsPage";
import DocumentReviewPage from "./pages/DocumentReviewPage";

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
    Component: LandingPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth",
    Component: AuthPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/documents",
    Component: DocumentsPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/documents/:id",
    Component: DocumentReviewPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/upload",
    Component: UploadPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/error-reports",
    Component: ErrorReportsPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/settings",
    Component: SettingsPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    element: <ErrorBoundary />,
  },
]);