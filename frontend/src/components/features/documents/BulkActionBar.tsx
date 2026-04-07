import { motion } from 'motion/react';
import { RefreshCw, Trash2, X, Download } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onExportSelected: () => void;
  onReprocessSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onExportSelected,
  onReprocessSelected,
  onDeleteSelected,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-[var(--df-navy)] text-white rounded-[6px] shadow-[4px_4px_0_rgba(0,0,0,0.2)] border-2 border-black px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--df-lime)] text-[var(--df-black)] rounded-[6px] border-2 border-black flex items-center justify-center font-extrabold text-lg shadow-[2px_2px_0_black]">
            {selectedCount}
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base leading-none">
              {selectedCount} {selectedCount === 1 ? 'invoice' : 'invoices'}
            </div>
            <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Actions for selection</div>
          </div>
        </div>

        <div className="hidden sm:block h-10 w-px bg-white/20" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onExportSelected}
            className="flex-1 sm:flex-auto px-6 py-2.5 bg-[var(--df-lime)] text-black border-2 border-black rounded-[6px] font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-[3px_3px_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>

          <button
            onClick={onReprocessSelected}
            className="flex-1 sm:flex-auto px-6 py-2.5 bg-white text-black border-2 border-black rounded-[6px] font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-[3px_3px_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <RefreshCw className="w-4 h-4" />
            Reprocess
          </button>

          <button
            onClick={onDeleteSelected}
            className="flex-1 sm:flex-auto px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-[6px] font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-[3px_3px_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={onClearSelection}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-[6px] border-2 border-black transition-all flex items-center justify-center sm:gap-2 group shadow-[3px_3px_0_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            title="Clear Selection"
          >
            <X className="w-5 h-5 mx-auto" strokeWidth={3} />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Cancel</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
