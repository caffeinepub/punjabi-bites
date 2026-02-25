import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { MenuItem, Category, UpiSettings } from '../backend';

// ─── Queries ────────────────────────────────────────────────────────────────

export function useGetMenuItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItems();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    staleTime: 10_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? 'anonymous';

  return useQuery<boolean>({
    queryKey: ['isAdmin', principalKey],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useUPISettings() {
  const { actor, isFetching } = useActor();

  return useQuery<UpiSettings | null>({
    queryKey: ['upiSettings'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUpiSettings();
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    staleTime: 15_000,
    gcTime: 60_000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

interface AddMenuItemParams {
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string | null;
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddMenuItemParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(
        params.name,
        params.description,
        params.price,
        params.category,
        params.imageUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

interface UpdateMenuItemParams {
  id: bigint;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string | null;
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateMenuItemParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMenuItem(
        params.id,
        params.name,
        params.description,
        params.price,
        params.category,
        params.imageUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMenuItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useToggleAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleAvailability(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useUpdateUPISettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: UpiSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUpiSettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiSettings'] });
    },
  });
}
