import { useState } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileWarning } from 'lucide-react';

interface PDFViewerProps {
  documentUrl?: string;
}

export function PDFViewer({ documentUrl }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white text-sm font-medium">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm font-medium w-16 text-center">{zoom}%</span>
          <button onClick={handleZoomIn} className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        {documentUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white shadow-2xl rounded-lg overflow-hidden origin-top"
            style={{
              width: '8.5in',
              minHeight: '11in',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <iframe
              title="Document PDF"
              src={`${documentUrl}#toolbar=0&navpanes=0`}
              className="w-full"
              style={{ height: '11in', border: 'none' }}
            />
          </motion.div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="rounded-2xl border border-gray-700 bg-gray-800 px-6 py-8 text-center text-gray-300 max-w-sm">
              <FileWarning className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
              <p className="font-semibold mb-2">PDF preview unavailable</p>
              <p className="text-sm text-gray-400">This document does not have a previewable source file yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
