import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Portfolio } from '@/backend';

export function useGetPortfolio() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPortfolio();
    },
    enabled: !!actor && !actorFetching,
  });
}
