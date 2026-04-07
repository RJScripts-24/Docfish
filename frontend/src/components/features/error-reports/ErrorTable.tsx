import { motion } from 'motion/react';
import { Eye, RefreshCw, Trash2, AlertCircle, AlertTriangle, FileX } from 'lucide-react';

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
                Document Name
              </th>
              <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Error Type
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Error Message
              </th>
              <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Status
              </th>
              <th className="hidden xl:table-cell px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Last Attempt
              </th>
              <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
                Retries
              </th>
              <th className="px-3 py-3 text-right text-xs font-bold text-[var(--df-black)] uppercase tracking-wider">
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
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(doc.id)}
                    onChange={() => onSelectDocument(doc.id)}
                    className="w-4 h-4 rounded border-[var(--df-border)] text-[var(--df-navy)] focus:ring-[var(--df-navy)] cursor-pointer transition-all"
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover:scale-110">
                      <FileX className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--df-black)] text-sm truncate tracking-tight max-w-[120px] sm:max-w-[150px]" title={doc.name}>{doc.name}</div>
                      <div className="text-[10px] font-bold text-[var(--df-muted)] truncate uppercase tracking-tighter">{doc.id}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-3 py-4 text-sm font-semibold text-[var(--df-black)] whitespace-nowrap">{doc.vendor}</td>
                <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border-[1.5px] gap-1 whitespace-nowrap ${getErrorTypeColor(
                      doc.errorType
                    )}`}
                  >
                    {getErrorTypeIcon(doc.errorType)}
                    {getErrorTypeText(doc.errorType)}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <div className="max-w-[150px] sm:max-w-xs truncate text-[11px] font-medium text-[var(--df-muted)]" title={doc.errorMessage}>
                    {doc.errorMessage}
                  </div>
                </td>
                <td className="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border-[1.5px] whitespace-nowrap ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {getStatusText(doc.status)}
                  </span>
                </td>
                <td className="hidden xl:table-cell px-3 py-4 text-[10px] font-bold text-[var(--df-muted)] uppercase tracking-wider whitespace-nowrap">{doc.lastAttempt}</td>
                <td className="hidden lg:table-cell px-3 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-extrabold text-[var(--df-black)] tracking-tighter">{doc.retryCount}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDocument(doc.id)}
                      className="p-1.5 hover:bg-[var(--df-light-gray)] hover:text-[var(--df-navy)] text-[var(--df-muted)] rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRetry(doc.id)}
                      className="p-1.5 hover:bg-green-50 hover:text-green-600 text-[var(--df-muted)] rounded-lg transition-all"
                      title="Retry"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
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
