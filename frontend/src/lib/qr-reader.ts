/**
 * Decode QR code from an image File using jsQR
 * Returns the decoded URL string, or null if failed
 */
export async function decodeQRFromFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      import('jsqr').then(({ default: jsQR }) => {
        const result = jsQR(imageData.data, imageData.width, imageData.height);
        URL.revokeObjectURL(url);
        if (result?.data) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      }).catch(() => {
        URL.revokeObjectURL(url);
        resolve(null);
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Convert Google Drive share link to embeddable preview URL
 * Input:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * Output: https://drive.google.com/file/d/FILE_ID/preview
 */
export function convertGDriveToEmbed(url: string): string {
  if (!url) return url;
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch?.[1]) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  return url;
}

/**
 * Convert Google Drive image link to direct image URL for <img> src
 * Input:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * Output: https://lh3.googleusercontent.com/d/FILE_ID
 */
export function convertGDriveToDirectImage(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }
  return trimmed;
}

