import { useMemo } from 'react';
import { MarketType, type Asset } from '@/backend';
import { assetCatalog } from '@/data/assetCatalog';
import { searchAssets } from '@/utils/assetSearch';

export function useAssetSearch(searchTerm: string, marketType: MarketType): Asset[] {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    
    const catalogForMarket = assetCatalog[marketType] || [];
    return searchAssets(catalogForMarket, searchTerm);
  }, [searchTerm, marketType]);
}
