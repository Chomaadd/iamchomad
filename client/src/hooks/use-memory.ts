import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type MemoryItemInput, type MemoryItemUpdateInput } from "@shared/routes";

export function useMemoryItems() {
  return useQuery({
    queryKey: [api.memory.list.path],
    queryFn: async () => {
      const res = await fetch(api.memory.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch memory items");
      return api.memory.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMemoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MemoryItemInput) => {
      const res = await fetch(api.memory.create.path, {
        method: api.memory.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create memory item");
      return api.memory.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.memory.list.path] }),
  });
}

export function useUpdateMemoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MemoryItemUpdateInput }) => {
      const url = buildUrl(api.memory.update.path, { id });
      const res = await fetch(url, {
        method: api.memory.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update memory item");
      return api.memory.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.memory.list.path] }),
  });
}

export function useDeleteMemoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.memory.delete.path, { id });
      const res = await fetch(url, { method: api.memory.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete memory item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.memory.list.path] }),
  });
}
