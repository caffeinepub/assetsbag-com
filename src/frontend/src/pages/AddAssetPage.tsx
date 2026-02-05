import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MarketTypeSelector from '@/components/assets/MarketTypeSelector';
import AssetSearch from '@/components/assets/AssetSearch';
import AddHoldingForm from '@/components/portfolio/AddHoldingForm';
import { MarketType, type Asset } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function AddAssetPage() {
  const navigate = useNavigate();
  const [marketType, setMarketType] = useState<MarketType>(MarketType.crypto);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleBack = () => {
    if (selectedAsset) {
      setSelectedAsset(null);
    } else {
      navigate({ to: '/' });
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleSuccess = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add Asset to Portfolio</CardTitle>
          <CardDescription>
            {selectedAsset
              ? 'Enter your holding details'
              : 'Select market type and search for an asset'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedAsset ? (
            <>
              <MarketTypeSelector value={marketType} onChange={setMarketType} />
              <AssetSearch marketType={marketType} onSelect={handleAssetSelect} />
            </>
          ) : (
            <AddHoldingForm asset={selectedAsset} onSuccess={handleSuccess} onCancel={() => setSelectedAsset(null)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
