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
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--df-lime)] text-gray-900 rounded-lg flex items-center justify-center font-bold">
            {selectedCount}
          </div>
          <span className="font-medium text-sm sm:text-base">
            {selectedCount} {selectedCount === 1 ? 'document' : 'documents'} selected
          </span>
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700" />

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onRetrySelected}
            className="flex-1 sm:flex-auto px-4 py-2 bg-[var(--df-lime)] hover:bg-[#7BC942] text-gray-900 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>

          <button
            onClick={onDeleteSelected}
            className="flex-1 sm:flex-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={onClearSelection}
            className="p-2 hover:bg-gray-800 rounded-xl transition-all flex items-center justify-center sm:gap-2"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
