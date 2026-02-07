import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CommoditiesVPS1ValidationResult, Asset } from '@/backend';
import { parseCommodities } from '@/utils/commoditiesParser';
import { MarketType } from '@/types';

export function useFetchCommoditiesVPS1Data() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchCommoditiesVPS1Data();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commoditiesVPS1ValidationResult'] });
      queryClient.invalidateQueries({ queryKey: ['commoditiesVPS1Assets'] });
    },
  });
}

export function useGetCommoditiesVPS1ValidationResult() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CommoditiesVPS1ValidationResult | null>({
    queryKey: ['commoditiesVPS1ValidationResult'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCommoditiesVPS1ValidationResult();
    },
    enabled: !!actor && !actorFetching,
  });
}

/**
 * Hook that fetches, parses, and caches Commodities assets from the VPS1 HTTPS endpoint.
 * The backend controls the requested URL; the frontend only triggers fetch and parses validation/rawResponseBody.
 * Automatically triggers fetch when enabled and provides loading/error states.
 */
export function useCommoditiesVPS1Assets(enabled: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['commoditiesVPS1Assets'],
    queryFn: async (): Promise<{
      assets: Asset[];
      validationStatus: 'valid' | 'invalid' | 'pending';
      error?: string;
    }> => {
      if (!actor) throw new Error('Actor not available');

      // First, check if we have cached validation result
      const cachedResult = await actor.getCommoditiesVPS1ValidationResult();

      // If no cached result or invalid, trigger a fresh fetch
      if (!cachedResult || cachedResult.validationStatus === 'invalid') {
        try {
          await actor.fetchCommoditiesVPS1Data();
          // Get the fresh result
          const freshResult = await actor.getCommoditiesVPS1ValidationResult();
          
          if (!freshResult) {
            return {
              assets: [],
              validationStatus: 'invalid',
              error: 'Failed to fetch commodities data',
            };
          }

          if (freshResult.validationStatus === 'invalid') {
            return {
              assets: [],
              validationStatus: 'invalid',
              error: freshResult.errorMessage || 'Invalid commodities data received',
            };
          }

          // Parse the response
          const parseResult = parseCommodities(freshResult.rawResponseBody);
          
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
            error: `Failed to fetch commodities data: ${message}`,
          };
        }
      }

      // Use cached valid result
      if (cachedResult.validationStatus === 'valid') {
        const parseResult = parseCommodities(cachedResult.rawResponseBody);
        return {
          assets: parseResult.assets,
          validationStatus: 'valid',
          error: parseResult.error,
        };
      }

      return {
        assets: [],
        validationStatus: 'pending',
        error: 'Waiting for commodities data',
      };
    },
    enabled: !!actor && !actorFetching && enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['commoditiesVPS1ValidationResult'] });
    queryClient.invalidateQueries({ queryKey: ['commoditiesVPS1Assets'] });
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
