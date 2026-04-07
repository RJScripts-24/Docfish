import { useCallback, useEffect, useMemo, useState } from 'react';
import { createId } from '../utils/createId';
import { getUploadStatus, uploadDocuments } from '../lib/api';

export interface UploadedFile {
  id: string;
  file: File;
  uploadId?: string;
  documentId?: string;
  progress: number;
  status: 'uploading' | 'uploaded' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  createdAt: string;
}

export function useUploadQueue() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const newFiles: UploadedFile[] = files.map((file) => ({
        id: createId(),
        file,
        progress: 0,
        status: 'uploading',
        createdAt: new Date().toISOString(),
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      try {
        const response = await uploadDocuments(files, true);

        setUploadedFiles((prev) =>
          prev.map((currentFile, index) => {
            const localIndex = newFiles.findIndex((item) => item.id === currentFile.id);

            if (localIndex === -1) {
              return currentFile;
            }

            const upload = response.uploads[localIndex];

            if (!upload) {
              return {
                ...currentFile,
                status: 'error',
                progress: 100,
                errorMessage: 'Upload did not return a server job.',
              };
            }

            return {
              ...currentFile,
              uploadId: upload.id,
              documentId: upload.documentId,
              progress: upload.progress,
              status: upload.status,
              errorMessage: upload.errorMessage,
            };
          })
        );
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((currentFile) =>
            newFiles.some((item) => item.id === currentFile.id)
              ? {
                  ...currentFile,
                  status: 'error',
                  progress: 100,
                  errorMessage: error instanceof Error ? error.message : 'Upload failed',
                }
              : currentFile
          )
        );
      }
    },
    []
  );

  useEffect(() => {
    const activeUploads = uploadedFiles.filter(
      (file) => file.uploadId && (file.status === 'uploaded' || file.status === 'processing' || file.status === 'uploading')
    );

    if (activeUploads.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      void Promise.all(
        activeUploads.map(async (file) => {
          if (!file.uploadId) {
            return;
          }

          try {
            const status = await getUploadStatus(file.uploadId);

            setUploadedFiles((prev) =>
              prev.map((currentFile) =>
                currentFile.id === file.id
                  ? {
                      ...currentFile,
                      documentId: status.documentId,
                      progress: status.progress,
                      status: status.status,
                      errorMessage: status.errorMessage,
                    }
                  : currentFile
              )
            );
          } catch (_error) {
            setUploadedFiles((prev) =>
              prev.map((currentFile) =>
                currentFile.id === file.id
                  ? {
                      ...currentFile,
                      status: 'error',
                      progress: 100,
                      errorMessage: 'Failed to refresh upload status.',
                    }
                  : currentFile
              )
            );
          }
        })
      );
    }, 2500);

    return () => {
      window.clearInterval(interval);
    };
  }, [uploadedFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const completedCount = useMemo(
    () => uploadedFiles.filter((file) => file.status === 'done').length,
    [uploadedFiles]
  );

  const processingCount = useMemo(
    () => uploadedFiles.filter((file) => file.status === 'uploaded' || file.status === 'processing').length,
    [uploadedFiles]
  );

  return {
    uploadedFiles,
    completedCount,
    processingCount,
    addFiles,
    removeFile,
    clearAll,
  };
}
