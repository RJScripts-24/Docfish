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
      className="bg-white rounded-2xl p-5 border-[1.5px] border-[var(--df-border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] space-y-4"
    >
      {/* Top Row: Search and Filter Toggle */}
      <div className="flex gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--df-muted)] group-focus-within:text-[var(--df-navy)] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by invoice, vendor, or error type..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--df-light-gray)] border-[1.5px] border-[var(--df-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--df-navy)]/5 focus:border-[var(--df-navy)] transition-all font-medium text-sm placeholder:text-[var(--df-muted)]"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 border-[1.5px] rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${
            showFilters || hasActiveFilters
              ? 'border-[var(--df-navy)] bg-[var(--df-light-gray)] text-[var(--df-navy)] shadow-sm'
              : 'border-[var(--df-border)] hover:border-[var(--df-black)] text-[var(--df-muted)] hover:text-[var(--df-black)]'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-[var(--df-lime)] rounded-full shadow-[0_0_8px_rgba(138,224,74,0.6)]" />
          )}
        </button>
      </div>

      {/* Expandable Filters Section */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5 border-t-[1.5px] border-[var(--df-border)]"
        >
          {/* Error Type Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--df-muted)] mb-2 uppercase tracking-widest">
              Error Type
            </label>
            <select
              value={selectedErrorType}
              onChange={(e) => handleErrorTypeChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-[1.5px] border-[var(--df-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--df-navy)]/5 focus:border-[var(--df-navy)] font-bold text-sm text-[var(--df-black)] cursor-pointer transition-all"
            >
              <option value="all">All Types</option>
              <option value="parsing">Parsing Errors</option>
              <option value="validation">Validation Errors</option>
              <option value="missing">Missing Fields</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--df-muted)] mb-2 uppercase tracking-widest">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-[1.5px] border-[var(--df-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--df-navy)]/5 focus:border-[var(--df-navy)] font-bold text-sm text-[var(--df-black)] cursor-pointer transition-all"
            >
              <option value="all">All Status</option>
              <option value="failed">Failed Only</option>
              <option value="review">Needs Review</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--df-muted)] mb-2 uppercase tracking-widest">
              Date Range
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-[1.5px] border-[var(--df-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--df-navy)]/5 focus:border-[var(--df-navy)] font-bold text-sm text-[var(--df-black)] cursor-pointer transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearAll}
              disabled={!hasActiveFilters}
              className={`w-full px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                hasActiveFilters
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-sm'
                  : 'bg-[var(--df-light-gray)] text-[var(--df-muted)] cursor-not-allowed border border-[var(--df-border)]'
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
