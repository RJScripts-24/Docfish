import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { formatCurrency, formatDate } from '../../../lib/format';
import { InvoiceDocument } from '../../../lib/types';

interface RecentDocumentsProps {
  documents: InvoiceDocument[];
  isLoading?: boolean;
}

export function RecentDocuments({ documents, isLoading = false }: RecentDocumentsProps) {
  const getStatusBadge = (status: InvoiceDocument['status']) => {
    const styles = {
      success: 'bg-green-100 text-green-700',
      review: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };

    const labels = {
      success: 'Success',
      review: 'Needs Review',
      failed: 'Failed',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recent Documents</h3>
          <p className="text-sm text-gray-500 mt-1">Latest processed invoices</p>
        </div>
        <Link
          to="/documents"
          className="text-gray-900 border-b border-gray-900 hover:text-gray-600 font-medium text-sm flex items-center gap-1 pb-0.5 transition-colors"
        >
          View All
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 px-4 text-center text-sm text-gray-500">
                  Loading recent documents...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 px-4 text-center text-sm text-gray-500">
                  No processed documents yet.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <Link to={`/documents/${doc.id}`} className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{doc.vendor || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{formatDate(doc.invoiceDate)}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{formatCurrency(doc.amount)}</td>
                  <td className="py-4 px-4">{getStatusBadge(doc.status)}</td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-semibold ${getConfidenceColor(doc.confidence)}`}>
                      {doc.confidence}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
