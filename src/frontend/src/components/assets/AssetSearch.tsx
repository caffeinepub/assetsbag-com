import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { MarketType, type Asset } from '@/types';
import { useAssetSearch } from '@/hooks/useAssetSearch';
import { useFiatVPS1Assets } from '@/hooks/useFiatVPS1';

interface AssetSearchProps {
  marketType: MarketType;
  onSelect: (asset: Asset) => void;
}

export default function AssetSearch({ marketType, onSelect }: AssetSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enable FIAT VPS1 data fetching only when FIAT market type is selected
  const isFiatMarket = marketType === MarketType.fiat;
  const {
    assets: fiatAssets,
    validationStatus,
    error: fiatError,
    isLoading: fiatLoading,
    refetch: refetchFiat,
  } = useFiatVPS1Assets(isFiatMarket);

  // Use FIAT assets from VPS1 when available and valid, otherwise use static catalog
  const assetSource = isFiatMarket && validationStatus === 'valid' && fiatAssets.length > 0
    ? fiatAssets
    : undefined;

  const results = useAssetSearch(searchTerm, marketType, assetSource);

  // Reset search term when market type changes
  useEffect(() => {
    setSearchTerm('');
  }, [marketType]);

  // Show loading state for FIAT while fetching
  if (isFiatMarket && fiatLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asset-search">Search Asset</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="asset-search"
              placeholder="Loading FIAT currencies..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading FIAT currencies from live data source...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show error state for FIAT with retry option
  if (isFiatMarket && (validationStatus === 'invalid' || fiatError)) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asset-search">Search Asset</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="asset-search"
              placeholder="Search by ticker or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {fiatError || 'Failed to load FIAT currencies. Using fallback data.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchFiat()}
              className="ml-2 gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        {/* Still show search results from fallback catalog */}
        {searchTerm && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No assets found matching "{searchTerm}"
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {results.map((asset) => (
                  <Button
                    key={asset.ticker}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => onSelect(asset)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{asset.ticker}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show success message for FIAT when live data is loaded
  const showFiatSuccessMessage = isFiatMarket && validationStatus === 'valid' && fiatAssets.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="asset-search">Search Asset</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="asset-search"
            placeholder="Search by ticker or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {showFiatSuccessMessage && (
        <Alert className="bg-primary/5 border-primary/20">
          <AlertDescription className="text-sm">
            Showing {fiatAssets.length} live FIAT currencies from fx_rates.json
          </AlertDescription>
        </Alert>
      )}

      {searchTerm && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No assets found matching "{searchTerm}"
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {results.map((asset) => (
                <Button
                  key={asset.ticker}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => onSelect(asset)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{asset.ticker}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
