import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { InvoiceTable, Invoice } from '../components/features/documents/InvoiceTable';
import { SearchFilterBar } from '../components/features/documents/SearchFilterBar';
import { BulkActionBar } from '../components/features/documents/BulkActionBar';
import { EmptyState } from '../components/features/documents/EmptyState';
import { Pagination } from '../components/features/documents/Pagination';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { Link } from 'react-router';

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    name: 'Invoice_Jan_2024.pdf',
    vendor: 'Acme Corporation',
    invoiceDate: '2024-01-15',
    amount: 12450.00,
    status: 'success',
    confidence: 95,
    processingTime: '2.3s',
  },
  {
    id: 'INV-2024-002',
    name: 'Invoice_Feb_2024.pdf',
    vendor: 'TechSupply Inc.',
    invoiceDate: '2024-02-10',
    amount: 8920.50,
    status: 'success',
    confidence: 92,
    processingTime: '1.8s',
  },
  {
    id: 'INV-2024-003',
    name: 'Invoice_Mar_2024.pdf',
    vendor: 'Global Logistics',
    invoiceDate: '2024-03-05',
    amount: 15200.00,
    status: 'review',
    confidence: 78,
    processingTime: '3.1s',
  },
  {
    id: 'INV-2024-004',
    name: 'Invoice_Mar_2024_B.pdf',
    vendor: 'Office Solutions',
    invoiceDate: '2024-03-12',
    amount: 5430.25,
    status: 'success',
    confidence: 97,
    processingTime: '1.5s',
  },
  {
    id: 'INV-2024-005',
    name: 'Invoice_Apr_2024.pdf',
    vendor: 'Manufacturing Pro',
    invoiceDate: '2024-04-01',
    amount: 23100.00,
    status: 'failed',
    confidence: 45,
    processingTime: '4.2s',
  },
  {
    id: 'INV-2024-006',
    name: 'Invoice_Apr_2024_B.pdf',
    vendor: 'Acme Corporation',
    invoiceDate: '2024-04-03',
    amount: 9875.50,
    status: 'success',
    confidence: 94,
    processingTime: '2.0s',
  },
  {
    id: 'INV-2024-007',
    name: 'Invoice_Apr_2024_C.pdf',
    vendor: 'Digital Services LLC',
    invoiceDate: '2024-04-05',
    amount: 11250.00,
    status: 'review',
    confidence: 82,
    processingTime: '2.7s',
  },
  {
    id: 'INV-2024-008',
    name: 'Invoice_Apr_2024_D.pdf',
    vendor: 'Cloud Systems Inc.',
    invoiceDate: '2024-04-06',
    amount: 18600.75,
    status: 'success',
    confidence: 96,
    processingTime: '1.9s',
  },
];

export default function DocumentsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and sort logic
  const filteredInvoices = useMemo(() => {
    let filtered = [...mockInvoices];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.id.toLowerCase().includes(query) ||
          inv.name.toLowerCase().includes(query) ||
          inv.vendor.toLowerCase().includes(query) ||
          inv.amount.toString().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        case 'date-asc':
          return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'confidence-desc':
          return b.confidence - a.confidence;
        case 'confidence-asc':
          return a.confidence - b.confidence;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, dateFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectInvoice = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(paginatedInvoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('date-desc');
  };

  const handleReprocessSelected = () => {
    alert(`Reprocessing ${selectedIds.length} invoices...`);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} invoices?`)) {
      alert('Invoices deleted successfully');
      setSelectedIds([]);
    }
  };

  const handleViewInvoice = (id: string) => {
    // Navigate to document review page
    window.location.href = `/documents/${id}`;
  };

  const handleReprocess = (id: string) => {
    alert(`Reprocessing invoice: ${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      alert('Invoice deleted successfully');
    }
  };

  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto">
          {/* Page Header */}
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

          {mockInvoices.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <SearchFilterBar
                onSearch={setSearchQuery}
                onFilterStatus={setStatusFilter}
                onFilterDate={setDateFilter}
                onSort={setSortBy}
                onClearFilters={handleClearFilters}
              />

              {/* Stats Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                {[
                  { label: 'Total Invoices', value: filteredInvoices.length, color: '[var(--df-black)]' },
                  { label: 'Successful', value: filteredInvoices.filter((i) => i.status === 'success').length, color: 'green-600' },
                  { label: 'Needs Review', value: filteredInvoices.filter((i) => i.status === 'review').length, color: 'yellow-600' },
                  { label: 'Failed', value: filteredInvoices.filter((i) => i.status === 'failed').length, color: 'red-600' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 border-[1.5px] border-[var(--df-border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] group">
                    <p className="text-xs font-bold text-[var(--df-muted)] uppercase tracking-wider group-hover:text-[var(--df-navy)] transition-colors">{stat.label}</p>
                    <p className={`text-3xl font-extrabold text-${stat.color} mt-2 tracking-tighter`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* Invoice Table */}
              <InvoiceTable
                invoices={paginatedInvoices}
                selectedIds={selectedIds}
                onSelectInvoice={handleSelectInvoice}
                onSelectAll={handleSelectAll}
                onViewInvoice={handleViewInvoice}
                onReprocess={handleReprocess}
                onDelete={handleDelete}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredInvoices.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {/* Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onReprocessSelected={handleReprocessSelected}
            onDeleteSelected={handleDeleteSelected}
            onClearSelection={() => setSelectedIds([])}
          />
    </DashboardPageLayout>
  );
}