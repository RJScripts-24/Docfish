import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { ErrorSummaryCards } from '../components/features/error-reports/ErrorSummaryCards';
import { ErrorFilterBar } from '../components/features/error-reports/ErrorFilterBar';
import { ErrorTable, ErrorDocument } from '../components/features/error-reports/ErrorTable';
import { ErrorBulkActionBar } from '../components/features/error-reports/ErrorBulkActionBar';
import { HighFailureAlert } from '../components/features/error-reports/HighFailureAlert';
import { NoErrorsState } from '../components/features/error-reports/NoErrorsState';
import { confirmAction } from '../services/feedback';
import {
  bulkDeleteErrors,
  bulkRetryErrors,
  deleteError,
  getErrorSummary,
  listErrors,
  retryAllFailedErrors,
  retryError,
} from '../lib/api';
import { ErrorSummary } from '../lib/types';

export default function ErrorReportsPage() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorTypeFilter, setErrorTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const showHighFailureAlert = true;
  const [documents, setDocuments] = useState<ErrorDocument[]>([]);
  const [summary, setSummary] = useState<ErrorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = async () => {
    const [errorsResponse, summaryResponse] = await Promise.all([
      listErrors({
        search: searchQuery,
        errorType: errorTypeFilter,
        status: statusFilter,
        dateFilter,
      }),
      getErrorSummary(),
    ]);

    setDocuments(errorsResponse);
    setSummary(summaryResponse);
  };

  useEffect(() => {
    let isActive = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [errorsResponse, summaryResponse] = await Promise.all([
          listErrors({
            search: searchQuery,
            errorType: errorTypeFilter,
            status: statusFilter,
            dateFilter,
          }),
          getErrorSummary(),
        ]);

        if (!isActive) {
          return;
        }

        setDocuments(errorsResponse);
        setSummary(summaryResponse);
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load error reports.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isActive = false;
    };
  }, [dateFilter, errorTypeFilter, searchQuery, statusFilter]);

  const failedCount = summary?.failedCount ?? 0;
  const reviewCount = summary?.reviewCount ?? 0;
  const validationFailuresCount = summary?.validationFailuresCount ?? 0;
  const successRate = summary?.successRate ?? 0;

  const filteredDocuments = documents;

  const handleSelectDocument = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? filteredDocuments.map((document) => document.id) : []);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setErrorTypeFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const runMutation = async (action: () => Promise<void>, fallbackMessage: string) => {
    try {
      setIsMutating(true);
      setErrorMessage(null);
      await action();
      setSelectedIds([]);
      await loadPage();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsMutating(false);
    }
  };

  const handleRetrySelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    await runMutation(async () => {
      await bulkRetryErrors(selectedIds);
    }, 'Failed to retry selected documents.');
  };

  const handleDeleteSelected = async () => {
    if (!confirmAction(`Are you sure you want to delete ${selectedIds.length} documents?`)) {
      return;
    }

    await runMutation(async () => {
      await bulkDeleteErrors(selectedIds);
    }, 'Failed to delete selected documents.');
  };

  const handleRetryAll = async () => {
    if (!confirmAction(`Retry all ${failedCount} failed documents?`)) {
      return;
    }

    await runMutation(async () => {
      await retryAllFailedErrors();
    }, 'Failed to retry all failed documents.');
  };

  const handleViewDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleRetry = async (id: string) => {
    await runMutation(async () => {
      await retryError(id);
    }, 'Failed to retry document.');
  };

  const handleDelete = async (id: string) => {
    if (!confirmAction('Are you sure you want to delete this document?')) {
      return;
    }

    await runMutation(async () => {
      await deleteError(id);
    }, 'Failed to delete document.');
  };

  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto">
      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--df-black)] tracking-tight">Error Reports</h1>
          <p className="text-sm font-medium text-[var(--df-muted)] mt-1">
            Monitor failed documents and resolve extraction issues
          </p>
        </div>
        {failedCount > 0 ? (
          <button onClick={handleRetryAll} className="df-btn-secondary px-5 py-3 text-sm">
            <RefreshCw className="w-4 h-4" />
            Retry All Failed
          </button>
        ) : null}
      </div>

      {showHighFailureAlert && failedCount > 5 ? (
        <div className="mb-6">
          <HighFailureAlert />
        </div>
      ) : null}

      {!isLoading && filteredDocuments.length === 0 ? (
        <NoErrorsState />
      ) : (
        <div className="space-y-6">
          <ErrorSummaryCards
            failedCount={failedCount}
            needsReviewCount={reviewCount}
            validationFailuresCount={validationFailuresCount}
            successRate={successRate}
          />

          <ErrorFilterBar
            onSearch={setSearchQuery}
            onFilterErrorType={setErrorTypeFilter}
            onFilterStatus={setStatusFilter}
            onFilterDate={setDateFilter}
            onClearFilters={handleClearFilters}
          />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
            <p className="text-xs font-bold text-[var(--df-muted)] uppercase tracking-widest">
              Showing <span className="text-[var(--df-black)]">{filteredDocuments.length}</span> error{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
              Loading error documents...
            </div>
          ) : (
            <ErrorTable
              documents={filteredDocuments}
              selectedIds={selectedIds}
              onSelectDocument={handleSelectDocument}
              onSelectAll={handleSelectAll}
              onViewDocument={handleViewDocument}
              onRetry={handleRetry}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      <ErrorBulkActionBar
        selectedCount={selectedIds.length}
        onRetrySelected={handleRetrySelected}
        onDeleteSelected={handleDeleteSelected}
        onClearSelection={() => setSelectedIds([])}
      />

      {isMutating ? (
        <div className="fixed bottom-4 right-4 rounded-xl bg-[var(--df-navy)] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          Updating error queue...
        </div>
      ) : null}
    </DashboardPageLayout>
  );
}
