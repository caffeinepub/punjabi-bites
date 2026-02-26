import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MenuItem, MenuItemId, Category, UpiSettings } from '../backend';

// ─── Menu Items ───────────────────────────────────────────────────────────────

export function useGetMenuItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItems();
    },
    enabled: !!actor,
  });
}

export function useGetAllMenuItems() {
  const { actor } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['allMenuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItems();
    },
    enabled: !!actor,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      category,
      imageUrl,
    }: {
      name: string;
      description: string;
      price: number;
      category: Category;
      imageUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(name, description, price, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['allMenuItems'] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      price,
      category,
      imageUrl,
    }: {
      id: MenuItemId;
      name: string;
      description: string;
      price: number;
      category: Category;
      imageUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMenuItem(id, name, description, price, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['allMenuItems'] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: MenuItemId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMenuItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['allMenuItems'] });
    },
  });
}

export function useToggleAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: MenuItemId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleAvailability(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['allMenuItems'] });
    },
  });
}

// ─── Admin / Auth ─────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── UPI Settings ─────────────────────────────────────────────────────────────

export function useGetUpiSettings() {
  const { actor } = useActor();

  return useQuery<UpiSettings | null>({
    queryKey: ['upiSettings'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUpiSettings();
    },
    enabled: !!actor,
  });
}

// Alias for backward compatibility
export const useUPISettings = useGetUpiSettings;

export function useUpdateUpiSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UpiSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUpiSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiSettings'] });
    },
  });
}

// Alias for backward compatibility
export const useUpdateUPISettings = useUpdateUpiSettings;

// Legacy alias for payment QR code (uses UPI settings qrCodeData)
export function useGetPaymentQRCode() {
  const { actor } = useActor();

  return useQuery<string | null>({
    queryKey: ['paymentQRCode'],
    queryFn: async () => {
      if (!actor) return null;
      const settings = await actor.getUpiSettings();
      return settings?.qrCodeData ?? null;
    },
    enabled: !!actor,
  });
}
