import { ChevronDown, Calendar, Fish, Menu, X } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1440px] px-4 lg:px-6">
      <div className="bg-white/90 backdrop-blur-md rounded-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold">Docfish</span>
          </Link>

          {/* Center Navigation - Desktop Only */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#why" className="text-gray-700 hover:text-gray-900 transition-colors">
              Why Docfish
            </a>
            <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
              Product <ChevronDown className="w-4 h-4" />
            </button>
            <a href="#customers" className="text-gray-700 hover:text-gray-900 transition-colors">
              Customers
            </a>
            <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
              Resources <ChevronDown className="w-4 h-4" />
            </button>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/auth">
              <button className="px-4 sm:px-5 py-2 border-2 border-gray-300 rounded-full hover:border-gray-400 transition-colors text-sm sm:text-base">
                Sign in
              </button>
            </Link>
            <button className="px-4 sm:px-5 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full hover:from-green-500 hover:to-green-600 transition-all shadow-md flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Book Demo</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <a href="#why" className="text-gray-700 hover:text-gray-900 transition-colors py-2">
                Why Docfish
              </a>
              <a href="#customers" className="text-gray-700 hover:text-gray-900 transition-colors py-2">
                Customers
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors py-2">
                Pricing
              </a>
              <Link to="/auth" className="w-full">
                <button className="w-full px-5 py-2 border-2 border-gray-300 rounded-full hover:border-gray-400 transition-colors">
                  Sign in
                </button>
              </Link>
              <button className="w-full px-5 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full hover:from-green-500 hover:to-green-600 transition-all shadow-md flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Book Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}