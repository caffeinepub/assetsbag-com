import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Holding } from '@/types';

export function useAddHolding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (holding: Holding) => {
      if (!actor) throw new Error('Actor not available');
      
      // TODO: Replace with actual backend call once addHolding is implemented
      // return actor.addHolding(holding);
      
      // Temporary mock: simulate success until backend method is available
      console.warn('addHolding backend method not yet implemented, simulating success');
      console.log('Would add holding:', holding);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
