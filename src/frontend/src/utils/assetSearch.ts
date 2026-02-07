import type { Asset } from '@/types';

/**
 * Search assets by ticker or name (case-insensitive)
 * Returns full list if searchTerm is empty (for focus-driven display)
 */
export function searchAssets(assets: Asset[], searchTerm: string): Asset[] {
  const term = searchTerm.toLowerCase().trim();
  
  // Return full list when no search term (for focus-driven display)
  if (!term) {
    return assets;
  }

  return assets.filter((asset) => {
    const tickerMatch = asset.ticker.toLowerCase().includes(term);
    const nameMatch = asset.name.toLowerCase().includes(term);
    return tickerMatch || nameMatch;
  });
}
