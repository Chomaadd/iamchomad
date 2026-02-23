import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type BlogPostInput, type BlogPostUpdateInput } from "@shared/routes";

export function usePosts(publishedOnly = false) {
  return useQuery({
    queryKey: [api.blog.list.path, publishedOnly],
    queryFn: async () => {
      const url = publishedOnly ? `${api.blog.list.path}?published=true` : api.blog.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.blog.list.responses[200].parse(await res.json());
    },
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: [api.blog.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.blog.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      return api.blog.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BlogPostInput) => {
      const res = await fetch(api.blog.create.path, {
        method: api.blog.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create post");
      return api.blog.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.blog.list.path] }),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BlogPostUpdateInput }) => {
      const url = buildUrl(api.blog.update.path, { id });
      const res = await fetch(url, {
        method: api.blog.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update post");
      return api.blog.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.blog.list.path] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.blog.delete.path, { id });
      const res = await fetch(url, {
        method: api.blog.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.blog.list.path] }),
  });
}
