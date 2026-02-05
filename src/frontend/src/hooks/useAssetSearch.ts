import { useMemo } from 'react';
import { MarketType, type Asset } from '@/types';
import { assetCatalog } from '@/data/assetCatalog';
import { searchAssets } from '@/utils/assetSearch';

export function useAssetSearch(searchTerm: string, marketType: MarketType): Asset[] {
  return useMemo(() => {
    const assets = assetCatalog[marketType];
    return searchAssets(assets, searchTerm);
  }, [searchTerm, marketType]);
}
