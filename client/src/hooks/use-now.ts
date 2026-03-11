import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type NowItemInput, type NowItemUpdateInput } from "@shared/routes";

export function useNowItems() {
  return useQuery({
    queryKey: [api.now.list.path],
    queryFn: async () => {
      const res = await fetch(api.now.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch now items");
      return api.now.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateNowItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: NowItemInput) => {
      const res = await fetch(api.now.create.path, {
        method: api.now.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create now item");
      return api.now.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.now.list.path] }),
  });
}

export function useUpdateNowItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NowItemUpdateInput }) => {
      const url = buildUrl(api.now.update.path, { id });
      const res = await fetch(url, {
        method: api.now.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update now item");
      return api.now.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.now.list.path] }),
  });
}

export function useDeleteNowItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.now.delete.path, { id });
      const res = await fetch(url, { method: api.now.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete now item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.now.list.path] }),
  });
}
