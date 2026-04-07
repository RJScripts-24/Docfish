import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { UploadZone, FileListItem } from '../components/features/upload/UploadComponents';
import { AdvancedSettings, AdvancedUploadSettings } from '../components/features/upload/AdvancedSettings';
import { RecentUploads } from '../components/features/upload/RecentUploads';
import { motion } from 'motion/react';
import { Sparkles, Trash2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useUploadQueue } from '../hooks/useUploadQueue';
import { timeAgo } from '../lib/format';

export default function UploadPage() {
  const navigate = useNavigate();
  const { uploadedFiles, completedCount, processingCount, addFiles, removeFile, clearAll } = useUploadQueue();
  const [settings, setSettings] = useState<AdvancedUploadSettings>({
    extractionMode: 'accurate',
    autoProcess: true,
    validation: true,
  });

  const handleFilesAdded = (files: File[]) => {
    void addFiles(files, {
      autoProcess: settings.autoProcess,
      extractionMode: settings.extractionMode,
      runValidation: settings.validation,
    });
  };

  const handleStartProcessing = () => {
    navigate('/documents');
  };

  const recentUploads = uploadedFiles
    .slice()
    .reverse()
    .slice(0, 5)
    .map((file) => ({
      id: file.id,
      name: file.file.name,
      subtitle:
        file.status === 'done'
          ? `Completed ${timeAgo(file.createdAt)}`
          : file.status === 'error'
          ? file.errorMessage || 'Upload failed'
          : `Updated ${timeAgo(file.createdAt)}`,
      status:
        file.status === 'error'
          ? 'error'
          : file.status === 'done'
          ? 'done'
          : file.status === 'uploaded'
          ? 'uploaded'
          : 'processing',
      path: file.documentId ? `/documents/${file.documentId}` : undefined,
    }));

  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
              <p className="text-gray-600 mt-1">Upload and process your invoice PDFs with AI</p>
            </div>
            <Link to="/documents">
              <button className="df-btn-secondary flex items-center gap-2">
                View Documents
                <ExternalLink className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Zone */}
              <UploadZone onFilesAdded={handleFilesAdded} />

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
                        {completedCount} completed, {processingCount} still processing
                      </p>
                    </div>
                    <button
                      onClick={clearAll}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 border-1.5 border-red-600 rounded-[6px] transition-all font-bold text-sm flex items-center gap-2 shadow-[3px_3px_0_red]"
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
              {(processingCount > 0 || completedCount > 0) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleStartProcessing}
                  className="df-btn-primary w-full py-4 text-lg mb-8"
                >
                  <Sparkles className="w-6 h-6" />
                  {processingCount > 0
                    ? `Processing ${processingCount} ${processingCount === 1 ? 'Document' : 'Documents'}`
                    : `Review ${completedCount} ${completedCount === 1 ? 'Document' : 'Documents'}`}
                  <p className="text-[10px] font-normal text-gray-800 absolute bottom-1 uppercase tracking-tight">
                    {processingCount > 0 ? 'Uploads have started on the backend' : 'Open the review workspace'}
                  </p>
                </motion.button>
              )}

              {/* Advanced Settings */}
              <AdvancedSettings value={settings} onChange={setSettings} />
            </div>

            {/* Sidebar - Recent Uploads */}
            <div className="lg:col-span-1">
              <RecentUploads uploads={recentUploads} />
            </div>
          </div>
    </DashboardPageLayout>
  );
}
