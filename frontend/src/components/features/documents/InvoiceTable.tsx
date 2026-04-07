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
    <div className="bg-white rounded-2xl border-[1.5px] border-[var(--df-border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--df-off-white)] border-b-[1.5px] border-[var(--df-border)]">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--df-border)] text-[var(--df-navy)] focus:ring-[var(--df-navy)] cursor-pointer transition-all"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Invoice Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Processing Time
              </th>
              <th className="px-3 py-3 text-right text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
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
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(invoice.id)}
                    onChange={() => onSelectInvoice(invoice.id)}
                    className="w-4 h-4 rounded border-[var(--df-border)] text-[var(--df-navy)] focus:ring-[var(--df-navy)] cursor-pointer transition-all"
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[var(--df-light-gray)] border border-[var(--df-border)] rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-[var(--df-navy)]" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--df-black)] text-sm whitespace-nowrap tracking-tight">{invoice.name}</div>
                      <div className="text-[10px] uppercase font-bold text-[var(--df-muted)] whitespace-nowrap">{invoice.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm font-semibold text-[var(--df-black)] whitespace-nowrap">{invoice.vendor}</td>
                <td className="px-3 py-4 text-xs font-bold text-[var(--df-muted)] uppercase whitespace-nowrap">{invoice.invoiceDate}</td>
                <td className="px-3 py-4 text-sm font-extrabold text-[var(--df-black)] whitespace-nowrap">
                  ${invoice.amount.toLocaleString()}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border-[1.5px] ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold ${getConfidenceColor(invoice.confidence)}`}>
                      {invoice.confidence}%
                    </span>
                    <div className="w-12 sm:w-16 bg-[var(--df-light-gray)] rounded-full h-1.5 hidden sm:block overflow-hidden border border-[var(--df-border)]">
                      <div
                        className={`h-1.5 rounded-full ${
                          invoice.confidence >= 90
                            ? 'bg-green-500'
                            : invoice.confidence >= 70
                            ? 'bg-yellow-400'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${invoice.confidence}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-xs font-bold text-[var(--df-muted)] uppercase whitespace-nowrap">{invoice.invoiceDate}</td>
                <td className="px-3 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewInvoice(invoice.id)}
                      className="p-1.5 hover:bg-[var(--df-light-gray)] hover:text-[var(--df-navy)] text-[var(--df-muted)] rounded-lg transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onReprocess(invoice.id)}
                      className="p-1.5 hover:bg-[var(--df-light-gray)] hover:text-[var(--df-navy)] text-[var(--df-muted)] rounded-lg transition-all"
                      title="Reprocess"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(invoice.id)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 text-[var(--df-muted)] rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
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
