import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { MarketType, type Asset } from '@/types';
import { useAssetSearch } from '@/hooks/useAssetSearch';
import { useFiatVPS1Assets } from '@/hooks/useFiatVPS1';
import { useCommoditiesVPS1Assets } from '@/hooks/useCommoditiesVPS1';
import { useStocksWorker0Assets } from '@/hooks/useStocksWorker0';

interface AssetSearchProps {
  marketType: MarketType;
  onSelect: (asset: Asset) => void;
}

export default function AssetSearch({ marketType, onSelect }: AssetSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Enable FIAT VPS1 data fetching only when FIAT market type is selected
  const isFiatMarket = marketType === MarketType.fiat;
  const {
    assets: fiatAssets,
    validationStatus: fiatValidationStatus,
    error: fiatError,
    isLoading: fiatLoading,
    refetch: refetchFiat,
  } = useFiatVPS1Assets(isFiatMarket);

  // Enable Commodities VPS1 data fetching only when Commodities market type is selected
  const isCommoditiesMarket = marketType === MarketType.commodities;
  const {
    assets: commoditiesAssets,
    validationStatus: commoditiesValidationStatus,
    error: commoditiesError,
    isLoading: commoditiesLoading,
    refetch: refetchCommodities,
  } = useCommoditiesVPS1Assets(isCommoditiesMarket);

  // Enable Stocks Worker0 data fetching only when Stocks market type is selected
  const isStocksMarket = marketType === MarketType.stocks;
  const {
    assets: stocksAssets,
    validationStatus: stocksValidationStatus,
    error: stocksError,
    isLoading: stocksLoading,
    refetch: refetchStocks,
  } = useStocksWorker0Assets(isStocksMarket);

  // Use FIAT assets from VPS1 when available and valid, otherwise use static catalog
  const fiatAssetSource = isFiatMarket && fiatValidationStatus === 'valid' && fiatAssets.length > 0
    ? fiatAssets
    : undefined;

  // Use Commodities assets from VPS1 when available and valid, otherwise use static catalog
  const commoditiesAssetSource = isCommoditiesMarket && commoditiesValidationStatus === 'valid' && commoditiesAssets.length > 0
    ? commoditiesAssets
    : undefined;

  // Use Stocks assets from Worker0 when available and valid, otherwise use static catalog
  const stocksAssetSource = isStocksMarket && stocksValidationStatus === 'valid' && stocksAssets.length > 0
    ? stocksAssets
    : undefined;

  // Determine which asset source to use
  const assetSource = fiatAssetSource || commoditiesAssetSource || stocksAssetSource;

  const results = useAssetSearch(searchTerm, marketType, assetSource);

  // Reset search term when market type changes
  useEffect(() => {
    setSearchTerm('');
    setIsOpen(false);
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

  // Show loading state for Commodities while fetching
  if (isCommoditiesMarket && commoditiesLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asset-search">Search Asset</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="asset-search"
              placeholder="Loading commodities..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading commodities from live data source...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state for Stocks while fetching
  if (isStocksMarket && stocksLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asset-search">Search Asset</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="asset-search"
              placeholder="Loading stocks..."
              disabled
              className="pl-10"
            />
          </div>
        </div>
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading stocks from live data source...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show error state for FIAT with retry option
  if (isFiatMarket && (fiatValidationStatus === 'invalid' || fiatError)) {
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
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
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
        {/* Show search results from fallback catalog when open or searching */}
        {(isOpen || searchTerm) && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchTerm ? `No assets found matching "${searchTerm}"` : 'No assets available'}
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

  // Show error state for Commodities with retry option
  if (isCommoditiesMarket && (commoditiesValidationStatus === 'invalid' || commoditiesError)) {
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
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              className="pl-10"
            />
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {commoditiesError || 'Failed to load commodities. Using fallback data.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchCommodities()}
              className="ml-2 gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        {/* Show search results from fallback catalog when open or searching */}
        {(isOpen || searchTerm) && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchTerm ? `No assets found matching "${searchTerm}"` : 'No assets available'}
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

  // Show error state for Stocks with retry option
  if (isStocksMarket && (stocksValidationStatus === 'invalid' || stocksError)) {
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
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              className="pl-10"
            />
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {stocksError || 'Failed to load stocks. Using fallback data.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStocks()}
              className="ml-2 gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        {/* Show search results from fallback catalog when open or searching */}
        {(isOpen || searchTerm) && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchTerm ? `No assets found matching "${searchTerm}"` : 'No assets available'}
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
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Show search results when open or searching */}
      {(isOpen || searchTerm) && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchTerm ? `No assets found matching "${searchTerm}"` : 'No assets available'}
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
