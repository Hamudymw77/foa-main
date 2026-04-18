export type ImageCompressionOptions = {
  maxSizePx?: number;
  targetBytes?: number;
  mimeType?: 'image/webp' | 'image/jpeg';
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function fileToImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load failed'));
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Canvas export failed'));
        else resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function compressImageFile(input: File, options: ImageCompressionOptions = {}) {
  const maxSizePx = options.maxSizePx ?? 300;
  const targetBytes = options.targetBytes ?? 50 * 1024;

  const preferredMime = options.mimeType ?? 'image/webp';
  const webpSupported =
    typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined'
      ? document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')
      : false;

  const mimeType = preferredMime === 'image/webp' && webpSupported ? 'image/webp' : 'image/jpeg';

  const img = await fileToImage(input);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const scale = Math.min(1, maxSizePx / Math.max(srcW, srcH));
  const outW = Math.max(1, Math.round(srcW * scale));
  const outH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas not supported');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, outW, outH);

  const attempts = [
    0.82, 0.75, 0.68, 0.6, 0.52, 0.45, 0.4
  ].map((q) => clamp(q, 0.2, 0.95));

  let best: Blob | null = null;
  for (const q of attempts) {
    const blob = await canvasToBlob(canvas, mimeType, q);
    best = blob;
    if (blob.size <= targetBytes) break;
  }

  if (!best) throw new Error('Compression failed');

  const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
  const baseName = input.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([best], `${baseName}.${ext}`, { type: mimeType });
}

