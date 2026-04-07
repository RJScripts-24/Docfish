import { motion } from 'motion/react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { useState, useCallback, DragEvent } from 'react';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function UploadZone({ onFilesAdded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );

    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesAdded(files);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-3 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-teal-500 bg-teal-50 scale-[1.02] shadow-xl'
          : 'border-gray-300 bg-white hover:border-teal-400 hover:bg-teal-50/50'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        accept="application/pdf"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      <label htmlFor="file-upload" className="cursor-pointer">
        <motion.div
          animate={{
            scale: isDragging ? 1.1 : 1,
            rotate: isDragging ? [0, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
          className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
            isDragging
              ? 'bg-gradient-to-br from-teal-400 to-teal-600'
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}
        >
          <Upload className={`w-12 h-12 ${isDragging ? 'text-white' : 'text-gray-600'}`} />
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {isDragging ? 'Drop your files here' : 'Drag & drop your invoices here'}
        </h3>
        <p className="text-gray-600 mb-4">or click to browse files</p>

        <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 mb-6">
          Supports PDF files only
        </div>

        <p className="text-sm text-gray-500">
          Upload single or multiple invoices (bulk supported)
        </p>
      </label>

      {/* Security Badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Your documents are securely processed and encrypted</span>
      </div>
    </motion.div>
  );
}

interface FileListItemProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

export function FileListItem({ file, onRemove }: FileListItemProps) {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return (
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-teal-500';
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'completed':
        return 'Uploaded successfully';
      case 'error':
        return file.errorMessage || 'Upload failed';
      default:
        return 'Uploading...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
    >
      {/* File Icon */}
      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
        <File className="w-6 h-6 text-blue-600" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-medium text-gray-900 truncate">{file.file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <button
              onClick={() => onRemove(file.id)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {file.status === 'uploading' && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              className={`h-full ${getStatusColor()}`}
            />
          </div>
        )}

        {/* Status Text */}
        <p className={`text-xs mt-1 ${
          file.status === 'error' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {getStatusText()}
        </p>
      </div>
    </motion.div>
  );
}
