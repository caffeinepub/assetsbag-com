import { useGetPortfolio } from '@/hooks/usePortfolio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HoldingsList from '@/components/portfolio/HoldingsList';
import { Plus, Wallet } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { usePriceRefreshPlaceholder } from '@/hooks/usePriceRefreshPlaceholder';

export default function DashboardPage() {
  const { data: portfolio, isLoading } = useGetPortfolio();
  const navigate = useNavigate();
  
  // Placeholder for future price refresh functionality
  usePriceRefreshPlaceholder();

  const handleAddAsset = () => {
    navigate({ to: '/add-asset' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const hasHoldings = portfolio && portfolio.holdings.length > 0;

  if (!hasHoldings) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-lg text-center shadow-lg border-2">
          <CardHeader className="space-y-4 pb-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Start Building Your Portfolio</CardTitle>
              <CardDescription className="mt-2 text-base">
                Track all your investments in one place. Add your first asset to get started.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAddAsset} size="lg" className="w-full h-12 text-base font-semibold">
              <Plus className="mr-2 h-5 w-5" />
              Add First Asset
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Portfolio</h2>
          <p className="text-muted-foreground mt-1">
            {portfolio.holdings.length} {portfolio.holdings.length === 1 ? 'asset' : 'assets'} tracked
          </p>
        </div>
        <Button onClick={handleAddAsset} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <HoldingsList holdings={portfolio.holdings} />
    </div>
  );
}
