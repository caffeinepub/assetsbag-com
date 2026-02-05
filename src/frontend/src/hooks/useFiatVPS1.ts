import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FiatVPS1ValidationResult, Asset } from '@/backend';
import { parseFiatFxRates } from '@/utils/fiatFxRatesParser';
import { MarketType } from '@/types';

export function useFetchFiatVPS1Data() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchFiatVPS1Data();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiatVPS1ValidationResult'] });
      queryClient.invalidateQueries({ queryKey: ['fiatVPS1Assets'] });
    },
  });
}

export function useGetFiatVPS1ValidationResult() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FiatVPS1ValidationResult | null>({
    queryKey: ['fiatVPS1ValidationResult'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getFiatVPS1ValidationResult();
    },
    enabled: !!actor && !actorFetching,
  });
}

/**
 * Hook that fetches, parses, and caches FIAT assets from VPS1 endpoint
 * Automatically triggers fetch when enabled and provides loading/error states
 */
export function useFiatVPS1Assets(enabled: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['fiatVPS1Assets'],
    queryFn: async (): Promise<{
      assets: Asset[];
      validationStatus: 'valid' | 'invalid' | 'pending';
      error?: string;
    }> => {
      if (!actor) throw new Error('Actor not available');

      // First, check if we have cached validation result
      const cachedResult = await actor.getFiatVPS1ValidationResult();

      // If no cached result or invalid, trigger a fresh fetch
      if (!cachedResult || cachedResult.validationStatus === 'invalid') {
        try {
          await actor.fetchFiatVPS1Data();
          // Get the fresh result
          const freshResult = await actor.getFiatVPS1ValidationResult();
          
          if (!freshResult) {
            return {
              assets: [],
              validationStatus: 'invalid',
              error: 'Failed to fetch FIAT data',
            };
          }

          if (freshResult.validationStatus === 'invalid') {
            return {
              assets: [],
              validationStatus: 'invalid',
              error: freshResult.errorMessage || 'Invalid FIAT data received',
            };
          }

          // Parse the response
          const parseResult = parseFiatFxRates(freshResult.rawResponseBody);
          
          return {
            assets: parseResult.assets,
            validationStatus: 'valid',
            error: parseResult.error,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return {
            assets: [],
            validationStatus: 'invalid',
            error: `Failed to fetch FIAT data: ${message}`,
          };
        }
      }

      // Use cached valid result
      if (cachedResult.validationStatus === 'valid') {
        const parseResult = parseFiatFxRates(cachedResult.rawResponseBody);
        return {
          assets: parseResult.assets,
          validationStatus: 'valid',
          error: parseResult.error,
        };
      }

      return {
        assets: [],
        validationStatus: 'pending',
        error: 'Waiting for FIAT data',
      };
    },
    enabled: !!actor && !actorFetching && enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['fiatVPS1ValidationResult'] });
    queryClient.invalidateQueries({ queryKey: ['fiatVPS1Assets'] });
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
