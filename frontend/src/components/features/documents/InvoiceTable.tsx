import { motion } from 'motion/react';
import { Eye, RefreshCw, Trash2, Download, FileText } from 'lucide-react';
import { useState } from 'react';

export interface Invoice {
  id: string;
  name: string;
  vendor: string;
  invoiceDate: string;
  amount: number;
  status: 'success' | 'review' | 'failed';
  confidence: number;
  processingTime: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  selectedIds: string[];
  onSelectInvoice: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onViewInvoice: (id: string) => void;
  onReprocess: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InvoiceTable({
  invoices,
  selectedIds,
  onSelectInvoice,
  onSelectAll,
  onViewInvoice,
  onReprocess,
  onDelete,
}: InvoiceTableProps) {
  const allSelected = invoices.length > 0 && selectedIds.length === invoices.length;

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'review':
        return 'Needs Review';
      case 'failed':
        return 'Failed';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--df-navy)] focus:ring-gray-300 cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Invoice Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Processing Time
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice, index) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewInvoice(invoice.id)}
              >
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(invoice.id)}
                    onChange={() => onSelectInvoice(invoice.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--df-navy)] focus:ring-gray-300 cursor-pointer"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm whitespace-nowrap">{invoice.name}</div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">{invoice.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{invoice.vendor}</td>
                <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{invoice.invoiceDate}</td>
                <td className="px-3 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                  ${invoice.amount.toLocaleString()}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getConfidenceColor(invoice.confidence)}`}>
                      {invoice.confidence}%
                    </span>
                    <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                      <div
                        className={`h-1.5 rounded-full ${
                          invoice.confidence >= 90
                            ? 'bg-green-500'
                            : invoice.confidence >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${invoice.confidence}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{invoice.invoiceDate}</td>
                <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewInvoice(invoice.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onReprocess(invoice.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Reprocess"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(invoice.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
