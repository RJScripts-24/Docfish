import { useCallback, useMemo, useState } from 'react';
import { createId } from '../utils/createId';

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export function useUploadQueue() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const simulateUpload = useCallback((fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setUploadedFiles((prev) =>
          prev.map((currentFile) =>
            currentFile.id === fileId
              ? { ...currentFile, progress: 100, status: 'completed' as const }
              : currentFile
          )
        );
      } else {
        setUploadedFiles((prev) =>
          prev.map((currentFile) =>
            currentFile.id === fileId ? { ...currentFile, progress } : currentFile
          )
        );
      }
    }, 500);
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const newFiles: UploadedFile[] = files.map((file) => ({
        id: createId(),
        file,
        progress: 0,
        status: 'uploading',
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach((uploadedFile) => simulateUpload(uploadedFile.id));
    },
    [simulateUpload]
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const completedCount = useMemo(
    () => uploadedFiles.filter((file) => file.status === 'completed').length,
    [uploadedFiles]
  );

  return {
    uploadedFiles,
    completedCount,
    addFiles,
    removeFile,
    clearAll,
  };
}
