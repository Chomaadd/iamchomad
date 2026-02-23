import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type BrandItemInput, type BrandItemUpdateInput } from "@shared/routes";

export function useBrandItems() {
  return useQuery({
    queryKey: [api.brand.list.path],
    queryFn: async () => {
      const res = await fetch(api.brand.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch brand items");
      return api.brand.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBrandItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BrandItemInput) => {
      const res = await fetch(api.brand.create.path, {
        method: api.brand.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create brand item");
      return api.brand.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brand.list.path] }),
  });
}

export function useUpdateBrandItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BrandItemUpdateInput }) => {
      const url = buildUrl(api.brand.update.path, { id });
      const res = await fetch(url, {
        method: api.brand.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update brand item");
      return api.brand.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brand.list.path] }),
  });
}

export function useDeleteBrandItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.brand.delete.path, { id });
      const res = await fetch(url, { method: api.brand.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete brand item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brand.list.path] }),
  });
}
