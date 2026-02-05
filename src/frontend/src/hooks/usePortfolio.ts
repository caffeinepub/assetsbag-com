import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Portfolio } from '@/types';

export function useGetPortfolio() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // TODO: Replace with actual backend call once getPortfolio is implemented
      // return actor.getPortfolio();
      
      // Temporary mock: return empty portfolio until backend method is available
      console.warn('getPortfolio backend method not yet implemented, returning empty portfolio');
      return { holdings: [] };
    },
    enabled: !!actor && !actorFetching,
  });
}
