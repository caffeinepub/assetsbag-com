import type { Asset } from '@/types';

/**
 * Search assets by ticker or name (case-insensitive)
 */
export function searchAssets(assets: Asset[], searchTerm: string): Asset[] {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) {
    return [];
  }

  return assets.filter((asset) => {
    const tickerMatch = asset.ticker.toLowerCase().includes(term);
    const nameMatch = asset.name.toLowerCase().includes(term);
    return tickerMatch || nameMatch;
  });
}
