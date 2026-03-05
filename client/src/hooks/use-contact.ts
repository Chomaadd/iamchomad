import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ContactMessageInput } from "@shared/routes";

export function useContactMessages() {
  return useQuery({
    queryKey: [api.contact.list.path],
    queryFn: async () => {
      const res = await fetch(api.contact.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.contact.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateContactMessage() {
  return useMutation({
    mutationFn: async (data: ContactMessageInput) => {
      const res = await fetch(api.contact.create.path, {
        method: api.contact.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.contact.create.responses[201].parse(await res.json());
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.contact.markRead.path, { id });
      const res = await fetch(url, { method: api.contact.markRead.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to update message");
      return api.contact.markRead.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.contact.list.path] }),
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.contact.delete.path, { id });
      const res = await fetch(url, { method: api.contact.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.contact.list.path] }),
  });
}
