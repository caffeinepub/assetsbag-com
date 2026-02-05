import { MarketType } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MarketTypeSelectorProps {
  value: MarketType;
  onChange: (value: MarketType) => void;
}

const marketTypeLabels: Record<MarketType, string> = {
  [MarketType.crypto]: 'Cryptocurrency',
  [MarketType.stocks]: 'Stocks',
  [MarketType.commodities]: 'Commodities',
  [MarketType.fiat]: 'Fiat Currency',
};

export default function MarketTypeSelector({ value, onChange }: MarketTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="market-type">Market Type</Label>
      <Select value={value} onValueChange={(val) => onChange(val as MarketType)}>
        <SelectTrigger id="market-type" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(marketTypeLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
