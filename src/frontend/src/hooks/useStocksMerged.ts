import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { StocksVPS1ValidationResult } from '@/backend';
import { parseStocks } from '@/utils/stocksParser';
import type { Asset } from '@/types';

// Local Stock type matching backend's internal Stock structure
type Stock = {
  ticker: string;
  name: string;
  lastPrice: number;
  marketCap: bigint;
  logoUrl: string;
  validationStatus: 'valid' | 'invalid';
  errorMessage: string | null;
};

/**
 * LEGACY: Hook that fetches, parses, and caches merged stocks from all 4 VPS endpoints using 16-chunk splitting.
 * This hook is marked as legacy and should not be used by AssetSearch going forward.
 * Use useStocksWorker0Assets instead for the new Worker0-only fetch flow.
 * 
 * Calls 64 separate backend update methods (4 endpoints × 16 chunks) to avoid IC0522 instruction limit.
 * Automatically triggers fetch when enabled and provides loading/error states.
 */
export function useStocksMergedAssets(enabled: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['stocksMergedAssets'],
    queryFn: async (): Promise<{
      assets: Asset[];
      validationStatus: 'valid' | 'invalid' | 'pending';
      error?: string;
    }> => {
      if (!actor || !identity) throw new Error('Actor or identity not available');

      try {
        // Call all 64 chunk fetch methods (4 endpoints × 16 chunks)
        // Endpoint numbers: 1, 2, 3, 4
        // Chunk indices: 1, 2, 3, ..., 16
        for (let endpointNumber = 1; endpointNumber <= 4; endpointNumber++) {
          for (let chunkIndex = 1; chunkIndex <= 16; chunkIndex++) {
            await actor.fetchStocksVPS1Chunk(BigInt(endpointNumber), BigInt(chunkIndex));
          }
        }

        // Get validation results for all chunks
        const validationResults = await actor.getAllStocksValidationResults();

        if (!validationResults || validationResults.length === 0) {
          return {
            assets: [],
            validationStatus: 'invalid',
            error: 'Failed to fetch stocks data: No validation results available',
          };
        }

        // Parse and merge stocks from all chunks
        const allStocks = new Map<string, Stock>();
        const errors: string[] = [];

        for (const [url, result] of validationResults) {
          if (result.validationStatus === 'invalid') {
            errors.push(`${url}: ${result.errorMessage || 'Unknown error'}`);
            continue;
          }

          if (!result.rawResponseBody) {
            errors.push(`${url}: Empty response body`);
            continue;
          }

          try {
            const parsed = JSON.parse(result.rawResponseBody);
            
            // Handle different possible JSON structures
            let stocksArray: any[] = [];
            if (Array.isArray(parsed)) {
              stocksArray = parsed;
            } else if (parsed.stocks && Array.isArray(parsed.stocks)) {
              stocksArray = parsed.stocks;
            } else if (parsed.data && Array.isArray(parsed.data)) {
              stocksArray = parsed.data;
            }

            // Merge stocks into the map
            for (const stockItem of stocksArray) {
              if (!stockItem || typeof stockItem !== 'object') continue;
              
              const ticker = stockItem.ticker || stockItem.symbol || '';
              if (!ticker) continue;

              const stock: Stock = {
                ticker,
                name: stockItem.name || ticker,
                lastPrice: Number(stockItem.lastPrice || stockItem.price || 0),
                marketCap: BigInt(stockItem.marketCap || stockItem.market_cap || 0),
                logoUrl: stockItem.logoUrl || stockItem.logo || '',
                validationStatus: 'valid',
                errorMessage: null,
              };

              // Keep the stock with the highest market cap if duplicate ticker
              const existing = allStocks.get(ticker);
              if (!existing || stock.marketCap > existing.marketCap) {
                allStocks.set(ticker, stock);
              }
            }
          } catch (parseError) {
            const message = parseError instanceof Error ? parseError.message : 'Parse error';
            errors.push(`${url}: ${message}`);
          }
        }

        if (allStocks.size === 0) {
          const errorMessage = errors.length > 0 
            ? `Failed to fetch stocks data: ${errors.join('; ')}`
            : 'Failed to fetch stocks data: No valid stocks found';
          
          return {
            assets: [],
            validationStatus: 'invalid',
            error: errorMessage,
          };
        }

        // Convert map to array format expected by parser
        const stocksArray: Array<[string, Stock]> = Array.from(allStocks.entries());

        // Parse using existing parser (handles validation, no sorting)
        const parseResult = parseStocks(stocksArray);

        if (parseResult.error && parseResult.assets.length === 0) {
          return {
            assets: [],
            validationStatus: 'invalid',
            error: `Failed to fetch stocks data: ${parseResult.error}`,
          };
        }

        return {
          assets: parseResult.assets,
          validationStatus: parseResult.assets.length > 0 ? 'valid' : 'invalid',
          error: parseResult.error,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          assets: [],
          validationStatus: 'invalid',
          error: `Failed to fetch stocks data: ${message}`,
        };
      }
    },
    enabled: !!actor && !actorFetching && !!identity && enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['stocksMergedAssets'] });
    return query.refetch();
  };

  return {
    assets: query.data?.assets || [],
    validationStatus: query.data?.validationStatus || 'pending',
    error: query.data?.error,
    isLoading: query.isLoading || actorFetching,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch,
  };
}

/**
 * Hook to get stocks validation results for debugging/inspection
 */
export function useGetStocksValidationResults() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, StocksVPS1ValidationResult]>>({
    queryKey: ['stocksValidationResults'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllStocksValidationResults();
    },
    enabled: !!actor && !actorFetching,
  });
}
