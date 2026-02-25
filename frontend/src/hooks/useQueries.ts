import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { MenuItem, Category } from '../backend';

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
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  // Include the principal in the query key so the query re-runs when the user logs in/out
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
    staleTime: 0, // Always re-check on mount/focus
  });
}

export function useGetPaymentQRCode() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['paymentQRCode'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPaymentQRCode();
    },
    enabled: !!actor && !isFetching,
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

export function useSetPaymentQRCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPaymentQRCode(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentQRCode'] });
    },
  });
}
