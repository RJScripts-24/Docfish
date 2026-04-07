import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronRight, Download, RefreshCw, Save, FileText } from 'lucide-react';
import { PDFViewer } from '../components/features/document-review/PDFViewer';
import { ExtractedDataPanel } from '../components/features/document-review/ExtractedDataPanel';
import { motion } from 'motion/react';

export default function DocumentReviewPage() {
  const { id } = useParams();
  const [hasChanges, setHasChanges] = useState(false);

  const handleFieldEdit = (field: string, value: string) => {
    setHasChanges(true);
  };

  const handleReset = (field: string) => {
    // Check if any fields remain edited
  };

  const handleSaveChanges = () => {
    alert('Changes saved successfully!');
    setHasChanges(false);
  };

  const handleReprocess = () => {
    if (confirm('Are you sure you want to reprocess this document?')) {
      alert('Document is being reprocessed...');
    }
  };

  const handleDownloadPDF = () => {
    alert('Downloading PDF...');
  };

  const handleDownloadJSON = () => {
    alert('Downloading JSON...');
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto flex-wrap gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/documents" className="text-gray-600 hover:text-[var(--df-navy)] transition-colors font-medium">
              Invoices
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Invoice #{id || 'INV-2024-001'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReprocess}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reprocess
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              JSON
            </button>

            <motion.button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              animate={{
                scale: hasChanges ? [1, 1.05, 1] : 1,
              }}
              transition={{
                repeat: hasChanges ? Infinity : 0,
                duration: 2,
              }}
              className={`px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                hasChanges
                  ? 'bg-[var(--df-lime)] hover:bg-[#7BC942] text-gray-900 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          </div>
        </div>

        {/* Alert Banner for Changes */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Don't forget to save before leaving this page.
            </p>
          </motion.div>
        )}
      </div>

      {/* Split Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - PDF Viewer */}
        <div className="w-1/2 border-r border-gray-200">
          <PDFViewer />
        </div>

        {/* Right Panel - Extracted Data */}
        <div className="w-1/2">
          <ExtractedDataPanel onFieldEdit={handleFieldEdit} onReset={handleReset} />
        </div>
      </div>
    </div>
  );
}