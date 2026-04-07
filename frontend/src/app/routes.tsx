import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Upload from "./pages/Upload";
import ErrorReports from "./pages/ErrorReports";
import Settings from "./pages/Settings";
import DocumentReview from "./pages/DocumentReview";

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
    Component: Landing,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth",
    Component: Auth,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/documents",
    Component: Documents,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/documents/:id",
    Component: DocumentReview,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/upload",
    Component: Upload,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/error-reports",
    Component: ErrorReports,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/settings",
    Component: Settings,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    element: <ErrorBoundary />,
  },
]);