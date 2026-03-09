import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateResumeItemRequest, UpdateResumeItemRequest } from "@shared/schema";

export function useResumeItems() {
  return useQuery({
    queryKey: [api.resume.list.path],
    queryFn: async () => {
      const res = await fetch(api.resume.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resume items");
      return api.resume.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateResumeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateResumeItemRequest) => {
      const res = await fetch(api.resume.create.path, {
        method: api.resume.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create resume item");
      return api.resume.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resume.list.path] }),
  });
}

export function useUpdateResumeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateResumeItemRequest }) => {
      const url = buildUrl(api.resume.update.path, { id });
      const res = await fetch(url, {
        method: api.resume.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update resume item");
      return api.resume.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resume.list.path] }),
  });
}

export function useDeleteResumeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.resume.delete.path, { id });
      const res = await fetch(url, { method: api.resume.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete resume item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resume.list.path] }),
  });
}
