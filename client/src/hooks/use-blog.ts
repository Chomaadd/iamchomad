import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type BlogPostInput, type BlogPostUpdateInput } from "@shared/routes";

export function usePosts() {
  return useQuery({
    queryKey: [api.blog.list.path],
    queryFn: async () => {
      const res = await fetch(api.blog.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.blog.list.responses[200].parse(await res.json());
    },
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: [api.blog.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.blog.get.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      const data = await res.json();
      return api.blog.get.responses[200].parse(data);
    },
    enabled: !!slug && slug !== "undefined",
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
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<BlogPostUpdateInput>) => {
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