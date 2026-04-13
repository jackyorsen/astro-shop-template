
// This file is deprecated. Image optimization is now handled directly by serving full resolution images to ensure maximum sharpness.
// Previous canvas-based resize logic removed to prevent blurriness.

export async function getOptimizedImage(url: string, variant: 'full' | 'small' | 'lqip'): Promise<string> {
  return url;
}
