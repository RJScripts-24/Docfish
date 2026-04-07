import { motion } from 'motion/react';
import { RefreshCw, Trash2, X } from 'lucide-react';

interface ErrorBulkActionBarProps {
  selectedCount: number;
  onRetrySelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export function ErrorBulkActionBar({
  selectedCount,
  onRetrySelected,
  onDeleteSelected,
  onClearSelection,
}: ErrorBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center font-bold">
            {selectedCount}
          </div>
          <span className="font-medium">
            {selectedCount} {selectedCount === 1 ? 'document' : 'documents'} selected
          </span>
        </div>

        <div className="h-8 w-px bg-gray-700" />

        <div className="flex gap-2">
          <button
            onClick={onRetrySelected}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Selected
          </button>

          <button
            onClick={onDeleteSelected}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={onClearSelection}
            className="px-4 py-2 hover:bg-gray-800 rounded-xl transition-all flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </motion.div>
  );
}
