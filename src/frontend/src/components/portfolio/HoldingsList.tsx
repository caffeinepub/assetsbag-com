import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Holding, MarketType } from '@/types';

interface HoldingsListProps {
  holdings: Holding[];
}

const marketTypeLabels: Record<MarketType, string> = {
  crypto: 'Crypto',
  stocks: 'Stock',
  commodities: 'Commodity',
  fiat: 'Fiat',
};

const marketTypeColors: Record<MarketType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  crypto: 'default',
  stocks: 'secondary',
  commodities: 'outline',
  fiat: 'outline',
};

export default function HoldingsList({ holdings }: HoldingsListProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Purchase Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding, index) => (
            <TableRow key={`${holding.asset.ticker}-${index}`}>
              <TableCell>
                <div>
                  <div className="font-semibold">{holding.asset.ticker}</div>
                  <div className="text-sm text-muted-foreground">{holding.asset.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={marketTypeColors[holding.asset.marketType]}>
                  {marketTypeLabels[holding.asset.marketType]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {holding.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 8,
                })}
              </TableCell>
              <TableCell className="text-right">
                {holding.purchasePrice > 0
                  ? `$${holding.purchasePrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
