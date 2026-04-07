import { Search, Bell, Upload } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function DashboardHeader() {
  const location = useLocation();
  const isErrorReports = location.pathname.includes('/error-reports');

  return (
    <header className="bg-white border-b-[1.5px] border-[var(--df-border)] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left - Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--df-black)] tracking-tight">Dashboard</h1>
        <p className="text-sm font-medium text-[var(--df-muted)] mt-1">Welcome back to Docfish</p>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--df-muted)]" />
          <input
            type="text"
            placeholder="Search documents..."
            className="pl-10 pr-4 py-2.5 w-72 bg-[var(--df-light-gray)] border-[1.5px] border-[var(--df-border)] rounded-xl focus:border-[var(--df-navy)] focus:ring-2 focus:ring-[var(--df-navy)]/5 transition-all outline-none text-sm font-medium placeholder:text-[var(--df-muted)]"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Upload Button */}
        {!isErrorReports && (
          <Link to="/upload">
            <button className="px-6 py-2.5 bg-[var(--df-lime)] text-[var(--df-black)] rounded-full hover:bg-[var(--df-lime-hover)] transition-all shadow-[0_4px_16px_rgba(138,224,74,0.3)] hover:translate-y-[-1px] flex items-center gap-2 font-bold text-sm">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </Link>
        )}

        {/* User Avatar */}
        <button className="w-10 h-10 bg-[var(--df-navy)] rounded-xl flex items-center justify-center text-white font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-sm">
          G
        </button>
      </div>
    </header>
  );
}
