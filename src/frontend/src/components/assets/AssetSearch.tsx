import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { MarketType, type Asset } from '@/types';
import { useAssetSearch } from '@/hooks/useAssetSearch';

interface AssetSearchProps {
  marketType: MarketType;
  onSelect: (asset: Asset) => void;
}

export default function AssetSearch({ marketType, onSelect }: AssetSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const results = useAssetSearch(searchTerm, marketType);

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
