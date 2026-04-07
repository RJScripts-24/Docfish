import fs from 'fs/promises';
import path from 'path';

class StorageService {
  private readonly uploadRoot = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');

  private async ensureDirectory(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async saveJsonResult(documentId: string, payload: unknown) {
    const resultsDir = path.join(this.uploadRoot, 'results');
    await this.ensureDirectory(resultsDir);

    const outputPath = path.join(resultsDir, `${documentId}.json`);
    await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf-8');

    return outputPath;
  }

  async deleteJsonResult(documentId: string) {
    const resultsDir = path.join(this.uploadRoot, 'results');
    const outputPath = path.join(resultsDir, `${documentId}.json`);

    try {
      await fs.unlink(outputPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
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
}

export default new StorageService();
