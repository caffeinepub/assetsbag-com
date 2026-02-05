import { useState } from 'react';
import { useAddHolding } from '@/hooks/useAddHolding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Asset } from '@/backend';

interface AddHoldingFormProps {
  asset: Asset;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddHoldingForm({ asset, onSuccess, onCancel }: AddHoldingFormProps) {
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  
  const addHolding = useAddHolding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantityNum = parseFloat(quantity);
    if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const purchasePriceNum = purchasePrice ? parseFloat(purchasePrice) : 0;
    if (purchasePrice && (isNaN(purchasePriceNum) || purchasePriceNum < 0)) {
      toast.error('Please enter a valid purchase price');
      return;
    }

    try {
      await addHolding.mutateAsync({
        asset,
        amount: quantityNum,
        purchasePrice: purchasePriceNum,
      });
      toast.success(`${asset.ticker} added to portfolio`);
      onSuccess();
    } catch (error) {
      toast.error('Failed to add asset. Please try again.');
      console.error('Add holding error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="font-semibold text-lg">{asset.ticker}</div>
        <div className="text-sm text-muted-foreground">{asset.name}</div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            step="any"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={addHolding.isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase-price">Purchase Price (optional)</Label>
          <Input
            id="purchase-price"
            type="number"
            step="any"
            placeholder="0.00"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            disabled={addHolding.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase-date">Purchase Date (optional)</Label>
          <Input
            id="purchase-date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            disabled={addHolding.isPending}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={addHolding.isPending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={addHolding.isPending || !quantity}
          className="flex-1"
        >
          {addHolding.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Adding...
            </>
          ) : (
            'Add to Portfolio'
          )}
        </Button>
      </div>
    </form>
  );
}
