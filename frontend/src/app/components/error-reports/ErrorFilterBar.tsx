import { motion } from 'motion/react';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorFilterBarProps {
  onSearch: (query: string) => void;
  onFilterErrorType: (type: string) => void;
  onFilterStatus: (status: string) => void;
  onFilterDate: (dateRange: string) => void;
  onClearFilters: () => void;
}

export function ErrorFilterBar({
  onSearch,
  onFilterErrorType,
  onFilterStatus,
  onFilterDate,
  onClearFilters,
}: ErrorFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedErrorType, setSelectedErrorType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleErrorTypeChange = (type: string) => {
    setSelectedErrorType(type);
    onFilterErrorType(type);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterStatus(status);
  };

  const handleDateChange = (dateRange: string) => {
    setSelectedDateRange(dateRange);
    onFilterDate(dateRange);
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedErrorType('all');
    setSelectedStatus('all');
    setSelectedDateRange('all');
    onClearFilters();
  };

  const hasActiveFilters =
    selectedErrorType !== 'all' ||
    selectedStatus !== 'all' ||
    selectedDateRange !== 'all' ||
    searchQuery;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4"
    >
      {/* Top Row: Search and Filter Toggle */}
      <div className="flex gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by invoice, vendor, or error type..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-5 py-3 border-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-teal-500 rounded-full" />}
        </button>
      </div>

      {/* Expandable Filters Section */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
        >
          {/* Error Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Error Type
            </label>
            <select
              value={selectedErrorType}
              onChange={(e) => handleErrorTypeChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="parsing">Parsing Error</option>
              <option value="validation">Validation Error</option>
              <option value="missing">Missing Fields</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="failed">Failed</option>
              <option value="review">Needs Review</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearAll}
              disabled={!hasActiveFilters}
              className={`w-full px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                hasActiveFilters
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
