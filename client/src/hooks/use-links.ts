import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type LinkItemInput, type LinkItemUpdateInput } from "@shared/routes";

export function useLinkItems() {
  return useQuery({
    queryKey: [api.links.list.path],
    queryFn: async () => {
      const res = await fetch(api.links.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch link items");
      return api.links.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLinkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LinkItemInput) => {
      const res = await fetch(api.links.create.path, {
        method: api.links.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create link item");
      return api.links.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.links.list.path] }),
  });
}

export function useUpdateLinkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LinkItemUpdateInput }) => {
      const url = buildUrl(api.links.update.path, { id });
      const res = await fetch(url, {
        method: api.links.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update link item");
      return api.links.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.links.list.path] }),
  });
}

export function useDeleteLinkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.links.delete.path, { id });
      const res = await fetch(url, { method: api.links.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete link item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.links.list.path] }),
  });
}
