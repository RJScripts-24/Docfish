import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { InvoiceTable, Invoice } from '../components/documents/InvoiceTable';
import { SearchFilterBar } from '../components/documents/SearchFilterBar';
import { BulkActionBar } from '../components/documents/BulkActionBar';
import { EmptyState } from '../components/documents/EmptyState';
import { Pagination } from '../components/documents/Pagination';
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

export default function Documents() {
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader />
        
        <main className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage and track all your processed documents
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/upload" className="flex-1 sm:flex-initial">
                <button className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <FileUp className="w-5 h-5" />
                  <span className="hidden sm:inline">Bulk Upload</span>
                  <span className="sm:hidden">Bulk</span>
                </button>
              </Link>
              <Link to="/upload" className="flex-1 sm:flex-initial">
                <button className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Upload className="w-5 h-5" />
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
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {filteredInvoices.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {filteredInvoices.filter((i) => i.status === 'success').length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Needs Review</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {filteredInvoices.filter((i) => i.status === 'review').length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {filteredInvoices.filter((i) => i.status === 'failed').length}
                  </p>
                </div>
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
        </main>
      </div>
    </div>
  );
}