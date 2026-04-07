import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const commandAvailabilityCache = new Map<string, boolean>();
type ImageCommand = 'magick' | 'convert';

const commandExists = async (command: string) => {
  if (commandAvailabilityCache.has(command)) {
    return commandAvailabilityCache.get(command) as boolean;
  }

  try {
    if (process.platform === 'win32') {
      await execFileAsync('where', [command]);
    } else {
      await execFileAsync('which', [command]);
    }

    commandAvailabilityCache.set(command, true);
    return true;
  } catch (_error) {
    commandAvailabilityCache.set(command, false);
    return false;
  }
};

const isEnabled = (value: string | undefined, fallback = true) => {
  if (!value) {
    return fallback;
  }

  return value.toLowerCase() !== 'false';
};

const detectImageCommand = async (): Promise<ImageCommand | null> => {
  if (await commandExists('magick')) {
    return 'magick';
  }

  if (await commandExists('convert')) {
    return 'convert';
  }

  return null;
};

const runImageCommand = async (
  imageCommand: ImageCommand,
  inputPath: string,
  operations: string[],
  outputPath: string
) => {
  const args = [inputPath, ...operations, outputPath];
  await execFileAsync(imageCommand, args);
};

const preprocessImage = async (
  sourcePath: string,
  tempDir: string,
  imageCommand: ImageCommand | null,
  enablePreprocess: boolean
) => {
  if (!enablePreprocess || !imageCommand) {
    return sourcePath;
  }

  const processedPath = path.join(
    tempDir,
    `${path.parse(path.basename(sourcePath)).name}-preprocessed.png`
  );

  try {
    await runImageCommand(
      imageCommand,
      sourcePath,
      ['-auto-orient', '-deskew', '40%', '-normalize', '-sharpen', '0x1.0'],
      processedPath
    );

    return processedPath;
  } catch (error) {
    console.warn('[OCR] Preprocessing failed for page; using original rasterized image', {
      sourcePath,
      error: error instanceof Error ? error.message : String(error),
    });
    return sourcePath;
  }
};

const buildRotationVariants = async (
  sourcePath: string,
  tempDir: string,
  imageCommand: ImageCommand | null,
  enableRotationVariants: boolean
) => {
  const variants = [sourcePath];

  if (!enableRotationVariants || !imageCommand) {
    return variants;
  }

  for (const angle of [90, 180, 270]) {
    const rotatedPath = path.join(
      tempDir,
      `${path.parse(path.basename(sourcePath)).name}-rot-${angle}.png`
    );

    try {
      await runImageCommand(imageCommand, sourcePath, ['-rotate', String(angle)], rotatedPath);
      variants.push(rotatedPath);
    } catch (_error) {
      // Skip this angle and continue with remaining candidates.
    }
  }

  return variants;
};

const scoreTextQuality = (text: string) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const alpha = (cleaned.match(/[A-Za-z]/g) || []).length;
  const digits = (cleaned.match(/\d/g) || []).length;
  const words = cleaned ? cleaned.split(' ').length : 0;

  return cleaned.length + alpha * 0.5 + digits * 0.25 + words * 2;
};

const runTesseractCandidates = async (imagePath: string) => {
  const psmCandidates = ['6', '4', '11', '1'];
  let bestText = '';
  let bestScore = -Infinity;

  for (const psm of psmCandidates) {
    try {
      const { stdout } = await execFileAsync('tesseract', [imagePath, 'stdout', '--psm', psm]);
      const candidate = (stdout || '').trim();

      if (!candidate) {
        continue;
      }

      const score = scoreTextQuality(candidate);

      if (score > bestScore) {
        bestScore = score;
        bestText = candidate;
      }
    } catch (_error) {
      // Continue trying other page segmentation modes.
    }
  }

  return bestText;
};

const normalizeOcrText = (text: string) =>
  text
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export async function extractTextViaOcr(filePath: string, maxPages = 3): Promise<string | null> {
  const enablePreprocess = isEnabled(process.env.OCR_ENABLE_PREPROCESS, true);
  const enableRotationVariants = isEnabled(process.env.OCR_ENABLE_ROTATION_VARIANTS, true);
  const hasPdfToPpm = await commandExists('pdftoppm');
  const hasTesseract = await commandExists('tesseract');

  if (!hasPdfToPpm || !hasTesseract) {
    console.warn('[OCR] OCR skipped because required system tools are unavailable', {
      hasPdfToPpm,
      hasTesseract,
    });
    return null;
  }

  const imageCommand = await detectImageCommand();

  if ((enablePreprocess || enableRotationVariants) && !imageCommand) {
    console.info('[OCR] Image preprocessing/rotation variants skipped; ImageMagick is unavailable');
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docfish-ocr-'));
  const pagePrefix = path.join(tempDir, 'page');

  try {
    await execFileAsync('pdftoppm', [
      '-f',
      '1',
      '-l',
      String(Math.max(1, maxPages)),
      '-r',
      '300',
      '-gray',
      '-png',
      filePath,
      pagePrefix,
    ]);

    const files = (await fs.readdir(tempDir))
      .filter((entry) => entry.startsWith('page-') && entry.endsWith('.png'))
      .sort((a, b) => a.localeCompare(b));

    if (files.length === 0) {
      console.warn('[OCR] No page rasters were produced by pdftoppm', {
        filePath,
      });
      return null;
    }

    const chunks: string[] = [];

    for (const file of files) {
      const imagePath = path.join(tempDir, file);

      try {
        const preprocessed = await preprocessImage(
          imagePath,
          tempDir,
          imageCommand,
          enablePreprocess
        );
        const variants = await buildRotationVariants(
          preprocessed,
          tempDir,
          imageCommand,
          enableRotationVariants
        );

        let bestText = '';
        let bestScore = -Infinity;

        for (const variantPath of variants) {
          const candidate = await runTesseractCandidates(variantPath);
          const score = scoreTextQuality(candidate);

          if (score > bestScore) {
            bestScore = score;
            bestText = candidate;
          }
        }

        if (bestText) {
          chunks.push(bestText);
        }
      } catch (error) {
        console.warn('[OCR] OCR failed for one page variant group; continuing', {
          page: file,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue OCR attempts for remaining pages.
      }
    }

    const normalized = normalizeOcrText(chunks.join('\n\n'));
    if (!normalized) {
      console.warn('[OCR] OCR completed but produced empty text', { filePath });
    }
    return normalized || null;
  } catch (error) {
    console.warn('[OCR] OCR pipeline failed', {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
