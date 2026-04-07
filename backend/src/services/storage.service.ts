import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface StoredFileMetadata {
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
}

class StorageService {
  private readonly uploadRoot = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');

  private async ensureDirectory(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  private buildFilename(originalName: string) {
    const extension = path.extname(originalName) || '.pdf';
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    return `${baseName}-${uniqueSuffix}${extension}`;
  }

  async saveUploadedFile(file: Express.Multer.File): Promise<StoredFileMetadata> {
    await this.ensureDirectory(this.uploadRoot);

    const filename = this.buildFilename(file.originalname);
    const destinationPath = path.join(this.uploadRoot, filename);

    if (file.buffer) {
      await fs.writeFile(destinationPath, file.buffer);
    } else if (file.path) {
      await fs.copyFile(file.path, destinationPath);
    } else {
      throw new Error('Uploaded file content is missing');
    }

    const stats = await fs.stat(destinationPath);

    return {
      originalName: file.originalname,
      filename,
      mimeType: file.mimetype || 'application/pdf',
      size: stats.size,
      path: destinationPath,
    };
  }

  async saveJsonResult(documentId: string, payload: unknown) {
    const resultsDir = path.join(this.uploadRoot, 'results');
    await this.ensureDirectory(resultsDir);

    const outputPath = path.join(resultsDir, `${documentId}.json`);
    await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf-8');

    return outputPath;
  }

  async readFileBuffer(filePath: string) {
    return fs.readFile(filePath);
  }

  async deleteFile(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getPublicFilePath(filePath: string) {
    return filePath;
  }
}

export default new StorageService();