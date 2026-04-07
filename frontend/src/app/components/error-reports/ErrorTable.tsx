import { motion } from 'motion/react';
import { Eye, RefreshCw, Trash2, Download, AlertCircle, AlertTriangle, FileX } from 'lucide-react';

export interface ErrorDocument {
  id: string;
  name: string;
  vendor: string;
  errorType: 'parsing' | 'validation' | 'missing';
  errorMessage: string;
  status: 'failed' | 'review';
  lastAttempt: string;
  retryCount: number;
}

interface ErrorTableProps {
  documents: ErrorDocument[];
  selectedIds: string[];
  onSelectDocument: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDocument: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ErrorTable({
  documents,
  selectedIds,
  onSelectDocument,
  onSelectAll,
  onViewDocument,
  onRetry,
  onDelete,
}: ErrorTableProps) {
  const allSelected = documents.length > 0 && selectedIds.length === documents.length;

  const getErrorTypeColor = (type: ErrorDocument['errorType']) => {
    switch (type) {
      case 'parsing':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'validation':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'missing':
        return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const getErrorTypeIcon = (type: ErrorDocument['errorType']) => {
    switch (type) {
      case 'parsing':
        return <FileX className="w-3 h-3" />;
      case 'validation':
        return <AlertTriangle className="w-3 h-3" />;
      case 'missing':
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getErrorTypeText = (type: ErrorDocument['errorType']) => {
    switch (type) {
      case 'parsing':
        return 'Parsing Error';
      case 'validation':
        return 'Validation Error';
      case 'missing':
        return 'Missing Fields';
    }
  };

  const getStatusColor = (status: ErrorDocument['status']) => {
    switch (status) {
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusText = (status: ErrorDocument['status']) => {
    switch (status) {
      case 'failed':
        return 'Failed';
      case 'review':
        return 'Needs Review';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Document Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Error Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Error Message
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Attempt
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Retries
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc, index) => (
              <motion.tr
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewDocument(doc.id)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(doc.id)}
                    onChange={() => onSelectDocument(doc.id)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                      <FileX className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{doc.vendor}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border gap-1 ${getErrorTypeColor(
                      doc.errorType
                    )}`}
                  >
                    {getErrorTypeIcon(doc.errorType)}
                    {getErrorTypeText(doc.errorType)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate text-sm text-gray-600" title={doc.errorMessage}>
                    {doc.errorMessage}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {getStatusText(doc.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{doc.lastAttempt}</td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900">{doc.retryCount}</span>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDocument(doc.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onRetry(doc.id)}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Retry"
                    >
                      <RefreshCw className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download Logs"
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
