import { Search, Bell, Upload } from 'lucide-react';
import { Link } from 'react-router';

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Left - Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to Docfish</p>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Upload Button */}
        <Link to="/upload">
          <button className="px-5 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all shadow-md flex items-center gap-2 font-medium">
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
        </Link>

        {/* User Avatar */}
        <button className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium hover:shadow-lg transition-shadow">
          G
        </button>
      </div>
    </header>
  );
}
