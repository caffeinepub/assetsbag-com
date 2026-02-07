import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { StocksVPS1RawValidationResult } from '@/backend';
import { parseStocksWorker0 } from '@/utils/stocksWorker0Parser';
import type { Asset } from '@/types';

/**
 * Hook that fetches and parses stocks from Worker0 endpoint only (api.assetsbag.com/stocks.json).
 * Single-request fetch without chunking, merging, or sorting by marketCap.
 * Automatically triggers fetch when enabled and provides loading/error states.
 */
export function useStocksWorker0Assets(enabled: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['stocksWorker0Assets'],
    queryFn: async (): Promise<{
      assets: Asset[];
      validationStatus: 'valid' | 'invalid' | 'pending';
      error?: string;
    }> => {
      if (!actor || !identity) throw new Error('Actor or identity not available');

      try {
        // Fetch Worker0 stocks data (endpoint 1 = api.assetsbag.com)
        await actor.fetchStocksVPS1Raw(BigInt(1));

        // Get validation result
        const validationResult = await actor.getStocksVPS1RawValidationResult();

        if (!validationResult) {
          return {
            assets: [],
            validationStatus: 'invalid',
            error: 'Failed to fetch stocks data: No validation result available',
          };
        }

        if (validationResult.validationStatus === 'invalid') {
          return {
            assets: [],
            validationStatus: 'invalid',
            error: `Failed to fetch stocks data: ${validationResult.errorMessage || 'Unknown error'}`,
          };
        }

        if (!validationResult.rawResponseBody) {
          return {
            assets: [],
            validationStatus: 'invalid',
            error: 'Failed to fetch stocks data: Empty response body',
          };
        }

        // Parse the response
        const parseResult = parseStocksWorker0(validationResult.rawResponseBody);

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
    queryClient.invalidateQueries({ queryKey: ['stocksWorker0Assets'] });
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
 * Hook to get Worker0 stocks validation result for debugging/inspection
 */
export function useGetStocksWorker0ValidationResult() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StocksVPS1RawValidationResult | null>({
    queryKey: ['stocksWorker0ValidationResult'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStocksVPS1RawValidationResult();
    },
    enabled: !!actor && !actorFetching,
  });
}
