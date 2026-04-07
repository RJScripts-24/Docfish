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
      <div className="bg-[var(--df-navy)] text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--df-lime)] text-[var(--df-black)] rounded-xl flex items-center justify-center font-extrabold text-lg shadow-[0_0_20px_rgba(138,224,74,0.4)]">
            {selectedCount}
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base leading-none">
              {selectedCount} {selectedCount === 1 ? 'document' : 'documents'}
            </div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Actions for selection</div>
          </div>
        </div>

        <div className="hidden sm:block h-10 w-px bg-white/10" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRetrySelected}
            className="flex-1 sm:flex-auto px-6 py-2.5 bg-[var(--df-lime)] hover:bg-[var(--df-lime-hover)] text-[var(--df-black)] rounded-full font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:translate-y-[-1px] active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>

          <button
            onClick={onDeleteSelected}
            className="flex-1 sm:flex-auto px-6 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-sm hover:translate-y-[-1px] active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={onClearSelection}
            className="p-2.5 hover:bg-white/5 text-white/70 hover:text-white rounded-full transition-all flex items-center justify-center sm:gap-2 group"
            title="Clear Selection"
          >
            <X className="w-5 h-5 mx-auto" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Cancel</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
