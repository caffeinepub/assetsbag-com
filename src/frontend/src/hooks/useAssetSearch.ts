import { useMemo } from 'react';
import { MarketType, type Asset } from '@/types';
import { assetCatalog } from '@/data/assetCatalog';
import { searchAssets } from '@/utils/assetSearch';

/**
 * Hook that performs live client-side filtering of asset catalog
 * Supports optional asset source override for specific market types (e.g., FIAT from VPS1)
 */
export function useAssetSearch(
  searchTerm: string,
  marketType: MarketType,
  assetSourceOverride?: Asset[]
): Asset[] {
  return useMemo(() => {
    const assets = assetSourceOverride || assetCatalog[marketType];
    return searchAssets(assets, searchTerm);
  }, [searchTerm, marketType, assetSourceOverride]);
}
