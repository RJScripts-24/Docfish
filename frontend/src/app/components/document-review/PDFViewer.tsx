import { useState } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

export function PDFViewer() {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* PDF Controls */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-white hover:bg-gray-700'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm font-medium w-16 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: zoom / 100 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{ width: '8.5in', minHeight: '11in' }}
        >
          {/* Mock Invoice Content */}
          <div className="p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p className="text-gray-600">Invoice #INV-2024-001</p>
              </div>
              <div className="text-right">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg mb-2 flex items-center justify-center text-white font-bold text-2xl">
                  ACME
                </div>
              </div>
            </div>

            {/* Vendor Info with Highlight */}
            <div className="mb-8 relative">
              <div className="absolute -inset-2 bg-green-200 opacity-30 rounded-lg" />
              <div className="relative">
                <h2 className="font-bold text-gray-900 mb-1">From:</h2>
                <p className="text-gray-800 font-semibold">Acme Corporation</p>
                <p className="text-gray-600 text-sm">123 Business Street</p>
                <p className="text-gray-600 text-sm">New York, NY 10001</p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                <p className="text-gray-800">Your Company Name</p>
                <p className="text-gray-600 text-sm">456 Client Avenue</p>
                <p className="text-gray-600 text-sm">Los Angeles, CA 90001</p>
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between relative">
                    <div className="absolute -inset-1 bg-green-200 opacity-30 rounded" />
                    <span className="relative text-gray-600">Invoice Date:</span>
                    <span className="relative font-semibold text-gray-900">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold text-gray-900">February 15, 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8 relative">
              <div className="absolute -inset-2 bg-yellow-200 opacity-20 rounded-lg" />
              <table className="w-full relative">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-2 text-gray-700 font-semibold">Description</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Qty</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Unit Price</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 text-gray-800">Professional Services - January 2024</td>
                    <td className="text-right py-3 text-gray-800">1</td>
                    <td className="text-right py-3 text-gray-800">$10,000.00</td>
                    <td className="text-right py-3 text-gray-800 font-semibold">$10,000.00</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 text-gray-800">Software License - Annual</td>
                    <td className="text-right py-3 text-gray-800">1</td>
                    <td className="text-right py-3 text-gray-800">$1,205.00</td>
                    <td className="text-right py-3 text-gray-800 font-semibold">$1,205.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">$11,205.00</span>
                </div>
                <div className="flex justify-between py-2 relative">
                  <div className="absolute -inset-1 bg-yellow-200 opacity-30 rounded" />
                  <span className="relative text-gray-600">Tax (10%):</span>
                  <span className="relative font-semibold text-gray-900">$1,245.00</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300 relative">
                  <div className="absolute -inset-1 bg-green-200 opacity-30 rounded" />
                  <span className="relative text-xl font-bold text-gray-900">Total:</span>
                  <span className="relative text-xl font-bold text-gray-900">$12,450.00</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
              <p>Thank you for your business!</p>
              <p className="mt-2">Payment Terms: Net 30 Days</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
