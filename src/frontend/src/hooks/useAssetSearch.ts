import { useMemo } from 'react';
import { MarketType, type Asset } from '@/types';
import { assetCatalog } from '@/data/assetCatalog';
import { searchAssets } from '@/utils/assetSearch';

/**
 * Hook that performs live client-side filtering of asset catalog
 * Supports optional asset source override for specific market types (e.g., FIAT from VPS1)
 * No marketCap-based sorting applied for stocks (removed as per requirements)
 */
export function useAssetSearch(
  searchTerm: string,
  marketType: MarketType,
  assetSourceOverride?: Asset[]
): Asset[] {
  return useMemo(() => {
    const assets = assetSourceOverride || assetCatalog[marketType];
    const filtered = searchAssets(assets, searchTerm);

    // Apply marketCap sorting only for crypto (not stocks)
    if (marketType === MarketType.crypto) {
      return filtered.sort((a, b) => {
        const capA = a.marketCap || 0;
        const capB = b.marketCap || 0;
        return capB - capA; // Descending order (largest first)
      });
    }

    return filtered;
  }, [searchTerm, marketType, assetSourceOverride]);
}
