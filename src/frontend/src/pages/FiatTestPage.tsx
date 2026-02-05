import { useFetchFiatVPS1Data, useGetFiatVPS1ValidationResult } from '@/hooks/useFiatVPS1';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function FiatTestPage() {
  const fetchMutation = useFetchFiatVPS1Data();
  const { data: validationResult, isLoading } = useGetFiatVPS1ValidationResult();

  const handleFetch = async () => {
    try {
      const response = await fetchMutation.mutateAsync();
      toast.success('FIAT data fetched successfully');
      console.log('Raw response:', response);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch FIAT data');
      console.error('Fetch error:', error);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">FIAT VPS1 Test</h2>
        <p className="text-muted-foreground mt-1">
          Test the FIAT currency data fetch from VPS1
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fetch FIAT Data</CardTitle>
          <CardDescription>
            Endpoint: http://74.208.158.232/fx_rates.json
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleFetch}
            disabled={fetchMutation.isPending}
            className="gap-2"
          >
            {fetchMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Fetch FIAT Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-sm text-muted-foreground">Loading validation result...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && validationResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Validation Result</CardTitle>
              <Badge variant={validationResult.validationStatus === 'valid' ? 'default' : 'destructive'}>
                {validationResult.validationStatus === 'valid' ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {validationResult.validationStatus.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">URL:</span>
                <span className="font-mono text-xs">{validationResult.requestedUrl}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-mono text-xs">{formatTimestamp(validationResult.timestamp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Body Size:</span>
                <span className="font-mono text-xs">
                  {validationResult.rawResponseBody.length} chars
                  {validationResult.isTruncated && ' (truncated)'}
                </span>
              </div>
            </div>

            {validationResult.isTruncated && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Response body was truncated due to size limit (max 100,000 bytes)
                </AlertDescription>
              </Alert>
            )}

            {validationResult.errorMessage && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{validationResult.errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Raw Response Body:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(validationResult.rawResponseBody);
                    toast.success('Copied to clipboard');
                  }}
                >
                  Copy
                </Button>
              </div>
              <div className="rounded-md bg-muted p-4 max-h-96 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {validationResult.rawResponseBody}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !validationResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>No validation result available yet.</p>
              <p className="text-sm mt-2">Click "Fetch FIAT Data" to retrieve data from VPS1.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
