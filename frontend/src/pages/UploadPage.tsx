import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { UploadZone, FileListItem } from '../components/features/upload/UploadComponents';
import { AdvancedSettings } from '../components/features/upload/AdvancedSettings';
import { RecentUploads } from '../components/features/upload/RecentUploads';
import { motion } from 'motion/react';
import { Sparkles, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { useUploadQueue } from '../hooks/useUploadQueue';
import { showInfo } from '../services/feedback';

export default function UploadPage() {
  const { uploadedFiles, completedCount, addFiles, removeFile, clearAll } = useUploadQueue();

  const handleStartProcessing = () => {
    showInfo('Processing started! AI will extract and validate invoice data.');
  };

  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
              <p className="text-gray-600 mt-1">Upload and process your invoice PDFs with AI</p>
            </div>
            <Link to="/documents">
              <button className="px-5 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 flex items-center gap-2">
                View Documents
                <ExternalLink className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Zone */}
              <UploadZone onFilesAdded={addFiles} />

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Uploaded Files ({uploadedFiles.length})
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {completedCount} of {uploadedFiles.length} completed
                      </p>
                    </div>
                    <button
                      onClick={clearAll}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {uploadedFiles.map(file => (
                      <FileListItem
                        key={file.id}
                        file={file}
                        onRemove={removeFile}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Start Processing Button */}
              {completedCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleStartProcessing}
                  className="w-full relative py-4 bg-[var(--df-lime)] text-gray-900 rounded-xl font-semibold text-lg shadow-sm hover:bg-[#7BC942] transition-colors flex items-center justify-center gap-3 border border-transparent"
                >
                  <Sparkles className="w-6 h-6" />
                  Start Processing ({completedCount} {completedCount === 1 ? 'Document' : 'Documents'})
                  <p className="text-xs font-normal text-gray-700 absolute bottom-1">
                    AI will extract and validate invoice data
                  </p>
                </motion.button>
              )}

              {/* Advanced Settings */}
              <AdvancedSettings />
            </div>

            {/* Sidebar - Recent Uploads */}
            <div className="lg:col-span-1">
              <RecentUploads />
            </div>
          </div>
    </DashboardPageLayout>
  );
}