import { 
  LogOut,
  Fish,
  User,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import { dashboardNavigationItems } from '../../constants/navigation';

export function Sidebar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r-[1.5px] border-[var(--df-border)] flex flex-col z-40 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b-[1.5px] border-[var(--df-border)]">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 bg-[var(--df-navy)] rounded-xl flex items-center justify-center">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[var(--df-navy)]">Docfish</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {dashboardNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[var(--df-navy)] text-white font-semibold shadow-sm'
                    : 'text-[var(--df-muted)] hover:bg-[var(--df-light-gray)] hover:text-[var(--df-black)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-[1.5px] border-[var(--df-border)]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--df-light-gray)] transition-colors mb-2 border border-transparent hover:border-[var(--df-border)]">
            <div className="w-10 h-10 bg-[var(--df-navy)] rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--df-black)]">Guest User</div>
              <div className="text-xs text-[var(--df-muted)]">guest@docfish.ai</div>
            </div>
          </div>
          <Link
            to="/auth"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}