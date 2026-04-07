import { FormEvent, useState } from 'react';
import { Search, Bell, Upload } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../lib/format';

export function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isErrorReports = location.pathname.includes('/error-reports');
  const [searchValue, setSearchValue] = useState('');

  const headerTitleMap: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Track pipeline health and processing activity' },
    '/analytics': { title: 'Analytics', subtitle: 'Explore volume, success rates, and document trends' },
    '/documents': { title: 'Documents', subtitle: 'Review extracted invoices and manage corrections' },
    '/upload': { title: 'Upload', subtitle: 'Send new files to the extraction pipeline' },
    '/error-reports': { title: 'Error Reports', subtitle: 'Retry or resolve failed and low-confidence documents' },
    '/settings': { title: 'Settings', subtitle: 'Manage prompt versions and extraction behavior' },
  };

  const headerCopy =
    headerTitleMap[location.pathname] ||
    (location.pathname.startsWith('/documents/')
      ? { title: 'Document Review', subtitle: 'Inspect extracted fields and source files' }
      : { title: 'Dashboard', subtitle: 'Welcome back to Docfish' });

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchValue.trim()) {
      return;
    }

    navigate(`/documents?search=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <header className="bg-white border-b-[1.5px] border-[var(--df-border)] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left - Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--df-black)] tracking-tight">{headerCopy.title}</h1>
        <p className="text-sm font-medium text-[var(--df-muted)] mt-1">{headerCopy.subtitle}</p>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <form className="relative" onSubmit={handleSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--df-muted)]" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search documents..."
            className="pl-10 pr-4 py-2.5 w-72 bg-white border-[1.5px] border-black rounded-[6px] focus:outline-none shadow-[2px_2px_0_black] text-sm font-bold placeholder:text-[var(--df-muted)] transition-all"
          />
        </form>

        {/* Notifications */}
        <button className="relative p-2.5 bg-white border-[1.5px] border-black rounded-[6px] shadow-[2px_2px_0_black] hover:bg-gray-50 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
          <Bell className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black shadow-sm" />
        </button>

        {/* Upload Button */}
        {!isErrorReports && (
          <Link to="/upload">
            <button className="df-btn-primary px-6 py-2.5 text-sm shadow-[3px_3px_0_var(--df-black)]">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </Link>
        )}

        {/* User Avatar */}
        <button
          title={user?.name || 'Docfish user'}
          className="w-10 h-10 bg-[var(--df-navy)] border-[1.5px] border-black rounded-[6px] flex items-center justify-center text-white font-bold shadow-[2px_2px_0_black] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all overflow-hidden"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(user)
          )}
        </button>
      </div>
    </header>
  );
}
