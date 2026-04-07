import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { ErrorSummaryCards } from '../components/features/error-reports/ErrorSummaryCards';
import { ErrorFilterBar } from '../components/features/error-reports/ErrorFilterBar';
import { ErrorTable, ErrorDocument } from '../components/features/error-reports/ErrorTable';
import { ErrorBulkActionBar } from '../components/features/error-reports/ErrorBulkActionBar';
import { HighFailureAlert } from '../components/features/error-reports/HighFailureAlert';
import { NoErrorsState } from '../components/features/error-reports/NoErrorsState';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';

// Mock error data
const mockErrorDocuments: ErrorDocument[] = [
  {
    id: 'ERR-001',
    name: 'corrupted_invoice_mar.pdf',
    vendor: 'Acme Corporation',
    errorType: 'parsing',
    errorMessage: 'Unable to parse PDF: File structure corrupted or encrypted',
    status: 'failed',
    lastAttempt: '2024-04-07 10:23 AM',
    retryCount: 3,
  },
  {
    id: 'ERR-002',
    name: 'invoice_missing_data.pdf',
    vendor: 'TechSupply Inc.',
    errorType: 'missing',
    errorMessage: 'Missing required fields: invoice date, total amount',
    status: 'review',
    lastAttempt: '2024-04-07 09:45 AM',
    retryCount: 1,
  },
  {
    id: 'ERR-003',
    name: 'invoice_validation_fail.pdf',
    vendor: 'Global Logistics',
    errorType: 'validation',
    errorMessage: 'Line items total ($15,200) does not match invoice total ($15,500)',
    status: 'review',
    lastAttempt: '2024-04-07 09:12 AM',
    retryCount: 2,
  },
  {
    id: 'ERR-004',
    name: 'scanned_invoice_poor.pdf',
    vendor: 'Office Solutions',
    errorType: 'parsing',
    errorMessage: 'Low image quality: OCR confidence below threshold (45%)',
    status: 'failed',
    lastAttempt: '2024-04-07 08:55 AM',
    retryCount: 4,
  },
  {
    id: 'ERR-005',
    name: 'invoice_format_unknown.pdf',
    vendor: 'Manufacturing Pro',
    errorType: 'parsing',
    errorMessage: 'Unrecognized invoice format: Unable to identify vendor template',
    status: 'failed',
    lastAttempt: '2024-04-07 08:30 AM',
    retryCount: 2,
  },
  {
    id: 'ERR-006',
    name: 'invoice_incomplete.pdf',
    vendor: 'Digital Services LLC',
    errorType: 'missing',
    errorMessage: 'Missing vendor information and line item details',
    status: 'review',
    lastAttempt: '2024-04-06 05:20 PM',
    retryCount: 1,
  },
  {
    id: 'ERR-007',
    name: 'invoice_math_error.pdf',
    vendor: 'Cloud Systems Inc.',
    errorType: 'validation',
    errorMessage: 'Tax calculation error: Expected 10% tax ($1,860) but found ($1,650)',
    status: 'review',
    lastAttempt: '2024-04-06 04:15 PM',
    retryCount: 1,
  },
  {
    id: 'ERR-008',
    name: 'handwritten_invoice.pdf',
    vendor: 'Local Supplier',
    errorType: 'parsing',
    errorMessage: 'Handwritten text detected: Unable to extract with sufficient confidence',
    status: 'failed',
    lastAttempt: '2024-04-06 03:40 PM',
    retryCount: 5,
  },
];

export default function ErrorReportsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorTypeFilter, setErrorTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showHighFailureAlert, setShowHighFailureAlert] = useState(true);

  // Calculate summary stats
  const failedCount = mockErrorDocuments.filter(d => d.status === 'failed').length;
  const reviewCount = mockErrorDocuments.filter(d => d.status === 'review').length;
  const validationFailuresCount = mockErrorDocuments.filter(d => d.errorType === 'validation').length;
  const successRate = 82;

  // Filter logic
  const filteredDocuments = useMemo(() => {
    let filtered = [...mockErrorDocuments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.id.toLowerCase().includes(query) ||
          doc.name.toLowerCase().includes(query) ||
          doc.vendor.toLowerCase().includes(query) ||
          doc.errorMessage.toLowerCase().includes(query)
      );
    }

    // Error type filter
    if (errorTypeFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.errorType === errorTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    return filtered;
  }, [searchQuery, errorTypeFilter, statusFilter, dateFilter]);

  const handleSelectDocument = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(filteredDocuments.map((doc) => doc.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setErrorTypeFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const handleRetrySelected = () => {
    alert(`Retrying ${selectedIds.length} documents...`);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} documents?`)) {
      alert('Documents deleted successfully');
      setSelectedIds([]);
    }
  };

  const handleRetryAll = () => {
    if (confirm(`Are you sure you want to retry all ${failedCount} failed documents?`)) {
      alert('Retrying all failed documents...');
    }
  };

  const handleViewDocument = (id: string) => {
    window.location.href = `/documents/${id}`;
  };

  const handleRetry = (id: string) => {
    alert(`Retrying document: ${id}...`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      alert('Document deleted successfully');
    }
  };

  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Error Reports</h1>
              <p className="text-gray-600 mt-1">
                Monitor failed documents and resolve extraction issues
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/upload">
                <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Document
                </button>
              </Link>
              <button
                onClick={handleRetryAll}
                className="px-5 py-2.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Retry All Failed
              </button>
            </div>
          </div>

          {/* High Failure Alert */}
          {showHighFailureAlert && failedCount > 5 && (
            <div className="mb-6">
              <HighFailureAlert />
            </div>
          )}

          {mockErrorDocuments.length === 0 ? (
            <NoErrorsState />
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <ErrorSummaryCards
                failedCount={failedCount}
                needsReviewCount={reviewCount}
                validationFailuresCount={validationFailuresCount}
                successRate={successRate}
              />

              {/* Filter Bar */}
              <ErrorFilterBar
                onSearch={setSearchQuery}
                onFilterErrorType={setErrorTypeFilter}
                onFilterStatus={setStatusFilter}
                onFilterDate={setDateFilter}
                onClearFilters={handleClearFilters}
              />

              {/* Results Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between"
              >
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredDocuments.length}</span> error{filteredDocuments.length !== 1 ? 's' : ''}
                </p>
              </motion.div>

              {/* Error Table */}
              <ErrorTable
                documents={filteredDocuments}
                selectedIds={selectedIds}
                onSelectDocument={handleSelectDocument}
                onSelectAll={handleSelectAll}
                onViewDocument={handleViewDocument}
                onRetry={handleRetry}
                onDelete={handleDelete}
              />
            </div>
          )}

          {/* Bulk Action Bar */}
          <ErrorBulkActionBar
            selectedCount={selectedIds.length}
            onRetrySelected={handleRetrySelected}
            onDeleteSelected={handleDeleteSelected}
            onClearSelection={() => setSelectedIds([])}
          />
    </DashboardPageLayout>
  );
}