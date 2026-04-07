import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileUp } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { InvoiceTable, Invoice } from '../components/features/documents/InvoiceTable';
import { SearchFilterBar } from '../components/features/documents/SearchFilterBar';
import { BulkActionBar } from '../components/features/documents/BulkActionBar';
import { EmptyState } from '../components/features/documents/EmptyState';
import { Pagination } from '../components/features/documents/Pagination';
import { confirmAction } from '../services/feedback';
import {
  bulkDeleteDocuments,
  bulkReprocessDocuments,
  deleteDocument,
  downloadDocumentJson,
  listDocuments,
  reprocessDocument,
} from '../lib/api';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.toString();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateFilter, setDateFilter] = useState(searchParams.get('dateFilter') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date-desc');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page') || 1));
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setStatusFilter(searchParams.get('status') || 'all');
    setDateFilter(searchParams.get('dateFilter') || 'all');
    setSortBy(searchParams.get('sort') || 'date-desc');
    setCurrentPage(Number(searchParams.get('page') || 1));
  }, [searchParamString]);

  const fetchDocuments = async () => {
    const response = await listDocuments({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter,
      sort: sortBy,
      dateFilter,
    });

    setInvoices(response.data);
    setTotalCount(response.totalCount);
  };

  useEffect(() => {
    let isActive = true;

    async function loadDocuments() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await listDocuments({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          status: statusFilter,
          sort: sortBy,
          dateFilter,
        });

        if (!isActive) {
          return;
        }

        setInvoices(response.data);
        setTotalCount(response.totalCount);
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load documents.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      isActive = false;
    };
  }, [currentPage, dateFilter, itemsPerPage, searchQuery, sortBy, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const handleSelectInvoice = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? invoices.map((invoice) => invoice.id) : []);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const runMutation = async (action: () => Promise<void>, fallbackMessage: string) => {
    try {
      setIsMutating(true);
      setErrorMessage(null);
      await action();
      setSelectedIds([]);
      await fetchDocuments();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsMutating(false);
    }
  };

  const handleReprocessSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    await runMutation(async () => {
      await bulkReprocessDocuments(selectedIds);
    }, 'Failed to reprocess selected documents.');
  };

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      setIsMutating(true);
      setErrorMessage(null);

      const exported = await Promise.all(
        selectedIds.map(async (id) => {
          const payload = await downloadDocumentJson(id);
          return {
            id,
            exportedAt: new Date().toISOString(),
            payload,
          };
        })
      );

      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = `documents-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to export selected documents.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirmAction(`Are you sure you want to delete ${selectedIds.length} invoices?`)) {
      return;
    }

    await runMutation(async () => {
      await bulkDeleteDocuments(selectedIds);
    }, 'Failed to delete selected documents.');
  };

  const handleViewInvoice = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleReprocess = async (id: string) => {
    await runMutation(async () => {
      await reprocessDocument(id);
    }, 'Failed to reprocess document.');
  };

  const handleDelete = async (id: string) => {
    if (!confirmAction('Are you sure you want to delete this invoice?')) {
      return;
    }

    await runMutation(async () => {
      await deleteDocument(id);
    }, 'Failed to delete document.');
  };

  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto">
      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--df-black)] tracking-tight">Invoices</h1>
          <p className="text-sm font-medium text-[var(--df-muted)] mt-1">
            Manage and track all your processed documents
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/upload" className="flex-1 sm:flex-initial">
            <button className="df-btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-sm">
              <FileUp className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
              <span className="sm:hidden">Bulk</span>
            </button>
          </Link>
          <Link to="/upload" className="flex-1 sm:flex-initial">
            <button className="df-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm shadow-[3px_3px_0_var(--df-black)]">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Invoice</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </Link>
        </div>
      </div>

      {!isLoading && totalCount === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <SearchFilterBar
            initialSearch={searchQuery}
            initialStatus={statusFilter}
            initialDateFilter={dateFilter}
            initialSort={sortBy}
            onSearch={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onFilterStatus={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            onFilterDate={(value) => {
              setDateFilter(value);
              setCurrentPage(1);
            }}
            onSort={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
            onClearFilters={handleClearFilters}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total Invoices', value: totalCount, textClass: 'text-[var(--df-black)]' },
              { label: 'Successful', value: invoices.filter((item) => item.status === 'success').length, textClass: 'text-green-600' },
              { label: 'Needs Review', value: invoices.filter((item) => item.status === 'review').length, textClass: 'text-yellow-600' },
              { label: 'Failed', value: invoices.filter((item) => item.status === 'failed').length, textClass: 'text-red-600' },
            ].map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className="bg-white rounded-xl p-5 border-[1.5px] border-[var(--df-border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] group"
              >
                <p className="text-xs font-bold text-[var(--df-muted)] uppercase tracking-wider group-hover:text-[var(--df-navy)] transition-colors">
                  {stat.label}
                </p>
                <p className={`text-3xl font-extrabold mt-2 tracking-tighter ${stat.textClass}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>

          {isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
              Loading documents...
            </div>
          ) : (
            <InvoiceTable
              invoices={invoices}
              selectedIds={selectedIds}
              onSelectInvoice={handleSelectInvoice}
              onSelectAll={handleSelectAll}
              onViewInvoice={handleViewInvoice}
              onReprocess={handleReprocess}
              onDelete={handleDelete}
            />
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalCount}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <BulkActionBar
        selectedCount={selectedIds.length}
        onExportSelected={handleExportSelected}
        onReprocessSelected={handleReprocessSelected}
        onDeleteSelected={handleDeleteSelected}
        onClearSelection={() => setSelectedIds([])}
      />

      {isMutating ? (
        <div className="fixed bottom-4 right-4 rounded-xl bg-[var(--df-navy)] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          Updating documents...
        </div>
      ) : null}
    </DashboardPageLayout>
  );
}
