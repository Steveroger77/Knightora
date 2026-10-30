/**
 * Knightora Instant Background Preloader
 * Pre-caches all high-efficiency WebP atmosphere backgrounds into browser memory
 * ensuring instant 0ms transitions without network lag or layout flashes.
 */

const BACKGROUND_URLS = [
  '/backgrounds/knight-login.webp',
  '/backgrounds/knight-day.webp',
  '/backgrounds/knight-sunset.webp',
  '/backgrounds/knight-cloudy.webp',
  '/backgrounds/knight-night.webp',
  '/knight-logo.webp',
];

// Fallback PNGs preloaded with lower priority
const FALLBACK_URLS = [
  '/backgrounds/knight-login.png',
  '/backgrounds/knight-day.png',
];

const preloadedCache = new Set<string>();
const persistentImageInstances: HTMLImageElement[] = [];

export function preloadImage(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  if (preloadedCache.has(url)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    if ('fetchPriority' in img) {
      // Modern Chromium / Safari fetchPriority
      (img as any).fetchPriority = priority;
    }
    img.src = url;
    img.onload = () => {
      preloadedCache.add(url);
      persistentImageInstances.push(img); // Retain hard reference to keep decoded raster in GPU cache
      resolve();
    };
    img.onerror = () => {
      // Silently handle error, won't break app
      resolve();
    };
  });
}

export function initBackgroundPreloader(): void {
  if (typeof window === 'undefined') return;

  // Immediately preload high priority critical login & atmosphere backgrounds (both WebP & fallback PNG)
  preloadImage('/backgrounds/knight-login.webp', 'high');
  preloadImage('/backgrounds/knight-login.png', 'high');
  preloadImage('/backgrounds/knight-day.webp', 'high');
  preloadImage('/backgrounds/knight-sunset.webp', 'high');

  // Preload secondary atmosphere backgrounds in idle time or slight delay
  const preloadRemaining = () => {
    BACKGROUND_URLS.forEach((url) => {
      preloadImage(url, 'low');
    });
    FALLBACK_URLS.forEach((url) => {
      preloadImage(url, 'low');
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(preloadRemaining, { timeout: 1200 });
  } else {
    setTimeout(preloadRemaining, 100);
  }
}

