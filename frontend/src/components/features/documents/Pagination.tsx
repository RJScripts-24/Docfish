import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Items Info */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> invoices
        </p>

        {/* Items Per Page */}
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-[6px] border-1.5 transition-all ${
            currentPage === 1
              ? 'text-gray-400 border-gray-100 cursor-not-allowed'
              : 'text-gray-900 border-black shadow-[2px_2px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Page Numbers */}
        <div className="flex gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 rounded-[6px] border-1.5 font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-[var(--df-lime)] text-gray-900 border-black shadow-[3px_3px_0_black] z-10'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-black hover:shadow-[2px_2px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-[6px] border-1.5 transition-all ${
            currentPage === totalPages
              ? 'text-gray-400 border-gray-100 cursor-not-allowed'
              : 'text-gray-900 border-black shadow-[2px_2px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-gray-50'
          }`}
        >
          <ChevronRight className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
